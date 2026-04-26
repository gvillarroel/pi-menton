#!/usr/bin/env node

import { readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { isAbsolute, join, resolve } from "node:path";
import { placeholdersIn, readPromptFileWithMetadata } from "./prompt-metadata.mjs";

const root = process.cwd();
const target = process.argv[2];
const mentonDir = join(root, "menton");
let failures = 0;

function fail(message) {
  failures += 1;
  console.error(`FAIL ${message}`);
}

async function scriptDirs() {
  if (target) return [isAbsolute(target) ? target : resolve(root, target)];
  if (!existsSync(mentonDir)) return [];
  const entries = await readdir(mentonDir, { withFileTypes: true });
  return entries.filter((entry) => entry.isDirectory()).map((entry) => join(mentonDir, entry.name));
}

for (const dir of await scriptDirs()) {
  const name = dir.split("/").pop();
  const promptsDir = join(dir, "prompts");
  if (!existsSync(promptsDir)) {
    fail(`${name}: missing prompts/ directory`);
    continue;
  }

  const prompts = (await readdir(promptsDir, { withFileTypes: true }))
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"));

  if (prompts.length === 0) fail(`${name}: prompts/ has no Markdown prompt files`);

  for (const prompt of prompts) {
    const promptPath = join(promptsDir, prompt.name);
    const { metadata, body } = await readPromptFileWithMetadata(promptPath);
    const placeholders = [...new Set(placeholdersIn(body))];
    const required = Array.isArray(metadata.required_variables) ? metadata.required_variables : [];

    if (placeholders.length > 0 && required.length === 0) {
      fail(`${name}/${prompt.name}: placeholders exist but required_variables frontmatter is missing`);
    }

    for (const placeholder of placeholders) {
      if (!required.includes(placeholder)) {
        fail(`${name}/${prompt.name}: {{${placeholder}}} is not listed in required_variables`);
      }
    }

    for (const variable of required) {
      if (!placeholders.includes(variable)) {
        fail(`${name}/${prompt.name}: required variable ${variable} is not used in the prompt body`);
      }
    }
  }
}

if (failures > 0) {
  console.error(`\nPrompt validation failed with ${failures} problem(s).`);
  process.exit(1);
}

console.log("PASS prompt files are present and placeholder metadata matches.");
