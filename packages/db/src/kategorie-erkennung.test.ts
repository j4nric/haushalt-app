import { describe, expect, it } from "vitest";
import { erkenneKategorie } from "./kategorie-erkennung";

describe("erkenneKategorie", () => {
  it.each([
    ["Milch", "milch_kaese"],
    ["Bananen", "obst_gemuese"],
    ["Kartoffeln", "obst_gemuese"],
    ["Nudeln", "vorrat"],
    ["Zahnpasta", "drogerie"],
    ["Spülmittel", "haushalt"],
    ["Fischstäbchen", "tiefkuehl"],
  ])("erkennt %s eindeutig", (name, kategorie) => {
    expect(erkenneKategorie(name)).toEqual([kategorie]);
  });

  it.each([
    ["Vollkornbrot", "brot_backwaren"],
    ["Bergkäse", "milch_kaese"],
    ["Apfelsaft", "getraenke"],
    ["Erdbeerjoghurt", "milch_kaese"],
    ["Schweinefleisch", "fleisch_fisch"],
    ["Milchreis", "vorrat"],
    ["Sprudelwasser", "getraenke"],
  ])("erkennt das Kompositum %s am Wortende", (name, kategorie) => {
    expect(erkenneKategorie(name)).toEqual([kategorie]);
  });

  it.each([
    ["Ricotta", "milch_kaese"],
    ["Pizzateig", "milch_kaese"],
    ["Orzo", "vorrat"],
    ["Apfelmus", "vorrat"],
    ["Ciabatta", "brot_backwaren"],
    ["Pak Choi", "obst_gemuese"],
    ["Chorizo", "fleisch_fisch"],
    ["Hähnchenschenkel", "fleisch_fisch"],
  ])("kennt Rezept-Zutaten wie %s", (name, kategorie) => {
    expect(erkenneKategorie(name)[0]).toBe(kategorie);
  });

  it("bietet bei mehrdeutigen Artikeln mehrere Kategorien an, die häufigste zuerst", () => {
    expect(erkenneKategorie("Heidelbeeren")).toEqual([
      "obst_gemuese",
      "tiefkuehl",
    ]);
    expect(erkenneKategorie("Preiselbeeren")).toEqual([
      "obst_gemuese",
      "tiefkuehl",
    ]);
    expect(erkenneKategorie("Erbsen")).toEqual([
      "tiefkuehl",
      "vorrat",
      "obst_gemuese",
    ]);
    expect(erkenneKategorie("Lachs")).toEqual(["fleisch_fisch", "tiefkuehl"]);
  });

  it("ordnet ausdrücklich Tiefgekühltes immer Tiefkühl zu", () => {
    expect(erkenneKategorie("TK-Erbsen")).toEqual(["tiefkuehl"]);
    expect(erkenneKategorie("tk Himbeeren")).toEqual(["tiefkuehl"]);
    expect(erkenneKategorie("Tiefkühlspinat")).toEqual(["tiefkuehl"]);
  });

  it("ignoriert Groß-/Kleinschreibung, Leerzeichen und „Bio“", () => {
    expect(erkenneKategorie("  BIO   Möhren ")).toEqual(["obst_gemuese"]);
    expect(erkenneKategorie("Grüne Bohnen")).toEqual([
      "obst_gemuese",
      "tiefkuehl",
      "vorrat",
    ]);
  });

  it("verwechselt kurze Wörter nicht mit Wortenden", () => {
    expect(erkenneKategorie("Reis")).toEqual(["vorrat"]);
    expect(erkenneKategorie("Eis")).toEqual(["tiefkuehl"]);
    expect(erkenneKategorie("Eier")).toEqual(["milch_kaese"]);
    expect(erkenneKategorie("Brei")).toEqual([]);
  });

  it("gibt bei Unbekanntem nichts zurück", () => {
    expect(erkenneKategorie("Blumenstrauß")).toEqual([]);
    expect(erkenneKategorie("")).toEqual([]);
  });
});

describe("Konserven", () => {
  it.each([
    "Dose Tomaten",
    "gehackte Tomaten",
    "passierte Tomaten",
    "Tomaten stückig",
    "Mais aus der Dose",
    "Kidneybohnen Dose",
    "Gurken im Glas",
  ])("%s → Vorrat", (name) => {
    expect(erkenneKategorie(name)).toEqual(["vorrat"]);
  });

  it("frische Tomaten bleiben mehrdeutig mit Obst & Gemüse vorn", () => {
    expect(erkenneKategorie("Tomaten")[0]).toBe("obst_gemuese");
  });
});
