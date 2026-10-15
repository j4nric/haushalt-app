import { registerSW } from "virtual:pwa-register";
import { PowerSyncContext } from "@powersync/react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { Toaster } from "./components/ui/sonner";
import { themaAnwenden } from "./einstellungen";
import { db } from "./powersync";
import "./index.css";

// Farbschema aus den gespeicherten Einstellungen sofort anwenden (vor dem ersten Rendern).
themaAnwenden();

// Service Worker: speichert die App für den Offline-Start und aktualisiert sich selbst.
registerSW({ immediate: true });

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
