import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { neueId, testApp } from "../test/hilfen";
import {
  type Abo,
  aufzaehlen,
  berlin,
  istPushAdresse,
  type Nachricht,
} from "./benachrichtigungen";

let gesendet: { endpoint: string; nachricht: Nachricht }[] = [];
/** Endpoints, die der Push-Dienst nicht mehr kennt. */
const weg = new Set<string>();
const t = testApp({
  push: {
    sender: async (abo: Abo, nachricht: Nachricht) => {
      if (weg.has(abo.endpoint)) {
        return "weg";
      }
      gesendet.push({ endpoint: abo.endpoint, nachricht });
      return "ok";
    },
    einkaufPauseMs: 60 * 60_000,
  },
});
afterAll(() => t.beenden());
beforeEach(() => {
  gesendet = [];
});

const jetzt = () => new Date().toISOString();
const endpointFuer = (wer: string) =>
  `https://fcm.googleapis.com/fcm/send/${wer}-${neueId()}`;

async function haushaltMitZwei() {
  const anna = await t.nutzer("Anna");
  const ben = await t.nutzer("Ben");
  const haushalt = await anna.haushaltAnlegen("WG");
  const { code } = (await (
    await anna.post(`/haushalte/${haushalt}/einladungen`)
  ).json()) as { code: string };
  expect((await ben.post("/einladungen/annehmen", { code })).status).toBe(200);
  return { anna, ben, haushalt };
}

async function abonnieren(
  wer: Awaited<ReturnType<typeof t.nutzer>>,
  arten: string[] = ["liste", "einkauf", "plan_heute", "mitglied", "rezept"],
) {
  const endpoint = endpointFuer(wer.id);
  const res = await wer.put("/push/abo", {
    endpoint,
    keys: { p256dh: "p256dh-schluessel", auth: "auth-schluessel" },
    arten,
  });
  expect(res.status).toBe(200);
  return endpoint;
}

async function artikelAufListe(
  wer: Awaited<ReturnType<typeof t.nutzer>>,
  haushalt: string,
  namen: string[],
) {
  const ops = namen.flatMap((name) => {
    const artikel = neueId();
    return [
      {
        op: "PUT",
        table: "artikel",
        id: artikel,
        opData: { haushalt_id: haushalt, name, erstellt_am: jetzt() },
      },
      {
        op: "PUT",
        table: "listeneintraege",
        id: neueId(),
        opData: {
          haushalt_id: haushalt,
          artikel_id: artikel,
          erledigt: 0,
          erstellt_am: jetzt(),
        },
      },
    ];
  });
  expect((await wer.hochladen(ops)).status).toBe(200);
  return ops.filter((o) => o.table === "listeneintraege").map((o) => o.id);
}

describe("Benachrichtigungen", () => {
  it("bündelt Neues auf der Liste und meldet es nur den anderen", async () => {
    const { anna, ben, haushalt } = await haushaltMitZwei();
    const annasGeraet = await abonnieren(anna);
    const bensGeraet = await abonnieren(ben);
    await t.benachrichtiger?.leeren();
    gesendet = [];

    await artikelAufListe(anna, haushalt, ["Milch", "Brot"]);
    await artikelAufListe(anna, haushalt, ["Eier", "Butter", "Käse"]);
    expect(gesendet).toEqual([]);
    await t.benachrichtiger?.leeren();

    expect(gesendet).toEqual([
      {
        endpoint: bensGeraet,
        nachricht: {
          titel: "🛒 Neu auf der Liste",
          text: "Anna: Milch, Brot und 3 weitere",
          url: `/?haushalt=${haushalt}`,
          kennung: `liste-${haushalt}`,
        },
      },
    ]);
    expect(gesendet.some((g) => g.endpoint === annasGeraet)).toBe(false);
  });

  it("lässt schon wieder Abgehaktes weg und schweigt, wenn nichts übrig ist", async () => {
    const { anna, ben, haushalt } = await haushaltMitZwei();
    await abonnieren(ben);
    const [eintrag] = await artikelAufListe(anna, haushalt, ["Milch"]);
    await anna.hochladen([
      {
        op: "PATCH",
        table: "listeneintraege",
        id: eintrag,
        opData: { erledigt: 1 },
      },
    ]);
    await t.benachrichtiger?.leeren();
    expect(gesendet.filter((g) => g.nachricht.titel.includes("Liste"))).toEqual(
      [],
    );
  });

  it("meldet „kauft gerade ein“ beim ersten Abhaken, danach eine Weile nicht", async () => {
    const { anna, ben, haushalt } = await haushaltMitZwei();
    await abonnieren(anna);
    await abonnieren(ben);
    const eintraege = await artikelAufListe(anna, haushalt, ["A", "B"]);
    await t.benachrichtiger?.leeren();
    gesendet = [];

    for (const id of eintraege) {
      await ben.hochladen([
        { op: "PATCH", table: "listeneintraege", id, opData: { erledigt: 1 } },
      ]);
    }
    await t.benachrichtiger?.leeren();
    expect(gesendet.map((g) => g.nachricht.titel)).toEqual([
      "🏃 Ben kauft gerade ein",
    ]);
  });

  it("respektiert die gewählten Arten und vergisst abgemeldete Geräte", async () => {
    const { anna, ben, haushalt } = await haushaltMitZwei();
    await abonnieren(ben, ["rezept"]);
    await artikelAufListe(anna, haushalt, ["Milch"]);
    const rezept = neueId();
    await anna.hochladen([
      {
        op: "PUT",
        table: "rezepte",
        id: rezept,
        opData: {
          haushalt_id: haushalt,
          titel: "Gemüsecurry",
          erstellt_am: jetzt(),
        },
      },
    ]);
    await t.benachrichtiger?.leeren();
    expect(gesendet.map((g) => g.nachricht)).toEqual([
      {
        titel: "📖 Neues Rezept von Anna",
        text: "Gemüsecurry",
        url: `/?haushalt=${haushalt}#rezepte/${rezept}`,
      },
    ]);

    // Der Push-Dienst kennt das Gerät nicht mehr → Abo wird gelöscht.
    const [{ endpoint } = { endpoint: "" }] = await t.sql<
      { endpoint: string }[]
    >`
      select endpoint from push_abos where nutzer_id = ${ben.id}
    `;
    weg.add(endpoint);
    await anna.hochladen([
      {
        op: "PUT",
        table: "rezepte",
        id: neueId(),
        opData: { haushalt_id: haushalt, titel: "Pizza", erstellt_am: jetzt() },
      },
    ]);
    await t.benachrichtiger?.leeren();
    expect(
      await t.sql`select 1 from push_abos where nutzer_id = ${ben.id}`,
    ).toHaveLength(0);
  });

  it("meldet neue Mitglieder", async () => {
    const anna = await t.nutzer("Anna");
    const haushalt = await anna.haushaltAnlegen("Familie");
    await abonnieren(anna);
    const { code } = (await (
      await anna.post(`/haushalte/${haushalt}/einladungen`)
    ).json()) as { code: string };
    const carla = await t.nutzer("Carla");
    await carla.post("/einladungen/annehmen", { code });
    await t.benachrichtiger?.leeren();
    expect(gesendet.map((g) => g.nachricht.titel)).toEqual([
      "👋 Carla ist dabei",
    ]);
  });

  it("erinnert einmal am Tag an das Gericht von heute und was dafür noch fehlt", async () => {
    const { anna, ben, haushalt } = await haushaltMitZwei();
    const bensGeraet = await abonnieren(ben);
    await abonnieren(anna);
    const rezept = neueId();
    const tag = "2026-10-15";
    await artikelAufListe(anna, haushalt, ["Kokosmilch", "Klopapier"]);
    await anna.hochladen([
      {
        op: "PUT",
        table: "rezepte",
        id: rezept,
        opData: {
          haushalt_id: haushalt,
          titel: "Gemüsecurry",
          erstellt_am: jetzt(),
        },
      },
      ...["Kokosmilch", "Reis"].map((name, position) => ({
        op: "PUT",
        table: "rezept_zutaten",
        id: neueId(),
        opData: { haushalt_id: haushalt, rezept_id: rezept, position, name },
      })),
      {
        op: "PUT",
        table: "plan_eintraege",
        id: neueId(),
        opData: {
          haushalt_id: haushalt,
          datum: tag,
          rezept_id: rezept,
          titel: "Gemüsecurry",
          erledigt: 0,
          erstellt_am: jetzt(),
        },
      },
    ]);
    await t.benachrichtiger?.leeren();
    gesendet = [];

    // 15 Uhr Berlin: noch zu früh. 16:05 Uhr: raus – an alle, auch an Anna.
    const b = t.benachrichtiger;
    await b?.planHeute(new Date("2026-10-15T13:00:00Z"));
    expect(gesendet).toEqual([]);
    await b?.planHeute(new Date("2026-10-15T14:05:00Z"));
    const meineNachricht = gesendet.find((g) => g.endpoint === bensGeraet);
    expect(meineNachricht?.nachricht).toEqual({
      titel: "🍳 Heute gibt's Gemüsecurry",
      text: "Noch auf der Liste: Kokosmilch",
      url: `/?haushalt=${haushalt}#plan`,
      kennung: "plan_heute",
    });
    expect(gesendet).toHaveLength(2);

    // Nur einmal am Tag.
    gesendet = [];
    await b?.planHeute(new Date("2026-10-15T15:00:00Z"));
    expect(gesendet).toEqual([]);
  });

  it("nimmt nur gültige Abos von bekannten Push-Diensten an", async () => {
    const anna = await t.nutzer("Anna");
    const abo = (endpoint: string, arten: unknown = ["liste"]) =>
      anna.put("/push/abo", {
        endpoint,
        keys: { p256dh: "a", auth: "b" },
        arten,
      });
    expect((await abo("http://169.254.169.254/latest")).status).toBe(400);
    expect((await abo("https://evil.example/push")).status).toBe(400);
    expect((await abo(endpointFuer("x"), ["alles"])).status).toBe(400);

    const endpoint = endpointFuer("anna");
    expect((await abo(endpoint, ["liste", "liste", "plan"])).status).toBe(200);
    const res = await anna.get(
      `/push/abo?endpoint=${encodeURIComponent(endpoint)}`,
    );
    expect(await res.json()).toEqual({ arten: ["liste", "plan"] });

    // Fremde sehen das Abo nicht.
    const ben = await t.nutzer("Ben");
    expect(
      (await ben.get(`/push/abo?endpoint=${encodeURIComponent(endpoint)}`))
        .status,
    ).toBe(404);

    expect((await anna.post("/push/test", { endpoint })).status).toBe(200);
    expect(gesendet.at(-1)?.nachricht.titel).toBe("🔔 Es klappt!");

    expect(
      (await anna.anfrage("DELETE", "/push/abo", { endpoint })).status,
    ).toBe(204);
    expect((await anna.post("/push/test", { endpoint })).status).toBe(404);
  });
});

describe("Hilfen", () => {
  it("zählt auf", () => {
    expect(aufzaehlen(["A"])).toBe("A");
    expect(aufzaehlen(["A", "B"])).toBe("A und B");
    expect(aufzaehlen(["A", "B", "C"])).toBe("A, B und C");
    expect(aufzaehlen(["A", "B", "C", "D"])).toBe("A, B und 2 weitere");
  });

  it("rechnet in Berliner Zeit, auch über die Zeitumstellung", () => {
    expect(berlin(new Date("2026-07-01T14:30:00Z"))).toEqual({
      tag: "2026-07-01",
      stunde: 16,
    });
    expect(berlin(new Date("2026-12-31T23:30:00Z"))).toEqual({
      tag: "2027-01-01",
      stunde: 0,
    });
  });

  it("erkennt Push-Adressen", () => {
    expect(istPushAdresse("https://web.push.apple.com/abc")).toBe(true);
    expect(istPushAdresse("https://updates.push.services.mozilla.com/x")).toBe(
      true,
    );
    expect(istPushAdresse("https://googleapis.com.evil.de/x")).toBe(false);
    expect(istPushAdresse("http://fcm.googleapis.com/x")).toBe(false);
  });
});
