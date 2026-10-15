import { expect, test } from "@playwright/test";
import { bestand, geraet, haushaltAnlegen, zuBereich } from "./hilfen";

test("Kochen mit Timer, Reste einfrieren, Gerichte im Vorrat", async ({
  browserName,
  playwright,
}) => {
  const handy = await geraet(playwright[browserName], "Greta");
  const { page } = handy;
  try {
    await haushaltAnlegen(page, "Gerichte-Haushalt");

    // TK-Pizza ist ein Fertiggericht – eigener Bereich im Vorrat.
    await zuBereich(page, "Vorrat");
    await page.getByLabel("Vorratsartikel").fill("Steinofen Pizza");
    await page.getByRole("button", { name: "Eintragen" }).click();
    const details = page.getByRole("dialog", { name: "Steinofen Pizza" });
    await expect(
      details.getByRole("button", { name: "Fertiggericht" }),
    ).toHaveAttribute("aria-pressed", "true");
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toBeHidden();
    await expect(
      page.getByRole("heading", { name: "Fertiggerichte" }),
    ).toBeVisible();

    // Rezept aus „Entdecken“ übernehmen und kochen.
    await zuBereich(page, "Rezepte");
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
    await page.getByLabel("Sammlung durchsuchen").fill("Linsen-Dal");
    await page
      .getByRole("region", { name: "Alle Vorschläge" })
      .getByRole("button", { name: /^Rotes Linsen-Dal/ })
      .click();
    await page.getByRole("button", { name: "In unsere Rezepte" }).click();
    await page.getByRole("button", { name: "Öffnen" }).click();
    await page.getByRole("button", { name: "Kochen" }).click();

    // Zeitangaben in den Schritten sind Timer.
    const timer = page.getByRole("button", {
      name: /^Timer 15 Minuten starten/,
    });
    await expect(timer.first()).toBeVisible();
    await timer.first().click();
    // Läuft: oben steht der Timer mit Restzeit (14:5x).
    await expect(page.getByRole("list", { name: "Timer" })).toContainText(
      /14:5\d/,
    );

    // Fertig: 2 Portionen Reste einfrieren.
    await page.getByRole("button", { name: "Fertig gekocht" }).click();
    const dialog = page.getByRole("dialog", { name: "Guten Appetit!" });
    await dialog.getByRole("button", { name: "Eine Portion mehr" }).click();
    await dialog.getByRole("button", { name: "Eine Portion mehr" }).click();
    await expect(dialog.getByTestId("reste-portionen")).toHaveText("2 Port.");
    await dialog.getByRole("button", { name: "Einfrieren" }).click();
    await dialog.getByRole("button", { name: "Fertig" }).click();
    await expect(page.getByText(/2 Portionen Reste eingefroren/)).toBeVisible();

    await zuBereich(page, "Vorrat");
    const rest = page.getByTestId("vorrat-Rotes Linsen-Dal");
    await expect(page.getByRole("heading", { name: "Reste" })).toBeVisible();
    await expect(rest).toContainText("eingefroren");
    await expect(rest).toContainText("von heute");
    await expect(rest).toContainText("2 Portionen");
    // Kein Rezept-Artikel landet in den Kategorien oder auf der Liste.
    await expect(bestand(page, "Rotes Linsen-Dal")).toHaveText("2");

    // Aufgegessen: verschwindet.
    await page
      .getByRole("button", { name: "Rotes Linsen-Dal weniger" })
      .click();
    await page
      .getByRole("button", { name: "Rotes Linsen-Dal weniger" })
      .click();
    await expect(rest).toHaveCount(0);
  } finally {
    await handy.schliessen();
  }
});
