import { KATEGORIEN, OHNE_KATEGORIE } from "@haushalt/db/kategorien";
import { RotateCcw } from "lucide-react";
import { KategorieSymbol } from "@/components/KategorieSymbol";
import { Button } from "@/components/ui/button";
import {
  einstellungenAendern,
  einstellungenZuruecksetzen,
  type KategorieSchluessel,
  kategorieFarbe,
  PALETTEN,
  paletteAlsEigene,
  SPALTEN,
  THEMEN,
  useEinstellungen,
} from "@/einstellungen";
import { cn } from "@/lib/utils";

const ALLE_KATEGORIEN: { id: KategorieSchluessel; name: string }[] = [
  ...KATEGORIEN,
  { id: "sonstiges", name: OHNE_KATEGORIE },
];

/** Farbschema der App und Farben der Kategorien – gilt für dieses Gerät. */
export function Darstellung() {
  const e = useEinstellungen();

  return (
    <section className="space-y-4">
      <div className="flex items-baseline justify-between px-1">
        <h2 className="text-sm font-semibold text-muted-foreground">
          Darstellung
        </h2>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground"
          onClick={einstellungenZuruecksetzen}
        >
          <RotateCcw /> Zurücksetzen
        </Button>
      </div>

      <div className="space-y-3 rounded-xl border bg-card p-4">
        <h3 className="font-medium">Einkaufsliste</h3>
        <Umschalter
          label="Spalten der Einkaufsliste"
          optionen={SPALTEN}
          wert={e.spalten}
          waehlen={(spalten) => einstellungenAendern({ spalten })}
        />
        <p className="text-xs text-muted-foreground">
          Bei langen Namen werden alle Kacheln einer Kategorie gleich hoch.
        </p>
      </div>

      <div className="space-y-3 rounded-xl border bg-card p-4">
        <h3 className="font-medium">Farbschema der App</h3>
        <Umschalter
          label="Farbschema der App"
          optionen={THEMEN}
          wert={e.thema}
          waehlen={(thema) => einstellungenAendern({ thema })}
        />
        <p className="text-xs text-muted-foreground">
          {THEMEN.find((t) => t.id === e.thema)?.beschreibung}
        </p>
        {e.thema === "eigen" && (
          <div className="grid grid-cols-3 gap-2">
            {(
              [
                ["akzent", "Akzent"],
                ["hintergrund", "Hintergrund"],
                ["flaeche", "Karten"],
              ] as const
            ).map(([schluessel, name]) => (
              <FarbFeld
                key={schluessel}
                name={name}
                wert={e.eigenesThema[schluessel]}
                aendern={(farbe) =>
                  einstellungenAendern({
                    eigenesThema: { ...e.eigenesThema, [schluessel]: farbe },
                  })
                }
              />
            ))}
          </div>
        )}
      </div>

      <div className="space-y-3 rounded-xl border bg-card p-4">
        <h3 className="font-medium">Farben der Kategorien</h3>
        <Umschalter
          label="Farben der Kategorien"
          optionen={PALETTEN}
          wert={e.palette}
          waehlen={(palette) =>
            einstellungenAendern(
              palette === "eigen" && e.palette !== "eigen"
                ? { palette, eigenePalette: paletteAlsEigene(e) }
                : { palette },
            )
          }
        />
        <ul className="grid grid-cols-2 gap-x-3 gap-y-2">
          {ALLE_KATEGORIEN.map((k) => (
            <li key={k.id} className="flex items-center gap-2 text-sm">
              {e.palette === "eigen" ? (
                <input
                  type="color"
                  value={e.eigenePalette[k.id]}
                  aria-label={`Farbe ${k.name}`}
                  onChange={(ev) =>
                    einstellungenAendern({
                      eigenePalette: {
                        ...e.eigenePalette,
                        [k.id]: ev.target.value,
                      },
                    })
                  }
                  className="size-7 shrink-0 cursor-pointer rounded border-0 bg-transparent p-0"
                />
              ) : (
                <KategorieSymbol
                  kategorie={k.id === "sonstiges" ? null : k.id}
                />
              )}
              <span
                className="truncate"
                style={{
                  color: kategorieFarbe(e, k.id === "sonstiges" ? null : k.id),
                }}
              >
                {k.name}
              </span>
            </li>
          ))}
        </ul>
      </div>
      <p className="px-1 text-xs text-muted-foreground">
        Gilt nur für dieses Gerät.
      </p>
    </section>
  );
}

/** Reihe aus Knöpfen, von denen genau einer gewählt ist. */
function Umschalter<T extends string | number>({
  label,
  optionen,
  wert,
  waehlen,
}: {
  label: string;
  optionen: {
    id: T;
    name: string;
    vorschau?: { akzent: string; hintergrund: string };
  }[];
  wert: T;
  waehlen: (id: T) => void;
}) {
  return (
    <fieldset className="flex rounded-lg bg-muted p-1">
      <legend className="sr-only">{label}</legend>
      {optionen.map((o) => (
        <button
          key={o.id}
          type="button"
          aria-pressed={wert === o.id}
          onClick={() => waehlen(o.id)}
          className={cn(
            "flex-1 rounded-md px-2 py-1.5 text-sm font-medium text-muted-foreground transition-colors",
            wert === o.id && "bg-card text-foreground shadow-sm",
          )}
        >
          {o.vorschau && (
            <span
              aria-hidden
              className="mx-auto mb-1 flex size-6 items-center justify-center rounded-full border"
              style={{ background: o.vorschau.hintergrund }}
            >
              <span
                className="size-3 rounded-full"
                style={{ background: o.vorschau.akzent }}
              />
            </span>
          )}
          {o.name}
        </button>
      ))}
    </fieldset>
  );
}

function FarbFeld({
  name,
  wert,
  aendern,
}: {
  name: string;
  wert: string;
  aendern: (farbe: string) => void;
}) {
  return (
    <label className="flex flex-col items-center gap-1 rounded-lg border p-2 text-xs">
      <input
        type="color"
        value={wert}
        onChange={(ev) => aendern(ev.target.value)}
        className="h-9 w-full cursor-pointer rounded border-0 bg-transparent p-0"
      />
      {name}
    </label>
  );
}
