#!/usr/bin/env node

import { spawnSync } from "node:child_process";

let failures = 0;

function check(label, command, args = [], options = {}) {
  const result = spawnSync(command, args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  const status = result.status === 0 ? "PASS" : options.warn ? "WARN" : "FAIL";
  if (status === "FAIL") failures += 1;
  const detail = result.status === 0
    ? (result.stdout || result.stderr).trim().split("\n")[0]
    : options.message || (result.stderr || result.stdout || result.error?.message || "not available").trim().split("\n")[0];
  console.log(`${status} ${label}${detail ? ` - ${detail}` : ""}`);
}

check("Node", "node", ["--version"]);
check("npm", "npm", ["--version"], { warn: true });
check("npx", "npx", ["--version"], { warn: true });
check("zx", "zx", ["--version"], { warn: true, message: "install dependencies with npm install, or use npx zx" });
check("pi", process.env.PI_MENTON_PI_COMMAND || "pi", ["--help"], { warn: true, message: "optional; set PI_MENTON_PI_COMMAND if your Pi launcher has a different name" });

console.log(process.env.PI_MENTON_MODEL ? `PASS PI_MENTON_MODEL - ${process.env.PI_MENTON_MODEL}` : "WARN PI_MENTON_MODEL - unset; examples use documented defaults when possible");

if (failures > 0) process.exit(1);
