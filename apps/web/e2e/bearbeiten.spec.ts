import { expect, test } from "@playwright/test";
import { eintrag, geraet, haushaltAnlegen, hinzufuegen } from "./hilfen";

test("Eintrag bearbeiten, löschen und Löschen rückgängig machen", async ({
  browserName,
  playwright,
}) => {
  const handy = await geraet(playwright[browserName], "Bearbeiten");
  const { page } = handy;
  try {
    await haushaltAnlegen(page, "Bearbeiten-Haushalt");
    await hinzufuegen(page, "Mehl");

    // Bearbeiten: Menge und Kategorie nachträglich setzen.
    await page.getByRole("button", { name: "Aktionen für Mehl" }).click();
    await page.getByRole("menuitem", { name: "Bearbeiten" }).click();
    await page.getByLabel("Menge", { exact: true }).last().fill("1000");
    await page.locator("#bearbeiten-einheit").selectOption("g");
    await page
      .locator("#bearbeiten-kategorie")
      .selectOption({ label: "Vorrat & Konserven" });
    await page.getByRole("button", { name: "Speichern" }).click();
    await expect(eintrag(page, "Mehl")).toContainText("1 kg");
    await expect(
      page.getByRole("heading", { name: "Vorrat & Konserven" }),
    ).toBeVisible();

    // Löschen und rückgängig machen.
    await page.getByRole("button", { name: "Aktionen für Mehl" }).click();
    await page.getByRole("menuitem", { name: "Löschen" }).click();
    await expect(eintrag(page, "Mehl")).toHaveCount(0);
    await page.getByRole("button", { name: "Rückgängig" }).click();
    await expect(eintrag(page, "Mehl")).toContainText("1 kg");
  } finally {
    await handy.schliessen();
  }
});
