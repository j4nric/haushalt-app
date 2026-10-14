import { describe, expect, it } from "vitest";
import { auffuellmenge, standardmaessigImVorrat, vorratsmenge } from "./vorrat";

describe("standardmaessigImVorrat", () => {
  it("führt Haltbares im Vorrat, Frisches nicht", () => {
    expect(standardmaessigImVorrat("vorrat")).toBe(true);
    expect(standardmaessigImVorrat("drogerie")).toBe(true);
    expect(standardmaessigImVorrat("obst_gemuese")).toBe(false);
    expect(standardmaessigImVorrat("milch_kaese")).toBe(false);
    expect(standardmaessigImVorrat(null)).toBe(false);
  });
});

describe("vorratsmenge", () => {
  it("übernimmt die Menge bei gleicher Einheit", () => {
    expect(vorratsmenge({ menge: 3, einheit: "stueck" }, "stueck")).toBe(3);
    expect(vorratsmenge({ menge: 500, einheit: "g" }, "g")).toBe(500);
  });

  it("zählt einen Eintrag ohne Menge als 1 Stück", () => {
    expect(vorratsmenge({ menge: null, einheit: null }, "stueck")).toBe(1);
  });

  it("bucht nichts ohne Menge bei g/ml oder bei abweichender Einheit", () => {
    expect(vorratsmenge({ menge: null, einheit: null }, "g")).toBeNull();
    expect(vorratsmenge({ menge: 2, einheit: "stueck" }, "ml")).toBeNull();
    expect(vorratsmenge({ menge: 500, einheit: "g" }, "stueck")).toBeNull();
  });
});

describe("auffuellmenge", () => {
  it("füllt bis zum Mindestbestand auf", () => {
    expect(auffuellmenge(0, 2)).toBe(2);
    expect(auffuellmenge(1, 3)).toBe(2);
    expect(auffuellmenge(250, 1000)).toBe(750);
  });

  it("tut nichts ohne Mindestbestand oder bei genug Vorrat", () => {
    expect(auffuellmenge(0, null)).toBeNull();
    expect(auffuellmenge(2, 2)).toBeNull();
    expect(auffuellmenge(5, 2)).toBeNull();
  });

  it("behandelt negativen Bestand wie leer und rundet Gleitkomma-Reste", () => {
    expect(auffuellmenge(-1, 2)).toBe(2);
    expect(auffuellmenge(0.1 + 0.2, 1)).toBe(0.7);
  });
});
