import { serveStatic } from "@hono/node-server/serve-static";
import type { Hono } from "hono";

/**
 * Liefert in Produktion das gebaute Frontend (apps/web/dist) aus.
 * Dateien mit Hash im Namen (assets/) dürfen ewig gecacht werden; index.html,
 * Service Worker und Manifest nie, sonst kommen Updates nicht an.
 */
export function statischesFrontend(app: Hono, verzeichnis: string) {
  app.use("/assets/*", async (c, next) => {
    await next();
    c.header("Cache-Control", "public, max-age=31536000, immutable");
  });
  app.use("*", async (c, next) => {
    await next();
    if (!c.res.headers.has("Cache-Control")) {
      c.header("Cache-Control", "no-cache");
    }
  });
  app.use("*", serveStatic({ root: verzeichnis }));
  // Alles andere ist eine Route der Single-Page-App – außer unbekannte API-Pfade.
  const spa = serveStatic({ root: verzeichnis, path: "index.html" });
  app.use("*", (c, next) =>
    c.req.path.startsWith("/api/") ? next() : spa(c, next),
  );
}
