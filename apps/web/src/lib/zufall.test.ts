import { describe, expect, it } from "vitest";
import { gewichtetZiehen, ziehenOhneZuruecklegen } from "./zufall";

const liste = [
  { id: "a", gewicht: 1 },
  { id: "b", gewicht: 3 },
  { id: "c", gewicht: 0 },
];

describe("Zufall", () => {
  it("zieht nach Gewicht", () => {
    expect(gewichtetZiehen(liste, () => 0.1)?.id).toBe("a");
    expect(gewichtetZiehen(liste, () => 0.5)?.id).toBe("b");
    expect(gewichtetZiehen([], () => 0.5)).toBeUndefined();
  });

  it("zieht ohne Zurücklegen höchstens so viele, wie es gibt", () => {
    const gezogen = ziehenOhneZuruecklegen(liste, 5, () => 0.3);
    expect(gezogen).toHaveLength(3);
    expect(new Set(gezogen.map((g) => g.id)).size).toBe(3);
  });
});
