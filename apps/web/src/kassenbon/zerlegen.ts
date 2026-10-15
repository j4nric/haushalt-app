/**
 * Kassenbon (eBon) zerlegen: aus den Textzeilen des PDFs die gekauften Positionen.
 * Gebaut nach dem REWE-eBon, aber bewusst allgemein – viele Kassen drucken
 * „NAME   1,99 B“, darunter bei Mehrfachkauf „4 Stk x 0,59“ bzw. „0,512 kg x …“.
 * Eine Zeile sind die Textstücke der PDF-Zeile, mit Tab getrennt.
 */

export type Position = {
  /** Wie auf dem Bon, z. B. „ROSENBROE. HELL“. */
  text: string;
  /** Stück; bei gewogener Ware 1. */
  anzahl: number;
  /** Gewogen („0,512 kg x 2,99 EUR/kg“) – dann in kg. */
  kg: number | null;
  /** Summe dieser Position in Euro. */
  preis: number;
};

export type Kassenbon = {
  laden: string | null;
  /** „2026-10-14“ */
  datum: string | null;
  /** Eindeutig je Einkauf – damit derselbe Bon nicht zweimal gebucht wird. */
  schluessel: string | null;
  positionen: Position[];
  /** Übersprungen: Pfand, Leergut, Rabatte. */
  uebersprungen: number;
};

const BETRAG = String.raw`-?\d{1,4},\d{2}`;
const POSITION = new RegExp(
  String.raw`^(.*?\S)(?:\t|\s{2,})(${BETRAG})(?:\s*[A-D])?(?:\s*\*)?$`,
);
const ANZAHL = new RegExp(
  String.raw`^(\d{1,3})\s*(?:Stk|St)\.?\s*x(?:\t|\s+)(${BETRAG})`,
  "i",
);
const GEWICHT = /^(\d+,\d{3})\s*kg\s*x/i;
const UEBERSPRINGEN =
  /^(pfand|leergut|pfandrück|rabatt|coupon|bonus|gutschein|aktion|rückgeld|kartenzahlung)\b/i;
/** Ab hier kommen Summe, Zahlung, Steuer – keine Positionen mehr. */
const ENDE = /^(-{5,}|=+|summe\b|zu zahlen|gesamt\b|total\b)/i;

const zahl = (text: string) => Number(text.replace(".", "").replace(",", "."));

export function zerlegeBon(zeilen: string[]): Kassenbon {
  const positionen = new Map<string, Position>();
  let letzte: Position | null = null;
  let uebersprungen = 0;
  let ende = false;

  for (const roh of zeilen) {
    const zeile = roh.trim();
    if (!zeile) {
      continue;
    }
    if (ENDE.test(zeile)) {
      ende = true;
    }
    if (ende) {
      continue;
    }
    const anzahl = zeile.match(ANZAHL);
    if (anzahl && letzte) {
      letzte.anzahl = Number(anzahl[1]) || 1;
      continue;
    }
    const gewicht = zeile.match(GEWICHT);
    if (gewicht && letzte) {
      letzte.kg = zahl(gewicht[1] ?? "0");
      continue;
    }
    const p = zeile.match(POSITION);
    if (!p?.[1] || !p[2]) {
      continue;
    }
    const text = p[1].replace(/\t/g, " ").replace(/\s+/g, " ").trim();
    const preis = zahl(p[2]);
    if (preis <= 0 || UEBERSPRINGEN.test(text) || /^\d/.test(text)) {
      uebersprungen++;
      letzte = null;
      continue;
    }
    // Zweimal dasselbe („STEINOFEN PIZZA“, „STEINOFEN PIZZA“) ist eine Position.
    const bisher = positionen.get(text);
    if (bisher) {
      bisher.anzahl += 1;
      bisher.preis = Math.round((bisher.preis + preis) * 100) / 100;
      letzte = bisher;
      continue;
    }
    letzte = { text, anzahl: 1, kg: null, preis };
    positionen.set(text, letzte);
  }

  const alles = zeilen.join("\n");
  const datum = alles.match(/\b(\d{2})\.(\d{2})\.(\d{4})\b/);
  const markt = alles.match(/Markt:\s*(\d+)/i)?.[1];
  const bonNr = alles.match(/Bon-Nr\.?:?\s*(\d+)/i)?.[1];
  const tse = alles.match(/TSE-Transaktion:?\s*(\d+)/i)?.[1];
  const laden = /\brewe\b/i.test(alles)
    ? "REWE"
    : (zeilen
        .find((z) => z.trim())
        ?.trim()
        .slice(0, 60) ?? null);
  const iso = datum ? `${datum[3]}-${datum[2]}-${datum[1]}` : null;
  const schluessel =
    tse || bonNr
      ? [laden ?? "", markt ?? "", iso ?? "", bonNr ?? "", tse ?? ""].join("|")
      : null;

  return {
    laden,
    datum: iso,
    schluessel,
    positionen: [...positionen.values()],
    uebersprungen,
  };
}
