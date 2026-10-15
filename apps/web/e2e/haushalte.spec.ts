import { expect, test } from "@playwright/test";
import {
  eintrag,
  geraet,
  haushaltAnlegen,
  hinzufuegen,
  zuBereich,
} from "./hilfen";

test("Mehrere Haushalte: anlegen, wechseln, verlassen", async ({
  browserName,
  playwright,
}) => {
  const handy = await geraet(playwright[browserName], "Wechsler");
  const { page } = handy;
  try {
    await haushaltAnlegen(page, "WG");
    await hinzufuegen(page, "Bier");

    // Zweiten Haushalt anlegen – er wird gleich aktiv.
    await zuBereich(page, "Haushalt");
    await page.getByRole("button", { name: /Wechseln oder weiteren/ }).click();
    await page
      .getByRole("button", { name: "Weiteren Haushalt hinzufügen" })
      .click();
    await page.getByLabel("Name des Haushalts").fill("Familie");
    await page.getByRole("button", { name: "Neuen Haushalt anlegen" }).click();
    await expect(
      page.getByRole("heading", { name: "Familie", level: 1 }),
    ).toBeVisible();

    // Eigene Liste je Haushalt.
    await zuBereich(page, "Einkaufsliste");
    await expect(eintrag(page, "Bier")).toHaveCount(0);
    await hinzufuegen(page, "Windeln");

    // Über den Namen oben wechseln.
    await page.getByRole("button", { name: /Haushalt wechseln/ }).click();
    await page.getByRole("button", { name: "WG", exact: true }).click();
    await expect(
      page.getByRole("heading", { name: "WG", level: 1 }),
    ).toBeVisible();
    await expect(eintrag(page, "Bier")).toBeVisible();
    await expect(eintrag(page, "Windeln")).toHaveCount(0);
    // Die Wahl gilt auch nach dem Neuladen.
    await page.reload();
    await expect(
      page.getByRole("heading", { name: "WG", level: 1 }),
    ).toBeVisible();

    // WG verlassen: letztes Mitglied → nur mit eingetipptem Namen.
    await zuBereich(page, "Haushalt");
    await page.getByRole("button", { name: "Haushalt verlassen" }).click();
    const loeschen = page.getByRole("button", { name: "Löschen" });
    await expect(loeschen).toBeDisabled();
    await page.getByLabel(/Zum Bestätigen/).fill("WG");
    await loeschen.click();
    await expect(page.getByText("„WG“ wurde gelöscht")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Familie", level: 1 }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Haushalt wechseln/ }),
    ).toHaveCount(0);
    await zuBereich(page, "Einkaufsliste");
    await expect(eintrag(page, "Windeln")).toBeVisible();
  } finally {
    await handy.schliessen();
  }
});

test("Admin sieht alle Konten mit Haushalten, andere nicht", async ({
  browserName,
  playwright,
}) => {
  const admin = await geraet(playwright[browserName], "Chefin", {
    domain: "admin.test",
  });
  const nutzer = await geraet(playwright[browserName], "Gast");
  try {
    await haushaltAnlegen(nutzer.page, "Gast-Haushalt");
    await zuBereich(nutzer.page, "Haushalt");
    await expect(
      nutzer.page.getByRole("heading", { name: "Konto" }),
    ).toBeVisible();
    await expect(
      nutzer.page.getByRole("heading", { name: "Admin" }),
    ).toHaveCount(0);

    await haushaltAnlegen(admin.page, "Admin-Haushalt");
    await zuBereich(admin.page, "Haushalt");
    await admin.page
      .getByRole("button", { name: "Alle Nutzer und Haushalte" })
      .click();
    const gast = admin.page.getByRole("listitem").filter({ hasText: /^Gast/ });
    await expect(gast.first()).toContainText("Gast-Haushalt");
    await expect(gast.first()).toContainText("1 Mitglied");
  } finally {
    await admin.schliessen();
    await nutzer.schliessen();
  }
});
