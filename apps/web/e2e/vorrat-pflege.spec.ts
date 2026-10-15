import { expect, type Locator, type Page, test } from "@playwright/test";
import {
  bestand,
  eintrag,
  geraet,
  haushaltAnlegen,
  zumVorrat,
  zurListe,
} from "./hilfen";

/** Zeile im Vorrat. */
const zeile = (page: Page, name: string) => page.getByTestId(`vorrat-${name}`);

async function wischen(page: Page, ziel: Locator, dx: number) {
  const box = await ziel.boundingBox();
  if (!box) {
    throw new Error("Zeile nicht sichtbar");
  }
  const y = box.y + box.height / 2;
  const x = box.x + box.width / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + dx / 3, y, { steps: 4 });
  await page.mouse.move(x + dx, y, { steps: 6 });
  await page.mouse.up();
}

/**
 * Tippt und schickt ab – erst, wenn der Text wirklich im Feld steht (auf langsamen
 * Rechnern übernimmt React ihn mitunter einen Moment später). Abgeschickt ist das
 * Feld sofort leer, doppelt eingetragen wird also nie.
 */
async function eintippen(
  page: Page,
  feld: string,
  text: string,
  knopf: string,
) {
  const eingabe = page.getByLabel(feld);
  await expect(async () => {
    if ((await eingabe.inputValue()) !== text) {
      await eingabe.fill(text);
    }
    await expect(eingabe).toHaveValue(text, { timeout: 500 });
  }).toPass();
  await page.getByRole("button", { name: knopf }).click();
  await expect(eingabe).toHaveValue("");
}

test("Vorrat pflegen: Packungen, Kategorie, Filter, Wischen, Inventur", async ({
  browserName,
  playwright,
}) => {
  const handy = await geraet(playwright[browserName], "Paula");
  const { page } = handy;
  try {
    await haushaltAnlegen(page, "Vorrat-Pflege");

    // Menge in der Eingabe: „Mehl 1 kg“ wird Mehl mit 1 kg, nicht ein Name.
    await eintippen(page, "Neuer Eintrag", "Mehl 1 kg", "Hinzufügen");
    await expect(eintrag(page, "Mehl")).toContainText("1 kg");
    await expect(
      page.getByRole("heading", { name: "Vorrat & Konserven" }),
    ).toBeVisible();
    // Umlaute: „Äpfel“ zweimal ist derselbe Artikel.
    await eintippen(page, "Neuer Eintrag", "Äpfel", "Hinzufügen");
    await eintippen(page, "Neuer Eintrag", "äpfel", "Hinzufügen");
    await expect(page.getByLabel("Neuer Eintrag")).toHaveValue("");
    await expect(eintrag(page, "pfel")).toHaveCount(1);

    // Abhaken: eine Packung im Vorrat, die Packungsgröße hat sie sich gemerkt.
    await eintrag(page, "Mehl").getByRole("checkbox").click();
    await zumVorrat(page);
    await expect(bestand(page, "Mehl")).toHaveText("1");
    await expect(zeile(page, "Mehl")).toContainText("à 1 kg");
    // Speichern im Dialog lässt die Packungsgröße, wie sie ist (1000 g, nicht 1 g).
    await bestand(page, "Mehl").click();
    await expect(page.getByLabel("Inhalt einer Packung")).toHaveValue("1000");
    await page.getByRole("button", { name: "Speichern" }).click();
    await expect(page.getByRole("dialog")).toBeHidden();
    await expect(zeile(page, "Mehl")).toContainText("à 1 kg");

    // Direkt eintragen: „Eier 10“ bucht 10 Stück, „Kaffee“ eine Packung.
    // Danach gehen gleich die Details auf – eingetragen ist es schon.
    await eintippen(page, "Vorratsartikel", "Eier 10", "Eintragen");
    const eier = page.getByRole("dialog", { name: "Eier" });
    await expect(
      eier.getByRole("textbox", { name: "Bestand Eier", exact: true }),
    ).toHaveValue("10");
    await page.keyboard.press("Escape");
    await expect(eier).toBeHidden();
    await eintippen(page, "Vorratsartikel", "Kaffee", "Eintragen");
    await expect(page.getByRole("dialog", { name: "Kaffee" })).toBeVisible();

    // Details: Kategorie und Name ändern, eine Packung ist offen.
    await page.getByLabel("Kategorie").selectOption({ label: "Getränke" });
    await page.getByLabel("Name").fill("Kaffeebohnen");
    await page.getByRole("switch", { name: /angebrochen/ }).click();
    await page.getByRole("button", { name: "Speichern" }).click();
    await expect(page.getByRole("heading", { name: "Getränke" })).toBeVisible();
    await expect(zeile(page, "Kaffeebohnen")).toContainText("offen");
    // Einen Namen, den es schon gibt, nimmt er nicht.
    await bestand(page, "Kaffeebohnen").click();
    await page.getByLabel("Name").fill("Ei");
    await page.getByRole("button", { name: "Speichern" }).click();
    await expect(page.getByText("„Eier“ gibt es schon")).toBeVisible();
    // Der Verlauf zeigt, was passiert ist.
    await expect(page.getByRole("region", { name: "Verlauf" })).toContainText(
      "Korrigiert · Paula",
    );
    await page.keyboard.press("Escape");

    // „−“ verbraucht die offene Packung: danach ist keine mehr offen.
    await page.getByRole("button", { name: "Kaffeebohnen weniger" }).click();
    await expect(bestand(page, "Kaffeebohnen")).toHaveText("0");
    await expect(zeile(page, "Kaffeebohnen")).not.toContainText("offen");

    // Filter und Suche.
    await page.getByRole("button", { name: "Leer 1" }).click();
    await expect(zeile(page, "Mehl")).toHaveCount(0);
    await expect(zeile(page, "Kaffeebohnen")).toBeVisible();
    await page.getByRole("button", { name: "Leer 1" }).click();
    await page.getByLabel("Vorratsartikel").fill("ei");
    await expect(zeile(page, "Eier")).toBeVisible();
    await expect(zeile(page, "Mehl")).toHaveCount(0);
    await page.getByLabel("Vorratsartikel").fill("");

    // Wischen: links = aufgebraucht (mit Rückgängig), rechts = auf die Liste.
    await wischen(page, zeile(page, "Eier"), -160);
    await expect(bestand(page, "Eier")).toHaveText("0");
    await page.getByRole("button", { name: "Rückgängig" }).click();
    await expect(bestand(page, "Eier")).toHaveText("10");
    await wischen(page, zeile(page, "Mehl"), 160);
    await expect(page.getByText("Mehl auf der Liste")).toBeVisible();

    // Inventur: alles der Reihe nach; geänderte Werte werden gebucht.
    await page.getByRole("button", { name: "Inventur" }).click();
    const inventur = page.getByRole("dialog", { name: "Inventur" });
    await expect(inventur).toContainText("1 von 3");
    const titel = inventur.getByRole("heading", { level: 3 });
    // Supermarkt-Reihenfolge: Milch & Käse, Vorrat, Getränke.
    await expect(titel).toHaveText("Eier");
    await inventur.getByRole("button", { name: "Stimmt" }).click();
    await expect(titel).toHaveText("Mehl");
    await expect(inventur).toContainText("2 von 3");
    await inventur.getByRole("button", { name: "Stimmt" }).click();
    await expect(titel).toHaveText("Kaffeebohnen");
    const mehr = inventur.getByRole("button", {
      name: "Bestand Kaffeebohnen mehr",
    });
    await mehr.click();
    await mehr.click();
    await inventur
      .getByRole("button", { name: "Übernehmen und weiter" })
      .click();
    await expect(
      page.getByText("3 Artikel geprüft, 1 korrigiert"),
    ).toBeVisible();
    await page.getByRole("button", { name: "Fertig" }).click();
    await expect(bestand(page, "Kaffeebohnen")).toHaveText("2");

    // Produkt ganz löschen – mit Rückfrage.
    await bestand(page, "Eier").click();
    await page.getByRole("button", { name: "Produkt löschen" }).click();
    await page
      .getByRole("alertdialog", { name: "Produkt löschen?" })
      .getByRole("button", { name: "Löschen" })
      .click();
    await expect(page.getByText("Eier gelöscht")).toBeVisible();
    await expect(zeile(page, "Eier")).toHaveCount(0);

    await zurListe(page);
    // Per Wischen wieder auf die Liste – offen, nicht im Wagen.
    await expect(
      eintrag(page, "Mehl").filter({
        has: page.getByRole("checkbox", { checked: false }),
      }),
    ).toBeVisible();
  } finally {
    await handy.schliessen();
  }
});
