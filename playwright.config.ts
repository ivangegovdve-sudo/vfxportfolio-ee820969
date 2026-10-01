import { defineConfig } from "@playwright/test";
import { existsSync } from "node:fs";

const systemChromium = "/usr/bin/chromium";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  retries: 0,
  workers: 1,
  timeout: 30_000,
  globalTimeout: 90_000,
  expect: {
    timeout: 5_000,
  },
  use: {
    baseURL: "http://127.0.0.1:4173",
    trace: "retain-on-failure",
    contextOptions: { reducedMotion: "reduce" },
    // Portable across this workspace and CI with Playwright-managed browsers.
    launchOptions: existsSync(systemChromium) ? { executablePath: systemChromium } : {},
  },
  webServer: {
    command: "npm run preview -- --host 127.0.0.1 --port 4173 --strictPort",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
