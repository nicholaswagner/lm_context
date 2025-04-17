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


