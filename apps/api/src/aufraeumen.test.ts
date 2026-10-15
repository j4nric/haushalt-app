import { afterAll, describe, expect, it } from "vitest";
import { ADMIN_EMAIL, testApp } from "../test/hilfen";
import { ungenutzteFotosLoeschen } from "./aufraeumen";

const t = testApp();
afterAll(() => t.beenden());

const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
  "base64",
);

describe("Fotos aufräumen", () => {
  it("löscht nur alte Fotos, die kein Rezept verwendet", async () => {
    const anna = await t.nutzer("Anna");
    const haushalt = await anna.haushaltAnlegen();
    const hochladen = async () =>
      (
        (await (
          await anna.senden(`/haushalte/${haushalt}/bilder`, PNG, "image/png")
        ).json()) as { url: string }
      ).url;
    const genutzt = await hochladen();
    const alt = await hochladen();
    const neu = await hochladen();
    await anna.hochladen([
      {
        op: "PUT",
        table: "rezepte",
        id: crypto.randomUUID(),
        opData: {
          haushalt_id: haushalt,
          titel: "Mit Foto",
          bild_url: genutzt,
          erstellt_am: new Date().toISOString(),
        },
      },
    ]);
    const id = (url: string) => url.split("/").pop() ?? "";
    // Genutztes und ungenutztes Foto „altern“ lassen, das neue bleibt frisch.
    await t.sql`update bilder set erstellt_am = now() - interval '2 days' where id in (${id(genutzt)}, ${id(alt)})`;

    const ergebnis = await ungenutzteFotosLoeschen(t.sql, 24);
    expect(ergebnis.anzahl).toBeGreaterThanOrEqual(1);
    const uebrig = await t.sql<{ id: string }[]>`
      select id from bilder where id in (${id(genutzt)}, ${id(alt)}, ${id(neu)})`;
    expect(uebrig.map((z) => z.id).sort()).toEqual(
      [id(genutzt), id(neu)].sort(),
    );
  });

  it("Admin sieht die Zahlen und kann sofort aufräumen, andere nicht", async () => {
    const admin = await t.nutzer("Admin", { email: ADMIN_EMAIL });
    const anna = await t.nutzer("Anna");
    expect((await anna.post("/admin/fotos-aufraeumen")).status).toBe(403);
    const { fotos } = (await (await admin.get("/admin/uebersicht")).json()) as {
      fotos: { gesamt: number; ungenutzt: number };
    };
    expect(fotos.gesamt).toBeGreaterThanOrEqual(fotos.ungenutzt);
    const antwort = await admin.post("/admin/fotos-aufraeumen");
    expect(antwort.status).toBe(200);
    expect(await antwort.json()).toMatchObject({ anzahl: expect.any(Number) });
  });
});
