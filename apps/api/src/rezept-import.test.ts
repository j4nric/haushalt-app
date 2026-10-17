import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { testApp } from "../test/hilfen";
import {
  istInterneAdresse,
  ohneTracking,
  rezeptAusHtml,
  seiteHolen,
} from "./rezept-import";

const SEITE = `<!doctype html><html><head>
<script type="application/ld+json">{"@context":"https://schema.org","@graph":[
  {"@type":"WebPage","name":"Seite"},
  {"@type":["Recipe"],"name":"Spaghetti &amp; Tomatensauce",
   "recipeYield":["4 Portionen"],
   "image":[{"@type":"ImageObject","url":"/bilder/spaghetti.jpg"}],
   "recipeIngredient":["400 g Spaghetti","1 Dose Tomaten (400 g)","2 EL Oliven&ouml;l"],
   "recipeInstructions":[
     {"@type":"HowToSection","name":"Sauce","itemListElement":[
       {"@type":"HowToStep","text":"Tomaten 15 Minuten köcheln."}]},
     {"@type":"HowToStep","text":"Nudeln <b>al dente</b> kochen."}]}
]}</script></head><body>Rezept</body></html>`;

describe("rezeptAusHtml", () => {
  it("liest Titel, Portionen, Bild, Zutaten und Schritte aus JSON-LD", () => {
    expect(rezeptAusHtml(SEITE, "https://beispiel.de/rezept/1")).toEqual({
      titel: "Spaghetti & Tomatensauce",
      portionen: 4,
      bild_url: "https://beispiel.de/bilder/spaghetti.jpg",
      quelle_url: "https://beispiel.de/rezept/1",
      zutaten: ["400 g Spaghetti", "1 Dose Tomaten (400 g)", "2 EL Olivenöl"],
      schritte: ["Tomaten 15 Minuten köcheln.", "Nudeln al dente kochen."],
    });
  });

  it("verträgt Schritte als einen Text und fehlende Angaben", () => {
    const html = `<script type="application/ld+json">${JSON.stringify({
      "@type": "Recipe",
      name: "Pfannkuchen",
      recipeIngredient: ["2 Eier"],
      recipeInstructions: "Alles verrühren.\nIn der Pfanne backen.",
    })}</script>`;
    expect(rezeptAusHtml(html, "https://x.de/")).toMatchObject({
      titel: "Pfannkuchen",
      portionen: null,
      bild_url: null,
      schritte: ["Alles verrühren.", "In der Pfanne backen."],
    });
  });

  it("löst Verweise per @id auf und nimmt den Autor aus dem Titel (Chefkoch)", () => {
    const basis = "https://www.chefkoch.de/rezepte/1/Eier.html";
    const html = `<html><head>
<meta property="og:image" content="https://img.example/og.jpg">
<script type="application/ld+json">{"@context":"https://schema.org","@graph":[
  {"@type":"Recipe","@id":"${basis}#recipe","name":"Eier in Senfsauce von koch-anna",
   "image":{"@id":"${basis}#primaryimage"},
   "author":{"@id":"https://www.chefkoch.de/user/profil/x#author"},
   "recipeYield":["4","4 Portionen"],
   "recipeIngredient":["6 Eier","2 EL Senf"],
   "recipeInstructions":[{"@type":"HowToStep","text":"Eier kochen."}]},
  {"@type":"ImageObject","@id":"${basis}#primaryimage","url":"https://img.example/eier.jpg"},
  {"@type":"Person","@id":"https://www.chefkoch.de/user/profil/x#author","name":"koch-anna"}
]}</script></head></html>`;
    const r = rezeptAusHtml(
      html,
      `${basis}?utm_source=teilen&utm_medium=x&id=7`,
    );
    expect(r).toMatchObject({
      titel: "Eier in Senfsauce",
      portionen: 4,
      bild_url: "https://img.example/eier.jpg",
      quelle_url: `${basis}?id=7`,
      zutaten: ["6 Eier", "2 EL Senf"],
      schritte: ["Eier kochen."],
    });
  });

  it("nimmt das Vorschaubild, wenn das Rezept keins nennt", () => {
    const html = `<meta content="/og.jpg" property="og:image">
<script type="application/ld+json">{"@type":"Recipe","name":"Suppe","recipeIngredient":["Wasser"]}</script>`;
    expect(rezeptAusHtml(html, "https://beispiel.de/suppe")?.bild_url).toBe(
      "https://beispiel.de/og.jpg",
    );
  });

  it("entfernt Tracking-Zusätze aus Links", () => {
    expect(
      ohneTracking("https://a.de/r.html?utm_source=x&utm_campaign=y&fbclid=1"),
    ).toBe("https://a.de/r.html");
    expect(ohneTracking("https://a.de/r.html?seite=2")).toBe(
      "https://a.de/r.html?seite=2",
    );
  });

  it("findet nichts, wo kein Rezept ist", () => {
    expect(rezeptAusHtml("<html>Hallo</html>", "https://x.de/")).toBeNull();
    expect(
      rezeptAusHtml(
        '<script type="application/ld+json">{kaputt</script>',
        "https://x.de/",
      ),
    ).toBeNull();
  });
});

describe("Schutz vor internen Adressen", () => {
  it.each([
    "127.0.0.1",
    "10.1.2.3",
    "172.20.0.1",
    "192.168.1.10",
    "169.254.169.254",
    "100.64.0.1",
    "0.0.0.0",
    "::1",
    "fd00::1",
    "fe80::1",
    "::ffff:127.0.0.1",
  ])("%s ist intern", (adresse) => {
    expect(istInterneAdresse(adresse)).toBe(true);
  });

  it.each(["8.8.8.8", "62.83.23.90", "2a00:1450::1"])(
    "%s ist öffentlich",
    (adresse) => {
      expect(istInterneAdresse(adresse)).toBe(false);
    },
  );

  it("verweigert lokale Ziele und fremde Protokolle", async () => {
    await expect(seiteHolen("http://127.0.0.1:1/")).rejects.toMatchObject({
      status: 400,
    });
    await expect(seiteHolen("http://localhost/")).rejects.toMatchObject({
      status: 400,
    });
    await expect(seiteHolen("file:///etc/passwd")).rejects.toMatchObject({
      status: 400,
    });
  });
});

describe("POST /rezepte/import", () => {
  const t = testApp();
  let server: Server;
  let basis: string;

  beforeAll(async () => {
    server = createServer((anfrage, antwort) => {
      if (anfrage.url === "/weiter") {
        antwort.writeHead(302, { location: "/rezept" });
        antwort.end();
        return;
      }
      const gibts = anfrage.url === "/rezept" || anfrage.url === "/ohne";
      antwort.writeHead(gibts ? 200 : 404, {
        "content-type": "text/html",
      });
      antwort.end(anfrage.url === "/rezept" ? SEITE : "nichts");
    });
    await new Promise<void>((fertig) => server.listen(0, fertig));
    basis = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  });
  afterAll(async () => {
    server.close();
    await t.beenden();
  });

  it("liefert das Rezept, auch nach einer Weiterleitung", async () => {
    const anna = await t.nutzer("Anna");
    const antwort = await anna.post("/rezepte/import", {
      url: `${basis}/weiter`,
    });
    expect(antwort.status).toBe(200);
    expect(await antwort.json()).toMatchObject({
      titel: "Spaghetti & Tomatensauce",
      quelle_url: `${basis}/rezept`,
      bild_url: `${basis}/bilder/spaghetti.jpg`,
    });
  });

  it("meldet Seiten ohne Rezept, kaputte Links und fehlende Anmeldung", async () => {
    const anna = await t.nutzer("Anna");
    expect(
      (await anna.post("/rezepte/import", { url: `${basis}/leer` })).status,
    ).toBe(502);
    expect(
      (await anna.post("/rezepte/import", { url: `${basis}/ohne` })).status,
    ).toBe(422);
    expect(
      (await anna.post("/rezepte/import", { url: "kein link" })).status,
    ).toBe(400);
    const ohne = await t.app.request(
      "http://localhost:5173/api/rezepte/import",
      {
        method: "POST",
        body: JSON.stringify({ url: `${basis}/rezept` }),
      },
    );
    expect(ohne.status).toBe(401);
  });
});
