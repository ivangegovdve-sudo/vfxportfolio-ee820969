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
  "pretest",
  "pretest:smoke",
  "pretest:watch",
  "test:watch",
  "test:smoke",
  "test",
  "guardian",
]);

if (!Number.isNaN(currentMajor) && currentMajor >= requiredMajor) {
  process.exit(0);
}

const lifecycleEvent = process.env.npm_lifecycle_event ?? "";

if (!runtimeEvents.has(lifecycleEvent)) {
  process.exit(0);
}

console.error(
  [
    `Node 20 is required for "${lifecycleEvent}" in this portfolio repo.`,
    `Current runtime: ${currentVersion}`,
    "",
    "Use explicit, repo-scoped switching with nvm-windows:",
    "  nvm use 20",
    "  <rerun your command>",
    "  nvm use 16  (switch back for your other work repo)",
    "",
    "This guard only blocks runtime/build/preview/test commands.",
    "Lint and commit workflows remain available under Node 16.",
  ].join("\n")
);

process.exit(1);
