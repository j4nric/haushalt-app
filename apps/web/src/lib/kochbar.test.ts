import { zerlegeZutat } from "@haushalt/db/zutaten";
import { describe, expect, it } from "vitest";
import { type ArtikelStand, verfuegbarkeit } from "./kochbar";

const stand = (
  name: string,
  bestand: number,
  standardeinheit: ArtikelStand["standardeinheit"] = "stueck",
): [string, ArtikelStand] => [
  name.toLowerCase(),
  {
    id: name,
    name: name.toLowerCase(),
    im_vorrat: 1,
    standardeinheit,
    bestand,
    auf_liste: 0,
  },
];
const zutat = (zeile: string, gewuerz = 0) => ({
  ...zerlegeZutat(zeile),
  gewuerz,
});

describe("verfuegbarkeit", () => {
  const vorrat = new Map([
    stand("Spaghetti", 500, "g"),
    stand("Tomaten", 1),
    stand("Reis", 100, "g"),
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

  it("zu wenig im Vorrat zählt als fehlend", () => {
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
