import { cn } from "@/lib/utils";

/**
 * Wie viel eines Rezepts im Vorrat ist – als farbiger Balken: rot bis wenig,
 * gelb bis zur Hälfte und mehr, grün wenn (fast) alles da ist.
 */
export function Uebereinstimmung({
  prozent,
  className,
}: {
  prozent: number;
  className?: string;
}) {
  const farbe =
    prozent >= 80
      ? "bg-primary"
      : prozent >= 40
        ? "bg-warning"
        : "bg-destructive/70";
  return (
    <span className={cn("flex items-center gap-2", className)}>
      <span
        aria-hidden
        className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted"
      >
        <span
          className={cn("block h-full rounded-full transition-[width]", farbe)}
          style={{ width: `${Math.max(prozent, 4)}%` }}
        />
      </span>
      <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
        {prozent} %<span className="sr-only"> im Vorrat</span>
      </span>
    </span>
  );
}
