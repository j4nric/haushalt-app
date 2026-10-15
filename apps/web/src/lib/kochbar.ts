import { formatiereMenge } from "@haushalt/db/einheiten";
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
  standardeinheit: "stueck" | "g" | "ml";
  bestand: number;
  auf_liste: number;
};

export type RezeptZutat = Zutat & { gewuerz: number | null };

/** Reicht der Vorrat für diese Zutat? Gibt die Beschreibung zurück, sonst `null`. */
export function imVorrat(
  z: Zutat,
  artikel: ArtikelStand | undefined,
  faktor = 1,
): string | null {
  if (!artikel?.im_vorrat || artikel.bestand <= 0) {
    return null;
  }
  const { menge, einheit } = mengeFuerListe(z, faktor);
  const reicht =
    menge == null ||
    einheit !== artikel.standardeinheit ||
    artikel.bestand >= menge;
  return reicht
    ? `im Vorrat: ${formatiereMenge(artikel.bestand, artikel.standardeinheit)}`
    : null;
}

/** Zählt nur Zutaten, die man wirklich einkaufen müsste. */
export function zaehltFuerKochbar(z: RezeptZutat): boolean {
  return !z.gewuerz && !istGrundzutat(z.name);
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
    .filter((z) => !imVorrat(z, artikel.get(z.name.toLowerCase())))
    .map((z) => z.name);
  const prozent =
    zaehlend.length === 0
      ? 100
      : Math.round(((zaehlend.length - fehlt.length) / zaehlend.length) * 100);
  return { prozent, fehlt };
}
