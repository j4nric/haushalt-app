import type { Db } from "@haushalt/db";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import type postgres from "postgres";
import type { Auth } from "./auth";
import { neuerCode, normalisiereCode } from "./einladungscode";
import { ImportFehler, rezeptAusHtml, seiteHolen } from "./rezept-import";
import {
  KeinZugriff,
  parseOperationen,
  UngueltigeOperation,
  wendeAn,
} from "./upload";

const EINLADUNG_GUELTIG_TAGE = 7;

type Nutzer = { id: string; name: string };

export function erstelleApp({
  sql,
  auth,
  importLokalErlaubt = false,
}: {
  db: Db;
  sql: postgres.Sql;
  auth: Auth;
  /** Rezept-Import auch von lokalen Adressen (nur Entwicklung und Tests). */
  importLokalErlaubt?: boolean;
}) {
  const app = new Hono<{ Variables: { nutzer: Nutzer } }>().basePath("/api");

  app.get("/health", (c) => c.json({ ok: true }));

  // Login, Registrierung, Sitzungen, JWT für PowerSync, JWKS – alles Better Auth.
  app.on(["GET", "POST"], "/auth/*", (c) => auth.handler(c.req.raw));

  // Alles darunter nur mit gültiger Sitzung.
  app.use("/*", async (c, next) => {
    const sitzung = await auth.api.getSession({ headers: c.req.raw.headers });
    if (!sitzung) {
      throw new HTTPException(401, { message: "Nicht angemeldet" });
    }
    c.set("nutzer", { id: sitzung.user.id, name: sitzung.user.name });
    await next();
  });

  /** Legt einen Haushalt an; der Nutzer wird Besitzer. Vorerst ein Haushalt pro Nutzer. */
  app.post("/haushalte", async (c) => {
    const nutzer = c.get("nutzer");
    const { name } = await c.req.json<{ name?: unknown }>();
    if (typeof name !== "string" || name.trim() === "") {
      throw new HTTPException(400, { message: "Name fehlt" });
    }
    const haushalt = await sql.begin(async (tx) => {
      await pruefeKeinHaushalt(tx, nutzer.id);
      const [neu] = await tx<
        { id: string }[]
      >`insert into haushalte (name) values (${name.trim()}) returning id`;
      await tx`
        insert into haushalt_mitglieder (haushalt_id, nutzer_id, anzeigename, rolle)
        values (${neu?.id ?? ""}, ${nutzer.id}, ${nutzer.name}, 'besitzer')
      `;
      return neu;
    });
    return c.json(haushalt, 201);
  });

  /** Erzeugt einen Einladungscode für den eigenen Haushalt. */
  app.post("/haushalte/:id/einladungen", async (c) => {
    const nutzer = c.get("nutzer");
    const haushaltId = c.req.param("id");
    const [mitglied] = await sql`
      select 1 from haushalt_mitglieder
      where haushalt_id::text = ${haushaltId} and nutzer_id = ${nutzer.id}
    `;
    if (!mitglied) {
      throw new HTTPException(403, {
        message: "Kein Mitglied dieses Haushalts",
      });
    }
    const gueltigBis = new Date(
      Date.now() + EINLADUNG_GUELTIG_TAGE * 24 * 60 * 60 * 1000,
    ).toISOString();
    const code = neuerCode();
    await sql`
      insert into einladungen (haushalt_id, code, erstellt_von, gueltig_bis)
      values (${haushaltId}, ${code}, ${nutzer.id}, ${gueltigBis})
    `;
    return c.json({ code, gueltigBis }, 201);
  });

  /** Tritt mit einem Einladungscode einem Haushalt bei. Jeder Code gilt einmal. */
  app.post("/einladungen/annehmen", async (c) => {
    const nutzer = c.get("nutzer");
    const { code } = await c.req.json<{ code?: unknown }>();
    if (typeof code !== "string") {
      throw new HTTPException(400, { message: "Code fehlt" });
    }
    const haushalt = await sql.begin(async (tx) => {
      const [einladung] = await tx<{ id: string; haushalt_id: string }[]>`
        select id, haushalt_id from einladungen
        where code = ${normalisiereCode(code)} and angenommen_von is null and gueltig_bis > now()
        for update
      `;
      if (!einladung) {
        throw new HTTPException(404, {
          message: "Code ungültig, abgelaufen oder schon benutzt",
        });
      }
      await pruefeKeinHaushalt(tx, nutzer.id);
      await tx`
        insert into haushalt_mitglieder (haushalt_id, nutzer_id, anzeigename, rolle)
        values (${einladung.haushalt_id}, ${nutzer.id}, ${nutzer.name}, 'mitglied')
      `;
      await tx`update einladungen set angenommen_von = ${nutzer.id} where id = ${einladung.id}`;
      return { id: einladung.haushalt_id };
    });
    return c.json(haushalt);
  });

  /** Nimmt die lokalen Änderungen eines Geräts entgegen (PowerSync-Upload). */
  app.post("/powersync/upload", async (c) => {
    try {
      await wendeAn(
        sql,
        c.get("nutzer").id,
        parseOperationen(await c.req.json()),
      );
      return c.json({ ok: true });
    } catch (fehler) {
      if (fehler instanceof UngueltigeOperation) {
        return c.json({ fehler: fehler.message }, 400);
      }
      if (fehler instanceof KeinZugriff) {
        return c.json({ fehler: fehler.message }, 403);
      }
      // Verletzte Datenbank-Regeln (Fremdschlüssel, CHECK, …) sind Fehler der Anfrage.
      if (istConstraintFehler(fehler)) {
        return c.json({ fehler: fehler.message }, 400);
      }
      throw fehler;
    }
  });

  /** Liest ein Rezept von einer Webseite aus (Link-Import). */
  app.post("/rezepte/import", async (c) => {
    const { url } = await c.req.json<{ url?: unknown }>();
    if (typeof url !== "string" || url.trim() === "") {
      return c.json({ fehler: "Link fehlt" }, 400);
    }
    try {
      const seite = await seiteHolen(url.trim(), {
        lokalErlaubt: importLokalErlaubt,
      });
      const rezept = rezeptAusHtml(seite.html, seite.url);
      if (!rezept) {
        throw new ImportFehler(
          "Auf dieser Seite wurde kein Rezept gefunden",
          422,
        );
      }
      return c.json(rezept);
    } catch (fehler) {
      if (fehler instanceof ImportFehler) {
        return c.json({ fehler: fehler.message }, fehler.status);
      }
      throw fehler;
    }
  });

  app.onError((fehler, c) => {
    if (fehler instanceof HTTPException) {
      return c.json({ fehler: fehler.message }, fehler.status);
    }
    console.error(fehler);
    return c.json({ fehler: "Interner Fehler" }, 500);
  });

  return app;
}

async function pruefeKeinHaushalt(
  tx: postgres.TransactionSql,
  nutzerId: string,
) {
  const [vorhanden] =
    await tx`select 1 from haushalt_mitglieder where nutzer_id = ${nutzerId}`;
  if (vorhanden) {
    throw new HTTPException(409, {
      message: "Du gehörst bereits zu einem Haushalt",
    });
  }
}

function istConstraintFehler(fehler: unknown): fehler is Error {
  // SQLSTATE-Klasse 23 = integrity constraint violation
  if (!(fehler instanceof Error) || !("code" in fehler)) {
    return false;
  }
  return typeof fehler.code === "string" && fehler.code.startsWith("23");
}
