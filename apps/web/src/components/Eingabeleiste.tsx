import {
  KATEGORIEN,
  kategorieName,
  OHNE_KATEGORIE,
} from "@haushalt/db/kategorien";
import { Plus } from "lucide-react";
import { type FormEvent, type ReactNode, useId } from "react";
import { NativeAuswahl } from "@/components/NativeAuswahl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

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
  oben = false,
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
  /**
   * Oben unter der Kopfzeile statt unten über der Navigation – die Tastatur kann sie
   * dort nicht verdecken (Vorrat).
   */
  oben?: boolean;
}) {
  const getippt = wert.trim() !== "";
  // Liste und Vorrat bestehen gleichzeitig – die Vorschlagsliste braucht eine eigene id.
  const listenId = useId();

  const kategorieWahl =
    getippt &&
    (auswahl.length > 1 ? (
      <fieldset
        className={cn(
          "flex flex-wrap items-center gap-2",
          oben ? "mt-2" : "mb-2",
        )}
      >
        <legend className="sr-only">Sorte wählen</legend>
        <span className="text-sm text-muted-foreground">Welche Sorte?</span>
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
      <div
        className={cn(
          "flex items-center gap-2 text-sm text-muted-foreground",
          oben ? "mt-2" : "mb-2",
        )}
      >
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
    ));

  async function senden(event: FormEvent) {
    event.preventDefault();
    if (getippt) {
      await absenden(kategorie);
    }
  }

  return (
    <form
      onSubmit={senden}
      className={cn(
        "z-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80",
        oben
          ? "sticky top-14 -mx-4 border-b px-4 py-2"
          : "fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] border-t px-4 py-3 in-data-[tastatur=offen]:bottom-(--tastatur)",
      )}
    >
      <div className="mx-auto max-w-lg">
        {!oben && kategorieWahl}
        <div className="flex gap-2">
          <Input
            value={wert}
            onChange={(e) => aendern(e.target.value)}
            placeholder={platzhalter}
            aria-label={label}
            autoComplete="off"
            enterKeyHint="done"
            list={vorschlaege ? listenId : undefined}
            className="h-11 rounded-full px-4 text-base"
          />
          {vorschlaege && (
            <datalist id={listenId}>
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
        {oben && kategorieWahl}
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
