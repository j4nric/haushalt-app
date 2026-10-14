import {
  defineConfig,
  minimal2023Preset,
} from "@vite-pwa/assets-generator/config";

// Erzeugt aus public/icon.svg die App-Icons (pnpm pwa-assets).
export default defineConfig({
  preset: minimal2023Preset,
  images: ["public/icon.svg"],
});
