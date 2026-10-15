import { kategorieName } from "@haushalt/db/kategorien";
import { ChevronDown, NotepadText } from "lucide-react";
import type { ReactNode } from "react";
import {
  KategorieSymbol,
  useKategorieFarbe,
} from "@/components/KategorieSymbol";
import { Button } from "@/components/ui/button";
import { useEinstellungen } from "@/einstellungen";
import { cn } from "@/lib/utils";
import { knalligeFlaeche, RASTER, SymbolKnopf } from "../Verlauf";

/**
 * Überschrift (in Kategoriefarbe) und ein Raster aus Kacheln. Das Symbol der Kategorie
 * steht einmal links mittig daneben und öffnet den Verlauf.
 */
export function KategorieRaster({
  titel,
  kategorie,
  verlaufOeffnen,
  children,
}: {
  titel: string;
  kategorie: string | null;
  verlaufOeffnen: () => void;
  children: ReactNode;
}) {
  const farbe = useKategorieFarbe(kategorie);
  const { spalten, ueberschriften } = useEinstellungen();
  return (
    <section className={ueberschriften ? "mt-5 first:mt-2" : "mt-3 first:mt-2"}>
      <h3
        className={
          ueberschriften
            ? "pb-1.5 pl-[3.25rem] text-xs font-semibold tracking-wide uppercase"
            : "sr-only"
        }
        style={{ color: farbe }}
      >
        {titel}
      </h3>
      <div className="flex items-center gap-3">
        <div className="-ml-1.5 flex w-11 shrink-0 justify-center">
          <SymbolKnopf
            titel={titel}
            kategorie={kategorie}
            offen={false}
            umschalten={verlaufOeffnen}
          />
        </div>
        {/* auto-rows-fr: Alle Zeilen eines Rasters so hoch wie die höchste Kachel. */}
        <ul
          data-spalten={spalten}
          className={cn("grid flex-1 auto-rows-fr gap-2", RASTER[spalten])}
        >
          {children}
        </ul>
      </div>
    </section>
  );
}

/**
 * Kategorien mit Verlauf, aber ohne offene Einträge – als Akkordeon (anfangs zu),
 * abgesetzt wie der Wagen, nur neutral getönt.
 */
export function AusDemVerlauf({
  offen,
  umschalten,
  children,
}: {
  offen: boolean;
  umschalten: () => void;
  children: ReactNode;
}) {
  return (
    <section
      aria-label="Aus dem Verlauf"
      className="-mx-4 mt-8 px-4"
      style={{
        background:
          "color-mix(in oklab, var(--background), var(--foreground) 4%)",
        borderTop:
          "1px solid color-mix(in oklab, var(--background), var(--foreground) 12%)",
      }}
    >
      <h3>
        <button
          type="button"
          aria-expanded={offen}
          onClick={umschalten}
          className="flex w-full items-center justify-center gap-2 py-4 text-sm font-semibold tracking-wide text-muted-foreground uppercase"
        >
          <NotepadText className="size-4" /> Aus dem Verlauf
          <ChevronDown
            className={cn("size-4 transition-transform", offen && "rotate-180")}
          />
        </button>
      </h3>
      {offen && (
        <ul className="flex flex-wrap justify-center gap-2 pb-5 animate-in fade-in">
          {children}
        </ul>
      )}
    </section>
  );
}

/** Knopf „Aus dem Verlauf“ für eine Kategorie ohne offene Einträge. */
export function VerlaufKnopf({
  kategorie,
  offen,
  umschalten,
}: {
  kategorie: string | null;
  offen: boolean;
  umschalten: () => void;
}) {
  const farbe = useKategorieFarbe(kategorie);
  const name = kategorieName(kategorie);
  return (
    <Button
      variant="outline"
      size="sm"
      aria-label={`Verlauf ${name}`}
      aria-expanded={offen}
      data-verlauf-ausloeser
      onClick={umschalten}
      className="rounded-full"
      style={
        offen
          ? { ...knalligeFlaeche(farbe), borderColor: farbe }
          : { borderColor: farbe, color: farbe }
      }
    >
      <KategorieSymbol
        kategorie={kategorie}
        className={cn("size-4", offen && "text-current!")}
      />
      {name}
    </Button>
  );
}
