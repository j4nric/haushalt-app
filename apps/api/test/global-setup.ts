import { erstelleDb, migriere } from "@haushalt/db";
import postgres from "postgres";
import {
  adminDatenbankUrl,
  TEST_DATENBANK,
  testDatenbankUrl,
} from "./umgebung";

/** Legt vor allen Tests eine frische, migrierte Testdatenbank an. */
export default async function setup() {
  const admin = postgres(adminDatenbankUrl(), { onnotice: () => {} });
  try {
    await admin.unsafe(
      `drop database if exists ${TEST_DATENBANK} with (force)`,
    );
    await admin.unsafe(`create database ${TEST_DATENBANK}`);
  } catch (fehler) {
    throw new Error(
      `Testdatenbank nicht erreichbar. Läuft \`pnpm infra:up\`? (${String(fehler)})`,
    );
  } finally {
    await admin.end();
  }
  const { db, sql } = erstelleDb(testDatenbankUrl());
  await migriere(db);
  await sql.end();
}
