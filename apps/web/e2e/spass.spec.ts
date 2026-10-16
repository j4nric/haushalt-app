import { expect, type Page, test } from "@playwright/test";
import { eintrag, geraet, haushaltAnlegen, hinzufuegen } from "./hilfen";

const TAG = 86_400_000;

/** Einmal einkaufen: auf die Liste, abhaken, Wagen leeren. */
async function einkaufen(page: Page, name: string) {
  await hinzufuegen(page, name);
  await eintrag(page, name).getByRole("checkbox").click();
  await expect(eintrag(page, name).getByRole("checkbox")).toBeChecked();
  await page.getByRole("button", { name: "Wagen leeren" }).click();
  await expect(eintrag(page, name)).toHaveCount(0);
}

test("Überfällige Produkte melden sich, lange vergessene vermissen dich", async ({
  browserName,
  playwright,
}) => {
  const handy = await geraet(playwright[browserName], "Vergessen");
  const { page } = handy;
  try {
    const start = Date.now();
    await haushaltAnlegen(page, "Vergessen-Haushalt");
    // Milch alle 5 Tage, Brokkoli nur einmal ganz am Anfang.
    await einkaufen(page, "Brokkoli");
    for (const tag of [0, 5, 10]) {
      await page.clock.setFixedTime(start + tag * TAG);
      await einkaufen(page, "Milch");
    }
    const karte = page.getByRole("region", { name: "Vielleicht vergessen" });

    // Am 14. Tag ist das noch normal …
    await page.clock.setFixedTime(start + 14 * TAG);
    await hinzufuegen(page, "Tomaten");
    await expect(karte).toBeHidden();

    // … am 18. Tag meldet sich die Milch.
    await page.clock.setFixedTime(start + 18 * TAG);
    await page.reload();
    await expect(karte.getByText("Milch", { exact: true })).toBeVisible();
    await expect(karte).toContainText("8 Tage");

    // Wegtippen blendet sie aus (bis zum nächsten Kauf) …
    await karte
      .getByRole("button", { name: "Milch brauche ich nicht" })
      .click();
    await expect(karte).toBeHidden();
    await page.reload();
    await expect(eintrag(page, "Tomaten")).toBeVisible();
    await expect(karte).toBeHidden();

    // … Plus setzt sie auf die Liste (Speicher geleert = Erinnerung wieder da).
    await page.evaluate(() =>
      localStorage.removeItem("haushalt-vergessen-weggetippt"),
    );
    await page.reload();
    await karte.getByRole("button", { name: "Milch auf die Liste" }).click();
    await expect(eintrag(page, "Milch")).toBeVisible();
    await expect(karte).toBeHidden();

    // Brokkoli wurde vor 18 Tagen gekauft – nach 3 Wochen vermisst er dich.
    await page.clock.setFixedTime(start + 25 * TAG);
    await page.reload();
    await page.getByRole("button", { name: "Verlauf Obst & Gemüse" }).click();
    await expect(
      page.getByRole("button", { name: "Brokkoli hinzufügen" }),
    ).toContainText(
      /vermisst dich|wartet seit|vergessen|Sehnsucht|alte Zeiten|Regal/,
    );
  } finally {
    await handy.schliessen();
  }
});
