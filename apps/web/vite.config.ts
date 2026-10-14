import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        "favicon.ico",
        "apple-touch-icon-180x180.png",
        "icon.svg",
      ],
      manifest: {
        name: "Haushalt",
        short_name: "Haushalt",
        description:
          "Gemeinsame Einkaufsliste, die auch ohne Netz funktioniert",
        lang: "de",
        start_url: "/",
        display: "standalone",
        theme_color: "#15803d",
        background_color: "#ffffff",
        icons: [
          { src: "pwa-64x64.png", sizes: "64x64", type: "image/png" },
          { src: "pwa-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "pwa-512x512.png", sizes: "512x512", type: "image/png" },
          {
            src: "maskable-icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        // Alles für den Offline-Start vorab speichern, auch SQLite (WASM) und
        // die Worker von PowerSync. Die WASM-Dateien sind größer als Workbox' Standardlimit.
        globPatterns: ["**/*.{js,css,html,wasm,svg,png,ico}"],
        maximumFileSizeToCacheInBytes: 15 * 1024 * 1024,
        navigateFallback: "/index.html",
        // API und Sync immer übers Netz, nie aus dem Cache.
        navigateFallbackDenylist: [/^\/api\//, /^\/powersync\//],
      },
    }),
  ],
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
      // Wie in Produktion: PowerSync unter derselben Adresse wie die App.
      "/powersync": {
        target: "http://localhost:8080",
        rewrite: (pfad) => pfad.replace(/^\/powersync/, ""),
        ws: true,
      },
    },
  },
});
