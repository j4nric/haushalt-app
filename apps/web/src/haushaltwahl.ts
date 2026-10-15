import { useQuery } from "@powersync/react";
import { useSyncExternalStore } from "react";

/**
 * Welcher Haushalt auf diesem Gerät gerade aktiv ist. Lokal liegen alle Haushalte, in
 * denen man Mitglied ist (siehe sync-config.yaml); gewählt wird je Gerät.
 * Gibt es den gewählten (noch) nicht – frisch angelegt und noch nicht synchronisiert,
 * oder verlassen –, gilt vorerst der erste.
 */

const SCHLUESSEL = "haushalt-aktiv";
const beobachter = new Set<() => void>();

function lesen(): string | null {
  try {
    return localStorage.getItem(SCHLUESSEL);
  } catch {
    return null;
  }
}
let gewaehlt = lesen();

export function haushaltWaehlen(id: string | null) {
  gewaehlt = id;
  try {
    if (id) {
      localStorage.setItem(SCHLUESSEL, id);
    } else {
      localStorage.removeItem(SCHLUESSEL);
    }
  } catch {
    // Ohne Speicher gilt die Wahl bis zum Neuladen.
  }
  for (const b of beobachter) {
    b();
  }
}

export type MeinHaushalt = { id: string; name: string };

export function useHaushalte(): {
  haushalte: MeinHaushalt[];
  aktiv: MeinHaushalt | undefined;
} {
  const { data: haushalte } = useQuery<MeinHaushalt>(
    "SELECT id, name FROM haushalte ORDER BY lower(name)",
  );
  const id = useSyncExternalStore(
    (b) => {
      beobachter.add(b);
      return () => beobachter.delete(b);
    },
    () => gewaehlt,
  );
  return {
    haushalte,
    aktiv: haushalte.find((h) => h.id === id) ?? haushalte[0],
  };
}
