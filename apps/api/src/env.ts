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
  };
}
