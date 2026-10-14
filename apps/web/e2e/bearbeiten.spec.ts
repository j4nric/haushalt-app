import { expect, test } from "@playwright/test";
import {
  anzahl,
  eintrag,
  geraet,
  haushaltAnlegen,
  hinzufuegen,
} from "./hilfen";

test("Kategorie-Erkennung, Anzahl, Bearbeiten und Löschen mit Rückgängig", async ({
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
    await expect(eintrag(page, "Heidelbeeren")).toBeVisible();

    // Gelernt: Beim nächsten Mal keine Rückfrage mehr, stattdessen zählt die Anzahl hoch.
    await page.getByLabel("Neuer Eintrag").fill("heidelbeeren");
    await expect(sorten).toBeHidden();
    await expect(page.getByLabel("Kategorie", { exact: true })).toHaveValue(
      "tiefkuehl",
    );
    await page.getByRole("button", { name: "Hinzufügen" }).click();
    await expect(anzahl(page, "Heidelbeeren")).toHaveText("2");
    await expect(eintrag(page, "Heidelbeeren")).toHaveCount(1);

    // Plus und Minus; Minus bleibt bei 1 stehen.
    await page.getByRole("button", { name: "Heidelbeeren mehr" }).click();
    await expect(anzahl(page, "Heidelbeeren")).toHaveText("3");
    for (let i = 0; i < 2; i++) {
      await page.getByRole("button", { name: "Heidelbeeren weniger" }).click();
    }
    await expect(anzahl(page, "Heidelbeeren")).toHaveText("1");
    await expect(
      page.getByRole("button", { name: "Heidelbeeren weniger" }),
    ).toBeDisabled();

    // Kategorie nachträglich ändern.
    await hinzufuegen(page, "Mehl");
    await page.getByRole("button", { name: "Aktionen für Mehl" }).click();
    await page.getByRole("menuitem", { name: "Kategorie ändern" }).click();
    await page
      .locator("#bearbeiten-kategorie")
      .selectOption({ label: "Süßes & Snacks" });
    await page.getByRole("button", { name: "Speichern" }).click();
    await expect(
      page.getByRole("heading", { name: "Süßes & Snacks" }),
    ).toBeVisible();

    // Löschen und rückgängig machen.
    await page.getByRole("button", { name: "Aktionen für Mehl" }).click();
    await page.getByRole("menuitem", { name: "Löschen" }).click();
    await expect(eintrag(page, "Mehl")).toHaveCount(0);
    await page.getByRole("button", { name: "Rückgängig" }).click();
    await expect(eintrag(page, "Mehl")).toBeVisible();
  } finally {
    await handy.schliessen();
  }
});
