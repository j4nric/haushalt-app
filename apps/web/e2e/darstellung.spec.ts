import { expect, type Page, test } from "@playwright/test";
import { eintrag, geraet, haushaltAnlegen, zuBereich } from "./hilfen";

const farbVariable = (page: Page, name: string) =>
  page.evaluate(
    (n) =>
      getComputedStyle(document.documentElement).getPropertyValue(n).trim(),
    name,
  );

test("Großer Anfangsbuchstabe, Farbschema und Kategorie-Farben", async ({
  browserName,
  playwright,
}) => {
  const handy = await geraet(playwright[browserName], "Farben");
  const { page } = handy;
  try {
    await haushaltAnlegen(page, "Farben-Haushalt");

    // Klein getippt, groß gespeichert.
    await page.getByLabel("Neuer Eintrag").fill("milch");
    await page.getByRole("button", { name: "Hinzufügen" }).click();
    await expect(eintrag(page, "Milch")).toBeVisible();
    await expect(
      page.getByRole("main").getByText("milch", { exact: true }),
    ).toHaveCount(0);

    // Die Presets unterscheiden sich sichtbar, auch im Hintergrund.
    await zuBereich(page, "Haushalt");
    const thema = page.getByRole("group", { name: "Farbschema der App" });
    await thema.getByRole("button", { name: "System" }).click();
    expect(await farbVariable(page, "--background")).toBe("#fafafa");
    await thema.getByRole("button", { name: "Frisch" }).click();
    expect(await farbVariable(page, "--background")).toBe("#eef7f0");

    // Preset „Ozean“ wird angewendet und übersteht einen Neustart.
    await thema.getByRole("button", { name: "Ozean" }).click();
    expect(await farbVariable(page, "--primary")).toBe("#2563eb");
    await page.reload();
    await expect(thema.getByRole("button", { name: "Ozean" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(await farbVariable(page, "--primary")).toBe("#2563eb");

    // Eigenes Farbschema: dunkler Hintergrund → Text wird automatisch hell.
    await thema.getByRole("button", { name: "Eigene" }).click();
    await page.getByLabel("Akzent").fill("#c2410c");
    await page.getByLabel("Hintergrund").fill("#1f2937");
    expect(await farbVariable(page, "--primary")).toBe("#c2410c");
    expect(await farbVariable(page, "--foreground")).toBe("#ffffff");

    // Eigene Kategorie-Farbe erscheint in der Überschrift der Liste.
    const palette = page.getByRole("group", { name: "Farben der Kategorien" });
    await palette.getByRole("button", { name: "Eigene" }).click();
    await page.getByLabel("Farbe Milch & Käse").fill("#ff0000");
    await zuBereich(page, "Einkaufsliste");
    await expect(page.getByRole("heading", { name: "Milch & Käse" })).toHaveCSS(
      "color",
      "rgb(255, 0, 0)",
    );

    // Zurücksetzen stellt alles auf die Voreinstellung.
    await zuBereich(page, "Haushalt");
    await page.getByRole("button", { name: "Zurücksetzen" }).click();
    await expect(thema.getByRole("button", { name: "Frisch" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(
      palette.getByRole("button", { name: "Kräftig" }),
    ).toHaveAttribute("aria-pressed", "true");
  } finally {
    await handy.schliessen();
  }
});
