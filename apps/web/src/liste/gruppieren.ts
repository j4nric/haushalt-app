import { kategorieName, kategorieRang } from "@haushalt/db/kategorien";
import { findeNachName } from "@haushalt/db/namen";
import type { VerlaufArtikel } from "../Verlauf";
import type { Zeile } from "./zeile";

/** Bekannter Artikel zum eingetippten Namen – auch in anderer Form („Zwiebeln“). */
export function finde(artikel: VerlaufArtikel[], name: string) {
  if (!name.trim()) {
    return undefined;
  }
  return findeNachName(
    new Map(artikel.map((a) => [a.name.toLowerCase(), a])),
    name,
  );
}

/** Gruppiert offene Einträge nach Kategorie, in Supermarkt-Reihenfolge. */
export function nachKategorie(
  zeilen: Zeile[],
): [string, string | null, Zeile[]][] {
  const sortiert = [...zeilen].sort(
    (a, b) => kategorieRang(a.kategorie) - kategorieRang(b.kategorie),
  );
  const gruppen = new Map<string, [string, string | null, Zeile[]]>();
  for (const zeile of sortiert) {
    const name = kategorieName(zeile.kategorie);
    const gruppe = gruppen.get(name) ?? [name, zeile.kategorie, []];
    gruppe[2].push(zeile);
    gruppen.set(name, gruppe);
  }
  return [...gruppen.values()];
}
