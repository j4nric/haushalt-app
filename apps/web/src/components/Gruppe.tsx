import type { ReactNode } from "react";

/** Überschrift einer Kategorie mit den zugehörigen Zeilen. */
export function Gruppe({
  titel,
  aktion,
  children,
}: {
  titel: string;
  aktion?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="mt-5 first:mt-2">
      <h3 className="flex items-baseline justify-between px-1 pb-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        {titel}
        {aktion}
      </h3>
      <ul className="divide-y overflow-hidden rounded-xl border bg-card">
        {children}
      </ul>
    </section>
  );
}
