import type { Kategorie } from "@haushalt/db/kategorien";
import { useSyncExternalStore } from "react";
import {
  harmonisieren,
  istDunkel,
  istHexFarbe,
  textFarbeAuf,
} from "@/lib/farben";

/**
 * Darstellungs-Einstellungen dieses Geräts (nicht des Haushalts): Farbschema der App
 * und Farben der Kategorien. Gespeichert im Browser; fehlt der Speicher (privater
 * Modus), gelten die Voreinstellungen.
 */

export type KategorieSchluessel = Kategorie | "sonstiges";

export type AppThema =
  | "system"
  | "frisch"
  | "ozean"
  | "petrol"
  | "salbei"
  | "senf"
  | "terrakotta"
  | "beere"
  | "lavendel"
  | "schiefer"
  | "mitternacht"
  | "eigen";
export type KategoriePalette =
  | "passend"
  | "kraeftig"
  | "gedeckt"
  | "schlicht"
  | "eigen";

export type Einstellungen = {
  thema: AppThema;
  eigenesThema: { akzent: string; hintergrund: string; flaeche: string };
  palette: KategoriePalette;
  eigenePalette: Record<KategorieSchluessel, string>;
  /** Spalten der Einkaufsliste (Kacheln pro Zeile). */
  spalten: Spalten;
  /** Überschriften der Kategorien in der Einkaufsliste zeigen (sonst nur Symbol). */
  ueberschriften: boolean;
  /** Im Vorrat ein Symbol je Produkt („Käse“) statt nur je Kategorie. */
  produktsymbole: boolean;
};

export type Spalten = 1 | 2 | 3;

export const SPALTEN: { id: Spalten; name: string }[] = [
  { id: 1, name: "1 Spalte" },
  { id: 2, name: "2 Spalten" },
  { id: 3, name: "3 Spalten" },
];

type Farben = { akzent: string; hintergrund: string; flaeche: string };

/**
 * Vorgegebene Farbschemata, jeweils für hell und dunkel (folgt dem Gerät).
 * Akzent, Hintergrund und Karten stammen aus derselben Farbfamilie; der Akzent
 * erreicht auf dem Hintergrund mindestens 4,5 : 1 (lesbarer Text und Symbole).
 */
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
  petrol: {
    hell: { akzent: "#0f766e", hintergrund: "#ecf6f5", flaeche: "#ffffff" },
    dunkel: { akzent: "#2dd4bf", hintergrund: "#071a19", flaeche: "#0e2725" },
  },
  salbei: {
    hell: { akzent: "#4d6b47", hintergrund: "#f3f2ea", flaeche: "#fcfbf7" },
    dunkel: { akzent: "#a3bf9b", hintergrund: "#141712", flaeche: "#1f241c" },
  },
  senf: {
    hell: { akzent: "#9a5b00", hintergrund: "#fbf6e6", flaeche: "#fffdf6" },
    dunkel: { akzent: "#f5c04a", hintergrund: "#18140a", flaeche: "#251f10" },
  },
  terrakotta: {
    hell: { akzent: "#b4441c", hintergrund: "#faf1ea", flaeche: "#fffaf6" },
    dunkel: { akzent: "#f4895a", hintergrund: "#1b110c", flaeche: "#2a1a12" },
  },
  beere: {
    hell: { akzent: "#be185d", hintergrund: "#fcf0f5", flaeche: "#ffffff" },
    dunkel: { akzent: "#f472b6", hintergrund: "#1d0c15", flaeche: "#2b1420" },
  },
  lavendel: {
    hell: { akzent: "#6d3fd0", hintergrund: "#f4f2fd", flaeche: "#ffffff" },
    dunkel: { akzent: "#b39dfa", hintergrund: "#120f22", flaeche: "#1d1833" },
  },
  schiefer: {
    hell: { akzent: "#3f5873", hintergrund: "#eff2f5", flaeche: "#ffffff" },
    dunkel: { akzent: "#9fb6cf", hintergrund: "#0e1319", flaeche: "#18202a" },
  },
  // Immer dunkel: Nachtblau mit warmem Gold.
  mitternacht: {
    hell: { akzent: "#f2b84b", hintergrund: "#0b1020", flaeche: "#151c33" },
    dunkel: { akzent: "#f2b84b", hintergrund: "#0b1020", flaeche: "#151c33" },
  },
};

const THEMEN_TEXTE: { id: AppThema; name: string; beschreibung: string }[] = [
  {
    id: "system",
    name: "System",
    beschreibung: "Neutral in Schwarz und Weiß, hell oder dunkel wie das Gerät",
  },
  {
    id: "frisch",
    name: "Frisch",
    beschreibung: "Grün auf zartem Mint, hell oder dunkel wie das Gerät",
  },
  {
    id: "ozean",
    name: "Ozean",
    beschreibung: "Blau auf hellem Himmelblau, hell oder dunkel wie das Gerät",
  },
  {
    id: "petrol",
    name: "Petrol",
    beschreibung:
      "Tiefes Blaugrün auf kühlem Weiß, hell oder dunkel wie das Gerät",
  },
  {
    id: "salbei",
    name: "Salbei",
    beschreibung: "Gedecktes Kräutergrün auf Leinen, ruhig und natürlich",
  },
  {
    id: "senf",
    name: "Senf",
    beschreibung: "Warmes Senfgelb auf Creme, hell oder dunkel wie das Gerät",
  },
  {
    id: "terrakotta",
    name: "Terrakotta",
    beschreibung: "Gebrannte Erde auf Sand – warm wie eine Landküche",
  },
  {
    id: "beere",
    name: "Beere",
    beschreibung: "Himbeerrot auf zartem Rosé, hell oder dunkel wie das Gerät",
  },
  {
    id: "lavendel",
    name: "Lavendel",
    beschreibung: "Violett auf hellem Flieder, hell oder dunkel wie das Gerät",
  },
  {
    id: "schiefer",
    name: "Schiefer",
    beschreibung: "Kühles Blaugrau, schlicht und sachlich",
  },
  {
    id: "mitternacht",
    name: "Mitternacht",
    beschreibung: "Immer dunkel: Nachtblau mit warmem Gold",
  },
  {
    id: "eigen",
    name: "Eigene",
    beschreibung:
      "Akzent, Hintergrund und Karten selbst wählen – gilt immer, auch im Dunkelmodus",
  },
];

export const THEMEN: {
  id: AppThema;
  name: string;
  beschreibung: string;
  vorschau: Farben;
  vorschauDunkel: Farben;
}[] = THEMEN_TEXTE.map((t) => {
  const eigen = {
    akzent: "#c2410c",
    hintergrund: "#1c1917",
    flaeche: "#292524",
  };
  return {
    ...t,
    vorschau: t.id === "eigen" ? eigen : VORGABEN[t.id].hell,
    vorschauDunkel: t.id === "eigen" ? eigen : VORGABEN[t.id].dunkel,
  };
});

export const PALETTEN: { id: KategoriePalette; name: string }[] = [
  { id: "passend", name: "Passend" },
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
  spalten: 2,
  ueberschriften: true,
  produktsymbole: true,
  eigenesThema: {
    akzent: "#15803d",
    hintergrund: "#f7f7f5",
    flaeche: "#ffffff",
  },
  palette: "passend",
  eigenePalette: { ...KRAEFTIG },
};

const SCHLUESSEL = "haushalt-einstellungen";

/** Akzent des gewählten Schemas (helle Variante), Bezugspunkt fürs Angleichen. */
function themaAkzent(e: Einstellungen): string {
  return e.thema === "eigen"
    ? e.eigenesThema.akzent
    : VORGABEN[e.thema].hell.akzent;
}

const angeglichen = new Map<string, string>();
function passend(farbe: string, akzent: string, anteil = 0.16): string {
  const schluessel = `${farbe}${akzent}${anteil}`;
  let wert = angeglichen.get(schluessel);
  if (!wert) {
    wert = harmonisieren(farbe, akzent, anteil);
    angeglichen.set(schluessel, wert);
  }
  return wert;
}

/**
 * CSS-Farbe einer Kategorie. „Passend“ rückt die kräftigen Farben zum Akzent des
 * Farbschemas hin; „Schlicht“ nutzt die Akzentfarbe selbst.
 */
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
    case "passend":
      return passend(KRAEFTIG[k], themaAkzent(e));
    default:
      return KRAEFTIG[k];
  }
}

/** Ein paar Kategoriefarben, wie „Passend“ sie zum Akzent zeigt (Vorschau). */
export function passendeVorschau(akzent: string): string[] {
  return (
    ["obst_gemuese", "milch_kaese", "suesses_snacks", "brot_backwaren"] as const
  ).map((k) => passend(KRAEFTIG[k], akzent));
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
  if (e.palette === "passend") {
    const akzent = themaAkzent(e);
    return Object.fromEntries(
      Object.entries(KRAEFTIG).map(([k, f]) => [k, passend(f, akzent)]),
    ) as Record<KategorieSchluessel, string>;
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
    const spalten = SPALTEN.some((o) => o.id === roh.spalten)
      ? roh.spalten
      : STANDARD.spalten;
    const ueberschriften =
      typeof roh.ueberschriften === "boolean"
        ? roh.ueberschriften
        : STANDARD.ueberschriften;
    const produktsymbole =
      typeof roh.produktsymbole === "boolean"
        ? roh.produktsymbole
        : STANDARD.produktsymbole;
    return {
      thema,
      palette,
      eigenesThema,
      eigenePalette,
      spalten,
      ueberschriften,
      produktsymbole,
    };
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

/**
 * Signalfarben (erledigt, knapp, löschen, tiefgekühlt, Favorit), je für hellen und
 * dunklen Hintergrund. Sie bleiben erkennbar, rücken aber leicht zum Akzent hin.
 */
const SIGNALE = {
  hell: {
    erfolg: "#15803d",
    warnung: "#c26a00",
    warnungText: "#7a3f00",
    gefahr: "#dc2626",
    frost: "#0369a1",
    favorit: "#d98a00",
  },
  dunkel: {
    erfolg: "#4ade80",
    warnung: "#f5b544",
    warnungText: "#fbe2b0",
    gefahr: "#f87171",
    frost: "#38bdf8",
    favorit: "#fbbf24",
  },
};

function signaleCss(akzent: string, dunkel: boolean) {
  const s = SIGNALE[dunkel ? "dunkel" : "hell"];
  const p = (farbe: string) => passend(farbe, akzent, 0.1);
  return `
    --erfolg: ${p(s.erfolg)};
    --warning: ${p(s.warnung)};
    --warning-foreground: ${p(s.warnungText)};
    --destructive: ${p(s.gefahr)};
    --frost: ${p(s.frost)};
    --favorit: ${p(s.favorit)};`;
}

/** Alle Farbvariablen aus drei Grundfarben; Text nach Kontrast, Zwischentöne per color-mix. */
function farbenCss({ akzent, hintergrund, flaeche }: Farben) {
  const text = textFarbeAuf(hintergrund);
  const textFlaeche = textFarbeAuf(flaeche);
  return `${signaleCss(akzent, istDunkel(hintergrund))}
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
