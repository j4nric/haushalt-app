import type { SammlungsRezept } from "./typ";

/**
 * Die ganze Startsammlung: alle `teil*.ts` (je ein Thema), zusammengeführt.
 * Wird erst geladen, wenn jemand „Entdecken“ öffnet.
 */
const teile = import.meta.glob<SammlungsRezept[]>("./teil*.ts", {
  eager: true,
  import: "default",
});

export const SAMMLUNG: SammlungsRezept[] = Object.keys(teile)
  .sort()
  .flatMap((pfad) => teile[pfad] ?? []);
