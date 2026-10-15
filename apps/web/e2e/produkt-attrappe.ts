import { createServer } from "node:http";

/**
 * Nachgestelltes Open Food Facts auf Port 4180 (siehe PRODUKT_QUELLE in
 * playwright.config.ts). Mehrere Tests laufen parallel und brauchen denselben Port:
 * Der erste startet den Server, die anderen melden ihre Produkte dort nur an.
 * Der Server bleibt bis zum Ende des Testlaufs offen.
 */
const PORT = 4180;
const produkte = new Map<string, unknown>();

export async function produktAttrappe(neu: Record<string, unknown>) {
  const server = createServer((anfrage, antwort) => {
    if (anfrage.method === "POST" && anfrage.url === "/_produkte") {
      let text = "";
      anfrage.on("data", (teil) => {
        text += teil;
      });
      anfrage.on("end", () => {
        for (const [code, p] of Object.entries(JSON.parse(text))) {
          produkte.set(code, p);
        }
        antwort.end("ok");
      });
      return;
    }
    const code = anfrage.url?.match(/\/api\/v2\/product\/(\d+)\.json/)?.[1];
    const produkt = code ? produkte.get(code) : undefined;
    antwort.writeHead(produkt ? 200 : 404, {
      "content-type": "application/json",
    });
    antwort.end(
      JSON.stringify(produkt ? { status: 1, product: produkt } : { status: 0 }),
    );
  });
  const gestartet = await new Promise<boolean>((fertig) => {
    server.once("error", () => fertig(false));
    server.listen(PORT, "127.0.0.1", () => fertig(true));
  });
  if (gestartet) {
    server.unref();
    for (const [code, p] of Object.entries(neu)) {
      produkte.set(code, p);
    }
    return;
  }
  // Läuft schon (anderer Test-Worker): dort anmelden.
  await fetch(`http://127.0.0.1:${PORT}/_produkte`, {
    method: "POST",
    body: JSON.stringify(neu),
  });
}
