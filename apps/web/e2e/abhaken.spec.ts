import { expect, test } from "@playwright/test";
import {
  eintrag,
  geraet,
  haushaltAnlegen,
  hinzufuegen,
  zuBereich,
} from "./hilfen";

test("Abhaken ist verzögert und lässt sich mit einem zweiten Tipp abbrechen", async ({
  browserName,
  playwright,
}) => {
  const handy = await geraet(playwright[browserName], "Abhaken");
  const { page } = handy;
  try {
    await haushaltAnlegen(page, "Abhaken-Haushalt");
    await hinzufuegen(page, "Milch");
    const kachel = eintrag(page, "Milch").getByRole("checkbox");

    // Versehentlich angetippt: Animation läuft, ein zweiter Tipp bricht ab.
    await kachel.click();
    await expect(kachel).toHaveAttribute("aria-busy", "true");
    await kachel.click();
    await expect(kachel).toHaveAttribute("aria-busy", "false");
    await page.waitForTimeout(2000);
    await expect(kachel).not.toBeChecked();
    await expect(page.getByRole("heading", { name: "Im Wagen" })).toBeHidden();

    // Absichtlich angetippt: erst nach der Animation im Wagen.
    await kachel.click();
    await expect(kachel).not.toBeChecked();
    await expect(page.getByRole("heading", { name: "Im Wagen" })).toBeVisible({
      timeout: 5000,
    });
    await expect(kachel).toBeChecked();

    // Wechsel in einen anderen Bereich während der Animation: wird trotzdem abgehakt.
    await hinzufuegen(page, "Brot");
    await eintrag(page, "Brot").getByRole("checkbox").click();
    await zuBereich(page, "Vorrat");
    await zuBereich(page, "Einkaufsliste");
    await expect(eintrag(page, "Brot").getByRole("checkbox")).toBeChecked();

    // Zurücknehmen aus dem Wagen geschieht sofort.
    await kachel.click();
    await expect(kachel).not.toBeChecked({ timeout: 500 });
  } finally {
    await handy.schliessen();
  }
});
