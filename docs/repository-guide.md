# Pi Menton: repository guide

Inspectable runbooks that combine Pi and ZX to help constrained models complete practical tasks in small, explicit stages. Prompts live beside their scripts as separate Markdown files, with repeatable validation and clear run artifacts.

## Layout

| Path | Responsibility |
| --- | --- |
| `menton/` | Runnable examples with main.mjs, prompts, and stable assets. |
| `spike/` | Isolated experiments whose lessons can be promoted. |
| `skills/pi-mentor/` | Reusable prompting and execution guidance. |
| `tools/` | Doctor, prompt validator, and scaffolding tools. |
| `.specs/` | Issues and architecture decisions. |
| `docs/` | Runbook usage, prompt conventions, and maintenance. |

## Documentation policy

- Keep the root `README.md` focused on purpose, critical constraints, and the first useful action. Put detailed procedures in `docs/`.
- Maintain `docs/README.md` as the navigation index whenever a guide is added or moved.
- Preserve existing specification, ADR, skill-contract, and evidence locations. Link to their owners instead of copying authoritative content.
- Keep implementation, configuration, source data, and generated output separate. Do not create empty folder hierarchies without a concrete need.
- Use portable relative links. Update both outgoing links and inbound references when moving a document.
- Document prerequisites, commands, expected outcomes, and limitations. Never describe an unrun check as verified.

## Change workflow

1. Read `AGENTS.md`, this index, and the relevant source contract.
2. Inspect `git status` and preserve pre-existing changes and staged files.
3. Make a focused change and update affected documentation in the same change.
4. Run the applicable checks below, inspect the diff, and record any unavailable prerequisite.
5. Stage explicit paths. Publish only when authorized; do not force-push or merge unrelated work.

## Validation

```sh
npm test
npm run validate:prompts
npm run doctor
```

The doctor reports optional tool availability without network calls. Validate prompt placeholders before invoking Pi.

## Data and operating boundaries

Store volatile run outputs under ignored `artifacts/<script-name>/<run-id>/`. Keep prompts separate, scripts linear, and model calls explicit. Do not place private inputs or authentication values into stable examples.

[Back to the documentation index](README.md).
