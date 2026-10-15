import { type Einheit, formatiereMenge } from "./einheiten";
import type { Kategorie } from "./kategorien";

/**
 * Kategorien, deren Artikel neu angelegt standardmäßig im Vorrat geführt werden.
 * Frisches (Obst, Brot, Milchprodukte, Fleisch) zählt man meist nicht nach.
 * Pro Artikel lässt sich das jederzeit umstellen.
 */
export const VORRAT_KATEGORIEN: readonly Kategorie[] = [
  "vorrat",
  "suesses_snacks",
  "getraenke",
  "tiefkuehl",
  "drogerie",
  "haushalt",
];

export function standardmaessigImVorrat(
  kategorie: string | null | undefined,
): boolean {
  return VORRAT_KATEGORIEN.includes(kategorie as Kategorie);
}

/**
 * Der Vorrat zählt Packungen bzw. Stück – so pflegt man ihn im Alltag. Die optionale
 * Packungsgröße („1 Packung = 500 g“) rechnet für Rezepte Gramm und Milliliter um.
 * Eine angebrochene Packung wird nur markiert, nicht anteilig gezählt.
 */
export type Packung = { menge: number; einheit: Einheit };

/** Packungsgröße aus den Spalten eines Artikels (beide gesetzt oder keine). */
export function packungVon(a: {
  packung_menge: number | null;
  packung_einheit: string | null;
}): Packung | null {
  return a.packung_menge != null && a.packung_menge > 0 && a.packung_einheit
    ? { menge: a.packung_menge, einheit: a.packung_einheit as Einheit }
    : null;
}

type Menge = { menge: number | null; einheit: Einheit | null };

/**
 * Wie viele Packungen ein gekaufter Listeneintrag in den Vorrat bringt – immer
 * mindestens eine. „3 Stk.“ → 3; „1 kg“ bei Packungen à 500 g → 2; „1 kg“ ohne
 * bekannte Packungsgröße → 1 (es war ja ein Einkauf).
 */
export function eingekauftePackungen(
  eintrag: Menge,
  packung: Packung | null,
): number {
  if (eintrag.menge == null || eintrag.menge <= 0) {
    return 1;
  }
  const einheit = eintrag.einheit ?? "stueck";
  if (packung?.einheit === einheit) {
    return Math.max(1, Math.ceil(eintrag.menge / packung.menge - 1e-9));
  }
  if (einheit === "stueck") {
    return Math.max(1, Math.ceil(eintrag.menge - 1e-9));
  }
  return 1;
}

/** Erster Einkauf mit Gewicht („1 kg Mehl“) verrät die Packungsgröße, falls noch keine bekannt ist. */
export function gelerntePackung(
  eintrag: Menge,
  packung: Packung | null,
): Packung | null {
  if (
    packung ||
    eintrag.menge == null ||
    eintrag.menge <= 0 ||
    !eintrag.einheit ||
    eintrag.einheit === "stueck"
  ) {
    return null;
  }
  return { menge: eintrag.menge, einheit: eintrag.einheit };
}

/**
 * Bedarf eines Rezepts (in g, ml oder Stück) in Packungen. `null`, wenn sich das
 * nicht umrechnen lässt (keine Menge, oder Gramm ohne bekannte Packungsgröße).
 */
export function bedarfInPackungen(
  bedarf: Menge,
  packung: Packung | null,
): number | null {
  if (bedarf.menge == null || bedarf.menge <= 0) {
    return null;
  }
  const einheit = bedarf.einheit ?? "stueck";
  // „3 Eier“ bei Packungen à 10 Stück → 0,3 Packungen; ohne Packung zählen Stück.
  if (packung?.einheit === einheit) {
    return bedarf.menge / packung.menge;
  }
  return einheit === "stueck" ? bedarf.menge : null;
}

/** Einzelne Stück ohne Packung (Eier, Zitronen) – da gibt es nichts anzubrechen. */
function zaehltStueck(bedarf: Menge, packung: Packung | null): boolean {
  return (
    (bedarf.einheit ?? "stueck") === "stueck" && packung?.einheit !== "stueck"
  );
}

/**
 * Reicht der Vorrat für den Bedarf? Eine angebrochene Packung zählt für Gramm und
 * Milliliter als halbe. Lässt sich nicht umrechnen, reicht „überhaupt etwas da“.
 */
export function reichtVorrat(
  vorrat: { bestand: number; angebrochen: boolean; packung: Packung | null },
  bedarf: Menge,
): boolean {
  if (vorrat.bestand <= 0) {
    return false;
  }
  const noetig = bedarfInPackungen(bedarf, vorrat.packung);
  if (noetig == null) {
    return true;
  }
  const abzug =
    vorrat.angebrochen && !zaehltStueck(bedarf, vorrat.packung) ? 0.5 : 0;
  return vorrat.bestand - abzug >= noetig - 1e-9;
}

/**
 * Nach dem Kochen: wie viele ganze Packungen verbraucht sind und ob danach eine
 * angebrochen ist. Ein Rest öffnet eine Packung; war schon eine offen, kommt der
 * Rest aus ihr (sie bleibt offen). `null`, wenn sich das nicht umrechnen lässt.
 */
export function verbrauchNachRezept(
  bedarf: Menge,
  vorrat: { bestand: number; angebrochen: boolean; packung: Packung | null },
): { ganze: number; angebrochen: boolean } | null {
  const noetig = bedarfInPackungen(bedarf, vorrat.packung);
  if (noetig == null) {
    return null;
  }
  if (zaehltStueck(bedarf, vorrat.packung)) {
    return {
      ganze: Math.min(Math.ceil(noetig - 1e-9), Math.max(vorrat.bestand, 0)),
      angebrochen: vorrat.angebrochen,
    };
  }
  const ganze = Math.min(
    Math.floor(noetig + 1e-9),
    Math.max(vorrat.bestand, 0),
  );
  const rest = noetig - ganze > 0.01;
  const uebrig = vorrat.bestand - ganze;
  return { ganze, angebrochen: uebrig > 0 && (rest || vorrat.angebrochen) };
}

/** Kurz für Rezepte: „2 × 500 g (1 offen)“, „3 Stk.“ */
export function bestandKurz(v: {
  bestand: number;
  angebrochen: boolean;
  packung: Packung | null;
}): string {
  const n = Math.max(v.bestand, 0).toLocaleString("de-DE", {
    maximumFractionDigits: 2,
  });
  const text = v.packung
    ? `${n} × ${formatiereMenge(v.packung.menge, v.packung.einheit)}`
    : `${n} Stk.`;
  return v.angebrochen && v.bestand > 0 ? `${text} (1 offen)` : text;
}

/** „2“, „à 500 g“ und „1 offen“ – für Zeilen und Dialoge. */
export function bestandBeschreibung(v: {
  bestand: number;
  angebrochen: boolean;
  packung: Packung | null;
}): string {
  const teile: string[] = [];
  if (v.packung) {
    teile.push(`à ${formatiereMenge(v.packung.menge, v.packung.einheit)}`);
  }
  if (v.angebrochen && v.bestand > 0) {
    teile.push("1 offen");
  }
  return teile.join(" · ");
}

/**
 * Menge, die auf die Einkaufsliste soll, wenn der Bestand unter den Mindestbestand
 * fällt: so viel, dass der Mindestbestand wieder erreicht ist. Sonst `null`.
 */
export function auffuellmenge(
  bestand: number,
  mindestbestand: number | null,
): number | null {
  if (
    mindestbestand == null ||
    mindestbestand <= 0 ||
    bestand >= mindestbestand
  ) {
    return null;
  }
  // Gleitkomma-Reste aus Summen wie 0.1 + 0.2 abschneiden.
  return Math.round((mindestbestand - Math.max(bestand, 0)) * 1000) / 1000;
}
