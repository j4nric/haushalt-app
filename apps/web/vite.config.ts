import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  // @powersync/web bringt Web Worker und WASM mit; Vite darf es nicht vorbündeln.
  optimizeDeps: {
    exclude: ["@powersync/web"],
  },
  worker: {
    format: "es",
  },
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:3000",
    },
  },
});
