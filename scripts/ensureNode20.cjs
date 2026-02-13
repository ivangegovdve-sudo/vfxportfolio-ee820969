#!/usr/bin/env node

const requiredMajor = 20;
const currentVersion = process.version;
const currentMajor = Number(process.versions.node.split(".")[0]);

const runtimeEvents = new Set([
  "predev",
  "dev",
  "prebuild",
  "build",
  "prepreview",
  "preview",
  "pretest:smoke",
  "test:smoke",
  "test",
]);

if (!Number.isNaN(currentMajor) && currentMajor >= requiredMajor) {
  process.exit(0);
}

console.error(
  `This repo requires Node 20. Running under Node ${currentVersion}. Please run 'nvm use' in this folder. This does NOT affect your work Node 16.`
);

const lifecycleEvent = process.env.npm_lifecycle_event ?? "";

if (runtimeEvents.has(lifecycleEvent)) {
  process.exit(1);
}

process.exit(0);

