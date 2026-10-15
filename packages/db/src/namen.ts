/**
 * Gleiche Dinge, verschieden geschrieben: „Zwiebel“ und „Zwiebeln“, „Ei“ und „Eier“.
 * Für den Abgleich von Artikeln (Liste, Vorrat, Rezepte) – nicht für die Anzeige.
 * Abgewandelt wird nur das letzte Wort („Rote Zwiebeln“ = „Rote Zwiebel“).
 */

/** Unregelmäßige Formen, die die Endungs-Regeln nicht treffen. */
const PAARE: [string, string][] = [
  ["ei", "eier"],
  ["apfel", "äpfel"],
  ["nuss", "nüsse"],
  ["wurst", "würste"],
  ["saft", "säfte"],
  ["tomate", "tomaten"],
];

const ENDUNGEN = ["n", "en", "e", "s", "er", "nen"];

/** Alle Schreibweisen, die als derselbe Artikel gelten (klein, die eigene zuerst). */
export function namensVarianten(name: string): string[] {
  const normal = name.trim().toLowerCase().replace(/\s+/g, " ");
  const teile = normal.split(" ");
  const wort = teile.pop() ?? "";
  const vorne = teile.length > 0 ? `${teile.join(" ")} ` : "";
  const woerter = new Set([wort]);
  for (const endung of ENDUNGEN) {
    // Mindestens drei Buchstaben bleiben stehen. Seltsame Formen („rei“ aus „reis“)
    // stören nicht: Der Abgleich findet nur, was es als Artikel wirklich gibt.
    if (wort.endsWith(endung) && wort.length > endung.length + 2) {
      woerter.add(wort.slice(0, -endung.length));
    }
  }
  for (const endung of ["n", "en", "e", "s"]) {
    woerter.add(wort + endung);
  }
  for (const [a, b] of PAARE) {
    if (wort === a) {
      woerter.add(b);
    }
    if (wort === b) {
      woerter.add(a);
    }
  }
  return [...woerter].map((w) => vorne + w);
}

/** Findet in einer Zuordnung „kleiner Name → Wert“ den passenden Eintrag. */
export function findeNachName<T>(
  nachName: Map<string, T>,
  name: string,
): T | undefined {
  for (const v of namensVarianten(name)) {
    const treffer = nachName.get(v);
    if (treffer !== undefined) {
      return treffer;
    }
  }
  return undefined;
}

/**
 * Oberbegriffe, die für ihre Sorten stehen dürfen: „Öl“ im Vorrat reicht für
 * „Olivenöl“ im Rezept und umgekehrt. Bewusst eine kurze Liste – „Reis“ im Vorrat
 * macht noch keinen „Milchreis“, „Saft“ keinen „Apfelsaft“ zum Kochen.
 */
const OBERBEGRIFFE = [
  "öl",
  "essig",
  "mehl",
  "zucker",
  "brühe",
  "senf",
  "nudeln",
  "paprikapulver",
  "honig",
];

function oberbegriff(name: string): string | undefined {
  const klein = name.trim().toLowerCase();
  return OBERBEGRIFFE.find((o) => klein.endsWith(o));
}

/**
 * Wie `findeNachName`, aber für Rezept ↔ Vorrat: Steht nur der Oberbegriff auf einer
 * Seite („Öl“), passt jede Sorte auf der anderen („Rapsöl“, „Olivenöl“). Zwei
 * verschiedene Sorten („Rapsöl“ ↔ „Sesamöl“) passen nicht.
 */
export function findeImVorrat<T>(
  nachName: Map<string, T>,
  name: string,
): T | undefined {
  const direkt = findeNachName(nachName, name);
  if (direkt !== undefined) {
    return direkt;
  }
  const o = oberbegriff(name);
  if (!o) {
    return undefined;
  }
  const istOberbegriff = name.trim().toLowerCase() === o;
  if (!istOberbegriff) {
    // „Olivenöl“ gesucht → reicht „Öl“ im Vorrat?
    return nachName.get(o);
  }
  // „Öl“ gesucht → irgendeine Sorte im Vorrat.
  for (const [n, wert] of nachName) {
    if (n.endsWith(o)) {
      return wert;
    }
  }
  return undefined;
}
