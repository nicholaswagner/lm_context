# LM Context Generator

`lm_context` packages a directory or file into a single, LLM-friendly text snapshot so you can ask high-level questions about it

## Quickstart
```sh

# your secrets are safe, this script will not process dotfiles 
cd ~/path/to/my/project

npx lm_context . 
# generates an `output.lm.txt` file at the root of that project directory

```

---

This script walks a file tree from a given root directory, filters out unwanted files using `.gitignore` rules, and generates a text file that can be used as context for your language model of choice. 

It extracts file contents, annotates them with metadata, and estimates token usage to ensure that the language model’s token limit is respected.

> [!NOTE] 
> The _content_ of **binary** files will **always** be skipped when building up the context file, but the metadata **will** be included. (file size, last modified)

### Arguments:

- `--file (string)`: alternatively, you can specify a single file to process
- `--max-tokens (number)`: The max token limit to respect when generating the output. (by default there is no limit)
- `--output (string)`: The path to save the generated output file. Defaults to output.lm.txt.
- `--root (string)`: The root directory to start walking from. Defaults to the current working directory if not provided.

### Filtering

Files are included in the resulting output file using the following rules:

1. **_`dotfiles` are always excluded no exceptions._**
2. if the target directory has a `.gitignore`, the same files excluded from git are also excluded from the output file.
3. **optionally**, you may create a `.lm_ignore` file using the same syntax as a `.gitignore` and files will filtered accordingly.
4. `binary files` content will be excluded from the output, but their filename and some meta-data will be included so the LM knows about them.

### A more complex example:

```sh
# a more explicit example
npx lm_context --root ~/projects/my-vibe-coded-terribleness --output pleaseHalp.txt --max-tokens 64000

```
