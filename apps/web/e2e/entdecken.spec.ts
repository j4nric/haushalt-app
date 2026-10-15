import { expect, test } from "@playwright/test";
import { geraet, haushaltAnlegen, zuBereich } from "./hilfen";

test("Entdecken: Vorschläge zum Vorrat, übernehmen, filtern", async ({
  browserName,
  playwright,
}) => {
  const handy = await geraet(playwright[browserName], "Ella");
  const { page } = handy;
  try {
    await haushaltAnlegen(page, "Entdecken-Haushalt");
    // Spaghetti im Vorrat → Rezepte damit werden begründet vorgeschlagen.
    await zuBereich(page, "Vorrat");
    await page.getByLabel("Vorratsartikel").fill("Spaghetti");
    await page.getByRole("button", { name: "Eintragen" }).click();
    await expect(
      page.getByRole("button", { name: "Bestand Spaghetti" }),
    ).toHaveText("1");

    await zuBereich(page, "Rezepte");
    await page.getByRole("button", { name: "✨ Rezepte entdecken" }).click();
    await expect(
      page.getByRole("heading", { name: "Entdecken" }),
    ).toBeVisible();
    await expect(
      page.getByRole("region", { name: "Heute vorgeschlagen" }),
    ).toBeVisible();

    await page.getByLabel("Sammlung durchsuchen").fill("Bolognese");
    const karte = page.getByRole("button", { name: /^Spaghetti Bolognese/ });
    await expect(karte).toContainText("Mit eurem Vorrat: Spaghetti");
    await karte.click();
    const vorschau = page.getByRole("dialog", { name: "Spaghetti Bolognese" });
    await expect(vorschau).toContainText("2 Portionen");
    await expect(vorschau.getByLabel("im Vorrat")).toHaveCount(1);
    await vorschau.getByRole("button", { name: "In unsere Rezepte" }).click();
    await page.getByRole("button", { name: "Öffnen" }).click();
    await expect(
      page.getByRole("heading", { name: "Spaghetti Bolognese" }),
    ).toBeVisible();
    await expect(page.getByText("2 Portionen").first()).toBeVisible();

    // Übernommenes wird nicht mehr vorgeschlagen.
    await page.goto("/#rezepte/entdecken");
    await expect(page.getByText("1 schon bei euch")).toBeVisible();
    await page.getByLabel("Sammlung durchsuchen").fill("Bolognese");
    await expect(
      page.getByRole("button", { name: /^Spaghetti Bolognese/ }),
    ).toHaveCount(0);

    // Filter: vegetarisch zeigt keine Carbonara.
    await page.getByLabel("Sammlung durchsuchen").fill("Spaghetti");
    await expect(
      page.getByRole("button", { name: /^Spaghetti Carbonara/ }),
    ).toBeVisible();
    await page.getByRole("button", { name: "🌱 Vegetarisch" }).click();
    await expect(
      page.getByRole("button", { name: /^Spaghetti Carbonara/ }),
    ).toHaveCount(0);
  } finally {
    await handy.schliessen();
  }
});
