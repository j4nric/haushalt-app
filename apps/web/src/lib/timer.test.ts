import { describe, expect, it } from "vitest";
import { findeZeitangaben, formatiereRestzeit } from "./timer";

describe("findeZeitangaben", () => {
  it("findet Minuten, Stunden und Sekunden in verschiedenen Schreibweisen", () => {
    const text =
      "15 Minuten köcheln, dann 1 Std. ruhen lassen und 10–12 Min. backen. 30 Sek. rühren.";
    expect(
      findeZeitangaben(text).map(({ text, sekunden }) => [text, sekunden]),
    ).toEqual([
      ["15 Minuten", 900],
      ["1 Std.", 3600],
      ["10–12 Min.", 720],
      ["30 Sek.", 30],
    ]);
  });

  it("liefert die Fundstelle und ignoriert Wörter, die nur so anfangen", () => {
    const [treffer] = findeZeitangaben("Etwa 1,5 Stunden garen");
    expect(treffer).toMatchObject({ start: 5, ende: 16, sekunden: 5400 });
    expect(findeZeitangaben("2 Minzblätter")).toEqual([]);
    expect(findeZeitangaben("Bei 180 Grad")).toEqual([]);
  });
});

it("formatiert Restzeiten", () => {
  expect(formatiereRestzeit(90)).toBe("1:30");
  expect(formatiereRestzeit(5)).toBe("0:05");
  expect(formatiereRestzeit(3700)).toBe("1:01:40");
  expect(formatiereRestzeit(-3)).toBe("0:00");
});

describe("findeZeitangaben – mehr Schreibweisen", () => {
  it.each([
    [
      "Eine Minute rühren, dann 30 Sekunden ruhen lassen.",
      [
        ["Eine Minute", 60],
        ["30 Sekunden", 30],
      ],
    ],
    ["Etwa 5 bis 7 Minuten braten", [["5 bis 7 Minuten", 420]]],
    ["Zwei Stunden schmoren", [["Zwei Stunden", 7200]]],
    ["Keine Minute zu lang!", []],
    ["200 g Mehl, 2 Minzblätter, 180 Grad", []],
  ])("%s", (schritt, erwartet) => {
    expect(findeZeitangaben(schritt).map((z) => [z.text, z.sekunden])).toEqual(
      erwartet,
    );
  });
});
