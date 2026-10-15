import type { Einheit } from "@haushalt/db/einheiten";
import { erkenneKategorie } from "@haushalt/db/kategorie-erkennung";
import { findeNachName } from "@haushalt/db/namen";
import { type Packung, standardmaessigImVorrat } from "@haushalt/db/vorrat";
import type { Transaction } from "@powersync/web";
import { ersterBuchstabeGross } from "@/lib/farben";
import { istFertiggericht } from "./vorrat/gerichte";

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
    /** Packungsgröße für einen neuen Artikel (z. B. vom gescannten Barcode). */
    packung?: Packung | null;
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
  // Abgleich in JavaScript: SQLites lower() kennt keine Umlaute („Öl“ ≠ „öl“).
  // Auch „Zwiebel“ findet „Zwiebeln“ – die genaue Schreibweise hat Vorrang.
  const alle = await tx.getAll<{
    id: string;
    name: string;
    kategorie: string | null;
  }>(
    // Reste („Linsen-Dal“ im Kühlschrank) sind keine Einkaufsartikel.
    "SELECT id, name, kategorie FROM artikel WHERE haushalt_id = ? AND COALESCE(gericht, '') != 'rest'",
    [a.haushaltId],
  );
  const vorhanden = findeNachName(
    new Map(alle.map((x) => [x.name.trim().toLowerCase(), x])),
    name,
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
  const fertig = istFertiggericht(name, kategorie);
  await tx.execute(
    `INSERT INTO artikel (id, haushalt_id, name, kategorie, standardeinheit, im_vorrat, archiviert, angebrochen, packung_menge, packung_einheit, gericht, lagerort, erstellt_am)
     VALUES (?, ?, ?, ?, 'stueck', ?, 0, 0, ?, ?, ?, ?, ?)`,
    [
      id,
      a.haushaltId,
      name,
      kategorie,
      standardmaessigImVorrat(kategorie) ? 1 : 0,
      a.packung?.menge ?? null,
      a.packung?.einheit ?? null,
      // TK-Pizza & Co. landen im Vorrat gleich bei den Gerichten.
      fertig ? "fertig" : null,
      fertig ? "tk" : null,
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
