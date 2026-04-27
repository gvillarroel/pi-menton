#!/usr/bin/env zx

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";
import { fileURLToPath } from "node:url";
import { renderPromptFile } from "../../spike/prompt-layout-zx/prompt-loader.mjs";

const here = fileURLToPath(new URL(".", import.meta.url));
const scriptName = "prompt-layout-example";
const runId = new Date().toISOString().replace(/[:.]/g, "-");
const runDir = join(process.cwd(), "artifacts", scriptName, runId);
const promptsDir = join(here, "prompts");
const sampleInput = join(here, "assets", "sample-input.md");

await mkdir(runDir, { recursive: true });

const systemPrompt = await renderPromptFile(promptsDir, "pi-system.md", {
  tools_list: "Node.js, filesystem reads, and standard shell tools available in the active environment",
});

const taskPrompt = await renderPromptFile(promptsDir, "summarize-findings.md", {
  file_path: sampleInput,
  goal: "Explain the sample input in a way that proves prompt loading and artifact logging work.",
});

const inputText = await readFile(sampleInput, "utf8");
const summary = [
  `- file: ${basename(sampleInput)}`,
  `- bytes: ${Buffer.byteLength(inputText, "utf8")}`,
  "- verification: prompt files rendered and this run wrote an artifact manifest",
].join("\n");

await writeFile(join(runDir, "system-prompt.md"), systemPrompt);
await writeFile(join(runDir, "task-prompt.md"), taskPrompt);
await writeFile(join(runDir, "summary.md"), summary);
await writeFile(join(runDir, "manifest.json"), JSON.stringify({
  scriptName,
  runId,
  prompts: ["prompts/pi-system.md", "prompts/summarize-findings.md"],
  input: "assets/sample-input.md",
  outputs: ["system-prompt.md", "task-prompt.md", "summary.md"],
}, null, 2));

console.log(`Wrote run artifacts to ${runDir}`);
console.log(summary);
