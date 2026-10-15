import {
  CalendarDays,
  ChefHat,
  House,
  Package,
  ShoppingCart,
} from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export type Ansicht = "liste" | "vorrat" | "plan" | "rezepte" | "haushalt";

const ANSICHTEN: { id: Ansicht; name: string; symbol: typeof ShoppingCart }[] =
  [
    { id: "liste", name: "Einkaufsliste", symbol: ShoppingCart },
    { id: "vorrat", name: "Vorrat", symbol: Package },
    { id: "plan", name: "Plan", symbol: CalendarDays },
    { id: "rezepte", name: "Rezepte", symbol: ChefHat },
    { id: "haushalt", name: "Haushalt", symbol: House },
  ];

const REIHENFOLGE: Ansicht[] = ANSICHTEN.map((a) => a.id);

function lesen(): Ansicht {
  // Unterseiten hängen mit „/“ an: #rezepte/<id>/kochen
  const bereich = location.hash.slice(1).split("/")[0];
  return bereich === "vorrat" ||
    bereich === "plan" ||
    bereich === "rezepte" ||
    bereich === "haushalt"
    ? bereich
    : "liste";
}

const lesenPfad = () => location.hash.slice(1).split("/").slice(1);

/**
 * Unterseite eines Bereichs aus der Adresse, z. B. #rezepte/abc/kochen → ["abc", "kochen"].
 * Zurück im Browser bzw. Wischgeste führt so eine Ebene hoch.
 */
export function useUnterseite(): [string[], (pfad: string[]) => void] {
  const [pfad, setPfad] = useState(lesenPfad);
  useEffect(() => {
    const aktualisieren = () => {
      setPfad(lesenPfad());
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", aktualisieren);
    return () => window.removeEventListener("hashchange", aktualisieren);
  }, []);
  return [
    pfad,
    (neu) => {
      const bereich = location.hash.slice(1).split("/")[0];
      const richtung =
        neu.at(-1) === "kochen"
          ? "hoch"
          : neu.length >= lesenPfad().length
            ? "vor"
            : "zurueck";
      mitUebergang(richtung, () => {
        location.hash = [bereich, ...neu].join("/");
      });
    },
  ];
}

/** Aktuelle Ansicht, gespiegelt in der Adresse (#vorrat), damit Zurück und Neuladen funktionieren. */
export function useAnsicht(): [Ansicht, (a: Ansicht) => void] {
  const [ansicht, setAnsicht] = useState<Ansicht>(lesen);

  useEffect(() => {
    const aktualisieren = () => setAnsicht(lesen());
    window.addEventListener("hashchange", aktualisieren);
    return () => window.removeEventListener("hashchange", aktualisieren);
  }, []);

  return [
    ansicht,
    (a) => {
      location.hash = a === "liste" ? "" : a;
    },
  ];
}

/** Leiste unten im Daumenbereich, wie bei Handy-Apps üblich. */
export function Navigation({
  ansicht,
  wechseln,
}: {
  ansicht: Ansicht;
  wechseln: (a: Ansicht) => void;
}) {
  return (
    <nav
      aria-label="Bereiche"
      className="fixed inset-x-0 bottom-0 z-30 border-t bg-background pb-[env(safe-area-inset-bottom)]"
    >
      <div className="mx-auto grid h-16 max-w-lg grid-cols-5">
        {ANSICHTEN.map(({ id, name, symbol: Icon }) => (
          <button
            key={id}
            type="button"
            aria-current={ansicht === id ? "page" : undefined}
            onClick={() =>
              mitUebergang(
                REIHENFOLGE.indexOf(id) >= REIHENFOLGE.indexOf(ansicht)
                  ? "vor"
                  : "zurueck",
                () => wechseln(id),
              )
            }
            className={cn(
              "flex flex-col items-center justify-center gap-1 text-xs font-medium text-muted-foreground transition-colors",
              ansicht === id && "text-primary",
            )}
          >
            <Icon
              // Neu gemountet beim Wechsel, damit es jedes Mal hüpft.
              key={ansicht === id ? "an" : "aus"}
              className={cn("size-6", ansicht === id && "huepfen")}
              strokeWidth={ansicht === id ? 2.4 : 1.8}
            />
            {name}
          </button>
        ))}
      </div>
    </nav>
  );
}

type Richtung = "vor" | "zurueck" | "hoch";

/**
 * Seitenwechsel mit sanftem Gleiten (View Transitions): Der Browser animiert ein
 * Standbild, das Layout bleibt unberührt – fest positionierte Leisten verrutschen
 * nicht. Ohne Unterstützung oder bei „Bewegung reduzieren“ einfach sofort.
 */
export function mitUebergang(richtung: Richtung, aendern: () => void) {
  const doc = document as Document & {
    startViewTransition?: (aktualisieren: () => Promise<void>) => unknown;
  };
  if (
    !doc.startViewTransition ||
    matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    aendern();
    return;
  }
  document.documentElement.dataset.uebergang = richtung;
  doc.startViewTransition(async () => {
    // Die Adresse ändert sich, React zeichnet nach dem hashchange neu – darauf warten.
    const neu = new Promise<void>((fertig) => {
      window.addEventListener(
        "hashchange",
        () =>
          requestAnimationFrame(() => requestAnimationFrame(() => fertig())),
        { once: true },
      );
      setTimeout(fertig, 300);
    });
    aendern();
    await neu;
  });
}
