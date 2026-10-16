import {
  Apple,
  Beef,
  Candy,
  Croissant,
  CupSoda,
  Droplets,
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
import { produktSymbol } from "@/lib/produktsymbole";
import { cn } from "@/lib/utils";

const SYMBOLE: Record<KategorieSchluessel, LucideIcon> = {
  obst_gemuese: Apple,
  brot_backwaren: Croissant,
  milch_kaese: Milk,
  fleisch_fisch: Beef,
  vorrat: Wheat,
  suesses_snacks: Candy,
  getraenke: CupSoda,
  tiefkuehl: Snowflake,
  drogerie: Droplets,
  haushalt: SprayCan,
  sonstiges: Tag,
};

/**
 * Schlichtes Symbol in der Farbe der Kategorie (dekorativ, für Screenreader stumm).
 * Mit `name` das Symbol des Produkts („Käse“), sonst das der Kategorie.
 */
export function KategorieSymbol({
  kategorie,
  name,
  className,
}: {
  kategorie: string | null;
  name?: string;
  className?: string;
}) {
  const einstellungen = useEinstellungen();
  const Produkt =
    name && einstellungen.produktsymbole ? produktSymbol(name) : null;
  if (Produkt) {
    return (
      <Produkt
        aria-hidden
        className={cn("size-5 shrink-0", className)}
        style={{ color: kategorieFarbe(einstellungen, kategorie) }}
      />
    );
  }
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
