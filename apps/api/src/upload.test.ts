import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { neueId, testApp } from "../test/hilfen";
import { parseOperationen, UngueltigeOperation } from "./upload";

const t = testApp();
afterAll(() => t.beenden());

const jetzt = () => new Date().toISOString();
const artikelPut = (id: string, haushalt: string, name: string) => ({
  op: "PUT",
  table: "artikel",
  id,
  opData: {
    haushalt_id: haushalt,
    name,
    standardeinheit: "stueck",
    erstellt_am: jetzt(),
  },
});
const eintragPut = (id: string, haushalt: string, artikel: string) => ({
  op: "PUT",
  table: "listeneintraege",
  id,
  opData: {
    haushalt_id: haushalt,
    artikel_id: artikel,
    menge: 2,
    einheit: "stueck",
    erledigt: 0,
    erstellt_am: jetzt(),
  },
});

describe("parseOperationen", () => {
  it.each([
    [
      "unbekannte Tabelle",
      { op: "PUT", table: "user", id: neueId(), opData: {} },
    ],
    [
      "unbekannte Spalte",
      {
        op: "PATCH",
        table: "listeneintraege",
        id: neueId(),
        opData: { besitzer: "x" },
      },
    ],
    [
      "haushalt_id ändern",
      {
        op: "PATCH",
        table: "artikel",
        id: neueId(),
        opData: { haushalt_id: neueId() },
      },
    ],
    [
      "PUT ohne haushalt_id",
      { op: "PUT", table: "artikel", id: neueId(), opData: { name: "Milch" } },
    ],
    ["ungültige id", { op: "DELETE", table: "artikel", id: "1; drop table x" }],
    [
      "unbekannte Einheit",
      {
        op: "PATCH",
        table: "artikel",
        id: neueId(),
        opData: { standardeinheit: "kiste" },
      },
    ],
    [
      "unbekannte Kategorie",
      {
        op: "PATCH",
        table: "artikel",
        id: neueId(),
        opData: { kategorie: "Kram" },
      },
    ],
    [
      "negative Menge",
      {
        op: "PATCH",
        table: "listeneintraege",
        id: neueId(),
        opData: { menge: -1 },
      },
    ],
    ["unbekannte Operation", { op: "MERGE", table: "artikel", id: neueId() }],
  ])("lehnt ab: %s", (_, operation) => {
    expect(() => parseOperationen({ operationen: [operation] })).toThrow(
      UngueltigeOperation,
    );
  });
});

describe("Upload mit Rechteprüfung", () => {
  let anna: Awaited<ReturnType<typeof t.nutzer>>;
  let ben: Awaited<ReturnType<typeof t.nutzer>>;
  let fremd: Awaited<ReturnType<typeof t.nutzer>>;
  let haushalt: string;
  let fremderHaushalt: string;

  beforeAll(async () => {
    anna = await t.nutzer("Anna");
    ben = await t.nutzer("Ben");
    fremd = await t.nutzer("Fremd");
    haushalt = await anna.haushaltAnlegen();
    fremderHaushalt = await fremd.haushaltAnlegen();
    const { code } = (await (
      await anna.post(`/haushalte/${haushalt}/einladungen`)
    ).json()) as { code: string };
    await ben.post("/einladungen/annehmen", { code });
  });

  it("Mitglieder legen an und haken ab; der Server vermerkt, wer es war", async () => {
    const artikel = neueId();
    const eintrag = neueId();
    expect(
      (
        await anna.hochladen([
          artikelPut(artikel, haushalt, "Milch"),
          eintragPut(eintrag, haushalt, artikel),
        ])
      ).status,
    ).toBe(200);

    const patch = {
      op: "PATCH",
      table: "listeneintraege",
      id: eintrag,
      opData: { erledigt: 1 },
    };
    expect((await ben.hochladen([patch])).status).toBe(200);

    const [zeile] =
      await t.sql`select erledigt, erstellt_von, erledigt_von, menge from listeneintraege where id = ${eintrag}`;
    expect(zeile).toEqual({
      erledigt: true,
      erstellt_von: anna.id,
      erledigt_von: ben.id,
      menge: 2,
    });
  });

  it("ignoriert erstellt_von / erledigt_von vom Client und setzt den echten Nutzer", async () => {
    const artikel = neueId();
    const eintrag = neueId();
    const falsch = { erstellt_von: fremd.id, erledigt_von: fremd.id };
    await anna.hochladen([artikelPut(artikel, haushalt, "Butter")]);
    const put = eintragPut(eintrag, haushalt, artikel);
    expect(
      (await anna.hochladen([{ ...put, opData: { ...put.opData, ...falsch } }]))
        .status,
    ).toBe(200);
    await ben.hochladen([
      {
        op: "PATCH",
        table: "listeneintraege",
        id: eintrag,
        opData: { erledigt: 1, ...falsch },
      },
    ]);

    const [zeile] =
      await t.sql`select erstellt_von, erledigt_von from listeneintraege where id = ${eintrag}`;
    expect(zeile).toEqual({ erstellt_von: anna.id, erledigt_von: ben.id });
  });

  it("verbietet das Anlegen in fremden Haushalten (403)", async () => {
    expect(
      (
        await fremd.hochladen([
          artikelPut(neueId(), haushalt, "Eingeschmuggelt"),
        ])
      ).status,
    ).toBe(403);
  });

  it("ändert oder löscht nichts in fremden Haushalten", async () => {
    const artikel = neueId();
    const eintrag = neueId();
    await anna.hochladen([
      artikelPut(artikel, haushalt, "Brot"),
      eintragPut(eintrag, haushalt, artikel),
    ]);

    await fremd.hochladen([
      {
        op: "PATCH",
        table: "listeneintraege",
        id: eintrag,
        opData: { erledigt: 1 },
      },
      { op: "DELETE", table: "artikel", id: artikel },
    ]);
    // PUT mit derselben id aus dem eigenen Haushalt überschreibt die fremde Zeile nicht.
    await fremd.hochladen([artikelPut(artikel, fremderHaushalt, "Gekapert")]);

    const [zeile] =
      await t.sql`select a.name, l.erledigt from listeneintraege l join artikel a on a.id = l.artikel_id where l.id = ${eintrag}`;
    expect(zeile).toEqual({ name: "Brot", erledigt: false });
  });

  it("verbietet Listeneinträge mit Artikeln aus einem anderen Haushalt (400)", async () => {
    const artikel = neueId();
    await anna.hochladen([artikelPut(artikel, haushalt, "Käse")]);
    expect(
      (await fremd.hochladen([eintragPut(neueId(), fremderHaushalt, artikel)]))
        .status,
    ).toBe(400);
  });

  it("verwirft bei einem Fehler die ganze Transaktion", async () => {
    const artikel = neueId();
    const res = await anna.hochladen([
      artikelPut(artikel, haushalt, "Eier"),
      {
        op: "PUT",
        table: "listeneintraege",
        id: neueId(),
        opData: { haushalt_id: haushalt, artikel_id: neueId() },
      },
    ]);
    expect(res.status).toBe(400);
    expect(
      await t.sql`select 1 from artikel where id = ${artikel}`,
    ).toHaveLength(0);
  });
});
