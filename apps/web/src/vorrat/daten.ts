import { kategorieName, kategorieRang } from "@haushalt/db/kategorien";
import { type Packung, packungVon } from "@haushalt/db/vorrat";

/** Ein Vorratsartikel mit Bestand (Packungen bzw. Stück). */
export type VorratsZeile = {
  id: string;
  name: string;
  kategorie: string | null;
  mindestbestand: number | null;
  packung_menge: number | null;
  packung_einheit: string | null;
  angebrochen: number;
  gericht: "fertig" | "rest" | null;
  lagerort: "kuehlschrank" | "tk" | null;
  eingelagert_am: string | null;
  bestand: number;
  auf_liste: number;
};

export const VORRAT_ABFRAGE = `SELECT a.id, a.name, a.kategorie, a.mindestbestand, a.packung_menge, a.packung_einheit,
       COALESCE(a.angebrochen, 0) AS angebrochen, a.gericht, a.lagerort, a.eingelagert_am,
       COALESCE((SELECT SUM(b.menge) FROM vorratsbuchungen b WHERE b.artikel_id = a.id), 0) AS bestand,
       EXISTS (SELECT 1 FROM listeneintraege l WHERE l.artikel_id = a.id AND l.erledigt = 0) AS auf_liste
  FROM artikel a
 WHERE a.haushalt_id = ? AND a.im_vorrat = 1
 ORDER BY a.name`;

/** Aufgegessene Reste verschwinden – sie waren ja einmalig. */
export const istSichtbar = (z: VorratsZeile) =>
  !(z.gericht === "rest" && z.bestand <= 0);

export function vorratVon(z: VorratsZeile): {
  bestand: number;
  angebrochen: boolean;
  packung: Packung | null;
} {
  return {
    bestand: Math.max(z.bestand, 0),
    angebrochen: Boolean(z.angebrochen),
    packung: packungVon(z),
  };
}

export const istKnapp = (z: VorratsZeile) =>
  z.mindestbestand != null && z.bestand < z.mindestbestand;
export const istLeer = (z: VorratsZeile) => z.bestand <= 0;

/** Ganze Zahl oder Komma: „2“, „1,5“ – ohne Tausenderpunkt (lässt sich wieder einlesen). */
export const stueck = (zahl: number) =>
  Math.max(zahl, 0).toLocaleString("de-DE", {
    maximumFractionDigits: 2,
    useGrouping: false,
  });

/**
 * Nach Kategorie in Supermarkt-Reihenfolge; in jeder Kategorie Vorhandenes zuerst,
 * Leeres ans Ende.
 */
export function gruppieren(
  zeilen: VorratsZeile[],
): [string, string | null, VorratsZeile[]][] {
  const sortiert = [...zeilen].sort(
    (a, b) =>
      kategorieRang(a.kategorie) - kategorieRang(b.kategorie) ||
      Number(istLeer(a)) - Number(istLeer(b)) ||
      a.name.localeCompare(b.name, "de"),
  );
  const gruppen = new Map<string, [string, string | null, VorratsZeile[]]>();
  for (const zeile of sortiert) {
    const name = kategorieName(zeile.kategorie);
    const gruppe = gruppen.get(name) ?? [name, zeile.kategorie, []];
    gruppe[2].push(zeile);
    gruppen.set(name, gruppe);
  }
  return [...gruppen.values()];
}
