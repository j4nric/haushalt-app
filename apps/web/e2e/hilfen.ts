import { type BrowserType, expect, type Page } from "@playwright/test";
import { Netzwerk } from "./netzwerk";

/**
 * Ein simuliertes Gerät: eigener Browser, eigene lokale Datenbank, eigenes
 * abschaltbares Netz. Registriert sich mit einem frischen Konto.
 */
export async function geraet(browserType: BrowserType, name: string) {
  const netz = await Netzwerk.starten();
  const browser = await browserType.launch({ proxy: netz.proxy });
  const page = await browser.newPage({ baseURL: "http://localhost:4173" });
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

export async function haushaltAnlegen(page: Page, name: string) {
  await page.getByLabel("Name des Haushalts").fill(name);
  await page.getByRole("button", { name: "Neuen Haushalt anlegen" }).click();
  await expect(page.getByRole("heading", { name })).toBeVisible();
  await expect(page.getByTestId("sync-status")).toHaveText(/Online · synchron/);
}

export function eintrag(page: Page, name: string) {
  return page.getByRole("listitem").filter({ hasText: name });
}

export async function hinzufuegen(
  page: Page,
  name: string,
  optionen: { menge?: string; kategorie?: string } = {},
) {
  await page.getByLabel("Neuer Eintrag").fill(name);
  if (optionen.menge) {
    await page.getByLabel("Menge").fill(optionen.menge);
  }
  if (optionen.kategorie) {
    await page
      .getByLabel("Kategorie")
      .selectOption({ label: optionen.kategorie });
  }
  await page.getByRole("button", { name: "Hinzufügen" }).click();
  await expect(eintrag(page, name)).toBeVisible();
}

/** Lädt ein weiteres Gerät per Einladungscode in den Haushalt des ersten ein. */
export async function einladen(von: Page, zu: Page, haushaltName: string) {
  await von.getByRole("button", { name: "Jemanden einladen" }).click();
  const code = (await von.getByTestId("einladungscode").textContent()) ?? "";
  await zu.getByLabel("Einladungscode").fill(code);
  await zu.getByRole("button", { name: "Beitreten" }).click();
  await expect(zu.getByRole("heading", { name: haushaltName })).toBeVisible();
  await expect(zu.getByTestId("sync-status")).toHaveText(/Online · synchron/);
}

export async function zumVorrat(page: Page) {
  await page.getByRole("button", { name: "Vorrat", exact: true }).click();
}

export async function zurListe(page: Page) {
  await page
    .getByRole("button", { name: "Einkaufsliste", exact: true })
    .click();
}

export function bestand(page: Page, artikel: string) {
  return page.getByRole("button", { name: `Bestand ${artikel}` });
}
