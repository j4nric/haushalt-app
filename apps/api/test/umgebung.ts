import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { datenbankUrl } from "../src/env";

/** Lokal kommen die Zugangsdaten aus der .env, in der CI aus Umgebungsvariablen. */
const envDatei = fileURLToPath(new URL("../../../.env", import.meta.url));
if (!process.env.POSTGRES_USER && existsSync(envDatei)) {
  process.loadEnvFile(envDatei);
}

export const TEST_DATENBANK = "haushalt_test";
export const testDatenbankUrl = () => datenbankUrl(TEST_DATENBANK);
export const adminDatenbankUrl = () => datenbankUrl("postgres");
