# AGENTS.md

## Core Rules

- Always write in English.
- Prefer simple, explicit, low-friction solutions that work well with less capable models such as GPT-5 mini and Pi.
- Keep code, prompts, assets, specs, and architectural decisions separated and easy to inspect.
- When a new lesson, pattern, or operational rule is discovered, document it immediately in the appropriate place:
  - Use an ADR when the discovery affects architecture, structure, workflow, or a durable technical decision.
  - Use the `pi-mentor` skill when the discovery improves how agents should design, prompt, split, or execute script work.
  - Use both when the insight affects both architecture and agent behavior.

## Project Goal

This project exists to build example scripts that help less capable models complete real work reliably.

The expected approach is practical:

- Break work into small, clear stages.
- Use prompts and workflow loops that help the model process data, divide tasks, and complete outputs predictably.
- Design scripts so the prompt layer is easy to inspect, refine, and replace without cluttering the main implementation.
- Optimize for humans who are already comfortable reading bash-like scripts.

## Primary Reader

- The primary reader of this repository is a human who is used to bash and shell scripting.
- Favor simplicity, linear flow, and visible execution order over software-engineering abstraction.
- Prefer top-to-bottom scripts that read like an operational runbook.
- Avoid object-oriented patterns.
- Avoid introducing many function definitions unless they remove real repetition or isolate a genuinely tricky boundary.
- Do not force a `main` function when top-level linear flow is clearer.
- If a helper is needed, keep it small, obvious, and close to its call sites.

## Repository Structure

Use the following structure unless an ADR explicitly approves a different one:

```text
.specs/
  issues/
  adr/
    *.md
menton/
  <script-name>/
    main.*
    prompts/
    assets/
spike/
skills/
  pi-mentor/
```

## Specs, ADRs, and Issues

- All specs must live under `.specs/`.
- All ADRs must live under `.specs/adr/*.md`.
- All issue documents must live under `.specs/issues/`.
- Specs should describe expected behavior, input/output shape, workflow stages, and validation criteria.
- ADRs should capture why a decision was made, what alternatives were considered, and what rule now applies to the project.
- If a task exposes ambiguity in structure or execution, resolve it with a spec update, an ADR, or both.

## Script Layout

- All script implementations must live under `menton/`.
- Each script gets its own folder: `menton/<script-name>/`.
- Each script folder must contain a primary entrypoint for the script, usually `main.mjs`.
- Each script folder may also contain supporting assets needed by that script.
- Prompts should be stored as separate files, not embedded inline in the script, except for trivial one-off cases justified by simplicity.
- Prompt files should be the default approach to keep scripts clean, reviewable, and easy to iterate on.
- Script-specific assets such as prompt templates, fixtures, sample inputs, or helper resources should stay inside that script folder.
- The entrypoint should read in a simple, mostly linear way for someone familiar with bash.
- Do not over-structure ZX scripts into classes or layers of tiny functions.

## Prompt Management

Prompt handling is a first-class design concern in this repository.

- Prefer separate prompt files over large inline string literals.
- Keep prompts close to the script that uses them.
- Make prompt files easy to diff and easy to refine independently from code.
- Use Markdown prompt files with optional frontmatter for required variables:
  - `required_variables` lists every `{{placeholder}}` the prompt expects.
  - `npm run validate:prompts` checks `menton/*/prompts/*.md` for missing prompt files and placeholder/frontmatter drift.
  - Spikes may use the same convention, but the validator is scoped to production-style `menton/` scripts by default.
- When prompt structure, loading, composition, or templating becomes a recurring pattern, document the chosen approach in an ADR.
- If a prompt-writing or prompt-chaining lesson is broadly reusable, add it to the `pi-mentor` skill.

## Spikes

- Exploratory work must go in `spike/`.
- Spikes are allowed to be rough, but they should still be understandable and isolated.
- If a spike leads to a reusable pattern, promote that learning into `.specs`, an ADR, the `pi-mentor` skill, or the production structure under `menton/`.
- Do not leave important discoveries trapped in a spike.

## Run Artifacts

- Volatile run outputs belong under `artifacts/<script-name>/<run-id>/`.
- Use artifact folders for rendered prompts, raw model outputs, summaries, manifests, and retry notes.
- `artifacts/` is ignored by git; commit stable examples and fixtures under each script's `assets/` folder instead.
- Production-style examples should write at least a small manifest so a future agent can inspect what happened without guessing.

## pi-mentor Skill

- Maintain a skill named `pi-mentor` for accumulated guidance on how to build the best possible scripts for constrained or less capable models.
- Use the skill to record practical lessons about prompting, decomposition, retries, validation loops, chunking, intermediate artifacts, and execution discipline.
- Prefer concrete, reusable guidance over abstract advice.
- When an agent discovers a better way to make scripts robust, add that learning to `pi-mentor`.

## Working Discipline

Agents working in this repository must be deliberate and documentation-aware.

- Before implementing, check whether the work needs a spec, an ADR, or an update to existing documentation.
- Keep architecture decisions explicit.
- Keep experiments isolated.
- Keep reusable knowledge documented.
- Avoid hidden conventions; if a convention matters, write it down.
- When introducing a folder, pattern, or workflow that others are expected to follow, document it in the repo.
- Favor structures and workflows that are easy for future agents to understand without extra context.

## Decision Heuristic

When something useful is discovered, decide documentation targets like this:

- `ADR only`: structural or architectural decision.
- `pi-mentor only`: execution, prompting, decomposition, or scripting lesson.
- `ADR + pi-mentor`: a durable structural decision with operational consequences for how agents should work.

Short examples:

- `ADR only`: deciding that all volatile run outputs live under `artifacts/<script-name>/<run-id>/` and are ignored by git. Record the durable repository convention in `.specs/adr/`.
- `pi-mentor only`: learning that a retry prompt should include the previous error, the exact command, and the expected output shape. Add the reusable execution lesson to `skills/pi-mentor/SKILL.md`.
- `ADR + pi-mentor`: adopting Markdown prompt files with explicit `{{variable}}` placeholders. The file layout belongs in `.specs/adr/`; the practical prompt-writing rule belongs in the skill.

## Expected Quality Bar

- Optimize for clarity over cleverness.
- Make scripts inspectable and easy to modify.
- Design workflows that reduce cognitive load for weaker models.
- Keep the repository organized so agents can extend it without guessing.
- Prefer bash-like readability over abstract elegance.
