import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { SignJWT } from "jose";
import postgres from "postgres";
import { env } from "./env";
import { parseOperationen, UngueltigeOperation, wendeAn } from "./upload";

// onnotice: Hinweise wie "existiert bereits, übersprungen" nicht ins Log schreiben.
const sql = postgres(env.datenbankUrl, { onnotice: () => {} });

// PROTOTYP: Tabelle direkt anlegen. Ab Schritt 6 übernehmen Drizzle-Migrationen.
await sql`
  create table if not exists listeneintraege (
    id uuid primary key,
    name text not null,
    erledigt boolean not null default false,
    erstellt_am timestamptz not null default now()
  )
`;

const app = new Hono().basePath("/api");

app.get("/health", (c) => c.json({ ok: true }));

/**
 * Stellt dem Client ein kurzlebiges Token für PowerSync aus.
 * PROTOTYP: Es gibt noch kein Login; der Client schickt eine zufällige Geräte-ID.
 */
app.get("/powersync/token", async (c) => {
  const nutzer = c.req.query("nutzer") ?? "anonym";
  const token = await new SignJWT({})
    .setProtectedHeader({ alg: "HS256", kid: "haushalt-dev" })
    .setSubject(nutzer)
    .setAudience("powersync")
    .setIssuedAt()
    .setExpirationTime("5m")
    .sign(Buffer.from(env.powersyncJwtSecret, "base64url"));
  return c.json({ endpoint: env.powersyncUrl, token });
});

/** Nimmt die lokalen Änderungen eines Clients entgegen und schreibt sie nach Postgres. */
app.post("/powersync/upload", async (c) => {
  try {
    await wendeAn(sql, parseOperationen(await c.req.json()));
    return c.json({ ok: true });
  } catch (fehler) {
    if (fehler instanceof UngueltigeOperation) {
      return c.json({ fehler: fehler.message }, 400);
    }
    throw fehler;
  }
});

serve({ fetch: app.fetch, port: env.port }, ({ port }) => {
  console.log(`API läuft auf http://localhost:${port}`);
});
