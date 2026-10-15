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
const BILD_HOECHSTENS = 3 * 1024 * 1024;
const UUID_MUSTER =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Erkennt das Bildformat an den ersten Bytes (nicht am angegebenen Typ). */
export function bildFormat(daten: Buffer): string | null {
  if (daten[0] === 0xff && daten[1] === 0xd8 && daten[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    daten
      .subarray(0, 8)
      .equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  ) {
    return "image/png";
  }
  if (
    daten.subarray(0, 4).toString("ascii") === "RIFF" &&
    daten.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return "image/webp";
  }
  return null;
}

type Nutzer = { id: string; name: string; email: string };

/** So viele Haushalte darf ein Konto höchstens haben (Schutz vor Versehen/Missbrauch). */
const HAUSHALTE_HOECHSTENS = 10;

export function erstelleApp({
  sql,
  auth,
  importLokalErlaubt = false,
  adminEmails = [],
}: {
  db: Db;
  sql: postgres.Sql;
  auth: Auth;
  /** Rezept-Import auch von lokalen Adressen (nur Entwicklung und Tests). */
  importLokalErlaubt?: boolean;
  /** Diese Konten sehen das Admin-Panel (E-Mail, ohne Groß/klein). */
  adminEmails?: string[];
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
    c.set("nutzer", {
      id: sitzung.user.id,
      name: sitzung.user.name,
      email: sitzung.user.email,
    });
    await next();
  });

  /** Legt einen Haushalt an; der Nutzer wird Besitzer. Mehrere pro Konto sind möglich. */
  app.post("/haushalte", async (c) => {
    const nutzer = c.get("nutzer");
    const { name } = await c.req.json<{ name?: unknown }>();
    if (typeof name !== "string" || name.trim() === "") {
      throw new HTTPException(400, { message: "Name fehlt" });
    }
    const haushalt = await sql.begin(async (tx) => {
      await pruefeHaushaltLimit(tx, nutzer.id);
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
      const [schonDrin] = await tx`
        select 1 from haushalt_mitglieder
        where haushalt_id = ${einladung.haushalt_id} and nutzer_id = ${nutzer.id}
      `;
      if (schonDrin) {
        throw new HTTPException(409, {
          message: "Du bist schon Mitglied dieses Haushalts",
        });
      }
      await pruefeHaushaltLimit(tx, nutzer.id);
      await tx`
        insert into haushalt_mitglieder (haushalt_id, nutzer_id, anzeigename, rolle)
        values (${einladung.haushalt_id}, ${nutzer.id}, ${nutzer.name}, 'mitglied')
      `;
      await tx`update einladungen set angenommen_von = ${nutzer.id} where id = ${einladung.id}`;
      return { id: einladung.haushalt_id };
    });
    return c.json(haushalt);
  });

  /**
   * Haushalt verlassen. War man Besitzer, übernimmt das am längsten dabei gewesene
   * Mitglied. Geht das letzte Mitglied, wird der Haushalt mit allen Daten gelöscht.
   */
  app.delete("/haushalte/:id/mitgliedschaft", async (c) => {
    const nutzer = c.get("nutzer");
    const haushaltId = c.req.param("id");
    await pruefeMitglied(sql, haushaltId, nutzer.id);
    const ergebnis = await sql.begin(async (tx) => {
      // Sperrt den Haushalt, damit zwei, die gleichzeitig gehen, ihn nicht verwaist lassen.
      await tx`select 1 from haushalte where id = ${haushaltId} for update`;
      const [ich] = await tx<{ rolle: string }[]>`
        delete from haushalt_mitglieder
        where haushalt_id = ${haushaltId} and nutzer_id = ${nutzer.id}
        returning rolle
      `;
      const [naechster] = await tx<{ id: string }[]>`
        select id from haushalt_mitglieder where haushalt_id = ${haushaltId}
        order by beigetreten_am limit 1
      `;
      if (!naechster) {
        await tx`delete from haushalte where id = ${haushaltId}`;
        return { geloescht: true };
      }
      if (ich?.rolle === "besitzer") {
        await tx`update haushalt_mitglieder set rolle = 'besitzer' where id = ${naechster.id}`;
      }
      return { geloescht: false };
    });
    return c.json(ergebnis);
  });

  /** Wer bin ich – für Dinge, die nicht synchronisiert werden (z. B. Admin). */
  app.get("/ich", (c) =>
    c.json({ admin: istAdmin(c.get("nutzer").email, adminEmails) }),
  );

  /** Admin: alle Konten mit ihren Haushalten (nur lesend). */
  app.get("/admin/uebersicht", async (c) => {
    if (!istAdmin(c.get("nutzer").email, adminEmails)) {
      return c.json({ fehler: "Nur für Admins" }, 403);
    }
    const nutzer = await sql<
      {
        id: string;
        name: string;
        email: string;
        erstellt_am: string;
        zuletzt_aktiv: string | null;
        haushalte: {
          id: string;
          name: string;
          rolle: string;
          mitglieder: number;
        }[];
      }[]
    >`
      select u.id, u.name, u.email, u.created_at as erstellt_am,
             (select max(s.updated_at) from session s where s.user_id = u.id) as zuletzt_aktiv,
             coalesce(
               json_agg(json_build_object(
                 'id', h.id, 'name', h.name, 'rolle', m.rolle,
                 'mitglieder', (select count(*) from haushalt_mitglieder m2 where m2.haushalt_id = h.id)
               ) order by h.name) filter (where h.id is not null),
               '[]'
             ) as haushalte
      from "user" u
      left join haushalt_mitglieder m on m.nutzer_id = u.id
      left join haushalte h on h.id = m.haushalt_id
      group by u.id
      order by u.created_at
    `;
    const [zahlen] = await sql<
      { haushalte: number; rezepte: number; eintraege: number }[]
    >`
      select (select count(*)::int from haushalte) as haushalte,
             (select count(*)::int from rezepte) as rezepte,
             (select count(*)::int from listeneintraege) as eintraege
    `;
    return c.json({ nutzer, zahlen });
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

  /** Haushalts-Einstellungen ändern (vorerst: Standard-Portionen im Wochenplan). */
  app.patch("/haushalte/:id", async (c) => {
    const haushaltId = c.req.param("id");
    await pruefeMitglied(sql, haushaltId, c.get("nutzer").id);
    const { standard_portionen } = await c.req.json<{
      standard_portionen?: unknown;
    }>();
    if (
      typeof standard_portionen !== "number" ||
      !Number.isInteger(standard_portionen) ||
      standard_portionen < 1 ||
      standard_portionen > 50
    ) {
      return c.json({ fehler: "Portionen: ganze Zahl von 1 bis 50" }, 400);
    }
    await sql`update haushalte set standard_portionen = ${standard_portionen} where id = ${haushaltId}`;
    return c.json({ ok: true });
  });

  /**
   * Lädt ein Foto hoch (Rohdaten im Body, Typ im Content-Type). Die App verkleinert
   * vorher; hier wird nur das Format an den ersten Bytes geprüft und begrenzt.
   */
  app.post("/haushalte/:id/bilder", async (c) => {
    const nutzer = c.get("nutzer");
    const haushaltId = c.req.param("id");
    await pruefeMitglied(sql, haushaltId, nutzer.id);
    const daten = Buffer.from(await c.req.arrayBuffer());
    if (daten.byteLength > BILD_HOECHSTENS) {
      return c.json({ fehler: "Das Foto ist zu groß (höchstens 3 MB)" }, 413);
    }
    const mime = bildFormat(daten);
    if (!mime) {
      return c.json({ fehler: "Nur JPEG-, PNG- oder WebP-Fotos" }, 415);
    }
    const [bild] = await sql<{ id: string }[]>`
      insert into bilder (haushalt_id, mime, daten, erstellt_von)
      values (${haushaltId}, ${mime}, ${daten}, ${nutzer.id})
      returning id
    `;
    return c.json({ url: `/api/bilder/${bild?.id}` }, 201);
  });

  /** Liefert ein Foto – nur an Mitglieder des Haushalts, dem es gehört. */
  app.get("/bilder/:id", async (c) => {
    const id = c.req.param("id");
    if (!UUID_MUSTER.test(id)) {
      return c.json({ fehler: "Nicht gefunden" }, 404);
    }
    const [bild] = await sql<{ mime: string; daten: Buffer }[]>`
      select b.mime, b.daten from bilder b
      join haushalt_mitglieder m on m.haushalt_id = b.haushalt_id
      where b.id = ${id} and m.nutzer_id = ${c.get("nutzer").id}
    `;
    if (!bild) {
      return c.json({ fehler: "Nicht gefunden" }, 404);
    }
    // Bilder ändern sich nie (neue ID je Upload) – dauerhaft zwischenspeichern.
    return c.body(new Uint8Array(bild.daten), 200, {
      "content-type": bild.mime,
      "cache-control": "private, max-age=31536000, immutable",
      "x-content-type-options": "nosniff",
    });
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

/** 403, wenn der Nutzer nicht zum Haushalt gehört (auch bei ungültiger ID). */
async function pruefeMitglied(
  sql: postgres.Sql,
  haushaltId: string,
  nutzerId: string,
) {
  const [mitglied] = await sql`
    select 1 from haushalt_mitglieder
    where haushalt_id::text = ${haushaltId} and nutzer_id = ${nutzerId}
  `;
  if (!mitglied) {
    throw new HTTPException(403, {
      message: "Kein Mitglied dieses Haushalts",
    });
  }
}

async function pruefeHaushaltLimit(
  tx: postgres.TransactionSql,
  nutzerId: string,
) {
  const [{ n } = { n: 0 }] = await tx<{ n: number }[]>`
    select count(*)::int as n from haushalt_mitglieder where nutzer_id = ${nutzerId}
  `;
  if (n >= HAUSHALTE_HOECHSTENS) {
    throw new HTTPException(409, {
      message: `Höchstens ${HAUSHALTE_HOECHSTENS} Haushalte pro Konto`,
    });
  }
}

/** Eintrag „name@domain“ oder „@domain“ (alle Konten der Domain, z. B. für Tests). */
function istAdmin(email: string, admins: string[]): boolean {
  const e = email.toLowerCase();
  return admins.some((roh) => {
    const a = roh.trim().toLowerCase();
    return a.startsWith("@") ? e.endsWith(a) : a === e;
  });
}

function istConstraintFehler(fehler: unknown): fehler is Error {
  // SQLSTATE-Klasse 23 = integrity constraint violation
  if (!(fehler instanceof Error) || !("code" in fehler)) {
    return false;
  }
  return typeof fehler.code === "string" && fehler.code.startsWith("23");
}
