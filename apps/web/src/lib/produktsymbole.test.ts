import {
  IconCheese,
  IconSausage,
  IconToiletPaper,
  IconWashMachine,
} from "@tabler/icons-react";
import { Apple, BottleWine, CakeSlice, Milk, Pizza } from "lucide-react";
import { describe, expect, it } from "vitest";
import { produktSymbol } from "./produktsymbole";

describe("produktSymbol", () => {
  it("findet Produkte direkt", () => {
    expect(produktSymbol("Käse")).toBe(IconCheese);
    expect(produktSymbol("Milch")).toBe(Milk);
    expect(produktSymbol("Klopapier")).toBe(IconToiletPaper);
  });

  it("nimmt bei Komposita das Wortende", () => {
    expect(produktSymbol("Bergkäse")).toBe(IconCheese);
    expect(produktSymbol("Käsekuchen")).toBe(CakeSlice);
    expect(produktSymbol("Rapsöl")).toBe(BottleWine);
    expect(produktSymbol("Hühnerwürstchen")).toBe(IconSausage);
  });

  it("versteht Plural, Groß/klein und Zusätze", () => {
    expect(produktSymbol("Äpfel")).toBe(Apple);
    expect(produktSymbol("Bio Weidemilch")).toBe(Milk);
    expect(produktSymbol("TK Steinofen Pizza")).toBe(Pizza);
    expect(produktSymbol("Waschmittel Color")).toBe(IconWashMachine);
  });

  it("gibt nichts zurück, wenn nichts passt", () => {
    expect(produktSymbol("Dingsbums")).toBeNull();
    expect(produktSymbol("")).toBeNull();
    // Kurze Wortenden zählen nicht: „Brei“ ist kein Ei.
    expect(produktSymbol("Brei")).toBeNull();
  });
});
