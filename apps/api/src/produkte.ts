import type postgres from "postgres";

/**
 * Produktdaten zu einem Barcode aus Open Food Facts (freie Datenbank, ODbL).
 * Der Server fragt stellvertretend für die Geräte – so sieht OFF nicht, wer scannt –
 * und merkt sich die Antwort: gefundene 30 Tage, „nicht gefunden“ einen Tag.
 */

export type Produkt = {
  barcode: string;
  gefunden: boolean;
  name: string | null;
  marke: string | null;
  menge: string | null;
};

export const BARCODE = /^[0-9]{8,14}$/;

const GUELTIG_GEFUNDEN_TAGE = 30;
const GUELTIG_NICHT_GEFUNDEN_TAGE = 1;

export async function produktNachschlagen(
  sql: postgres.Sql,
  barcode: string,
  quelle: string,
): Promise<Produkt> {
  const [gemerkt] = await sql<(Produkt & { frisch: boolean })[]>`
    select barcode, gefunden, name, marke, menge,
           abgerufen_am > now() - make_interval(days => case when gefunden then ${GUELTIG_GEFUNDEN_TAGE}::int else ${GUELTIG_NICHT_GEFUNDEN_TAGE}::int end) as frisch
    from produkte where barcode = ${barcode}
  `;
  if (gemerkt?.frisch) {
    const { frisch: _, ...produkt } = gemerkt;
    return produkt;
  }
  const geholt = await beiOpenFoodFacts(barcode, quelle);
  if (!geholt) {
    // Quelle nicht erreichbar: Altes liefern, wenn vorhanden – sonst „unbekannt“.
    if (gemerkt) {
      const { frisch: _, ...altes } = gemerkt;
      return altes;
    }
    return { barcode, gefunden: false, name: null, marke: null, menge: null };
  }
  await sql`
    insert into produkte (barcode, gefunden, name, marke, menge, abgerufen_am)
    values (${barcode}, ${geholt.gefunden}, ${geholt.name}, ${geholt.marke}, ${geholt.menge}, now())
    on conflict (barcode) do update set
      gefunden = excluded.gefunden, name = excluded.name, marke = excluded.marke,
      menge = excluded.menge, abgerufen_am = excluded.abgerufen_am
  `;
  return geholt;
}

async function beiOpenFoodFacts(
  barcode: string,
  quelle: string,
): Promise<Produkt | null> {
  const felder = "product_name,product_name_de,generic_name_de,brands,quantity";
  const antwort = await fetch(
    `${quelle}/api/v2/product/${barcode}.json?fields=${felder}`,
    {
      signal: AbortSignal.timeout(8000),
      headers: {
        // OFF bittet um einen erkennbaren User-Agent.
        "user-agent":
          "Haushalt-App/1.0 (https://github.com/j4nric/haushalt-app)",
      },
    },
  ).catch(() => null);
  if (!antwort || (antwort.status !== 200 && antwort.status !== 404)) {
    return null;
  }
  const daten = (await antwort.json().catch(() => null)) as {
    status?: number;
    product?: Record<string, unknown>;
  } | null;
  const p = daten?.status === 1 ? daten.product : undefined;
  const text = (wert: unknown) =>
    typeof wert === "string" && wert.trim() ? wert.trim().slice(0, 200) : null;
  const name =
    text(p?.product_name_de) ??
    text(p?.product_name) ??
    text(p?.generic_name_de);
  return {
    barcode,
    gefunden: Boolean(name),
    name,
    // Mehrere Marken kommen kommagetrennt – die erste reicht.
    marke: text(p?.brands)?.split(",")[0]?.trim() ?? null,
    menge: text(p?.quantity),
  };
}
