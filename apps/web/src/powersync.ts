import {
  type AbstractPowerSyncDatabase,
  column,
  type PowerSyncBackendConnector,
  PowerSyncDatabase,
  Schema,
  Table,
} from "@powersync/web";

/** Lokales Schema (SQLite im Browser). Spiegelt die Postgres-Tabelle. */
const listeneintraege = new Table({
  name: column.text,
  erledigt: column.integer, // 0/1, SQLite kennt keine Booleans
  erstellt_am: column.text,
});

export const schema = new Schema({ listeneintraege });

export type Listeneintrag = (typeof schema)["types"]["listeneintraege"];

/** PROTOTYP: Statt Login eine zufällige, im Browser gespeicherte Geräte-ID. */
function geraeteId(): string {
  const schluessel = "haushalt-geraete-id";
  let id = localStorage.getItem(schluessel);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(schluessel, id);
  }
  return id;
}

/** Verbindet die lokale Datenbank mit unserem Backend. */
class Connector implements PowerSyncBackendConnector {
  async fetchCredentials() {
    const antwort = await fetch(`/api/powersync/token?nutzer=${geraeteId()}`);
    if (!antwort.ok) {
      throw new Error(`Token konnte nicht geladen werden (${antwort.status})`);
    }
    return (await antwort.json()) as { endpoint: string; token: string };
  }

  /**
   * Schickt lokale Änderungen ans API. Wirft bei Fehlern, dann versucht
   * PowerSync es später erneut, z. B. sobald wieder Netz da ist.
   */
  async uploadData(db: AbstractPowerSyncDatabase) {
    const transaktion = await db.getNextCrudTransaction();
    if (!transaktion) {
      return;
    }
    const antwort = await fetch("/api/powersync/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        operationen: transaktion.crud.map(({ op, table, id, opData }) => ({
          op,
          table,
          id,
          opData,
        })),
      }),
    });
    if (!antwort.ok) {
      throw new Error(
        `Upload fehlgeschlagen (${antwort.status}): ${await antwort.text()}`,
      );
    }
    await transaktion.complete();
  }
}

export const db = new PowerSyncDatabase({
  schema,
  database: { dbFilename: "haushalt-prototyp.db" },
});

export function verbinden() {
  return db.connect(new Connector());
}
