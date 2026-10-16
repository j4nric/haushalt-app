/** Hilfsfunktionen für Farben (Hex-Werte, wie sie <input type="color"> liefert). */

export function istHexFarbe(wert: unknown): wert is string {
  return typeof wert === "string" && /^#[0-9a-f]{6}$/i.test(wert);
}

/** Relative Helligkeit nach WCAG (0 = schwarz, 1 = weiß). */
function luminanz(hex: string): number {
  const kanal = (i: number) => {
    const c = Number.parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * kanal(1) + 0.7152 * kanal(3) + 0.0722 * kanal(5);
}

/** Kontrastverhältnis zweier Farben nach WCAG (1 bis 21). */
export function kontrast(a: string, b: string): number {
  const [hell, dunkel] = [luminanz(a), luminanz(b)].sort((x, y) => y - x) as [
    number,
    number,
  ];
  return (hell + 0.05) / (dunkel + 0.05);
}

export const TEXT_HELL = "#ffffff";
export const TEXT_DUNKEL = "#141a16";

/** Gut lesbare Textfarbe (fast schwarz oder weiß) auf dem angegebenen Hintergrund. */
export function textFarbeAuf(hintergrund: string): string {
  return kontrast(hintergrund, TEXT_HELL) >= kontrast(hintergrund, TEXT_DUNKEL)
    ? TEXT_HELL
    : TEXT_DUNKEL;
}

export function istDunkel(hex: string): boolean {
  return textFarbeAuf(hex) === TEXT_HELL;
}

// --- OKLCH (wahrnehmungsgleich: gleiche Helligkeit wirkt gleich hell) -------------

type Oklch = { l: number; c: number; h: number };

function linear(c: number) {
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}
function gamma(c: number) {
  return c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055;
}

export function hexZuOklch(hex: string): Oklch {
  const [r, g, b] = [1, 3, 5].map((i) =>
    linear(Number.parseInt(hex.slice(i, i + 2), 16) / 255),
  ) as [number, number, number];
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  const h = (Math.atan2(B, A) * 180) / Math.PI;
  return { l: L, c: Math.hypot(A, B), h: h < 0 ? h + 360 : h };
}

function oklchZuRgb({ l: L, c, h }: Oklch): [number, number, number] {
  const A = c * Math.cos((h * Math.PI) / 180);
  const B = c * Math.sin((h * Math.PI) / 180);
  const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3;
  const m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3;
  const s = (L - 0.0894841775 * A - 1.291485548 * B) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

/** Zurück nach Hex; liegt die Farbe außerhalb von sRGB, sinkt die Sättigung, bis sie passt. */
export function oklchZuHex(farbe: Oklch): string {
  let c = farbe.c;
  let rgb = oklchZuRgb({ ...farbe, c });
  while (c > 0 && rgb.some((k) => k < -0.0005 || k > 1.0005)) {
    c = Math.max(0, c - 0.005);
    rgb = oklchZuRgb({ ...farbe, c });
  }
  return `#${rgb
    .map((k) =>
      Math.round(
        Math.min(1, Math.max(0, gamma(Math.min(1, Math.max(0, k))))) * 255,
      )
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`;
}

/**
 * Rückt eine Farbe zum Akzent hin, damit alles zusammenpasst: Farbton um `anteil`
 * Richtung Akzent (kürzester Weg), Sättigung angeglichen. Die Helligkeit bleibt –
 * und damit die Lesbarkeit. Bei grauem Akzent (System) wird nur entsättigt.
 */
export function harmonisieren(
  farbe: string,
  akzent: string,
  anteil = 0.25,
): string {
  const f = hexZuOklch(farbe);
  const a = hexZuOklch(akzent);
  if (a.c < 0.03) {
    return oklchZuHex({ ...f, c: f.c * (1 - anteil * 1.6) });
  }
  const abstand = ((a.h - f.h + 540) % 360) - 180;
  return oklchZuHex({
    l: f.l,
    c: f.c + (Math.min(a.c, f.c * 1.2) - f.c) * anteil,
    h: (f.h + abstand * anteil + 360) % 360,
  });
}

/** „milch“ → „Milch“; der Rest bleibt, wie er getippt wurde („iPhone-Kabel“ bleibt). */
export function ersterBuchstabeGross(text: string): string {
  const getrimmt = text.trim();
  return getrimmt.charAt(0).toLocaleUpperCase("de-DE") + getrimmt.slice(1);
}
