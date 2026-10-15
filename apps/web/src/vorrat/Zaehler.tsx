import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { stueck } from "./daten";

/** −  Zahl  + ; die Zahl lässt sich auch eintippen. */
export function Zaehler({
  wert,
  setzen,
  label,
  leer,
  gross = false,
}: {
  wert: number;
  setzen: (wert: number) => void;
  /** Für Screenreader und Tests, z. B. „Bestand Milch“. */
  label: string;
  /** Text statt 0, z. B. „keiner“. */
  leer?: string;
  gross?: boolean;
}) {
  const knopf = gross ? "size-14" : "size-10";
  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="icon"
        className={cn(knopf, "rounded-full")}
        aria-label={`${label} weniger`}
        disabled={wert <= 0}
        onClick={() => setzen(Math.max(0, Math.ceil(wert) - 1))}
      >
        <Minus />
      </Button>
      <input
        aria-label={label}
        inputMode="decimal"
        value={wert === 0 && leer ? "" : stueck(wert)}
        placeholder={leer}
        onFocus={(e) => e.currentTarget.select()}
        onChange={(e) => {
          const roh = e.target.value.trim().replace(",", ".");
          const zahl = roh === "" ? 0 : Number(roh);
          if (Number.isFinite(zahl) && zahl >= 0) {
            setzen(zahl);
          }
        }}
        className={cn(
          "w-16 rounded-md bg-transparent text-center font-medium tabular-nums outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
          gross ? "text-4xl" : "text-xl",
        )}
      />
      <Button
        type="button"
        variant="outline"
        size="icon"
        className={cn(knopf, "rounded-full")}
        aria-label={`${label} mehr`}
        onClick={() => setzen(Math.floor(wert) + 1)}
      >
        <Plus />
      </Button>
    </div>
  );
}
