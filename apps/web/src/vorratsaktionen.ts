import type { Einheit } from "@haushalt/db/einheiten";
import { auffuellmenge, vorratsmenge } from "@haushalt/db/vorrat";
import type { Transaction } from "@powersync/web";

/**
 * Vorrat-Aktionen auf der lokalen Datenbank. Alle laufen innerhalb einer
 * Schreibtransaktion des Aufrufers und funktionieren damit auch offline.
 * Der Bestand ist immer die Summe der Buchungen (siehe packages/db/src/schema).
 */

type Grund = "einkauf" | "verbrauch" | "korrektur";

async function bestand(tx: Transaction, artikelId: string): Promise<number> {
  const zeile = await tx.get<{ bestand: number }>(
    "SELECT COALESCE(SUM(menge), 0) AS bestand FROM vorratsbuchungen WHERE artikel_id = ?",
    [artikelId],
  );
  return zeile.bestand;
}

export async function buchen(
  tx: Transaction,
  b: {
    haushaltId: string;
    artikelId: string;
    menge: number;
    grund: Grund;
    nutzerId: string;
    listeneintragId?: string;
  },
) {
  if (b.menge === 0) {
    return;
  }
  await tx.execute(
    `INSERT INTO vorratsbuchungen
       (id, haushalt_id, artikel_id, menge, grund, listeneintrag_id, erstellt_von, erstellt_am)
     VALUES (uuid(), ?, ?, ?, ?, ?, ?, ?)`,
    [
      b.haushaltId,
      b.artikelId,
      b.menge,
      b.grund,
      b.listeneintragId ?? null,
      b.nutzerId,
      new Date().toISOString(),
    ],
  );
}

/**
 * Listeneintrag abgehakt: Gekauftes in den Vorrat buchen, falls der Artikel im
 * Vorrat geführt wird und sich die Menge bestimmen lässt.
 * Gibt `false` zurück, wenn ein Vorratsartikel nicht gebucht werden konnte.
 */
export async function einkaufBuchen(
  tx: Transaction,
  listeneintragId: string,
  nutzerId: string,
) {
  const e = await tx.getOptional<{
    haushalt_id: string;
    artikel_id: string;
    menge: number | null;
    einheit: Einheit | null;
    im_vorrat: number;
    standardeinheit: Einheit;
  }>(
    `SELECT l.haushalt_id, l.artikel_id, l.menge, l.einheit, a.im_vorrat, a.standardeinheit
       FROM listeneintraege l JOIN artikel a ON a.id = l.artikel_id
      WHERE l.id = ?`,
    [listeneintragId],
  );
  if (!e?.im_vorrat) {
    return true;
  }
  const menge = vorratsmenge(e, e.standardeinheit);
  if (menge == null) {
    return false;
  }
  await buchen(tx, {
    haushaltId: e.haushalt_id,
    artikelId: e.artikel_id,
    menge,
    grund: "einkauf",
    nutzerId,
    listeneintragId,
  });
  return true;
}

/** Haken zurückgenommen: die Einkaufsbuchung dieses Eintrags wieder entfernen. */
export async function einkaufZuruecknehmen(
  tx: Transaction,
  listeneintragId: string,
  nutzerId: string,
) {
  const e = await tx.getOptional<{ artikel_id: string }>(
    "SELECT artikel_id FROM listeneintraege WHERE id = ?",
    [listeneintragId],
  );
  await tx.execute(
    "DELETE FROM vorratsbuchungen WHERE listeneintrag_id = ? AND grund = 'einkauf'",
    [listeneintragId],
  );
  if (e) {
    await mindestbestandPruefen(tx, e.artikel_id, nutzerId);
  }
}

/**
 * Liegt der Bestand unter dem Mindestbestand, kommt der Artikel auf die
 * Einkaufsliste – aufgefüllt bis zum Mindestbestand, aber nur, wenn er dort nicht
 * schon offen steht.
 */
export async function mindestbestandPruefen(
  tx: Transaction,
  artikelId: string,
  nutzerId: string,
) {
  const a = await tx.getOptional<{
    haushalt_id: string;
    im_vorrat: number;
    mindestbestand: number | null;
    standardeinheit: Einheit;
  }>(
    "SELECT haushalt_id, im_vorrat, mindestbestand, standardeinheit FROM artikel WHERE id = ?",
    [artikelId],
  );
  if (!a?.im_vorrat) {
    return;
  }
  const menge = auffuellmenge(await bestand(tx, artikelId), a.mindestbestand);
  if (menge == null) {
    return;
  }
  const offen = await tx.getOptional(
    "SELECT 1 FROM listeneintraege WHERE artikel_id = ? AND erledigt = 0",
    [artikelId],
  );
  if (offen) {
    return;
  }
  await tx.execute(
    `INSERT INTO listeneintraege (id, haushalt_id, artikel_id, menge, einheit, erledigt, erstellt_von, erstellt_am)
     VALUES (uuid(), ?, ?, ?, ?, 0, ?, ?)`,
    [
      a.haushalt_id,
      artikelId,
      menge,
      a.standardeinheit,
      nutzerId,
      new Date().toISOString(),
    ],
  );
}

/** Bestand auf einen Wert setzen (Inventur): bucht die Differenz als Korrektur. */
export async function bestandSetzen(
  tx: Transaction,
  b: { haushaltId: string; artikelId: string; neu: number; nutzerId: string },
) {
  const differenz =
    Math.round((b.neu - (await bestand(tx, b.artikelId))) * 1000) / 1000;
  await buchen(tx, {
    haushaltId: b.haushaltId,
    artikelId: b.artikelId,
    menge: differenz,
    grund: "korrektur",
    nutzerId: b.nutzerId,
  });
  await mindestbestandPruefen(tx, b.artikelId, b.nutzerId);
}
