import { createServer, type Server } from "node:http";
import { expect, test } from "@playwright/test";
import { barcodeVideo, ean13 } from "./barcode-video";
import { bestand, eintrag, geraet, haushaltAnlegen, zuBereich } from "./hilfen";

// Pro Lauf ein neuer Code, damit der Zwischenspeicher des Servers nicht stört.
const CODE = ean13(`40${String(Date.now()).slice(-10)}`);

let attrappe: Server;
test.beforeAll(async () => {
  attrappe = createServer((anfrage, antwort) => {
    const passt = anfrage.url?.startsWith(`/api/v2/product/${CODE}.json`);
    antwort.writeHead(passt ? 200 : 404, {
      "content-type": "application/json",
    });
    antwort.end(
      JSON.stringify(
        passt
          ? {
              status: 1,
              product: {
                product_name_de: "Frische Vollmilch 3,5 %",
                brands: "Milbona",
                quantity: "1 l",
              },
            }
          : { status: 0 },
      ),
    );
  });
  await new Promise<void>((fertig) =>
    attrappe.listen(4180, "127.0.0.1", fertig),
  );
});
test.afterAll(() => attrappe.close());

test("Barcode: unbekannt benennen, wieder scannen = abhaken, im Vorrat einbuchen", async ({
  browserName,
  playwright,
}) => {
  test.skip(
    browserName !== "chromium",
    "Simulierte Kamera gibt es nur in Chromium",
  );
  const handy = await geraet(playwright[browserName], "Scanner", {
    browserArgs: [
      "--use-fake-ui-for-media-stream",
      "--use-fake-device-for-media-stream",
      `--use-file-for-fake-video-capture=${barcodeVideo(CODE)}`,
    ],
  });
  const { page } = handy;
  try {
    // Wie auf dem iPhone: mitgelieferte Erkennung statt der des Browsers.
    await page.evaluate(() => localStorage.setItem("scanner-bibliothek", "1"));
    await haushaltAnlegen(page, "Scan-Haushalt");

    // 1. Unbekannt → Produktdaten, Namen anpassen, auf die Liste.
    await page.getByRole("button", { name: "Barcode scannen" }).click();
    const neu = page.getByRole("dialog", { name: "Neues Produkt" });
    await expect(neu).toContainText("Milbona · Frische Vollmilch 3,5 % · 1 l", {
      timeout: 20_000,
    });
    await expect(neu.getByLabel("Name")).toHaveValue("Frische Vollmilch");
    await neu.getByLabel("Name").fill("Milch");
    await neu.getByRole("button", { name: "Auf die Liste" }).click();
    await expect(eintrag(page, "Milch")).toBeVisible();

    // 2. Derselbe Code → sofort erkannt, im Laden = abgehakt.
    await page.getByRole("button", { name: "Barcode scannen" }).click();
    const scanner = page.getByRole("dialog", { name: /Scannen/ });
    await expect(scanner).toContainText("✓ Milch abgehakt", {
      timeout: 20_000,
    });
    await scanner.getByRole("button", { name: "Scanner schließen" }).click();
    await expect(eintrag(page, "Milch").getByRole("checkbox")).toBeChecked();

    // 3. Im Vorrat: Die Packung (1 l) wird eingebucht, Milch wird Vorratsartikel.
    await zuBereich(page, "Vorrat");
    // Danach schließt der Scanner und die Details von Milch gehen auf.
    await page.getByRole("button", { name: "Barcode scannen" }).click();
    await expect(page.getByText("+1 Milch (1 l) im Vorrat")).toBeVisible({
      timeout: 20_000,
    });
    const details = page.getByRole("dialog", { name: "Milch" });
    await expect(
      details.getByRole("textbox", { name: "Bestand Milch", exact: true }),
    ).toHaveValue("1");
    await page.keyboard.press("Escape");
    await expect(bestand(page, "Milch")).toBeVisible();
  } finally {
    await handy.schliessen();
  }
});
