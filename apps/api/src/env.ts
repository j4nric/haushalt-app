/** Liest eine Pflicht-Umgebungsvariable (lokal aus der .env im Repo-Wurzelverzeichnis). */
function pflicht(name: string): string {
  const wert = process.env[name];
  if (!wert) {
    throw new Error(`Umgebungsvariable ${name} fehlt. Ist die .env angelegt?`);
  }
  return wert;
}

export function datenbankUrl(datenbank = pflicht("POSTGRES_DB")) {
  const host = process.env.POSTGRES_HOST ?? "localhost";
  return `postgres://${pflicht("POSTGRES_USER")}:${pflicht("POSTGRES_PASSWORD")}@${host}:${process.env.POSTGRES_PORT ?? 5432}/${datenbank}`;
}

export function ladeEnv() {
  return {
    port: Number(process.env.API_PORT ?? 3000),
    datenbankUrl: datenbankUrl(),
    authSecret: pflicht("BETTER_AUTH_SECRET"),
    /** Adresse, unter der Browser die App (und über den Vite-Proxy das API) erreichen. */
    webUrl: process.env.WEB_URL ?? "http://localhost:5173",
    /** Weitere erlaubte Adressen, kommagetrennt (lokal: vite preview für die E2E-Tests). */
    /** Gebautes Frontend (apps/web/dist); nur in Produktion gesetzt. */
    frontendVerzeichnis: process.env.FRONTEND_DIR,
    /** Rezept-Import von lokalen Adressen erlauben – nur für Entwicklung/E2E-Tests. */
    importLokalErlaubt: process.env.REZEPT_IMPORT_LOKAL === "1",
    weitereOrigins: (process.env.TRUSTED_ORIGINS ?? "")
      .split(",")
      .filter(Boolean),
  };
}
