import type { Kategorie } from "@haushalt/db/kategorien";
import { useSyncExternalStore } from "react";
import { istDunkel, istHexFarbe, textFarbeAuf } from "@/lib/farben";

/**
 * Darstellungs-Einstellungen dieses Geräts (nicht des Haushalts): Farbschema der App
 * und Farben der Kategorien. Gespeichert im Browser; fehlt der Speicher (privater
 * Modus), gelten die Voreinstellungen.
 */

export type KategorieSchluessel = Kategorie | "sonstiges";

export type AppThema = "system" | "frisch" | "ozean" | "eigen";
export type KategoriePalette = "kraeftig" | "gedeckt" | "schlicht" | "eigen";

export type Einstellungen = {
  thema: AppThema;
  eigenesThema: { akzent: string; hintergrund: string; flaeche: string };
  palette: KategoriePalette;
  eigenePalette: Record<KategorieSchluessel, string>;
};

type Farben = { akzent: string; hintergrund: string; flaeche: string };

/** Vorgegebene Farbschemata, jeweils für hell und dunkel (folgt dem Gerät). */
const VORGABEN: Record<
  Exclude<AppThema, "eigen">,
  { hell: Farben; dunkel: Farben }
> = {
  system: {
    hell: { akzent: "#18181b", hintergrund: "#fafafa", flaeche: "#ffffff" },
    dunkel: { akzent: "#f4f4f5", hintergrund: "#09090b", flaeche: "#18181b" },
  },
  frisch: {
    hell: { akzent: "#15803d", hintergrund: "#eef7f0", flaeche: "#ffffff" },
    dunkel: { akzent: "#4ade80", hintergrund: "#0b1a11", flaeche: "#122519" },
  },
  ozean: {
    hell: { akzent: "#2563eb", hintergrund: "#eaf2fd", flaeche: "#ffffff" },
    dunkel: { akzent: "#60a5fa", hintergrund: "#0a1426", flaeche: "#101e38" },
  },
};

export const THEMEN: {
  id: AppThema;
  name: string;
  beschreibung: string;
  vorschau: Farben;
}[] = [
  {
    id: "system",
    name: "System",
    beschreibung: "Neutral in Schwarz und Weiß, hell oder dunkel wie das Gerät",
    vorschau: VORGABEN.system.hell,
  },
  {
    id: "frisch",
    name: "Frisch",
    beschreibung: "Grün auf zartem Mint, hell oder dunkel wie das Gerät",
    vorschau: VORGABEN.frisch.hell,
  },
  {
    id: "ozean",
    name: "Ozean",
    beschreibung: "Blau auf hellem Himmelblau, hell oder dunkel wie das Gerät",
    vorschau: VORGABEN.ozean.hell,
  },
  {
    id: "eigen",
    name: "Eigene",
    beschreibung:
      "Akzent, Hintergrund und Karten selbst wählen – gilt immer, auch im Dunkelmodus",
    vorschau: { akzent: "#c2410c", hintergrund: "#1c1917", flaeche: "#292524" },
  },
];

export const PALETTEN: { id: KategoriePalette; name: string }[] = [
  { id: "kraeftig", name: "Kräftig" },
  { id: "gedeckt", name: "Gedeckt" },
  { id: "schlicht", name: "Schlicht" },
  { id: "eigen", name: "Eigene" },
];

/** Gut lesbar auf hellem wie dunklem Hintergrund (mittlere Helligkeit). */
const KRAEFTIG: Record<KategorieSchluessel, string> = {
  obst_gemuese: "#16a34a",
  brot_backwaren: "#c2410c",
  milch_kaese: "#0284c7",
  fleisch_fisch: "#dc2626",
  vorrat: "#a16207",
  suesses_snacks: "#db2777",
  getraenke: "#0891b2",
  tiefkuehl: "#4f46e5",
  drogerie: "#9333ea",
  haushalt: "#0d9488",
  sonstiges: "#6b7280",
};

const GEDECKT: Record<KategorieSchluessel, string> = {
  obst_gemuese: "#5b8a5f",
  brot_backwaren: "#a0704a",
  milch_kaese: "#5a7f9e",
  fleisch_fisch: "#a65d5a",
  vorrat: "#8c7a4c",
  suesses_snacks: "#a3667f",
  getraenke: "#4f8a8f",
  tiefkuehl: "#64709e",
  drogerie: "#82699c",
  haushalt: "#5f8a80",
  sonstiges: "#7a7d80",
};

const STANDARD: Einstellungen = {
  thema: "frisch",
  eigenesThema: {
    akzent: "#15803d",
    hintergrund: "#f7f7f5",
    flaeche: "#ffffff",
  },
  palette: "kraeftig",
  eigenePalette: { ...KRAEFTIG },
};

const SCHLUESSEL = "haushalt-einstellungen";

/** CSS-Farbe einer Kategorie; „Schlicht“ nutzt die Akzentfarbe der App. */
export function kategorieFarbe(
  e: Einstellungen,
  kategorie: string | null | undefined,
): string {
  const k = (
    kategorie && kategorie in KRAEFTIG ? kategorie : "sonstiges"
  ) as KategorieSchluessel;
  switch (e.palette) {
    case "schlicht":
      return k === "sonstiges" ? "var(--muted-foreground)" : "var(--primary)";
    case "gedeckt":
      return GEDECKT[k];
    case "eigen":
      return e.eigenePalette[k];
    default:
      return KRAEFTIG[k];
  }
}

/** Startwerte für „Eigene“: die gerade sichtbaren Farben übernehmen. */
export function paletteAlsEigene(
  e: Einstellungen,
): Record<KategorieSchluessel, string> {
  if (e.palette === "gedeckt") {
    return { ...GEDECKT };
  }
  if (e.palette === "eigen") {
    return { ...e.eigenePalette };
  }
  return { ...KRAEFTIG };
}

// --- Speicher -------------------------------------------------------------------

let aktuell: Einstellungen = laden();
const beobachter = new Set<() => void>();

function laden(): Einstellungen {
  try {
    const roh = JSON.parse(localStorage.getItem(SCHLUESSEL) ?? "null");
    if (!roh || typeof roh !== "object") {
      return STANDARD;
    }
    const thema = THEMEN.some((t) => t.id === roh.thema)
      ? roh.thema
      : STANDARD.thema;
    const palette = PALETTEN.some((p) => p.id === roh.palette)
      ? roh.palette
      : STANDARD.palette;
    const eigenesThema = { ...STANDARD.eigenesThema };
    for (const k of Object.keys(
      eigenesThema,
    ) as (keyof typeof eigenesThema)[]) {
      if (istHexFarbe(roh.eigenesThema?.[k])) {
        eigenesThema[k] = roh.eigenesThema[k];
      }
    }
    const eigenePalette = { ...STANDARD.eigenePalette };
    for (const k of Object.keys(eigenePalette) as KategorieSchluessel[]) {
      if (istHexFarbe(roh.eigenePalette?.[k])) {
        eigenePalette[k] = roh.eigenePalette[k];
      }
    }
    return { thema, palette, eigenesThema, eigenePalette };
  } catch {
    return STANDARD;
  }
}

export function einstellungenAendern(aenderung: Partial<Einstellungen>) {
  aktuell = { ...aktuell, ...aenderung };
  try {
    localStorage.setItem(SCHLUESSEL, JSON.stringify(aktuell));
  } catch {
    // Ohne Speicher gilt die Änderung bis zum Neuladen.
  }
  themaAnwenden(aktuell);
  for (const b of beobachter) {
    b();
  }
}

export function einstellungenZuruecksetzen() {
  einstellungenAendern(STANDARD);
}

export function useEinstellungen(): Einstellungen {
  return useSyncExternalStore(
    (b) => {
      beobachter.add(b);
      return () => beobachter.delete(b);
    },
    () => aktuell,
  );
}

// --- Farbschema anwenden --------------------------------------------------------

/**
 * Überschreibt die Farbvariablen aus index.css über ein eigenes <style>-Element.
 * `:root:root` gewinnt gegen die Regeln in index.css, auch gegen deren Dunkelmodus.
 */
export function themaAnwenden(e: Einstellungen = aktuell) {
  let style = document.getElementById("app-thema") as HTMLStyleElement | null;
  if (!style) {
    style = document.createElement("style");
    style.id = "app-thema";
    document.head.append(style);
  }
  style.textContent = themaCss(e);
  const dunkel = matchMedia("(prefers-color-scheme: dark)").matches;
  const farben =
    e.thema === "eigen"
      ? e.eigenesThema
      : VORGABEN[e.thema][dunkel ? "dunkel" : "hell"];
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", farben.hintergrund);
}

// Wechselt das Gerät zwischen hell und dunkel, die Farbe der Statusleiste nachziehen.
matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () =>
  themaAnwenden(),
);

function themaCss(e: Einstellungen): string {
  if (e.thema === "eigen") {
    return `:root:root {${farbenCss(e.eigenesThema)}}`;
  }
  const { hell, dunkel } = VORGABEN[e.thema];
  return `:root:root {${farbenCss(hell)}}
@media (prefers-color-scheme: dark) { :root:root {${farbenCss(dunkel)}} }`;
}

/** Alle Farbvariablen aus drei Grundfarben; Text nach Kontrast, Zwischentöne per color-mix. */
function farbenCss({ akzent, hintergrund, flaeche }: Farben) {
  const text = textFarbeAuf(hintergrund);
  const textFlaeche = textFarbeAuf(flaeche);
  return `
    color-scheme: ${istDunkel(hintergrund) ? "dark" : "light"};
    --background: ${hintergrund};
    --foreground: ${text};
    --card: ${flaeche};
    --card-foreground: ${textFlaeche};
    --popover: ${flaeche};
    --popover-foreground: ${textFlaeche};
    --primary: ${akzent};
    --primary-foreground: ${textFarbeAuf(akzent)};
    --ring: ${akzent};
    --muted: color-mix(in oklab, ${hintergrund}, ${text} 6%);
    --muted-foreground: color-mix(in oklab, ${text} 60%, ${hintergrund});
    --border: color-mix(in oklab, ${hintergrund}, ${text} 12%);
    --input: color-mix(in oklab, ${hintergrund}, ${text} 20%);
    --secondary: color-mix(in oklab, ${hintergrund}, ${akzent} 14%);
    --secondary-foreground: color-mix(in oklab, ${text} 80%, ${akzent});
    --accent: color-mix(in oklab, ${hintergrund}, ${akzent} 16%);
    --accent-foreground: ${text};`;
}
