import { kategorieName } from "@haushalt/db/kategorien";
import { bestandBeschreibung } from "@haushalt/db/vorrat";
import { usePowerSync } from "@powersync/react";
import { ArrowLeft, Check, PartyPopper } from "lucide-react";
import { useState } from "react";
import { KategorieSymbol } from "@/components/KategorieSymbol";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import { angebrochenSetzen, bestandSetzen } from "../vorratsaktionen";
import { type VorratsZeile, vorratVon } from "./daten";
import { Zaehler } from "./Zaehler";

/**
 * Inventur: alle Vorratsartikel nacheinander, in Supermarkt-Reihenfolge. „Stimmt“
 * geht weiter, ein geänderter Wert wird sofort gebucht – Abbrechen verliert nichts.
 */
export function Inventur({
  offen,
  schliessen,
  zeilen,
  haushaltId,
  nutzerId,
}: {
  offen: boolean;
  schliessen: () => void;
  /** Schon sortiert. Feste Liste für die ganze Runde. */
  zeilen: VorratsZeile[];
  haushaltId: string;
  nutzerId: string;
}) {
  return (
    <Drawer open={offen} onOpenChange={(o) => !o && schliessen()}>
      <DrawerContent className="h-[80vh]">
        {offen && (
          <Runde
            zeilen={zeilen}
            schliessen={schliessen}
            haushaltId={haushaltId}
            nutzerId={nutzerId}
          />
        )}
      </DrawerContent>
    </Drawer>
  );
}

function Runde({
  zeilen: anfang,
  schliessen,
  haushaltId,
  nutzerId,
}: {
  zeilen: VorratsZeile[];
  schliessen: () => void;
  haushaltId: string;
  nutzerId: string;
}) {
  const db = usePowerSync();
  // Die Reihenfolge bleibt während der Runde gleich, auch wenn sich Bestände ändern.
  const [zeilen] = useState(anfang);
  const [index, setIndex] = useState(0);
  const [korrigiert, setKorrigiert] = useState(0);
  const zeile = zeilen[index];
  const vorher = zeile ? vorratVon(zeile) : null;
  const [wert, setWert] = useState(vorher?.bestand ?? 0);
  const [angebrochen, setAngebrochen] = useState(vorher?.angebrochen ?? false);

  function zeigen(i: number) {
    const z = zeilen[i];
    setIndex(i);
    if (z) {
      const v = vorratVon(z);
      setWert(v.bestand);
      setAngebrochen(v.angebrochen);
    }
  }

  const geaendert =
    vorher != null &&
    (wert !== vorher.bestand ||
      (angebrochen && wert > 0) !== vorher.angebrochen);

  async function weiter() {
    if (zeile && geaendert) {
      await db.writeTransaction(async (tx) => {
        await angebrochenSetzen(tx, zeile.id, angebrochen && wert > 0);
        if (wert !== vorher?.bestand) {
          await bestandSetzen(tx, {
            haushaltId,
            artikelId: zeile.id,
            neu: wert,
            nutzerId,
          });
        }
      });
      setKorrigiert((k) => k + 1);
    }
    zeigen(index + 1);
  }

  if (!zeile || !vorher) {
    return (
      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
        <PartyPopper className="size-12 text-primary" strokeWidth={1.5} />
        <DrawerTitle className="text-xl">Inventur fertig</DrawerTitle>
        <DrawerDescription>
          {zeilen.length} Artikel geprüft
          {korrigiert > 0 ? `, ${korrigiert} korrigiert` : ", alles stimmte"}.
        </DrawerDescription>
        <Button className="mt-4 h-12 rounded-full px-8" onClick={schliessen}>
          Fertig
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col">
      <DrawerHeader className="pb-0">
        <DrawerTitle>Inventur</DrawerTitle>
        <DrawerDescription>
          {index + 1} von {zeilen.length}
        </DrawerDescription>
        <div
          className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={zeilen.length}
          aria-valuenow={index}
        >
          <div
            className="h-full rounded-full bg-primary transition-[width]"
            style={{ width: `${(index / zeilen.length) * 100}%` }}
          />
        </div>
      </DrawerHeader>

      <div
        key={zeile.id}
        className="flex flex-1 flex-col items-center justify-center gap-4 px-4 text-center"
      >
        <KategorieSymbol
          kategorie={zeile.kategorie}
          name={zeile.name}
          className="size-10"
        />
        <div>
          <p className="text-xs tracking-wide text-muted-foreground uppercase">
            {kategorieName(zeile.kategorie)}
          </p>
          <h3 className="text-2xl font-semibold">{zeile.name}</h3>
          <p className="text-sm text-muted-foreground">
            {bestandBeschreibung(vorher) || (vorher.packung ? "" : "Stück")}
          </p>
        </div>
        <Zaehler
          gross
          wert={wert}
          setzen={setWert}
          label={`Bestand ${zeile.name}`}
        />
        <button
          type="button"
          aria-pressed={angebrochen && wert > 0}
          disabled={wert <= 0}
          onClick={() => setAngebrochen(!angebrochen)}
          className={cn(
            "rounded-full border px-4 py-1.5 text-sm disabled:opacity-40",
            angebrochen && wert > 0
              ? "border-primary bg-primary text-primary-foreground"
              : "bg-card text-muted-foreground",
          )}
        >
          eine ist angebrochen
        </button>
      </div>

      <div className="grid grid-cols-[auto_1fr] gap-2 p-4">
        <Button
          variant="outline"
          size="icon"
          className="size-12 rounded-full"
          aria-label="Zurück"
          disabled={index === 0}
          onClick={() => zeigen(index - 1)}
        >
          <ArrowLeft />
        </Button>
        <Button className="h-12 rounded-full text-base" onClick={weiter}>
          {geaendert ? (
            "Übernehmen und weiter"
          ) : (
            <>
              <Check /> Stimmt
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
