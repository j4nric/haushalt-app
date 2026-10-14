import {
  type BrowserType,
  expect,
  type Locator,
  type Page,
} from "@playwright/test";
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

/** Trägt einen Artikel ein; mit `kategorie` wird sie gewählt (Sorten-Knopf oder Auswahl). */
export async function hinzufuegen(
  page: Page,
  name: string,
  optionen: { kategorie?: string } = {},
) {
  await page.getByLabel("Neuer Eintrag").fill(name);
  const sorten = page.getByRole("group", { name: "Sorte wählen" });
  if (optionen.kategorie && (await sorten.isVisible())) {
    await sorten
      .getByRole("button", { name: optionen.kategorie, exact: true })
      .click();
  } else {
    if (optionen.kategorie) {
      await page
        .getByLabel("Kategorie", { exact: true })
        .selectOption({ label: optionen.kategorie });
    }
    await page.getByRole("button", { name: "Hinzufügen" }).click();
  }
  await expect(eintrag(page, name)).toBeVisible();
}

/** Langes Drücken (wie auf dem Handy), z. B. auf eine Kachel. */
export async function langDruecken(page: Page, ziel: Locator) {
  await ziel.hover();
  await page.mouse.down();
  await page.waitForTimeout(700);
  await page.mouse.up();
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

/** Trägt im Vorrat einen Artikel ein und setzt den Bestand über die Details. */
export async function vorratEintragen(
  page: Page,
  name: string,
  bestandNeu: number,
) {
  await page.getByLabel("Vorratsartikel").fill(name);
  await page.getByRole("button", { name: "Eintragen" }).click();
  await bestand(page, name).click();
  await page.getByLabel(`Bestand setzen ${name}`).fill(String(bestandNeu));
  await page.getByLabel(`Bestand setzen ${name}`).press("Enter");
  await expect(bestand(page, name)).toHaveText(String(bestandNeu));
}

export function bestand(page: Page, artikel: string) {
  return page.getByRole("button", { name: `Bestand ${artikel}` });
}
