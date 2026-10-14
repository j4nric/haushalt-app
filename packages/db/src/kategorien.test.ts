import { describe, expect, it } from "vitest";
import {
  KATEGORIE_IDS,
  kategorieName,
  kategorieRang,
  OHNE_KATEGORIE,
} from "./kategorien";

describe("Kategorien", () => {
  it("haben eindeutige IDs", () => {
    expect(new Set(KATEGORIE_IDS).size).toBe(KATEGORIE_IDS.length);
  });

  it("sortieren nach Supermarkt-Weg, ohne Kategorie zuletzt", () => {
    const sortiert = [
      "tiefkuehl",
      null,
      "obst_gemuese",
      "unbekannt",
      "milch_kaese",
    ].sort((a, b) => kategorieRang(a) - kategorieRang(b));
    expect(sortiert.slice(0, 3)).toEqual([
      "obst_gemuese",
      "milch_kaese",
      "tiefkuehl",
    ]);
    expect(sortiert.slice(3)).toEqual(
      expect.arrayContaining([null, "unbekannt"]),
    );
  });

  it("liefern lesbare Namen", () => {
    expect(kategorieName("milch_kaese")).toBe("Milch & Käse");
    expect(kategorieName(null)).toBe(OHNE_KATEGORIE);
  });
});
