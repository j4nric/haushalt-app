/**
 * Zeitstempel einlesen, egal woher sie kommen: lokal geschrieben als ISO
 * („2026-10-15T09:43:00.123Z“), vom Server über den Sync aber im Postgres-Stil
 * („2026-10-15 09:43:00.123Z“ oder „… +00“). Safari liest Letzteres nicht zuverlässig,
 * und als Text verglichen wären beide verschieden – deshalb immer hierüber.
 */
export function zeitWert(zeitpunkt: string): number {
  const iso = zeitpunkt
    .trim()
    .replace(/^(\d{4}-\d{2}-\d{2}) (\d)/, "$1T$2")
    .replace(/([+-]\d{2})$/, "$1:00")
    .replace(/([+-]\d{2})(\d{2})$/, "$1:$2");
  return Date.parse(iso);
}
