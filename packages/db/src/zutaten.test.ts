import { describe, expect, it } from "vitest";
import {
  formatiereZutatMenge,
  istGrundzutat,
  mengeFuerListe,
  zerlegeZutat,
  zutatAlsText,
} from "./zutaten";

describe("zerlegeZutat", () => {
  it.each([
    ["200 g Mehl", { menge: 200, einheit: "g", name: "Mehl", zusatz: null }],
    [
      "2 EL Olivenöl",
      { menge: 2, einheit: "EL", name: "Olivenöl", zusatz: null },
    ],
    ["1/2 TL Salz", { menge: 0.5, einheit: "TL", name: "Salz", zusatz: null }],
    [
      "1 ½ Zwiebeln",
      { menge: 1.5, einheit: null, name: "Zwiebeln", zusatz: null },
    ],
    [
      "1½ Zwiebeln",
      { menge: 1.5, einheit: null, name: "Zwiebeln", zusatz: null },
    ],
    [
      "1 1/2 l Milch",
      { menge: 1.5, einheit: "l", name: "Milch", zusatz: null },
    ],
    [
      "0,5 kg Kartoffeln",
      { menge: 0.5, einheit: "kg", name: "Kartoffeln", zusatz: null },
    ],
    [
      "2-3 Knoblauchzehen",
      { menge: 3, einheit: null, name: "Knoblauchzehen", zusatz: null },
    ],
    [
      "3 Eier (Größe M)",
      { menge: 3, einheit: null, name: "Eier", zusatz: "(Größe M)" },
    ],
    [
      "1 Dose gehackte Tomaten (400 g)",
      {
        menge: 1,
        einheit: "Dose",
        name: "gehackte Tomaten",
        zusatz: "(400 g)",
      },
    ],
    [
      "1 Zwiebel, fein gehackt",
      { menge: 1, einheit: null, name: "Zwiebel", zusatz: "fein gehackt" },
    ],
    [
      "1 Pck. Backpulver",
      { menge: 1, einheit: "Pck.", name: "Backpulver", zusatz: null },
    ],
    [
      "etwas Butter",
      { menge: null, einheit: null, name: "Butter", zusatz: "etwas" },
    ],
    [
      "Salz und Pfeffer",
      { menge: null, einheit: null, name: "Salz und Pfeffer", zusatz: null },
    ],
    [
      "Prise Muskat",
      { menge: null, einheit: "Prise", name: "Muskat", zusatz: null },
    ],
    [
      "- 2 Stk. Paprika",
      { menge: 2, einheit: "Stück", name: "Paprika", zusatz: null },
    ],
  ])("%s", (zeile, erwartet) => {
    expect(zerlegeZutat(zeile)).toEqual(erwartet);
  });

  it("verwechselt kurze Wörter ohne Menge nicht mit Einheiten", () => {
    // „g“/„l“ allein vor einem Wort ohne Zahl ist keine Einheit.
    expect(zerlegeZutat("L Käse").name).toBe("L Käse");
  });
});

describe("Anzeige und Umrechnen", () => {
  it("zeigt kleine Mengen als Bruch, große gerundet", () => {
    expect(formatiereZutatMenge(0.5)).toBe("½");
    expect(formatiereZutatMenge(1.5)).toBe("1½");
    expect(formatiereZutatMenge(2)).toBe("2");
    expect(formatiereZutatMenge(1.4)).toBe("1,4");
    expect(formatiereZutatMenge(333.3)).toBe("333");
  });

  it("rechnet Portionen um", () => {
    expect(zutatAlsText(zerlegeZutat("1 EL Olivenöl"), 1.5)).toBe(
      "1½ EL Olivenöl",
    );
    expect(zutatAlsText(zerlegeZutat("Salz"), 2)).toBe("Salz");
  });

  it("macht daraus Einkaufsmengen in g, ml oder Stück", () => {
    expect(mengeFuerListe(zerlegeZutat("0,5 kg Mehl"))).toEqual({
      menge: 500,
      einheit: "g",
    });
    expect(mengeFuerListe(zerlegeZutat("1 l Milch"), 0.5)).toEqual({
      menge: 500,
      einheit: "ml",
    });
    expect(mengeFuerListe(zerlegeZutat("3 Eier"), 0.5)).toEqual({
      menge: 2,
      einheit: "stueck",
    });
    expect(mengeFuerListe(zerlegeZutat("1 Dose Tomaten"))).toEqual({
      menge: 1,
      einheit: "stueck",
    });
    expect(mengeFuerListe(zerlegeZutat("2 EL Öl"))).toEqual({
      menge: null,
      einheit: null,
    });
    expect(mengeFuerListe(zerlegeZutat("Butter"))).toEqual({
      menge: null,
      einheit: null,
    });
  });

  it("erkennt Grundzutaten", () => {
    for (const name of [
      "Salz",
      "Pfeffer, schwarz",
      "Olivenöl",
      "Salz und Pfeffer",
      "Wasser",
    ]) {
      expect(istGrundzutat(name), name).toBe(true);
    }
    for (const name of ["Mehl", "Butter", "Salzstangen", "Ölsardinen"]) {
      expect(istGrundzutat(name), name).toBe(false);
    }
  });
});
