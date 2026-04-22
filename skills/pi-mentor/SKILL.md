---
name: pi-mentor
description: Design readable and reliable ZX scripts that use Pi as the coding agent and coordinate terminal tools such as gh, fd, rg, and standard shell commands. Use when Codex needs to structure a new script, refine an existing ZX + Pi workflow, separate prompts from orchestration, improve loop clarity, choose prompt file layouts, or document durable lessons about prompt design and script execution for constrained models.
---

# pi-mentor

## Build scripts so humans can read the control flow first

- Optimize for humans who are already comfortable reading bash and shell scripts.
- Prefer top-level linear flow when it is clear enough.
- Use `main.mjs` only when it improves readability; it is not mandatory.
- Make terminal tool usage, loops, branches, and step order obvious at a glance.
- Move long prompt text out of the script when it starts hiding the execution flow.
- Avoid object-oriented patterns.
- Avoid many small helper functions that fragment the script.
- Introduce a helper only when it removes real repetition or isolates a genuinely awkward boundary such as prompt rendering or a tool wrapper.

## Separate prompts from orchestration by default

- Store prompts in separate Markdown files near the script that uses them.
- Keep one stable Pi system prompt file and separate task prompt files for each major step.
- Render prompt variables explicitly with a minimal placeholder scheme such as `{{name}}`.
- Avoid hidden prompt assembly, deep prompt inheritance, or framework-heavy abstractions unless an ADR requires them.

## Use this workflow when creating or revising a ZX + Pi script

1. Identify the script's logical stages.
2. Identify which steps are terminal-tool steps and which steps are Pi steps.
3. Keep the stage ordering visible in the primary script entrypoint.
4. Extract long system or task instructions into prompt files.
5. Run terminal tools directly with idiomatic ZX such as `await $`...`` when capturing output.
6. Use `await $({ stdio: "inherit" })`...`` when the command should stream directly to the terminal.
7. Keep the script as linear as possible before introducing helpers.
8. Introduce a small helper only for prompt rendering or another clearly repeated awkward boundary.
9. Avoid classes, deep wrappers, or abstraction layers that make the script read less like an executable procedure.
10. Keep each Pi prompt focused on one job.
11. Prefer explicit intermediate artifacts or loop stages over one large ambiguous prompt.
12. Verify that a human can read the script top-to-bottom and quickly answer:
   - which tools run,
   - what the loop iterates over,
   - what Pi is asked to do at each stage,
   - and where outputs are produced or consumed.

## Use ZX in the simple way first

- Prefer visible ZX commands over custom process wrappers.
- Capture tool output with `const result = await $`find . -type f`;` or another command that actually exists in the active shell, then read `result.stdout`.
- Invoke Pi in the same visible style, for example `await $`pi -p ${taskPrompt} --model github-copilot/gpt-5-mini --system-prompt ${systemPrompt}`;`.
- Set `$.shell` and `$.quote` explicitly when the local environment needs that configuration.
- Choose tools that exist in the selected shell environment. If using `bash.exe`, prefer commands available inside that bash environment instead of assuming Windows PATH tools will execute there.
- On Windows, do not assume `pi` is healthy when launched through `bash.exe`; if it is slow or failing, verify the same command directly in PowerShell before blaming the model.
- On Windows, when PowerShell behavior or quoting becomes noisy, prefer a small `powershell.exe -NoProfile -File helper.ps1` boundary over one huge interpolated command.
- When crossing from ZX into PowerShell with large prompt text, encode the prompt payload instead of relying on raw argument quoting.
- Add a wrapper only when a command boundary is truly repeated and the wrapper still improves readability.

## Decide what belongs in each layer

Use the Pi system prompt for stable behavioral rules:

- role,
- operating constraints,
- output discipline,
- and general tool-use expectations.

Use task prompts for step-local work:

- current objective,
- current inputs,
- current output format,
- and step-specific instructions.

Do not bury step-specific details in the system prompt when they belong to the current task only.

## Optimize for weaker-model reliability

- Break work into small, explicit steps.
- Prefer one clear task per prompt.
- Prefer deterministic tool steps before or after Pi when they reduce ambiguity.
- Keep data transformations inspectable.
- Preserve useful intermediate outputs when they help retries, debugging, or auditing.

## Prefer shallow patterns

- Start with a small prompt loader and direct ZX commands.
- Add abstraction only when repetition is real and recurring.
- Prefer obvious file layout over clever indirection.
- Prefer a bash-like script shape over a software-framework shape.
- Reject refactors that replace simple linear flow with classes, custom runner frameworks, or many tiny functions.
- Reject designs that make prompt routing harder to inspect.

## Document what you learn

When a useful lesson is discovered:

- Update the skill if it improves how future agents should design scripts, prompts, loops, or execution patterns.
- Write or update an ADR if the lesson changes repository structure, architecture, or a durable convention.
- Do both when the lesson affects both project structure and agent behavior.

## Output standard for work influenced by this skill

Aim for scripts where a human can inspect:

- the sequence of steps in the primary script entrypoint,
- the terminal tools involved,
- the loop structure,
- the prompt files used at each stage,
- and the boundary between orchestration and prompt content

without reverse-engineering a prompt framework.
