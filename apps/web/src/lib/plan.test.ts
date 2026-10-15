import { zerlegeZutat } from "@haushalt/db/zutaten";
import { describe, expect, it } from "vitest";
import {
  tageAb,
  tagePlus,
  tagName,
  wiederholungen,
  wocheFuellen,
  wochentag,
  zutatenSammeln,
} from "./plan";

const z = (zeile: string, gewuerz = 0) => ({ ...zerlegeZutat(zeile), gewuerz });

describe("Tage", () => {
  it("zählt über Monats- und Jahresgrenzen", () => {
    expect(tageAb("2026-12-30", 4)).toEqual([
      "2026-12-30",
      "2026-12-31",
      "2027-01-01",
      "2027-01-02",
    ]);
    expect(tagePlus("2026-03-01", -1)).toBe("2026-02-28");
  });

  it("benennt Tage", () => {
    expect(tagName("2026-10-15", "2026-10-15")).toBe("Heute");
    expect(tagName("2026-10-16", "2026-10-15")).toBe("Morgen");
    expect(tagName("2026-10-19", "2026-10-15")).toBe("Mo, 19.10.");
    expect(wochentag("2026-10-15")).toBe("Do");
  });
});

describe("zutatenSammeln", () => {
  it("zählt gleiche Zutaten über die Woche zusammen, nach Portionen", () => {
    const posten = zutatenSammeln([
      {
        tag: "2026-10-19",
        faktor: 1,
        zutaten: [
          z("400 g Nudeln"),
          z("1 Zwiebel"),
          z("2 EL Olivenöl"),
          z("Salz", 1),
        ],
      },
      {
        tag: "2026-10-21",
        faktor: 2,
        zutaten: [
          z("200 g nudeln"),
          z("1 Zwiebel"),
          z("1 EL Olivenöl"),
          z("Salz", 1),
        ],
      },
    ]);
    const nach = Object.fromEntries(
      posten.map((p) => [p.name.toLowerCase(), p]),
    );
    expect(nach.nudeln?.zutat.menge).toBe(800);
    expect(nach.nudeln?.listenEinheit).toBe("g");
    expect(nach.nudeln?.fuer).toBe("Mo, Mi");
    expect(nach.zwiebel?.zutat.menge).toBe(3);
    expect(nach.zwiebel?.listenEinheit).toBe("stueck");
    // EL lässt sich nicht einkaufen: einmal, ohne Menge.
    expect(nach.olivenöl?.zutat.menge).toBeNull();
    expect(nach.salz?.gewuerz).toBe(true);
    expect(posten).toHaveLength(4);
  });
});

describe("Abwechslung", () => {
  it("merkt dasselbe Rezept innerhalb von drei Tagen", () => {
    const geplant = [
      { id: "a", tag: "2026-10-16", rezeptId: "r1" },
      { id: "b", tag: "2026-10-18", rezeptId: "r1" },
      { id: "c", tag: "2026-10-25", rezeptId: "r1" },
      { id: "d", tag: "2026-10-17", rezeptId: null },
    ];
    const gekocht = [{ id: "g", tag: "2026-10-14", rezeptId: "r1" }];
    const w = wiederholungen(geplant, gekocht);
    expect(w.get("a")).toBe("2026-10-14");
    expect(w.get("b")).toBe("2026-10-16");
    expect(w.has("c")).toBe(false);
    expect(w.has("d")).toBe(false);
  });
});

describe("wocheFuellen", () => {
  const kandidaten = [
    { id: "r1", titel: "Suppe", gewicht: 1 },
    { id: "r2", titel: "Curry", gewicht: 1 },
    { id: "r3", titel: "Nudeln", gewicht: 1 },
  ];

  it("füllt jeden leeren Tag, jedes Rezept einmal, ohne schon Geplantes", () => {
    let i = 0;
    const zufall = () => [0.1, 0.9, 0.5][i++ % 3] ?? 0;
    const v = wocheFuellen(
      ["2026-10-19", "2026-10-20"],
      kandidaten,
      [{ id: "x", tag: "2026-10-18", rezeptId: "r1" }],
      zufall,
    );
    expect([...v.values()].map((k) => k.id).sort()).toEqual(["r2", "r3"]);
  });

  it("wiederholt erst, wenn die Rezepte ausgehen", () => {
    const v = wocheFuellen(
      ["a", "b", "c", "d"],
      kandidaten.slice(0, 2),
      [],
      () => 0.3,
    );
    expect(v.size).toBe(4);
  });
});
