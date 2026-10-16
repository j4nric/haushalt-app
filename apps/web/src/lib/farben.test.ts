import { describe, expect, it } from "vitest";
import {
  ersterBuchstabeGross,
  harmonisieren,
  hexZuOklch,
  istHexFarbe,
  kontrast,
  oklchZuHex,
  TEXT_DUNKEL,
  TEXT_HELL,
  textFarbeAuf,
} from "./farben";

describe("ersterBuchstabeGross", () => {
  it.each([
    ["milch", "Milch"],
    ["  äpfel ", "Äpfel"],
    ["Milch", "Milch"],
    ["tk-Erbsen", "Tk-Erbsen"],
    ["", ""],
  ])("%s → %s", (ein, aus) => {
    expect(ersterBuchstabeGross(ein)).toBe(aus);
  });
});

describe("Farben", () => {
  it("erkennt gültige Hex-Farben", () => {
    expect(istHexFarbe("#15803d")).toBe(true);
    expect(istHexFarbe("#FFF")).toBe(false);
    expect(istHexFarbe("rot")).toBe(false);
  });

  it("berechnet den Kontrast nach WCAG", () => {
    expect(kontrast("#000000", "#ffffff")).toBeCloseTo(21, 0);
    expect(kontrast("#ffffff", "#ffffff")).toBeCloseTo(1, 5);
  });

  it("wählt eine lesbare Textfarbe", () => {
    expect(textFarbeAuf("#ffffff")).toBe(TEXT_DUNKEL);
    expect(textFarbeAuf("#101418")).toBe(TEXT_HELL);
    expect(textFarbeAuf("#15803d")).toBe(TEXT_HELL);
    expect(textFarbeAuf("#fde68a")).toBe(TEXT_DUNKEL);
  });

  it("rechnet verlustarm zwischen Hex und OKLCH um", () => {
    for (const hex of ["#16a34a", "#db2777", "#0284c7", "#ffffff", "#000000"]) {
      expect(oklchZuHex(hexZuOklch(hex))).toBe(hex);
    }
  });

  it("rückt Farben zum Akzent, ohne die Helligkeit zu ändern", () => {
    const gruen = "#16a34a";
    const beere = harmonisieren(gruen, "#be185d");
    expect(istHexFarbe(beere)).toBe(true);
    expect(hexZuOklch(beere).l).toBeCloseTo(hexZuOklch(gruen).l, 2);
    expect(beere).not.toBe(gruen);
    // Grauer Akzent: nur weniger Sättigung, gleicher Farbton.
    const grau = hexZuOklch(harmonisieren(gruen, "#18181b"));
    expect(grau.c).toBeLessThan(hexZuOklch(gruen).c);
    expect(grau.h).toBeCloseTo(hexZuOklch(gruen).h, 0);
  });
});
