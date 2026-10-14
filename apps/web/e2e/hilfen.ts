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

/** Eine Zeile der Liste (nur im Hauptbereich, nicht z. B. eine Benachrichtigung). */
export function eintrag(page: Page, name: string) {
  return page.getByRole("main").getByRole("listitem").filter({ hasText: name });
}

export async function hinzufuegen(
  page: Page,
  name: string,
  optionen: { menge?: string; kategorie?: string } = {},
) {
  await page.getByLabel("Neuer Eintrag").fill(name);
  if (optionen.menge || optionen.kategorie) {
    await detailsOeffnen(page);
  }
  if (optionen.menge) {
    await page.getByLabel("Menge", { exact: true }).fill(optionen.menge);
  }
  if (optionen.kategorie) {
    await page
      .getByLabel("Kategorie", { exact: true })
      .selectOption({ label: optionen.kategorie });
  }
  await page.getByRole("button", { name: "Hinzufügen" }).click();
  await expect(eintrag(page, name)).toBeVisible();
}

/** Klappt Menge/Einheit/Kategorie in der Eingabeleiste auf (falls noch zu). */
export async function detailsOeffnen(page: Page) {
  const knopf = page.getByRole("button", { name: "Menge und Kategorie" });
  if ((await knopf.getAttribute("aria-expanded")) !== "true") {
    await knopf.click();
  }
}

/** Lädt ein weiteres Gerät per Einladungscode in den Haushalt des ersten ein. */
export async function einladen(
  von: Page,
  zu: Page,
  haushaltName: string,
  neuesMitglied: string,
) {
  await zuBereich(von, "Haushalt");
  await von.getByRole("button", { name: "Jemanden einladen" }).click();
  const code = (await von.getByTestId("einladungscode").textContent()) ?? "";
  await zu.getByLabel("Einladungscode").fill(code);
  await zu.getByRole("button", { name: "Beitreten" }).click();
  await expect(zu.getByRole("heading", { name: haushaltName })).toBeVisible();
  await expect(zu.getByTestId("sync-status")).toHaveText(/Online · synchron/);
  await expect(
    von.getByRole("listitem").filter({ hasText: neuesMitglied }),
  ).toBeVisible();
  await zuBereich(von, "Einkaufsliste");
}

export async function zuBereich(
  page: Page,
  bereich: "Einkaufsliste" | "Vorrat" | "Haushalt",
) {
  await page
    .getByRole("navigation", { name: "Bereiche" })
    .getByRole("button", { name: bereich })
    .click();
}

export const zumVorrat = (page: Page) => zuBereich(page, "Vorrat");
export const zurListe = (page: Page) => zuBereich(page, "Einkaufsliste");

/** Trägt im Vorrat einen Artikel mit Bestand ein. */
export async function vorratEintragen(
  page: Page,
  name: string,
  bestand: string,
) {
  await page.getByLabel("Vorratsartikel").fill(name);
  await detailsOeffnen(page);
  await page.getByLabel("Bestand", { exact: true }).fill(bestand);
  await page.getByRole("button", { name: "Eintragen" }).click();
}

export function bestand(page: Page, artikel: string) {
  return page.getByRole("button", { name: `Bestand ${artikel}` });
}
