import { zerlegeZutat } from "@haushalt/db/zutaten";
import { describe, expect, it } from "vitest";
import { type ArtikelStand, verfuegbarkeit } from "./kochbar";

/** Bestand in Packungen; optional mit Packungsgröße in Gramm und „offen“. */
const stand = (
  name: string,
  bestand: number,
  packungGramm: number | null = null,
  angebrochen = 0,
): [string, ArtikelStand] => [
  name.toLowerCase(),
  {
    id: name,
    name: name.toLowerCase(),
    im_vorrat: 1,
    bestand,
    angebrochen,
    packung_menge: packungGramm,
    packung_einheit: packungGramm ? "g" : null,
    auf_liste: 0,
  },
];
const zutat = (zeile: string, gewuerz = 0) => ({
  ...zerlegeZutat(zeile),
  gewuerz,
});

describe("verfuegbarkeit", () => {
  const vorrat = new Map([
    stand("Spaghetti", 1, 500),
    stand("Tomaten", 1),
    stand("Reis", 1, 500, 1),
  ]);

  it("zählt, was im Vorrat reicht – ohne Gewürze und Grundzutaten", () => {
    expect(
      verfuegbarkeit(
        [
          zutat("400 g Spaghetti"),
          zutat("1 Dose Tomaten"),
          zutat("2 EL Olivenöl"),
          zutat("Oregano", 1),
          zutat("1 Zwiebel"),
        ],
        vorrat,
      ),
    ).toEqual({ prozent: 67, fehlt: ["Zwiebel"] });
  });

  it("zu wenig im Vorrat zählt als fehlend – eine offene Packung zählt halb", () => {
    expect(verfuegbarkeit([zutat("300 g Reis")], vorrat)).toEqual({
      prozent: 0,
      fehlt: ["Reis"],
    });
  });

  it("Optionales fehlt nicht", () => {
    expect(
      verfuegbarkeit(
        [zutat("400 g Spaghetti"), { ...zutat("100 g Salami"), optional: 1 }],
        vorrat,
      ),
    ).toEqual({ prozent: 100, fehlt: [] });
  });

  it("ohne zählende Zutaten ist alles da", () => {
    expect(verfuegbarkeit([zutat("Salz", 1)], vorrat).prozent).toBe(100);
  });
});
