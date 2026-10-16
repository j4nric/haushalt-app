import { useQuery } from "@powersync/react";
import { LoaderCircle, Plus, Search, Sparkles } from "lucide-react";
import { lazy, Suspense, useState } from "react";
import { useUnterseite } from "@/Ansicht";
import { Uebereinstimmung } from "@/components/Uebereinstimmung";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { vorWann, zeitWert } from "@/lib/zeit";
import { RezeptBild } from "@/rezepte/RezeptBild";
import { schlagwoerterAusText } from "./aktionen";
import { Gluecksrad } from "./Gluecksrad";
import { ResteVerwerten } from "./ResteVerwerten";
import { RezeptDetail } from "./RezeptDetail";
import { RezeptEditor } from "./RezeptEditor";
import { useKochbar } from "./useKochbar";

// Die Sammlung (~100 Rezepte) erst laden, wenn jemand „Entdecken“ öffnet.
const Entdecken = lazy(() =>
  import("@/entdecken/Entdecken").then((m) => ({ default: m.Entdecken })),
);

type Karte = {
  id: string;
  titel: string;
  bild_url: string | null;
  portionen: number | null;
  favorit: number | null;
  schlagwoerter: string | null;
  zutaten: number;
  zutaten_namen: string | null;
  gekocht_anzahl: number;
  zuletzt_gekocht: string | null;
  gekocht_monat: number;
};

/**
 * Bereich „Rezepte“: Übersicht, Detail, Bearbeiten und Kochen – je eine Unterseite
 * in der Adresse (#rezepte/<id>/kochen), damit Zurück wie erwartet funktioniert.
 */
export function Rezepte({
  haushaltId,
  nutzerId,
}: {
  haushaltId: string;
  nutzerId: string;
}) {
  const [pfad, gehe] = useUnterseite("rezepte");
  const [id, unterseite] = pfad;

  if (id === "entdecken") {
    return (
      <Suspense
        fallback={
          <LoaderCircle className="mx-auto mt-16 size-6 animate-spin text-muted-foreground" />
        }
      >
        <Entdecken haushaltId={haushaltId} nutzerId={nutzerId} gehe={gehe} />
      </Suspense>
    );
  }
  if (id === "neu") {
    return (
      <RezeptEditor
        haushaltId={haushaltId}
        nutzerId={nutzerId}
        rezeptId={null}
        fertig={(neueId) => gehe(neueId ? [neueId] : [])}
      />
    );
  }
  if (id && unterseite === "bearbeiten") {
    return (
      <RezeptEditor
        haushaltId={haushaltId}
        nutzerId={nutzerId}
        rezeptId={id}
        fertig={() => gehe([id])}
      />
    );
  }
  if (id) {
    return (
      <RezeptDetail
        key={id}
        id={id}
        haushaltId={haushaltId}
        nutzerId={nutzerId}
        kochen={unterseite === "kochen"}
        gehe={gehe}
      />
    );
  }
  return <Uebersicht haushaltId={haushaltId} gehe={gehe} />;
}

/** Filter der Übersicht – bleiben erhalten, solange die App offen ist. */
type Auswahl = {
  suche: string;
  favoriten: boolean;
  sortierung: "name" | "kochbar" | "zuletzt";
  schlagwoerter: string[];
  /** „Reste verwerten“: was übrig ist; `null` = aus. */
  reste: string[] | null;
};
let letzteAuswahl: Auswahl = {
  suche: "",
  favoriten: false,
  sortierung: "name",
  schlagwoerter: [],
  reste: null,
};

function Uebersicht({
  haushaltId,
  gehe,
}: {
  haushaltId: string;
  gehe: (pfad: string[]) => void;
}) {
  const { data: rezepte, isLoading } = useQuery<Karte>(
    `SELECT r.id, r.titel, r.bild_url, r.portionen, r.favorit, r.schlagwoerter,
            (SELECT COUNT(*) FROM rezept_zutaten z WHERE z.rezept_id = r.id) AS zutaten,
            (SELECT group_concat(z.name, ' ') FROM rezept_zutaten z WHERE z.rezept_id = r.id) AS zutaten_namen,
            (SELECT COUNT(*) FROM gekocht g WHERE g.rezept_id = r.id) AS gekocht_anzahl,
            (SELECT MAX(g.gekocht_am) FROM gekocht g WHERE g.rezept_id = r.id) AS zuletzt_gekocht,
            (SELECT COUNT(*) FROM gekocht g WHERE g.rezept_id = r.id AND g.gekocht_am >= ?) AS gekocht_monat
       FROM rezepte r
      WHERE r.haushalt_id = ?
      ORDER BY lower(r.titel)`,
    [monatsanfang(), haushaltId],
  );
  const kochbar = useKochbar(haushaltId);

  const [auswahl, setAuswahlRoh] = useState(letzteAuswahl);
  const setAuswahl = (teil: Partial<Auswahl>) =>
    setAuswahlRoh((a) => {
      letzteAuswahl = { ...a, ...teil };
      return letzteAuswahl;
    });

  const alleSchlagwoerter = [
    ...new Set(rezepte.flatMap((r) => schlagwoerterAusText(r.schlagwoerter))),
  ].sort((a, b) => a.localeCompare(b, "de"));

  // Jedes Suchwort muss im Titel, in einer Zutat oder einem Schlagwort vorkommen.
  const woerter = auswahl.suche.toLowerCase().split(/\s+/).filter(Boolean);
  const treffer = rezepte
    .filter((r) => {
      const heuhaufen =
        `${r.titel} ${r.zutaten_namen ?? ""} ${r.schlagwoerter ?? ""}`.toLowerCase();
      const tags = schlagwoerterAusText(r.schlagwoerter);
      return (
        woerter.every((w) => heuhaufen.includes(w)) &&
        (!auswahl.favoriten || r.favorit) &&
        auswahl.schlagwoerter.every((w) => tags.includes(w)) &&
        (auswahl.sortierung !== "zuletzt" || r.zuletzt_gekocht)
      );
    })
    .sort((a, b) => {
      if (auswahl.sortierung === "kochbar") {
        return (
          (kochbar.get(b.id)?.prozent ?? 0) - (kochbar.get(a.id)?.prozent ?? 0)
        );
      }
      if (auswahl.sortierung === "zuletzt") {
        return (b.zuletzt_gekocht ?? "").localeCompare(a.zuletzt_gekocht ?? "");
      }
      return 0;
    });

  const ungefiltert =
    !auswahl.suche &&
    !auswahl.favoriten &&
    auswahl.schlagwoerter.length === 0 &&
    auswahl.sortierung === "name";
  const liebling = [...rezepte].sort(
    (a, b) => b.gekocht_anzahl - a.gekocht_anzahl,
  )[0];
  const imMonat = rezepte.reduce((s, r) => s + r.gekocht_monat, 0);

  // Fürs Glücksrad: Favoriten, gut Vorrätiges und lange nicht Gekochtes zuerst.
  const rad = treffer.map((r) => {
    const tage = r.zuletzt_gekocht
      ? (Date.now() - zeitWert(r.zuletzt_gekocht)) / 86_400_000
      : 999;
    return {
      id: r.id,
      titel: r.titel,
      gewicht:
        1 +
        (r.favorit ? 2 : 0) +
        (kochbar.get(r.id)?.prozent ?? 0) / 50 +
        (tage > 14 ? 1 : 0),
    };
  });

  if (!isLoading && rezepte.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <span aria-hidden className="text-6xl">
          📖
        </span>
        <h2 className="text-lg font-semibold">Noch keine Rezepte</h2>
        <p className="max-w-xs text-sm text-muted-foreground">
          Stöbert in 100 Rezepten für zwei, fügt einen Link von eurer
          Lieblings-Rezeptseite ein oder schreibt eins von Hand auf.
        </p>
        <div className="mt-2 flex flex-col gap-2">
          <Button className="rounded-full" onClick={() => gehe(["entdecken"])}>
            <Sparkles /> Rezepte entdecken
          </Button>
          <Button
            variant="outline"
            className="rounded-full"
            onClick={() => gehe(["neu"])}
          >
            <Plus /> Eigenes Rezept
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 pt-2">
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="icon"
          className="size-11 shrink-0 rounded-full"
          aria-label="Rezepte entdecken"
          onClick={() => gehe(["entdecken"])}
        >
          <Sparkles />
        </Button>
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={auswahl.suche}
            onChange={(e) => setAuswahl({ suche: e.target.value })}
            placeholder="Rezept oder Zutat suchen"
            aria-label="Rezepte durchsuchen"
            className="h-11 rounded-full pl-10 text-base"
          />
        </div>
        <Gluecksrad rezepte={rad} oeffnen={(id) => gehe([id])} />
        <Button
          size="icon"
          className="size-11 shrink-0 rounded-full"
          aria-label="Neues Rezept"
          onClick={() => gehe(["neu"])}
        >
          <Plus />
        </Button>
      </div>

      <div
        role="toolbar"
        aria-label="Filter"
        className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 [scrollbar-width:none]"
      >
        <FilterChip
          an={auswahl.favoriten}
          umschalten={() => setAuswahl({ favoriten: !auswahl.favoriten })}
        >
          Favoriten
        </FilterChip>
        <FilterChip
          an={auswahl.sortierung === "kochbar"}
          umschalten={() =>
            setAuswahl({
              sortierung: auswahl.sortierung === "kochbar" ? "name" : "kochbar",
            })
          }
        >
          Beste Übereinstimmung
        </FilterChip>
        <FilterChip
          an={auswahl.reste !== null}
          umschalten={() =>
            setAuswahl({ reste: auswahl.reste === null ? [] : null })
          }
        >
          Reste verwerten
        </FilterChip>
        <FilterChip
          an={auswahl.sortierung === "zuletzt"}
          umschalten={() =>
            setAuswahl({
              sortierung: auswahl.sortierung === "zuletzt" ? "name" : "zuletzt",
            })
          }
        >
          Zuletzt gekocht
        </FilterChip>
        {alleSchlagwoerter.map((w) => {
          const an = auswahl.schlagwoerter.includes(w);
          return (
            <FilterChip
              key={w}
              an={an}
              umschalten={() =>
                setAuswahl({
                  schlagwoerter: an
                    ? auswahl.schlagwoerter.filter((x) => x !== w)
                    : [...auswahl.schlagwoerter, w],
                })
              }
            >
              #{w}
            </FilterChip>
          );
        })}
      </div>

      {auswahl.reste !== null ? (
        <ResteVerwerten
          haushaltId={haushaltId}
          rezepte={rezepte}
          reste={auswahl.reste}
          aendern={(reste) => setAuswahl({ reste })}
          oeffnen={(id) => gehe([id])}
        />
      ) : (
        <>
          {ungefiltert && liebling && liebling.gekocht_anzahl > 0 && (
            <button
              type="button"
              onClick={() => gehe([liebling.id])}
              className="flex w-full items-center gap-3 rounded-2xl border p-3 text-left"
              style={{
                background:
                  "color-mix(in oklab, var(--card), var(--favorit) 14%)",
              }}
            >
              <span aria-hidden className="text-3xl">
                🏆
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-xs text-muted-foreground">
                  Euer Lieblingsgericht
                </span>
                <span className="block truncate font-semibold">
                  {liebling.titel} · {liebling.gekocht_anzahl}× gekocht
                </span>
              </span>
              {imMonat > 0 && (
                <span className="shrink-0 text-right text-xs text-muted-foreground">
                  Diesen Monat
                  <span className="block text-base font-semibold text-foreground">
                    {imMonat}× 🍳
                  </span>
                </span>
              )}
            </button>
          )}

          {treffer.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              {auswahl.sortierung === "zuletzt" && !auswahl.suche
                ? "Noch nichts gekocht – in der Kochansicht „Fertig gekocht“ antippen."
                : "Nichts gefunden."}
            </p>
          ) : (
            <ul className="grid grid-cols-2 gap-3">
              {treffer.map((r) => {
                const v = kochbar.get(r.id);
                return (
                  <li key={r.id}>
                    <button
                      type="button"
                      onClick={() => gehe([r.id])}
                      className="flex h-full w-full flex-col overflow-hidden rounded-2xl border bg-card text-left shadow-xs transition-transform active:scale-[0.98]"
                    >
                      <span className="relative block">
                        <RezeptBild
                          url={r.bild_url}
                          titel={r.titel}
                          className="aspect-[4/3]"
                        />
                        {r.favorit ? (
                          <span className="absolute top-2 left-2 rounded-full bg-background/85 px-1.5 py-0.5 text-sm">
                            <span aria-hidden>⭐</span>
                            <span className="sr-only">Favorit</span>
                          </span>
                        ) : null}
                      </span>
                      <span className="flex flex-1 flex-col gap-0.5 p-3">
                        <span className="leading-tight font-semibold">
                          {r.titel}
                        </span>
                        {v && (
                          <Uebereinstimmung
                            prozent={v.prozent}
                            className="mt-1"
                          />
                        )}
                        <span className="text-xs text-muted-foreground">
                          {auswahl.sortierung === "kochbar" && v
                            ? v.fehlt.length === 0
                              ? "Alles im Vorrat"
                              : `Fehlt: ${v.fehlt.join(", ")}`
                            : auswahl.sortierung === "zuletzt" &&
                                r.zuletzt_gekocht
                              ? `${r.gekocht_anzahl}× · zuletzt ${vorWann(r.zuletzt_gekocht)}`
                              : `${r.zutaten} ${r.zutaten === 1 ? "Zutat" : "Zutaten"}${r.portionen ? ` · ${r.portionen} ${r.portionen === 1 ? "Portion" : "Portionen"}` : ""}`}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}
    </div>
  );
}

function FilterChip({
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
        "shrink-0 rounded-full border px-3 py-1.5 text-sm whitespace-nowrap transition-colors",
        an
          ? "border-primary bg-primary text-primary-foreground"
          : "bg-card text-muted-foreground",
      )}
    >
      {children}
    </button>
  );
}

function monatsanfang() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString();
}
