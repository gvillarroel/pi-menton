# Prompt Layout Example

## Purpose

This is a production-style version of the prompt-layout spike. It keeps the same readable shape but lives under `menton/`, uses local `prompts/` and `assets/`, and writes a run manifest under `artifacts/`.

The spike remains useful for rough experiments. This folder shows the structure future runbooks should copy when the pattern is ready for reuse.

## Run

```bash
npx zx menton/prompt-layout-example/main.mjs
```

If `zx` is already installed globally, this also works:

```bash
zx menton/prompt-layout-example/main.mjs
```

## Validation

```bash
npm run validate:prompts
node --test
```

The script writes volatile run outputs to `artifacts/prompt-layout-example/<run-id>/`. That folder is intentionally ignored by git.
