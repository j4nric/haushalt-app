import { afterAll, describe, expect, it } from "vitest";
import { testApp } from "../test/hilfen";

const t = testApp({
  grenzen: {
    import: [{ max: 2, fensterMs: 60_000 }],
    foto: [{ max: 3, fensterMs: 60_000 }],
    einladung: [{ max: 2, fensterMs: 60_000 }],
  },
  fotoSpeicher: 150,
});
afterAll(() => t.beenden());

const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
  "base64",
);

describe("Begrenzungen", () => {
  it("bremst Importe pro Konto mit verständlicher Meldung", async () => {
    const anna = await t.nutzer("Anna");
    const ben = await t.nutzer("Ben");
    const importieren = (wer: typeof anna) =>
      wer.post("/rezepte/import", { url: "kein link" });
    expect((await importieren(anna)).status).toBe(400);
    expect((await importieren(anna)).status).toBe(400);
    const gebremst = await importieren(anna);
    expect(gebremst.status).toBe(429);
    expect(gebremst.headers.get("retry-after")).toMatch(/^\d+$/);
    expect(((await gebremst.json()) as { fehler: string }).fehler).toMatch(
      /Zu viele Importe.*Sekunden/,
    );
    // Andere Konten sind nicht betroffen.
    expect((await importieren(ben)).status).toBe(400);
  });

  it("bremst Einladungscodes gegen Durchprobieren", async () => {
    const anna = await t.nutzer("Anna");
    const code = (n: number) =>
      anna.post("/einladungen/annehmen", { code: `FALS-CH0${n}` });
    expect((await code(1)).status).toBe(404);
    expect((await code(2)).status).toBe(404);
    expect((await code(3)).status).toBe(429);
  });

  it("begrenzt Foto-Uploads und den Foto-Speicher des Haushalts", async () => {
    const anna = await t.nutzer("Anna");
    const haushalt = await anna.haushaltAnlegen();
    const hoch = () =>
      anna.senden(`/haushalte/${haushalt}/bilder`, PNG, "image/png");
    // 70 Byte pro Foto, Speicher 150 Byte: zwei passen, das dritte nicht.
    expect((await hoch()).status).toBe(201);
    expect((await hoch()).status).toBe(201);
    const voll = await hoch();
    expect(voll.status).toBe(413);
    expect(((await voll.json()) as { fehler: string }).fehler).toMatch(
      /Foto-Speicher.*voll/,
    );
    // Danach greift die Begrenzung pro Konto (3 Versuche).
    expect((await hoch()).status).toBe(429);
  });
});
