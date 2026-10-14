import type { Einheit } from "./einheiten";
import type { Kategorie } from "./kategorien";

/**
 * Kategorien, deren Artikel neu angelegt standardmäßig im Vorrat geführt werden.
 * Frisches (Obst, Brot, Milchprodukte, Fleisch) zählt man meist nicht nach.
 * Pro Artikel lässt sich das jederzeit umstellen.
 */
export const VORRAT_KATEGORIEN: readonly Kategorie[] = [
  "vorrat",
  "suesses_snacks",
  "getraenke",
  "tiefkuehl",
  "drogerie",
  "haushalt",
];

export function standardmaessigImVorrat(
  kategorie: string | null | undefined,
): boolean {
  return VORRAT_KATEGORIEN.includes(kategorie as Kategorie);
}

/**
 * Wie viel ein gekaufter Listeneintrag im Vorrat ausmacht, in der Standardeinheit
 * des Artikels. `null` heißt: nicht automatisch buchbar.
 *
 * - Gleiche Einheit → die Menge
 * - Keine Menge, Standardeinheit Stück → 1 Stück
 * - Keine Menge bei g/ml, oder abweichende Einheit → null (Umrechnungen gibt es noch nicht)
 */
export function vorratsmenge(
  eintrag: { menge: number | null; einheit: Einheit | null },
  standardeinheit: Einheit,
): number | null {
  if (eintrag.menge == null || eintrag.menge <= 0) {
    return standardeinheit === "stueck" ? 1 : null;
  }
  const einheit = eintrag.einheit ?? "stueck";
  return einheit === standardeinheit ? eintrag.menge : null;
}

/**
 * Menge, die auf die Einkaufsliste soll, wenn der Bestand unter den Mindestbestand
 * fällt: so viel, dass der Mindestbestand wieder erreicht ist. Sonst `null`.
 */
export function auffuellmenge(
  bestand: number,
  mindestbestand: number | null,
): number | null {
  if (
    mindestbestand == null ||
    mindestbestand <= 0 ||
    bestand >= mindestbestand
  ) {
    return null;
  }
  // Gleitkomma-Reste aus Summen wie 0.1 + 0.2 abschneiden.
  return Math.round((mindestbestand - Math.max(bestand, 0)) * 1000) / 1000;
}
