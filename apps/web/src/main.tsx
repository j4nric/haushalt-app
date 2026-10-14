import { registerSW } from "virtual:pwa-register";
import { PowerSyncContext } from "@powersync/react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { db } from "./powersync";
import "./styles.css";

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
    </PowerSyncContext.Provider>
  </StrictMode>,
);
