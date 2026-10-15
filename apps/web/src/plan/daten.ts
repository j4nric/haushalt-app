import { useQuery } from "@powersync/react";

export type PlanEintrag = {
  id: string;
  datum: string;
  rezept_id: string | null;
  /** Aktueller Rezepttitel, sonst der gespeicherte (freier Text oder gelöschtes Rezept). */
  titel: string;
  portionen: number | null;
  erledigt: number;
  bild_url: string | null;
  rezept_portionen: number | null;
  /** 1, solange das Rezept noch existiert. */
  rezept_da: number;
};

const EINTRAG = `SELECT p.id, p.datum, p.rezept_id, COALESCE(r.titel, p.titel) AS titel, p.portionen,
       COALESCE(p.erledigt, 0) AS erledigt, r.bild_url, r.portionen AS rezept_portionen,
       r.id IS NOT NULL AS rezept_da
  FROM plan_eintraege p
  LEFT JOIN rezepte r ON r.id = p.rezept_id`;

/** Einträge von `von` bis `bis` (je einschließlich), nach Tag sortiert. */
export function usePlan(haushaltId: string, von: string, bis: string) {
  return useQuery<PlanEintrag>(
    `${EINTRAG} WHERE p.haushalt_id = ? AND p.datum BETWEEN ? AND ? ORDER BY p.datum, p.erstellt_am`,
    [haushaltId, von, bis],
  ).data;
}

export function usePlanEintrag(id: string) {
  const { data, isLoading } = useQuery<PlanEintrag>(
    `${EINTRAG} WHERE p.id = ?`,
    [id],
  );
  return { eintrag: data[0], isLoading };
}

/** Für so viele wird standardmäßig gekocht (Haushalts-Einstellung). */
export function useStandardPortionen(haushaltId: string): number {
  const { data } = useQuery<{ n: number | null }>(
    "SELECT standard_portionen AS n FROM haushalte WHERE id = ?",
    [haushaltId],
  );
  return data[0]?.n ?? 2;
}

/** Faktor für die Zutatenmengen eines Plan-Eintrags. */
export function planFaktor(e: PlanEintrag, standard: number): number {
  const gewollt = e.portionen ?? standard;
  return e.rezept_portionen ? gewollt / e.rezept_portionen : 1;
}
