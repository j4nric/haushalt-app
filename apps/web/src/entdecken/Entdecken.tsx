import { zerlegeZeile, zutatAlsText } from "@haushalt/db/zutaten";
import { usePowerSync, useQuery } from "@powersync/react";
import {
  ArrowLeft,
  Check,
  Clock,
  Dices,
  Plus,
  Search,
  Sparkles,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Uebereinstimmung } from "@/components/Uebereinstimmung";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import type { ArtikelStand } from "@/lib/kochbar";
import { heute } from "@/lib/plan";
import { cn } from "@/lib/utils";
import { rezeptSpeichern } from "@/rezepte/aktionen";
import { ARTIKEL_STAND } from "@/rezepte/daten";
import { SAMMLUNG } from "./sammlung";
import type { SammlungsRezept } from "./sammlung/typ";
import { tagesZufall, type Vorschlag, vorschlagen } from "./vorschlagen";

/** So viele Karten kommen je Schritt dazu. */
const SEITE = 24;

type Filter = "vegetarisch" | "schnell" | "kinder" | "fisch" | "suppe";

const FILTER: {
  id: Filter;
  text: string;
  passt: (r: SammlungsRezept) => boolean;
}[] = [
  {
    id: "vegetarisch",
    text: "Vegetarisch",
    passt: (r) =>
      r.schlagwoerter.includes("vegetarisch") ||
      r.schlagwoerter.includes("vegan"),
  },
  { id: "schnell", text: "Bis 30 Min.", passt: (r) => r.dauer <= 30 },
  {
    id: "kinder",
    text: "Kinder mögen's",
    passt: (r) => r.schlagwoerter.includes("kinder"),
  },
  {
    id: "fisch",
    text: "Fisch",
    passt: (r) => r.schlagwoerter.includes("fisch"),
  },
  {
    id: "suppe",
    text: "Suppen & Eintöpfe",
    passt: (r) =>
      r.schlagwoerter.includes("suppe") || r.schlagwoerter.includes("eintopf"),
  },
];

/**
 * „Entdecken“: Rezepte aus der mitgelieferten Sammlung, passend zu Vorrat und
 * Saison. Ein Tipp zeigt das Rezept, „Übernehmen“ legt es in die eigenen Rezepte.
 */
export function Entdecken({
  haushaltId,
  nutzerId,
  gehe,
}: {
  haushaltId: string;
  nutzerId: string;
  gehe: (pfad: string[]) => void;
}) {
  const db = usePowerSync();
  const { data: artikel } = useQuery<ArtikelStand>(ARTIKEL_STAND, [haushaltId]);
  const { data: eigene } = useQuery<{ titel: string }>(
    "SELECT titel FROM rezepte WHERE haushalt_id = ?",
    [haushaltId],
  );
  const [filter, setFilter] = useState<Filter[]>([]);
  const [nachVorrat, setNachVorrat] = useState(false);
  const [suche, setSuche] = useState("");
  const [offen, setOffen] = useState<Vorschlag | null>(null);
  const [wurf, setWurf] = useState(0);
  // Nicht alle 200 Karten auf einmal zeichnen: erst ein paar, beim Scrollen mehr.
  const [anzahl, setAnzahl] = useState(SEITE);
  const ende = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const ziel = ende.current;
    if (!ziel) {
      return;
    }
    const beobachter = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) {
          setAnzahl((n) => n + SEITE);
        }
      },
      { rootMargin: "600px" },
    );
    beobachter.observe(ziel);
    return () => beobachter.disconnect();
  }, []);

  const tag = heute();
  const vorschlaege = useMemo(
    () =>
      vorschlagen(SAMMLUNG, {
        artikel: new Map(artikel.map((a) => [a.name, a])),
        vorhandeneTitel: new Set(eigene.map((r) => r.titel.toLowerCase())),
        monat: Number(tag.slice(5, 7)),
        zufall: tagesZufall(tag, wurf),
      }),
    [artikel, eigene, tag, wurf],
  );
  const uebernommen = SAMMLUNG.length - vorschlaege.length;

  const woerter = suche.toLowerCase().split(/\s+/).filter(Boolean);
  const treffer = vorschlaege.filter(
    ({ rezept: r }) =>
      filter.every((f) => FILTER.find((x) => x.id === f)?.passt(r)) &&
      woerter.every((w) =>
        `${r.titel} ${r.zutaten} ${r.schlagwoerter.join(" ")}`
          .toLowerCase()
          .includes(w),
      ),
  );
  if (nachVorrat) {
    treffer.sort((a, b) => b.prozent - a.prozent || b.punkte - a.punkte);
  }
  const gefiltert = filter.length > 0 || woerter.length > 0 || nachVorrat;
  const heutigeTipps = gefiltert ? [] : treffer.slice(0, 3);
  const rest = gefiltert ? treffer : treffer.slice(3);

  async function uebernehmen(v: Vorschlag) {
    const r = v.rezept;
    const id = await rezeptSpeichern(db, {
      id: null,
      haushaltId,
      nutzerId,
      daten: {
        titel: r.titel,
        portionen: 2,
        quelle_url: null,
        bild_url: null,
        schritte: r.schritte,
        zutatenText: r.zutaten,
        gewuerzeText: r.gewuerze,
        schlagwoerter: r.schlagwoerter,
      },
    });
    setOffen(null);
    toast.success(`„${r.titel}“ ist jetzt in euren Rezepten`, {
      action: { label: "Öffnen", onClick: () => gehe([id]) },
    });
  }

  return (
    <div className="space-y-4 pt-2">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Zurück"
          onClick={() => gehe([])}
        >
          <ArrowLeft />
        </Button>
        <div className="flex-1">
          <h2 className="text-lg font-semibold">Entdecken</h2>
          <p className="text-xs text-muted-foreground">
            {SAMMLUNG.length} Rezepte für 2 Personen
            {uebernommen > 0 && ` · ${uebernommen} schon bei euch`}
          </p>
        </div>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          value={suche}
          onChange={(e) => setSuche(e.target.value)}
          placeholder="Gericht oder Zutat"
          aria-label="Sammlung durchsuchen"
          className="h-11 rounded-full pl-10 text-base"
        />
      </div>

      <div
        role="toolbar"
        aria-label="Filter"
        className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 [scrollbar-width:none]"
      >
        <button
          type="button"
          aria-pressed={nachVorrat}
          onClick={() => setNachVorrat(!nachVorrat)}
          className={cn(
            "shrink-0 rounded-full border px-3 py-1.5 text-sm whitespace-nowrap transition-colors",
            nachVorrat
              ? "border-primary bg-primary text-primary-foreground"
              : "bg-card text-muted-foreground",
          )}
        >
          Beste Übereinstimmung
        </button>
        {FILTER.map((f) => {
          const an = filter.includes(f.id);
          return (
            <button
              key={f.id}
              type="button"
              aria-pressed={an}
              onClick={() =>
                setFilter(
                  an ? filter.filter((x) => x !== f.id) : [...filter, f.id],
                )
              }
              className={cn(
                "shrink-0 rounded-full border px-3 py-1.5 text-sm whitespace-nowrap transition-colors",
                an
                  ? "border-primary bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground",
              )}
            >
              {f.text}
            </button>
          );
        })}
      </div>

      {heutigeTipps.length > 0 && (
        <section aria-label="Heute vorgeschlagen" className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <h3 className="flex items-center gap-1.5 text-sm font-semibold">
              <Sparkles className="size-4 text-primary" /> Heute für euch
            </h3>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
              onClick={() => setWurf(wurf + 1)}
            >
              <Dices /> Andere
            </Button>
          </div>
          {heutigeTipps.map((v) => (
            <Karte key={v.rezept.id} v={v} gross oeffnen={() => setOffen(v)} />
          ))}
        </section>
      )}

      <section aria-label="Alle Vorschläge" className="space-y-2">
        {heutigeTipps.length > 0 && rest.length > 0 && (
          <h3 className="px-1 pt-2 text-sm font-semibold text-muted-foreground">
            Mehr Ideen
          </h3>
        )}
        {rest.slice(0, anzahl).map((v) => (
          <Karte key={v.rezept.id} v={v} oeffnen={() => setOffen(v)} />
        ))}
        <div ref={ende} aria-hidden />
        {treffer.length === 0 && (
          <p className="py-10 text-center text-sm text-muted-foreground">
            {vorschlaege.length === 0
              ? "Ihr habt schon alle Rezepte der Sammlung übernommen. 🎉"
              : "Nichts gefunden."}
          </p>
        )}
      </section>

      <Vorschau
        v={offen}
        schliessen={() => setOffen(null)}
        uebernehmen={uebernehmen}
      />
    </div>
  );
}

function grund(v: Vorschlag): string | null {
  if (v.ausVorrat.length > 0) {
    const namen = v.ausVorrat.slice(0, 3).join(", ");
    return `Mit eurem Vorrat: ${namen}${v.ausVorrat.length > 3 ? " …" : ""}`;
  }
  return v.saison ? "Hat gerade Saison" : null;
}

function Karte({
  v,
  gross = false,
  oeffnen,
}: {
  v: Vorschlag;
  gross?: boolean;
  oeffnen: () => void;
}) {
  const r = v.rezept;
  const warum = grund(v);
  return (
    <button
      type="button"
      onClick={oeffnen}
      className={cn(
        "flex w-full items-start gap-3 rounded-2xl border bg-card p-3 text-left active:bg-muted",
        gross && "p-4",
      )}
    >
      <span className="min-w-0 flex-1">
        <span className={cn("block font-medium", gross && "text-lg")}>
          {r.titel}
        </span>
        <span className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3" /> {r.dauer} Min.
          </span>
          {r.schlagwoerter.slice(0, 3).map((w) => (
            <span key={w}>#{w}</span>
          ))}
        </span>
        <Uebereinstimmung prozent={v.prozent} className="mt-1.5" />
        {warum && (
          <span className="mt-1 block text-xs font-medium text-primary">
            {warum}
          </span>
        )}
      </span>
    </button>
  );
}

function Vorschau({
  v,
  schliessen,
  uebernehmen,
}: {
  v: Vorschlag | null;
  schliessen: () => void;
  uebernehmen: (v: Vorschlag) => Promise<void>;
}) {
  const [laeuft, setLaeuft] = useState(false);
  const r = v?.rezept;
  const zeilen = (text: string) =>
    text
      .split("\n")
      .map((z) => z.trim())
      .filter(Boolean);
  return (
    <Drawer
      open={v != null}
      onOpenChange={(o) => !o && schliessen()}
      // Nur Lesen, keine Eingabe: ohne die iOS-Scroll-Sperre von vaul – die
      // unterbindet sonst am oberen/unteren Rand das natürliche Nachfedern.
      disablePreventScroll={false}
    >
      <DrawerContent>
        {v && r && (
          <div className="mx-auto flex min-h-0 w-full max-w-lg flex-1 flex-col">
            <DrawerHeader className="pb-2">
              <DrawerTitle>{r.titel}</DrawerTitle>
              <DrawerDescription>
                2 Portionen · {r.dauer} Min. · {r.schlagwoerter.join(", ")}
              </DrawerDescription>
            </DrawerHeader>
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-4 pb-2 text-sm">
              <section aria-label="Zutaten">
                <h3 className="pb-1 font-semibold">Zutaten</h3>
                <ul className="space-y-0.5">
                  {zeilen(r.zutaten).map((z) => {
                    const t = zerlegeZeile(z);
                    const imVorrat = v.ausVorrat.includes(t.name);
                    return (
                      <li
                        key={z}
                        className={cn(
                          "flex items-center gap-2",
                          t.optional && "text-muted-foreground",
                        )}
                      >
                        {imVorrat ? (
                          <Check
                            className="size-3.5 text-primary"
                            aria-label="im Vorrat"
                          />
                        ) : (
                          <span className="size-3.5" />
                        )}
                        {t.optional && "("}
                        {zutatAlsText(t)}
                        {t.zusatz && `, ${t.zusatz}`}
                        {t.optional && ")"}
                      </li>
                    );
                  })}
                </ul>
                {r.gewuerze.trim() && (
                  <p className="pt-2 text-muted-foreground">
                    Gewürze: {zeilen(r.gewuerze).join(", ")}
                  </p>
                )}
              </section>
              <section aria-label="Zubereitung">
                <h3 className="pb-1 font-semibold">Zubereitung</h3>
                <ol className="list-decimal space-y-1 pl-5">
                  {zeilen(r.schritte).map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ol>
              </section>
            </div>
            <div className="border-t p-4">
              <Button
                className="h-12 w-full rounded-full text-base"
                disabled={laeuft}
                onClick={async () => {
                  setLaeuft(true);
                  await uebernehmen(v).finally(() => setLaeuft(false));
                }}
              >
                <Plus /> In unsere Rezepte
              </Button>
            </div>
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
}
