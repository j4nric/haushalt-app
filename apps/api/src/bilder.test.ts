import { afterAll, describe, expect, it } from "vitest";
import { testApp } from "../test/hilfen";
import { bildFormat } from "./app";

const t = testApp();
afterAll(() => t.beenden());

// Kleinstes gültiges PNG (1×1 Pixel).
const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
  "base64",
);

describe("Fotos", () => {
  it("erkennt Formate an den ersten Bytes", () => {
    expect(bildFormat(PNG)).toBe("image/png");
    expect(bildFormat(Buffer.from([0xff, 0xd8, 0xff, 0xe0]))).toBe(
      "image/jpeg",
    );
    expect(bildFormat(Buffer.from("RIFF0000WEBPVP8 "))).toBe("image/webp");
    expect(bildFormat(Buffer.from("<svg onload=alert(1)>"))).toBeNull();
  });

  it("lädt hoch und liefert nur an Mitglieder des Haushalts aus", async () => {
    const anna = await t.nutzer("Anna");
    const fremd = await t.nutzer("Fremd");
    const haushalt = await anna.haushaltAnlegen();
    await fremd.haushaltAnlegen();

    const hoch = await anna.senden(
      `/haushalte/${haushalt}/bilder`,
      PNG,
      "image/png",
    );
    expect(hoch.status).toBe(201);
    const { url } = (await hoch.json()) as { url: string };
    expect(url).toMatch(/^\/api\/bilder\/[0-9a-f-]{36}$/);

    const pfad = url.replace("/api", "");
    const bild = await anna.get(pfad);
    expect(bild.status).toBe(200);
    expect(bild.headers.get("content-type")).toBe("image/png");
    expect(bild.headers.get("cache-control")).toContain("immutable");
    expect(Buffer.from(await bild.arrayBuffer()).equals(PNG)).toBe(true);

    expect((await fremd.get(pfad)).status).toBe(404);
    expect((await anna.get("/bilder/kein-bild")).status).toBe(404);
  });

  it("lehnt fremde Haushalte, falsche Formate und zu große Dateien ab", async () => {
    const anna = await t.nutzer("Anna");
    const fremd = await t.nutzer("Fremd");
    const haushalt = await anna.haushaltAnlegen();
    expect(
      (await fremd.senden(`/haushalte/${haushalt}/bilder`, PNG, "image/png"))
        .status,
    ).toBe(403);
    expect(
      (
        await anna.senden(
          `/haushalte/${haushalt}/bilder`,
          Buffer.from("<svg/>"),
          "image/svg+xml",
        )
      ).status,
    ).toBe(415);
    const riesig = Buffer.concat([PNG, Buffer.alloc(3 * 1024 * 1024)]);
    expect(
      (await anna.senden(`/haushalte/${haushalt}/bilder`, riesig, "image/png"))
        .status,
    ).toBe(413);
  });

  it("erlaubt eigene Fotos als Rezeptbild, aber keine anderen API-Pfade", async () => {
    const anna = await t.nutzer("Anna");
    const haushalt = await anna.haushaltAnlegen();
    const rezept = (bild: string) => ({
      op: "PUT",
      table: "rezepte",
      id: crypto.randomUUID(),
      opData: {
        haushalt_id: haushalt,
        titel: "Mit Foto",
        bild_url: bild,
        erstellt_am: new Date().toISOString(),
      },
    });
    expect(
      (await anna.hochladen([rezept(`/api/bilder/${crypto.randomUUID()}`)]))
        .status,
    ).toBe(200);
    expect((await anna.hochladen([rezept("/api/haushalte")])).status).toBe(400);
  });
});
