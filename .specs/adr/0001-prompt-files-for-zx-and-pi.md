# ADR 0001: Use Markdown Prompt Files for ZX Scripts

## Status

Accepted

## Context

This project uses ZX scripts with Pi as the coding agent. The primary reader is a human who is comfortable with bash-like scripts, so the main readability concern is keeping script control flow visible while still supporting rich prompts.

Inline prompt strings make the script harder to read because they bury:

- terminal tool usage,
- loops,
- decision points,
- and logical execution stages.

The project also wants to avoid unnecessary software-style abstraction in scripts:

- no object-oriented design by default,
- no forced `main` wrapper when top-level flow is clearer,
- and no large set of helper functions unless repetition is real.

## Decision

Store prompts as Markdown files near the script that uses them and inject them explicitly through a small loader.

Default rules:

- Keep Pi system prompts in separate Markdown files.
- Keep stage prompts in separate Markdown files.
- Use explicit placeholder rendering such as `{{variable_name}}`.
- Keep orchestration logic in the primary script entrypoint.
- Avoid hidden prompt assembly.
- Preserve a simple, linear, bash-like reading experience.
- Avoid classes and unnecessary helper layers around prompt orchestration.

## Consequences

Benefits:

- Better human readability.
- Better diffs.
- Prompt edits stay separate from behavior changes.
- The script remains focused on tools, loops, and logical stages.
- The script can stay simple and procedural even as prompt text grows.

Costs:

- Requires a small loader utility.
- Adds a small amount of file structure.

## Notes

This decision is especially important for scripts that coordinate terminal tools such as `gh`, `fd`, `rg`, and similar commands before or after Pi steps.
