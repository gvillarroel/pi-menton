# Prompt Layout Spike for ZX + Pi

## Goal

Find the easiest prompt-injection pattern for humans to read while keeping ZX scripts easy to follow.

The priority is not raw flexibility. The priority is script readability:

- The primary reader is a human who is already comfortable with bash-like scripts.
- The script should clearly show which terminal tools are used.
- The script should clearly show loops and logical stages.
- Long prompt text should not drown the control flow.
- Pi system prompts and step prompts should remain easy to inspect and edit.

## Context

This repository will always use:

- ZX for scripting.
- Pi as the coding agent.
- Terminal tools such as `gh`, `fd`, `rg`, and similar system tools when useful.
- Idiomatic ZX command execution with `await $...` when capturing output from tools or assistants.
- The chosen tool must actually exist in the active shell environment.

## Options Considered

### 1. Inline prompt strings inside `main.mjs`

Pros:

- No file loading.
- Very simple runtime model.

Cons:

- Makes the script noisy very quickly.
- Hides loops and tool orchestration inside large string blocks.
- Harder to diff prompt changes separately from control-flow changes.

Conclusion:

- Reject for anything beyond trivial one-liners.

### 2. Prompt modules exporting JS strings

Pros:

- Still typed and structured.
- Easy imports.

Cons:

- Prompt files look like code, not like prompts.
- Extra syntax reduces readability for humans editing prompt text.
- Worse authoring experience for long instructions.

Conclusion:

- Better than inline strings, but still not the easiest format to read.

### 3. Plain Markdown prompt files plus a tiny renderer

Pros:

- Best readability for long prompts.
- Prompts diff cleanly.
- The script stays focused on flow, tool calls, loops, and decisions.
- Easy to compose named prompts with explicit variable injection.

Cons:

- Requires a tiny loader.
- Requires a small templating convention.

Conclusion:

- Best default choice for this project.

## Recommendation

Use this pattern by default:

- Keep prompts in `prompts/*.md`.
- Load them through a tiny renderer with minimal surface area.
- Use ZX as the top-level orchestrator.
- Keep PowerShell-specific logic in small `.ps1` helper files when quoting or Windows process behavior gets awkward.
- Launch PowerShell helpers with `powershell.exe -NoProfile -File ...`.
- Pass long prompt text across the PowerShell boundary encoded, not raw.
- Put a timeout on assistant calls.
- Keep the default demo small because each `pi` invocation has a real startup cost.
- Use a low thinking setting for demo scripts unless the point is deeper reasoning.
- When calls are independent, run them in parallel with `Promise.all(...)`.
- Use explicit `{{variable_name}}` placeholders.
- Keep orchestration in the primary script entrypoint.
- Prefer top-level linear flow when it stays readable.
- Avoid classes and avoid introducing many helper functions.
- Keep prompt composition shallow and obvious.

That gives the script this shape:

1. Discover inputs with terminal tools.
2. Loop through work items.
3. Render a named prompt for the current step.
4. Build the Pi command for the current step.
5. Show the exact command shape.
6. Execute it through a stable launcher path for the current OS.
7. Inspect the result.

## Why This Is the Easiest to Read

The key point is separation of concerns:

- `main.mjs` shows behavior.
- `prompts/*.md` shows language sent to Pi.
- `prompt-loader.mjs` shows only the minimal file-loading and placeholder logic.
- `scripts/*.ps1` isolates Windows-specific launch details when needed.

A human can read the script top-to-bottom and understand:

- which tools are called,
- what each loop does,
- which prompt is used at each stage,
- and where the system prompt enters the execution.

## Injection Rule

Use two prompt layers:

- A stable Pi system prompt in `prompts/pi-system.md`.
- A step-specific prompt per stage, such as `prompts/summarize-findings.md`.

The script should inject both explicitly:

- `system`: rendered from `pi-system.md`
- `prompt`: rendered from a step file

Avoid hidden concatenation or magic prompt assembly.

## ZX Execution Rule

Prefer native ZX process execution for simple commands, but use a helper script when the shell boundary becomes the real problem:

- use `await $`...`` to run a tool and capture its output,
- use `await $({ stdio: "inherit" })`...`` when the command should stream directly,
- keep the command visible in the script,
- avoid custom runner layers unless there is real repeated complexity,
- on Windows, prefer `powershell.exe -NoProfile -File helper.ps1` over stuffing complex PowerShell into one interpolated command.

Example:

```js
#!/usr/bin/env zx

$.shell = "bash.exe";
$.quote = quote;

const files = (await $`find . -type f | head -n 5`).stdout
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);
```

Prefer filtering noisy paths directly in the command:

```js
const files = (await $`find . -type f \
  -not -path './.git/*' \
  -not -path './node_modules/*' \
  -not -path './dist/*' | head -n 5`).stdout
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);
```

Simple assistant call shape:

```js
const reply = await $`pi -p ${taskPrompt} --model github-copilot/gpt-5-mini --system-prompt ${systemPrompt}`;
console.log(reply.stdout);
```

Validated minimal invocation in this environment:

```bash
pi -p "ping" --model github-copilot/gpt-5-mini --no-session --tools read
```

Stable Windows launcher shape used in this spike:

```js
const taskPromptBase64 = Buffer.from(taskPrompt, "utf8").toString("base64");
const systemPromptBase64 = Buffer.from(systemPrompt, "utf8").toString("base64");

const reply = await $({ nothrow: true })`powershell.exe -NoProfile -File ${runPiScript} ${taskPromptBase64} ${systemPromptBase64} ${piModel} ${piThinking} ${piTimeoutSeconds}`;
console.log(reply.stdout.trim());
```

Parallel shape:

```js
const results = await Promise.all(files.map(async (filePath) => {
  const taskPrompt = await renderPromptFile(promptsDir, "summarize-findings.md", { file_path: filePath });
  const taskPromptBase64 = Buffer.from(taskPrompt, "utf8").toString("base64");
  return $({ nothrow: true })`powershell.exe -NoProfile -File ${runPiScript} ${taskPromptBase64} ${systemPromptBase64} ${piModel} ${piThinking} ${piTimeoutSeconds}`;
}));
```

Shell selection rule:

- choose the shell first,
- then choose tools that are really available in that shell,
- do not assume a Windows CLI tool is callable from `bash.exe`,
- keep the command visible in the ZX source.

Performance note:

- `pi` has a noticeable fixed startup cost in non-interactive mode,
- repeated calls in a loop add up quickly,
- use a timeout for each call,
- lower `--thinking` for demos when quality does not require more,
- when each file can be processed independently, use `Promise.all(...)` instead of serial awaits,
- keep the demo loop small unless the point of the spike is throughput.

Windows shell note:

- `pi` runs correctly and quickly from PowerShell in this environment,
- `pi` is not reliable when invoked through `bash.exe` here,
- using PowerShell through ZX with a loaded profile can also pollute stdout and break parsing,
- the stable pattern here was `powershell.exe -NoProfile -File ...`,
- passing long prompt text as raw CLI arguments through multiple shell boundaries is fragile,
- base64-encoding the prompts before crossing into PowerShell avoided argument-splitting bugs,
- do not treat slow `pi` calls under the wrong shell boundary as model latency until shell behavior is ruled out.

## Script Shape Rule

The script should read more like a shell runbook than an application:

- prefer top-level execution,
- prefer visible step ordering,
- avoid object-oriented structure,
- avoid many tiny helpers,
- extract only the awkward or repeated boundaries.

## Files in This Spike

- `main.mjs`: example ZX script with readable top-level orchestration.
- `prompt-loader.mjs`: tiny Markdown prompt renderer.
- `scripts/list-files.ps1`: stable PowerShell file selection helper.
- `scripts/run-pi.ps1`: stable PowerShell launcher for Pi with timeout handling.
- `prompts/pi-system.md`: system prompt example for Pi.
- `prompts/summarize-findings.md`: task prompt example.

## Provisional Rule

Until an ADR replaces it, the default prompt strategy for this repository should be:

- Markdown prompt files
- explicit rendering
- explicit system prompt injection
- minimal templating
- bash-like linear orchestration
- idiomatic ZX `await $...` execution
- PowerShell helper scripts for Windows-specific launch boundaries
