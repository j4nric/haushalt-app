import { describe, expect, it } from "vitest";
import { produktEmoji, vergessenSatz, vermisstSatz } from "./persoenlichkeit";
import { kaufrhythmus, ueberfaellige } from "./vergessen";

const TAG = 86_400_000;
const START = Date.parse("2026-09-01T10:00:00Z");
const tag = (n: number) => new Date(START + n * TAG).toISOString();

describe("kaufrhythmus", () => {
  it("braucht mindestens drei verschiedene Kauftage", () => {
    expect(kaufrhythmus([tag(0), tag(5)])).toBeNull();
    // Zwei Käufe am selben Tag zählen einmal.
    expect(
      kaufrhythmus([tag(0), new Date(START + 3_600_000).toISOString(), tag(5)]),
    ).toBeNull();
  });

  it("nimmt den Median der Abstände, unabhängig von der Reihenfolge", () => {
    expect(kaufrhythmus([tag(10), tag(0), tag(5), tag(30)])).toEqual({
      abstandTage: 5,
      letzterKauf: tag(30),
    });
  });
});

describe("ueberfaellige", () => {
  const milch = {
    id: "m",
    name: "Milch",
    kategorie: "milch_kaese",
    kaeufe: [tag(0), tag(5), tag(10)],
  };

  it("meldet erst ab dem Anderthalbfachen des üblichen Abstands", () => {
    expect(ueberfaellige([milch], START + 17 * TAG)).toEqual([]);
    expect(ueberfaellige([milch], START + 18 * TAG)).toEqual([
      {
        id: "m",
        name: "Milch",
        kategorie: "milch_kaese",
        abstandTage: 5,
        seitTage: 8,
        letzterKauf: tag(10),
      },
    ]);
  });

  it("schweigt, wenn etwas sehr lange nicht mehr gekauft wurde", () => {
    // 4 × 5 + 7 = 27 Tage nach dem letzten Kauf ist Schluss.
    expect(ueberfaellige([milch], START + 37 * TAG)).toHaveLength(1);
    expect(ueberfaellige([milch], START + 38 * TAG)).toEqual([]);
  });

  it("sortiert nach Dringlichkeit und begrenzt die Anzahl", () => {
    const brot = {
      ...milch,
      id: "b",
      name: "Brot",
      kaeufe: [tag(0), tag(2), tag(4)],
    };
    const kaffee = {
      ...milch,
      id: "k",
      name: "Kaffee",
      kaeufe: [tag(0), tag(10), tag(20)],
    };
    const jetzt = START + 36 * TAG;
    // Brot: 32 Tage bei Abstand 2 → zu lange her. Milch: 26/5. Kaffee: 16/10.
    expect(
      ueberfaellige([kaffee, brot, milch], jetzt).map((a) => a.id),
    ).toEqual(["m", "k"]);
    expect(ueberfaellige([kaffee, milch], jetzt, 1).map((a) => a.id)).toEqual([
      "m",
    ]);
  });
});

describe("Persönlichkeit", () => {
  it("findet ein Emoji am Namen, sonst an der Kategorie", () => {
    expect(produktEmoji("Vollmilch", "milch_kaese")).toBe("🥛");
    expect(produktEmoji("Brokkoli", "obst_gemuese")).toBe("🥦");
    expect(produktEmoji("Mangold", "obst_gemuese")).toBe("🥬");
    expect(produktEmoji("Irgendwas", null)).toBe("🛍️");
  });

  it("sagt je Produkt immer denselben Satz", () => {
    expect(vergessenSatz("Milch", 5, 8)).toBe(vergessenSatz("Milch", 5, 8));
    expect(vergessenSatz("Milch", 1, 3)).toMatch(/jeden Tag/i);
    expect(vergessenSatz("Milch", 1, 3)).not.toMatch(/alle 1 /);
  });

  it("vermisst erst nach drei Wochen", () => {
    expect(vermisstSatz("Brokkoli", 20)).toBeNull();
    expect(vermisstSatz("Brokkoli", 21)).toBeTruthy();
    expect(vermisstSatz("Brokkoli", 21)).toBe(vermisstSatz("Brokkoli", 21));
  });
});
