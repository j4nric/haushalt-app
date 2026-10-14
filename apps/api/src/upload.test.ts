import { describe, expect, it } from "vitest";
import { parseOperationen, UngueltigeOperation } from "./upload";

const ID = "6f1c2a3b-4d5e-4f60-8a9b-0c1d2e3f4a5b";

describe("parseOperationen", () => {
  it("wandelt einen neuen Eintrag um, inklusive 0/1 → Boolean", () => {
    const ops = parseOperationen({
      operationen: [
        {
          op: "PUT",
          table: "listeneintraege",
          id: ID,
          opData: { name: " Milch ", erledigt: 0 },
        },
      ],
    });
    expect(ops).toEqual([
      {
        op: "PUT",
        table: "listeneintraege",
        id: ID,
        data: { name: "Milch", erledigt: false },
      },
    ]);
  });

  it("übernimmt Abhaken und Löschen", () => {
    const ops = parseOperationen({
      operationen: [
        {
          op: "PATCH",
          table: "listeneintraege",
          id: ID,
          opData: { erledigt: 1 },
        },
        { op: "DELETE", table: "listeneintraege", id: ID },
      ],
    });
    expect(ops).toEqual([
      {
        op: "PATCH",
        table: "listeneintraege",
        id: ID,
        data: { erledigt: true },
      },
      { op: "DELETE", table: "listeneintraege", id: ID },
    ]);
  });

  it.each([
    ["unbekannte Tabelle", { op: "PUT", table: "nutzer", id: ID, opData: {} }],
    [
      "unbekannte Spalte",
      {
        op: "PATCH",
        table: "listeneintraege",
        id: ID,
        opData: { besitzer: "x" },
      },
    ],
    [
      "ungültige id",
      { op: "DELETE", table: "listeneintraege", id: "1; drop table x" },
    ],
    [
      "leerer Name",
      { op: "PUT", table: "listeneintraege", id: ID, opData: { name: "  " } },
    ],
    ["unbekannte Operation", { op: "MERGE", table: "listeneintraege", id: ID }],
  ])("lehnt ab: %s", (_, operation) => {
    expect(() => parseOperationen({ operationen: [operation] })).toThrow(
      UngueltigeOperation,
    );
  });

  it("lehnt einen falsch aufgebauten Body ab", () => {
    expect(() => parseOperationen({ ops: [] })).toThrow(UngueltigeOperation);
  });
});
