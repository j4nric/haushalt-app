import { describe, expect, it } from "vitest";
import { Begrenzer } from "./begrenzer";

describe("Begrenzer", () => {
  it("lässt bis zur Grenze durch und sagt dann, wann es wieder geht", () => {
    const b = new Begrenzer([{ max: 2, fensterMs: 60_000 }]);
    expect(b.versuch("anna", 0)).toEqual({ erlaubt: true });
    expect(b.versuch("anna", 10_000)).toEqual({ erlaubt: true });
    expect(b.versuch("anna", 20_000)).toEqual({
      erlaubt: false,
      wiederInSekunden: 40,
    });
    // Andere Konten sind unabhängig.
    expect(b.versuch("ben", 20_000)).toEqual({ erlaubt: true });
    // Gleitendes Fenster: Nach dem ältesten Versuch wird wieder einer frei.
    expect(b.versuch("anna", 60_001)).toEqual({ erlaubt: true });
  });

  it("prüft mehrere Fenster (kurz und lang)", () => {
    const b = new Begrenzer([
      { max: 2, fensterMs: 1000 },
      { max: 3, fensterMs: 10_000 },
    ]);
    expect(b.versuch("x", 0).erlaubt).toBe(true);
    expect(b.versuch("x", 1).erlaubt).toBe(true);
    expect(b.versuch("x", 2).erlaubt).toBe(false);
    expect(b.versuch("x", 2000).erlaubt).toBe(true);
    expect(b.versuch("x", 3000)).toEqual({
      erlaubt: false,
      wiederInSekunden: 7,
    });
  });
});
