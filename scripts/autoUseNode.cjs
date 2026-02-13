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
  console.log("Run: nvm use");
}

