import { describe, expect, it } from "vitest";
import { passt, resteSuche } from "./reste";

const z = (name: string, gewuerz = 0, optional = 0) => ({
  name,
  gewuerz,
  optional,
});

describe("passt", () => {
  it.each([
    ["Zucchini", "zucchini", true],
    ["Feta", "Feta", true],
    ["Bergkäse", "Käse", true],
    ["passierte Tomaten", "Tomate", true],
    ["Zwiebeln", "Zwiebel", true],
    ["Käsekuchen", "Käse", false],
    ["Reis", "Eis", false],
    ["Eier", "Ei", true],
  ])("%s ← %s: %s", (zutat, begriff, erwartet) => {
    expect(passt(zutat, begriff)).toBe(erwartet);
  });
});

describe("resteSuche", () => {
  const rezepte = [
    {
      rezept: "Ofengemüse",
      zutaten: [
        z("Zucchini"),
        z("Paprika"),
        z("Feta"),
        z("Olivenöl"),
        z("Salz", 1),
      ],
    },
    {
      rezept: "Zucchini-Nudeln",
      zutaten: [
        z("Zucchini"),
        z("Spaghetti"),
        z("Knoblauch"),
        z("Parmesan", 0, 1),
      ],
    },
    { rezept: "Pfannkuchen", zutaten: [z("Mehl"), z("Eier"), z("Milch")] },
  ];

  it("sortiert nach genutzten Resten, dann nach wenig Fehlendem", () => {
    const treffer = resteSuche(rezepte, ["Zucchini", "Feta"]);
    expect(treffer.map((t) => t.rezept)).toEqual([
      "Ofengemüse",
      "Zucchini-Nudeln",
    ]);
    expect(treffer[0]).toMatchObject({
      nutzt: ["Zucchini", "Feta"],
      fehlt: ["Paprika"],
    });
    // Optionales (Parmesan) und Grundzutaten (Öl, Salz) fehlen nicht.
    expect(treffer[1]?.fehlt).toEqual(["Spaghetti", "Knoblauch"]);
  });

  it("findet nichts ohne Begriffe oder Treffer", () => {
    expect(resteSuche(rezepte, [" "])).toEqual([]);
    expect(resteSuche(rezepte, ["Lachs"])).toEqual([]);
  });
});
