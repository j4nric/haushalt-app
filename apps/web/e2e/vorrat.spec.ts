import { expect, test } from "@playwright/test";
import {
  bestand,
  einladen,
  eintrag,
  geraet,
  haushaltAnlegen,
  hinzufuegen,
  vorratEintragen,
  zumVorrat,
  zurListe,
} from "./hilfen";

test("Einkauf landet im Vorrat, Knappes kommt auf die Liste", async ({
  browserName,
  playwright,
}) => {
  const handy = await geraet(playwright[browserName], "Vorrat");
  const { page } = handy;
  try {
    await haushaltAnlegen(page, "Vorrat-Haushalt");
    await hinzufuegen(page, "Nudeln", { kategorie: "Vorrat & Konserven" });
    await hinzufuegen(page, "Bananen", { kategorie: "Obst & Gemüse" });

    // Abhaken bucht Vorratsartikel ein – Frisches nicht.
    await eintrag(page, "Nudeln").getByRole("checkbox").click();
    await eintrag(page, "Bananen").getByRole("checkbox").click();
    await zumVorrat(page);
    await expect(bestand(page, "Nudeln")).toHaveText("1");
    await expect(bestand(page, "Bananen")).toHaveCount(0);
    await expect(page.getByText("Weitere Artikel (1)")).toBeVisible();

    // Haken zurücknehmen nimmt auch die Buchung zurück.
    await zurListe(page);
    await eintrag(page, "Nudeln").getByRole("checkbox").click();
    await zumVorrat(page);
    await expect(bestand(page, "Nudeln")).toHaveText("0");
    await zurListe(page);
    await eintrag(page, "Nudeln").getByRole("checkbox").click();
    await zumVorrat(page);
    await expect(bestand(page, "Nudeln")).toHaveText("1");

    // Mindestbestand 3 bei Bestand 1 → kommt automatisch wieder auf die Liste.
    await bestand(page, "Nudeln").click();
    await page.getByLabel("Mindestbestand Nudeln").fill("3");
    await page.getByLabel("Mindestbestand Nudeln").press("Enter");
    await expect(page.getByLabel("Mindestbestand Nudeln")).toBeHidden();
    await expect(
      page.getByRole("listitem").filter({ hasText: "Nudeln" }),
    ).toContainText("knapp, auf der Liste");
    await zurListe(page);
    await expect(
      eintrag(page, "Nudeln").filter({
        has: page.getByRole("checkbox", { checked: false }),
      }),
    ).toBeVisible();
  } finally {
    await handy.schliessen();
  }
});

/**
 * Der Grund für Buchungen statt einer Zahl pro Artikel: Zwei Geräte verbrauchen
 * gleichzeitig offline. Mit einer einzelnen Zahl würde die zuletzt hochgeladene
 * gewinnen und ein Verbrauch verloren gehen.
 */
test("Offline-Verbrauch auf zwei Geräten geht nicht verloren", async ({
  browserName,
  playwright,
}) => {
  const browserType = playwright[browserName];
  const anna = await geraet(browserType, "Anna");
  const ben = await geraet(browserType, "Ben");
  try {
    await haushaltAnlegen(anna.page, "Kaffeehaushalt");
    await einladen(anna.page, ben.page, "Kaffeehaushalt", "Ben");

    await zumVorrat(anna.page);
    await vorratEintragen(anna.page, "Kaffee", 5);
    await expect(bestand(anna.page, "Kaffee")).toHaveText("5");
    await zumVorrat(ben.page);
    await expect(bestand(ben.page, "Kaffee")).toHaveText("5");

    // Beide offline, beide verbrauchen je ein Stück.
    anna.netz.offline();
    ben.netz.offline();
    await expect(anna.page.getByTestId("sync-status")).toHaveText(/Offline/);
    await expect(ben.page.getByTestId("sync-status")).toHaveText(/Offline/);
    await anna.page.getByRole("button", { name: "Kaffee weniger" }).click();
    await ben.page.getByRole("button", { name: "Kaffee weniger" }).click();
    await expect(bestand(anna.page, "Kaffee")).toHaveText("4");
    await expect(bestand(ben.page, "Kaffee")).toHaveText("4");

    // Wieder online: Beide Verbräuche zählen.
    anna.netz.wiederOnline();
    ben.netz.wiederOnline();
    await expect(bestand(anna.page, "Kaffee")).toHaveText("3", {
      timeout: 30_000,
    });
    await expect(bestand(ben.page, "Kaffee")).toHaveText("3", {
      timeout: 30_000,
    });
  } finally {
    await anna.schliessen();
    await ben.schliessen();
  }
});
