import type { Einheit } from "./einheiten";

/**
 * Zutaten aus Rezepten: aus einer Textzeile („2 EL Olivenöl, kalt gepresst“) wird
 * Menge, Einheit, Name und Zusatz. Gilt für Eingaben von Hand wie für importierte
 * Rezepte. Lieber einmal zu wenig erkannt als falsch: Was nicht passt, bleibt Name.
 */

export type Zutat = {
  menge: number | null;
  /** Anzeige-Einheit, z. B. „g“, „EL“, „Dose“; `null` = einfach Stück/ohne. */
  einheit: string | null;
  name: string;
  zusatz: string | null;
};

const BRUECHE: Record<string, number> = {
  "½": 1 / 2,
  "¼": 1 / 4,
  "¾": 3 / 4,
  "⅓": 1 / 3,
  "⅔": 2 / 3,
  "⅛": 1 / 8,
};

/** Schreibweisen (klein, ohne Punkt) → Anzeige-Einheit. */
const EINHEITEN_TEXT: Record<string, string> = {};
for (const [anzeige, schreibweisen] of Object.entries({
  g: ["g", "gr", "gramm"],
  kg: ["kg", "kilo", "kilogramm"],
  mg: ["mg"],
  ml: ["ml", "milliliter"],
  cl: ["cl"],
  dl: ["dl"],
  l: ["l", "liter"],
  EL: ["el", "essl", "esslöffel", "eßlöffel"],
  TL: ["tl", "teel", "teelöffel"],
  Prise: ["prise", "prisen"],
  "Msp.": ["msp", "messerspitze", "messerspitzen"],
  Bund: ["bund", "bd"],
  Dose: ["dose", "dosen"],
  "Pck.": ["pck", "pkg", "päckchen", "packung", "packungen", "pkt"],
  Becher: ["becher"],
  Glas: ["glas", "gläser"],
  Stück: ["stück", "stk", "st"],
  Zehe: ["zehe", "zehen"],
  Scheibe: ["scheibe", "scheiben"],
  Tasse: ["tasse", "tassen"],
  Handvoll: ["handvoll"],
  Zweig: ["zweig", "zweige"],
  Stange: ["stange", "stangen"],
  Kopf: ["kopf", "köpfe"],
  Knolle: ["knolle", "knollen"],
  Würfel: ["würfel"],
  Schuss: ["schuss"],
  Tropfen: ["tropfen"],
  Blatt: ["blatt", "blätter"],
})) {
  for (const s of schreibweisen) {
    EINHEITEN_TEXT[s] = anzeige;
  }
}

const ZAHL = String.raw`\d+(?:[.,]\d+)?`;
const BRUCH = String.raw`\d+\s*\/\s*\d+`;
const UNICODE = `[${Object.keys(BRUECHE).join("")}]`;
// „1 1/2“, „1½“, „1/2“, „½“, „1,5“, „2“ – optional als Spanne „2-3“.
const EINZELMENGE = String.raw`(?:\d+\s+${BRUCH}|\d*\s*${UNICODE}|${BRUCH}|${ZAHL})`;
const MENGE = new RegExp(
  String.raw`^(${EINZELMENGE})(?:\s*(?:-|–|bis)\s*(${EINZELMENGE}))?\s*`,
);
// Menge hinten: „Spaghetti 400g“, „Milch 1,5 l“, „Eier 3“.
const MENGE_HINTEN = new RegExp(
  String.raw`^(.*?\S)\s+(${EINZELMENGE})(?:\s*(?:-|–|bis)\s*(${EINZELMENGE}))?\s*(?:([A-Za-zÄÖÜäöüß]+)\.?)?$`,
);

function zahl(text: string): number | null {
  const t = text.trim();
  const gemischt = t.match(/^(\d+)\s+(\d+)\s*\/\s*(\d+)$/);
  if (gemischt) {
    return Number(gemischt[1]) + Number(gemischt[2]) / Number(gemischt[3] || 1);
  }
  const bruch = t.match(/^(\d+)\s*\/\s*(\d+)$/);
  if (bruch) {
    return Number(bruch[2]) ? Number(bruch[1]) / Number(bruch[2]) : null;
  }
  const unicode = t.match(new RegExp(`^(\\d*)\\s*(${UNICODE})$`));
  if (unicode) {
    return Number(unicode[1] || 0) + (BRUECHE[unicode[2] ?? ""] ?? 0);
  }
  const n = Number(t.replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

const VORSATZ =
  /^(etwas|evtl\.?|eventuell|ca\.?|circa|n\. ?b\.?|nach belieben|einige|ein paar)\s+/i;

/** Zerlegt eine Zutatenzeile. */
export function zerlegeZutat(zeile: string): Zutat {
  let rest = zeile
    .replace(/\s+/g, " ")
    .replace(/^[-•*–]\s*/, "")
    .trim();
  const zusaetze: string[] = [];

  // Klammern und alles nach dem ersten Komma sind Zusatz.
  rest = rest.replace(/\s*\(([^)]*)\)\s*/g, (_, inhalt: string) => {
    if (inhalt.trim()) {
      zusaetze.push(`(${inhalt.trim()})`);
    }
    return " ";
  });
  // Dezimalkomma („0,5“) ist kein Trenner.
  const komma = rest.search(/(?<!\d),|,(?!\d)/);
  if (komma >= 0) {
    zusaetze.unshift(rest.slice(komma + 1).trim());
    rest = rest.slice(0, komma);
  }
  rest = rest.trim();

  let menge: number | null = null;
  const treffer = rest.match(MENGE);
  if (treffer?.[1] && /\d|[½¼¾⅓⅔⅛]/.test(treffer[1])) {
    // Bei einer Spanne lieber die obere Menge einkaufen.
    menge = zahl(treffer[2] ?? treffer[1]);
    rest = rest.slice(treffer[0].length);
  }

  let einheit: string | null = null;
  const hinten = menge == null ? rest.match(MENGE_HINTEN) : null;
  const einheitHinten = hinten?.[4]
    ? EINHEITEN_TEXT[hinten[4].toLowerCase()]
    : undefined;
  // Nur, wenn hinter der Zahl nichts oder eine Einheit steht („Bio Eier 10“ ja,
  // „Gouda 45 Prozent“ nein).
  if (hinten?.[1] && hinten[2] && (!hinten[4] || einheitHinten)) {
    menge = zahl(hinten[3] ?? hinten[2]);
    einheit = einheitHinten ?? null;
    rest = hinten[1].replace(/:$/, "");
  }
  const wort = einheit ? null : rest.match(/^([A-Za-zÄÖÜäöüß]+)\.?(?=\s|$)/);
  const erkannt = wort?.[1] && EINHEITEN_TEXT[wort[1].toLowerCase()];
  // Nur mit Menge davor oder bei eindeutigen Mengenwörtern („Prise Salz“).
  if (wort && erkannt && (menge != null || erkannt.length > 2)) {
    einheit = erkannt;
    rest = rest.slice(wort[0].length).trim();
  }

  const vorsatz = rest.match(VORSATZ);
  if (vorsatz?.[1]) {
    zusaetze.unshift(vorsatz[1]);
    rest = rest.slice(vorsatz[0].length);
  }

  const name = rest.trim() || zeile.trim();
  const zusatz = zusaetze.filter(Boolean).join(", ");
  return {
    menge: menge != null && menge > 0 ? menge : null,
    einheit,
    name,
    zusatz: zusatz || null,
  };
}

/** Menge für die Anzeige: kleine Mengen als Bruch (½, ¼ …), große gerundet. */
export function formatiereZutatMenge(menge: number): string {
  const ganz = Math.floor(menge);
  const teil = menge - ganz;
  if (menge < 10) {
    for (const [zeichen, wert] of Object.entries(BRUECHE)) {
      if (Math.abs(teil - wert) < 0.03) {
        return `${ganz || ""}${zeichen}`;
      }
    }
    if (teil < 0.03 || teil > 0.97) {
      return String(Math.round(menge));
    }
  }
  // Ohne Tausenderpunkt: „1.000“ würde beim erneuten Einlesen zu 1.
  return menge.toLocaleString("de-DE", {
    maximumFractionDigits: menge >= 10 ? 0 : 1,
    useGrouping: false,
  });
}

const MEHRZAHL: Record<string, string> = {
  Dose: "Dosen",
  Zehe: "Zehen",
  Scheibe: "Scheiben",
  Tasse: "Tassen",
  Stange: "Stangen",
  Knolle: "Knollen",
  Prise: "Prisen",
  Zweig: "Zweige",
  Kopf: "Köpfe",
  Glas: "Gläser",
  Blatt: "Blätter",
};

/** Einheit passend zur Menge: „1 Dose“, aber „2 Dosen“. */
export function einheitAnzeige(einheit: string, menge: number | null): string {
  return menge != null && menge > 1 ? (MEHRZAHL[einheit] ?? einheit) : einheit;
}

/** Zeile zum Anzeigen, z. B. „1½ EL Olivenöl“. */
export function zutatAlsText(z: Zutat, faktor = 1): string {
  const teile = [
    z.menge != null ? formatiereZutatMenge(z.menge * faktor) : null,
    z.einheit
      ? einheitAnzeige(z.einheit, z.menge != null ? z.menge * faktor : null)
      : null,
    z.name,
  ].filter(Boolean);
  return teile.join(" ");
}

const GROESSER: Record<string, { faktor: number; einheit: Einheit }> = {
  g: { faktor: 1, einheit: "g" },
  kg: { faktor: 1000, einheit: "g" },
  ml: { faktor: 1, einheit: "ml" },
  cl: { faktor: 10, einheit: "ml" },
  dl: { faktor: 100, einheit: "ml" },
  l: { faktor: 1000, einheit: "ml" },
};
/** Einheiten, die man im Laden als ganze Stücke kauft. */
const STUECKWEISE = new Set([
  "Stück",
  "Dose",
  "Pck.",
  "Becher",
  "Glas",
  "Bund",
  "Kopf",
  "Knolle",
  "Stange",
]);

/**
 * Was davon auf die Einkaufsliste kommt, in den Artikel-Einheiten (g, ml, Stück).
 * EL, Prise & Co. lassen sich nicht einkaufen – dann nur der Name, ohne Menge.
 */
export function mengeFuerListe(
  z: Zutat,
  faktor = 1,
): { menge: number | null; einheit: Einheit | null } {
  if (z.menge == null) {
    return { menge: null, einheit: null };
  }
  const menge = z.menge * faktor;
  const gewicht = z.einheit ? GROESSER[z.einheit] : undefined;
  if (gewicht) {
    return {
      menge: Math.round(menge * gewicht.faktor),
      einheit: gewicht.einheit,
    };
  }
  if (z.einheit == null || STUECKWEISE.has(z.einheit)) {
    return { menge: Math.ceil(menge), einheit: "stueck" };
  }
  return { menge: null, einheit: null };
}

const GRUNDZUTATEN = new Set([
  "salz",
  "meersalz",
  "pfeffer",
  "wasser",
  "öl",
  "olivenöl",
  "sonnenblumenöl",
  "rapsöl",
  "pflanzenöl",
  "speiseöl",
  "essig",
  "zucker",
]);

/** „Haben wir immer“: Salz, Pfeffer, Öl, Wasser … – standardmäßig nicht auf die Liste. */
export function istGrundzutat(name: string): boolean {
  const klein = name.toLowerCase().trim();
  const erstes = klein.split(/[\s,]+/)[0] ?? "";
  return (
    GRUNDZUTATEN.has(klein) ||
    GRUNDZUTATEN.has(erstes) ||
    /^salz (und|&) pfeffer/.test(klein)
  );
}

/** Eindeutige Gewürze und getrocknete Kräuter (klein geschrieben, Wortanfang reicht). */
const GEWUERZE = [
  "salz",
  "meersalz",
  "pfeffer",
  "cayennepfeffer",
  "paprikapulver",
  "currypulver",
  "curry",
  "kreuzkümmel",
  "kümmel",
  "zimt",
  "muskat",
  "oregano",
  "majoran",
  "thymian",
  "rosmarin",
  "kurkuma",
  "chiliflocken",
  "chilipulver",
  "ingwerpulver",
  "knoblauchpulver",
  "zwiebelpulver",
  "lorbeer",
  "nelke",
  "nelken",
  "piment",
  "kardamom",
  "koriandersamen",
  "senfkörner",
  "garam masala",
  "kräuter der provence",
  "italienische kräuter",
  "gewürz",
];
/** Mehrdeutig („2 Paprika“ ist Gemüse): nur mit Gewürz-Einheit ein Gewürz. */
const GEWUERZE_MIT_EINHEIT = [
  "paprika",
  "chili",
  "basilikum",
  "petersilie",
  "koriander",
  "ingwer",
  "dill",
  "schnittlauch",
  "minze",
];
const GEWUERZ_EINHEITEN = new Set(["TL", "Prise", "Msp.", "EL"]);
const ENDUNGEN = new Set([
  "blatt",
  "blätter",
  "pulver",
  "samen",
  "körner",
  "flocken",
  "nuss",
  "zweig",
  "zweige",
]);

/**
 * Gehört die Zutat in den Absatz „Gewürze“? Für den Import, der nur eine Liste kennt.
 * Mit großer Menge („100 g Salz“ fürs Salzteig) bleibt sie eine normale Zutat.
 */
export function istGewuerz(z: Zutat): boolean {
  const name = z.name.toLowerCase().trim();
  // „Lorbeerblätter“, „Muskatnuss“, „Salz und Pfeffer“ ja – „Salzstangen“ nein.
  const passt = (liste: string[]) =>
    liste.some((g) => {
      if (!name.startsWith(g)) {
        return false;
      }
      const rest = name.slice(g.length);
      return rest === "" || rest.startsWith(" ") || ENDUNGEN.has(rest);
    });
  const gewuerzMenge =
    z.menge == null || (z.einheit != null && GEWUERZ_EINHEITEN.has(z.einheit));
  if (passt(GEWUERZE)) {
    return gewuerzMenge;
  }
  return (
    passt(GEWUERZE_MIT_EINHEIT) &&
    z.einheit != null &&
    GEWUERZ_EINHEITEN.has(z.einheit) &&
    !/frisch/.test(`${name} ${z.zusatz ?? ""}`)
  );
}

export type ZutatZeile = Zutat & { optional: boolean };

/**
 * Eine Zeile aus dem Rezept: steht sie ganz in Klammern („(100g Salami)“), ist die
 * Zutat optional – sonst wird sie genauso zerlegt.
 */
export function zerlegeZeile(zeile: string): ZutatZeile {
  const innen = zeile
    .trim()
    .match(/^\((.*)\)$/s)?.[1]
    ?.trim();
  return innen
    ? { ...zerlegeZutat(innen), optional: true }
    : { ...zerlegeZutat(zeile), optional: false };
}

/** Zum Bearbeiten wieder als Zeile, optionale in Klammern. */
export function zeileAlsText(z: ZutatZeile): string {
  const text = zutatAlsText(z) + (z.zusatz ? `, ${z.zusatz}` : "");
  return z.optional ? `(${text})` : text;
}

export type Eingabe = {
  name: string;
  /** In Artikel-Einheiten (g, ml, Stück); `null` = ohne Menge. */
  menge: number | null;
  einheit: Einheit | null;
  /** Als Dose oder Glas angegeben – für die Kategorie (Konserve statt frisch). */
  konserve: boolean;
};

/**
 * Eingabe in Liste und Vorrat: „Mehl 1 kg“, „2 Dosen Tomaten“, „Tomaten Dose 2“,
 * „Eier 10“. Vorsichtig: Mit Zusatz („Milch, laktosefrei“) oder ohne erkannte Menge
 * bleibt alles Name.
 */
export function zerlegeEingabe(text: string): Eingabe {
  const roh = text.replace(/\s+/g, " ").trim();
  const nurName: Eingabe = {
    name: roh,
    menge: null,
    einheit: null,
    konserve: false,
  };
  const z = zerlegeZutat(roh);
  if (z.menge == null || z.zusatz) {
    return nurName;
  }
  let name = z.name;
  let einheit = z.einheit;
  // Einheit am Ende des Namens: „Tomaten Dose 2“.
  const hinten = einheit
    ? null
    : name.match(/^(.*\S)\s+([A-Za-zÄÖÜäöüß]+)\.?$/);
  const einheitHinten = hinten?.[2]
    ? EINHEITEN_TEXT[hinten[2].toLowerCase()]
    : undefined;
  if (hinten?.[1] && einheitHinten && STUECKWEISE.has(einheitHinten)) {
    name = hinten[1];
    einheit = einheitHinten;
  }
  // „7 Up“ ist ein Name, keine Menge.
  if (name.length < 3 || /^\d/.test(name)) {
    return nurName;
  }
  const liste = mengeFuerListe({ ...z, name, einheit });
  return {
    name,
    menge: liste.menge,
    einheit: liste.einheit,
    konserve: einheit === "Dose" || einheit === "Glas",
  };
}
