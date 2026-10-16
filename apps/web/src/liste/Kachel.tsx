import { formatiereMenge } from "@haushalt/db/einheiten";
import { useRef } from "react";
import { useKategorieFarbe } from "@/components/KategorieSymbol";
import { useEinstellungen } from "@/einstellungen";
import { useWischen } from "@/hooks/use-wischen";
import { cn } from "@/lib/utils";
import {
  ABHAK_KLASSE,
  KritzelStrich,
  useVerzoegertesAbhaken,
} from "../Abhaken";
import { zumWagenFliegen } from "../WagenFlug";
import type { Zeile } from "./zeile";

/** Eine Kachel: antippen = gekauft / zurück, lang drücken = bearbeiten. */
export function Kachel({
  eintrag,
  umschalten,
  bearbeiten,
}: {
  eintrag: Zeile;
  umschalten: (e: Zeile) => void;
  bearbeiten: (e: Zeile) => void;
}) {
  const erledigt = eintrag.erledigt === 1;
  const farbe = useKategorieFarbe(eintrag.kategorie);
  // Menge nur, wenn sie etwas sagt („500 g“, „3 Stk.“) – ein einzelnes Stück nicht.
  const menge =
    eintrag.menge != null &&
    eintrag.einheit &&
    !(eintrag.einheit === "stueck" && eintrag.menge === 1)
      ? formatiereMenge(eintrag.menge, eintrag.einheit)
      : null;
  const { handler, klick } = useWischen({ lang: () => bearbeiten(eintrag) });
  const { spalten } = useEinstellungen();
  // Bei 3 Spalten etwas kompakter, damit weniger Namen umbrechen.
  const kompakt = spalten === 3;
  // Abhaken mit kurzer Verzögerung (Animation); nochmal antippen bricht ab.
  // Zurücknehmen aus dem Wagen geschieht sofort.
  const knopf = useRef<HTMLButtonElement>(null);
  const abhaken = useVerzoegertesAbhaken(() => {
    // Ab in den Wagen – nur wenn die Kachel noch da ist (sonst kein Startpunkt).
    const r = knopf.current?.getBoundingClientRect();
    if (r) {
      zumWagenFliegen(r, eintrag.name, eintrag.kategorie);
    }
    umschalten(eintrag);
  });

  return (
    <li className="min-w-0">
      {/* biome-ignore lint/a11y/useSemanticElements: Die ganze Kachel ist die Tippfläche und erkennt langes Drücken; ein <input type="checkbox"> kann das nicht. */}
      <button
        ref={knopf}
        type="button"
        role="checkbox"
        aria-checked={erledigt}
        aria-busy={abhaken.laeuft}
        aria-label={eintrag.name}
        {...handler}
        onClick={klick(() =>
          erledigt ? umschalten(eintrag) : abhaken.umschalten(),
        )}
        className={cn(
          "relative flex h-full min-h-14 w-full touch-pan-y flex-col items-center justify-center rounded-xl border py-2 text-center transition-colors select-none active:scale-[0.98]",
          kompakt ? "px-2.5" : "px-3",
          erledigt ? "border-dashed text-foreground/80" : "bg-card shadow-xs",
          abhaken.laeuft && ABHAK_KLASSE,
        )}
        style={
          erledigt
            ? {
                // Im Wagen zurückgenommen, aber gut lesbar: kräftige Strichlinie, zarte Fläche.
                borderColor:
                  "color-mix(in oklab, var(--foreground) 40%, transparent)",
                background: "color-mix(in oklab, var(--card) 70%, transparent)",
              }
            : {
                borderColor: `color-mix(in oklab, ${farbe} 35%, var(--border))`,
                background: `color-mix(in oklab, var(--card), ${farbe} 7%)`,
              }
        }
      >
        {abhaken.laeuft && (
          <span className="contents" style={{ color: farbe }}>
            <KritzelStrich />
          </span>
        )}
        <span
          className={cn(
            "leading-tight font-medium break-words hyphens-auto",
            kompakt ? "text-sm" : "text-base",
            erledigt && "line-through",
          )}
        >
          {eintrag.name}
        </span>
        {menge && (
          <span className="text-xs text-muted-foreground">{menge}</span>
        )}
        {erledigt && eintrag.erledigt_von_name && (
          <span className="text-xs">von {eintrag.erledigt_von_name}</span>
        )}
      </button>
    </li>
  );
}
