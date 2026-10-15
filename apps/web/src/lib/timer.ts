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

// Zahl oder Zahlwort („eine Minute“, „zwei Stunden“).
const ZAHL = String.raw`\d+(?:[.,]\d+)?|eine[nr]?|ein|zwei|drei|vier|fünf|zehn`;
const MUSTER = new RegExp(
  String.raw`(?<![a-zäöü])(${ZAHL})(?:\s*(?:-|–|bis)\s*(${ZAHL}))?\s*(Stunden|Stunde|Std\.?|Minuten|Minute|Min\.?|Sekunden|Sek\.?)(?![a-zäöü])`,
  "gi",
);
const ZAHLWORT: Record<string, number> = {
  ein: 1,
  eine: 1,
  einen: 1,
  einer: 1,
  zwei: 2,
  drei: 3,
  vier: 4,
  fünf: 5,
  zehn: 10,
};
const zahl = (text: string) =>
  ZAHLWORT[text.toLowerCase()] ?? Number(text.replace(",", "."));

export function findeZeitangaben(text: string): Zeitangabe[] {
  const ergebnis: Zeitangabe[] = [];
  for (const treffer of text.matchAll(MUSTER)) {
    const wert = zahl(treffer[2] ?? treffer[1] ?? "");
    const faktor =
      EINHEIT_SEKUNDEN.find(([m]) => m.test(treffer[3] ?? ""))?.[1] ?? 60;
    const sekunden = Math.round(wert * faktor);
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
