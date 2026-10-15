import type { Einheit } from "@haushalt/db/einheiten";
import { mengeFuerListe, type Zutat } from "@haushalt/db/zutaten";
import { gewichtetZiehen } from "./zufall";

/**
 * Wochenplan: Tage, Zutaten der Woche zusammenzählen, Abwechslung und „Woche füllen“.
 * Datumsangaben sind Kalendertage in Ortszeit als „JJJJ-MM-TT“.
 */

export function tagText(d: Date): string {
  const j = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const t = String(d.getDate()).padStart(2, "0");
  return `${j}-${m}-${t}`;
}

export function heute(jetzt = new Date()): string {
  return tagText(jetzt);
}

/** `anzahl` Tage ab `start` (einschließlich). */
export function tageAb(start: string, anzahl: number): string[] {
  const [j, m, t] = start.split("-").map(Number);
  return Array.from({ length: anzahl }, (_, i) =>
    tagText(new Date(j ?? 2000, (m ?? 1) - 1, (t ?? 1) + i)),
  );
}

/** Tag plus `n` Tage (auch rückwärts). */
export function tagePlus(tag: string, n: number): string {
  const [j, m, t] = tag.split("-").map(Number);
  return tagText(new Date(j ?? 2000, (m ?? 1) - 1, (t ?? 1) + n));
}

const WOCHENTAGE = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];

/** „Heute“, „Morgen“ oder „Do, 16.10.“ */
export function tagName(tag: string, heuteTag = heute()): string {
  if (tag === heuteTag) {
    return "Heute";
  }
  if (tag === tagePlus(heuteTag, 1)) {
    return "Morgen";
  }
  return `${wochentag(tag)}, ${tag.slice(8, 10)}.${tag.slice(5, 7)}.`;
}

export function wochentag(tag: string): string {
  const [j, m, t] = tag.split("-").map(Number);
  return WOCHENTAGE[new Date(j ?? 2000, (m ?? 1) - 1, t ?? 1).getDay()] ?? "";
}

// --- Zutaten der Woche ----------------------------------------------------------

export type PlanZutat = Zutat & {
  gewuerz: number | null;
  optional?: number | null;
};

export type Posten = {
  id: string;
  name: string;
  /** Menge in Artikel-Einheiten; Einheit `null` = Stück bzw. ohne Menge. */
  zutat: Zutat;
  listenEinheit: Einheit | null;
  gewuerz: boolean;
  /** Optional im Rezept – kommt nicht von selbst auf die Liste. */
  optional: boolean;
  /** Für welche Tage („Mo, Mi“), nur beim Wochen-Einkauf. */
  fuer: string | null;
};

const ALS_ZUTAT: Record<Einheit, string | null> = {
  g: "g",
  ml: "ml",
  stueck: null,
};

/** Eine Zutat, umgerechnet in Artikel-Einheiten (für Liste und Vorrat). */
export function alsPosten(
  z: PlanZutat & { id: string },
  faktor: number,
  fuer: string | null = null,
): Posten {
  const { menge, einheit } = mengeFuerListe(z, faktor);
  return {
    id: z.id,
    name: z.name,
    zutat: {
      menge,
      einheit: einheit ? ALS_ZUTAT[einheit] : null,
      name: z.name,
      zusatz: null,
    },
    listenEinheit: einheit,
    gewuerz: Boolean(z.gewuerz),
    optional: Boolean(z.optional),
    fuer,
  };
}

/**
 * Zutaten mehrerer Gerichte zusammenzählen: gleicher Name (ohne Groß/klein) und
 * gleiche Einheit werden addiert; „2 EL Öl“ ohne kaufbare Menge zählt einmal.
 */
export function zutatenSammeln(
  gerichte: { tag: string; faktor: number; zutaten: PlanZutat[] }[],
): Posten[] {
  const nachSchluessel = new Map<string, Posten & { tage: Set<string> }>();
  for (const g of gerichte) {
    for (const z of g.zutaten) {
      const p = alsPosten({ ...z, id: "" }, g.faktor);
      const schluessel = `${z.name.trim().toLowerCase()}|${p.listenEinheit ?? ""}`;
      const bisher = nachSchluessel.get(schluessel);
      if (!bisher) {
        nachSchluessel.set(schluessel, {
          ...p,
          id: schluessel,
          tage: new Set([g.tag]),
        });
        continue;
      }
      bisher.tage.add(g.tag);
      bisher.gewuerz &&= p.gewuerz;
      // Braucht es ein Gericht fest, ist es nicht mehr optional.
      bisher.optional &&= p.optional;
      if (p.zutat.menge != null) {
        bisher.zutat = {
          ...bisher.zutat,
          menge: (bisher.zutat.menge ?? 0) + p.zutat.menge,
        };
      }
    }
  }
  return [...nachSchluessel.values()].map(({ tage, ...p }) => ({
    ...p,
    fuer: [...tage].sort().map(wochentag).join(", "),
  }));
}

// --- Abwechslung ----------------------------------------------------------------

/** Nur so viel brauchen wir aus einem Plan-Eintrag oder Kochvorgang. */
export type Gericht = { id: string; tag: string; rezeptId: string | null };

/**
 * „🔁 schon am Mo“: dasselbe Rezept innerhalb von `abstand` Tagen davor geplant oder
 * gekocht. Gibt je Plan-Eintrag den frühesten solchen Tag zurück.
 */
export function wiederholungen(
  geplant: Gericht[],
  gekocht: Gericht[],
  abstand = 3,
): Map<string, string> {
  const alle = [...geplant, ...gekocht];
  const ergebnis = new Map<string, string>();
  for (const e of geplant) {
    if (!e.rezeptId) {
      continue;
    }
    const frueher = alle
      .filter(
        (a) =>
          a !== e &&
          a.rezeptId === e.rezeptId &&
          a.tag < e.tag &&
          a.tag >= tagePlus(e.tag, -abstand),
      )
      .map((a) => a.tag)
      .sort()[0];
    if (frueher) {
      ergebnis.set(e.id, frueher);
    }
  }
  return ergebnis;
}

// --- Woche füllen ---------------------------------------------------------------

export type Kandidat = { id: string; titel: string; gewicht: number };

/**
 * Schlägt für leere Tage je ein Rezept vor: gewichtet (Favoriten, Vorrat, lange nicht
 * gekocht), jedes Rezept höchstens einmal, und nichts, was in der Nähe schon geplant ist.
 */
export function wocheFuellen(
  leereTage: string[],
  kandidaten: Kandidat[],
  schonGeplant: Gericht[],
  zufall: () => number = Math.random,
): Map<string, Kandidat> {
  const vergeben = new Set(
    schonGeplant.map((g) => g.rezeptId).filter(Boolean) as string[],
  );
  const vorschlaege = new Map<string, Kandidat>();
  for (const tag of leereTage) {
    const frei = kandidaten.filter((k) => !vergeben.has(k.id));
    const auswahl = frei.length > 0 ? frei : kandidaten;
    const k = gewichtetZiehen(auswahl, zufall);
    if (!k) {
      break;
    }
    vorschlaege.set(tag, k);
    vergeben.add(k.id);
  }
  return vorschlaege;
}
