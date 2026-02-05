#!/usr/bin/env -S npx tsx

/**
 * lm_context.ts
 * This script generates a context file for a language model by scanning a directory tree.
 * It reads all files, estimates the number of tokens in each file, and writes the content to an output file.
 * It also handles binary files and ignores certain files based on a .lm_ignore or .gitignore file.
 * The script uses the yargs library for command-line argument parsing and the ignore library for file filtering.
 * The script is designed to be run from the command line and takes the following arguments:
 * --root: The root directory to scan (default is the current working directory)
 * --output: The output file path (default is 'output.lm.txt')
 * --max-tokens: The maximum number of tokens to include in the output file (default is unlimited)
*/

import fs from 'fs';
import path from 'path';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import ignore from 'ignore';
import readline from 'readline';
import { promisify } from 'util';

const lstat = promisify(fs.lstat);
const stat = promisify(fs.stat);
const readdir = promisify(fs.readdir);

interface FileEntry {
    filePath: string;
    modified: Date;
    content: string;
    size: number;
    binary: boolean;
}

function estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
}

function isBinary(buffer: Buffer): boolean {
    for (let i = 0; i < buffer.length; i++) {
        if (buffer[i] === 0) return true;
    }
    return false;
}

async function promptToContinue(): Promise<boolean> {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise(resolve => {
        rl.question('No .lm_ignore or .gitignore found. Type "yes" to continue: ', answer => {
            rl.close();
            resolve(answer.trim().toLowerCase() === 'yes');
        });
    });
}

async function getIgnoreFilter(root: string): Promise<(filePath: string) => boolean> {
    const ignorePath = path.join(root, '.lm_ignore');
    const gitignorePath = path.join(root, '.gitignore');
    let ignoreContent = '';

    if (fs.existsSync(ignorePath)) {
        ignoreContent = fs.readFileSync(ignorePath, 'utf8');
    } else if (fs.existsSync(gitignorePath)) {
        ignoreContent = fs.readFileSync(gitignorePath, 'utf8');
    } else {
        const proceed = await promptToContinue();
        if (!proceed) {
            console.log('Aborting.');
            process.exit(0);
        }
    }

    const ig = ignore().add(ignoreContent);
    return (filePath: string) => !ig.ignores(path.relative(root, filePath));
}

async function walk(dir: string, filter: (filePath: string) => boolean): Promise<FileEntry[]> {
    let results: FileEntry[] = [];
    const entries = await readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
        if (entry.name.startsWith('.')) continue;

        const fullPath = path.join(dir, entry.name);
        const stats = await lstat(fullPath);
        if (stats.isSymbolicLink()) continue;

        if (entry.isDirectory()) {
            results = results.concat(await walk(fullPath, filter));
        } else if (filter(fullPath)) {
            const buffer = fs.readFileSync(fullPath);
            const binary = isBinary(buffer);
            const content = binary ? '' : buffer.toString('utf8');
            results.push({
                filePath: fullPath,
                modified: stats.mtime,
                content,
                size: buffer.length,
                binary
            });
        }
    }

    return results;
}

async function main() {
    const argv = await yargs(hideBin(process.argv))
        .option('root', { type: 'string', describe: 'Root directory to scan' })
        .option('output', { type: 'string', default: 'output.lm.txt', describe: 'Output file path' })
        .option('max-tokens', { type: 'number', default: NaN, describe: 'Max token limit (approximate)' })
        .parse();

    const root = path.resolve(argv.root || process.cwd());
    const outputPath = path.resolve(argv.output);
    const maxTokens = argv['max-tokens'];

    const filter = await getIgnoreFilter(root);
    const files = await walk(root, filter);

    let output = '';
    let totalTokens = 0;

    for (const file of files) {
        if (file.binary) {
            output += `--- Binary File: ${path.relative(root, file.filePath)} (last modified: ${file.modified.toISOString()}, size: ${file.size} bytes) ---\n\n`;
            continue;
        }

        const tokens = estimateTokens(file.content);
        if (maxTokens && totalTokens + tokens > maxTokens) {
            console.warn(`Skipping ${file.filePath} (token limit exceeded)`);
            continue;
        }

        totalTokens += tokens;
        output += `--- File: ${path.relative(root, file.filePath)} (last modified: ${file.modified.toISOString()}) ---\n`;
        output += file.content + '\n\n';
    }

    console.log(`Estimated total tokens: ${totalTokens}`);

    fs.writeFileSync(outputPath, output, 'utf8');
    console.log(`Wrote output to ${outputPath}`);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
