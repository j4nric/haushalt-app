import { useEffect } from "react";
import { authClient } from "./auth";

/**
 * Der angemeldete Nutzer, auch ohne Netz.
 *
 * Better Auth fragt die Sitzung beim Server ab. Offline schlägt das fehl, und die App
 * würde den Login zeigen, obwohl alle Daten lokal da sind. Deshalb merken wir uns den
 * zuletzt bestätigten Nutzer auf dem Gerät:
 * - Server bestätigt die Sitzung → merken.
 * - Server sagt ausdrücklich „keine Sitzung“ → vergessen (abgemeldet, abgelaufen).
 * - Server nicht erreichbar → gemerkten Nutzer weiter verwenden.
 * Das ist nur für die Anzeige: Jeder Zugriff aufs API prüft weiterhin die echte Sitzung.
 */
export type Nutzer = { id: string; name: string };

const SCHLUESSEL = "haushalt-nutzer";

export function useNutzer(): { nutzer: Nutzer | null; laedt: boolean } {
  const { data, isPending, error } = authClient.useSession();
  const id = data?.user.id;
  const name = data?.user.name;
  // Kein Ergebnis und kein HTTP-Status: Der Server war nicht erreichbar.
  const offline = !isPending && !data && error != null && !error.status;

  useEffect(() => {
    if (id && name !== undefined) {
      merken({ id, name });
    } else if (!isPending && !offline) {
      vergessen();
    }
  }, [id, name, isPending, offline]);

  const bestaetigt = id && name !== undefined ? { id, name } : null;

  if (bestaetigt) {
    return { nutzer: bestaetigt, laedt: false };
  }
  if (isPending) {
    // Während der Server gefragt wird, schon mit dem gemerkten Nutzer starten.
    return { nutzer: gemerkt(), laedt: gemerkt() === null };
  }
  return { nutzer: offline ? gemerkt() : null, laedt: false };
}

export function vergessen() {
  try {
    localStorage.removeItem(SCHLUESSEL);
  } catch {
    // Speicher nicht verfügbar (z. B. privater Modus): nichts zu tun.
  }
}

function merken(nutzer: Nutzer) {
  try {
    localStorage.setItem(SCHLUESSEL, JSON.stringify(nutzer));
  } catch {
    // Ohne Speicher funktioniert die App nur online; kein Fehler.
  }
}

function gemerkt(): Nutzer | null {
  try {
    const wert = JSON.parse(localStorage.getItem(SCHLUESSEL) ?? "null");
    return typeof wert?.id === "string" && typeof wert?.name === "string"
      ? wert
      : null;
  } catch {
    return null;
  }
}
