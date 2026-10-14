import { ChevronUp, Plus, SlidersHorizontal } from "lucide-react";
import { type FormEvent, type ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * Schlanke Eingabe unten am Bildschirm (Daumenbereich): Name tippen und Enter.
 * Weitere Felder (Menge, Einheit, Kategorie) klappen nur bei Bedarf auf.
 */
export function Eingabeleiste({
  wert,
  aendern,
  absenden,
  platzhalter,
  label,
  absendenLabel,
  details,
  vorschlaege,
}: {
  wert: string;
  aendern: (wert: string) => void;
  absenden: () => Promise<void> | void;
  platzhalter: string;
  label: string;
  absendenLabel: string;
  details: ReactNode;
  vorschlaege?: string[];
}) {
  const [offen, setOffen] = useState(false);

  async function senden(event: FormEvent) {
    event.preventDefault();
    if (!wert.trim()) {
      return;
    }
    await absenden();
    setOffen(false);
  }

  return (
    <form
      onSubmit={senden}
      className="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-20 border-t bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80"
    >
      <div className="mx-auto max-w-lg">
        {offen && (
          <div className="mb-3 grid grid-cols-[5rem_auto_minmax(0,1fr)] gap-2">
            {details}
          </div>
        )}
        <div className="flex gap-2">
          <Input
            value={wert}
            onChange={(e) => aendern(e.target.value)}
            placeholder={platzhalter}
            aria-label={label}
            autoComplete="off"
            enterKeyHint="done"
            list={vorschlaege ? "eingabe-vorschlaege" : undefined}
            className="h-11 text-base"
          />
          {vorschlaege && (
            <datalist id="eingabe-vorschlaege">
              {vorschlaege.map((v) => (
                <option key={v} value={v} />
              ))}
            </datalist>
          )}
          <Button
            type="button"
            variant="outline"
            size="icon"
            className={cn("size-11 shrink-0", offen && "bg-accent")}
            aria-label="Menge und Kategorie"
            aria-expanded={offen}
            onClick={() => setOffen(!offen)}
          >
            {offen ? <ChevronUp /> : <SlidersHorizontal />}
          </Button>
          <Button
            type="submit"
            size="icon"
            className="size-11 shrink-0"
            aria-label={absendenLabel}
          >
            <Plus />
          </Button>
        </div>
      </div>
    </form>
  );
}
