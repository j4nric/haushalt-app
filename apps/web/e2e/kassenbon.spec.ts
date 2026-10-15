import { expect, test } from "@playwright/test";
import { bonPdf } from "./bon-pdf";
import {
  bestand,
  eintrag,
  geraet,
  haushaltAnlegen,
  hinzufuegen,
  zuBereich,
} from "./hilfen";

const BON = bonPdf([
  ["Rewe Testmarkt oHG"],
  ["Teststraße 1"],
  ["EUR"],
  ["ROSENBROE. HELL", "0,39 B"],
  ["BIO WEIDEMILCH", "1,35 B"],
  ["STEINOFEN PIZZA", "1,79 B"],
  ["STEINOFEN PIZZA", "1,79 B"],
  ["BANANE", "1,53 B"],
  ["0,512 kg x", "2,99 EUR/kg"],
  ["PFAND 0,25 EURO", "0,25 A *"],
  ["--------------------------------------"],
  ["SUMME", "7,10"],
  ["TSE-Transaktion:", `${Date.now()}`],
  ["14.10.2026 16:58", "Bon-Nr.:5938"],
  ["Markt:5377", "Kasse:5"],
]);

test("Kassenbon hochladen: zuordnen, prüfen, in den Vorrat, Liste abhaken", async ({
  browserName,
  playwright,
}) => {
  const handy = await geraet(playwright[browserName], "Bonnie");
  const { page } = handy;
  try {
    await haushaltAnlegen(page, "Bon-Haushalt");
    await hinzufuegen(page, "Milch");
    await zuBereich(page, "Vorrat");
    await page.getByLabel("Vorratsartikel").fill("Pizza");
    await page.getByRole("button", { name: "Eintragen" }).click();
    await expect(page.getByRole("dialog", { name: "Pizza" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toBeHidden();

    const hochladen = async () => {
      await page.getByLabel("Kassenbon hochladen").setInputFiles({
        name: "bon.pdf",
        mimeType: "application/pdf",
        buffer: BON,
      });
      const d = page.getByRole("dialog", { name: "Kassenbon übernehmen" });
      await expect(d).toBeVisible({ timeout: 20_000 });
      return d;
    };
    const dialog = await hochladen();
    await expect(dialog).toContainText("REWE · 14.10.2026 · 4 Positionen");
    await expect(dialog).toContainText("1× Pfand/Rabatt übersprungen");

    // Zuordnung: Pizza (zweimal = 2), Weidemilch → Milch (steht auf der Liste).
    const name = (text: string) =>
      dialog.getByLabel(`Artikel für ${text}`, { exact: true });
    await expect(name("STEINOFEN PIZZA")).toHaveValue("Pizza");
    await expect(dialog.getByTestId("bon-anzahl-STEINOFEN PIZZA")).toHaveText(
      "2",
    );
    await expect(name("BIO WEIDEMILCH")).toHaveValue("Milch");
    await expect(dialog).toContainText("auf der Liste");
    // Unbekanntes bekommt einen lesbaren Vorschlag; Frisches ist abgewählt.
    await expect(name("ROSENBROE. HELL")).toHaveValue("Rosenbrö Hell");
    await name("ROSENBROE. HELL").fill("Rosenbrötchen");
    await expect(
      dialog.getByRole("checkbox", { name: "Banane übernehmen" }),
    ).not.toBeChecked();

    await dialog
      .getByRole("button", { name: "3 Produkte in den Vorrat" })
      .click();
    await expect(page.getByText("3 Produkte vom Bon im Vorrat")).toBeVisible();
    await expect(bestand(page, "Pizza")).toHaveText("3");
    await expect(bestand(page, "Milch")).toHaveText("1");
    await expect(bestand(page, "Rosenbrötchen")).toHaveText("1");
    await expect(bestand(page, "Banane")).toHaveCount(0);

    // Auf der Liste ist die Milch jetzt gekauft.
    await zuBereich(page, "Einkaufsliste");
    await expect(eintrag(page, "Milch").getByRole("checkbox")).toBeChecked();

    // Derselbe Bon noch einmal: Hinweis, und das Gelernte greift sofort.
    await zuBereich(page, "Vorrat");
    const nochmal = await hochladen();
    await expect(nochmal).toContainText("schon übernommen");
    await expect(name("ROSENBROE. HELL")).toHaveValue("Rosenbrötchen");
  } finally {
    await handy.schliessen();
  }
});
