import { type BrowserType, expect, type Page, test } from "@playwright/test";
import { Netzwerk } from "./netzwerk";

/**
 * Kernszenario des Prototyps: Zwei Geräte teilen eine Liste. Eins verliert das
 * Netz (Supermarkt), ändert etwas, und nach dem Wiederverbinden sind beide auf
 * demselben Stand. Jedes Gerät ist ein eigener Browser mit eigener lokaler
 * Datenbank und eigenem, abschaltbarem Netz.
 */
async function geraet(browserType: BrowserType) {
  const netz = await Netzwerk.starten();
  const browser = await browserType.launch({ proxy: netz.proxy });
  const page = await browser.newPage({ baseURL: "http://localhost:5173" });
  await page.goto("/");
  await expect(page.getByTestId("sync-status")).toHaveText(/Online · synchron/);
  return {
    page,
    netz,
    async schliessen() {
      await browser.close();
      await netz.beenden();
    },
  };
}

function eintrag(page: Page, name: string) {
  return page.getByRole("listitem").filter({ hasText: name });
}

async function hinzufuegen(page: Page, name: string) {
  await page.getByLabel("Neuer Eintrag").fill(name);
  await page.getByRole("button", { name: "Hinzufügen" }).click();
  await expect(eintrag(page, name)).toBeVisible();
}

test("Änderungen eines Offline-Geräts kommen nach dem Wiederverbinden an", async ({
  browserName,
  playwright,
}) => {
  const browserType = playwright[browserName];
  const lauf = Date.now().toString(36);
  const milch = `Milch ${lauf}`;
  const brot = `Brot ${lauf}`;

  const handy = await geraet(browserType);
  const laptop = await geraet(browserType);

  try {
    // 1. Online: Eintrag erscheint auf dem anderen Gerät.
    await hinzufuegen(handy.page, milch);
    await expect(eintrag(laptop.page, milch)).toBeVisible();

    // 2. Handy verliert das Netz und hakt ab. Lokal sofort sichtbar, Laptop weiß nichts davon.
    handy.netz.offline();
    await expect(handy.page.getByTestId("sync-status")).toHaveText(/Offline/);
    await eintrag(handy.page, milch).getByRole("checkbox").click();
    await expect(
      eintrag(handy.page, milch).getByRole("checkbox"),
    ).toBeChecked();

    // Währenddessen ergänzt der Laptop etwas, das Handy bekommt es noch nicht.
    await hinzufuegen(laptop.page, brot);
    await expect(
      eintrag(laptop.page, milch).getByRole("checkbox"),
    ).not.toBeChecked();
    await expect(eintrag(handy.page, brot)).toHaveCount(0);

    // 3. Wieder Netz: beide Änderungen kommen auf beiden Geräten an.
    handy.netz.wiederOnline();
    await expect(eintrag(laptop.page, milch).getByRole("checkbox")).toBeChecked(
      { timeout: 30_000 },
    );
    await expect(eintrag(handy.page, brot)).toBeVisible({ timeout: 30_000 });

    // Aufräumen, damit die Liste nicht mit Testdaten vollläuft.
    for (const name of [milch, brot]) {
      await eintrag(laptop.page, name)
        .getByRole("button", { name: `${name} löschen` })
        .click();
      await expect(eintrag(handy.page, name)).toHaveCount(0);
    }
  } finally {
    await handy.schliessen();
    await laptop.schliessen();
  }
});
