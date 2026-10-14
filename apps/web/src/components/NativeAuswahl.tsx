import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/**
 * Natives <select> im Stil der übrigen Felder. Auf dem Handy öffnet es die
 * gewohnte System-Auswahl, die sich mit dem Daumen am besten bedienen lässt.
 */
export function NativeAuswahl({
  className,
  ...props
}: ComponentProps<"select">) {
  return (
    <select
      className={cn(
        "h-11 min-w-0 rounded-md border border-input bg-transparent px-3 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:bg-input/30",
        className,
      )}
      {...props}
    />
  );
}
