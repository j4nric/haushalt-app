import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import * as schema from "./schema";

export function erstelleDb(url: string) {
  // onnotice: Hinweise wie "existiert bereits, übersprungen" nicht ins Log schreiben.
  const sql = postgres(url, { onnotice: () => {} });
  return { db: drizzle(sql, { schema }), sql };
}

export type Db = ReturnType<typeof erstelleDb>["db"];

/** Spielt alle noch fehlenden Migrationen aus packages/db/drizzle ein. */
export async function migriere(db: Db) {
  await migrate(db, {
    migrationsFolder: new URL("../drizzle", import.meta.url).pathname,
  });
}
