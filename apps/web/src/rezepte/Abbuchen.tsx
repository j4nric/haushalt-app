import { findeImVorrat } from "@haushalt/db/namen";
import { bestandKurz, verbrauchNachRezept } from "@haushalt/db/vorrat";
import { mengeFuerListe } from "@haushalt/db/zutaten";
import { useQuery } from "@powersync/react";
import { ChefHat, Minus, Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { type ArtikelStand, vorratVon } from "@/lib/kochbar";
import { cn } from "@/lib/utils";
import { ARTIKEL_STAND } from "@/rezepte/daten";
import type { GespeicherteZutat } from "./aktionen";

/** Ganze verbrauchte Packungen und ob danach eine offen ist. */
export type Abbuchung = {
  artikelId: string;
  menge: number;
  angebrochen: boolean;
};

type Wahl = { ganze: number; angebrochen: boolean };

type Zeile = {
  artikel: ArtikelStand;
  name: string;
  /** Aus dem Rezept errechnet; `null` = ließ sich nicht umrechnen. */
  vorschlag: Wahl | null;
  /** Optional im Rezept – vielleicht gar nicht verwendet, daher abgewählt. */
  optional: boolean;
};

/** Welche Zutaten im Vorrat geführt werden – mit vorgeschlagenem Verbrauch. */
export function useAbbuchbar(
  haushaltId: string,
  zutaten: GespeicherteZutat[],
  faktor: number,
): Zeile[] {
  const { data: artikel } = useQuery<ArtikelStand>(ARTIKEL_STAND, [haushaltId]);
  const nachName = new Map(artikel.map((a) => [a.name, a]));
  return zutaten.flatMap((z) => {
    const a = findeImVorrat(nachName, z.name);
    if (!a?.im_vorrat || a.bestand <= 0) {
      return [];
    }
    return [
      {
        artikel: a,
        name: z.name,
        vorschlag: verbrauchNachRezept(mengeFuerListe(z, faktor), vorratVon(a)),
        optional: Boolean(z.optional),
      },
    ];
  });
}

/**
 * Nach dem Kochen: Was davon wurde aus dem Vorrat verbraucht? Gezählt in ganzen
 * Packungen bzw. Stück; ein Rest macht eine Packung „offen“. Vorbelegt aus dem
 * Rezept (nach Portionen), änderbar; Unklares und Optionales ist abgewählt.
 */
export function Abbuchen({
  offen,
  zeilen,
  schliessen,
  bestaetigen,
}: {
  offen: boolean;
  zeilen: Zeile[];
  schliessen: () => void;
  bestaetigen: (abbuchen: Abbuchung[]) => void;
}) {
  const [wahl, setWahl] = useState<Record<string, Wahl> | null>(null);
  const [aus, setAus] = useState<Set<string> | null>(null);
  const werte =
    wahl ??
    Object.fromEntries(
      zeilen.map((z) => [
        z.artikel.id,
        z.vorschlag ?? { ganze: 0, angebrochen: true },
      ]),
    );
  const abgewaehlt =
    aus ??
    new Set(
      zeilen
        .filter((z) => z.vorschlag == null || z.optional)
        .map((z) => z.artikel.id),
    );

  function aendern(id: string, neu: Partial<Wahl>) {
    const bisher = werte[id] ?? { ganze: 0, angebrochen: false };
    setWahl({ ...werte, [id]: { ...bisher, ...neu } });
  }

  function zuruecksetzen() {
    setWahl(null);
    setAus(null);
  }

  function fertig() {
    bestaetigen(
      zeilen
        .filter((z) => !abgewaehlt.has(z.artikel.id))
        .map((z) => {
          const w = werte[z.artikel.id] ?? { ganze: 0, angebrochen: false };
          return {
            artikelId: z.artikel.id,
            menge: w.ganze,
            angebrochen: w.angebrochen,
          };
        })
        .filter(
          (a) =>
            a.menge > 0 ||
            a.angebrochen !==
              Boolean(
                zeilen.find((z) => z.artikel.id === a.artikelId)?.artikel
                  .angebrochen,
              ),
        ),
    );
    zuruecksetzen();
  }

  return (
    <Drawer
      open={offen}
      onOpenChange={(o) => {
        if (!o) {
          schliessen();
          zuruecksetzen();
        }
      }}
    >
      <DrawerContent>
        <div className="mx-auto w-full max-w-lg">
          <DrawerHeader>
            <DrawerTitle>Aus dem Vorrat abbuchen?</DrawerTitle>
            <DrawerDescription>
              Ganze Packungen, die leer sind – und ob eine offen ist.
            </DrawerDescription>
          </DrawerHeader>
          <ul className="max-h-[50dvh] space-y-1 overflow-y-auto px-4">
            {zeilen.map((z) => {
              const id = z.artikel.id;
              const an = !abgewaehlt.has(id);
              const w = werte[id] ?? { ganze: 0, angebrochen: false };
              return (
                <li key={id} className="flex items-center gap-2 py-1.5">
                  <input
                    type="checkbox"
                    checked={an}
                    aria-label={`${z.name} abbuchen`}
                    onChange={() => {
                      const neu = new Set(abgewaehlt);
                      if (an) {
                        neu.add(id);
                      } else {
                        neu.delete(id);
                      }
                      setAus(neu);
                    }}
                    className="size-5 shrink-0 accent-[var(--primary)]"
                  />
                  <span className="min-w-0 flex-1">
                    {z.name}
                    <span className="block text-xs text-muted-foreground">
                      Da: {bestandKurz(vorratVon(z.artikel))}
                    </span>
                  </span>
                  <div
                    className={cn(
                      "flex items-center gap-1",
                      !an && "pointer-events-none opacity-40",
                    )}
                  >
                    <Button
                      variant="outline"
                      size="icon"
                      className="size-8 rounded-full"
                      aria-label={`${z.name} eine weniger`}
                      disabled={!an || w.ganze <= 0}
                      onClick={() => aendern(id, { ganze: w.ganze - 1 })}
                    >
                      <Minus />
                    </Button>
                    <span
                      className="w-6 text-center tabular-nums"
                      data-testid={`leer-${z.name}`}
                    >
                      {w.ganze}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="size-8 rounded-full"
                      aria-label={`${z.name} eine mehr`}
                      disabled={!an || w.ganze >= z.artikel.bestand}
                      onClick={() => aendern(id, { ganze: w.ganze + 1 })}
                    >
                      <Plus />
                    </Button>
                    <button
                      type="button"
                      aria-pressed={w.angebrochen}
                      aria-label={`${z.name} offen`}
                      disabled={!an}
                      onClick={() =>
                        aendern(id, { angebrochen: !w.angebrochen })
                      }
                      className={cn(
                        "ml-1 rounded-full border px-2.5 py-1 text-xs",
                        w.angebrochen
                          ? "border-primary bg-primary text-primary-foreground"
                          : "bg-card text-muted-foreground",
                      )}
                    >
                      offen
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
          <DrawerFooter className="grid grid-cols-2">
            <Button
              variant="outline"
              className="h-12 rounded-full"
              onClick={() => {
                bestaetigen([]);
                zuruecksetzen();
              }}
            >
              Nichts abbuchen
            </Button>
            <Button className="h-12 rounded-full" onClick={fertig}>
              <ChefHat /> Abbuchen
            </Button>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
