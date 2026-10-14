import { expect, test } from "@playwright/test";
import {
  eintrag,
  geraet,
  haushaltAnlegen,
  hinzufuegen,
  zuBereich,
} from "./hilfen";

test("Liste in 1, 2 oder 3 Spalten; Kacheln einer Kategorie gleich hoch", async ({
  browserName,
  playwright,
}) => {
  const handy = await geraet(playwright[browserName], "Spalten");
  const { page } = handy;
  try {
    await page.setViewportSize({ width: 390, height: 844 });
    await haushaltAnlegen(page, "Spalten-Haushalt");
    for (const name of [
      "Salz",
      "Natives Olivenöl extra aus Kreta",
      "Reis",
      "Mehl",
    ]) {
      await hinzufuegen(page, name, { kategorie: "Vorrat & Konserven" });
    }
    await hinzufuegen(page, "Milch");

    const raster = (kategorie: string) =>
      page
        .getByRole("main")
        .locator("section")
        .filter({ has: page.getByRole("heading", { name: kategorie }) })
        .locator("ul");
    const hoehen = async (kategorie: string) =>
      raster(kategorie)
        .locator("li")
        .evaluateAll((lis) =>
          lis.map((li) => Math.round(li.getBoundingClientRect().height)),
        );

    await zuBereich(page, "Haushalt");
    const spalten = page.getByRole("group", {
      name: "Spalten der Einkaufsliste",
    });
    await expect(
      spalten.getByRole("button", { name: "2 Spalten" }),
    ).toHaveAttribute("aria-pressed", "true");

    for (const [knopf, anzahl] of [
      ["3 Spalten", 3],
      ["1 Spalte", 1],
      ["2 Spalten", 2],
    ] as const) {
      await zuBereich(page, "Haushalt");
      await spalten.getByRole("button", { name: knopf }).click();
      await zuBereich(page, "Einkaufsliste");
      await expect(raster("Vorrat & Konserven")).toHaveAttribute(
        "data-spalten",
        String(anzahl),
      );
      const spaltenImRaster = await raster("Vorrat & Konserven").evaluate(
        (ul) => getComputedStyle(ul).gridTemplateColumns.split(" ").length,
      );
      expect(spaltenImRaster).toBe(anzahl);
    }

    // 3 Spalten: der lange Name bricht um, alle Kacheln der Kategorie wachsen mit …
    await zuBereich(page, "Haushalt");
    await spalten.getByRole("button", { name: "3 Spalten" }).click();
    await zuBereich(page, "Einkaufsliste");
    await expect(
      eintrag(page, "Natives Olivenöl extra aus Kreta"),
    ).toBeVisible();
    const vorrat = await hoehen("Vorrat & Konserven");
    expect(new Set(vorrat).size).toBe(1);
    // … andere Kategorien bleiben kompakt.
    const [milch] = await hoehen("Milch & Käse");
    expect(milch).toBeLessThan(vorrat[0] ?? 0);
  } finally {
    await handy.schliessen();
  }
});
