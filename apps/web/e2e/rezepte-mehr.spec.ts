import { expect, type Page, test } from "@playwright/test";
import { geraet, haushaltAnlegen, vorratEintragen, zuBereich } from "./hilfen";

// Kleinstes gültiges PNG (1×1 Pixel).
const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
  "base64",
);

async function rezeptAnlegen(
  page: Page,
  titel: string,
  zutaten: string,
  schlagwort: string,
) {
  await page
    .getByRole("button", { name: /Erstes Rezept|Neues Rezept/ })
    .click();
  await page.getByLabel("Titel").fill(titel);
  await page
    .getByRole("textbox", { name: "Zutaten", exact: true })
    .fill(zutaten);
  await page.getByLabel("Neues Schlagwort").fill(schlagwort);
  await page.getByLabel("Neues Schlagwort").press("Enter");
  await expect(
    page.getByRole("button", { name: `#${schlagwort}`, pressed: true }),
  ).toBeVisible();
  await page.getByLabel("Zubereitung").fill("Alles 20 Minuten backen.");
  await page.getByRole("button", { name: "Speichern" }).click();
  await expect(page.getByRole("heading", { name: titel })).toBeVisible();
  await page
    .getByRole("button", { name: "Rezepte", exact: true })
    .first()
    .click();
}

const karte = (page: Page, titel: string) =>
  page
    .getByRole("listitem")
    .filter({ has: page.getByRole("button", { name: new RegExp(titel) }) });

test("Favoriten, Schlagwörter, kochbar, gekocht, Statistik, Glücksrad, Foto", async ({
  browserName,
  playwright,
}) => {
  test.setTimeout(90_000);
  const handy = await geraet(playwright[browserName], "Chef");
  const { page } = handy;
  try {
    await haushaltAnlegen(page, "Chef-Haushalt");
    await zuBereich(page, "Vorrat");
    await vorratEintragen(page, "Nudeln", 3);
    await vorratEintragen(page, "Tomaten", 2);

    await zuBereich(page, "Rezepte");
    await rezeptAnlegen(
      page,
      "Nudelauflauf",
      "2 Pck. Nudeln\n1 Dose Tomaten\n1 Zwiebel",
      "schnell",
    );
    await rezeptAnlegen(page, "Pfannkuchen", "250 g Mehl\n3 Eier", "süß");

    // Favorit setzen → Filter zeigt nur ihn.
    await page.getByRole("button", { name: /Pfannkuchen/ }).click();
    await page.getByRole("button", { name: "Als Favorit merken" }).click();
    await expect(
      page.getByRole("button", { name: "Kein Favorit mehr" }),
    ).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByText("Noch nie gekocht")).toBeVisible();
    await page
      .getByRole("button", { name: "Rezepte", exact: true })
      .first()
      .click();
    const filter = page.getByRole("toolbar", { name: "Filter" });
    await filter.getByRole("button", { name: "⭐ Favoriten" }).click();
    await expect(karte(page, "Pfannkuchen")).toBeVisible();
    await expect(karte(page, "Nudelauflauf")).toHaveCount(0);
    await filter.getByRole("button", { name: "⭐ Favoriten" }).click();

    // Schlagwort-Filter.
    await filter.getByRole("button", { name: "#schnell" }).click();
    await expect(karte(page, "Nudelauflauf")).toBeVisible();
    await expect(karte(page, "Pfannkuchen")).toHaveCount(0);
    await filter.getByRole("button", { name: "#schnell" }).click();

    // Was kann ich kochen? Nudeln und Tomaten sind da, die Zwiebel fehlt.
    await filter.getByRole("button", { name: /Was kann ich kochen/ }).click();
    await expect(page.getByRole("listitem").first()).toContainText("67 % da");
    await expect(page.getByRole("listitem").first()).toContainText(
      "Fehlt: Zwiebel",
    );
    await expect(karte(page, "Pfannkuchen")).toContainText("0 % da");
    await filter.getByRole("button", { name: /Was kann ich kochen/ }).click();

    // Kochen → „Fertig gekocht“ → Statistik.
    await page.getByRole("button", { name: /Nudelauflauf/ }).click();
    await page.getByRole("button", { name: "Kochen" }).click();
    await page.getByRole("button", { name: "Fertig gekocht" }).click();
    await expect(page.getByText("Zum ersten Mal gekocht")).toBeVisible();
    await expect(page.getByText("1× gekocht · zuletzt heute")).toBeVisible();
    await page
      .getByRole("button", { name: "Rezepte", exact: true })
      .first()
      .click();
    await expect(page.getByText("Euer Lieblingsgericht")).toBeVisible();
    await expect(page.getByText("Nudelauflauf · 1× gekocht")).toBeVisible();
    await filter.getByRole("button", { name: "🕒 Zuletzt gekocht" }).click();
    await expect(karte(page, "Nudelauflauf")).toContainText("zuletzt heute");
    await expect(karte(page, "Pfannkuchen")).toHaveCount(0);
    await filter.getByRole("button", { name: "🕒 Zuletzt gekocht" }).click();

    // Glücksrad dreht und führt zu einem Rezept.
    await page.getByRole("button", { name: /Glücksrad/ }).click();
    await page.getByRole("button", { name: "Drehen!" }).click();
    await expect(page.getByText("Heute gibt's:")).toBeVisible({
      timeout: 8000,
    });
    await page.getByRole("button", { name: "Zum Rezept" }).click();
    await expect(page.getByRole("button", { name: "Kochen" })).toBeVisible();

    // Eigenes Foto hochladen.
    await page.getByRole("button", { name: "Weitere Aktionen" }).click();
    await page.getByRole("menuitem", { name: "Bearbeiten" }).click();
    await page.getByLabel("Foto wählen").setInputFiles({
      name: "foto.png",
      mimeType: "image/png",
      buffer: PNG,
    });
    const vorschau = page.locator('img[src^="/api/bilder/"]');
    await expect(vorschau).toBeVisible();
    await page.getByRole("button", { name: "Speichern" }).click();
    const bild = page.locator('article img[src^="/api/bilder/"]');
    await expect(bild).toBeVisible();
    await expect
      .poll(() => bild.evaluate((img: HTMLImageElement) => img.naturalWidth))
      .toBeGreaterThan(0);
  } finally {
    await handy.schliessen();
  }
});
