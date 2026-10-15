import {
  KATEGORIEN,
  kategorieName,
  OHNE_KATEGORIE,
} from "@haushalt/db/kategorien";
import { Plus } from "lucide-react";
import type { FormEvent, ReactNode } from "react";
import { NativeAuswahl } from "@/components/NativeAuswahl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/**
 * Schlanke Eingabe unten am Bildschirm (Daumenbereich): Name tippen und Enter.
 *
 * Darüber erscheint, sobald etwas getippt ist, die Kategorie:
 * - eindeutig erkannt oder unbekannt → kleine Auswahl, vorbelegt, änderbar
 * - mehrdeutig (z. B. Heidelbeeren frisch/tiefgekühlt) → Knöpfe, ein Tipp trägt ein
 */
export function Eingabeleiste({
  wert,
  aendern,
  absenden,
  platzhalter,
  label,
  absendenLabel,
  kategorie,
  kategorieAendern,
  auswahl,
  vorschlaege,
  zusatz,
}: {
  wert: string;
  aendern: (wert: string) => void;
  /** Trägt mit der angegebenen Kategorie ein ("" = Sonstiges). */
  absenden: (kategorie: string) => Promise<void> | void;
  platzhalter: string;
  label: string;
  absendenLabel: string;
  /** Weiterer Knopf neben „+“ (z. B. Barcode scannen). */
  zusatz?: ReactNode;
  /** Vorbelegte bzw. gewählte Kategorie ("" = Sonstiges). */
  kategorie: string;
  kategorieAendern: (kategorie: string) => void;
  /** Mehrere passende Kategorien: als Knöpfe anbieten statt der Auswahl. */
  auswahl: string[];
  vorschlaege?: string[];
}) {
  const getippt = wert.trim() !== "";

  async function senden(event: FormEvent) {
    event.preventDefault();
    if (getippt) {
      await absenden(kategorie);
    }
  }

  return (
    <form
      onSubmit={senden}
      className="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-20 border-t in-data-[tastatur=offen]:bottom-(--tastatur) bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80"
      // Bleibt beim Seitenwechsel stehen statt mitzugleiten (siehe index.css).
      style={{ viewTransitionName: "eingabe" }}
    >
      <div className="mx-auto max-w-lg">
        {getippt &&
          (auswahl.length > 1 ? (
            <fieldset className="mb-2 flex flex-wrap items-center gap-2">
              <legend className="sr-only">Sorte wählen</legend>
              <span className="text-sm text-muted-foreground">
                Welche Sorte?
              </span>
              {auswahl.map((k) => (
                <Button
                  key={k}
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => absenden(k)}
                >
                  {kategorieName(k)}
                </Button>
              ))}
            </fieldset>
          ) : (
            <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
              <span>Kategorie</span>
              <NativeAuswahl
                value={kategorie}
                onChange={(e) => kategorieAendern(e.target.value)}
                aria-label="Kategorie"
                className="h-8 px-2 text-sm"
              >
                <option value="">{OHNE_KATEGORIE}</option>
                {KATEGORIEN.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.name}
                  </option>
                ))}
              </NativeAuswahl>
            </div>
          ))}
        <div className="flex gap-2">
          <Input
            value={wert}
            onChange={(e) => aendern(e.target.value)}
            placeholder={platzhalter}
            aria-label={label}
            autoComplete="off"
            enterKeyHint="done"
            list={vorschlaege ? "eingabe-vorschlaege" : undefined}
            className="h-11 rounded-full px-4 text-base"
          />
          {vorschlaege && (
            <datalist id="eingabe-vorschlaege">
              {vorschlaege.map((v) => (
                <option key={v} value={v} />
              ))}
            </datalist>
          )}
          {zusatz}
          <Button
            type="submit"
            size="icon"
            className="size-11 shrink-0 rounded-full"
            aria-label={absendenLabel}
          >
            <Plus />
          </Button>
        </div>
      </div>
    </form>
  );
}

/**
 * Kategorie-Vorschlag für einen getippten Namen: Kennt der Haushalt den Artikel,
 * gilt dessen Kategorie; sonst die Erkennung aus der Tabelle. Eine von Hand
 * gewählte Kategorie hat immer Vorrang.
 */
export function kategorieVorschlag(
  bekannteKategorie: string | null | undefined,
  erkannt: string[],
  manuell: string | null,
): { kategorie: string; auswahl: string[] } {
  if (manuell != null) {
    return { kategorie: manuell, auswahl: [] };
  }
  if (bekannteKategorie) {
    return { kategorie: bekannteKategorie, auswahl: [] };
  }
  return {
    kategorie: erkannt[0] ?? "",
    auswahl: erkannt.length > 1 ? erkannt : [],
  };
}
