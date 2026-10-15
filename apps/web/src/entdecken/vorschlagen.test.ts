import { describe, expect, it } from "vitest";
import type { ArtikelStand } from "@/lib/kochbar";
import type { SammlungsRezept } from "./sammlung/typ";
import { hauptzutaten, tagesZufall, vorschlagen } from "./vorschlagen";

const rezept = (
  id: string,
  zutaten: string,
  saison: number[] = [],
): SammlungsRezept => ({
  id,
  titel: id,
  dauer: 20,
  schlagwoerter: ["vegetarisch", "pasta"],
  saison,
  zutaten,
  gewuerze: "Salz",
  schritte: "a\nb\nc",
});

const vorrat = (name: string, bestand = 1): [string, ArtikelStand] => [
  name.toLowerCase(),
  {
    id: name,
    name: name.toLowerCase(),
    im_vorrat: 1,
    bestand,
    angebrochen: 0,
    packung_menge: null,
    packung_einheit: null,
    auf_liste: 0,
  },
];

const ohneZufall = () => 0;

describe("vorschlagen", () => {
  const sammlung = [
    rezept("nudeln-tomate", "200 g Spaghetti\n1 Dose Tomaten\n2 EL Olivenöl"),
    rezept("kuerbissuppe", "600 g Kürbis\n1 Zwiebel", [9, 10, 11]),
    rezept("spargel", "500 g Spargel\n400 g Kartoffeln", [4, 5, 6]),
    rezept("linsen", "150 g Linsen\n1 Zwiebel"),
  ];

  it("bevorzugt, was im Vorrat ist und Saison hat; Öl & Co. zählen nicht", () => {
    const ergebnis = vorschlagen(sammlung, {
      artikel: new Map([
        vorrat("Spaghetti"),
        vorrat("Tomaten"),
        vorrat("Olivenöl"),
        vorrat("Linsen", 0),
      ]),
      vorhandeneTitel: new Set(),
      monat: 10,
      zufall: ohneZufall,
    });
    expect(ergebnis.map((v) => v.rezept.id)).toEqual([
      "nudeln-tomate",
      "kuerbissuppe",
      "linsen",
      "spargel",
    ]);
    expect(ergebnis[0]?.ausVorrat).toEqual(["Spaghetti", "Tomaten"]);
    expect(ergebnis[1]?.saison).toBe(true);
  });

  it("schlägt nichts vor, was der Haushalt schon hat", () => {
    const ergebnis = vorschlagen(sammlung, {
      artikel: new Map(),
      vorhandeneTitel: new Set(["linsen"]),
      monat: 1,
      zufall: ohneZufall,
    });
    expect(ergebnis.map((v) => v.rezept.id)).not.toContain("linsen");
  });

  it("ohne Optionales und Grundzutaten", () => {
    expect(
      hauptzutaten(
        rezept("x", "200 g Penne\n(30 g Parmesan)\n2 EL Öl\n1 Prise Salz"),
      ),
    ).toEqual(["Penne"]);
  });

  it("der Zufall bleibt einen Tag lang gleich", () => {
    const a = tagesZufall("2026-10-15");
    const b = tagesZufall("2026-10-15");
    const c = tagesZufall("2026-10-16");
    const folge = (f: () => number) => [f(), f(), f()];
    expect(folge(a)).toEqual(folge(b));
    expect(folge(tagesZufall("2026-10-15"))).not.toEqual(folge(c));
  });
});
