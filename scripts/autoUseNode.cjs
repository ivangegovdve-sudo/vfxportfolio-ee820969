#!/usr/bin/env node

const { spawnSync } = require("node:child_process");

const requiredMajor = 20;
const currentMajor = Number(process.versions.node.split(".")[0]);

if (Number.isNaN(currentMajor) || currentMajor >= requiredMajor) {
  process.exit(0);
}

const nvmCheck = spawnSync("nvm", ["--version"], {
  shell: true,
  stdio: "ignore",
});

if (!nvmCheck.error && nvmCheck.status === 0) {
  console.log("Tip: run `nvm use 20` in this repo (explicit switch, no global changes).");
  process.exit(0);
}

console.log("Node < 20 detected and nvm-windows is not on PATH in this shell.");
