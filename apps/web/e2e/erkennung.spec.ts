import { expect, test } from "@playwright/test";
import { eintrag, geraet, haushaltAnlegen, hinzufuegen } from "./hilfen";

test("Plural findet denselben Artikel, Konserven landen im Vorrat", async ({
  browserName,
  playwright,
}) => {
  const handy = await geraet(playwright[browserName], "Erkennung");
  const { page } = handy;
  try {
    await haushaltAnlegen(page, "Erkennung-Haushalt");
    await hinzufuegen(page, "Zwiebel");

    // „Zwiebeln“ ist derselbe Artikel – keine zweite Kachel.
    await page.getByLabel("Neuer Eintrag").fill("Zwiebeln");
    await page.getByRole("button", { name: "Hinzufügen" }).click();
    await expect(
      page.getByText("Zwiebel steht schon auf der Liste"),
    ).toBeVisible();
    await expect(eintrag(page, "Zwiebel")).toHaveCount(1);

    // Konserven: eindeutig Vorrat statt „frisch oder Dose?“.
    await hinzufuegen(page, "Passierte Tomaten");
    const vorrat = page
      .getByRole("main")
      .locator("section")
      .filter({
        has: page.getByRole("heading", { name: "Vorrat & Konserven" }),
      });
    await expect(vorrat).toContainText("Passierte Tomaten");
  } finally {
    await handy.schliessen();
  }
});
