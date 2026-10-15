/**
 * Ein per „Teilen“ empfangener Link wartet hier, bis der Rezept-Editor ihn abholt –
 * auch über eine Anmeldung hinweg (sessionStorage überlebt das Neuladen).
 */
const SCHLUESSEL = "geteilter-link";

/** `null` = es wurde geteilt, aber ohne Link (der Editor sagt dann Bescheid). */
export function geteiltenLinkMerken(link: string | null) {
  try {
    sessionStorage.setItem(SCHLUESSEL, link ?? "");
  } catch {
    // Ohne Speicher geht der Link verloren – Einfügen von Hand bleibt.
  }
}

/** Holt den geteilten Link einmalig ab: Text, "" (ohne Link) oder `undefined`. */
export function geteiltenLinkAbholen(): string | undefined {
  try {
    const link = sessionStorage.getItem(SCHLUESSEL);
    sessionStorage.removeItem(SCHLUESSEL);
    return link ?? undefined;
  } catch {
    return undefined;
  }
}
