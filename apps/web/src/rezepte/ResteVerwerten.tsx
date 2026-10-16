import { findeImVorrat } from "@haushalt/db/namen";
import { useQuery } from "@powersync/react";
import { Plus, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ArtikelStand } from "@/lib/kochbar";
import { resteSuche } from "@/lib/reste";
import { ARTIKEL_STAND } from "./daten";
import { RezeptBild } from "./RezeptBild";
import { useZutatenNachRezept } from "./useKochbar";

type Rezept = { id: string; titel: string; bild_url: string | null };

const gross = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/**
 * „Ich habe noch Zucchini und Feta – was geht?“: Reste eintippen (oder aus dem Vorrat
 * antippen), passende Rezepte erscheinen – die mit den meisten Resten zuerst.
 */
export function ResteVerwerten({
  haushaltId,
  rezepte,
  reste,
  aendern,
  oeffnen,
}: {
  haushaltId: string;
  rezepte: Rezept[];
  reste: string[];
  aendern: (reste: string[]) => void;
  oeffnen: (id: string) => void;
}) {
  const zutaten = useZutatenNachRezept(haushaltId);
  const { data: artikel } = useQuery<ArtikelStand>(ARTIKEL_STAND, [haushaltId]);
  const [eingabe, setEingabe] = useState("");

  const klein = new Set(reste.map((r) => r.toLowerCase()));
  // Vorschläge: was im Vorrat liegt, noch nicht gewählt.
  const imVorrat = artikel
    .filter((a) => a.im_vorrat && a.bestand > 0 && !klein.has(a.name))
    .map((a) => gross(a.name))
    .slice(0, 10);
  // Für die Eingabe: alle Zutatennamen der Rezepte.
  const bekannteZutaten = [
    ...new Set([...zutaten.values()].flat().map((z) => gross(z.name))),
  ].sort((a, b) => a.localeCompare(b, "de"));

  // Was davon schon im Vorrat liegt, muss man nicht einkaufen.
  const vorrat = new Map(
    artikel.filter((a) => a.im_vorrat && a.bestand > 0).map((a) => [a.name, a]),
  );
  const treffer = resteSuche(
    rezepte.map((r) => ({ rezept: r, zutaten: zutaten.get(r.id) ?? [] })),
    reste,
  )
    .map((t) => ({
      ...t,
      daheim: t.fehlt.filter((n) => findeImVorrat(vorrat, n)),
      kaufen: t.fehlt.filter((n) => !findeImVorrat(vorrat, n)),
    }))
    .sort(
      (a, b) =>
        b.nutzt.length - a.nutzt.length || a.kaufen.length - b.kaufen.length,
    );

  function hinzufuegen(text: string) {
    const neu = text
      .split(/[,;]/)
      .map((t) => gross(t.trim()))
      .filter((t) => t && !klein.has(t.toLowerCase()));
    if (neu.length > 0) {
      aendern([...reste, ...neu]);
    }
    setEingabe("");
  }

  return (
    <section aria-label="Reste verwerten" className="space-y-3">
      <div className="space-y-2 rounded-2xl border bg-card p-3">
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            hinzufuegen(eingabe);
          }}
        >
          <Input
            value={eingabe}
            onChange={(e) => setEingabe(e.target.value)}
            placeholder="Was ist übrig? z. B. Zucchini"
            aria-label="Rest hinzufügen"
            list="reste-zutaten"
            autoComplete="off"
            className="h-10 rounded-full px-4 text-base"
          />
          <datalist id="reste-zutaten">
            {bekannteZutaten.map((n) => (
              <option key={n} value={n} />
            ))}
          </datalist>
          <Button
            type="submit"
            size="icon"
            className="size-10 shrink-0 rounded-full"
            aria-label="Hinzufügen"
            disabled={!eingabe.trim()}
          >
            <Plus />
          </Button>
        </form>
        {reste.length > 0 && (
          <ul aria-label="Reste" className="flex flex-wrap gap-1.5">
            {reste.map((r) => (
              <li key={r}>
                <button
                  type="button"
                  onClick={() => aendern(reste.filter((x) => x !== r))}
                  aria-label={`${r} entfernen`}
                  className="flex items-center gap-1 rounded-full bg-primary py-1 pr-2 pl-3 text-sm text-primary-foreground"
                >
                  {r} <X className="size-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
        {imVorrat.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Aus dem Vorrat:</p>
            <div className="flex flex-wrap gap-1.5">
              {imVorrat.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => hinzufuegen(n)}
                  className="rounded-full border border-dashed px-3 py-1 text-sm text-muted-foreground"
                >
                  + {n}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {reste.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          ♻️ Sag, was weg muss – die passenden Rezepte erscheinen hier.
        </p>
      ) : treffer.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Kein Rezept nutzt {reste.length === 1 ? "das" : "eins davon"} – Zeit
          für ein neues?
        </p>
      ) : (
        <ul aria-label="Passende Rezepte" className="space-y-2">
          {treffer.map(({ rezept, nutzt, daheim, kaufen }) => (
            <li key={rezept.id}>
              <button
                type="button"
                onClick={() => oeffnen(rezept.id)}
                className="flex w-full items-center gap-3 rounded-2xl border bg-card p-2 pr-3 text-left shadow-xs active:scale-[0.99]"
              >
                <RezeptBild
                  url={rezept.bild_url}
                  titel={rezept.titel}
                  className="size-16 shrink-0 rounded-xl text-3xl"
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">
                    {rezept.titel}
                  </span>
                  <span className="block text-xs text-emerald-700 dark:text-emerald-400">
                    ✓ {nutzt.join(", ")}
                    {reste.length > 1 &&
                      ` (${nutzt.length} von ${reste.length})`}
                  </span>
                  {daheim.length > 0 && (
                    <span className="block truncate text-xs text-muted-foreground">
                      Im Vorrat: {daheim.join(", ")}
                    </span>
                  )}
                  <span className="block truncate text-xs text-muted-foreground">
                    {kaufen.length === 0
                      ? "Nichts einzukaufen 🎉"
                      : `Einkaufen: ${kaufen.join(", ")}`}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
