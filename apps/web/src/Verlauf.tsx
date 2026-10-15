import { Check, Plus, X } from "lucide-react";
import type { CSSProperties, Ref } from "react";
import {
  KategorieSymbol,
  useKategorieFarbe,
} from "@/components/KategorieSymbol";
import { type Spalten, useEinstellungen } from "@/einstellungen";
import { useWischen } from "@/hooks/use-wischen";
import { istHexFarbe, kontrast, TEXT_HELL, textFarbeAuf } from "@/lib/farben";
import { vermisstSatz } from "@/lib/persoenlichkeit";
import { cn } from "@/lib/utils";
import { zeitWert } from "@/lib/zeit";

export type VerlaufArtikel = {
  id: string;
  name: string;
  kategorie: string | null;
  /** Steht gerade offen auf der Einkaufsliste. */
  auf_liste: number;
  /** Letzter Kauf, sonst Zeitpunkt des Anlegens (ISO). */
  zuletzt: string | null;
};

// Vollständige Klassennamen, damit Tailwind sie beim Bauen findet.
export const RASTER: Record<Spalten, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
};

/**
 * Kategorie-Symbol links neben dem Raster, als runder Knopf: klappt den Verlauf auf
 * und zu. Geschlossen liegt es auf einem zarten Kreis in der Kategoriefarbe, geöffnet
 * auf einem hellen Kreis im eingefärbten Block, mit einem kleinen X zum Schließen.
 */
export function SymbolKnopf({
  titel,
  kategorie,
  offen,
  umschalten,
}: {
  titel: string;
  kategorie: string | null;
  offen: boolean;
  umschalten: () => void;
}) {
  const farbe = useKategorieFarbe(kategorie);
  return (
    <button
      type="button"
      aria-label={`Verlauf ${titel}`}
      aria-expanded={offen}
      onClick={umschalten}
      className="relative flex size-11 items-center justify-center rounded-full transition-colors active:scale-95"
      style={{
        background: offen
          ? "color-mix(in oklab, currentColor 20%, transparent)"
          : `color-mix(in oklab, ${farbe} 14%, transparent)`,
      }}
    >
      <KategorieSymbol
        kategorie={kategorie}
        className={cn("size-6", offen && "text-current!")}
      />
      {offen && (
        <span
          aria-hidden
          className="absolute -right-0.5 -bottom-0.5 flex size-4 items-center justify-center rounded-full"
          style={{ background: "currentColor" }}
        >
          <X className="size-3" strokeWidth={3} style={{ color: farbe }} />
        </span>
      )}
    </button>
  );
}

/**
 * Aufgeklappter Verlauf: Die ganze Kategorie – Überschrift, Symbol und Kacheln – liegt
 * in einem Block in kräftiger Kategoriefarbe, von Rand zu Rand. Was schon auf der Liste
 * steht, trägt einen Haken; Vorschläge ein Plus und landen per Tipp auf der Liste.
 * Lang drücken auf einen Vorschlag nimmt ihn aus dem Verlauf.
 */
export function VerlaufBlock({
  titel,
  kategorie,
  artikel,
  schliessen,
  hinzufuegen,
  ausblenden,
  blockRef,
}: {
  titel: string;
  kategorie: string | null;
  artikel: VerlaufArtikel[];
  schliessen: () => void;
  hinzufuegen: (a: VerlaufArtikel) => void;
  ausblenden: (a: VerlaufArtikel) => void;
  blockRef?: Ref<HTMLElement>;
}) {
  const farbe = useKategorieFarbe(kategorie);
  const { spalten, ueberschriften } = useEinstellungen();
  return (
    <section
      ref={blockRef}
      aria-label={`Verlauf ${titel}`}
      // Innenpolster (pt-3) und Außenabstand ergeben zusammen genau den Abstand des
      // geschlossenen Rasters – Überschrift und Symbol springen beim Öffnen nicht.
      className={cn(
        "-mx-4 px-4 pt-3 pb-4 shadow-md animate-in fade-in first:-mt-1",
        ueberschriften ? "mt-2" : "mt-0",
      )}
      style={knalligeFlaeche(farbe)}
    >
      <h3
        className={
          ueberschriften
            ? "pb-1.5 pl-[3.25rem] text-xs font-semibold tracking-wide uppercase"
            : "sr-only"
        }
      >
        {titel}
      </h3>
      <div className="flex items-center gap-3">
        <div className="-ml-1.5 flex w-11 shrink-0 justify-center">
          <SymbolKnopf
            titel={titel}
            kategorie={kategorie}
            offen
            umschalten={schliessen}
          />
        </div>
        {artikel.length === 0 ? (
          <p className="flex-1 py-3 text-sm opacity-90">
            Noch keine Produkte in dieser Kategorie.
          </p>
        ) : (
          <ul className={cn("grid flex-1 auto-rows-fr gap-2", RASTER[spalten])}>
            {sortiert(artikel).map((a) => (
              <VerlaufKachel
                key={a.id}
                artikel={a}
                hinzufuegen={hinzufuegen}
                ausblenden={ausblenden}
              />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function VerlaufKachel({
  artikel,
  hinzufuegen,
  ausblenden,
}: {
  artikel: VerlaufArtikel;
  hinzufuegen: (a: VerlaufArtikel) => void;
  ausblenden: (a: VerlaufArtikel) => void;
}) {
  const aufListe = artikel.auf_liste === 1;
  // Lange nicht gekaufte Vorschläge melden sich selbst („vermisst dich 💔“).
  const vermisst =
    !aufListe && artikel.zuletzt
      ? vermisstSatz(
          artikel.name,
          Math.floor((Date.now() - zeitWert(artikel.zuletzt)) / 86_400_000),
        )
      : null;
  const { spalten } = useEinstellungen();
  const { handler, klick } = useWischen(
    aufListe ? {} : { lang: () => ausblenden(artikel) },
  );
  return (
    <li className="min-w-0">
      <button
        type="button"
        aria-label={
          aufListe
            ? `${artikel.name} steht schon auf der Liste`
            : `${artikel.name} hinzufügen`
        }
        aria-disabled={aufListe}
        {...handler}
        onClick={klick(() => !aufListe && hinzufuegen(artikel))}
        className={cn(
          "flex h-full min-h-14 w-full touch-pan-y items-center justify-center gap-1.5 rounded-xl border py-2 text-center font-medium select-none",
          spalten === 3 ? "px-2 text-sm" : "px-3 text-base",
          aufListe ? "border-solid" : "border-dashed active:scale-[0.98]",
        )}
        style={{
          background: aufListe
            ? "color-mix(in oklab, currentColor 28%, transparent)"
            : "color-mix(in oklab, currentColor 12%, transparent)",
          borderColor: "color-mix(in oklab, currentColor 45%, transparent)",
        }}
      >
        {aufListe ? (
          <Check className="size-4 shrink-0" strokeWidth={3} />
        ) : (
          <Plus className="size-4 shrink-0" strokeWidth={3} />
        )}
        <span className="flex min-w-0 flex-col">
          <span className="leading-tight break-words hyphens-auto">
            {artikel.name}
          </span>
          {vermisst && (
            <span className="text-xs leading-tight font-normal italic opacity-90">
              {vermisst}
            </span>
          )}
        </span>
      </button>
    </li>
  );
}

/**
 * Hintergrund in der Kategoriefarbe. Weiße Schrift, solange sie gut lesbar bleibt
 * (WCAG 3:1 für fette, größere Schrift) – das wirkt kräftiger als dunkle.
 */
export function knalligeFlaeche(farbe: string): CSSProperties {
  if (!istHexFarbe(farbe)) {
    // „Schlicht“ nutzt die Akzentfarbe als CSS-Variable statt Hex.
    return { background: farbe, color: "var(--primary-foreground)" };
  }
  return {
    background: farbe,
    color: kontrast(farbe, TEXT_HELL) >= 3 ? TEXT_HELL : textFarbeAuf(farbe),
  };
}

/** Was schon auf der Liste steht, zuerst; danach die Vorschläge; jeweils deutsches Alphabet. */
function sortiert(artikel: VerlaufArtikel[]) {
  return [...artikel].sort(
    (a, b) => b.auf_liste - a.auf_liste || a.name.localeCompare(b.name, "de"),
  );
}
