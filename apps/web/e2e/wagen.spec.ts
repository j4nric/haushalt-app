import { expect, test } from "@playwright/test";
import {
  eintrag,
  geraet,
  haushaltAnlegen,
  hinzufuegen,
  zuBereich,
} from "./hilfen";

test("Knopf „Zum Wagen“ erscheint beim Scrollen und springt zum Wagen", async ({
  browserName,
  playwright,
}) => {
  const handy = await geraet(playwright[browserName], "Wagen");
  const { page } = handy;
  try {
    await page.setViewportSize({ width: 390, height: 700 });
    await haushaltAnlegen(page, "Wagen-Haushalt");
    // Eine Spalte, damit die Liste länger als der Bildschirm wird.
    await zuBereich(page, "Haushalt");
    await page
      .getByRole("group", { name: "Spalten der Einkaufsliste" })
      .getByRole("button", { name: "1 Spalte" })
      .click();
    await zuBereich(page, "Einkaufsliste");
    for (const name of [
      "Bananen",
      "Äpfel",
      "Gurke",
      "Paprika",
      "Tomaten",
      "Brot",
      "Milch",
      "Butter",
      "Nudeln",
      "Reis",
    ]) {
      await hinzufuegen(page, name);
    }
    await eintrag(page, "Bananen").getByRole("checkbox").click();
    await expect(eintrag(page, "Bananen").getByRole("checkbox")).toBeChecked();

    const knopf = page.getByRole("button", { name: "Zum Wagen (1)" });
    const wagen = page.getByRole("region", { name: "Im Wagen" });

    // Ganz oben: kein Knopf. Etwas gescrollt, Wagen nicht (oder nur hinter der
    // Eingabeleiste) im Bild: Knopf da.
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect(knopf).toBeHidden();
    await page.mouse.wheel(0, 150);
    await expect(knopf).toBeVisible();

    // Tipp: scrollt zum Wagen, der Knopf verschwindet.
    await knopf.click();
    await expect(wagen).toBeInViewport();
    await expect(knopf).toBeHidden();
    await expect(
      wagen.getByRole("heading", { name: "Im Wagen" }),
    ).toBeVisible();
  } finally {
    await handy.schliessen();
  }
});
