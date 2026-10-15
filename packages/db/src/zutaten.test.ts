import { describe, expect, it } from "vitest";
import {
  formatiereZutatMenge,
  istGewuerz,
  istGrundzutat,
  mengeFuerListe,
  zeileAlsText,
  zerlegeZeile,
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

  it.each([
    [
      "Spaghetti 400g",
      { menge: 400, einheit: "g", name: "Spaghetti", zusatz: null },
    ],
    [
      "Spaghetti 400 g",
      { menge: 400, einheit: "g", name: "Spaghetti", zusatz: null },
    ],
    ["Milch 1,5 l", { menge: 1.5, einheit: "l", name: "Milch", zusatz: null }],
    [
      "Bio Eier 10",
      { menge: 10, einheit: null, name: "Bio Eier", zusatz: null },
    ],
    [
      "Tomaten: 2 Dosen",
      { menge: 2, einheit: "Dose", name: "Tomaten", zusatz: null },
    ],
    [
      "Mehl 500g (Type 405)",
      { menge: 500, einheit: "g", name: "Mehl", zusatz: "(Type 405)" },
    ],
    [
      "400g Spaghetti",
      { menge: 400, einheit: "g", name: "Spaghetti", zusatz: null },
    ],
  ])("Menge hinten oder ohne Leerzeichen: %s", (zeile, erwartet) => {
    expect(zerlegeZutat(zeile)).toEqual(erwartet);
  });

  it("nimmt Zahlen mit anderen Wörtern dahinter nicht als Menge", () => {
    expect(zerlegeZutat("Gouda 45 Prozent")).toMatchObject({
      menge: null,
      name: "Gouda 45 Prozent",
    });
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

  it("setzt Einheiten in die Mehrzahl", () => {
    expect(zutatAlsText(zerlegeZutat("Kidneybohnen 2 Dosen"))).toBe(
      "2 Dosen Kidneybohnen",
    );
    expect(zutatAlsText(zerlegeZutat("1 Dose Mais"), 2)).toBe("2 Dosen Mais");
    expect(zutatAlsText(zerlegeZutat("2 Dosen Mais"), 0.5)).toBe("1 Dose Mais");
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

describe("istGewuerz", () => {
  it.each([
    ["Salz", true],
    ["Salz und Pfeffer", true],
    ["1 TL Paprikapulver", true],
    ["1 Prise Muskat", true],
    ["2 Lorbeerblätter", false],
    ["Lorbeerblätter", true],
    ["1 TL Paprika, edelsüß", true],
    ["2 Paprika", false],
    ["Paprika", false],
    ["1 Bund Petersilie", false],
    ["1 EL Petersilie, frisch gehackt", false],
    ["100 g Salz", false],
    ["Salzstangen", false],
    ["Zimtschnecken", false],
  ])("%s → %s", (zeile, erwartet) => {
    expect(istGewuerz(zerlegeZutat(zeile))).toBe(erwartet);
  });
});

describe("optionale Zutaten", () => {
  it("erkennt Zeilen in Klammern als optional und zerlegt sie wie sonst", () => {
    expect(zerlegeZeile("(100g Salami)")).toEqual({
      menge: 100,
      einheit: "g",
      name: "Salami",
      zusatz: null,
      optional: true,
    });
    expect(zerlegeZeile("( 1 Prise Chili )")).toMatchObject({
      menge: 1,
      einheit: "Prise",
      name: "Chili",
      optional: true,
    });
    expect(zerlegeZeile("1 Dose Tomaten (400 g)")).toMatchObject({
      name: "Tomaten",
      zusatz: "(400 g)",
      optional: false,
    });
  });

  it("schreibt optionale wieder in Klammern", () => {
    expect(zeileAlsText(zerlegeZeile("(100g Salami)"))).toBe("(100 g Salami)");
    expect(zeileAlsText(zerlegeZeile("(1 Zwiebel, gewürfelt)"))).toBe(
      "(1 Zwiebel, gewürfelt)",
    );
    expect(zeileAlsText(zerlegeZeile("Salz"))).toBe("Salz");
  });
});
