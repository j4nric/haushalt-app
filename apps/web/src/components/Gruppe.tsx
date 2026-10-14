import type { ReactNode } from "react";
import { useKategorieFarbe } from "./KategorieSymbol";

/**
 * Überschrift mit den zugehörigen Zeilen. Mit `kategorie` erscheint die Überschrift
 * in der Kategoriefarbe mit Symbol; ohne (z. B. „Im Wagen“) neutral.
 */
export function Gruppe({
  titel,
  kategorie,
  aktion,
  children,
}: {
  titel: string;
  kategorie?: string | null;
  aktion?: ReactNode;
  children: ReactNode;
}) {
  const farbe = useKategorieFarbe(kategorie);
  return (
    <section className="mt-5 first:mt-2">
      <h3
        className="flex items-center gap-2 px-1 pb-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase"
        style={kategorie !== undefined ? { color: farbe } : undefined}
      >
        <span className="flex-1">{titel}</span>
        {aktion}
      </h3>
      <ul className="divide-y overflow-hidden rounded-xl border bg-card">
        {children}
      </ul>
    </section>
  );
}
