import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end tests for the app. They run against the dev server on 3000,
 * reusing one that is already up. Every test gets a fresh browser context, so
 * each starts from an untouched demo wallet.
 */
export default defineConfig({
  testDir: "tests/e2e",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: "list",
  use: {
    baseURL: "http://localhost:3000",
    ...devices["Desktop Chrome"],
    viewport: { width: 1440, height: 900 },
  },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
