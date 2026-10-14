/**
 * Kategorien für Artikel, in der Reihenfolge eines typischen Wegs durch den
 * Supermarkt. Die Einkaufsliste wird in dieser Reihenfolge gruppiert.
 */
export const KATEGORIEN = [
  { id: "obst_gemuese", name: "Obst & Gemüse" },
  { id: "milch_kaese", name: "Milch & Käse" },
  { id: "fleisch_fisch", name: "Fleisch & Fisch" },
  { id: "brot_backwaren", name: "Brot & Backwaren" },
  { id: "suesses_snacks", name: "Süßes & Snacks" },
  { id: "vorrat", name: "Vorrat & Konserven" },
  { id: "getraenke", name: "Getränke" },
  { id: "tiefkuehl", name: "Tiefkühl" },
  { id: "drogerie", name: "Drogerie" },
  { id: "haushalt", name: "Haushalt" },
] as const;

export type Kategorie = (typeof KATEGORIEN)[number]["id"];

export const KATEGORIE_IDS: readonly Kategorie[] = KATEGORIEN.map((k) => k.id);

/** Artikel ohne Kategorie landen am Ende unter diesem Namen. */
export const OHNE_KATEGORIE = "Sonstiges";

export function kategorieName(id: string | null | undefined): string {
  return KATEGORIEN.find((k) => k.id === id)?.name ?? OHNE_KATEGORIE;
}

/** Sortierschlüssel: Position im Supermarkt, unbekannte/leere Kategorien zuletzt. */
export function kategorieRang(id: string | null | undefined): number {
  const index = KATEGORIE_IDS.indexOf(id as Kategorie);
  return index === -1 ? KATEGORIE_IDS.length : index;
}
