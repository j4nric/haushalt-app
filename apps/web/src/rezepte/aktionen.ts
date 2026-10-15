import { erkenneKategorie } from "@haushalt/db/kategorie-erkennung";
import { standardmaessigImVorrat } from "@haushalt/db/vorrat";
import { type Zutat, zerlegeZutat, zutatAlsText } from "@haushalt/db/zutaten";
import type { AbstractPowerSyncDatabase, Transaction } from "@powersync/web";
import { ersterBuchstabeGross } from "@/lib/farben";

/**
 * Schreibende Aktionen für Rezepte – alle lokal (offline) und in einer Transaktion.
 */

export type RezeptDaten = {
  titel: string;
  portionen: number | null;
  quelle_url: string | null;
  bild_url: string | null;
  /** Ein Schritt je Zeile. */
  schritte: string;
  /** Eine Zutat je Zeile, wie eingegeben. */
  zutatenText: string;
};

export type GespeicherteZutat = Zutat & { id: string; position: number };

/** Zutaten-Textfeld → einzelne Zutaten (leere Zeilen fallen weg). */
export function zutatenAusText(text: string): Zutat[] {
  return text
    .split("\n")
    .map((z) => z.trim())
    .filter(Boolean)
    .map(zerlegeZutat);
}

/** Gespeicherte Zutaten → Textfeld zum Bearbeiten. */
export function zutatenAlsText(zutaten: Zutat[]): string {
  return zutaten
    .map((z) => zutatAlsText(z) + (z.zusatz ? `, ${z.zusatz}` : ""))
    .join("\n");
}

/** Legt ein Rezept an oder überschreibt es (Zutaten werden komplett ersetzt). */
export async function rezeptSpeichern(
  db: AbstractPowerSyncDatabase,
  {
    id,
    haushaltId,
    nutzerId,
    daten,
  }: {
    id: string | null;
    haushaltId: string;
    nutzerId: string;
    daten: RezeptDaten;
  },
): Promise<string> {
  const rezeptId = id ?? crypto.randomUUID();
  const schritte = daten.schritte
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean)
    .join("\n");
  await db.writeTransaction(async (tx) => {
    if (id) {
      await tx.execute(
        `UPDATE rezepte SET titel = ?, portionen = ?, quelle_url = ?, bild_url = ?, schritte = ?
          WHERE id = ?`,
        [
          daten.titel.trim(),
          daten.portionen,
          daten.quelle_url,
          daten.bild_url,
          schritte,
          id,
        ],
      );
      await tx.execute("DELETE FROM rezept_zutaten WHERE rezept_id = ?", [id]);
    } else {
      await tx.execute(
        `INSERT INTO rezepte (id, haushalt_id, titel, portionen, quelle_url, bild_url, schritte, erstellt_von, erstellt_am)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          rezeptId,
          haushaltId,
          daten.titel.trim(),
          daten.portionen,
          daten.quelle_url,
          daten.bild_url,
          schritte,
          nutzerId,
          new Date().toISOString(),
        ],
      );
    }
    await zutatenEinfuegen(
      tx,
      haushaltId,
      rezeptId,
      zutatenAusText(daten.zutatenText),
    );
  });
  return rezeptId;
}

async function zutatenEinfuegen(
  tx: Transaction,
  haushaltId: string,
  rezeptId: string,
  zutaten: Zutat[],
) {
  for (const [position, z] of zutaten.entries()) {
    await tx.execute(
      `INSERT INTO rezept_zutaten (id, haushalt_id, rezept_id, position, menge, einheit, name, zusatz)
       VALUES (uuid(), ?, ?, ?, ?, ?, ?, ?)`,
      [haushaltId, rezeptId, position, z.menge, z.einheit, z.name, z.zusatz],
    );
  }
}

/** Löscht ein Rezept; gibt eine Funktion zurück, die es wiederherstellt. */
export async function rezeptLoeschen(
  db: AbstractPowerSyncDatabase,
  id: string,
): Promise<() => Promise<void>> {
  const rezept = await db.getOptional<Record<string, unknown>>(
    "SELECT * FROM rezepte WHERE id = ?",
    [id],
  );
  const zutaten = await db.getAll<GespeicherteZutat>(
    "SELECT * FROM rezept_zutaten WHERE rezept_id = ? ORDER BY position",
    [id],
  );
  await db.writeTransaction(async (tx) => {
    await tx.execute("DELETE FROM rezept_zutaten WHERE rezept_id = ?", [id]);
    await tx.execute("DELETE FROM rezepte WHERE id = ?", [id]);
  });
  return async () => {
    if (!rezept) {
      return;
    }
    await db.writeTransaction(async (tx) => {
      const spalten = Object.keys(rezept);
      await tx.execute(
        `INSERT INTO rezepte (${spalten.join(", ")}) VALUES (${spalten.map(() => "?").join(", ")})`,
        spalten.map((s) => rezept[s]),
      );
      await zutatenEinfuegen(tx, String(rezept.haushalt_id), id, zutaten);
    });
  };
}

export type ListenZutat = {
  name: string;
  menge: number | null;
  einheit: "stueck" | "g" | "ml" | null;
};

/**
 * Setzt Zutaten auf die Einkaufsliste. Artikel werden über den Namen gefunden oder
 * neu angelegt (Kategorie wird erkannt); was schon offen auf der Liste steht, bleibt.
 * Gibt die Zahl der neuen Einträge zurück.
 */
export async function zutatenAufListe(
  db: AbstractPowerSyncDatabase,
  {
    haushaltId,
    nutzerId,
    zutaten,
  }: { haushaltId: string; nutzerId: string; zutaten: ListenZutat[] },
): Promise<number> {
  const jetzt = new Date().toISOString();
  return db.writeTransaction(async (tx) => {
    let neu = 0;
    for (const z of zutaten) {
      const name = ersterBuchstabeGross(z.name.trim());
      const vorhanden = await tx.getOptional<{ id: string }>(
        "SELECT id FROM artikel WHERE haushalt_id = ? AND lower(name) = lower(?)",
        [haushaltId, name],
      );
      let artikelId = vorhanden?.id;
      if (!artikelId) {
        artikelId = crypto.randomUUID();
        const kategorie = erkenneKategorie(name)[0] ?? null;
        await tx.execute(
          `INSERT INTO artikel (id, haushalt_id, name, kategorie, standardeinheit, im_vorrat, archiviert, erstellt_am)
           VALUES (?, ?, ?, ?, ?, ?, 0, ?)`,
          [
            artikelId,
            haushaltId,
            name,
            kategorie,
            z.einheit ?? "stueck",
            standardmaessigImVorrat(kategorie) ? 1 : 0,
            jetzt,
          ],
        );
      }
      await tx.execute(
        "UPDATE artikel SET archiviert = 0 WHERE id = ? AND archiviert = 1",
        [artikelId],
      );
      const offen = await tx.getOptional(
        "SELECT 1 FROM listeneintraege WHERE artikel_id = ? AND erledigt = 0",
        [artikelId],
      );
      if (offen) {
        continue;
      }
      await tx.execute(
        `INSERT INTO listeneintraege (id, haushalt_id, artikel_id, menge, einheit, erledigt, erstellt_von, erstellt_am)
         VALUES (uuid(), ?, ?, ?, ?, 0, ?, ?)`,
        [haushaltId, artikelId, z.menge, z.einheit, nutzerId, jetzt],
      );
      neu++;
    }
    return neu;
  });
}
