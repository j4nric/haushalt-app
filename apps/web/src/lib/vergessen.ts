import { zeitWert } from "./zeit";

/**
 * „Du hast wahrscheinlich vergessen …“: Aus der Kaufhistorie eines Artikels wird
 * geschätzt, wie oft er gekauft wird (Median der Abstände). Liegt der letzte Kauf
 * deutlich länger zurück, gilt er als überfällig.
 */

const TAG_MS = 86_400_000;

/** Mindestens so viele verschiedene Kauftage, bevor geschätzt wird. */
const MIN_KAUFTAGE = 3;

export type Kaufverlauf = {
  id: string;
  name: string;
  kategorie: string | null;
  /** Kaufzeitpunkte als ISO-Text, beliebige Reihenfolge. */
  kaeufe: string[];
};

export type Ueberfaellig = Omit<Kaufverlauf, "kaeufe"> & {
  /** Üblicher Abstand zwischen zwei Käufen in Tagen (mindestens 1). */
  abstandTage: number;
  /** Ganze Tage seit dem letzten Kauf. */
  seitTage: number;
  /** Letzter Kauf (ISO) – zum Merken, dass die Erinnerung weggetippt wurde. */
  letzterKauf: string;
};

/** Üblicher Kaufabstand und letzter Kauf; `null`, solange es zu wenig Käufe gibt. */
export function kaufrhythmus(
  kaeufe: string[],
): { abstandTage: number; letzterKauf: string } | null {
  const zeiten = kaeufe
    .map((k) => ({ k, t: zeitWert(k) }))
    .filter(({ t }) => Number.isFinite(t))
    .sort((a, b) => a.t - b.t);
  // Mehrere Käufe am selben Tag zählen einmal.
  const tage = [...new Set(zeiten.map(({ t }) => Math.floor(t / TAG_MS)))];
  const letzter = zeiten.at(-1);
  if (tage.length < MIN_KAUFTAGE || !letzter) {
    return null;
  }
  const abstaende = tage
    .slice(1)
    .map((tag, i) => tag - (tage[i] ?? tag))
    .sort((a, b) => a - b);
  const mitte = Math.floor(abstaende.length / 2);
  const median =
    abstaende.length % 2
      ? (abstaende[mitte] ?? 1)
      : ((abstaende[mitte - 1] ?? 1) + (abstaende[mitte] ?? 1)) / 2;
  return {
    abstandTage: Math.max(1, Math.round(median)),
    letzterKauf: letzter.k,
  };
}

/**
 * Überfällige Artikel, die dringendsten zuerst. Überfällig heißt: mindestens das
 * Anderthalbfache des üblichen Abstands (und mindestens einen Tag mehr). Wer etwas
 * viel länger nicht gekauft hat, braucht es vermutlich nicht mehr – dann keine
 * Erinnerung.
 */
export function ueberfaellige(
  artikel: Kaufverlauf[],
  jetzt: number = Date.now(),
  hoechstens = 3,
): Ueberfaellig[] {
  const ergebnis: Ueberfaellig[] = [];
  for (const { kaeufe, ...rest } of artikel) {
    const rhythmus = kaufrhythmus(kaeufe);
    if (!rhythmus) {
      continue;
    }
    const { abstandTage } = rhythmus;
    const seitTage = Math.floor(
      (jetzt - zeitWert(rhythmus.letzterKauf)) / TAG_MS,
    );
    const ab = Math.max(Math.ceil(abstandTage * 1.5), abstandTage + 1);
    const bis = abstandTage * 4 + 7;
    if (seitTage >= ab && seitTage <= bis) {
      ergebnis.push({ ...rest, ...rhythmus, seitTage });
    }
  }
  return ergebnis
    .sort((a, b) => b.seitTage / b.abstandTage - a.seitTage / a.abstandTage)
    .slice(0, hoechstens);
}
