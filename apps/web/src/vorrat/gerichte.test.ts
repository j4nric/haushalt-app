import { describe, expect, it } from "vitest";
import { istFertiggericht, restAlter } from "./gerichte";

const tag = (iso: string) => new Date(`${iso}T18:00:00`).getTime();

describe("restAlter", () => {
  const jetzt = tag("2026-10-16");
  it("zeigt das Alter und warnt rechtzeitig", () => {
    expect(restAlter(tag("2026-10-16"), "kuehlschrank", jetzt)).toEqual({
      text: "von heute",
      warnen: false,
    });
    expect(restAlter(tag("2026-10-15"), "kuehlschrank", jetzt).text).toBe(
      "seit gestern",
    );
    expect(restAlter(tag("2026-10-13"), "kuehlschrank", jetzt)).toEqual({
      text: "seit 3 Tagen",
      warnen: true,
    });
    expect(restAlter(tag("2026-09-01"), "tk", jetzt)).toEqual({
      text: "seit 6 Wochen",
      warnen: false,
    });
    expect(restAlter(tag("2026-06-01"), "tk", jetzt)).toEqual({
      text: "seit 4 Monaten",
      warnen: true,
    });
    expect(restAlter(null, "tk", jetzt)).toEqual({ text: "", warnen: false });
  });
});

describe("istFertiggericht", () => {
  it("erkennt TK-Fertiggerichte, nicht TK-Gemüse", () => {
    expect(istFertiggericht("Steinofen Pizza", "tiefkuehl")).toBe(true);
    expect(istFertiggericht("Lasagne", "tiefkuehl")).toBe(true);
    expect(istFertiggericht("Erbsen", "tiefkuehl")).toBe(false);
    expect(istFertiggericht("Pizza", "vorrat")).toBe(false);
  });
});
