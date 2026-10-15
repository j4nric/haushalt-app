import { registerSW } from "virtual:pwa-register";
import { PowerSyncContext } from "@powersync/react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { Toaster } from "./components/ui/sonner";
import { themaAnwenden } from "./einstellungen";
import { haushaltWaehlen } from "./haushaltwahl";
import { db } from "./powersync";
import "./index.css";

// Farbschema aus den gespeicherten Einstellungen sofort anwenden (vor dem ersten Rendern).
themaAnwenden();

// Service Worker: speichert die App für den Offline-Start und aktualisiert sich selbst.
registerSW({ immediate: true });

// Aus einer Benachrichtigung geöffnet: „/?haushalt=…#rezepte/…“ → richtiger Haushalt
// und Bereich. Kommt auch als Nachricht vom Service Worker, wenn die App schon offen ist.
function oeffnen(url: URL) {
  const haushalt = url.searchParams.get("haushalt");
  if (haushalt) {
    haushaltWaehlen(haushalt);
  }
  history.replaceState(null, "", `${url.pathname}${url.hash}`);
  window.dispatchEvent(new HashChangeEvent("hashchange"));
}
if (new URLSearchParams(location.search).has("haushalt")) {
  oeffnen(new URL(location.href));
}
navigator.serviceWorker?.addEventListener("message", (e) => {
  if (e.data?.art === "oeffnen" && typeof e.data.url === "string") {
    oeffnen(new URL(e.data.url, location.origin));
  }
});

const root = document.getElementById("root");
if (!root) {
  throw new Error("Element #root fehlt in index.html");
}

createRoot(root).render(
  <StrictMode>
    <PowerSyncContext.Provider value={db}>
      <App />
      {/* Unten über Eingabeleiste und Navigation – oben verdeckten Meldungen Suche
          und Knöpfe. Höchstens zwei auf einmal. */}
      <Toaster
        position="bottom-center"
        offset={{ bottom: "calc(9rem + env(safe-area-inset-bottom))" }}
        mobileOffset={{ bottom: "calc(9rem + env(safe-area-inset-bottom))" }}
        visibleToasts={2}
      />
    </PowerSyncContext.Provider>
  </StrictMode>,
);
