import type { Einheit } from "@haushalt/db/einheiten";
import {
  auffuellmenge,
  eingekauftePackungen,
  gelerntePackung,
  packungVon,
} from "@haushalt/db/vorrat";
import type { Transaction } from "@powersync/web";

/**
 * Vorrat-Aktionen auf der lokalen Datenbank. Alle laufen innerhalb einer
 * Schreibtransaktion des Aufrufers und funktionieren damit auch offline.
 * Der Bestand ist immer die Summe der Buchungen (siehe packages/db/src/schema) und
 * zählt Packungen bzw. Stück; eine offene Packung ist nur markiert (`angebrochen`).
 */

type Grund = "einkauf" | "verbrauch" | "korrektur";

async function bestand(tx: Transaction, artikelId: string): Promise<number> {
  const zeile = await tx.get<{ bestand: number }>(
    "SELECT COALESCE(SUM(menge), 0) AS bestand FROM vorratsbuchungen WHERE artikel_id = ?",
    [artikelId],
  );
  return zeile.bestand;
}

export async function bestandVon(tx: Transaction, artikelId: string) {
  return bestand(tx, artikelId);
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
  // Ist nichts mehr da, ist auch nichts mehr offen.
  if ((await bestand(tx, b.artikelId)) <= 0) {
    await angebrochenSetzen(tx, b.artikelId, false);
  }
}

export async function angebrochenSetzen(
  tx: Transaction,
  artikelId: string,
  an: boolean,
) {
  await tx.execute(
    "UPDATE artikel SET angebrochen = ? WHERE id = ? AND COALESCE(angebrochen, 0) <> ?",
    [an ? 1 : 0, artikelId, an ? 1 : 0],
  );
}

/**
 * Eine Packung verbraucht („−“). War eine offen, ist es die – danach ist keine
 * mehr offen.
 */
export async function einsVerbrauchen(
  tx: Transaction,
  b: { haushaltId: string; artikelId: string; nutzerId: string },
) {
  const vorher = await bestand(tx, b.artikelId);
  if (vorher <= 0) {
    return;
  }
  await buchen(tx, {
    ...b,
    menge: -Math.min(1, vorher),
    grund: "verbrauch",
  });
  await angebrochenSetzen(tx, b.artikelId, false);
  await mindestbestandPruefen(tx, b.artikelId, b.nutzerId);
}

/**
 * Listeneintrag abgehakt: Gekauftes in den Vorrat buchen, falls der Artikel im
 * Vorrat geführt wird – in Packungen bzw. Stück. Der erste Einkauf mit Gewicht
 * („1 kg Mehl“) merkt sich die Packungsgröße.
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
    packung_menge: number | null;
    packung_einheit: string | null;
  }>(
    `SELECT l.haushalt_id, l.artikel_id, l.menge, l.einheit, a.im_vorrat, a.packung_menge, a.packung_einheit
       FROM listeneintraege l JOIN artikel a ON a.id = l.artikel_id
      WHERE l.id = ?`,
    [listeneintragId],
  );
  if (!e?.im_vorrat) {
    return;
  }
  const packung = packungVon(e);
  const gelernt = gelerntePackung(e, packung);
  if (gelernt) {
    await tx.execute(
      "UPDATE artikel SET packung_menge = ?, packung_einheit = ? WHERE id = ?",
      [gelernt.menge, gelernt.einheit, e.artikel_id],
    );
  }
  await buchen(tx, {
    haushaltId: e.haushalt_id,
    artikelId: e.artikel_id,
    menge: eingekauftePackungen(e, packung ?? gelernt),
    grund: "einkauf",
    nutzerId,
    listeneintragId,
  });
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
  }>(
    "SELECT haushalt_id, im_vorrat, mindestbestand FROM artikel WHERE id = ?",
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
      Math.ceil(menge - 1e-9),
      "stueck",
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

/**
 * Artikel ganz löschen – mit Bestand, Verlauf, Barcodes und offenen Listeneinträgen.
 * Der Server löscht Abhängiges ohnehin mit (Fremdschlüssel); lokal gibt es die nicht.
 */
export async function artikelLoeschen(tx: Transaction, artikelId: string) {
  for (const tabelle of [
    "vorratsbuchungen",
    "kaeufe",
    "artikel_barcodes",
    "bon_artikel",
    "listeneintraege",
  ]) {
    await tx.execute(`DELETE FROM ${tabelle} WHERE artikel_id = ?`, [
      artikelId,
    ]);
  }
  await tx.execute("DELETE FROM artikel WHERE id = ?", [artikelId]);
}
