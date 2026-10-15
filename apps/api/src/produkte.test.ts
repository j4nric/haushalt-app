import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { testApp } from "../test/hilfen";

let server: Server;
let anfragen = 0;
let t: ReturnType<typeof testApp>;

beforeAll(async () => {
  // Attrappe von Open Food Facts
  server = createServer((anfrage, antwort) => {
    anfragen++;
    if (anfrage.url?.startsWith("/api/v2/product/4000000000017.json")) {
      antwort.writeHead(200, { "content-type": "application/json" });
      antwort.end(
        JSON.stringify({
          status: 1,
          product: {
            product_name: "Fresh Whole Milk",
            product_name_de: "Frische Vollmilch 3,5 %",
            brands: "Milbona, Lidl",
            quantity: "1 l",
          },
        }),
      );
      return;
    }
    antwort.writeHead(404, { "content-type": "application/json" });
    antwort.end(JSON.stringify({ status: 0 }));
  });
  await new Promise<void>((fertig) => server.listen(0, "127.0.0.1", fertig));
  t = testApp({
    produktQuelle: `http://127.0.0.1:${(server.address() as AddressInfo).port}`,
  });
});
afterAll(async () => {
  server.close();
  await t.beenden();
});

describe("GET /produkte/:barcode", () => {
  it("liefert Name, Marke und Menge – deutscher Name bevorzugt", async () => {
    const anna = await t.nutzer("Anna");
    await t.sql`delete from produkte where barcode in ('4000000000017', '4000000000024')`;
    const antwort = await anna.get("/produkte/4000000000017");
    expect(antwort.status).toBe(200);
    expect(await antwort.json()).toEqual({
      barcode: "4000000000017",
      gefunden: true,
      name: "Frische Vollmilch 3,5 %",
      marke: "Milbona",
      menge: "1 l",
    });
  });

  it("merkt sich Antworten – auch „nicht gefunden“", async () => {
    const anna = await t.nutzer("Anna");
    const vorher = anfragen;
    expect(
      await (await anna.get("/produkte/4000000000017")).json(),
    ).toMatchObject({
      gefunden: true,
    });
    expect(anfragen).toBe(vorher);
    expect(
      await (await anna.get("/produkte/4000000000024")).json(),
    ).toMatchObject({
      gefunden: false,
      name: null,
    });
    await anna.get("/produkte/4000000000024");
    expect(anfragen).toBe(vorher + 1);
  });

  it("lehnt ungültige Codes und fehlende Anmeldung ab", async () => {
    const anna = await t.nutzer("Anna");
    expect((await anna.get("/produkte/12ab")).status).toBe(400);
    expect((await anna.get("/produkte/1234567")).status).toBe(400);
    const ohne = await t.app.request(
      "http://localhost:5173/api/produkte/4000000000017",
    );
    expect(ohne.status).toBe(401);
  });

  it("speichert Barcode-Verknüpfungen, nur mit gültigem Code", async () => {
    const anna = await t.nutzer("Anna");
    const haushalt = await anna.haushaltAnlegen();
    const artikel = crypto.randomUUID();
    const verknuepfung = (barcode: string) => ({
      op: "PUT",
      table: "artikel_barcodes",
      id: crypto.randomUUID(),
      opData: {
        haushalt_id: haushalt,
        artikel_id: artikel,
        barcode,
        erstellt_am: new Date().toISOString(),
      },
    });
    expect(
      (
        await anna.hochladen([
          {
            op: "PUT",
            table: "artikel",
            id: artikel,
            opData: {
              haushalt_id: haushalt,
              name: "Milch",
              standardeinheit: "stueck",
              erstellt_am: new Date().toISOString(),
            },
          },
          verknuepfung("4000000000017"),
        ])
      ).status,
    ).toBe(200);
    expect((await anna.hochladen([verknuepfung("nicht-gueltig")])).status).toBe(
      400,
    );
  });
});
