import { formatiereMenge } from "@haushalt/db/einheiten";
import { findeImVorrat } from "@haushalt/db/namen";
import { istGrundzutat } from "@haushalt/db/zutaten";
import { usePowerSync, useQuery } from "@powersync/react";
import { ShoppingCart } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { type ArtikelStand, imVorrat } from "@/lib/kochbar";
import type { Posten } from "@/lib/plan";
import { cn } from "@/lib/utils";
import { ARTIKEL_STAND } from "@/rezepte/daten";
import { zutatenAufListe } from "./aktionen";

type Vorschlag = Posten & {
  /** Warum nicht vorausgewählt; `null` = kommt auf die Liste. */
  grund: string | null;
  sperre: boolean;
};

/**
 * „Auf die Liste“ für ein Rezept oder die ganze Woche: alle Zutaten zum Abhaken.
 * Nicht vorausgewählt ist, was schon auf der Liste steht, im Vorrat reicht, ein
 * Gewürz ist oder man immer hat (Salz, Öl …).
 */
export function AufDieListe({
  offen,
  schliessen,
  haushaltId,
  nutzerId,
  posten,
  beschreibung,
}: {
  offen: boolean;
  schliessen: () => void;
  haushaltId: string;
  nutzerId: string;
  posten: Posten[];
  beschreibung: string;
}) {
  const db = usePowerSync();
  const { data: artikel } = useQuery<ArtikelStand>(ARTIKEL_STAND, [haushaltId]);
  const nachName = new Map(artikel.map((a) => [a.name, a]));

  // Optionale ans Ende der Auswahl.
  const sortiert = [...posten].sort(
    (a, b) => Number(a.optional) - Number(b.optional),
  );
  const vorschlaege: Vorschlag[] = sortiert.map((p) => {
    const a = findeImVorrat(nachName, p.name);
    let grund: string | null = a?.auf_liste
      ? "steht schon drauf"
      : imVorrat(p.zutat, a);
    if (!grund && p.optional) {
      grund = "optional";
    } else if (!grund && p.gewuerz) {
      grund = "Gewürz";
    } else if (!grund && istGrundzutat(p.name)) {
      grund = "haben wir immer";
    }
    return { ...p, grund, sperre: Boolean(a?.auf_liste) };
  });

  // Auswahl je Öffnen neu vorbelegen.
  const [abgewaehlt, setAbgewaehlt] = useState<Set<string> | null>(null);
  const aus =
    abgewaehlt ?? new Set(vorschlaege.filter((v) => v.grund).map((v) => v.id));
  const gewaehlt = vorschlaege.filter((v) => !v.sperre && !aus.has(v.id));

  function umschalten(id: string) {
    const neu = new Set(aus);
    if (neu.has(id)) {
      neu.delete(id);
    } else {
      neu.add(id);
    }
    setAbgewaehlt(neu);
  }

  async function uebernehmen() {
    const anzahl = await zutatenAufListe(db, {
      haushaltId,
      nutzerId,
      // Nur der Name kommt auf die Liste – die Mengen hier sind zur Orientierung.
      zutaten: gewaehlt.map((v) => ({
        name: v.name,
        menge: null,
        einheit: null,
        ...(v.konserve ? { erkennenAls: `Dose ${v.name}` } : {}),
      })),
    });
    schliessen();
    setAbgewaehlt(null);
    toast.success(
      anzahl === 1
        ? "1 Zutat auf der Liste"
        : `${anzahl} Zutaten auf der Liste`,
      {
        action: {
          label: "Zur Liste",
          onClick: () => {
            location.hash = "";
          },
        },
      },
    );
  }

  return (
    <Drawer
      open={offen}
      onOpenChange={(o) => {
        if (!o) {
          schliessen();
          setAbgewaehlt(null);
        }
      }}
    >
      <DrawerContent>
        <div className="mx-auto w-full max-w-lg">
          <DrawerHeader>
            <DrawerTitle>Auf die Einkaufsliste</DrawerTitle>
            <DrawerDescription>
              {beschreibung} Abgewählt: Gewürze, Optionales und was im Vorrat
              reicht oder immer da ist.
            </DrawerDescription>
          </DrawerHeader>
          {vorschlaege.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">
              Keine Zutaten – plane zuerst Rezepte ein.
            </p>
          ) : (
            <ul className="max-h-[50dvh] space-y-1 overflow-y-auto px-4">
              {vorschlaege.map((v) => {
                const an = !v.sperre && !aus.has(v.id);
                return (
                  <li key={v.id}>
                    <label
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-2 py-2",
                        v.sperre ? "opacity-60" : "active:bg-muted",
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={an}
                        disabled={v.sperre}
                        onChange={() => umschalten(v.id)}
                        className="size-5 accent-[var(--primary)]"
                      />
                      <span className="min-w-0 flex-1">
                        {v.name}
                        {v.zutat.menge != null && v.listenEinheit && (
                          <span className="text-muted-foreground">
                            {" "}
                            · {formatiereMenge(v.zutat.menge, v.listenEinheit)}
                          </span>
                        )}
                        {v.fuer && (
                          <span className="block text-xs text-muted-foreground">
                            für {v.fuer}
                          </span>
                        )}
                      </span>
                      {v.grund && (
                        <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                          {v.grund}
                        </span>
                      )}
                    </label>
                  </li>
                );
              })}
            </ul>
          )}
          <DrawerFooter>
            <Button
              className="h-12 rounded-full text-base"
              disabled={gewaehlt.length === 0}
              onClick={uebernehmen}
            >
              <ShoppingCart />
              {gewaehlt.length === 1
                ? "1 Zutat auf die Liste"
                : `${gewaehlt.length} Zutaten auf die Liste`}
            </Button>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
