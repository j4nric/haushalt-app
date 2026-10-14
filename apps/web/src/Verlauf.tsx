import { Check, Plus, X } from "lucide-react";
import type { CSSProperties } from "react";
import {
  KategorieSymbol,
  useKategorieFarbe,
} from "@/components/KategorieSymbol";
import { useWischen } from "@/hooks/use-wischen";
import { istHexFarbe, kontrast, TEXT_HELL, textFarbeAuf } from "@/lib/farben";
import { cn } from "@/lib/utils";

export type VerlaufArtikel = {
  id: string;
  name: string;
  kategorie: string | null;
  /** Steht gerade offen auf der Einkaufsliste. */
  auf_liste: number;
};

/**
 * Kategorie-Symbol links neben dem Raster, als Knopf: klappt den Verlauf auf und zu.
 * Ein kleines Plus zeigt, dass es antippbar ist; geöffnet steht es auf einem Kreis
 * in der Kategoriefarbe.
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
      style={offen ? knalligeFlaeche(farbe) : undefined}
    >
      <KategorieSymbol
        kategorie={kategorie}
        className={cn("size-7", offen && "size-6 text-current!")}
      />
      <span
        aria-hidden
        className="absolute -right-0.5 -bottom-0.5 flex size-4 items-center justify-center rounded-full ring-2 ring-background"
        style={knalligeFlaeche(farbe)}
      >
        {offen ? (
          <X className="size-3" strokeWidth={3} />
        ) : (
          <Plus className="size-3" strokeWidth={3} />
        )}
      </span>
    </button>
  );
}

/**
 * Aufgeklappter Verlauf einer Kategorie in kräftiger Kategoriefarbe: alle bisherigen
 * Produkte. Schon auf der Liste → ausgegraut; sonst mit Plus, ein Tipp trägt ein.
 * Lang drücken nimmt ein Produkt aus dem Verlauf.
 */
export function VerlaufFlaeche({
  titel,
  kategorie,
  artikel,
  hinzufuegen,
  ausblenden,
}: {
  titel: string;
  kategorie: string | null;
  artikel: VerlaufArtikel[];
  hinzufuegen: (a: VerlaufArtikel) => void;
  ausblenden: (a: VerlaufArtikel) => void;
}) {
  const farbe = useKategorieFarbe(kategorie);
  return (
    <section
      aria-label={`Verlauf ${titel}`}
      className="mt-2 rounded-2xl p-3 shadow-sm animate-in fade-in slide-in-from-top-1"
      style={knalligeFlaeche(farbe)}
    >
      {artikel.length === 0 ? (
        <p className="py-2 text-center text-sm opacity-90">
          Noch keine Produkte in dieser Kategorie.
        </p>
      ) : (
        <>
          <ul className="flex flex-wrap gap-2">
            {sortiert(artikel).map((a) => (
              <VerlaufEintrag
                key={a.id}
                artikel={a}
                hinzufuegen={hinzufuegen}
                ausblenden={ausblenden}
              />
            ))}
          </ul>
          <p className="pt-2 text-xs opacity-80">
            Antippen = auf die Liste · lang drücken = aus dem Verlauf nehmen
          </p>
        </>
      )}
    </section>
  );
}

function VerlaufEintrag({
  artikel,
  hinzufuegen,
  ausblenden,
}: {
  artikel: VerlaufArtikel;
  hinzufuegen: (a: VerlaufArtikel) => void;
  ausblenden: (a: VerlaufArtikel) => void;
}) {
  const aufListe = artikel.auf_liste === 1;
  const { handler, klick } = useWischen({ lang: () => ausblenden(artikel) });
  return (
    <li>
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
          "flex touch-pan-y items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium select-none",
          aufListe ? "opacity-50" : "active:scale-95",
        )}
        style={{
          background: "color-mix(in oklab, currentColor 18%, transparent)",
        }}
      >
        {aufListe ? <Check className="size-4" /> : <Plus className="size-4" />}
        {artikel.name}
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

/** Wählbare zuerst, schon auf der Liste danach; jeweils nach deutschem Alphabet. */
function sortiert(artikel: VerlaufArtikel[]) {
  return [...artikel].sort(
    (a, b) => a.auf_liste - b.auf_liste || a.name.localeCompare(b.name, "de"),
  );
}
