import { devices, expect, type Locator, test } from "@playwright/test";
import { haushaltAnlegen, zuBereich } from "./hilfen";

/** Finger auf `ziel` setzen und um `dy` px nach unten ziehen (echte Touch-Ereignisse). */
async function wischen(ziel: Locator, dy: number, dauerMs = 150) {
  await ziel.evaluate(
    async (el, { dy, dauerMs }) => {
      const r = el.getBoundingClientRect();
      const x = r.left + r.width / 2;
      const y = r.top + Math.min(r.height / 2, 200);
      const punkt = (yy: number) =>
        new Touch({ identifier: 1, target: el, clientX: x, clientY: yy });
      const senden = (typ: string, yy: number) =>
        el.dispatchEvent(
          new TouchEvent(typ, {
            bubbles: true,
            cancelable: true,
            touches: typ === "touchend" ? [] : [punkt(yy)],
            changedTouches: [punkt(yy)],
          }),
        );
      senden("touchstart", y);
      const schritte = 10;
      for (let i = 1; i <= schritte; i++) {
        await new Promise((f) => setTimeout(f, dauerMs / schritte));
        senden("touchmove", y + (dy * i) / schritte);
      }
      senden("touchend", y + dy);
    },
    { dy, dauerMs },
  );
}

test("Fenster schließen mit Wischen nach unten – überall, aber nicht beim Scrollen", async ({
  playwright,
}) => {
  const browser = await playwright.chromium.launch();
  const ctx = await browser.newContext({
    ...devices["Pixel 7"],
    baseURL: "http://localhost:4173",
  });
  const page = await ctx.newPage();
  try {
    await page.goto("/");
    await page
      .getByRole("button", { name: "Noch kein Konto? Registrieren" })
      .tap();
    await page.getByLabel("Dein Name").fill("Wanda");
    await page.getByLabel("E-Mail").fill(`wanda-${Date.now()}@test.local`);
    await page.getByLabel("Passwort").fill("ein-sicheres-passwort");
    await page.getByRole("button", { name: "Konto anlegen" }).tap();
    await haushaltAnlegen(page, "Wisch-Haushalt");
    await zuBereich(page, "Vorrat");
    await page.getByLabel("Vorratsartikel").fill("Spaghetti");
    await page.getByRole("button", { name: "Eintragen" }).tap();
    const details = page.getByRole("dialog", { name: "Spaghetti" });
    await expect(details).toBeVisible();
    await expect
      .poll(async () => (await details.boundingBox())?.y ?? 9999)
      .toBeLessThan(500);

    // Kurz und langsam gezogen: federt zurück.
    await wischen(details, 50, 600);
    await page.waitForTimeout(400);
    await expect(details).toBeVisible();
    expect(await details.evaluate((el) => el.style.transform)).toBe("");

    // Mitten im Fenster kräftig nach unten: zu.
    await wischen(details, 260);
    await expect(details).toBeHidden();
    // Danach ist alles bedienbar.
    await page.getByRole("button", { name: "Spaghetti mehr" }).tap();
    await expect(
      page.getByRole("button", { name: "Bestand Spaghetti" }),
    ).toHaveText("2");

    // Im heruntergescrollten Rezept scrollt die Geste, statt zu schließen.
    await page.goto("/#rezepte/entdecken");
    await page.getByLabel("Sammlung durchsuchen").fill("Bolognese");
    await page.getByRole("button", { name: /^Spaghetti Bolognese/ }).tap();
    const vorschau = page.getByRole("dialog", { name: "Spaghetti Bolognese" });
    await expect
      .poll(async () => (await vorschau.boundingBox())?.y ?? 9999)
      .toBeLessThan(200);
    const gescrollt = await vorschau.evaluate((el) => {
      const s = [el, ...el.querySelectorAll("*")].find(
        (k) =>
          k.scrollHeight > k.clientHeight + 20 &&
          getComputedStyle(k).overflowY !== "visible",
      );
      if (!s) return false;
      s.scrollTop = 200;
      return s.scrollTop > 0;
    });
    expect(gescrollt).toBe(true);
    await wischen(vorschau.getByText("Zubereitung").first(), 260);
    await page.waitForTimeout(500);
    await expect(vorschau).toBeVisible();
  } finally {
    await browser.close();
  }
});
