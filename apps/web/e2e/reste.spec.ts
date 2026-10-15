import { expect, type Page, test } from "@playwright/test";
import { geraet, haushaltAnlegen, zuBereich } from "./hilfen";

async function rezept(page: Page, titel: string, zutaten: string) {
  await page
    .getByRole("button", { name: /Eigenes Rezept|Neues Rezept/ })
    .click();
  await page.getByLabel("Titel").fill(titel);
  await page
    .getByRole("textbox", { name: "Zutaten", exact: true })
    .fill(zutaten);
  await page.getByRole("button", { name: "Speichern" }).click();
  await expect(page.getByRole("heading", { name: titel })).toBeVisible();
  await page
    .getByRole("button", { name: "Rezepte", exact: true })
    .first()
    .click();
}

test("Reste verwerten: Rezepte mit den meisten Resten zuerst", async ({
  browserName,
  playwright,
}) => {
  const handy = await geraet(playwright[browserName], "Reste");
  const { page } = handy;
  try {
    await haushaltAnlegen(page, "Reste-Haushalt");
    await zuBereich(page, "Rezepte");
    await rezept(
      page,
      "Zucchini-Nudeln",
      "1 Zucchini\n200 g Spaghetti\n1 Knoblauchzehe",
    );
    await rezept(
      page,
      "Ofengemüse",
      "2 Zucchini\n1 Paprika\n200 g Feta\n2 EL Olivenöl",
    );
    await rezept(page, "Pfannkuchen", "250 g Mehl\n3 Eier");

    await page
      .getByRole("toolbar", { name: "Filter" })
      .getByRole("button", { name: "♻️ Reste verwerten" })
      .click();
    const reste = page.getByRole("region", { name: "Reste verwerten" });
    await reste.getByLabel("Rest hinzufügen").fill("Zucchini");
    await reste.getByLabel("Rest hinzufügen").press("Enter");
    await reste.getByLabel("Rest hinzufügen").fill("feta");
    await reste.getByLabel("Rest hinzufügen").press("Enter");

    const ergebnis = reste
      .getByRole("list", { name: "Passende Rezepte" })
      .getByRole("listitem");
    await expect(ergebnis).toHaveCount(2);
    await expect(ergebnis.first()).toContainText("Ofengemüse");
    await expect(ergebnis.first()).toContainText("✓ Zucchini, Feta (2 von 2)");
    await expect(ergebnis.first()).toContainText("Einkaufen: Paprika");
    await expect(ergebnis.nth(1)).toContainText("Zucchini-Nudeln");

    // Rest entfernen → nur noch Zucchini; ein Tipp öffnet das Rezept.
    await reste.getByRole("button", { name: "Feta entfernen" }).click();
    await expect(ergebnis.first()).toContainText("✓ Zucchini");
    await expect(ergebnis.first()).not.toContainText(" von ");
    await ergebnis.first().getByRole("button").click();
    await expect(page.getByRole("button", { name: "Kochen" })).toBeVisible();
  } finally {
    await handy.schliessen();
  }
});
