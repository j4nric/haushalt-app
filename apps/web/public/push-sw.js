// Push-Benachrichtigungen – wird vom Service Worker (Workbox) per importScripts geladen.
// Der Server schickt { titel, text, url, kennung } (siehe apps/api/src/benachrichtigungen.ts).

self.addEventListener("push", (event) => {
  let n = {};
  try {
    n = event.data?.json() ?? {};
  } catch {
    n = { text: event.data?.text() ?? "" };
  }
  event.waitUntil(
    self.registration.showNotification(n.titel || "Haushalt", {
      body: n.text || "",
      icon: "/pwa-192x192.png",
      lang: "de",
      // Gleiche Kennung ersetzt die vorige Meldung („Neu auf der Liste“ stapelt sich nicht).
      tag: n.kennung || undefined,
      renotify: Boolean(n.kennung),
      data: { url: n.url || "/" },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = new URL(event.notification.data?.url || "/", self.location.origin)
    .href;
  event.waitUntil(
    (async () => {
      const fenster = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });
      const offen = fenster.find((f) => f.url.startsWith(self.location.origin));
      if (offen) {
        // Die App wechselt selbst Haushalt und Bereich – ohne neu zu laden.
        offen.postMessage({ art: "oeffnen", url });
        await offen.focus();
        return;
      }
      await self.clients.openWindow(url);
    })(),
  );
});
