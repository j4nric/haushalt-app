import { defineConfig, devices } from "@playwright/test";

/**
 * Ende-zu-Ende-Tests. Voraussetzung: `pnpm infra:up` (Postgres + PowerSync).
 * API und Frontend startet Playwright selbst, falls sie nicht schon laufen.
 */
export default defineConfig({
  testDir: "e2e",
  timeout: 60_000,
  expect: { timeout: 15_000 },
  use: {
    baseURL: "http://localhost:5173",
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "pnpm --dir ../.. dev",
    url: "http://localhost:5173",
    reuseExistingServer: true,
  },
});
