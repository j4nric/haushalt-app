import { describe, expect, it } from "vitest";
import {
  auffuellmenge,
  bedarfInPackungen,
  bestandBeschreibung,
  eingekauftePackungen,
  gelerntePackung,
  reichtVorrat,
  standardmaessigImVorrat,
  verbrauchNachRezept,
} from "./vorrat";

describe("standardmaessigImVorrat", () => {
  it("führt Haltbares im Vorrat, Frisches nicht", () => {
    expect(standardmaessigImVorrat("vorrat")).toBe(true);
    expect(standardmaessigImVorrat("drogerie")).toBe(true);
    expect(standardmaessigImVorrat("obst_gemuese")).toBe(false);
    expect(standardmaessigImVorrat("milch_kaese")).toBe(false);
    expect(standardmaessigImVorrat(null)).toBe(false);
  });
});

const P500 = { menge: 500, einheit: "g" } as const;

describe("eingekauftePackungen", () => {
  it("zählt Stück und Packungen, mindestens eine", () => {
    expect(eingekauftePackungen({ menge: null, einheit: null }, null)).toBe(1);
    expect(eingekauftePackungen({ menge: 3, einheit: "stueck" }, null)).toBe(3);
    expect(eingekauftePackungen({ menge: 1000, einheit: "g" }, P500)).toBe(2);
    expect(eingekauftePackungen({ menge: 750, einheit: "g" }, P500)).toBe(2);
    expect(eingekauftePackungen({ menge: 200, einheit: "g" }, P500)).toBe(1);
  });

  it("zählt Gewicht ohne bekannte Packungsgröße als einen Einkauf", () => {
    expect(eingekauftePackungen({ menge: 1000, einheit: "g" }, null)).toBe(1);
    expect(eingekauftePackungen({ menge: 2, einheit: "stueck" }, P500)).toBe(2);
  });
});

describe("gelerntePackung", () => {
  it("lernt die Packungsgröße beim ersten Einkauf mit Gewicht", () => {
    expect(gelerntePackung({ menge: 1000, einheit: "g" }, null)).toEqual({
      menge: 1000,
      einheit: "g",
    });
    expect(gelerntePackung({ menge: 1000, einheit: "g" }, P500)).toBeNull();
    expect(gelerntePackung({ menge: 2, einheit: "stueck" }, null)).toBeNull();
  });
});

describe("Rezepte und Vorrat", () => {
  const vorrat = (bestand: number, angebrochen = false) => ({
    bestand,
    angebrochen,
    packung: P500,
  });

  it("rechnet Gramm in Packungen um", () => {
    expect(bedarfInPackungen({ menge: 250, einheit: "g" }, P500)).toBe(0.5);
    expect(bedarfInPackungen({ menge: 250, einheit: "g" }, null)).toBeNull();
    expect(bedarfInPackungen({ menge: 3, einheit: "stueck" }, null)).toBe(3);
  });

  it("reicht – eine offene Packung zählt halb", () => {
    expect(reichtVorrat(vorrat(1), { menge: 400, einheit: "g" })).toBe(true);
    expect(reichtVorrat(vorrat(1, true), { menge: 400, einheit: "g" })).toBe(
      false,
    );
    expect(reichtVorrat(vorrat(1, true), { menge: 200, einheit: "g" })).toBe(
      true,
    );
    expect(reichtVorrat(vorrat(0), { menge: null, einheit: null })).toBe(false);
    // Ohne Packungsgröße: Hauptsache, etwas ist da.
    expect(
      reichtVorrat(
        { bestand: 1, angebrochen: false, packung: null },
        { menge: 800, einheit: "g" },
      ),
    ).toBe(true);
  });

  it("verbraucht ganze Packungen und öffnet für den Rest eine", () => {
    expect(
      verbrauchNachRezept({ menge: 200, einheit: "g" }, vorrat(2)),
    ).toEqual({ ganze: 0, angebrochen: true });
    expect(
      verbrauchNachRezept({ menge: 500, einheit: "g" }, vorrat(2)),
    ).toEqual({ ganze: 1, angebrochen: false });
    expect(
      verbrauchNachRezept({ menge: 700, einheit: "g" }, vorrat(3)),
    ).toEqual({ ganze: 1, angebrochen: true });
    // Nie mehr als da ist; ist alles weg, ist auch nichts mehr offen.
    expect(
      verbrauchNachRezept({ menge: 1500, einheit: "g" }, vorrat(1, true)),
    ).toEqual({ ganze: 1, angebrochen: false });
    expect(
      verbrauchNachRezept(
        { menge: 3, einheit: "stueck" },
        { bestand: 10, angebrochen: false, packung: null },
      ),
    ).toEqual({ ganze: 3, angebrochen: false });
    expect(
      verbrauchNachRezept(
        { menge: 200, einheit: "g" },
        { ...vorrat(1), packung: null },
      ),
    ).toBeNull();
  });

  it("rechnet Stück in Packungen um, wenn die Packung Stück enthält", () => {
    const eier = {
      bestand: 1,
      angebrochen: false,
      packung: { menge: 10, einheit: "stueck" },
    } as const;
    expect(
      bedarfInPackungen({ menge: 3, einheit: "stueck" }, eier.packung),
    ).toBe(0.3);
    expect(verbrauchNachRezept({ menge: 3, einheit: "stueck" }, eier)).toEqual({
      ganze: 0,
      angebrochen: true,
    });
    expect(
      eingekauftePackungen({ menge: 10, einheit: "stueck" }, eier.packung),
    ).toBe(1);
  });

  it("beschreibt den Bestand", () => {
    expect(bestandBeschreibung(vorrat(2, true))).toBe("à 500 g · 1 offen");
    expect(
      bestandBeschreibung({ bestand: 3, angebrochen: false, packung: null }),
    ).toBe("");
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
