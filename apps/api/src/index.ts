import { erstelleDb, migriere } from "@haushalt/db";
import { serve } from "@hono/node-server";
import { erstelleApp } from "./app";
import { erstelleAuth } from "./auth";
import { ladeEnv } from "./env";

const env = ladeEnv();
const { db, sql } = erstelleDb(env.datenbankUrl);

await migriere(db);

const auth = erstelleAuth(db, { secret: env.authSecret, webUrl: env.webUrl });
const app = erstelleApp({ db, sql, auth });

serve({ fetch: app.fetch, port: env.port }, ({ port }) => {
  console.log(`API läuft auf http://localhost:${port}`);
});
