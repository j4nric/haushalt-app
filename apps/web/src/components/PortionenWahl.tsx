import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

/** − 4 Portionen + (mindestens 1). */
export function PortionenWahl({
  wert,
  aendern,
}: {
  wert: number;
  aendern: (n: number) => void;
}) {
  return (
    <div className="flex items-center gap-1 rounded-full border bg-card p-0.5">
      <Button
        variant="ghost"
        size="icon"
        className="size-8 rounded-full"
        aria-label="Weniger Portionen"
        disabled={wert <= 1}
        onClick={() => aendern(wert - 1)}
      >
        <Minus />
      </Button>
      <span
        className="min-w-20 text-center text-sm font-medium"
        aria-live="polite"
      >
        {wert} {wert === 1 ? "Portion" : "Portionen"}
      </span>
      <Button
        variant="ghost"
        size="icon"
        className="size-8 rounded-full"
        aria-label="Mehr Portionen"
        onClick={() => aendern(wert + 1)}
      >
        <Plus />
      </Button>
    </div>
  );
}
