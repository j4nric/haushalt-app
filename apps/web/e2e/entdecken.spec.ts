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
    // Eingetragen – die Details gehen gleich auf, Speichern ist nicht nötig.
    await expect(page.getByRole("dialog", { name: "Spaghetti" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toBeHidden();
    await expect(
      page.getByRole("button", { name: "Bestand Spaghetti" }),
    ).toHaveText("1");

    await zuBereich(page, "Rezepte");
    // Direkt nach dem Bereichswechsel kann ein Klick in der Übergangs-Animation
    // untergehen (unter Last in der CI) – dann noch einmal.
    await expect(async () => {
      const knopf = page
        .getByRole("button", { name: "Rezepte entdecken" })
        .last();
      if (await knopf.isVisible()) {
        await knopf.click();
      }
      await expect(
        page.getByRole("heading", { name: "Entdecken", exact: true }),
      ).toBeVisible({ timeout: 3000 });
    }).toPass();
    await expect(
      page.getByRole("region", { name: "Heute vorgeschlagen" }),
    ).toBeVisible();

    await page.getByLabel("Sammlung durchsuchen").fill("Bolognese");
    const karte = page.getByRole("button", { name: /^Spaghetti Bolognese/ });
    await expect(karte).toContainText("Mit eurem Vorrat: Spaghetti");
    await karte.click();
    const vorschau = page.getByRole("dialog", { name: "Spaghetti Bolognese" });
    await expect(vorschau).toContainText("2 Portionen");
    // Im Inhalt ziehen (wie Scrollen) schließt die Vorschau nicht – nur der Griff.
    // Erst, wenn der Drawer fertig hochgefahren ist.
    await expect
      .poll(async () => (await vorschau.boundingBox())?.y ?? 9999)
      .toBeLessThan(200);
    const box = await vorschau.boundingBox();
    if (box) {
      const x = box.x + box.width / 2;
      const y = box.y + 140;
      await page.mouse.move(x, y);
      await page.mouse.down();
      await page.mouse.move(x, y + 250, { steps: 10 });
      await page.mouse.up();
    }
    await page.waitForTimeout(500);
    await expect(vorschau).toBeVisible();
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

    // Sortiert nach Übereinstimmung: oben steht, was am meisten im Vorrat hat.
    await page.getByLabel("Sammlung durchsuchen").fill("");
    await page
      .getByRole("button", { name: "Beste Übereinstimmung", exact: true })
      .click();
    const prozente = await page
      .getByRole("region", { name: "Alle Vorschläge" })
      .getByText(/^\d+ %/)
      .allTextContents();
    const zahlen = prozente.map((p) => Number.parseInt(p, 10));
    expect(zahlen.length).toBeGreaterThan(10);
    expect(zahlen).toEqual([...zahlen].sort((a, b) => b - a));
    await page
      .getByRole("button", { name: "Beste Übereinstimmung", exact: true })
      .click();

    // Filter: vegetarisch zeigt keine Carbonara.
    await page.getByLabel("Sammlung durchsuchen").fill("Spaghetti");
    await expect(
      page.getByRole("button", { name: /^Spaghetti Carbonara/ }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "Vegetarisch", exact: true })
      .click();
    await expect(
      page.getByRole("button", { name: /^Spaghetti Carbonara/ }),
    ).toHaveCount(0);
  } finally {
    await handy.schliessen();
  }
});
