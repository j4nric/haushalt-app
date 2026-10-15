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

describe("Vorrat", () => {
  let anna: Awaited<ReturnType<typeof t.nutzer>>;
  let fremd: Awaited<ReturnType<typeof t.nutzer>>;
  let haushalt: string;
  let fremderHaushalt: string;

  const buchung = (
    id: string,
    haushaltId: string,
    artikelId: string,
    menge: number,
    grund = "verbrauch",
  ) => ({
    op: "PUT",
    table: "vorratsbuchungen",
    id,
    opData: {
      haushalt_id: haushaltId,
      artikel_id: artikelId,
      menge,
      grund,
      erstellt_am: jetzt(),
    },
  });

  beforeAll(async () => {
    anna = await t.nutzer("Anna");
    fremd = await t.nutzer("Fremd");
    haushalt = await anna.haushaltAnlegen();
    fremderHaushalt = await fremd.haushaltAnlegen();
  });

  it("speichert Vorrat-Einstellungen und Buchungen; der Bestand ist die Summe", async () => {
    const nudeln = neueId();
    const eintrag = neueId();
    const put = artikelPut(nudeln, haushalt, "Nudeln");
    expect(
      (
        await anna.hochladen([
          {
            ...put,
            opData: {
              ...put.opData,
              im_vorrat: 1,
              mindestbestand: 2,
              archiviert: 1,
            },
          },
          eintragPut(eintrag, haushalt, nudeln),
          {
            ...buchung(neueId(), haushalt, nudeln, 3, "einkauf"),
            opData: {
              ...buchung(neueId(), haushalt, nudeln, 3, "einkauf").opData,
              listeneintrag_id: eintrag,
              erstellt_von: fremd.id,
            },
          },
          buchung(neueId(), haushalt, nudeln, -1),
        ])
      ).status,
    ).toBe(200);

    const [a] =
      await t.sql`select im_vorrat, mindestbestand, archiviert from artikel where id = ${nudeln}`;
    expect(a).toEqual({ im_vorrat: true, mindestbestand: 2, archiviert: true });
    const [summe] = await t.sql`
      select sum(menge)::float as bestand, count(*) filter (where erstellt_von = ${anna.id})::int as von_anna
      from vorratsbuchungen where artikel_id = ${nudeln}
    `;
    expect(summe).toEqual({ bestand: 2, von_anna: 2 });
  });

  it("verbietet Buchungen in fremden Haushalten und auf fremde Artikel", async () => {
    const reis = neueId();
    await anna.hochladen([artikelPut(reis, haushalt, "Reis")]);
    expect(
      (await fremd.hochladen([buchung(neueId(), haushalt, reis, 1)])).status,
    ).toBe(403);
    expect(
      (await fremd.hochladen([buchung(neueId(), fremderHaushalt, reis, 1)]))
        .status,
    ).toBe(400);
  });

  it("Buchungen sind unveränderlich, dürfen aber gelöscht werden", async () => {
    const mehl = neueId();
    const b = neueId();
    await anna.hochladen([
      artikelPut(mehl, haushalt, "Mehl"),
      buchung(b, haushalt, mehl, 1, "einkauf"),
    ]);

    const patch = {
      op: "PATCH",
      table: "vorratsbuchungen",
      id: b,
      opData: { menge: 100 },
    };
    expect((await anna.hochladen([patch])).status).toBe(400);
    expect(
      (
        await anna.hochladen([
          { op: "DELETE", table: "vorratsbuchungen", id: b },
        ])
      ).status,
    ).toBe(200);
    expect(
      await t.sql`select 1 from vorratsbuchungen where id = ${b}`,
    ).toHaveLength(0);
  });

  it.each([
    ["Buchung mit Menge 0", { menge: 0 }],
    ["unbekannter Grund", { grund: "geschenkt" }],
  ])("lehnt ab: %s", async (_, abweichung) => {
    const artikelId = neueId();
    await anna.hochladen([artikelPut(artikelId, haushalt, "Salz")]);
    const b = buchung(neueId(), haushalt, artikelId, 1);
    expect(
      (await anna.hochladen([{ ...b, opData: { ...b.opData, ...abweichung } }]))
        .status,
    ).toBe(400);
  });

  it("speichert Packungsgröße und „angebrochen“ – nur vollständig und gültig", async () => {
    const mehl = neueId();
    await anna.hochladen([artikelPut(mehl, haushalt, "Mehl")]);
    const patch = (opData: Record<string, unknown>) =>
      anna.hochladen([{ op: "PATCH", table: "artikel", id: mehl, opData }]);

    expect(
      (
        await patch({
          packung_menge: 500,
          packung_einheit: "g",
          angebrochen: 1,
        })
      ).status,
    ).toBe(200);
    const [a] =
      await t.sql`select packung_menge, packung_einheit, angebrochen from artikel where id = ${mehl}`;
    expect(a).toEqual({
      packung_menge: 500,
      packung_einheit: "g",
      angebrochen: true,
    });

    expect((await patch({ packung_menge: -1 })).status).toBe(400);
    expect((await patch({ packung_einheit: "Dose" })).status).toBe(400);
    // Nur eins von beiden: verletzt die Regel „beide oder keins“.
    expect((await patch({ packung_einheit: null })).status).toBe(400);
    expect(
      (await patch({ packung_menge: null, packung_einheit: null })).status,
    ).toBe(200);
  });

  it("lehnt einen Mindestbestand von 0 oder kleiner ab", () => {
    expect(() =>
      parseOperationen({
        operationen: [
          {
            op: "PATCH",
            table: "artikel",
            id: neueId(),
            opData: { mindestbestand: 0 },
          },
        ],
      }),
    ).toThrow(UngueltigeOperation);
  });
});

describe("Käufe", () => {
  it("speichert Käufe mit dem Server als Urheber, unveränderlich, löschbar, nur im eigenen Haushalt", async () => {
    const ben = await t.nutzer("Ben");
    const fremd = await t.nutzer("Fremd-Kauf");
    const haushalt = await ben.haushaltAnlegen();
    const milch = neueId();
    const kauf = neueId();
    const put = {
      op: "PUT",
      table: "kaeufe",
      id: kauf,
      opData: {
        haushalt_id: haushalt,
        artikel_id: milch,
        listeneintrag_id: neueId(),
        gekauft_am: jetzt(),
        erstellt_von: fremd.id,
      },
    };
    expect(
      (await ben.hochladen([artikelPut(milch, haushalt, "Milch"), put])).status,
    ).toBe(200);
    const [k] = await t.sql`select erstellt_von from kaeufe where id = ${kauf}`;
    expect(k).toEqual({ erstellt_von: ben.id });

    expect((await fremd.hochladen([{ ...put, id: neueId() }])).status).toBe(
      403,
    );
    expect(
      (
        await ben.hochladen([
          {
            op: "PATCH",
            table: "kaeufe",
            id: kauf,
            opData: { gekauft_am: jetzt() },
          },
        ])
      ).status,
    ).toBe(400);
    expect(
      (await ben.hochladen([{ op: "DELETE", table: "kaeufe", id: kauf }]))
        .status,
    ).toBe(200);
    expect(await t.sql`select 1 from kaeufe where id = ${kauf}`).toHaveLength(
      0,
    );
  });
});

describe("Rezepte", () => {
  it("speichert Rezepte mit Zutaten, wie die App sie hochlädt", async () => {
    const koch = await t.nutzer("Koch");
    const haushalt = await koch.haushaltAnlegen();
    const rezept = neueId();
    const antwort = await koch.hochladen([
      {
        op: "PUT",
        table: "rezepte",
        id: rezept,
        opData: {
          haushalt_id: haushalt,
          titel: "Spaghetti",
          portionen: 2,
          quelle_url: null,
          bild_url: null,
          schritte: "Nudeln kochen.",
          erstellt_von: koch.id,
          erstellt_am: jetzt(),
        },
      },
      {
        op: "PUT",
        table: "rezept_zutaten",
        id: neueId(),
        opData: {
          haushalt_id: haushalt,
          rezept_id: rezept,
          position: 0,
          menge: 200,
          einheit: "g",
          name: "Spaghetti",
          zusatz: null,
        },
      },
    ]);
    expect(await antwort.text()).toContain("ok");
    const [r] =
      await t.sql`select titel, erstellt_von from rezepte where id = ${rezept}`;
    expect(r).toEqual({ titel: "Spaghetti", erstellt_von: koch.id });
  });

  it("lässt nur http(s)-Adressen für Quelle und Bild zu", async () => {
    const koch = await t.nutzer("Koch2");
    const haushalt = await koch.haushaltAnlegen();
    const antwort = await koch.hochladen([
      {
        op: "PUT",
        table: "rezepte",
        id: neueId(),
        opData: {
          haushalt_id: haushalt,
          titel: "Böse",
          quelle_url: "javascript:alert(1)",
          erstellt_am: jetzt(),
        },
      },
    ]);
    expect(antwort.status).toBe(400);
  });
});

describe("Kassenbons", () => {
  it("speichert gelernte Bon-Zuordnungen und übernommene Bons", async () => {
    const anna = await t.nutzer("Anna");
    const haushalt = await anna.haushaltAnlegen();
    const pizza = neueId();
    const res = await anna.hochladen([
      artikelPut(pizza, haushalt, "Pizza"),
      {
        op: "PUT",
        table: "bon_artikel",
        id: neueId(),
        opData: {
          haushalt_id: haushalt,
          artikel_id: pizza,
          text: "STEINOFEN PIZZA",
          erstellt_am: jetzt(),
        },
      },
      {
        op: "PUT",
        table: "kassenbons",
        id: neueId(),
        opData: {
          haushalt_id: haushalt,
          schluessel: "REWE|5377|2026-10-14|5938|1",
          positionen: 3,
          erstellt_von: "jemand-anderes",
          erstellt_am: jetzt(),
        },
      },
    ]);
    expect(res.status, await res.text()).toBe(200);
    const [bon] =
      await t.sql`select positionen, erstellt_von from kassenbons where haushalt_id = ${haushalt}`;
    expect(bon).toEqual({ positionen: 3, erstellt_von: anna.id });
    expect(
      await t.sql`select text from bon_artikel where artikel_id = ${pizza}`,
    ).toEqual([{ text: "STEINOFEN PIZZA" }]);
  });
});

describe("Gerichte im Vorrat", () => {
  it("speichert Reste und Fertiggerichte, nur mit gültiger Art und Lagerort", async () => {
    const anna = await t.nutzer("Anna");
    const haushalt = await anna.haushaltAnlegen();
    const rest = neueId();
    const put = artikelPut(rest, haushalt, "Linsen-Dal");
    const ok = await anna.hochladen([
      {
        ...put,
        opData: {
          ...put.opData,
          gericht: "rest",
          lagerort: "tk",
          eingelagert_am: jetzt(),
          rest_von: neueId(),
          im_vorrat: 1,
        },
      },
    ]);
    expect(ok.status, await ok.text()).toBe(200);
    const [a] =
      await t.sql`select gericht, lagerort from artikel where id = ${rest}`;
    expect(a).toEqual({ gericht: "rest", lagerort: "tk" });

    const patch = (opData: Record<string, unknown>) =>
      anna.hochladen([{ op: "PATCH", table: "artikel", id: rest, opData }]);
    expect((await patch({ gericht: "suppe" })).status).toBe(400);
    expect((await patch({ lagerort: "keller" })).status).toBe(400);
    expect((await patch({ gericht: null, lagerort: null })).status).toBe(200);
  });
});
