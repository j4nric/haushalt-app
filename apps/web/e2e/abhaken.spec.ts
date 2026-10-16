import { expect, test } from "@playwright/test";
import { eintrag, geraet, haushaltAnlegen, hinzufuegen } from "./hilfen";

test("Abhaken und Zurücknehmen geschehen sofort", async ({
  browserName,
  playwright,
}) => {
  const handy = await geraet(playwright[browserName], "Abhaken");
  const { page } = handy;
  try {
    await haushaltAnlegen(page, "Abhaken-Haushalt");
    await hinzufuegen(page, "Milch");
    const kachel = eintrag(page, "Milch").getByRole("checkbox");

    // Antippen: gleich im Wagen – keine Animation, keine Wartezeit.
    await kachel.click();
    await expect(kachel).toBeChecked({ timeout: 500 });
    await expect(page.getByRole("heading", { name: "Im Wagen" })).toBeVisible();

    // Zurücknehmen aus dem Wagen geschieht ebenso sofort.
    await kachel.click();
    await expect(kachel).not.toBeChecked({ timeout: 500 });
  } finally {
    await handy.schliessen();
  }
});
