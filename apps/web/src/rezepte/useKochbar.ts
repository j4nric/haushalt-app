import { useQuery } from "@powersync/react";
import { useMemo } from "react";
import {
  type ArtikelStand,
  type RezeptZutat,
  type Verfuegbarkeit,
  verfuegbarkeit,
} from "@/lib/kochbar";
import { ARTIKEL_STAND } from "./Rezepte";

export type ZutatMitRezept = RezeptZutat & { rezept_id: string };

/** Alle Rezept-Zutaten des Haushalts, nach Rezept gruppiert. */
export function useZutatenNachRezept(haushaltId: string) {
  const { data } = useQuery<ZutatMitRezept>(
    "SELECT rezept_id, name, menge, einheit, zusatz, gewuerz, optional FROM rezept_zutaten WHERE haushalt_id = ? ORDER BY position",
    [haushaltId],
  );
  return useMemo(() => {
    const nach = new Map<string, ZutatMitRezept[]>();
    for (const z of data) {
      nach.set(z.rezept_id, [...(nach.get(z.rezept_id) ?? []), z]);
    }
    return nach;
  }, [data]);
}

/** „Was kann ich jetzt kochen?“ für jedes Rezept des Haushalts. */
export function useKochbar(haushaltId: string): Map<string, Verfuegbarkeit> {
  const zutaten = useZutatenNachRezept(haushaltId);
  const { data: artikel } = useQuery<ArtikelStand>(ARTIKEL_STAND, [haushaltId]);
  return useMemo(() => {
    const nachName = new Map(artikel.map((a) => [a.name, a]));
    return new Map(
      [...zutaten].map(([id, z]) => [id, verfuegbarkeit(z, nachName)]),
    );
  }, [zutaten, artikel]);
}
