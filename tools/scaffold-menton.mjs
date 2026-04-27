#!/usr/bin/env node

import { mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";

const name = process.argv[2];
const root = process.env.PI_MENTON_SCAFFOLD_ROOT || process.cwd();

if (!name || !/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(name)) {
  console.error("Usage: npm run scaffold -- <script-name>");
  console.error("Names must be lowercase kebab-case, for example: repo-summary");
  process.exit(1);
}

const dir = join(root, "menton", name);
if (existsSync(dir)) {
  console.error(`Refusing to overwrite existing script folder: ${dir}`);
  process.exit(1);
}

await mkdir(join(dir, "prompts"), { recursive: true });
await mkdir(join(dir, "assets"), { recursive: true });

await writeFile(join(dir, "main.mjs"), `#!/usr/bin/env zx\n\nimport { mkdir, writeFile } from "node:fs/promises";\nimport { join } from "node:path";\n\nconst scriptName = "${name}";\nconst runId = new Date().toISOString().replace(/[:.]/g, "-");\nconst runDir = join(process.cwd(), "artifacts", scriptName, runId);\n\nawait mkdir(runDir, { recursive: true });\nawait writeFile(join(runDir, "manifest.json"), JSON.stringify({ scriptName, runId, status: "created" }, null, 2));\n\nconsole.log(\`Created run artifact folder: \${runDir}\`);\n`);

await writeFile(join(dir, "prompts", "task.md"), `---\nrequired_variables:\n  - input\n---\nProcess this input:\n\n{{input}}\n`);
await writeFile(join(dir, "assets", ".gitkeep"), "");
await writeFile(join(dir, "README.md"), `# ${name}\n\n## Purpose\n\nDescribe what this runbook does and when to use it.\n\n## Run\n\n\`\`\`bash\nnpx zx menton/${name}/main.mjs\n\`\`\`\n\n## Validation\n\n\`\`\`bash\nnpm run validate:prompts -- menton/${name}\n\`\`\`\n\nGenerated run outputs belong under \`artifacts/${name}/<run-id>/\` and are ignored by git.\n`);

console.log(`Created menton/${name}`);
