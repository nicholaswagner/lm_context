# LM Context Generator

This script walks a file tree from a given root directory, filters out unwanted files using custom ignore rules, and generates a text file that can be used as context for your favorite language model. It extracts file contents, annotates them with metadata, and estimates token usage to ensure that the language model’s token limit is respected.



## Features
- Walks the directory tree starting from a given root or from the current working directory if none provided
- Uses a `.lm_ignore` (or `.gitignore` as a fallback) to filter out unwanted files if one is provided at the script's entry point
- Will always skip hidden files and folders (i.e., those starting with a dot).
- Extracts the contents of text files and includes them with metadata (file path, last modified date).
- Estimates the number of tokens that will be used by the language model and avoids exceeding the token limit (default 64,000 tokens).
- Outputs a single `.txt` file that can be provided to the language model for context wherever this script is run from

> [!NOTE]
> Your LM doesn't need to know about the photos you have of Benedict Cumberbatch _(or does it?)_ to understand that you have a problem with your codebase.  All it needs to know is that you have a few hundred of them in the public/pengwins directory.
> 
> For this reason the _content_ of binary files will **always** be skipped when building up the context file, but the metadata **will** be included. (file size, last modified)


## .lm_ignore

> Thats just a `.gitignore` with extra steps.

Exactly.

The script is using [`ignore`](https://github.com/kaelzhang/node-ignore) under the hood which is a javascript implementation of the .gitignore spec.  If a `.gitignore` is found at the script's target directory, it will be used to filter which files are injected into the LM Context.  However, you may have files that need to be in the REPO that you don't want in your LM Context. _(public/pengwins for example)_. In that case you can just copy your .gitignore file over to a `.lm_ignore` file and add a line for `public/pengwins`.


## TLDR:
Open a terminal, cd to your project directory, (better if you have a `.gitignore` file as that will get used and those files will be ignored from the output), run the following:

```zsh
npx lm_context
# will create an `output.lm.txt` in the current working directory
```


## Running the script
*disclosure:  I have only tested this on `osx`.  Let me know if you find any 🐞

You can simply run this now using `npx` by running the following in your terminal
```sh
npx lm_context --root path/to/your/directory --output output.txt
```


## Script Options:

- `--root (string)`: The root directory to start walking from. Defaults to the current working directory if not provided.

- `--output (string)`: The path to save the generated output file. Defaults to output.lm.txt.

- `--max-tokens (number)`: The max token limit to respect when generating the output (default is 64,000).



## A more complete example:
```sh
npx lm_context --root ~/projects/my-vibe-coded-terribleness --output context.txt --max-tokens 64000
```
This will walk the directory tree of your project, filter out unwanted files, estimate token usage, and generate a context file that is ready for input into a language model.  



## Todo list
- [ ] Add some tests with vitest ... because why not
- [ ] Confirm this works on other OS's
- [ ] Consider including the ability to target a specific file which would generate a `.filename.lm_context.ext`
    - this would include the file metadata and code.
    - you could then either use this as-is, or integrate this into another script which would hand it over to a local LM which would provide an intelligent summary.  These files then could later be used to provide further context to your LM model.
- [ ] Possibly include a few examples for how you could use this script in other ways.
    - have it get triggered as a post git commit hook
    - show how to generate an LM_context for only the changed files in a git PR
    - combine git show SHA and compare it to the current SHA and generate an LM_context to ask how you broke what you broke
    - ~~show how to use git blame so your AI can point the finger at your coworkers for the bugs you released into production~~