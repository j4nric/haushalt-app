import {
  Apple,
  Candy,
  Croissant,
  CupSoda,
  Droplets,
  Fish,
  type LucideIcon,
  Milk,
  Snowflake,
  SprayCan,
  Tag,
  Wheat,
} from "lucide-react";
import {
  type KategorieSchluessel,
  kategorieFarbe,
  useEinstellungen,
} from "@/einstellungen";
import { cn } from "@/lib/utils";

const SYMBOLE: Record<KategorieSchluessel, LucideIcon> = {
  obst_gemuese: Apple,
  brot_backwaren: Croissant,
  milch_kaese: Milk,
  fleisch_fisch: Fish,
  vorrat: Wheat,
  suesses_snacks: Candy,
  getraenke: CupSoda,
  tiefkuehl: Snowflake,
  drogerie: Droplets,
  haushalt: SprayCan,
  sonstiges: Tag,
};

/** Schlichtes Symbol der Kategorie in ihrer Farbe (dekorativ, für Screenreader stumm). */
export function KategorieSymbol({
  kategorie,
  className,
}: {
  kategorie: string | null;
  className?: string;
}) {
  const einstellungen = useEinstellungen();
  const Icon =
    SYMBOLE[
      (kategorie && kategorie in SYMBOLE
        ? kategorie
        : "sonstiges") as KategorieSchluessel
    ];
  return (
    <Icon
      aria-hidden
      className={cn("size-5 shrink-0", className)}
      style={{ color: kategorieFarbe(einstellungen, kategorie) }}
      strokeWidth={2}
    />
  );
}

/** Textfarbe der Kategorie, z. B. für Überschriften. */
export function useKategorieFarbe(kategorie: string | null | undefined) {
  return kategorieFarbe(useEinstellungen(), kategorie);
}
