import { readFile } from "node:fs/promises";

export function parsePromptMetadata(text) {
  if (!text.startsWith("---\n")) return { metadata: {}, body: text };
  const end = text.indexOf("\n---", 4);
  if (end === -1) return { metadata: {}, body: text };

  const raw = text.slice(4, end).trimEnd();
  const body = text.slice(end + 5).replace(/^\n/, "");
  const metadata = {};
  let currentKey = null;

  for (const line of raw.split("\n")) {
    const keyMatch = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (keyMatch) {
      currentKey = keyMatch[1];
      const value = keyMatch[2];
      metadata[currentKey] = value ? value : [];
      continue;
    }
    const listMatch = line.match(/^\s*-\s+(.+)$/);
    if (listMatch && currentKey) {
      if (!Array.isArray(metadata[currentKey])) metadata[currentKey] = [];
      metadata[currentKey].push(listMatch[1].trim());
    }
  }

  return { metadata, body };
}

export function placeholdersIn(text) {
  return [...text.matchAll(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g)].map((match) => match[1]);
}

export async function readPromptFileWithMetadata(path) {
  return parsePromptMetadata(await readFile(path, "utf8"));
}
