# LM Context Generator

This script walks a file tree from a given root directory, filters out unwanted files using custom ignore rules, and generates a text file that can be used as context for your favorite language model. It extracts file contents, annotates them with metadata, and estimates token usage to ensure that the language model’s token limit is respected.

## Features
- Walks the directory tree starting from a given root or from the current working directory if none provided
- Uses a `.lm_ignore` (or `.gitignore` as a fallback) to filter out unwanted files if one is provided at the script's entry point
- Will always skip hidden files and folders (i.e., those starting with a dot).
- Will always skip binary files but include the metadata (file size, last modified) for them.
- Extracts the contents of text files and includes them with metadata (file path, last modified date).
- Estimates the number of tokens that will be used by the language model and avoids exceeding the token limit (default 64,000 tokens).
- Outputs a single `.txt` file that can be provided to the language model for context wherever this script is run from


## Running the script
*disclosure:  I have only tested this on `osx`.  Let me know if you find any 🐞

You can simply run this now using `npx` by running the following in your terminal
```sh
npx lm_context --root path/to/your/directory --output output.txt
```


---

## Script Options:
--root (string): The root directory to start walking from. Defaults to the current working directory if not provided.
--output (string): The path to save the generated output file. Defaults to output.lm.txt.
--max-tokens (number): The max token limit to respect when generating the output (default is 64,000).

Example:
```sh
npx lm_context --root ~/projects/my-vibe-coded-terribleness --output context.txt --max-tokens 64000
```
This will walk the directory tree of your project, filter out unwanted files, estimate token usage, and generate a context file that is ready for input into a language model.  
