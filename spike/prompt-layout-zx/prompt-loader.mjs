import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export async function renderPromptFile(promptsDir, name, variables = {}) {
  const filePath = join(promptsDir, name);
  const template = await readFile(filePath, 'utf8');

  return template.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key) => {
    if (!(key in variables)) {
      throw new Error(`Missing prompt variable: ${key}`);
    }

    return String(variables[key]);
  }).trim();
}
