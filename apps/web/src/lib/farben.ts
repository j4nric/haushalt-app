/** Hilfsfunktionen für Farben (Hex-Werte, wie sie <input type="color"> liefert). */

export function istHexFarbe(wert: unknown): wert is string {
  return typeof wert === "string" && /^#[0-9a-f]{6}$/i.test(wert);
}

/** Relative Helligkeit nach WCAG (0 = schwarz, 1 = weiß). */
export function luminanz(hex: string): number {
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

/** „milch“ → „Milch“; der Rest bleibt, wie er getippt wurde („iPhone-Kabel“ bleibt). */
export function ersterBuchstabeGross(text: string): string {
  const getrimmt = text.trim();
  return getrimmt.charAt(0).toLocaleUpperCase("de-DE") + getrimmt.slice(1);
}
