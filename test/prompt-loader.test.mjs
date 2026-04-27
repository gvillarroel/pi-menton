import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { renderPromptFile } from "../spike/prompt-layout-zx/prompt-loader.mjs";

test("renderPromptFile loads a prompt and substitutes placeholders", async () => {
  const dir = await mkdtemp(join(tmpdir(), "pi-menton-prompts-"));
  await writeFile(join(dir, "task.md"), "Hello {{ name }} from {{place}}\n");

  const rendered = await renderPromptFile(dir, "task.md", { name: "Pi", place: "ZX" });

  assert.equal(rendered, "Hello Pi from ZX");
});

test("renderPromptFile reports missing variables with useful names", async () => {
  const dir = await mkdtemp(join(tmpdir(), "pi-menton-prompts-"));
  await writeFile(join(dir, "task.md"), "Hello {{missing_name}}\n");

  await assert.rejects(
    renderPromptFile(dir, "task.md", {}),
    /Missing prompt variable: missing_name/,
  );
});

test("renderPromptFile reports missing files", async () => {
  const dir = await mkdtemp(join(tmpdir(), "pi-menton-prompts-"));

  await assert.rejects(
    renderPromptFile(dir, "missing.md", {}),
    /ENOENT.*missing\.md/,
  );
});
