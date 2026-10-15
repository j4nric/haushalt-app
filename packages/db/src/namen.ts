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
