import { describe, expect, it } from "vitest";
import {
  ersterBuchstabeGross,
  istHexFarbe,
  kontrast,
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
});
