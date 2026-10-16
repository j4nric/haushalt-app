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

const lesenBereich = () => location.hash.slice(1).split("/")[0] ?? "";
const lesenPfad = () => location.hash.slice(1).split("/").slice(1);

/**
 * Unterseite eines Bereichs aus der Adresse, z. B. #rezepte/abc/kochen → ["abc", "kochen"].
 * Zurück im Browser bzw. Wischgeste führt so eine Ebene hoch.
 * Bereiche bleiben im Hintergrund aufgebaut: Jeder liest nur Adressen seines eigenen
 * Bereichs – solange ein anderer offen ist, bleibt die Unterseite, wie sie war.
 */
export function useUnterseite(
  bereich: Ansicht,
): [string[], (pfad: string[]) => void] {
  // Nur die eigene Unterseite – der Bereich kann auch im Hintergrund vorgebaut werden.
  const [pfad, setPfad] = useState(() =>
    lesenBereich() === bereich ? lesenPfad() : [],
  );
  useEffect(() => {
    const aktualisieren = () => {
      if (lesenBereich() !== bereich) {
        return;
      }
      setPfad(lesenPfad());
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", aktualisieren);
    // Wieder eingeblendet (React Activity): verpasste Adressänderungen nachholen.
    if (lesenBereich() === bereich) {
      setPfad((alt) => {
        const neu = lesenPfad();
        return alt.join("/") === neu.join("/") ? alt : neu;
      });
    }
    return () => window.removeEventListener("hashchange", aktualisieren);
  }, [bereich]);
  return [
    pfad,
    (neu) => {
      location.hash = [bereich, ...neu].join("/");
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
      className="fixed inset-x-0 bottom-0 z-30 border-t bg-background pb-[env(safe-area-inset-bottom)] in-data-[tastatur=offen]:hidden"
    >
      <div className="mx-auto grid h-16 max-w-lg grid-cols-5">
        {ANSICHTEN.map(({ id, name, symbol: Icon }) => (
          <button
            key={id}
            type="button"
            aria-current={ansicht === id ? "page" : undefined}
            onClick={() => wechseln(id)}
            className={cn(
              "flex flex-col items-center justify-center gap-1 text-xs font-medium text-muted-foreground",
              ansicht === id && "text-primary",
            )}
          >
            <Icon className="size-6" strokeWidth={ansicht === id ? 2.4 : 1.8} />
            {name}
          </button>
        ))}
      </div>
    </nav>
  );
}
