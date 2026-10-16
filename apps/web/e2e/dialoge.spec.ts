import { devices, expect, test } from "@playwright/test";
import { ean13 } from "./barcode-video";
import { haushaltAnlegen, zuBereich } from "./hilfen";
import { produktAttrappe } from "./produkt-attrappe";

const CODE = ean13(`41${String(Date.now()).slice(-10)}`);
test.beforeAll(() =>
  produktAttrappe({
    [CODE]: {
      product_name_de: "Senf mittelscharf",
      brands: "Develey",
      quantity: "250 ml",
    },
  }),
);

/**
 * Auf dem iPhone scrollte beim Tippen im Scan-Dialog die lange Vorrat-Liste dahinter
 * weg, danach war die Seite gesperrt (vaul schaltet seine iOS-Scroll-Sperre bei per
 * `open` gesteuerten Drawern nicht ein – gepatcht). Echtes iOS gibt es hier nicht;
 * vaul erkennt das iPhone an `navigator.platform`, das reicht für dessen Logik.
 */
test("Scan-Dialog auf dem iPhone: Seite dahinter gesperrt, Name änderbar, nichts hängt", async ({
  playwright,
}) => {
  const browser = await playwright.chromium.launch();
  const ctx = await browser.newContext({
    ...devices["Pixel 7"],
    baseURL: "http://localhost:4173",
  });
  await ctx.addInitScript(() =>
    Object.defineProperty(navigator, "platform", { get: () => "iPhone" }),
  );
  const page = await ctx.newPage();
  try {
    await page.goto("/");
    await page
      .getByRole("button", { name: "Noch kein Konto? Registrieren" })
      .tap();
    await page.getByLabel("Dein Name").fill("Rita");
    await page.getByLabel("E-Mail").fill(`rita-${Date.now()}@test.local`);
    await page.getByLabel("Passwort").fill("ein-sicheres-passwort");
    await page.getByRole("button", { name: "Konto anlegen" }).tap();
    await haushaltAnlegen(page, "Dialog-Haushalt");
    await zuBereich(page, "Vorrat");

    const htmlStil = () =>
      page.evaluate(() => document.documentElement.getAttribute("style") ?? "");

    await page.getByRole("button", { name: "Barcode scannen" }).tap();
    await page.getByLabel("Barcode eintippen").fill(CODE);
    await page.getByRole("button", { name: "Suchen" }).tap();
    const neu = page.getByRole("dialog", { name: "Neues Produkt" });
    const name = neu.getByLabel("… oder neu als").or(neu.getByLabel("Name"));
    await expect(name).toHaveValue("Senf mittelscharf", { timeout: 15_000 });
    // Die iOS-Scroll-Sperre ist aktiv, solange der Dialog offen ist.
    expect(await htmlStil()).toContain("padding-right");

    await name.tap();
    await name.fill("Senf");
    await neu.getByRole("button", { name: /In den Vorrat/ }).tap();
    await expect(neu).toBeHidden();
    // Gleich danach die Details von „Senf“ – schließen.
    const details = page.getByRole("dialog", { name: "Senf" });
    await expect(details).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(details).toBeHidden();
    await expect(page.getByRole("button", { name: "Bestand Senf" })).toHaveText(
      "1",
    );
    // Danach ist alles wieder frei.
    expect(await htmlStil()).not.toContain("padding-right");
    expect(
      await page.evaluate(() => document.body.style.pointerEvents),
    ).not.toBe("none");

    // Notausgang: Bleibt die Sperre ohne offenen Dialog hängen, löst sie sich selbst.
    await page.evaluate(() => {
      document.body.style.pointerEvents = "none";
    });
    await expect
      .poll(() => page.evaluate(() => document.body.style.pointerEvents))
      .toBe("");
    await page.getByRole("button", { name: "Senf mehr" }).tap();
    await expect(page.getByRole("button", { name: "Bestand Senf" })).toHaveText(
      "2",
    );
  } finally {
    await browser.close();
  }
});

/**
 * iPhone-Tastatur: Safari verkleinert nur den „visualViewport“, fest positionierte
 * Leisten blieben dahinter. Nachgestellt mit einem eigenen visualViewport.
 */
test("Eingabeleiste rückt über die Bildschirmtastatur, Navigation weicht", async ({
  browserName,
  playwright,
}) => {
  const browser = await playwright[browserName].launch();
  const ctx = await browser.newContext({
    ...devices["Pixel 7"],
    baseURL: "http://localhost:4173",
  });
  await ctx.addInitScript(() => {
    const vv = new EventTarget() as EventTarget & {
      height: number;
      offsetTop: number;
      width: number;
    };
    vv.height = window.innerHeight;
    vv.offsetTop = 0;
    vv.width = window.innerWidth;
    Object.defineProperty(window, "visualViewport", { get: () => vv });
    (window as unknown as { tastatur: (px: number) => void }).tastatur = (
      px,
    ) => {
      vv.height = window.innerHeight - px;
      vv.dispatchEvent(new Event("resize"));
    };
  });
  const page = await ctx.newPage();
  try {
    await page.goto("/");
    await page
      .getByRole("button", { name: "Noch kein Konto? Registrieren" })
      .tap();
    await page.getByLabel("Dein Name").fill("Tara");
    await page.getByLabel("E-Mail").fill(`tara-${Date.now()}@test.local`);
    await page.getByLabel("Passwort").fill("ein-sicheres-passwort");
    await page.getByRole("button", { name: "Konto anlegen" }).tap();
    await haushaltAnlegen(page, "Tastatur-Haushalt");
    // Das fokussierte Namensfeld ist weg (ohne „focusout“) – Navigation wieder da.
    await expect(
      page.getByRole("navigation", { name: "Bereiche" }),
    ).toBeVisible();
    // Im Vorrat sitzt die Eingabe oben unter der Kopfzeile – keine Tastatur-Probleme.
    await zuBereich(page, "Vorrat");
    const vorratOben = await page
      .getByLabel("Vorratsartikel")
      .evaluate((el) => el.getBoundingClientRect().top);
    expect(vorratOben).toBeLessThan(160);
    await zuBereich(page, "Einkaufsliste");

    // Auf der Liste bleibt sie unten – und rückt über die Tastatur.
    const leiste = page
      .getByLabel("Neuer Eintrag")
      .locator("xpath=ancestor::form[1]");
    const navigation = page.getByRole("navigation", { name: "Bereiche" });
    const abstandUnten = () =>
      leiste.evaluate(
        (el) => window.innerHeight - el.getBoundingClientRect().bottom,
      );

    // Schon beim Antippen ist die Navigation weg – bevor die Tastatur gemeldet wird.
    await page.getByLabel("Neuer Eintrag").tap();
    await expect(navigation).toBeHidden();
    await expect.poll(abstandUnten).toBe(0);

    // Tastatur ist da: Leiste direkt darüber.
    await page.evaluate(() =>
      (window as unknown as { tastatur: (px: number) => void }).tastatur(300),
    );
    await expect.poll(abstandUnten).toBe(300);
    await expect(navigation).toBeHidden();

    // Feld verlassen, Tastatur weg: wieder über der Navigation.
    await page.evaluate(() => {
      (document.activeElement as HTMLElement | null)?.blur();
      (window as unknown as { tastatur: (px: number) => void }).tastatur(0);
    });
    await expect(navigation).toBeVisible();
    const navOben = await navigation.evaluate(
      (el) => window.innerHeight - el.getBoundingClientRect().top,
    );
    await expect
      .poll(async () => Math.abs((await abstandUnten()) - navOben))
      .toBeLessThanOrEqual(1);
  } finally {
    await browser.close();
  }
});
