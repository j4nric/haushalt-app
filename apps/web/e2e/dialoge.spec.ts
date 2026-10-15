import { createServer, type Server } from "node:http";
import { devices, expect, test } from "@playwright/test";
import { ean13 } from "./barcode-video";
import { haushaltAnlegen, zuBereich } from "./hilfen";

const CODE = ean13(`41${String(Date.now()).slice(-10)}`);
let attrappe: Server;
test.beforeAll(async () => {
  attrappe = createServer((anfrage, antwort) => {
    const passt = anfrage.url?.startsWith(`/api/v2/product/${CODE}.json`);
    antwort.writeHead(passt ? 200 : 404, {
      "content-type": "application/json",
    });
    antwort.end(
      JSON.stringify(
        passt
          ? {
              status: 1,
              product: {
                product_name_de: "Senf mittelscharf",
                brands: "Develey",
                quantity: "250 ml",
              },
            }
          : { status: 0 },
      ),
    );
  });
  await new Promise<void>((f) => attrappe.listen(4180, "127.0.0.1", f));
});
test.afterAll(() => attrappe.close());

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
