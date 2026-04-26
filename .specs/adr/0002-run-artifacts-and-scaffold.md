# ADR 0002: Use Ignored Run Artifacts and Script Scaffolds

## Status

Accepted

## Context

Runbook scripts often produce rendered prompts, raw model outputs, summaries, retry notes, and final outputs. Without a shared location, agents may either leave volatile files in script folders or fail to preserve useful debugging evidence.

New `menton/` scripts also need a consistent structure: `main.mjs`, `prompts/`, `assets/`, and `README.md`.

## Decision

Use this volatile output convention:

```text
artifacts/<script-name>/<run-id>/
```

Rules:

- `artifacts/` is ignored by git.
- Commit stable fixtures under `menton/<script-name>/assets/`, not under `artifacts/`.
- Production-style examples should write at least a small manifest into each run folder.
- New script folders can be created with `npm run scaffold -- <script-name>`.
- Scaffold names must be lowercase kebab-case and the scaffolder refuses overwrites.

## Consequences

Benefits:

- Agents have a predictable place for intermediate and final run outputs.
- Git stays clean after local validation runs.
- New scripts start from the repository's expected shape.

Costs:

- Scripts need a few lines to create a run folder and manifest.
- The ignored artifact folder must not be used for important committed examples.
