import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { expect, test } from "@playwright/test";
import { eintrag, geraet, haushaltAnlegen, zuBereich } from "./hilfen";

test("Rezept von Hand: anlegen, umrechnen, auf die Liste, kochen, bearbeiten, löschen", async ({
  browserName,
  playwright,
}) => {
  const handy = await geraet(playwright[browserName], "Koch");
  const { page } = handy;
  try {
    await haushaltAnlegen(page, "Koch-Haushalt");
    await zuBereich(page, "Rezepte");
    await expect(page.getByText("Noch keine Rezepte")).toBeVisible();
    await page.getByRole("button", { name: "Eigenes Rezept" }).click();

    await page.getByLabel("Titel").fill("Spaghetti Pomodoro");
    await page.getByLabel("Portionen").fill("2");
    await page
      .getByRole("textbox", { name: "Zutaten", exact: true })
      .fill("(100g Salami)\nSpaghetti 200g\n1 Dose Tomaten\n2 EL Olivenöl");
    await page.getByRole("textbox", { name: "Gewürze" }).fill("Salz\nPfeffer");
    // Vorschau zeigt, was erkannt wurde.
    await expect(
      page
        .getByRole("list", { name: "Erkannte Zutaten" })
        .getByRole("listitem"),
    ).toHaveCount(4);
    await expect(
      page.getByRole("list", { name: "Erkannte Zutaten" }),
    ).toContainText("200 g Spaghetti");
    await page
      .getByLabel("Zubereitung")
      .fill("Nudeln 10 Minuten kochen.\nMit Tomaten mischen.");
    await page.getByRole("button", { name: "Speichern" }).click();

    // Detail: auf 3 Portionen umrechnen.
    await expect(
      page.getByRole("heading", { name: "Spaghetti Pomodoro" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Mehr Portionen" }).click();
    await expect(page.getByText("3 Portionen")).toBeVisible();
    await expect(
      page.getByRole("listitem").filter({ hasText: "Spaghetti" }).first(),
    ).toContainText("300 g");

    // Optionales steht ausgegraut in Klammern am Ende der Zutaten.
    const zutatenListe = page
      .getByRole("region", { name: "Zutaten" })
      .getByRole("list")
      .first()
      .getByRole("listitem");
    // Menge in der Mengen-Spalte (umgerechnet), Name in Klammern.
    await expect(zutatenListe.last()).toContainText("150 g");
    await expect(zutatenListe.last()).toContainText("(Salami)");

    // Auf die Liste: Olivenöl („haben wir immer“), Gewürze und Optionales sind abgewählt.
    await page.getByRole("button", { name: "Auf die Liste" }).click();
    await expect(
      page.getByRole("checkbox", { name: /Olivenöl/ }),
    ).not.toBeChecked();
    await expect(
      page.getByRole("checkbox", { name: /Salz/ }),
    ).not.toBeChecked();
    await expect(
      page.getByRole("checkbox", { name: /Pfeffer/ }),
    ).not.toBeChecked();
    await expect(
      page.getByRole("checkbox", { name: /Salami/ }),
    ).not.toBeChecked();
    await page.getByRole("button", { name: "2 Zutaten auf die Liste" }).click();
    await expect(page.getByText("2 Zutaten auf der Liste")).toBeVisible();

    // Kochen: Timer aus dem Schritt starten, Zutat abhaken.
    await page.getByRole("button", { name: "Kochen" }).click();
    await page
      .getByRole("button", { name: "Timer 10 Minuten starten" })
      .click();
    await expect(page.getByRole("list", { name: "Timer" })).toContainText(
      /Schritt 1: 10 Minuten\s*(9:5\d|10:00)/,
    );
    const spaghetti = page.getByRole("checkbox", { name: /300 g Spaghetti/ });
    await spaghetti.check();
    await expect(spaghetti).toBeChecked();
    await page.getByRole("button", { name: "Kochen beenden" }).click();

    // Auf die Liste kommen nur die Namen, ohne Mengen.
    await zuBereich(page, "Einkaufsliste");
    await expect(eintrag(page, "Spaghetti")).toBeVisible();
    await expect(eintrag(page, "Spaghetti")).not.toContainText(/\d/);
    await expect(eintrag(page, "Tomaten")).not.toContainText(/\d/);
    await expect(eintrag(page, "Salz")).toHaveCount(0);

    // Suche nach Zutat, dann bearbeiten und löschen (mit Rückgängig).
    await zuBereich(page, "Rezepte");
    const suche = page.getByLabel("Rezepte durchsuchen");
    await suche.fill("tomaten");
    await expect(
      page.getByRole("button", { name: /Spaghetti Pomodoro/ }),
    ).toBeVisible();
    await suche.fill("Linsen");
    await expect(page.getByText("Nichts gefunden")).toBeVisible();
    await suche.fill("");
    await page.getByRole("button", { name: /Spaghetti Pomodoro/ }).click();

    await page.getByRole("button", { name: "Weitere Aktionen" }).click();
    await page.getByRole("menuitem", { name: "Bearbeiten" }).click();
    await expect(
      page.getByRole("textbox", { name: "Zutaten", exact: true }),
    ).toHaveValue(
      "(100 g Salami)\n200 g Spaghetti\n1 Dose Tomaten\n2 EL Olivenöl",
    );
    await expect(page.getByRole("textbox", { name: "Gewürze" })).toHaveValue(
      "Salz\nPfeffer",
    );
    await page.getByLabel("Titel").fill("Spaghetti al Pomodoro");
    await page.getByRole("button", { name: "Speichern" }).click();
    await expect(
      page.getByRole("heading", { name: "Spaghetti al Pomodoro" }),
    ).toBeVisible();

    await page.getByRole("button", { name: "Weitere Aktionen" }).click();
    await page.getByRole("menuitem", { name: "Löschen" }).click();
    await expect(page.getByText("Noch keine Rezepte")).toBeVisible();
    await page.getByRole("button", { name: "Rückgängig" }).click();
    await expect(
      page.getByRole("button", { name: /Spaghetti al Pomodoro/ }),
    ).toContainText("6 Zutaten");

    // Nach dem Neuladen (Server-Stand) ist alles noch da.
    await page.reload();
    await expect(
      page.getByRole("button", { name: /Spaghetti al Pomodoro/ }),
    ).toBeVisible();
  } finally {
    await handy.schliessen();
  }
});

test.describe("Import per Link", () => {
  let server: Server;
  let basis: string;
  test.beforeAll(async () => {
    server = createServer((_, antwort) => {
      antwort.writeHead(200, { "content-type": "text/html; charset=utf-8" });
      antwort.end(`<!doctype html><title>Linsensuppe</title>
<script type="application/ld+json">${JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Recipe",
        name: "Linsensuppe",
        recipeYield: "4 Portionen",
        recipeIngredient: [
          "250 g Linsen",
          "1 Bund Suppengrün",
          "1 l Gemüsebrühe",
          "1 Prise Muskat",
          "Salz und Pfeffer",
        ],
        recipeInstructions: [
          { "@type": "HowToStep", text: "Gemüse würfeln." },
          { "@type": "HowToStep", text: "Alles 30 Minuten köcheln." },
        ],
      })}</script>`);
    });
    await new Promise<void>((fertig) => server.listen(0, "127.0.0.1", fertig));
    basis = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  });
  test.afterAll(() => server.close());

  test("füllt das Formular aus der Rezeptseite", async ({
    browserName,
    playwright,
  }) => {
    const handy = await geraet(playwright[browserName], "Import");
    const { page } = handy;
    try {
      await haushaltAnlegen(page, "Import-Haushalt");
      await zuBereich(page, "Rezepte");
      await page.getByRole("button", { name: "Eigenes Rezept" }).click();
      await page.getByLabel("Link zum Rezept").fill(`${basis}/linsensuppe`);
      await page.getByRole("button", { name: "Holen" }).click();
      await expect(page.getByLabel("Titel")).toHaveValue("Linsensuppe");
      await expect(page.getByLabel("Portionen")).toHaveValue("4");
      await expect(
        page.getByRole("textbox", { name: "Zutaten", exact: true }),
      ).toHaveValue("250 g Linsen\n1 Bund Suppengrün\n1 l Gemüsebrühe");
      // Gewürze sortiert der Import in den eigenen Absatz.
      await expect(page.getByRole("textbox", { name: "Gewürze" })).toHaveValue(
        "1 Prise Muskat\nSalz und Pfeffer",
      );
      await page.getByRole("button", { name: "Speichern" }).click();
      await expect(
        page.getByRole("heading", { name: "Linsensuppe" }),
      ).toBeVisible();
      await expect(
        page.getByRole("link", { name: /127\.0\.0\.1/ }),
      ).toBeVisible();

      // Kaputter Link: verständliche Meldung, Formular bleibt.
      await page
        .getByRole("button", { name: "Rezepte", exact: true })
        .first()
        .click();
      await page.getByRole("button", { name: "Neues Rezept" }).click();
      await page.getByLabel("Link zum Rezept").fill("kein link");
      await page.getByRole("button", { name: "Holen" }).click();
      await expect(page.getByText("Das ist kein gültiger Link")).toBeVisible();
    } finally {
      await handy.schliessen();
    }
  });

  test("„Teilen → Haushalt“ importiert den geteilten Link", async ({
    browserName,
    playwright,
  }) => {
    const handy = await geraet(playwright[browserName], "Teilen");
    const { page } = handy;
    try {
      await haushaltAnlegen(page, "Teilen-Haushalt");
      // Viele Apps schicken den Link nur im Text, mit etwas drumherum.
      await page.goto(
        `/teilen?title=Rezept&text=${encodeURIComponent(`Schau mal: ${basis}/linsensuppe 😋`)}`,
      );
      await expect(page.getByLabel("Titel")).toHaveValue("Linsensuppe");
      await expect(page).toHaveURL(/\/#rezepte\/neu$/);
      await page.getByRole("button", { name: "Speichern" }).click();
      await expect(
        page.getByRole("heading", { name: "Linsensuppe" }),
      ).toBeVisible();

      // Ohne Link: Hinweis, und der Editor ist offen.
      await page.goto("/teilen?text=Nur%20ein%20Text");
      await expect(page.getByText("Im Geteilten war kein Link")).toBeVisible();
      await expect(page.getByLabel("Titel")).toHaveValue("");
    } finally {
      await handy.schliessen();
    }
  });
});
