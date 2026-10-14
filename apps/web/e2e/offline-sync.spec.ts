import { type BrowserType, expect, type Page, test } from "@playwright/test";
import { Netzwerk } from "./netzwerk";

/**
 * Kernszenario: Zwei Mitglieder eines Haushalts teilen eine Liste. Eins verliert
 * das Netz (Supermarkt), ändert etwas, und nach dem Wiederverbinden sind beide
 * auf demselben Stand. Ein fremder Haushalt bekommt davon nichts zu sehen.
 * Jedes Gerät ist ein eigener Browser mit eigener lokaler Datenbank und
 * eigenem, abschaltbarem Netz.
 */
async function geraet(browserType: BrowserType, name: string) {
  const netz = await Netzwerk.starten();
  const browser = await browserType.launch({ proxy: netz.proxy });
  const page = await browser.newPage({ baseURL: "http://localhost:5173" });
  await page.goto("/");

  await page
    .getByRole("button", { name: "Noch kein Konto? Registrieren" })
    .click();
  await page.getByLabel("Dein Name").fill(name);
  await page
    .getByLabel("E-Mail")
    .fill(`${name.toLowerCase()}-${Date.now()}@test.local`);
  await page.getByLabel("Passwort").fill("ein-sicheres-passwort");
  await page.getByRole("button", { name: "Konto anlegen" }).click();
  await expect(
    page.getByRole("heading", { name: "Haushalt einrichten" }),
  ).toBeVisible();

  return {
    page,
    netz,
    async schliessen() {
      await browser.close();
      await netz.beenden();
    },
  };
}

async function haushaltAnlegen(page: Page, name: string) {
  await page.getByLabel("Name des Haushalts").fill(name);
  await page.getByRole("button", { name: "Neuen Haushalt anlegen" }).click();
  await expect(page.getByRole("heading", { name })).toBeVisible();
  await expect(page.getByTestId("sync-status")).toHaveText(/Online · synchron/);
}

function eintrag(page: Page, name: string) {
  return page.getByRole("listitem").filter({ hasText: name });
}

async function hinzufuegen(page: Page, name: string, menge?: string) {
  await page.getByLabel("Neuer Eintrag").fill(name);
  if (menge) {
    await page.getByLabel("Menge").fill(menge);
  }
  await page.getByRole("button", { name: "Hinzufügen" }).click();
  await expect(eintrag(page, name)).toBeVisible();
}

test("Haushalt teilen und offline einkaufen", async ({
  browserName,
  playwright,
}) => {
  const browserType = playwright[browserName];
  const lauf = Date.now().toString(36);
  const milch = `Milch ${lauf}`;
  const brot = `Brot ${lauf}`;

  const anna = await geraet(browserType, "Anna");
  const ben = await geraet(browserType, "Ben");
  const fremd = await geraet(browserType, "Fremd");

  try {
    // 1. Anna legt den Haushalt an und lädt Ben ein.
    await haushaltAnlegen(anna.page, `Haushalt ${lauf}`);
    await anna.page.getByRole("button", { name: "Jemanden einladen" }).click();
    const code =
      (await anna.page.getByTestId("einladungscode").textContent()) ?? "";
    await ben.page.getByLabel("Einladungscode").fill(code);
    await ben.page.getByRole("button", { name: "Beitreten" }).click();
    await expect(
      ben.page.getByRole("heading", { name: `Haushalt ${lauf}` }),
    ).toBeVisible();
    await expect(anna.page.getByText("Anna, Ben")).toBeVisible();

    // Ein fremder Haushalt daneben.
    await haushaltAnlegen(fremd.page, `Fremd ${lauf}`);

    // 2. Online: Eintrag mit Menge erscheint beim anderen Mitglied.
    await hinzufuegen(anna.page, milch, "2");
    await expect(eintrag(ben.page, milch)).toContainText("2 Stk.");

    // 3. Anna verliert das Netz und hakt ab; Ben ergänzt derweil etwas.
    anna.netz.offline();
    await expect(anna.page.getByTestId("sync-status")).toHaveText(/Offline/);
    await eintrag(anna.page, milch).getByRole("checkbox").click();
    await expect(eintrag(anna.page, milch).getByRole("checkbox")).toBeChecked();

    await hinzufuegen(ben.page, brot);
    await expect(
      eintrag(ben.page, milch).getByRole("checkbox"),
    ).not.toBeChecked();
    await expect(eintrag(anna.page, brot)).toHaveCount(0);

    // 4. Wieder Netz: beide Änderungen kommen an, inklusive wer abgehakt hat.
    anna.netz.wiederOnline();
    await expect(eintrag(ben.page, milch).getByRole("checkbox")).toBeChecked({
      timeout: 30_000,
    });
    await expect(eintrag(ben.page, milch)).toContainText("Anna");
    await expect(eintrag(anna.page, brot)).toBeVisible({ timeout: 30_000 });

    // 5. Der fremde Haushalt hat davon nichts bekommen.
    await expect(fremd.page.getByTestId("sync-status")).toHaveText(
      /Online · synchron/,
    );
    await expect(fremd.page.getByRole("listitem")).toHaveCount(0);
    await expect(fremd.page.getByText("Die Liste ist leer.")).toBeVisible();
  } finally {
    await anna.schliessen();
    await ben.schliessen();
    await fremd.schliessen();
  }
});
