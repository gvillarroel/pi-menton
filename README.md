# pi-menton

Runbooks using Pi + ZX to get real work done with simple, inspectable scripts.

## Prerequisites

- Node.js 20+
- npm / npx
- `zx` for runbook scripts (`npm install` installs the local dev dependency)
- Optional: `pi` CLI for scripts that call a model

Check the current machine before a long run:

```bash
npm run doctor
```

The doctor does not make network calls or require secrets. Missing `zx` or `pi` is reported as a warning because some validation tasks only need Node.

## Install

```bash
npm install
```

## Quickstart: run the prompt-layout spike

The spike documents the first prompt-file layout experiment:

```bash
npx zx spike/prompt-layout-zx/main.mjs
```

Expected behavior:

- lists a small set of files,
- renders `spike/prompt-layout-zx/prompts/pi-system.md`,
- renders `spike/prompt-layout-zx/prompts/summarize-findings.md`,
- calls the configured Pi launcher through the PowerShell helper,
- prints one result block per file.

If `zx`, PowerShell, or `pi` is not available on your machine, run `npm run doctor` and inspect the spike manually instead:

```bash
node --test
npm run validate:prompts
```

## Production runbooks vs spikes

- `spike/` contains experiments. They can be rough and environment-specific, but important lessons should be promoted into specs, ADRs, skills, or `menton/` examples.
- `menton/<script-name>/` contains production-style runbooks with `main.mjs`, `prompts/`, `assets/`, and a script README.

A polished example lives at:

```bash
npx zx menton/prompt-layout-example/main.mjs
```

It does not call Pi. It renders prompts and writes a manifest under `artifacts/prompt-layout-example/<run-id>/` so the artifact convention can be verified locally.

## Prompt file convention

Prompt files use Markdown with minimal optional frontmatter:

```markdown
---
required_variables:
  - file_path
---
Summarize {{file_path}}.
```

Validate prompt placeholders with:

```bash
npm run validate:prompts
```

The checker is intentionally small: every `{{placeholder}}` in a `menton/*/prompts/*.md` file must appear in `required_variables`, and every listed variable must be used.

## Scaffold a new runbook

```bash
npm run scaffold -- repo-summary
```

The scaffolder creates:

```text
menton/repo-summary/
  main.mjs
  prompts/task.md
  assets/
  README.md
```

It validates lowercase kebab-case names and refuses to overwrite an existing folder. For tests or demos, set `PI_MENTON_SCAFFOLD_ROOT` to a temporary directory.

## Artifacts

Run outputs belong under:

```text
artifacts/<script-name>/<run-id>/
```

Use that folder for rendered prompts, raw model output, summaries, manifests, and retry notes. `artifacts/` is ignored by git. Commit stable fixtures under each script's `assets/` folder instead.

## Specs and guidance

- [ADR 0001: Use Markdown Prompt Files for ZX Scripts](.specs/adr/0001-prompt-files-for-zx-and-pi.md)
- [ADR 0002: Use Ignored Run Artifacts and Script Scaffolds](.specs/adr/0002-run-artifacts-and-scaffold.md)
- [ADR index](.specs/adr/README.md)
- [Issue backlog note format](.specs/issues/README.md)
- [pi-mentor skill](skills/pi-mentor/SKILL.md)

## Test

```bash
npm test
npm run validate:prompts
npm run doctor
```
