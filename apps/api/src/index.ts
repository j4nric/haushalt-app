import { erstelleDb, migriere } from "@haushalt/db";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { erstelleApp } from "./app";
import { aufraeumenPlanen } from "./aufraeumen";
import { erstelleAuth } from "./auth";
import { ladeEnv } from "./env";
import { statischesFrontend } from "./statisch";

const env = ladeEnv();
const { db, sql } = erstelleDb(env.datenbankUrl);

await migriere(db);

const auth = erstelleAuth(db, {
  secret: env.authSecret,
  webUrl: env.webUrl,
  weitereOrigins: env.weitereOrigins,
});
const app = new Hono();
app.route(
  "/",
  erstelleApp({
    db,
    sql,
    auth,
    importLokalErlaubt: env.importLokalErlaubt,
    adminEmails: env.adminEmails,
  }),
);
// In Produktion liefert das API auch das Frontend aus (siehe Dockerfile).
if (env.frontendVerzeichnis) {
  statischesFrontend(app, env.frontendVerzeichnis);
}

aufraeumenPlanen(sql);

serve({ fetch: app.fetch, port: env.port }, ({ port }) => {
  console.log(`API läuft auf http://localhost:${port}`);
});
