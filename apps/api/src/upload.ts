import { EINHEITEN, KATEGORIE_IDS } from "@haushalt/db";
import type postgres from "postgres";

/**
 * Eine Änderung aus der lokalen Warteschlange eines Clients (PowerSync CrudEntry).
 * PUT = einfügen oder ersetzen, PATCH = Felder ändern, DELETE = löschen.
 */
export type Operation =
  | {
      op: "PUT" | "PATCH";
      table: Tabelle;
      id: string;
      data: Record<string, Wert>;
    }
  | { op: "DELETE"; table: Tabelle; id: string };

type Wert = string | number | boolean | null;

/** Fehler in der Anfrage selbst (HTTP 400). */
export class UngueltigeOperation extends Error {}
/** Zugriff auf einen fremden Haushalt (HTTP 403). */
export class KeinZugriff extends Error {}

const text = (spalte: string) => (wert: unknown) => {
  if (typeof wert !== "string" || wert.trim() === "") {
    throw new UngueltigeOperation(`${spalte} muss ein nicht-leerer Text sein`);
  }
  return wert.trim();
};
/** Text oder nichts; leer zählt als nichts. Begrenzt, damit niemand die DB flutet. */
const optionalerText =
  (spalte: string, hoechstens = 500) =>
  (wert: unknown) => {
    if (wert == null || (typeof wert === "string" && wert.trim() === "")) {
      return null;
    }
    if (typeof wert !== "string" || wert.length > hoechstens) {
      throw new UngueltigeOperation(
        `${spalte} muss ein Text mit höchstens ${hoechstens} Zeichen sein`,
      );
    }
    return wert.trim();
  };
/** Nur http(s)-Adressen – sie landen in Links und Bildern. */
const optionaleUrl = (spalte: string) => (wert: unknown) => {
  const url = optionalerText(spalte, 2000)(wert);
  if (url != null && !/^https?:\/\//i.test(url)) {
    throw new UngueltigeOperation(`${spalte} muss mit http(s):// beginnen`);
  }
  return url;
};
const ganzzahl =
  (spalte: string, { min, optional }: { min: number; optional: boolean }) =>
  (wert: unknown) => {
    if (wert == null && optional) {
      return null;
    }
    if (typeof wert !== "number" || !Number.isInteger(wert) || wert < min) {
      throw new UngueltigeOperation(
        `${spalte} muss eine ganze Zahl ab ${min} sein`,
      );
    }
    return wert;
  };
const kategorie = (wert: unknown) => {
  if (wert == null || wert === "") {
    return null;
  }
  if (!KATEGORIE_IDS.includes(wert as never)) {
    throw new UngueltigeOperation(`Unbekannte Kategorie: ${String(wert)}`);
  }
  return wert as string;
};
const uuid = (spalte: string) => (wert: unknown) => {
  if (typeof wert !== "string" || !UUID.test(wert)) {
    throw new UngueltigeOperation(`${spalte} muss eine UUID sein`);
  }
  return wert;
};
const einheit = (pflicht: boolean) => (wert: unknown) => {
  if (wert == null && !pflicht) {
    return null;
  }
  if (!EINHEITEN.includes(wert as never)) {
    throw new UngueltigeOperation(`Unbekannte Einheit: ${String(wert)}`);
  }
  return wert as string;
};
const menge = (wert: unknown) => {
  if (wert == null) {
    return null;
  }
  if (typeof wert !== "number" || !Number.isFinite(wert) || wert <= 0) {
    throw new UngueltigeOperation("menge muss eine positive Zahl sein");
  }
  return wert;
};
/** Vorratsbuchung: positiv (Zugang) oder negativ (Abgang), aber nie 0. */
const buchungsmenge = (wert: unknown) => {
  if (typeof wert !== "number" || !Number.isFinite(wert) || wert === 0) {
    throw new UngueltigeOperation(
      "Buchungsmenge muss eine Zahl ungleich 0 sein",
    );
  }
  return wert;
};
const GRUENDE = ["einkauf", "verbrauch", "korrektur"];
const grund = (wert: unknown) => {
  if (!GRUENDE.includes(wert as string)) {
    throw new UngueltigeOperation(`Unbekannter Buchungsgrund: ${String(wert)}`);
  }
  return wert as string;
};
const optionaleUuid = (spalte: string) => (wert: unknown) =>
  wert == null ? null : uuid(spalte)(wert);
// SQLite kennt keine Booleans: PowerSync liefert 0/1.
const bool = (wert: unknown) => wert === 1 || wert === true;
const zeitpunkt = (wert: unknown) => {
  if (typeof wert !== "string" || Number.isNaN(Date.parse(wert))) {
    throw new UngueltigeOperation("Zeitpunkt muss ein ISO-Datum sein");
  }
  return wert;
};

/**
 * Nur diese Tabellen und Spalten dürfen Clients schreiben. `fest` markiert
 * Spalten, die nur beim Anlegen (PUT) gesetzt und danach nie geändert werden.
 * `vomServer` markiert Spalten, die der Client lokal setzen darf (für die sofortige
 * Anzeige), deren Wert der Server aber verwirft und selbst bestimmt.
 */
const ERLAUBT = {
  artikel: {
    haushalt_id: { umwandeln: uuid("haushalt_id"), fest: true },
    name: { umwandeln: text("name") },
    kategorie: { umwandeln: kategorie },
    standardeinheit: { umwandeln: einheit(true) },
    im_vorrat: { umwandeln: bool },
    archiviert: { umwandeln: bool },
    mindestbestand: { umwandeln: menge },
    erstellt_am: { umwandeln: zeitpunkt, fest: true },
  },
  // Buchungen sind unveränderlich: alle Spalten `fest`, also nur PUT und DELETE.
  vorratsbuchungen: {
    haushalt_id: { umwandeln: uuid("haushalt_id"), fest: true },
    artikel_id: { umwandeln: uuid("artikel_id"), fest: true },
    menge: { umwandeln: buchungsmenge, fest: true },
    grund: { umwandeln: grund, fest: true },
    listeneintrag_id: {
      umwandeln: optionaleUuid("listeneintrag_id"),
      fest: true,
    },
    erstellt_am: { umwandeln: zeitpunkt, fest: true },
    erstellt_von: { umwandeln: () => null, vomServer: true },
  },
  // Käufe sind unveränderlich wie Buchungen: nur PUT und DELETE.
  kaeufe: {
    haushalt_id: { umwandeln: uuid("haushalt_id"), fest: true },
    artikel_id: { umwandeln: uuid("artikel_id"), fest: true },
    listeneintrag_id: {
      umwandeln: optionaleUuid("listeneintrag_id"),
      fest: true,
    },
    gekauft_am: { umwandeln: zeitpunkt, fest: true },
    erstellt_von: { umwandeln: () => null, vomServer: true },
  },
  rezepte: {
    haushalt_id: { umwandeln: uuid("haushalt_id"), fest: true },
    titel: { umwandeln: text("titel") },
    portionen: {
      umwandeln: ganzzahl("portionen", { min: 1, optional: true }),
    },
    quelle_url: { umwandeln: optionaleUrl("quelle_url") },
    bild_url: { umwandeln: optionaleUrl("bild_url") },
    schritte: {
      umwandeln: (wert: unknown) =>
        optionalerText("schritte", 20_000)(wert) ?? "",
    },
    erstellt_am: { umwandeln: zeitpunkt, fest: true },
    erstellt_von: { umwandeln: () => null, vomServer: true },
  },
  rezept_zutaten: {
    haushalt_id: { umwandeln: uuid("haushalt_id"), fest: true },
    rezept_id: { umwandeln: uuid("rezept_id"), fest: true },
    position: { umwandeln: ganzzahl("position", { min: 0, optional: false }) },
    menge: { umwandeln: menge },
    einheit: { umwandeln: optionalerText("einheit", 30) },
    name: { umwandeln: text("name") },
    zusatz: { umwandeln: optionalerText("zusatz") },
    gewuerz: { umwandeln: bool },
  },
  listeneintraege: {
    haushalt_id: { umwandeln: uuid("haushalt_id"), fest: true },
    artikel_id: { umwandeln: uuid("artikel_id"), fest: true },
    menge: { umwandeln: menge },
    einheit: { umwandeln: einheit(false) },
    erledigt: { umwandeln: bool },
    erstellt_am: { umwandeln: zeitpunkt, fest: true },
    erstellt_von: { umwandeln: () => null, vomServer: true },
    erledigt_von: { umwandeln: () => null, vomServer: true },
  },
} satisfies Record<string, Record<string, Regel>>;

type Regel = {
  umwandeln: (wert: unknown) => Wert;
  fest?: true;
  vomServer?: true;
};

type Tabelle = keyof typeof ERLAUBT;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Prüft den Request-Body und wandelt ihn in typisierte Operationen um. */
export function parseOperationen(body: unknown): Operation[] {
  const operationen = (body as { operationen?: unknown } | null)?.operationen;
  if (!Array.isArray(operationen)) {
    throw new UngueltigeOperation("Erwartet { operationen: [...] }");
  }
  return operationen.map((roh): Operation => {
    const { op, table, id, opData } = (roh ?? {}) as Record<string, unknown>;
    if (typeof table !== "string" || !Object.hasOwn(ERLAUBT, table)) {
      throw new UngueltigeOperation(`Tabelle nicht erlaubt: ${String(table)}`);
    }
    const tabelle = table as Tabelle;
    const geprueftId = uuid("id")(id);
    if (op === "DELETE") {
      return { op, table: tabelle, id: geprueftId };
    }
    if (op !== "PUT" && op !== "PATCH") {
      throw new UngueltigeOperation(`Unbekannte Operation: ${String(op)}`);
    }
    const spalten: Record<string, Regel> = ERLAUBT[tabelle];
    const data: Record<string, Wert> = {};
    for (const [spalte, wert] of Object.entries(
      (opData ?? {}) as Record<string, unknown>,
    )) {
      const regel = spalten[spalte];
      if (!regel) {
        throw new UngueltigeOperation(
          `Spalte nicht erlaubt: ${tabelle}.${spalte}`,
        );
      }
      if (op === "PATCH" && regel.fest) {
        throw new UngueltigeOperation(
          `${tabelle}.${spalte} kann nicht geändert werden`,
        );
      }
      if (regel.vomServer) {
        continue;
      }
      data[spalte] = regel.umwandeln(wert);
    }
    if (op === "PUT" && typeof data.haushalt_id !== "string") {
      throw new UngueltigeOperation(`${tabelle}: haushalt_id fehlt`);
    }
    return { op, table: tabelle, id: geprueftId, data };
  });
}

/**
 * Wendet die Operationen eines Nutzers in einer Transaktion an: alles oder nichts.
 * Jede Zeile muss zu einem Haushalt gehören, in dem der Nutzer Mitglied ist.
 */
export async function wendeAn(
  sql: postgres.Sql,
  nutzerId: string,
  operationen: Operation[],
): Promise<void> {
  await sql.begin(async (tx) => {
    const zeilen = await tx<{ haushalt_id: string }[]>`
      select haushalt_id from haushalt_mitglieder where nutzer_id = ${nutzerId}
    `;
    const meineHaushalte = zeilen.map((z) => z.haushalt_id);

    for (const o of operationen) {
      const t = tx(o.table);
      if (o.op === "DELETE") {
        await tx`delete from ${t} where id = ${o.id} and haushalt_id = any(${meineHaushalte}::uuid[])`;
        continue;
      }

      const data: Record<string, Wert> = { ...o.data };
      if (o.table === "listeneintraege" && "erledigt" in data) {
        data.erledigt_von = data.erledigt ? nutzerId : null;
      }

      if (o.op === "PATCH") {
        if (Object.keys(data).length > 0) {
          await tx`
            update ${t} set ${tx(data)}
            where id = ${o.id} and haushalt_id = any(${meineHaushalte}::uuid[])
          `;
        }
        continue;
      }

      // PUT: Nur in eigene Haushalte schreiben ...
      if (!meineHaushalte.includes(data.haushalt_id as string)) {
        throw new KeinZugriff(
          `Kein Mitglied von Haushalt ${String(data.haushalt_id)}`,
        );
      }
      if (
        o.table === "listeneintraege" ||
        o.table === "vorratsbuchungen" ||
        o.table === "kaeufe" ||
        o.table === "rezepte"
      ) {
        data.erstellt_von = nutzerId;
      }
      const zeile = { ...data, id: o.id };
      const aenderbar = Object.keys(data).filter(
        (spalte) => spalte !== "haushalt_id" && spalte !== "erstellt_von",
      );
      // ... und eine bestehende Zeile mit derselben id nur überschreiben, wenn sie
      // im selben Haushalt liegt.
      await tx`
        insert into ${t} ${tx(zeile)}
        on conflict (id) do ${
          aenderbar.length > 0
            ? tx`update set ${tx(data, ...aenderbar)} where ${t}.haushalt_id = ${data.haushalt_id as string}`
            : tx`nothing`
        }
      `;
    }
  });
}
