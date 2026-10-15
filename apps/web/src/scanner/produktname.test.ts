import { describe, expect, it } from "vitest";
import { kurzname, packungsmenge, passendeArtikel } from "./produktname";

describe("kurzname", () => {
  it("entfernt Marke, Prozente und Mengen", () => {
    expect(kurzname("Milbona Frische Vollmilch 3,5 %", "Milbona")).toBe(
      "Frische Vollmilch",
    );
    expect(kurzname("Barilla Spaghetti n.5 500 g", "Barilla")).toBe(
      "Spaghetti",
    );
    expect(kurzname("Bio Bananen (lose)", null)).toBe("Bio Bananen");
    expect(kurzname("1 l", null)).toBe("1 l");
  });
});

describe("passendeArtikel", () => {
  const artikel = [
    { name: "Milch" },
    { name: "Vollmilch" },
    { name: "Käse" },
    { name: "Ei" },
  ];
  it("findet genaue Treffer vor Wortenden, nichts Unpassendes", () => {
    expect(
      passendeArtikel("Frische Vollmilch 3,5 %", artikel).map((a) => a.name),
    ).toEqual(["Vollmilch", "Milch"]);
    expect(passendeArtikel("Gouda jung", artikel)).toEqual([]);
  });
});

describe("packungsmenge", () => {
  it("rechnet Packungsangaben in Vorratseinheiten um", () => {
    expect(packungsmenge("500 g")).toEqual({ menge: 500, einheit: "g" });
    expect(packungsmenge("1 l")).toEqual({ menge: 1000, einheit: "ml" });
    expect(packungsmenge("6 Stück")).toEqual({ menge: 6, einheit: "stueck" });
    expect(packungsmenge("ca. 4 Portionen")).toBeNull();
    expect(packungsmenge(null)).toBeNull();
  });
});
