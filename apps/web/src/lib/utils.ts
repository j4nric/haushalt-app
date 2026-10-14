import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Tailwind-Klassen zusammenführen; spätere überschreiben frühere (shadcn-Konvention). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
