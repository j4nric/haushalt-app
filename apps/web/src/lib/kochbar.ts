import { findeImVorrat } from "@haushalt/db/namen";
import { bestandKurz, packungVon, reichtVorrat } from "@haushalt/db/vorrat";
import {
  istGrundzutat,
  mengeFuerListe,
  type Zutat,
} from "@haushalt/db/zutaten";

/**
 * „Was kann ich jetzt kochen?“: Welche Zutaten eines Rezepts liegen im Vorrat?
 * Gewürze und Grundzutaten (Salz, Öl …) zählen nicht – die sind fast immer da.
 * Bekannt ist nur, was im Vorrat geführt wird; Frisches ohne Vorrat zählt als fehlend.
 */

export type ArtikelStand = {
  id: string;
  /** Kleingeschrieben, zum Abgleich mit Zutatennamen. */
  name: string;
  im_vorrat: number;
  /** Packungen bzw. Stück im Vorrat. */
  bestand: number;
  angebrochen: number;
  packung_menge: number | null;
  packung_einheit: string | null;
  auf_liste: number;
};

export type RezeptZutat = Zutat & {
  gewuerz: number | null;
  optional?: number | null;
};

/** Reicht der Vorrat für diese Zutat? Gibt die Beschreibung zurück, sonst `null`. */
export function imVorrat(
  z: Zutat,
  artikel: ArtikelStand | undefined,
  faktor = 1,
): string | null {
  if (!artikel?.im_vorrat) {
    return null;
  }
  const vorrat = vorratVon(artikel);
  return reichtVorrat(vorrat, mengeFuerListe(z, faktor))
    ? `im Vorrat: ${bestandKurz(vorrat)}`
    : null;
}

export function vorratVon(a: ArtikelStand) {
  return {
    bestand: a.bestand,
    angebrochen: Boolean(a.angebrochen),
    packung: packungVon(a),
  };
}

/** Zählt nur Zutaten, die man wirklich einkaufen müsste (ohne Optionales). */
function zaehltFuerKochbar(z: RezeptZutat): boolean {
  return !z.gewuerz && !z.optional && !istGrundzutat(z.name);
}

export type Verfuegbarkeit = {
  /** 0–100; ohne zählende Zutaten 100. */
  prozent: number;
  fehlt: string[];
};

export function verfuegbarkeit(
  zutaten: RezeptZutat[],
  artikel: Map<string, ArtikelStand>,
): Verfuegbarkeit {
  const zaehlend = zutaten.filter(zaehltFuerKochbar);
  const fehlt = zaehlend
    .filter((z) => !imVorrat(z, findeImVorrat(artikel, z.name)))
    .map((z) => z.name);
  const prozent =
    zaehlend.length === 0
      ? 100
      : Math.round(((zaehlend.length - fehlt.length) / zaehlend.length) * 100);
  return { prozent, fehlt };
}
