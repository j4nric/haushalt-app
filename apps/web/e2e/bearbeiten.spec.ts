import { expect, test } from "@playwright/test";
import {
  eintrag,
  geraet,
  haushaltAnlegen,
  hinzufuegen,
  langDruecken,
} from "./hilfen";

test("Kategorie-Erkennung, Kacheln, lang drücken zum Bearbeiten und Löschen", async ({
  browserName,
  playwright,
}) => {
  const handy = await geraet(playwright[browserName], "Bearbeiten");
  const { page } = handy;
  try {
    await haushaltAnlegen(page, "Bearbeiten-Haushalt");

    // Eindeutig erkannt: Kategorie ist vorbelegt.
    await page.getByLabel("Neuer Eintrag").fill("Vollkornbrot");
    await expect(page.getByLabel("Kategorie", { exact: true })).toHaveValue(
      "brot_backwaren",
    );
    await page.getByRole("button", { name: "Hinzufügen" }).click();
    await expect(
      page.getByRole("heading", { name: "Brot & Backwaren" }),
    ).toBeVisible();

    // Mehrdeutig: Sorten-Knöpfe, ein Tipp trägt ein.
    await page.getByLabel("Neuer Eintrag").fill("Heidelbeeren");
    const sorten = page.getByRole("group", { name: "Sorte wählen" });
    await expect(sorten.getByRole("button")).toHaveText([
      "Obst & Gemüse",
      "Tiefkühl",
    ]);
    await sorten.getByRole("button", { name: "Tiefkühl" }).click();
    await expect(page.getByRole("heading", { name: "Tiefkühl" })).toBeVisible();

    // Gelernt: keine Rückfrage mehr; steht schon drauf → Hinweis statt Doppel.
    await page.getByLabel("Neuer Eintrag").fill("heidelbeeren");
    await expect(sorten).toBeHidden();
    await expect(page.getByLabel("Kategorie", { exact: true })).toHaveValue(
      "tiefkuehl",
    );
    await page.getByRole("button", { name: "Hinzufügen" }).click();
    await expect(
      page.getByText("Heidelbeeren steht schon auf der Liste"),
    ).toBeVisible();
    await expect(eintrag(page, "Heidelbeeren")).toHaveCount(1);

    // Antippen = gekauft, nochmal antippen = zurück.
    const kachel = eintrag(page, "Vollkornbrot").getByRole("checkbox");
    await kachel.click();
    await expect(page.getByRole("heading", { name: "Im Wagen" })).toBeVisible();
    await expect(kachel).toBeChecked();
    await kachel.click();
    await expect(kachel).not.toBeChecked();

    // Lang drücken: Kategorie ändern.
    await hinzufuegen(page, "Mehl");
    await langDruecken(page, eintrag(page, "Mehl").getByRole("checkbox"));
    await page
      .locator("#bearbeiten-kategorie")
      .selectOption({ label: "Süßes & Snacks" });
    await page.getByRole("button", { name: "Speichern" }).click();
    await expect(
      page.getByRole("heading", { name: "Süßes & Snacks" }),
    ).toBeVisible();
    await expect(eintrag(page, "Mehl").getByRole("checkbox")).not.toBeChecked();

    // Lang drücken: löschen, dann rückgängig.
    await langDruecken(page, eintrag(page, "Mehl").getByRole("checkbox"));
    await page.getByRole("button", { name: "Löschen" }).click();
    await expect(eintrag(page, "Mehl")).toHaveCount(0);
    await page.getByRole("button", { name: "Rückgängig" }).click();
    await expect(eintrag(page, "Mehl")).toBeVisible();
  } finally {
    await handy.schliessen();
  }
});
