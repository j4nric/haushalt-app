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

/** „3× gekocht · zuletzt vor 5 Tagen“ bzw. „Noch nie gekocht“. */
export function kochstatistik(anzahl: number, zuletzt: string | null): string {
  if (!anzahl || !zuletzt) {
    return "Noch nie gekocht";
  }
  return `${anzahl}× gekocht · zuletzt ${vorWann(zuletzt)}`;
}

export function vorWann(zeitpunkt: string): string {
  const tage = Math.floor(
    (new Date().setHours(0, 0, 0, 0) -
      new Date(zeitWert(zeitpunkt)).setHours(0, 0, 0, 0)) /
      86_400_000,
  );
  if (tage <= 0) {
    return "heute";
  }
  if (tage === 1) {
    return "gestern";
  }
  if (tage < 14) {
    return `vor ${tage} Tagen`;
  }
  if (tage < 60) {
    return `vor ${Math.round(tage / 7)} Wochen`;
  }
  return `vor ${Math.round(tage / 30)} Monaten`;
}
