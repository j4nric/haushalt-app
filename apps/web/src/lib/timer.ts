/**
 * Zeitangaben in Rezeptschritten („15 Minuten köcheln“, „1 Std. ruhen lassen“) – in
 * der Kochansicht werden sie zu antippbaren Timern. Bei Spannen („10–12 Min.“) gilt
 * die längere Zeit.
 */

export type Zeitangabe = {
  /** Fundstelle im Text. */
  start: number;
  ende: number;
  text: string;
  sekunden: number;
};

const EINHEIT_SEKUNDEN: [RegExp, number][] = [
  [/^st/i, 3600],
  [/^se/i, 1],
  [/^m/i, 60],
];

const MUSTER =
  /(\d+(?:[.,]\d+)?)(?:\s*(?:-|–|bis)\s*(\d+(?:[.,]\d+)?))?\s*(Stunden|Stunde|Std\.?|Minuten|Minute|Min\.?|Sekunden|Sek\.?)(?![a-zäöü])/gi;

export function findeZeitangaben(text: string): Zeitangabe[] {
  const ergebnis: Zeitangabe[] = [];
  for (const treffer of text.matchAll(MUSTER)) {
    const zahl = Number((treffer[2] ?? treffer[1] ?? "").replace(",", "."));
    const faktor =
      EINHEIT_SEKUNDEN.find(([m]) => m.test(treffer[3] ?? ""))?.[1] ?? 60;
    const sekunden = Math.round(zahl * faktor);
    if (sekunden > 0 && sekunden <= 24 * 3600) {
      ergebnis.push({
        start: treffer.index,
        ende: treffer.index + treffer[0].length,
        text: treffer[0],
        sekunden,
      });
    }
  }
  return ergebnis;
}

/** 90 → „1:30“, 3700 → „1:01:40“. */
export function formatiereRestzeit(sekunden: number): string {
  const s = Math.max(0, Math.ceil(sekunden));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const rest = String(s % 60).padStart(2, "0");
  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${rest}` : `${m}:${rest}`;
}
