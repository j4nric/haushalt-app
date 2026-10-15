import { afterAll, describe, expect, it } from "vitest";
import { ADMIN_EMAIL, testApp } from "../test/hilfen";

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

  it("legt Haushalte an, auch mehrere pro Konto", async () => {
    const anna = await t.nutzer("Anna");
    const id = await anna.haushaltAnlegen("Familie Muster");

    const [mitglied] =
      await t.sql`select rolle, anzeigename from haushalt_mitglieder where haushalt_id = ${id}`;
    expect(mitglied).toEqual({ rolle: "besitzer", anzeigename: "Anna" });
    expect((await anna.post("/haushalte", { name: "WG" })).status).toBe(201);
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

describe("Mehrere Haushalte und Verlassen", () => {
  it("lässt Mitglieder eines Haushalts nicht noch einmal beitreten", async () => {
    const anna = await t.nutzer("Anna");
    const haushalt = await anna.haushaltAnlegen();
    const { code } = (await (
      await anna.post(`/haushalte/${haushalt}/einladungen`)
    ).json()) as { code: string };
    expect((await anna.post("/einladungen/annehmen", { code })).status).toBe(
      409,
    );
  });

  it("übergibt beim Verlassen die Besitzer-Rolle und löscht erst beim letzten", async () => {
    const anna = await t.nutzer("Anna");
    const ben = await t.nutzer("Ben");
    const haushalt = await anna.haushaltAnlegen();
    const { code } = (await (
      await anna.post(`/haushalte/${haushalt}/einladungen`)
    ).json()) as { code: string };
    await ben.post("/einladungen/annehmen", { code });

    const raus = await anna.loeschen(`/haushalte/${haushalt}/mitgliedschaft`);
    expect(await raus.json()).toEqual({ geloescht: false });
    const [rolle] = await t.sql`
      select rolle from haushalt_mitglieder where haushalt_id = ${haushalt} and nutzer_id = ${ben.id}`;
    expect(rolle).toEqual({ rolle: "besitzer" });
    // Wer draußen ist, kann nicht noch einmal gehen.
    expect(
      (await anna.loeschen(`/haushalte/${haushalt}/mitgliedschaft`)).status,
    ).toBe(403);

    const zuletzt = await ben.loeschen(`/haushalte/${haushalt}/mitgliedschaft`);
    expect(await zuletzt.json()).toEqual({ geloescht: true });
    expect(
      await t.sql`select 1 from haushalte where id = ${haushalt}`,
    ).toHaveLength(0);
  });
});

describe("Admin", () => {
  it("zeigt Admins alle Konten mit Haushalten, anderen nicht", async () => {
    const admin = await t.nutzer("Admin", { email: ADMIN_EMAIL });
    const anna = await t.nutzer("Anna");
    await anna.haushaltAnlegen("Annas WG");

    expect(await (await admin.get("/ich")).json()).toEqual({ admin: true });
    expect(await (await anna.get("/ich")).json()).toEqual({ admin: false });
    expect((await anna.get("/admin/uebersicht")).status).toBe(403);

    const { nutzer, zahlen } = (await (
      await admin.get("/admin/uebersicht")
    ).json()) as {
      nutzer: {
        id: string;
        haushalte: { name: string; rolle: string; mitglieder: number }[];
      }[];
      zahlen: { haushalte: number };
    };
    expect(nutzer.find((n) => n.id === anna.id)?.haushalte).toEqual([
      expect.objectContaining({
        name: "Annas WG",
        rolle: "besitzer",
        mitglieder: 1,
      }),
    ]);
    expect(nutzer.find((n) => n.id === admin.id)?.haushalte).toEqual([]);
    expect(zahlen.haushalte).toBeGreaterThan(0);
  });
});

describe("Gesundheit", () => {
  it("meldet ok, wenn App und Datenbank laufen – auch ohne Anmeldung", async () => {
    const antwort = await t.app.request("http://localhost:5173/api/health");
    expect(antwort.status).toBe(200);
    expect(await antwort.json()).toEqual({ ok: true });
  });
});
