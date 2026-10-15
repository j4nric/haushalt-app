/**
 * Ein Rezept der mitgelieferten Startsammlung („Entdecken“). Selbst geschrieben, keine
 * fremden Inhalte. Immer für 2 Portionen. Zutaten und Gewürze im selben Textformat wie
 * im Rezept-Editor: eine Zutat je Zeile, optionale in Klammern.
 */
export type SammlungsRezept = {
  /** Stabil und eindeutig, klein mit Bindestrichen: „spaghetti-bolognese“. */
  id: string;
  titel: string;
  /** Gesamtzeit in Minuten (inkl. Garzeit). */
  dauer: number;
  /** Aus SCHLAGWOERTER, 2–5 Stück. */
  schlagwoerter: Schlagwort[];
  /** Monate (1–12), in denen das Gericht besonders passt; leer = ganzjährig. */
  saison: number[];
  /** Eine Zutat je Zeile mit Menge für 2 Portionen, z. B. „200 g Spaghetti“. */
  zutaten: string;
  /** Gewürze und Kräuter, Mengen optional. */
  gewuerze: string;
  /**
   * Ein Schritt je Zeile, kurz und klar. Garzeiten immer als Zahl mit Einheit
   * („20 Minuten köcheln“, „8–10 Minuten“, „1 Stunde“) – daraus werden im Kochmodus
   * Timer. Nicht „nach Packungsangabe“.
   */
  schritte: string;
};

export const SCHLAGWOERTER = [
  "vegetarisch",
  "vegan",
  "fleisch",
  "geflügel",
  "fisch",
  "pasta",
  "reis",
  "kartoffeln",
  "suppe",
  "eintopf",
  "ofen",
  "pfanne",
  "salat",
  "kinder",
  "klassiker",
  "deftig",
  "leicht",
  "süß",
  "mealprep",
  "italienisch",
  "asiatisch",
  "orientalisch",
  "mexikanisch",
  "mediterran",
] as const;

export type Schlagwort = (typeof SCHLAGWOERTER)[number];
