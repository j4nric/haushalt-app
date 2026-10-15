import {
  type AbstractPowerSyncDatabase,
  column,
  type PowerSyncBackendConnector,
  PowerSyncDatabase,
  Schema,
  Table,
} from "@powersync/web";
import { authClient } from "./auth";

/**
 * Lokales Schema (SQLite im Browser). Spiegelt die Postgres-Tabellen aus
 * packages/db; synchronisiert wird nur, was infra/powersync/sync-config.yaml freigibt.
 * SQLite kennt keine Booleans (0/1) und keine Zeitstempel (ISO-Text).
 */
export const schema = new Schema({
  haushalte: new Table({
    name: column.text,
    standard_portionen: column.integer,
    erstellt_am: column.text,
  }),
  haushalt_mitglieder: new Table({
    haushalt_id: column.text,
    nutzer_id: column.text,
    anzeigename: column.text,
    rolle: column.text,
    beigetreten_am: column.text,
  }),
  artikel: new Table({
    haushalt_id: column.text,
    name: column.text,
    kategorie: column.text,
    standardeinheit: column.text,
    im_vorrat: column.integer,
    archiviert: column.integer,
    mindestbestand: column.real,
    erstellt_am: column.text,
  }),
  vorratsbuchungen: new Table(
    {
      haushalt_id: column.text,
      artikel_id: column.text,
      menge: column.real,
      grund: column.text,
      listeneintrag_id: column.text,
      erstellt_von: column.text,
      erstellt_am: column.text,
    },
    {
      indexes: { artikel: ["artikel_id"], listeneintrag: ["listeneintrag_id"] },
    },
  ),
  kaeufe: new Table(
    {
      haushalt_id: column.text,
      artikel_id: column.text,
      listeneintrag_id: column.text,
      gekauft_am: column.text,
      erstellt_von: column.text,
    },
    {
      indexes: { artikel: ["artikel_id"], listeneintrag: ["listeneintrag_id"] },
    },
  ),
  rezepte: new Table({
    haushalt_id: column.text,
    titel: column.text,
    portionen: column.integer,
    quelle_url: column.text,
    bild_url: column.text,
    schritte: column.text,
    favorit: column.integer,
    schlagwoerter: column.text,
    erstellt_von: column.text,
    erstellt_am: column.text,
  }),
  rezept_zutaten: new Table(
    {
      haushalt_id: column.text,
      rezept_id: column.text,
      position: column.integer,
      menge: column.real,
      einheit: column.text,
      name: column.text,
      zusatz: column.text,
      gewuerz: column.integer,
    },
    { indexes: { rezept: ["rezept_id"] } },
  ),
  gekocht: new Table(
    {
      haushalt_id: column.text,
      rezept_id: column.text,
      gekocht_am: column.text,
      erstellt_von: column.text,
    },
    { indexes: { rezept: ["rezept_id"] } },
  ),
  plan_eintraege: new Table(
    {
      haushalt_id: column.text,
      datum: column.text,
      rezept_id: column.text,
      titel: column.text,
      portionen: column.integer,
      erledigt: column.integer,
      gekocht_id: column.text,
      erstellt_von: column.text,
      erstellt_am: column.text,
    },
    { indexes: { datum: ["datum"] } },
  ),
  listeneintraege: new Table({
    haushalt_id: column.text,
    artikel_id: column.text,
    menge: column.real,
    einheit: column.text,
    erledigt: column.integer,
    erstellt_von: column.text,
    erledigt_von: column.text,
    erstellt_am: column.text,
  }),
});

/** PowerSync läuft hinter derselben Adresse wie die App (Vite-Proxy bzw. Caddy). */
const POWERSYNC_URL =
  import.meta.env.VITE_POWERSYNC_URL ?? `${location.origin}/powersync`;

/** Verbindet die lokale Datenbank mit unserem Backend. */
class Connector implements PowerSyncBackendConnector {
  async fetchCredentials() {
    const { data, error } = await authClient.token();
    if (error) {
      // Nicht angemeldet: kein Sync. Andere Fehler (Netz) → PowerSync versucht es später erneut.
      if (error.status === 401) {
        return null;
      }
      throw new Error(`Token konnte nicht geladen werden (${error.status})`);
    }
    return { endpoint: POWERSYNC_URL, token: data.token };
  }

  /** Schickt lokale Änderungen ans API, eine Transaktion nach der anderen. */
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
    if (antwort.ok) {
      await transaktion.complete();
      return;
    }
    // 400/403: Das API lehnt die Änderung dauerhaft ab. Verwerfen, sonst blockiert sie
    // die Warteschlange für immer; beim nächsten Sync gilt wieder der Server-Stand.
    if (antwort.status === 400 || antwort.status === 403) {
      console.error(
        "Änderung vom Server abgelehnt und verworfen:",
        await antwort.text(),
        transaktion.crud,
      );
      await transaktion.complete();
      return;
    }
    // Netzwerk, 401, 5xx: später erneut versuchen.
    throw new Error(`Upload fehlgeschlagen (${antwort.status})`);
  }
}

export const db = new PowerSyncDatabase({
  schema,
  database: { dbFilename: "haushalt.db" },
});

export const verbinden = () => db.connect(new Connector());

/** Beim Abmelden: Verbindung trennen und alle lokalen Daten löschen. */
export const trennenUndLeeren = () => db.disconnectAndClear();
