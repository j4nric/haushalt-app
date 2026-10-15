import { namensVarianten } from "@haushalt/db/namen";
import { istGrundzutat } from "@haushalt/db/zutaten";

/**
 * „Reste verwerten“: Welche Rezepte nutzen möglichst viel von dem, was übrig ist?
 * Ein Begriff passt zu einer Zutat, wenn er (auch im Plural) als Wort darin vorkommt
 * oder das letzte Wort darauf endet: „Käse“ → „Bergkäse“, „Tomaten“ → „passierte
 * Tomaten“.
 */

export type ResteZutat = {
  name: string;
  gewuerz: number | null;
  optional?: number | null;
};

export type ResteTreffer<R> = {
  rezept: R;
  /** Welche Reste das Rezept verwendet (in der eingegebenen Schreibweise). */
  nutzt: string[];
  /** Was zusätzlich gebraucht wird – ohne Gewürze, Grundzutaten und Optionales. */
  fehlt: string[];
};

export function passt(zutat: string, begriff: string): boolean {
  const woerter = zutat
    .toLowerCase()
    .split(/[^a-zäöüß]+/)
    .filter(Boolean);
  const letztes = woerter.at(-1) ?? "";
  return namensVarianten(begriff).some(
    (v) =>
      woerter.includes(v) ||
      zutat.trim().toLowerCase() === v ||
      (v.length >= 4 && letztes.endsWith(v)),
  );
}

export function resteSuche<R>(
  rezepte: { rezept: R; zutaten: ResteZutat[] }[],
  reste: string[],
): ResteTreffer<R>[] {
  const begriffe = reste.map((r) => r.trim()).filter(Boolean);
  if (begriffe.length === 0) {
    return [];
  }
  const ergebnis: ResteTreffer<R>[] = [];
  for (const { rezept, zutaten } of rezepte) {
    const nutzt = begriffe.filter((b) => zutaten.some((z) => passt(z.name, b)));
    if (nutzt.length === 0) {
      continue;
    }
    const fehlt = zutaten
      .filter(
        (z) =>
          !z.gewuerz &&
          !z.optional &&
          !istGrundzutat(z.name) &&
          !begriffe.some((b) => passt(z.name, b)),
      )
      .map((z) => z.name);
    ergebnis.push({ rezept, nutzt, fehlt });
  }
  // Meiste Reste zuerst, dann am wenigsten Fehlendes.
  return ergebnis.sort(
    (a, b) =>
      b.nutzt.length - a.nutzt.length || a.fehlt.length - b.fehlt.length,
  );
}
