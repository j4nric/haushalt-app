import { expect, test } from "@playwright/test";
import {
  anzahl,
  einladen,
  eintrag,
  geraet,
  haushaltAnlegen,
  hinzufuegen,
} from "./hilfen";

/**
 * Kernszenario: Zwei Mitglieder eines Haushalts teilen eine Liste. Eins verliert
 * das Netz (Supermarkt), ändert etwas, und nach dem Wiederverbinden sind beide
 * auf demselben Stand. Ein fremder Haushalt bekommt davon nichts zu sehen.
 * Jedes Gerät ist ein eigener Browser mit eigener lokaler Datenbank und
 * eigenem, abschaltbarem Netz.
 */
test("Haushalt teilen und offline einkaufen", async ({
  browserName,
  playwright,
}) => {
  const browserType = playwright[browserName];
  const lauf = Date.now().toString(36);
  const milch = `Milch ${lauf}`;
  const brot = `Brot ${lauf}`;

  const anna = await geraet(browserType, "Anna");
  const ben = await geraet(browserType, "Ben");
  const fremd = await geraet(browserType, "Fremd");

  try {
    // 1. Anna legt den Haushalt an und lädt Ben ein.
    await haushaltAnlegen(anna.page, `Haushalt ${lauf}`);
    await einladen(anna.page, ben.page, `Haushalt ${lauf}`, "Ben");

    // Ein fremder Haushalt daneben.
    await haushaltAnlegen(fremd.page, `Fremd ${lauf}`);

    // 2. Online: Eintrag mit Menge erscheint beim anderen Mitglied.
    await hinzufuegen(anna.page, milch, { menge: 2 });
    await expect(anzahl(ben.page, milch)).toHaveText("2");

    // 3. Anna verliert das Netz und hakt ab; Ben ergänzt derweil etwas.
    anna.netz.offline();
    await expect(anna.page.getByTestId("sync-status")).toHaveText(/Offline/);
    await eintrag(anna.page, milch).getByRole("checkbox").click();
    await expect(eintrag(anna.page, milch).getByRole("checkbox")).toBeChecked();

    await hinzufuegen(ben.page, brot);
    await expect(
      eintrag(ben.page, milch).getByRole("checkbox"),
    ).not.toBeChecked();
    await expect(eintrag(anna.page, brot)).toHaveCount(0);

    // 4. Wieder Netz: beide Änderungen kommen an, inklusive wer abgehakt hat.
    anna.netz.wiederOnline();
    await expect(eintrag(ben.page, milch).getByRole("checkbox")).toBeChecked({
      timeout: 30_000,
    });
    await expect(eintrag(ben.page, milch)).toContainText("Anna");
    await expect(eintrag(anna.page, brot)).toBeVisible({ timeout: 30_000 });

    // 5. Der fremde Haushalt hat davon nichts bekommen.
    await expect(fremd.page.getByTestId("sync-status")).toHaveText(
      /Online · synchron/,
    );
    await expect(fremd.page.getByRole("listitem")).toHaveCount(0);
    await expect(fremd.page.getByText("Die Liste ist leer.")).toBeVisible();
  } finally {
    await anna.schliessen();
    await ben.schliessen();
    await fremd.schliessen();
  }
});
