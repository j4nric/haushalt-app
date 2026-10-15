import { usePowerSync, useQuery } from "@powersync/react";
import { Search } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { tagName } from "@/lib/plan";
import { cn } from "@/lib/utils";
import { RezeptBild } from "@/rezepte/RezeptBild";
import { useKochbar } from "../rezepte/useKochbar";
import { einplanen } from "./aktionen";
import { useStandardPortionen } from "./daten";

type Wahl = {
  id: string;
  titel: string;
  bild_url: string | null;
  favorit: number | null;
};

/** Häufige Einträge ohne Rezept – ein Tipp genügt. */
const OHNE_REZEPT = ["Reste", "Auswärts essen", "Pizza bestellen", "Brotzeit"];

/** Für einen Tag: Rezept wählen (Suche, Favoriten, kochbar) oder freien Text eintragen. */
export function Auswahl({
  datum,
  schliessen,
  haushaltId,
  nutzerId,
}: {
  datum: string | null;
  schliessen: () => void;
  haushaltId: string;
  nutzerId: string;
}) {
  const db = usePowerSync();
  const { data: rezepte } = useQuery<Wahl>(
    "SELECT id, titel, bild_url, favorit FROM rezepte WHERE haushalt_id = ? ORDER BY lower(titel)",
    [haushaltId],
  );
  const kochbar = useKochbar(haushaltId);
  const standard = useStandardPortionen(haushaltId);
  const [suche, setSuche] = useState("");
  const [favoriten, setFavoriten] = useState(false);
  const [nachVorrat, setNachVorrat] = useState(false);
  const [text, setText] = useState("");

  const woerter = suche.toLowerCase().split(/\s+/).filter(Boolean);
  const treffer = rezepte
    .filter(
      (r) =>
        woerter.every((w) => r.titel.toLowerCase().includes(w)) &&
        (!favoriten || r.favorit),
    )
    .sort((a, b) =>
      nachVorrat
        ? (kochbar.get(b.id)?.prozent ?? 0) - (kochbar.get(a.id)?.prozent ?? 0)
        : 0,
    );

  async function waehlen(rezept: Wahl | null, titel: string) {
    if (!datum || !titel.trim()) {
      return;
    }
    await einplanen(db, {
      haushaltId,
      nutzerId,
      datum,
      rezeptId: rezept?.id ?? null,
      titel,
      portionen: rezept ? standard : null,
    });
    zuruecksetzen();
  }

  function zuruecksetzen() {
    setSuche("");
    setText("");
    schliessen();
  }

  return (
    <Drawer open={datum != null} onOpenChange={(o) => !o && zuruecksetzen()}>
      <DrawerContent>
        <div className="mx-auto w-full max-w-lg pb-4">
          <DrawerHeader>
            <DrawerTitle>
              {datum ? tagName(datum) : ""}: Was gibt's?
            </DrawerTitle>
            <DrawerDescription>
              Rezept wählen oder einfach etwas eintragen.
            </DrawerDescription>
          </DrawerHeader>
          <div className="space-y-3 px-4">
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                waehlen(null, text);
              }}
            >
              <Input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="z. B. Reste, Grillen bei Tom"
                aria-label="Ohne Rezept eintragen"
                className="h-10 rounded-full px-4 text-base"
              />
              <Button
                type="submit"
                className="h-10 rounded-full"
                disabled={!text.trim()}
              >
                Eintragen
              </Button>
            </form>
            <div className="flex flex-wrap gap-1.5">
              {OHNE_REZEPT.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => waehlen(null, t)}
                  className="rounded-full border bg-card px-3 py-1 text-sm"
                >
                  {t}
                </button>
              ))}
            </div>

            {rezepte.length > 0 && (
              <>
                <div className="relative">
                  <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="search"
                    value={suche}
                    onChange={(e) => setSuche(e.target.value)}
                    placeholder="Rezept suchen"
                    aria-label="Rezept suchen"
                    className="h-10 rounded-full pl-10 text-base"
                  />
                </div>
                <div className="flex gap-1.5">
                  <Chip
                    an={favoriten}
                    umschalten={() => setFavoriten(!favoriten)}
                  >
                    ⭐ Favoriten
                  </Chip>
                  <Chip
                    an={nachVorrat}
                    umschalten={() => setNachVorrat(!nachVorrat)}
                  >
                    🥘 Was ist da?
                  </Chip>
                </div>
                <ul className="max-h-[38dvh] space-y-1 overflow-y-auto">
                  {treffer.map((r) => {
                    const v = kochbar.get(r.id);
                    return (
                      <li key={r.id}>
                        <button
                          type="button"
                          onClick={() => waehlen(r, r.titel)}
                          className="flex w-full items-center gap-3 rounded-xl p-1.5 text-left active:bg-muted"
                        >
                          <RezeptBild
                            url={r.bild_url}
                            titel={r.titel}
                            className="size-12 shrink-0 rounded-lg text-2xl"
                          />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate font-medium">
                              {r.favorit ? "⭐ " : ""}
                              {r.titel}
                            </span>
                            {v && (
                              <span className="text-xs text-muted-foreground">
                                {v.prozent} % im Vorrat
                              </span>
                            )}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

function Chip({
  an,
  umschalten,
  children,
}: {
  an: boolean;
  umschalten: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={an}
      onClick={umschalten}
      className={cn(
        "rounded-full border px-3 py-1 text-sm",
        an ? "border-primary bg-primary text-primary-foreground" : "bg-card",
      )}
    >
      {children}
    </button>
  );
}
