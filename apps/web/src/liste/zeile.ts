import type { Einheit } from "@haushalt/db/einheiten";

/** Ein Listeneintrag, wie ihn die Einkaufsliste anzeigt. */
export type Zeile = {
  id: string;
  artikel_id: string;
  name: string;
  kategorie: string | null;
  erledigt: number;
  erledigt_von_name: string | null;
  menge: number | null;
  einheit: Einheit | null;
};
