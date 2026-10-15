/**
 * Gerichte im Vorrat: gekaufte Fertiggerichte (TK-Pizza, Lasagne) und selbst
 * gekochte Reste (Bestand = Portionen), im Kühlschrank oder eingefroren.
 */
export type Gericht = "fertig" | "rest";
export type Lagerort = "kuehlschrank" | "tk";

/** So lange halten Reste ungefähr – danach weist die App darauf hin. */
const HALTBAR_TAGE: Record<Lagerort, number> = { kuehlschrank: 3, tk: 90 };

const TAG = 86_400_000;

/** „seit gestern“, „seit 4 Tagen“, „seit 3 Wochen“ – und ob es bald weg sollte. */
export function restAlter(
  eingelagertAm: number | null,
  lagerort: Lagerort | null,
  jetzt = Date.now(),
): { text: string; warnen: boolean } {
  if (eingelagertAm == null || Number.isNaN(eingelagertAm)) {
    return { text: "", warnen: false };
  }
  const tage = Math.floor(
    (new Date(jetzt).setHours(0, 0, 0, 0) -
      new Date(eingelagertAm).setHours(0, 0, 0, 0)) /
      TAG,
  );
  const text =
    tage <= 0
      ? "von heute"
      : tage === 1
        ? "seit gestern"
        : tage < 14
          ? `seit ${tage} Tagen`
          : tage < 60
            ? `seit ${Math.floor(tage / 7)} Wochen`
            : `seit ${Math.floor(tage / 30)} Monaten`;
  const grenze = HALTBAR_TAGE[lagerort ?? "kuehlschrank"];
  return { text, warnen: tage >= grenze };
}

/** Typische Fertiggerichte – neu angelegte TK-Artikel damit gelten als Gericht. */
const FERTIGGERICHT =
  /pizza|lasagne|auflauf|gratin|nuggets|fischstäbchen|frikadellen|bowl|curry|eintopf|gericht|maultaschen|cannelloni|tortellini|baguette|burger|gyoza|dumplings|frühlingsrollen|schlemmerfilet|kaiserschmarrn/i;

export function istFertiggericht(
  name: string,
  kategorie: string | null,
): boolean {
  return kategorie === "tiefkuehl" && FERTIGGERICHT.test(name);
}

export const LAGERORT_NAME: Record<Lagerort, string> = {
  kuehlschrank: "Kühlschrank",
  tk: "eingefroren",
};
