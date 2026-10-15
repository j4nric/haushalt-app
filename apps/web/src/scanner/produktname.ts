import type { Einheit } from "@haushalt/db/einheiten";
import { namensVarianten } from "@haushalt/db/namen";
import { mengeFuerListe, zerlegeZutat } from "@haushalt/db/zutaten";

/**
 * Aus Produktnamen der Datenbank („Milbona Frische Vollmilch 3,5 %“) einen kurzen
 * Artikelnamen machen und passende vorhandene Artikel finden („Milch“).
 */

const EINHEITEN =
  /^(g|kg|mg|ml|cl|dl|l|liter|stück|stk|x|st|pack|packung|pck)\.?$/i;

/** Ohne Marke, Prozente, Mengen und Einheiten; höchstens vier Wörter. */
export function kurzname(name: string, marke: string | null): string {
  const markenWoerter = new Set(
    (marke ?? "")
      .toLowerCase()
      .split(/[\s,]+/)
      .filter(Boolean),
  );
  const woerter = name
    .replace(/\([^)]*\)/g, " ")
    .split(/\s+/)
    .filter(
      (w) =>
        w &&
        !/\d|%/.test(w) &&
        !EINHEITEN.test(w) &&
        !markenWoerter.has(w.toLowerCase()) &&
        !/^[-–,.]$/.test(w),
    );
  const kurz = woerter.slice(0, 4).join(" ").trim();
  return kurz || name.trim();
}

/**
 * Vorhandene Artikel, die zum Produkt passen: ein Wort des Produktnamens ist der
 * Artikelname (auch Plural) oder endet darauf („Vollmilch“ → „Milch“).
 * Die genauesten zuerst, höchstens vier.
 */
export function passendeArtikel<T extends { name: string }>(
  produktname: string,
  artikel: T[],
): T[] {
  const woerter = produktname
    .toLowerCase()
    .split(/[^a-zäöüß]+/)
    .filter((w) => w.length >= 3);
  const treffer: { a: T; guete: number }[] = [];
  for (const a of artikel) {
    const varianten = namensVarianten(a.name);
    let guete = 0;
    for (const w of woerter) {
      for (const v of varianten) {
        if (w === v) {
          guete = Math.max(guete, 3);
        } else if (v.length >= 4 && w.endsWith(v)) {
          guete = Math.max(guete, 2);
        }
      }
    }
    if (guete > 0) {
      treffer.push({ a, guete: guete * 100 + a.name.length });
    }
  }
  return treffer
    .sort((x, y) => y.guete - x.guete)
    .slice(0, 4)
    .map((t) => t.a);
}

/** Packungsangabe („500 g“, „1 l“) als Vorratsmenge; sonst `null`. */
export function packungsmenge(
  menge: string | null,
): { menge: number; einheit: Einheit } | null {
  if (!menge) {
    return null;
  }
  const z = zerlegeZutat(menge);
  const umgerechnet = mengeFuerListe({ ...z, name: z.name || "x" });
  return umgerechnet.menge != null && umgerechnet.einheit
    ? { menge: umgerechnet.menge, einheit: umgerechnet.einheit }
    : null;
}
