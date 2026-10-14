import { expect, test } from "@playwright/test";
import {
  eintrag,
  geraet,
  haushaltAnlegen,
  hinzufuegen,
  langDruecken,
} from "./hilfen";

test("Zurücknehmen aus dem Wagen legt keinen doppelten Eintrag an", async ({
  browserName,
  playwright,
}) => {
  const handy = await geraet(playwright[browserName], "Doppelt");
  const { page } = handy;
  try {
    await haushaltAnlegen(page, "Doppelt-Haushalt");
    await hinzufuegen(page, "Milch");
    await eintrag(page, "Milch").getByRole("checkbox").click();
    await expect(eintrag(page, "Milch").getByRole("checkbox")).toBeChecked();

    // Milch kommt erneut auf die Liste, die alte steckt noch im Wagen.
    await page.getByLabel("Neuer Eintrag").fill("Milch");
    await page.getByRole("button", { name: "Hinzufügen" }).click();
    await expect(eintrag(page, "Milch")).toHaveCount(2);

    // Die Milch im Wagen zurücknehmen → sie verschwindet, statt doppelt dazustehen.
    await eintrag(page, "Milch")
      .filter({ has: page.getByRole("checkbox", { checked: true }) })
      .getByRole("checkbox")
      .click();
    await expect(eintrag(page, "Milch")).toHaveCount(1);
    await expect(
      eintrag(page, "Milch").getByRole("checkbox"),
    ).not.toBeChecked();
    await expect(page.getByRole("heading", { name: "Im Wagen" })).toBeHidden();
  } finally {
    await handy.schliessen();
  }
});

test("Schnell-Hinzufügen aus dem Verlauf einer Kategorie", async ({
  browserName,
  playwright,
}) => {
  const handy = await geraet(playwright[browserName], "Verlauf");
  const { page } = handy;
  try {
    await haushaltAnlegen(page, "Verlauf-Haushalt");
    // Früherer Einkauf: eingetragen, gekauft, Wagen geleert.
    for (const name of ["Bananen", "Äpfel", "Milch"]) {
      await hinzufuegen(page, name);
      await eintrag(page, name).getByRole("checkbox").click();
    }
    await page.getByRole("button", { name: "Leeren" }).click();
    await expect(page.getByText("Die Liste ist leer.")).toBeVisible();

    // Neuer Einkauf: Tomaten stehen drauf; die Plus-Kachel öffnet den Verlauf.
    await hinzufuegen(page, "Tomaten");
    await page.getByRole("button", { name: "Verlauf Obst & Gemüse" }).click();
    const verlauf = page.getByRole("region", { name: "Verlauf Obst & Gemüse" });
    await expect(
      verlauf.getByRole("button", {
        name: "Tomaten steht schon auf der Liste",
      }),
    ).toBeVisible();
    await verlauf.getByRole("button", { name: "Bananen hinzufügen" }).click();
    await expect(eintrag(page, "Bananen")).toBeVisible();
    await expect(
      verlauf.getByRole("button", {
        name: "Bananen steht schon auf der Liste",
      }),
    ).toBeVisible();

    // Lang drücken nimmt aus dem Verlauf – mit Rückgängig.
    await langDruecken(
      page,
      verlauf.getByRole("button", { name: "Äpfel hinzufügen" }),
    );
    await expect(
      verlauf.getByRole("button", { name: "Äpfel hinzufügen" }),
    ).toHaveCount(0);
    await page.getByRole("button", { name: "Rückgängig" }).click();
    await expect(
      verlauf.getByRole("button", { name: "Äpfel hinzufügen" }),
    ).toBeVisible();

    // Kategorie ohne offene Einträge: über „Aus dem Verlauf“ erreichbar.
    await page.getByRole("button", { name: "Verlauf Milch & Käse" }).click();
    await page
      .getByRole("region", { name: "Verlauf Milch & Käse" })
      .getByRole("button", { name: "Milch hinzufügen" })
      .click();
    await expect(eintrag(page, "Milch")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Milch & Käse" }),
    ).toBeVisible();
  } finally {
    await handy.schliessen();
  }
});

/**
 * Ein neu eingetragenes Produkt gehört sofort zum Verlauf und zu den Vorschlägen –
 * auch wenn es schon im Wagen liegt und ohne Netz (kein Abgleich mit dem Server).
 */
test("Neue Produkte stehen sofort im Verlauf, auch offline und im Wagen", async ({
  browserName,
  playwright,
}) => {
  const handy = await geraet(playwright[browserName], "Sofort");
  const { page } = handy;
  try {
    await haushaltAnlegen(page, "Sofort-Haushalt");
    handy.netz.offline();
    await expect(page.getByTestId("sync-status")).toHaveText(/Offline/);

    await hinzufuegen(page, "Tomaten");
    await hinzufuegen(page, "Gurke");
    await eintrag(page, "Gurke").getByRole("checkbox").click();
    await expect(eintrag(page, "Gurke").getByRole("checkbox")).toBeChecked();

    // Verlauf der Kategorie: Gurke (im Wagen) ist wählbar, Tomaten (offen) ausgegraut.
    await page.getByRole("button", { name: "Verlauf Obst & Gemüse" }).click();
    const verlauf = page.getByRole("region", { name: "Verlauf Obst & Gemüse" });
    await expect(
      verlauf.getByRole("button", { name: "Gurke hinzufügen" }),
    ).toBeVisible();
    await expect(
      verlauf.getByRole("button", {
        name: "Tomaten steht schon auf der Liste",
      }),
    ).toBeVisible();

    // Vorschläge beim Tippen enthalten beide.
    await expect(page.locator("#eingabe-vorschlaege option")).toHaveCount(2);
  } finally {
    await handy.schliessen();
  }
});
