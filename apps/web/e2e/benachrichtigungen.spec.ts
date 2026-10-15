import { expect, test } from "@playwright/test";
import { geraet, haushaltAnlegen, zuBereich } from "./hilfen";

/**
 * Den echten Push-Dienst (FCM) erreicht der Test-Browser nicht – Erlaubnis und Abo beim
 * Browser wird nachgestellt. Was der Server speichert, ist echt.
 */
const PUSH_ATTRAPPE = () => {
  const SCHLUESSEL = "e2e-push-abo";
  // Headless-Chromium verweigert Benachrichtigungen immer – die Erlaubnis gleich mit.
  let erlaubnis: NotificationPermission = "default";
  Object.defineProperty(Notification, "permission", { get: () => erlaubnis });
  Notification.requestPermission = async () => {
    erlaubnis = "granted";
    return erlaubnis;
  };
  const abo = (endpoint: string) => ({
    endpoint,
    options: { applicationServerKey: null },
    toJSON: () => ({ endpoint, keys: { p256dh: "p256dh", auth: "auth" } }),
    unsubscribe: async () => {
      localStorage.removeItem(SCHLUESSEL);
      return true;
    },
  });
  PushManager.prototype.getSubscription = async () => {
    const e = localStorage.getItem(SCHLUESSEL);
    if (e) {
      erlaubnis = "granted";
    }
    return (e ? abo(e) : null) as unknown as PushSubscription;
  };
  PushManager.prototype.subscribe = async () => {
    const e = `https://fcm.googleapis.com/fcm/send/e2e-${crypto.randomUUID()}`;
    localStorage.setItem(SCHLUESSEL, e);
    return abo(e) as unknown as PushSubscription;
  };
};

test("Benachrichtigungen je Gerät ein- und ausschalten", async ({
  browserName,
  playwright,
}) => {
  const handy = await geraet(playwright[browserName], "Pia");
  const { page } = handy;
  try {
    await page.addInitScript(PUSH_ATTRAPPE);
    await page.reload();
    await haushaltAnlegen(page, "Push-WG");
    await zuBereich(page, "Haushalt");

    const geraetSchalter = page.getByRole("switch", {
      name: /Auf diesem Gerät/,
    });
    await expect(geraetSchalter).toHaveAttribute("aria-checked", "false");
    await geraetSchalter.click();
    await expect(geraetSchalter).toHaveAttribute("aria-checked", "true");

    // Standard: alles außer Änderungen am Wochenplan.
    const plan = page.getByRole("switch", { name: /Änderungen am Wochenplan/ });
    await expect(
      page.getByRole("switch", { name: /Neues auf der Liste/ }),
    ).toHaveAttribute("aria-checked", "true");
    await expect(plan).toHaveAttribute("aria-checked", "false");
    await plan.click();
    await expect(plan).toHaveAttribute("aria-checked", "true");
    await page.getByRole("switch", { name: /Neue Mitglieder/ }).click();

    // Gespeichert ist beim Server – übersteht das Neuladen.
    await page.reload();
    await zuBereich(page, "Haushalt");
    await expect(plan).toHaveAttribute("aria-checked", "true");
    await expect(
      page.getByRole("switch", { name: /Neue Mitglieder/ }),
    ).toHaveAttribute("aria-checked", "false");
    await page
      .getByRole("heading", { name: "Benachrichtigungen" })
      .locator("..")
      .screenshot({
        path: "test-results/benachrichtigungen.png",
        animations: "disabled",
      });

    await geraetSchalter.click();
    await expect(geraetSchalter).toHaveAttribute("aria-checked", "false");
    await expect(plan).toHaveCount(0);

    // Antippen einer Benachrichtigung öffnet Haushalt und Bereich.
    const id = await page.evaluate(() =>
      localStorage.getItem("haushalt-aktiv"),
    );
    await page.evaluate(() => localStorage.removeItem("haushalt-aktiv"));
    await page.goto(`/?haushalt=${id ?? ""}#plan`);
    await expect(page).toHaveURL(/\/#plan$/);
    expect(
      await page.evaluate(() => localStorage.getItem("haushalt-aktiv")),
    ).toBe(id);
  } finally {
    await handy.schliessen();
  }
});
