import { PowerSyncContext } from "@powersync/react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { db, verbinden } from "./powersync";
import "./styles.css";

verbinden();

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
