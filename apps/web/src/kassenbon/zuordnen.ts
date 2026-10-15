import { findeNachName } from "@haushalt/db/namen";

/**
 * Bon-Text → Artikel des Haushalts. Kassen kürzen und schreiben groß ohne Umlaute
 * („ROSENBROE. HELL“, „BIO WEIDEMILCH“). Reihenfolge: gelernte Zuordnung (exakt),
 * dann Wortanfang („rosenbroe“ → „Rosenbrötchen“), Wortende („weidemilch“ → „Milch“).
 */

type Artikel = { id: string; name: string };

/** Klein, Umlaute ausgeschrieben, nur Buchstaben und Leerzeichen. */
export function normalisieren(text: string): string {
  return text
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Wörter ohne Aussagekraft für die Zuordnung (Verpackung, Bio, Größe …). */
const FUELLWOERTER = new Set([
  "bio",
  "fl",
  "pet",
  "ds",
  "gl",
  "btl",
  "pck",
  "pckg",
  "st",
  "stk",
  "kg",
  "g",
  "l",
  "ml",
  "x",
  "mw",
  "ew",
  "frisch",
]);

const woerter = (text: string) =>
  normalisieren(text)
    .split(" ")
    .filter((w) => w.length > 1 && !FUELLWOERTER.has(w));

export function bonSchluessel(text: string): string {
  return text.trim().replace(/\s+/g, " ").toUpperCase();
}

export type Treffer = { artikel: Artikel; sicher: boolean };

export function zuordnen(
  bonText: string,
  artikel: Artikel[],
  gelernt: Map<string, string>,
): Treffer | null {
  const gemerkt = gelernt.get(bonSchluessel(bonText));
  const bekannt = gemerkt ? artikel.find((a) => a.id === gemerkt) : undefined;
  if (bekannt) {
    return { artikel: bekannt, sicher: true };
  }
  const bon = woerter(bonText);
  if (bon.length === 0) {
    return null;
  }
  // Genau so heißt ein Artikel (auch Plural/Singular): sicher.
  const vorschlag = namensVorschlag(bonText);
  const genau = findeNachName(
    new Map(artikel.map((a) => [a.name.trim().toLowerCase(), a])),
    vorschlag,
  );
  if (genau) {
    return { artikel: genau, sicher: true };
  }
  let bester: { a: Artikel; punkte: number } | null = null;
  for (const a of artikel) {
    const art = woerter(a.name);
    let punkte = 0;
    for (const b of bon) {
      for (const w of art) {
        if (b === w) {
          punkte = Math.max(punkte, 80);
        } else if (b.length >= 4 && w.startsWith(b)) {
          // Gekürzt: „rosenbroe“ → „rosenbroetchen“
          punkte = Math.max(punkte, 70);
        } else if (w.length >= 4 && b.endsWith(w)) {
          // Zusammengesetzt: „weidemilch“ → „milch“
          punkte = Math.max(punkte, 60 + Math.min(w.length, 10));
        }
      }
    }
    if (
      punkte >= 60 &&
      (!bester ||
        punkte > bester.punkte ||
        (punkte === bester.punkte && a.name.length < bester.a.name.length))
    ) {
      bester = { a, punkte };
    }
  }
  return bester ? { artikel: bester.a, sicher: bester.punkte >= 80 } : null;
}

/**
 * Lesbarer Name für einen neuen Artikel: „BIO WEIDEMILCH“ → „Bio Weidemilch“,
 * „KAROTTENKRUEST.“ → „Karottenkrüst“. Nur ein Vorschlag – änderbar.
 */
export function namensVorschlag(bonText: string): string {
  return bonText
    .replace(/\d+([.,]\d+)?\s*(kg|g|l|ml|%)?/gi, " ")
    .split(/\s+/)
    .map((w) => w.replace(/\.+$/, ""))
    .filter(
      (w) =>
        (w.length > 1 && !FUELLWOERTER.has(w.toLowerCase())) ||
        /^bio$/i.test(w),
    )
    .map((w) => {
      const umlaute = w
        .toUpperCase()
        .replace(/(?<![AEIOUQ])AE/g, "Ä")
        .replace(/(?<![AEIOUQ])OE/g, "Ö")
        .replace(/(?<![AEIOUQ])UE/g, "Ü");
      return umlaute.charAt(0) + umlaute.slice(1).toLowerCase();
    })
    .join(" ")
    .trim();
}
