import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["{apps,packages}/*/src/**/*.test.{ts,tsx}"],
    // API-Tests laufen gegen eine echte Postgres-Datenbank (haushalt_test).
    // Lokal vorher `pnpm infra:up`, in der CI stellt der Workflow Postgres bereit.
    globalSetup: ["apps/api/test/global-setup.ts"],
  },
});
