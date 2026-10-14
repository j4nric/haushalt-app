import { defineConfig, devices } from "@playwright/test";

/**
 * Ende-zu-Ende-Tests gegen den Produktions-Build (`vite preview`), damit auch der
 * Service Worker (Offline-Start) mitgetestet wird.
 * Voraussetzung: `pnpm infra:up` (Postgres + PowerSync). API und Frontend startet
 * Playwright selbst, falls sie nicht schon laufen.
 */
export default defineConfig({
  testDir: "e2e",
  timeout: 60_000,
  expect: { timeout: 15_000 },
  use: {
    baseURL: "http://localhost:4173",
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: [
    {
      command: "pnpm --dir ../api dev",
      url: "http://localhost:3000/api/health",
      reuseExistingServer: true,
    },
    {
      command: "pnpm build && pnpm preview --port 4173 --strictPort",
      url: "http://localhost:4173",
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
});
