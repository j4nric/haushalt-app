import { usePowerSync, useQuery } from "@powersync/react";
import { Dices, X } from "lucide-react";
import { useEffect, useState } from "react";
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
import {
  type Gericht,
  gewichtetZiehen,
  type Kandidat,
  tagName,
  wocheFuellen,
} from "@/lib/plan";
import { zeitWert } from "@/lib/zeit";
import { rezeptEmoji } from "../rezepte/Rezepte";
import { useKochbar } from "../rezepte/useKochbar";
import { einplanen } from "./aktionen";
import { useStandardPortionen } from "./daten";

type Rezept = {
  id: string;
  titel: string;
  favorit: number | null;
  zuletzt: string | null;
};

const ROLL_MS = 700;

/**
 * „Woche füllen“: Für jeden leeren Tag ein Vorschlag – Favoriten, Vorrätiges und lange
 * nicht Gekochtes zuerst, nichts doppelt. Je Tag neu würfeln oder weglassen.
 */
export function WocheFuellen({
  offen,
  schliessen,
  haushaltId,
  nutzerId,
  leereTage,
  geplant,
}: {
  offen: boolean;
  schliessen: () => void;
  haushaltId: string;
  nutzerId: string;
  leereTage: string[];
  geplant: Gericht[];
}) {
  const db = usePowerSync();
  const { data: rezepte } = useQuery<Rezept>(
    `SELECT r.id, r.titel, r.favorit,
            (SELECT MAX(g.gekocht_am) FROM gekocht g WHERE g.rezept_id = r.id) AS zuletzt
       FROM rezepte r WHERE r.haushalt_id = ?`,
    [haushaltId],
  );
  const kochbar = useKochbar(haushaltId);
  const standard = useStandardPortionen(haushaltId);
  const kandidaten: Kandidat[] = rezepte.map((r) => {
    const tage = r.zuletzt
      ? (Date.now() - zeitWert(r.zuletzt)) / 86_400_000
      : 999;
    const gewicht =
      1 +
      (r.favorit ? 2 : 0) +
      (kochbar.get(r.id)?.prozent ?? 0) / 50 +
      (tage > 14 ? 1 : 0);
    // Gerade erst gekocht? Dann eher nicht schon wieder.
    return {
      id: r.id,
      titel: r.titel,
      gewicht: tage < 5 ? gewicht * 0.3 : gewicht,
    };
  });

  const [vorschlaege, setVorschlaege] = useState<Map<string, Kandidat>>(
    new Map(),
  );
  const [rollt, setRollt] = useState<Set<string>>(new Set());
  const [anzeige, setAnzeige] = useState<Map<string, string>>(new Map());

  // Beim Öffnen (sobald Rezepte da sind) alle Tage auf einmal würfeln.
  const bereit = kandidaten.length > 0;
  // biome-ignore lint/correctness/useExhaustiveDependencies: nur beim Öffnen neu würfeln, nicht bei jeder Datenänderung.
  useEffect(() => {
    if (offen && bereit) {
      setVorschlaege(wocheFuellen(leereTage, kandidaten, geplant));
      rollen(leereTage);
    }
  }, [offen, bereit]);

  /** Kurzer Spielautomaten-Effekt: Titel flackern, dann steht der Vorschlag. */
  function rollen(tage: string[]) {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    setRollt(new Set(tage));
    const takt = setInterval(() => {
      setAnzeige(
        new Map(
          tage.map((t) => [
            t,
            kandidaten[Math.floor(Math.random() * kandidaten.length)]?.titel ??
              "",
          ]),
        ),
      );
    }, 80);
    setTimeout(() => {
      clearInterval(takt);
      setRollt(new Set());
    }, ROLL_MS);
  }

  function neuWuerfeln(tag: string) {
    const andere = new Set(
      [...vorschlaege].filter(([t]) => t !== tag).map(([, k]) => k.id),
    );
    const frei = kandidaten.filter(
      (k) => !andere.has(k.id) && k.id !== vorschlaege.get(tag)?.id,
    );
    const k = gewichtetZiehen(frei.length > 0 ? frei : kandidaten);
    if (k) {
      setVorschlaege(new Map(vorschlaege).set(tag, k));
      rollen([tag]);
    }
  }

  async function uebernehmen() {
    for (const [datum, k] of vorschlaege) {
      await einplanen(db, {
        haushaltId,
        nutzerId,
        datum,
        rezeptId: k.id,
        titel: k.titel,
        portionen: standard,
      });
    }
    schliessen();
    toast.success(
      vorschlaege.size === 1
        ? "1 Tag eingeplant 🎲"
        : `${vorschlaege.size} Tage eingeplant 🎲`,
    );
  }

  return (
    <Drawer open={offen} onOpenChange={(o) => !o && schliessen()}>
      <DrawerContent>
        <div className="mx-auto w-full max-w-lg">
          <DrawerHeader>
            <DrawerTitle>Woche füllen 🎲</DrawerTitle>
            <DrawerDescription>
              {kandidaten.length === 0
                ? "Lege zuerst ein paar Rezepte an."
                : leereTage.length === 0
                  ? "Die nächsten sieben Tage sind schon verplant."
                  : "Vorschläge für die freien Tage – je Tag neu würfeln oder weglassen."}
            </DrawerDescription>
          </DrawerHeader>
          <ul className="space-y-1 px-4">
            {[...vorschlaege].map(([tag, k]) => {
              const titel = rollt.has(tag)
                ? (anzeige.get(tag) ?? k.titel)
                : k.titel;
              return (
                <li key={tag} className="flex items-center gap-3 py-1">
                  <span className="w-24 shrink-0 text-sm font-medium">
                    {tagName(tag)}
                  </span>
                  <span
                    className={
                      rollt.has(tag)
                        ? "min-w-0 flex-1 truncate text-muted-foreground blur-[0.5px]"
                        : "min-w-0 flex-1 truncate font-medium animate-in zoom-in-95"
                    }
                    aria-live="polite"
                  >
                    {rezeptEmoji(titel)} {titel}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-9 rounded-full"
                    aria-label={`${tagName(tag)} neu würfeln`}
                    onClick={() => neuWuerfeln(tag)}
                  >
                    <Dices />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-9 rounded-full"
                    aria-label={`${tagName(tag)} weglassen`}
                    onClick={() => {
                      const neu = new Map(vorschlaege);
                      neu.delete(tag);
                      setVorschlaege(neu);
                    }}
                  >
                    <X />
                  </Button>
                </li>
              );
            })}
          </ul>
          <DrawerFooter>
            <Button
              className="h-12 rounded-full text-base"
              disabled={vorschlaege.size === 0 || rollt.size > 0}
              onClick={uebernehmen}
            >
              {vorschlaege.size === 1
                ? "1 Tag einplanen"
                : `${vorschlaege.size} Tage einplanen`}
            </Button>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
