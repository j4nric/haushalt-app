import { afterAll, describe, expect, it } from "vitest";
import { neueId, testApp } from "../test/hilfen";

const t = testApp();
afterAll(() => t.beenden());

describe("Wochenplan", () => {
  it("speichert Plan-Einträge mit Rezept oder freiem Text", async () => {
    const anna = await t.nutzer("Anna");
    const haushalt = await anna.haushaltAnlegen();
    const eintrag = (id: string, opData: Record<string, unknown>) => ({
      op: "PUT",
      table: "plan_eintraege",
      id,
      opData: {
        haushalt_id: haushalt,
        erstellt_am: new Date().toISOString(),
        erledigt: 0,
        ...opData,
      },
    });
    const mitRezept = neueId();
    const frei = neueId();
    expect(
      (
        await anna.hochladen([
          eintrag(mitRezept, {
            datum: "2026-10-16",
            rezept_id: neueId(),
            titel: "Kürbissuppe",
            portionen: 3,
          }),
          eintrag(frei, { datum: "2026-10-17", titel: "Reste" }),
        ])
      ).status,
    ).toBe(200);
    // Verschieben und abhaken sind Änderungen.
    expect(
      (
        await anna.hochladen([
          {
            op: "PATCH",
            table: "plan_eintraege",
            id: frei,
            opData: { datum: "2026-10-18", erledigt: 1 },
          },
        ])
      ).status,
    ).toBe(200);
    const zeilen = await t.sql`
      select titel, to_char(datum, 'YYYY-MM-DD') as datum, erledigt, erstellt_von
      from plan_eintraege where haushalt_id = ${haushalt} order by datum
    `;
    expect(zeilen).toEqual([
      {
        titel: "Kürbissuppe",
        datum: "2026-10-16",
        erledigt: false,
        erstellt_von: anna.id,
      },
      {
        titel: "Reste",
        datum: "2026-10-18",
        erledigt: true,
        erstellt_von: anna.id,
      },
    ]);

    expect(
      (
        await anna.hochladen([
          eintrag(neueId(), { datum: "16.10.2026", titel: "X" }),
        ])
      ).status,
    ).toBe(400);
  });

  it("ändert die Standard-Portionen nur im eigenen Haushalt und nur gültig", async () => {
    const anna = await t.nutzer("Anna");
    const fremd = await t.nutzer("Fremd");
    const haushalt = await anna.haushaltAnlegen();
    expect(
      (await anna.patch(`/haushalte/${haushalt}`, { standard_portionen: 4 }))
        .status,
    ).toBe(200);
    const [h] =
      await t.sql`select standard_portionen from haushalte where id = ${haushalt}`;
    expect(h).toEqual({ standard_portionen: 4 });
    expect(
      (await anna.patch(`/haushalte/${haushalt}`, { standard_portionen: 0 }))
        .status,
    ).toBe(400);
    expect(
      (await fremd.patch(`/haushalte/${haushalt}`, { standard_portionen: 3 }))
        .status,
    ).toBe(403);
  });
});
