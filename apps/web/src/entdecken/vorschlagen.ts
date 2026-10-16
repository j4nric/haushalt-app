import { findeImVorrat } from "@haushalt/db/namen";
import { istGrundzutat, zerlegeZeile } from "@haushalt/db/zutaten";
import { type ArtikelStand, verfuegbarkeit } from "../lib/kochbar";
import type { SammlungsRezept } from "./sammlung/typ";

/**
 * „Entdecken“: Welche Rezepte der Startsammlung passen gerade? Punkte gibt es für
 * Zutaten, die schon im Vorrat sind, und für die Saison; ein täglich wechselnder
 * Zufall sorgt für Abwechslung. Was der Haushalt schon hat, fällt raus.
 */

export type Vorschlag = {
  rezept: SammlungsRezept;
  punkte: number;
  /** Zutaten, die im Vorrat sind (Namen wie im Rezept). */
  ausVorrat: string[];
  saison: boolean;
  /** Wie viel der zählenden Zutaten im Vorrat ist (wie bei den eigenen Rezepten). */
  prozent: number;
};

/** Zutaten und Gewürze als Rezept-Zutaten – für „Was ist im Vorrat?“. */
export function rezeptZutaten(r: SammlungsRezept) {
  let z = zutatenCache.get(r);
  if (!z) {
    z = rezeptZutatenRoh(r);
    zutatenCache.set(r, z);
  }
  return z;
}

function rezeptZutatenRoh(r: SammlungsRezept) {
  const zeilen = (text: string, gewuerz: number) =>
    text
      .split("\n")
      .map((z) => z.trim())
      .filter(Boolean)
      .map((z) => {
        const zutat = zerlegeZeile(z);
        return { ...zutat, gewuerz, optional: zutat.optional ? 1 : 0 };
      });
  return [...zeilen(r.zutaten, 0), ...zeilen(r.gewuerze, 1)];
}

// Die Sammlung ändert sich nie – Zutaten nur einmal zerlegen.
const hauptCache = new WeakMap<SammlungsRezept, string[]>();
const zutatenCache = new WeakMap<
  SammlungsRezept,
  ReturnType<typeof rezeptZutatenRoh>
>();

/** Zutatennamen eines Rezepts (ohne Gewürze, Optionales und Salz/Öl & Co.). */
export function hauptzutaten(r: SammlungsRezept): string[] {
  let namen = hauptCache.get(r);
  if (!namen) {
    namen = hauptzutatenRoh(r);
    hauptCache.set(r, namen);
  }
  return namen;
}

function hauptzutatenRoh(r: SammlungsRezept): string[] {
  return r.zutaten
    .split("\n")
    .map((z) => z.trim())
    .filter(Boolean)
    .map(zerlegeZeile)
    .filter((z) => !z.optional && !istGrundzutat(z.name))
    .map((z) => z.name);
}

/** Zufallszahlen, die einen Tag lang gleich bleiben – Vorschläge springen nicht. */
export function tagesZufall(tag: string, salz = 0): () => number {
  let s = salz;
  for (const c of tag) {
    s = (s * 31 + c.charCodeAt(0)) | 0;
  }
  return () => {
    // mulberry32
    s = (s + 0x6d2b79f5) | 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function vorschlagen(
  sammlung: SammlungsRezept[],
  {
    artikel,
    vorhandeneTitel,
    monat,
    zufall,
  }: {
    /** Vorratsstand, Schlüssel = kleingeschriebener Name. */
    artikel: Map<string, ArtikelStand>;
    /** Titel der eigenen Rezepte (klein) – die werden nicht mehr vorgeschlagen. */
    vorhandeneTitel: Set<string>;
    /** 1–12 */
    monat: number;
    zufall: () => number;
  },
): Vorschlag[] {
  return sammlung
    .filter((r) => !vorhandeneTitel.has(r.titel.toLowerCase()))
    .map((rezept) => {
      const ausVorrat = hauptzutaten(rezept).filter((name) => {
        const a = findeImVorrat(artikel, name);
        return Boolean(a?.im_vorrat && a.bestand > 0);
      });
      const saisonal = rezept.saison.length > 0;
      const saison = saisonal && rezept.saison.includes(monat);
      const punkte =
        ausVorrat.length * 1.5 +
        (saison ? 3 : saisonal ? -4 : 0) +
        zufall() * 2.5;
      const { prozent } = verfuegbarkeit(rezeptZutaten(rezept), artikel);
      return { rezept, punkte, ausVorrat, saison, prozent };
    })
    .sort((a, b) => b.punkte - a.punkte);
}
