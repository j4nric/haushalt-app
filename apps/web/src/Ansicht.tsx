import { House, Package, ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export type Ansicht = "liste" | "vorrat" | "haushalt";

const ANSICHTEN: { id: Ansicht; name: string; symbol: typeof ShoppingCart }[] =
  [
    { id: "liste", name: "Einkaufsliste", symbol: ShoppingCart },
    { id: "vorrat", name: "Vorrat", symbol: Package },
    { id: "haushalt", name: "Haushalt", symbol: House },
  ];

function lesen(): Ansicht {
  const hash = location.hash.slice(1);
  return hash === "vorrat" || hash === "haushalt" ? hash : "liste";
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
      <div className="mx-auto grid h-16 max-w-lg grid-cols-3">
        {ANSICHTEN.map(({ id, name, symbol: Icon }) => (
          <button
            key={id}
            type="button"
            aria-current={ansicht === id ? "page" : undefined}
            onClick={() => wechseln(id)}
            className={cn(
              "flex flex-col items-center justify-center gap-1 text-xs font-medium text-muted-foreground transition-colors",
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
