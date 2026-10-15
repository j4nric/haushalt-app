import { formatiereMenge } from "@haushalt/db/einheiten";
import { useQuery } from "@powersync/react";
import { ChefHat } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import type { ArtikelStand } from "@/lib/kochbar";
import { alsPosten } from "@/lib/plan";
import { ARTIKEL_STAND } from "@/rezepte/daten";
import type { GespeicherteZutat } from "./aktionen";

const EINHEIT_KURZ = { stueck: "Stk.", g: "g", ml: "ml" } as const;

export type Abbuchung = { artikelId: string; menge: number };

type Zeile = {
  artikel: ArtikelStand;
  name: string;
  vorschlag: number | null;
  /** Optional im Rezept – vielleicht gar nicht verwendet, daher abgewählt. */
  optional: boolean;
};

/** Welche Zutaten im Vorrat geführt werden – mit vorgeschlagener Verbrauchsmenge. */
export function useAbbuchbar(
  haushaltId: string,
  zutaten: GespeicherteZutat[],
  faktor: number,
): Zeile[] {
  const { data: artikel } = useQuery<ArtikelStand>(ARTIKEL_STAND, [haushaltId]);
  const nachName = new Map(artikel.map((a) => [a.name, a]));
  return zutaten.flatMap((z) => {
    const a = nachName.get(z.name.toLowerCase());
    if (!a?.im_vorrat || a.bestand <= 0) {
      return [];
    }
    const p = alsPosten(z, faktor);
    // Nur vorschlagen, wenn die Einheiten zusammenpassen; nie mehr als vorhanden.
    const vorschlag =
      p.listenEinheit === a.standardeinheit && p.zutat.menge != null
        ? Math.min(p.zutat.menge, a.bestand)
        : null;
    return [
      { artikel: a, name: z.name, vorschlag, optional: Boolean(z.optional) },
    ];
  });
}

/**
 * Nach dem Kochen: Was davon wurde aus dem Vorrat verbraucht? Vorbelegt mit den
 * Mengen aus dem Rezept (nach Portionen), änderbar; Unklares ist abgewählt.
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
  const [mengen, setMengen] = useState<Record<string, string> | null>(null);
  const [aus, setAus] = useState<Set<string> | null>(null);
  const werte =
    mengen ??
    Object.fromEntries(
      zeilen.map((z) => [z.artikel.id, z.vorschlag?.toString() ?? ""]),
    );
  const abgewaehlt =
    aus ??
    new Set(
      zeilen
        .filter((z) => z.vorschlag == null || z.optional)
        .map((z) => z.artikel.id),
    );

  function fertig() {
    bestaetigen(
      zeilen
        .filter((z) => !abgewaehlt.has(z.artikel.id))
        .map((z) => ({
          artikelId: z.artikel.id,
          menge: Number((werte[z.artikel.id] ?? "").replace(",", ".")),
        }))
        .filter((a) => a.menge > 0),
    );
    setMengen(null);
    setAus(null);
  }

  return (
    <Drawer
      open={offen}
      onOpenChange={(o) => {
        if (!o) {
          schliessen();
          setMengen(null);
          setAus(null);
        }
      }}
    >
      <DrawerContent>
        <div className="mx-auto w-full max-w-lg">
          <DrawerHeader>
            <DrawerTitle>Aus dem Vorrat abbuchen?</DrawerTitle>
            <DrawerDescription>
              Was davon habt ihr verbraucht? Mengen lassen sich anpassen.
            </DrawerDescription>
          </DrawerHeader>
          <ul className="max-h-[50dvh] space-y-1 overflow-y-auto px-4">
            {zeilen.map((z) => {
              const id = z.artikel.id;
              const an = !abgewaehlt.has(id);
              return (
                <li key={id} className="flex items-center gap-3 py-1.5">
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
                      Bestand:{" "}
                      {formatiereMenge(
                        z.artikel.bestand,
                        z.artikel.standardeinheit,
                      )}
                    </span>
                  </span>
                  <Input
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step="any"
                    aria-label={`Menge ${z.name}`}
                    value={werte[id] ?? ""}
                    disabled={!an}
                    onChange={(e) =>
                      setMengen({ ...werte, [id]: e.target.value })
                    }
                    className="h-9 w-20 text-right text-base"
                  />
                  <span className="w-8 text-sm text-muted-foreground">
                    {EINHEIT_KURZ[z.artikel.standardeinheit]}
                  </span>
                </li>
              );
            })}
          </ul>
          <DrawerFooter className="grid grid-cols-2">
            <Button
              variant="outline"
              className="h-12 rounded-full"
              onClick={() => bestaetigen([])}
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
