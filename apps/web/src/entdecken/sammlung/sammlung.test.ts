import { erkenneKategorie } from "@haushalt/db/kategorie-erkennung";
import { zerlegeZeile } from "@haushalt/db/zutaten";
import { describe, expect, it } from "vitest";
import { SAMMLUNG } from "./index";
import { SCHLAGWOERTER } from "./typ";

const zeilen = (text: string) =>
  text
    .split("\n")
    .map((z) => z.trim())
    .filter(Boolean);

describe("Startsammlung", () => {
  it("hat genug Rezepte", () => {
    expect(SAMMLUNG.length).toBeGreaterThanOrEqual(100);
  });

  it("hat eindeutige ids und Titel", () => {
    const ids = SAMMLUNG.map((r) => r.id);
    const titel = SAMMLUNG.map((r) => r.titel.toLowerCase());
    expect(ids.filter((id, i) => ids.indexOf(id) !== i)).toEqual([]);
    expect(titel.filter((t, i) => titel.indexOf(t) !== i)).toEqual([]);
  });

  it.each(SAMMLUNG.map((r) => [r.id, r] as const))(
    "%s ist vollständig und lesbar",
    (_, r) => {
      expect(r.id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
      expect(r.titel.trim()).toBe(r.titel);
      expect(r.dauer).toBeGreaterThanOrEqual(5);
      expect(r.dauer).toBeLessThanOrEqual(240);
      expect(r.schlagwoerter.length).toBeGreaterThanOrEqual(2);
      expect(r.schlagwoerter.length).toBeLessThanOrEqual(5);
      for (const w of r.schlagwoerter) {
        expect(SCHLAGWOERTER).toContain(w);
      }
      for (const m of r.saison) {
        expect(m).toBeGreaterThanOrEqual(1);
        expect(m).toBeLessThanOrEqual(12);
      }
      // Vegetarisch/vegan schließt Fleisch und Fisch aus.
      if (r.schlagwoerter.some((w) => w === "vegetarisch" || w === "vegan")) {
        expect(
          r.schlagwoerter.filter((w) =>
            ["fleisch", "geflügel", "fisch"].includes(w),
          ),
        ).toEqual([]);
      }
      expect(zeilen(r.schritte).length).toBeGreaterThanOrEqual(3);

      const zutaten = zeilen(r.zutaten);
      expect(zutaten.length).toBeGreaterThanOrEqual(3);
      for (const zeile of zutaten) {
        const z = zerlegeZeile(zeile);
        // Jede Zutat hat eine Menge, damit „reicht der Vorrat?“ und die Liste klappen.
        expect(z.menge, `Menge fehlt: „${zeile}“`).not.toBeNull();
        // Der Name ist das Produkt („Zwiebel“), Beschreibendes kommt nach dem Komma.
        expect(z.name, `Name: „${zeile}“`).toMatch(/^[A-ZÄÖÜ]/);
        expect(z.name, `Name zu lang: „${zeile}“`).toMatch(/^\S+( \S+){0,2}$/);
      }
      for (const zeile of zeilen(r.gewuerze)) {
        expect(zerlegeZeile(zeile).name, `Gewürz: „${zeile}“`).toMatch(
          /^[A-ZÄÖÜ]/,
        );
      }
    },
  );

  it("die meisten Zutaten werden einer Kategorie zugeordnet", () => {
    const namen = SAMMLUNG.flatMap((r) =>
      zeilen(r.zutaten).map((z) => zerlegeZeile(z).name),
    );
    const unbekannt = [
      ...new Set(namen.filter((n) => erkenneKategorie(n).length === 0)),
    ];
    // Unbekannte landen unter „Sonstiges“ – das soll die Ausnahme bleiben.
    expect(
      unbekannt.length / new Set(namen).size,
      `Ohne Kategorie: ${unbekannt.join(", ")}`,
    ).toBeLessThan(0.15);
  });

  it("ist abwechslungsreich", () => {
    const anzahl = (w: string) =>
      SAMMLUNG.filter((r) => r.schlagwoerter.includes(w as never)).length;
    expect(anzahl("vegetarisch") + anzahl("vegan")).toBeGreaterThanOrEqual(30);
    expect(anzahl("kinder")).toBeGreaterThanOrEqual(15);
    expect(anzahl("fisch")).toBeGreaterThanOrEqual(8);
    expect(SAMMLUNG.filter((r) => r.dauer <= 30).length).toBeGreaterThanOrEqual(
      30,
    );
  });
});
