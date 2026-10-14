import { afterAll, describe, expect, it } from "vitest";
import { testApp } from "../test/hilfen";

const t = testApp();
afterAll(() => t.beenden());

describe("Haushalt und Einladungen", () => {
  it("lehnt Anfragen ohne Anmeldung ab", async () => {
    const antwort = await t.app.request("http://localhost:5173/api/haushalte", {
      method: "POST",
      body: "{}",
    });
    expect(antwort.status).toBe(401);
  });

  it("legt einen Haushalt an, aber nur einen pro Nutzer", async () => {
    const anna = await t.nutzer("Anna");
    const id = await anna.haushaltAnlegen("Familie Muster");

    const [mitglied] =
      await t.sql`select rolle, anzeigename from haushalt_mitglieder where haushalt_id = ${id}`;
    expect(mitglied).toEqual({ rolle: "besitzer", anzeigename: "Anna" });
    expect((await anna.post("/haushalte", { name: "Zweiter" })).status).toBe(
      409,
    );
  });

  it("lässt per Einladungscode beitreten, jeder Code gilt einmal", async () => {
    const anna = await t.nutzer("Anna");
    const ben = await t.nutzer("Ben");
    const carla = await t.nutzer("Carla");
    const haushalt = await anna.haushaltAnlegen();

    const res = await anna.post(`/haushalte/${haushalt}/einladungen`);
    expect(res.status).toBe(201);
    const { code } = (await res.json()) as { code: string };
    expect(code).toMatch(/^[A-Z2-9]{4}-[A-Z2-9]{4}$/);

    // Tippfehler-tolerant: Kleinbuchstaben, ohne Bindestrich
    const beitritt = await ben.post("/einladungen/annehmen", {
      code: code.replace("-", "").toLowerCase(),
    });
    expect(beitritt.status).toBe(200);
    expect(await beitritt.json()).toEqual({ id: haushalt });

    expect((await carla.post("/einladungen/annehmen", { code })).status).toBe(
      404,
    );
  });

  it("erlaubt Einladungen nur für den eigenen Haushalt", async () => {
    const anna = await t.nutzer("Anna");
    const fremd = await t.nutzer("Fremd");
    const haushalt = await anna.haushaltAnlegen();

    expect(
      (await fremd.post(`/haushalte/${haushalt}/einladungen`)).status,
    ).toBe(403);
  });
});

describe("PowerSync-Token", () => {
  it("enthält nur die Nutzer-ID und passt zur JWKS", async () => {
    const anna = await t.nutzer("Anna");
    const res = await anna.get("/auth/token");
    expect(res.status).toBe(200);
    const { token } = (await res.json()) as { token: string };

    const [kopf, inhalt] = token
      .split(".")
      .slice(0, 2)
      .map((teil) => JSON.parse(Buffer.from(teil, "base64url").toString()));
    expect(inhalt).toMatchObject({ sub: anna.id, aud: "powersync" });
    expect(inhalt).not.toHaveProperty("email");
    expect(inhalt.exp - inhalt.iat).toBeLessThanOrEqual(60 * 60);

    const jwks = (await (
      await t.app.request("http://localhost:5173/api/auth/jwks")
    ).json()) as {
      keys: { kid: string }[];
    };
    expect(jwks.keys.map((k) => k.kid)).toContain(kopf.kid);
  });
});
