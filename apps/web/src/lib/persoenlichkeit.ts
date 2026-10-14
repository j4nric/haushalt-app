/**
 * Produkte mit Persönlichkeit: ein passendes Emoji und kleine Sätze, mit denen sich
 * Produkte selbst zu Wort melden. Welcher Satz kommt, hängt fest am Namen – so sagt
 * die Milch nicht bei jedem Neuzeichnen etwas anderes.
 */

const EMOJI: [RegExp, string][] = [
  [/milch/i, "🥛"],
  [/k[äa]se|mozzarella|feta|parmesan/i, "🧀"],
  [/joghurt|quark/i, "🥣"],
  [/butter/i, "🧈"],
  [/^eier?$|^eier\b/i, "🥚"],
  [/brokkoli/i, "🥦"],
  [/banane/i, "🍌"],
  [/apfel|äpfel/i, "🍎"],
  [/birne/i, "🍐"],
  [/tomate/i, "🍅"],
  [/gurke/i, "🥒"],
  [/karotte|möhre/i, "🥕"],
  [/kartoffel/i, "🥔"],
  [/zwiebel/i, "🧅"],
  [/knoblauch/i, "🧄"],
  [/avocado/i, "🥑"],
  [/paprika|chili/i, "🌶️"],
  [/salat|spinat/i, "🥬"],
  [/zitrone|limette/i, "🍋"],
  [/erdbeere/i, "🍓"],
  [/traube/i, "🍇"],
  [/orange|mandarine/i, "🍊"],
  [/croissant/i, "🥐"],
  [/brezel/i, "🥨"],
  [/brot|brötchen|toast/i, "🍞"],
  [/hähnchen|huhn|pute/i, "🍗"],
  [/lachs|fisch|thunfisch/i, "🐟"],
  [/garnele|shrimp/i, "🦐"],
  [/speck|bacon|schinken|salami|wurst/i, "🥓"],
  [/steak|rind|hack|fleisch|schwein/i, "🥩"],
  [/nudel|pasta|spaghetti/i, "🍝"],
  [/reis/i, "🍚"],
  [/pizza/i, "🍕"],
  [/honig/i, "🍯"],
  [/schoko/i, "🍫"],
  [/keks/i, "🍪"],
  [/popcorn/i, "🍿"],
  [/^eis$|eiscreme/i, "🍦"],
  [/kaffee/i, "☕"],
  [/tee\b|^tee/i, "🍵"],
  [/bier/i, "🍺"],
  [/wein|sekt/i, "🍷"],
  [/saft/i, "🧃"],
  [/wasser/i, "💧"],
  [/klopapier|toilettenpapier|küchenrolle/i, "🧻"],
  [/zahnpasta|zahnbürste/i, "🪥"],
  [/seife|spülmittel|duschgel/i, "🧼"],
];

const KATEGORIE_EMOJI: Record<string, string> = {
  obst_gemuese: "🥬",
  brot_backwaren: "🥖",
  milch_kaese: "🥛",
  fleisch_fisch: "🥩",
  vorrat: "🥫",
  suesses_snacks: "🍬",
  getraenke: "🥤",
  tiefkuehl: "🧊",
  drogerie: "🧴",
  haushalt: "🧽",
};

export function produktEmoji(name: string, kategorie: string | null): string {
  return (
    EMOJI.find(([muster]) => muster.test(name.trim()))?.[1] ??
    KATEGORIE_EMOJI[kategorie ?? ""] ??
    "🛍️"
  );
}

/** Fester „Zufall“ je Name: immer derselbe Eintrag aus der Liste. */
function waehle<T>(name: string, liste: readonly T[]): T {
  let h = 0;
  for (const z of name.toLowerCase()) {
    h = (h * 31 + (z.codePointAt(0) ?? 0)) | 0;
  }
  return liste[Math.abs(h) % liste.length] as T;
}

function rhythmus(abstandTage: number): string {
  if (abstandTage === 1) {
    return "jeden Tag";
  }
  if (abstandTage === 7) {
    return "jede Woche";
  }
  if (abstandTage === 14) {
    return "alle zwei Wochen";
  }
  return `alle ${abstandTage} Tage`;
}

const gross = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Das Produkt meldet sich, weil es überfällig ist. */
export function vergessenSatz(
  name: string,
  abstandTage: number,
  seitTage: number,
): string {
  const r = rhythmus(abstandTage);
  return waehle(name, [
    `Sonst holst du mich ${r} – jetzt sind's schon ${seitTage} Tage!`,
    `${seitTage} Tage ohne mich? Normalerweise ${r}.`,
    `${gross(r)}, so war's ausgemacht. Jetzt: ${seitTage} Tage.`,
    `Ich steh hier seit ${seitTage} Tagen rum. Sonst ${r}!`,
  ]);
}

/** Ab so vielen Tagen ohne Kauf meldet sich ein Produkt im Verlauf. */
export const VERMISST_AB_TAGEN = 21;

/** Kurzer Satz für lange nicht gekaufte Produkte im Verlauf; sonst `null`. */
export function vermisstSatz(name: string, seitTagen: number): string | null {
  if (seitTagen < VERMISST_AB_TAGEN) {
    return null;
  }
  const dauer =
    seitTagen < 60
      ? `${Math.round(seitTagen / 7)} Wochen`
      : `${Math.round(seitTagen / 30)} Monaten`;
  return waehle(name, [
    "vermisst dich 💔",
    `wartet seit ${dauer}`,
    "fühlt sich vergessen",
    "hat Sehnsucht 🥺",
    "denkt an alte Zeiten",
    "schaut traurig aus dem Regal",
  ]);
}
