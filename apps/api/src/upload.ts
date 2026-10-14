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
      data: Record<string, unknown>;
    }
  | { op: "DELETE"; table: Tabelle; id: string };

/**
 * Nur diese Tabellen und Spalten dürfen Clients schreiben. Jede Spalte hat
 * eine Umwandlung vom SQLite-Wert (Client) in den Postgres-Wert.
 */
const ERLAUBT = {
  listeneintraege: {
    name: (wert: unknown) => {
      if (typeof wert !== "string" || wert.trim() === "") {
        throw new UngueltigeOperation("name muss ein nicht-leerer Text sein");
      }
      return wert.trim();
    },
    // SQLite kennt keine Booleans: PowerSync liefert 0/1.
    erledigt: (wert: unknown) => wert === 1 || wert === true,
    erstellt_am: (wert: unknown) => {
      if (typeof wert !== "string" || Number.isNaN(Date.parse(wert))) {
        throw new UngueltigeOperation("erstellt_am muss ein ISO-Datum sein");
      }
      return wert;
    },
  },
} satisfies Record<string, Record<string, (wert: unknown) => unknown>>;

type Tabelle = keyof typeof ERLAUBT;

export class UngueltigeOperation extends Error {}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Prüft den Request-Body und wandelt ihn in sichere, typisierte Operationen um. */
export function parseOperationen(body: unknown): Operation[] {
  if (
    typeof body !== "object" ||
    body === null ||
    !Array.isArray((body as { operationen?: unknown }).operationen)
  ) {
    throw new UngueltigeOperation("Erwartet { operationen: [...] }");
  }
  return (body as { operationen: unknown[] }).operationen.map(
    (roh): Operation => {
      const { op, table, id, opData } = (roh ?? {}) as Record<string, unknown>;
      if (typeof table !== "string" || !Object.hasOwn(ERLAUBT, table)) {
        throw new UngueltigeOperation(
          `Tabelle nicht erlaubt: ${String(table)}`,
        );
      }
      const tabelle = table as Tabelle;
      if (typeof id !== "string" || !UUID.test(id)) {
        throw new UngueltigeOperation(`Ungültige id: ${String(id)}`);
      }
      if (op === "DELETE") {
        return { op, table: tabelle, id };
      }
      if (op !== "PUT" && op !== "PATCH") {
        throw new UngueltigeOperation(`Unbekannte Operation: ${String(op)}`);
      }
      const spalten: Record<string, (wert: unknown) => unknown> =
        ERLAUBT[tabelle];
      const data: Record<string, unknown> = {};
      for (const [spalte, wert] of Object.entries(
        (opData ?? {}) as Record<string, unknown>,
      )) {
        const umwandeln = spalten[spalte];
        if (!umwandeln) {
          throw new UngueltigeOperation(
            `Spalte nicht erlaubt: ${tabelle}.${spalte}`,
          );
        }
        data[spalte] = umwandeln(wert);
      }
      return { op, table: tabelle, id, data };
    },
  );
}

/** Wendet die Operationen in einer Transaktion an: alles oder nichts. */
export async function wendeAn(
  sql: postgres.Sql,
  operationen: Operation[],
): Promise<void> {
  await sql.begin(async (tx) => {
    for (const o of operationen) {
      if (o.op === "DELETE") {
        await tx`delete from ${tx(o.table)} where id = ${o.id}`;
      } else if (o.op === "PUT") {
        const zeile = { ...o.data, id: o.id } as Record<
          string,
          postgres.ParameterOrJSON<never>
        >;
        const spalten = Object.keys(o.data);
        await tx`
          insert into ${tx(o.table)} ${tx(zeile)}
          on conflict (id) do ${spalten.length > 0 ? tx`update set ${tx(o.data as Record<string, postgres.ParameterOrJSON<never>>, ...spalten)}` : tx`nothing`}
        `;
      } else if (Object.keys(o.data).length > 0) {
        await tx`update ${tx(o.table)} set ${tx(o.data as Record<string, postgres.ParameterOrJSON<never>>)} where id = ${o.id}`;
      }
    }
  });
}
