import type { Einheit } from "@haushalt/db/einheiten";
import { erkenneKategorie } from "@haushalt/db/kategorie-erkennung";
import { namensVarianten } from "@haushalt/db/namen";
import { standardmaessigImVorrat } from "@haushalt/db/vorrat";
import type { Transaction } from "@powersync/web";
import { ersterBuchstabeGross } from "@/lib/farben";

/**
 * Bausteine für alles, was etwas auf die Einkaufsliste setzt (Eingabe, Verlauf,
 * Rezepte, Woche). Laufen in der Schreibtransaktion des Aufrufers, also offline.
 */

/**
 * Artikel über den Namen finden (ohne Groß/klein) oder neu anlegen. Ohne angegebene
 * Kategorie wird sie aus dem Namen erkannt. Ein ausgeblendeter Artikel wird wieder
 * sichtbar – wer ihn einträgt, braucht ihn offenbar.
 */
export async function artikelFindenOderAnlegen(
  tx: Transaction,
  a: {
    haushaltId: string;
    name: string;
    kategorie?: string | null;
    standardeinheit?: Einheit | null;
    /** Text für die Kategorie-Erkennung, wenn er mehr verrät als der Name („Dose Tomaten“). */
    erkennenAls?: string;
  },
): Promise<{
  id: string;
  name: string;
  kategorie: string | null;
  neu: boolean;
}> {
  const name = ersterBuchstabeGross(a.name.trim());
  // Auch „Zwiebel“ findet „Zwiebeln“ – die genaue Schreibweise hat Vorrang.
  const varianten = namensVarianten(name);
  const vorhanden = await tx.getOptional<{
    id: string;
    name: string;
    kategorie: string | null;
  }>(
    `SELECT id, name, kategorie FROM artikel
      WHERE haushalt_id = ? AND lower(name) IN (${varianten.map(() => "?").join(", ")})
      ORDER BY lower(name) = ? DESC LIMIT 1`,
    [a.haushaltId, ...varianten, varianten[0]],
  );
  if (vorhanden) {
    await tx.execute(
      "UPDATE artikel SET archiviert = 0 WHERE id = ? AND archiviert = 1",
      [vorhanden.id],
    );
    return { ...vorhanden, neu: false };
  }
  const id = crypto.randomUUID();
  const kategorie =
    a.kategorie === undefined
      ? (erkenneKategorie(a.erkennenAls ?? name)[0] ?? null)
      : a.kategorie || null;
  await tx.execute(
    `INSERT INTO artikel (id, haushalt_id, name, kategorie, standardeinheit, im_vorrat, archiviert, erstellt_am)
     VALUES (?, ?, ?, ?, ?, ?, 0, ?)`,
    [
      id,
      a.haushaltId,
      name,
      kategorie,
      a.standardeinheit ?? "stueck",
      standardmaessigImVorrat(kategorie) ? 1 : 0,
      new Date().toISOString(),
    ],
  );
  return { id, name, kategorie, neu: true };
}

/**
 * Setzt einen Artikel auf die Liste – außer er steht dort schon offen.
 * Gibt zurück, ob ein neuer Eintrag entstanden ist.
 */
export async function aufListeSetzen(
  tx: Transaction,
  e: {
    haushaltId: string;
    nutzerId: string;
    artikelId: string;
    menge?: number | null;
    einheit?: Einheit | null;
  },
): Promise<boolean> {
  const offen = await tx.getOptional(
    "SELECT 1 FROM listeneintraege WHERE artikel_id = ? AND erledigt = 0",
    [e.artikelId],
  );
  if (offen) {
    return false;
  }
  await tx.execute(
    `INSERT INTO listeneintraege (id, haushalt_id, artikel_id, menge, einheit, erledigt, erstellt_von, erstellt_am)
     VALUES (uuid(), ?, ?, ?, ?, 0, ?, ?)`,
    [
      e.haushaltId,
      e.artikelId,
      e.menge ?? null,
      e.einheit ?? null,
      e.nutzerId,
      new Date().toISOString(),
    ],
  );
  return true;
}
