import { describe, expect, it } from "vitest";
import { findeNachName, namensVarianten } from "./namen";

describe("namensVarianten", () => {
  it("findet Singular und Plural in beide Richtungen", () => {
    expect(namensVarianten("Zwiebeln")).toContain("zwiebel");
    expect(namensVarianten("Zwiebel")).toContain("zwiebeln");
    expect(namensVarianten("Tomate")).toContain("tomaten");
    expect(namensVarianten("Kartoffeln")).toContain("kartoffel");
    expect(namensVarianten("Eier")).toContain("ei");
    expect(namensVarianten("Ei")).toContain("eier");
    expect(namensVarianten("Äpfel")).toContain("apfel");
  });

  it("wandelt nur das letzte Wort ab, die eigene Schreibweise zuerst", () => {
    const v = namensVarianten("Rote  Zwiebeln");
    expect(v[0]).toBe("rote zwiebeln");
    expect(v).toContain("rote zwiebel");
    expect(v).not.toContain("rot zwiebeln");
  });
});

describe("findeNachName", () => {
  const vorrat = new Map([
    ["zwiebel", 1],
    ["eier", 2],
    ["reis", 3],
  ]);
  it("findet vorhandene Artikel auch in anderer Form", () => {
    expect(findeNachName(vorrat, "Zwiebeln")).toBe(1);
    expect(findeNachName(vorrat, "Ei")).toBe(2);
    expect(findeNachName(vorrat, "Reis")).toBe(3);
    expect(findeNachName(vorrat, "Mehl")).toBeUndefined();
  });
});
