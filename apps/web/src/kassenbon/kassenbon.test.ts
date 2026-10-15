import { describe, expect, it } from "vitest";
import { zerlegeBon } from "./zerlegen";
import { bonSchluessel, namensVorschlag, zuordnen } from "./zuordnen";

// Aufbau wie ein REWE-eBon (Textstücke einer Zeile mit Tab getrennt), Daten erfunden.
const BON = [
  "Rewe Beispiel oHG",
  "Musterstraße 1",
  "12345 Berlin",
  "EUR",
  "ROSENBROE. HELL\t0,39 B",
  "KAROTTENKRUEST.\t2,36 B",
  "4 Stk x\t0,59",
  "BIO WEIDEMILCH\t1,35 B",
  "STEINOFEN PIZZA\t1,79 B",
  "STEINOFEN PIZZA\t1,79 B",
  "BANANE\t1,53 B",
  "0,512 kg x\t2,99 EUR/kg",
  "PEPSI FL\t0,79 A",
  "PFAND 0,25 EURO\t0,25 A *",
  "LEERGUT\t-0,25 A",
  "--------------------------------------",
  "SUMME\tEUR\t10,75",
  "Geg. VISA\tEUR\t10,75",
  "TSE-Transaktion:\t374575",
  "14.10.2026\t16:58\tBon-Nr.:5938",
  "Markt:5377\tKasse:5\tBed.:432105",
];

describe("zerlegeBon", () => {
  const bon = zerlegeBon(BON);

  it("findet die Positionen mit Anzahl und Gewicht, ohne Pfand und Leergut", () => {
    expect(bon.positionen).toEqual([
      { text: "ROSENBROE. HELL", anzahl: 1, kg: null, preis: 0.39 },
      { text: "KAROTTENKRUEST.", anzahl: 4, kg: null, preis: 2.36 },
      { text: "BIO WEIDEMILCH", anzahl: 1, kg: null, preis: 1.35 },
      { text: "STEINOFEN PIZZA", anzahl: 2, kg: null, preis: 3.58 },
      { text: "BANANE", anzahl: 1, kg: 0.512, preis: 1.53 },
      { text: "PEPSI FL", anzahl: 1, kg: null, preis: 0.79 },
    ]);
    expect(bon.uebersprungen).toBe(2);
  });

  it("liest Laden, Datum und einen eindeutigen Schlüssel", () => {
    expect(bon.laden).toBe("REWE");
    expect(bon.datum).toBe("2026-10-14");
    expect(bon.schluessel).toBe("REWE|5377|2026-10-14|5938|374575");
  });

  it("kommt auch mit Leerzeichen statt Tabs und ohne Kopf aus", () => {
    const b = zerlegeBon(["VOLLMILCH 3,5%      1,19 A", "BUTTER   2,29 A"]);
    expect(b.positionen.map((p) => p.text)).toEqual([
      "VOLLMILCH 3,5%",
      "BUTTER",
    ]);
    expect(b.schluessel).toBeNull();
  });
});

describe("zuordnen", () => {
  const artikel = [
    { id: "1", name: "Rosenbrötchen" },
    { id: "2", name: "Milch" },
    { id: "3", name: "Pizza" },
    { id: "4", name: "Bananen" },
    { id: "5", name: "Milchreis" },
  ];

  it("ordnet Abkürzungen, Komposita und Plural zu", () => {
    expect(zuordnen("ROSENBROE. HELL", artikel, new Map())?.artikel.id).toBe(
      "1",
    );
    expect(zuordnen("BIO WEIDEMILCH", artikel, new Map())?.artikel.id).toBe(
      "2",
    );
    expect(zuordnen("STEINOFEN PIZZA", artikel, new Map())?.artikel.id).toBe(
      "3",
    );
    expect(zuordnen("BANANE", artikel, new Map())).toEqual({
      artikel: artikel[3],
      sicher: true,
    });
  });

  it("Gelerntes hat Vorrang, Unbekanntes bleibt offen", () => {
    const gelernt = new Map([[bonSchluessel("pepsi fl"), "5"]]);
    expect(zuordnen("PEPSI FL", artikel, gelernt)?.artikel.id).toBe("5");
    expect(zuordnen("SCHWIP SCHWAP", artikel, new Map())).toBeNull();
  });

  it("schlägt lesbare Namen vor", () => {
    expect(namensVorschlag("BIO WEIDEMILCH")).toBe("Bio Weidemilch");
    expect(namensVorschlag("KAROTTENKRUEST.")).toBe("Karottenkrüst");
    expect(namensVorschlag("PEPSI FL")).toBe("Pepsi");
    expect(namensVorschlag("VOLLMILCH 3,5%")).toBe("Vollmilch");
    // „QUE“ und „EUE“ sind keine Umlaute.
    expect(namensVorschlag("QUELLWASSER")).toBe("Quellwasser");
    expect(namensVorschlag("NEUER WEIN")).toBe("Neuer Wein");
  });
});
