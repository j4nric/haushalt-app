/** Liest eine Pflicht-Umgebungsvariable (aus der .env im Repo-Wurzelverzeichnis). */
function pflicht(name: string): string {
  const wert = process.env[name];
  if (!wert) {
    throw new Error(`Umgebungsvariable ${name} fehlt. Ist die .env angelegt?`);
  }
  return wert;
}

export const env = {
  port: Number(process.env.API_PORT ?? 3000),
  datenbankUrl: `postgres://${pflicht("POSTGRES_USER")}:${pflicht("POSTGRES_PASSWORD")}@localhost:${process.env.POSTGRES_PORT ?? 5432}/${pflicht("POSTGRES_DB")}`,
  powersyncUrl: `http://localhost:${process.env.POWERSYNC_PORT ?? 8080}`,
  powersyncJwtSecret: pflicht("POWERSYNC_JWT_SECRET"),
};
