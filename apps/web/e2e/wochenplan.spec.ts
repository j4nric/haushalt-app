import { expect, type Page, test } from "@playwright/test";
import { heute, tagePlus, tagName } from "../src/lib/plan";
import {
  bestand,
  eintrag,
  geraet,
  haushaltAnlegen,
  vorratEintragen,
  zuBereich,
} from "./hilfen";

async function rezept(page: Page, titel: string, zutaten: string) {
  await page
    .getByRole("button", { name: /Eigenes Rezept|Neues Rezept/ })
    .click();
  await page.getByLabel("Titel").fill(titel);
  await page.getByRole("spinbutton", { name: "Portionen" }).fill("2");
  await page
    .getByRole("textbox", { name: "Zutaten", exact: true })
    .fill(zutaten);
  await page.getByLabel("Zubereitung").fill("Alles 20 Minuten garen.");
  await page.getByRole("button", { name: "Speichern" }).click();
  await expect(page.getByRole("heading", { name: titel })).toBeVisible();
}

test("Wochenplan: planen, einkaufen, verschieben, füllen, kochen mit Vorrat", async ({
  browserName,
  playwright,
}) => {
  test.setTimeout(120_000);
  const handy = await geraet(playwright[browserName], "Planer");
  const { page } = handy;
  const t0 = heute();
  const tag = (n: number) =>
    page.getByRole("listitem", {
      name: tagName(tagePlus(t0, n), t0),
      exact: true,
    });
  try {
    await haushaltAnlegen(page, "Plan-Haushalt");
    await zuBereich(page, "Vorrat");
    await vorratEintragen(page, "Nudeln", 3);
    await vorratEintragen(page, "Reis", 2);

    // Standard: für 4 kochen.
    await zuBereich(page, "Haushalt");
    await page.getByRole("button", { name: "Mehr Portionen" }).click();
    await page.getByRole("button", { name: "Mehr Portionen" }).click();
    await expect(page.getByText("4 Portionen")).toBeVisible();
    // Warten, bis der Wert über den Server zurück auf dem Gerät ist (neu anzeigen).
    await zuBereich(page, "Vorrat");
    await zuBereich(page, "Haushalt");
    await expect(page.getByText("4 Portionen")).toBeVisible();

    await zuBereich(page, "Rezepte");
    await rezept(page, "Nudelauflauf", "2 Pck. Nudeln\n1 Zwiebel\n200 g Käse");
    // Im Rezept einplanen: übermorgen.
    await page.getByRole("button", { name: "Einplanen" }).click();
    await page
      .getByRole("button", {
        name: new RegExp(`^${tagName(tagePlus(t0, 2), t0)}`),
      })
      .click();
    await expect(page.getByText(/eingeplant/)).toBeVisible();
    await page
      .getByRole("button", { name: "Rezepte", exact: true })
      .first()
      .click();
    await rezept(
      page,
      "Gemüsecurry",
      "1 Pck. Reis\n1 Zwiebel\n400 ml Kokosmilch",
    );

    // Im Plan: heute Curry, morgen Reste.
    await zuBereich(page, "Plan");
    await page.getByRole("button", { name: "Heute planen" }).click();
    await page.getByRole("button", { name: /Gemüsecurry/ }).click();
    await expect(tag(0)).toContainText("Gemüsecurry");
    await expect(tag(0)).toContainText("4 Portionen");
    await page.getByRole("button", { name: "Morgen planen" }).click();
    await page.getByRole("button", { name: "Reste", exact: true }).click();
    await expect(tag(1)).toContainText("Reste");
    await expect(tag(2)).toContainText("Nudelauflauf");

    // Woche einkaufen: Zwiebeln zusammengezählt, Reis reicht im Vorrat, Nudeln nicht.
    await page.getByRole("button", { name: "Woche einkaufen" }).click();
    const zwiebel = page.getByRole("listitem").filter({ hasText: "Zwiebel" });
    await expect(zwiebel).toContainText("4 Stk.");
    await expect(
      page.getByRole("checkbox", { name: /Reis/ }),
    ).not.toBeChecked();
    await expect(page.getByRole("checkbox", { name: /Nudeln/ })).toBeChecked();
    await page.getByRole("button", { name: /Zutaten auf die Liste/ }).click();
    await expect(page.getByText(/Zutaten auf der Liste/)).toBeVisible();

    // Reste auf in drei Tagen verschieben.
    await tag(1).getByRole("button", { name: /Reste/ }).first().click();
    await page.getByRole("button", { name: "Verschieben auf …" }).click();
    await page
      .getByRole("button", {
        name: new RegExp(`^${tagName(tagePlus(t0, 3), t0)}`),
      })
      .click();
    await expect(tag(3)).toContainText("Reste");
    await expect(tag(1).getByRole("button", { name: /planen/ })).toBeVisible();

    // Noch einmal Nudelauflauf direkt danach → Hinweis auf Wiederholung.
    await tag(4)
      .getByRole("button", { name: /planen/ })
      .click();
    await page.getByRole("button", { name: /Nudelauflauf/ }).click();
    await expect(tag(4)).toContainText("🔁 schon am");

    // Woche füllen: Vorschläge für die freien Tage übernehmen.
    await page.getByRole("button", { name: "Woche füllen" }).click();
    const uebernehmen = page.getByRole("button", { name: /Tage? einplanen/ });
    await expect(uebernehmen).toBeEnabled();
    await uebernehmen.click();
    await expect(page.getByText(/eingeplant 🎲/)).toBeVisible();
    await expect(tag(1).getByRole("button", { name: /planen/ })).toHaveCount(1);

    // Einkaufsliste zeigt das heutige Gericht; von dort kochen.
    await zuBereich(page, "Einkaufsliste");
    await expect(eintrag(page, "Zwiebel")).toBeVisible();
    const heuteKarte = page.getByRole("region", { name: "Heute geplant" });
    await expect(heuteKarte).toContainText("Gemüsecurry");
    await heuteKarte.getByRole("button", { name: "Kochen" }).click();
    await expect(page.getByText("4 Portionen").first()).toBeVisible();
    await page.getByRole("button", { name: "Fertig gekocht" }).click();
    // Reis: 2 Pck. für 4 Portionen, alles was da ist.
    await expect(page.getByTestId("leer-Reis")).toHaveText("2");
    await page.getByRole("button", { name: "Abbuchen", exact: true }).click();
    await expect(page.getByText(/1 aus dem Vorrat abgebucht/)).toBeVisible();
    await expect(tag(0)).toContainText("✓ erledigt");
    await expect(
      page.getByRole("region", { name: "Wochenbilanz" }),
    ).toContainText("1× gekocht");

    await zuBereich(page, "Vorrat");
    await expect(bestand(page, "Reis")).toHaveText("0");
    await zuBereich(page, "Einkaufsliste");
    await expect(
      page.getByRole("region", { name: "Heute geplant" }),
    ).toHaveCount(0);
  } finally {
    await handy.schliessen();
  }
});
