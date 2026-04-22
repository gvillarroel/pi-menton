#!/usr/bin/env zx

import { basename, join } from "node:path";
import { fileURLToPath } from "node:url";
import { renderPromptFile } from "./prompt-loader.mjs";

$.shell = "cmd.exe";
$.quote = quote;

const here = fileURLToPath(new URL(".", import.meta.url));
const promptsDir = join(here, "prompts");
const listFilesScript = "C:/Users/villa/dev/pi-menton/spike/prompt-layout-zx/scripts/list-files.ps1";
const runPiScript = "C:/Users/villa/dev/pi-menton/spike/prompt-layout-zx/scripts/run-pi.ps1";
const piModel = "github-copilot/gpt-5-mini";
const piThinking = "minimal";
const piTimeoutSeconds = "20";
const files = (
  await $`powershell.exe -NoProfile -File ${listFilesScript}`
).stdout
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean)
  .slice(0, 2);

const systemPrompt = await renderPromptFile(promptsDir, "pi-system.md", {
  tools_list: "PowerShell, gh, fd, rg when available, and standard shell tools",
});

console.log(`== Spike: prompt injection layout for ZX + Pi ==

System prompt source: prompts/pi-system.md
Task prompt source: prompts/summarize-findings.md
PI launcher: powershell.exe -NoProfile -File
Parallel calls: ${files.length}
PI timeout: ${piTimeoutSeconds}s
`);

const summaries = await Promise.all(
  files.map(async (filePath) => {
    const taskPrompt = await renderPromptFile(
      promptsDir,
      "summarize-findings.md",
      {
        file_path: filePath,
        goal: "Explain the file in terms of terminal interactions, loops, and logical stages in at most three short bullets.",
      },
    );

    const taskPromptBase64 = Buffer.from(taskPrompt, "utf8").toString("base64");
    const systemPromptBase64 = Buffer.from(systemPrompt, "utf8").toString("base64");
    const commandPreview = `powershell.exe -NoProfile -File ${JSON.stringify(runPiScript)} ${JSON.stringify(taskPromptBase64)} ${JSON.stringify(systemPromptBase64)} ${JSON.stringify(piModel)} ${JSON.stringify(piThinking)} ${JSON.stringify(piTimeoutSeconds)}`;

    console.log(`[start] ${basename(filePath)}`);

    const output =
      await $({ nothrow: true })`powershell.exe -NoProfile -File ${runPiScript} ${taskPromptBase64} ${systemPromptBase64} ${piModel} ${piThinking} ${piTimeoutSeconds}`;

    console.log(output.ok ? `[done] ${basename(filePath)}` : `[error] ${basename(filePath)}`);

    return {
      filePath,
      system: systemPrompt.split("\n")[0],
      prompt: taskPrompt.split("\n")[0],
      command: commandPreview,
      ok: output.ok,
      exitCode: output.exitCode,
      result: output.ok
        ? output.stdout.trim()
        : output.stderr.trim() || output.stdout.trim() || output.message,
    };
  }),
);

for (const summary of summaries) {
  console.log(`--- ${summary.filePath} ---
system: ${summary.system}
prompt: ${summary.prompt}
command: ${summary.command}
ok: ${summary.ok}
exitCode: ${summary.exitCode}

result:
${summary.result}
`);
}
