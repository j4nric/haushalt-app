import { expect, test } from "@playwright/test";
import { eintrag, geraet, haushaltAnlegen, hinzufuegen } from "./hilfen";

/**
 * Im Supermarkt ohne Netz die App öffnen: Sie muss aus dem Service-Worker-Cache
 * starten, angemeldet bleiben und die Liste aus der lokalen Datenbank zeigen.
 */
test("App startet ohne Netz mit der zuletzt bekannten Liste", async ({
  browserName,
  playwright,
}) => {
  const handy = await geraet(playwright[browserName], "Offline");
  try {
    await haushaltAnlegen(handy.page, "Offline-Haushalt");
    await hinzufuegen(handy.page, "Joghurt", { kategorie: "Milch & Käse" });
    await expect(handy.page.getByTestId("sync-status")).toHaveText(
      /Online · synchron/,
    );

    // Warten, bis der Service Worker die Seite kontrolliert (App-Shell ist gespeichert).
    await handy.page.waitForFunction(
      () => navigator.serviceWorker.controller !== null,
      undefined,
      {
        timeout: 30_000,
      },
    );

    handy.netz.offline();
    await handy.page.reload();

    await expect(
      handy.page.getByRole("heading", { name: "Offline-Haushalt" }),
    ).toBeVisible();
    await expect(handy.page.getByTestId("sync-status")).toHaveText(/Offline/);
    await expect(eintrag(handy.page, "Joghurt")).toBeVisible();

    // Offline weiterarbeiten: Abhaken wirkt sofort.
    await eintrag(handy.page, "Joghurt").getByRole("checkbox").click();
    await expect(
      eintrag(handy.page, "Joghurt").getByRole("checkbox"),
    ).toBeChecked();
  } finally {
    await handy.schliessen();
  }
});
