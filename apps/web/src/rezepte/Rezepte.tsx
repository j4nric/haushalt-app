import { useQuery } from "@powersync/react";
import { Plus, Search } from "lucide-react";
import { useState } from "react";
import { useUnterseite } from "@/Ansicht";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { produktEmoji } from "@/lib/persoenlichkeit";
import { RezeptDetail } from "./RezeptDetail";
import { RezeptEditor } from "./RezeptEditor";

type Karte = {
  id: string;
  titel: string;
  bild_url: string | null;
  portionen: number | null;
  zutaten: number;
  zutaten_namen: string | null;
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
  const [pfad, gehe] = useUnterseite();
  const [id, unterseite] = pfad;

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

function Uebersicht({
  haushaltId,
  gehe,
}: {
  haushaltId: string;
  gehe: (pfad: string[]) => void;
}) {
  const { data: rezepte, isLoading } = useQuery<Karte>(
    `SELECT r.id, r.titel, r.bild_url, r.portionen,
            (SELECT COUNT(*) FROM rezept_zutaten z WHERE z.rezept_id = r.id) AS zutaten,
            (SELECT group_concat(z.name, ' ') FROM rezept_zutaten z WHERE z.rezept_id = r.id) AS zutaten_namen
       FROM rezepte r
      WHERE r.haushalt_id = ?
      ORDER BY lower(r.titel)`,
    [haushaltId],
  );
  const [suche, setSuche] = useState("");
  // Jedes Suchwort muss im Titel oder in einer Zutat vorkommen („nudeln tomate“).
  const woerter = suche.toLowerCase().split(/\s+/).filter(Boolean);
  const treffer = rezepte.filter((r) => {
    const heuhaufen = `${r.titel} ${r.zutaten_namen ?? ""}`.toLowerCase();
    return woerter.every((w) => heuhaufen.includes(w));
  });

  if (!isLoading && rezepte.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <span aria-hidden className="text-6xl">
          📖
        </span>
        <h2 className="text-lg font-semibold">Noch keine Rezepte</h2>
        <p className="max-w-xs text-sm text-muted-foreground">
          Füge einen Link von deiner Lieblings-Rezeptseite ein oder schreib eins
          von Hand auf.
        </p>
        <Button className="mt-2 rounded-full" onClick={() => gehe(["neu"])}>
          <Plus /> Erstes Rezept
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 pt-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={suche}
            onChange={(e) => setSuche(e.target.value)}
            placeholder="Rezept oder Zutat suchen"
            aria-label="Rezepte durchsuchen"
            className="h-11 rounded-full pl-10 text-base"
          />
        </div>
        <Button
          size="icon"
          className="size-11 shrink-0 rounded-full"
          aria-label="Neues Rezept"
          onClick={() => gehe(["neu"])}
        >
          <Plus />
        </Button>
      </div>

      {treffer.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          Nichts gefunden für „{suche}“.
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-3">
          {treffer.map((r) => (
            <li key={r.id}>
              <button
                type="button"
                onClick={() => gehe([r.id])}
                className="flex h-full w-full flex-col overflow-hidden rounded-2xl border bg-card text-left shadow-xs transition-transform active:scale-[0.98]"
              >
                <RezeptBild
                  url={r.bild_url}
                  titel={r.titel}
                  className="aspect-[4/3]"
                />
                <span className="flex flex-1 flex-col gap-0.5 p-3">
                  <span className="leading-tight font-semibold">{r.titel}</span>
                  <span className="text-xs text-muted-foreground">
                    {r.zutaten} Zutaten
                    {r.portionen ? ` · ${r.portionen} Portionen` : ""}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** Emoji passend zum Titel („Spaghetti …“ → 🍝), sonst eine Pfanne. */
export function rezeptEmoji(titel: string) {
  const emoji = produktEmoji(titel, null);
  return emoji === "🛍️" ? "🍳" : emoji;
}

/**
 * Bild des Rezepts; ohne Bild (oder wenn es nicht lädt, z. B. offline und nie
 * zwischengespeichert) eine farbige Fläche mit Emoji.
 */
export function RezeptBild({
  url,
  titel,
  className,
}: {
  url: string | null;
  titel: string;
  className?: string;
}) {
  const [kaputt, setKaputt] = useState(false);
  if (url && !kaputt) {
    return (
      <img
        src={url}
        alt=""
        loading="lazy"
        referrerPolicy="no-referrer"
        onError={() => setKaputt(true)}
        className={`w-full bg-muted object-cover ${className ?? ""}`}
      />
    );
  }
  return (
    <span
      aria-hidden
      className={`flex w-full items-center justify-center text-5xl ${className ?? ""}`}
      style={{
        background:
          "linear-gradient(135deg, color-mix(in oklab, var(--primary) 18%, var(--card)), color-mix(in oklab, #f59e0b 22%, var(--card)))",
      }}
    >
      {rezeptEmoji(titel)}
    </span>
  );
}
