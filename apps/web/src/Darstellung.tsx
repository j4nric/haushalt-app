import { KATEGORIEN, OHNE_KATEGORIE } from "@haushalt/db/kategorien";
import { RotateCcw } from "lucide-react";
import { KategorieSymbol } from "@/components/KategorieSymbol";
import { Button } from "@/components/ui/button";
import {
  type AppThema,
  type Einstellungen,
  einstellungenAendern,
  einstellungenZuruecksetzen,
  type KategoriePalette,
  type KategorieSchluessel,
  kategorieFarbe,
  PALETTEN,
  paletteAlsEigene,
  passendeVorschau,
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
        <Umschalter
          label="Überschriften der Kategorien"
          optionen={[
            { id: "an", name: "Mit Überschriften" },
            { id: "aus", name: "Nur Symbole" },
          ]}
          wert={e.ueberschriften ? "an" : "aus"}
          waehlen={(w) => einstellungenAendern({ ueberschriften: w === "an" })}
        />
      </div>

      <div className="space-y-3 rounded-xl border bg-card p-4">
        <h3 className="font-medium">Farbschema der App</h3>
        <ThemaWahl
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
        <PaletteWahl
          e={e}
          waehlen={(palette) =>
            einstellungenAendern(
              palette === "eigen" && e.palette !== "eigen"
                ? { palette, eigenePalette: paletteAlsEigene(e) }
                : { palette },
            )
          }
        />
        <p className="text-xs text-muted-foreground">
          {e.palette === "passend"
            ? "Kräftige Farben, abgestimmt auf das Farbschema der App."
            : e.palette === "schlicht"
              ? "Alle Kategorien in der Akzentfarbe."
              : e.palette === "gedeckt"
                ? "Zurückhaltende Töne, unabhängig vom Farbschema."
                : e.palette === "kraeftig"
                  ? "Klare, kräftige Farben, unabhängig vom Farbschema."
                  : "Jede Kategorie in einer selbst gewählten Farbe."}
        </p>
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
      <div className="space-y-3 rounded-xl border bg-card p-4">
        <h3 className="font-medium">Symbole im Vorrat</h3>
        <Umschalter
          label="Symbole im Vorrat"
          optionen={[
            { id: "produkt", name: "Je Produkt" },
            { id: "kategorie", name: "Je Kategorie" },
          ]}
          wert={e.produktsymbole ? "produkt" : "kategorie"}
          waehlen={(w) =>
            einstellungenAendern({ produktsymbole: w === "produkt" })
          }
        />
        <ul
          aria-label="Beispiele"
          className="flex justify-between gap-2 px-1 text-xs text-muted-foreground"
        >
          {BEISPIELE.map((b) => (
            <li key={b.name} className="flex flex-col items-center gap-1">
              <KategorieSymbol
                kategorie={b.kategorie}
                name={b.name}
                className="size-6"
              />
              {b.name}
            </li>
          ))}
        </ul>
        <p className="text-xs text-muted-foreground">
          Unbekanntes zeigt das Symbol seiner Kategorie.
        </p>
      </div>
      <p className="px-1 text-xs text-muted-foreground">
        Gilt nur für dieses Gerät.
      </p>
    </section>
  );
}

const BEISPIELE = [
  { name: "Käse", kategorie: "milch_kaese" },
  { name: "Baguette", kategorie: "brot_backwaren" },
  { name: "Würstchen", kategorie: "fleisch_fisch" },
  { name: "Pilze", kategorie: "obst_gemuese" },
  { name: "Klopapier", kategorie: "drogerie" },
  { name: "Waschmittel", kategorie: "haushalt" },
];

/**
 * Farbschemata als Kacheln mit Vorschau: Hintergrund, Karte mit Akzent und ein paar
 * Kategoriefarben. Die Vorschau folgt dem Gerät (hell oder dunkel).
 */
function ThemaWahl({
  wert,
  waehlen,
}: {
  wert: AppThema;
  waehlen: (id: AppThema) => void;
}) {
  return (
    <fieldset className="grid grid-cols-3 gap-2">
      <legend className="sr-only">Farbschema der App</legend>
      {THEMEN.map((t) => (
        <button
          key={t.id}
          type="button"
          aria-pressed={wert === t.id}
          onClick={() => waehlen(t.id)}
          className={cn(
            "flex flex-col gap-1.5 rounded-xl border-2 border-transparent p-1 pb-1.5 text-xs font-medium text-muted-foreground",
            wert === t.id && "border-primary text-foreground",
          )}
        >
          <ThemaVorschau farben={t.vorschau} className="dark:hidden" />
          <ThemaVorschau
            farben={t.vorschauDunkel}
            className="hidden dark:flex"
          />
          {t.name}
        </button>
      ))}
    </fieldset>
  );
}

function ThemaVorschau({
  farben,
  className,
}: {
  farben: { akzent: string; hintergrund: string; flaeche: string };
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex h-14 flex-col justify-end gap-1 rounded-lg border p-1.5",
        className,
      )}
      style={{ background: farben.hintergrund }}
    >
      <span
        className="flex items-center gap-1 rounded-md p-1"
        style={{ background: farben.flaeche }}
      >
        {passendeVorschau(farben.akzent).map((f) => (
          <span
            key={f}
            className="size-2 rounded-full"
            style={{ background: f }}
          />
        ))}
      </span>
      <span
        className="h-2 w-3/5 rounded-full"
        style={{ background: farben.akzent }}
      />
    </span>
  );
}

const VORSCHAU_KATEGORIEN = [
  "obst_gemuese",
  "milch_kaese",
  "fleisch_fisch",
  "suesses_snacks",
  "getraenke",
] as const;

/** Paletten als Kacheln mit ein paar Kategoriefarben – passt auch aufs schmale Handy. */
function PaletteWahl({
  e,
  waehlen,
}: {
  e: Einstellungen;
  waehlen: (id: KategoriePalette) => void;
}) {
  return (
    <fieldset className="grid grid-cols-3 gap-2">
      <legend className="sr-only">Farben der Kategorien</legend>
      {PALETTEN.map((p) => (
        <button
          key={p.id}
          type="button"
          aria-pressed={e.palette === p.id}
          onClick={() => waehlen(p.id)}
          className={cn(
            "flex flex-col items-center gap-1.5 rounded-xl border-2 border-transparent bg-muted px-1 py-2 text-xs font-medium text-muted-foreground",
            e.palette === p.id && "border-primary bg-card text-foreground",
          )}
        >
          <span aria-hidden className="flex gap-1">
            {VORSCHAU_KATEGORIEN.map((k) => (
              <span
                key={k}
                className="size-2.5 rounded-full"
                style={{
                  background: kategorieFarbe({ ...e, palette: p.id }, k),
                }}
              />
            ))}
          </span>
          {p.name}
        </button>
      ))}
    </fieldset>
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
