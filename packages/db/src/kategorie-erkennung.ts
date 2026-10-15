import type { Kategorie } from "./kategorien";

/**
 * Schlägt für einen Artikelnamen Kategorien vor.
 *
 * - Ein Ergebnis: eindeutig (z. B. „Vollkornbrot“ → Brot & Backwaren).
 * - Mehrere: der Artikel kommt in verschiedenen Formen vor (Heidelbeeren frisch
 *   oder tiefgekühlt); die erste ist die häufigere. Die App bietet sie als Auswahl an.
 * - Keins: unbekannt.
 *
 * Deutsche Komposita tragen die Bedeutung am Wortende („Apfelsaft“ ist ein Saft,
 * kein Apfel). Deshalb wird nach dem exakten Namen auch das längste bekannte
 * Wortende gesucht. Hat ein Haushalt einen Artikel schon einmal eingeordnet,
 * gilt dessen gespeicherte Kategorie – diese Tabelle ist nur der Startpunkt.
 */
export function erkenneKategorie(name: string): Kategorie[] {
  const normal = normalisieren(name);
  if (!normal) {
    return [];
  }
  if (TIEFKUEHL_MARKER.test(normal)) {
    return ["tiefkuehl"];
  }
  // „Dose Tomaten“, „passierte Tomaten“, „Mais aus der Dose“: Konserven sind Vorrat.
  if (KONSERVEN_MARKER.test(normal)) {
    return ["vorrat"];
  }
  const ohneMarker = normal.replace(/^(bio|frische?r?|tk)[\s-]+/, "");

  // 1. Ganzer Name, 2. letztes Wort, 3. längstes bekanntes Wortende des letzten Worts.
  const letztesWort = ohneMarker.split(/[\s-]+/).at(-1) ?? ohneMarker;
  for (const kandidat of [ohneMarker, letztesWort]) {
    const treffer = nachschlagen(kandidat);
    if (treffer) {
      return treffer;
    }
  }
  for (let start = 1; start <= letztesWort.length - MIN_WORTENDE; start++) {
    const treffer = nachschlagen(letztesWort.slice(start), true);
    if (treffer) {
      return treffer;
    }
  }
  return [];
}

/** Kürzeste Wortendung, die für Komposita genutzt wird (verhindert „ei“ in „Brei“). */
const MIN_WORTENDE = 4;

const TIEFKUEHL_MARKER = /(^tk[\s-])|tiefkühl|tiefgekühlt|gefroren/;
const KONSERVEN_MARKER =
  /(^|[\s-])(dosen?|konserven?|passiert\w*|gehackt\w*|stückig\w*|geschält\w*|eingelegt\w*)([\s-]|$)|aus der dose|im glas/;

function normalisieren(name: string) {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

/** Sucht ein Wort, auch in einfachen Plural- und Singularformen. */
function nachschlagen(wort: string, nurLange = false): Kategorie[] | null {
  for (const variante of varianten(wort)) {
    if (nurLange && variante.length < MIN_WORTENDE) {
      continue;
    }
    const eintrag = TABELLE.get(variante);
    if (eintrag) {
      return eintrag;
    }
  }
  return null;
}

function varianten(wort: string): string[] {
  const liste = [wort];
  for (const endung of ["n", "en", "e", "s", "er", "nen"]) {
    if (wort.endsWith(endung) && wort.length > endung.length + 2) {
      liste.push(wort.slice(0, -endung.length));
    }
  }
  liste.push(`${wort}n`, `${wort}e`);
  return liste;
}

const O: Kategorie = "obst_gemuese";
const B: Kategorie = "brot_backwaren";
const M: Kategorie = "milch_kaese";
const F: Kategorie = "fleisch_fisch";
const V: Kategorie = "vorrat";
const S: Kategorie = "suesses_snacks";
const G: Kategorie = "getraenke";
const T: Kategorie = "tiefkuehl";
const D: Kategorie = "drogerie";
const H: Kategorie = "haushalt";

/**
 * Wörter (klein, Singular oder üblicher Plural) → Kategorie(n).
 * Bei mehreren Kategorien steht die häufigste zuerst.
 */
const EINTRAEGE: [string, Kategorie | Kategorie[]][] = [
  // Obst
  ["apfel", O],
  ["äpfel", O],
  ["banane", O],
  ["birne", O],
  ["orange", O],
  ["mandarine", O],
  ["clementine", O],
  ["zitrone", O],
  ["limette", O],
  ["grapefruit", O],
  ["traube", O],
  ["weintraube", O],
  ["kiwi", O],
  ["mango", O],
  ["melone", O],
  ["wassermelone", O],
  ["avocado", O],
  ["pflaume", O],
  ["zwetschge", O],
  ["kirsche", [O, T]],
  ["aprikose", O],
  ["nektarine", O],
  ["pfirsich", [O, V]],
  ["ananas", [O, V]],
  ["granatapfel", O],
  ["heidelbeere", [O, T]],
  ["blaubeere", [O, T]],
  ["himbeere", [O, T]],
  ["erdbeere", [O, T]],
  ["brombeere", [O, T]],
  ["johannisbeere", [O, T]],
  ["beere", [O, T]],
  ["beeren", [O, T]],
  ["obst", O],
  ["rhabarber", O],
  ["feige", O],
  ["dattel", [O, V]],
  // Gemüse
  ["tomate", [O, V]],
  ["gurke", O],
  ["salatgurke", O],
  ["paprika", O],
  ["zucchini", O],
  ["aubergine", O],
  ["karotte", O],
  ["möhre", O],
  ["kartoffel", O],
  ["süßkartoffel", O],
  ["zwiebel", O],
  ["frühlingszwiebel", O],
  ["knoblauch", O],
  ["ingwer", O],
  ["lauch", O],
  ["porree", O],
  ["sellerie", O],
  ["staudensellerie", O],
  ["fenchel", O],
  ["kohlrabi", O],
  ["blumenkohl", [O, T]],
  ["brokkoli", [O, T]],
  ["rosenkohl", [O, T]],
  ["weißkohl", O],
  ["rotkohl", [O, V]],
  ["spitzkohl", O],
  ["grünkohl", [O, T]],
  ["wirsing", O],
  ["kohl", O],
  ["spinat", [O, T]],
  ["blattspinat", [O, T]],
  ["salat", O],
  ["eisbergsalat", O],
  ["rucola", O],
  ["feldsalat", O],
  ["kopfsalat", O],
  ["radieschen", O],
  ["rettich", O],
  ["rote bete", [O, V]],
  ["kürbis", O],
  ["spargel", [O, V]],
  ["pilz", [O, V]],
  ["champignon", [O, V]],
  ["mais", [V, O, T]],
  ["erbse", [T, V, O]],
  ["bohne", [O, V, T]],
  ["grüne bohnen", [O, T, V]],
  ["kräuter", [O, T]],
  ["petersilie", O],
  ["schnittlauch", O],
  ["basilikum", O],
  ["koriander", O],
  ["dill", O],
  ["minze", O],
  ["rosmarin", O],
  ["thymian", O],
  ["gemüse", O],
  ["suppengrün", O],
  ["chili", O],
  ["peperoni", O],
  ["oliven", V],
  // Brot & Backwaren
  ["brot", B],
  ["brötchen", [B, T]],
  ["semmel", B],
  ["toast", B],
  ["toastbrot", B],
  ["baguette", [B, T]],
  ["croissant", [B, T]],
  ["brezel", [B, T]],
  ["laugenbrezel", [B, T]],
  ["knäckebrot", B],
  ["zwieback", B],
  ["wrap", B],
  ["tortilla", B],
  ["fladenbrot", B],
  ["kuchen", [B, T]],
  ["muffin", B],
  ["hefezopf", B],
  ["pumpernickel", B],
  // Milch & Käse, Eier
  ["milch", M],
  ["vollmilch", M],
  ["hafermilch", M],
  ["sojamilch", M],
  ["mandelmilch", M],
  ["butter", M],
  ["margarine", M],
  ["sahne", M],
  ["schlagsahne", M],
  ["schmand", M],
  ["saure sahne", M],
  ["crème fraîche", M],
  ["creme fraiche", M],
  ["quark", M],
  ["joghurt", M],
  ["jogurt", M],
  ["skyr", M],
  ["kefir", M],
  ["buttermilch", M],
  ["pudding", M],
  ["käse", M],
  ["gouda", M],
  ["emmentaler", M],
  ["mozzarella", M],
  ["feta", M],
  ["parmesan", M],
  ["frischkäse", M],
  ["hüttenkäse", M],
  ["camembert", M],
  ["brie", M],
  ["halloumi", M],
  ["ei", M],
  ["eier", M],
  ["frischhefe", M],
  // Fleisch & Fisch
  ["fleisch", F],
  ["hackfleisch", [F, T]],
  ["hack", [F, T]],
  ["rinderhack", [F, T]],
  ["hähnchen", [F, T]],
  ["hähnchenbrust", [F, T]],
  ["hühnchen", [F, T]],
  ["pute", F],
  ["putenbrust", F],
  ["schnitzel", [F, T]],
  ["steak", F],
  ["gulasch", F],
  ["braten", F],
  ["wurst", F],
  ["würstchen", F],
  ["bratwurst", [F, T]],
  ["salami", F],
  ["schinken", F],
  ["kochschinken", F],
  ["speck", F],
  ["leberwurst", F],
  ["aufschnitt", F],
  ["frikadelle", F],
  ["fisch", [F, T]],
  ["lachs", [F, T]],
  ["thunfisch", [V, F]],
  ["forelle", F],
  ["garnele", [T, F]],
  ["shrimp", [T, F]],
  ["fischstäbchen", T],
  ["tofu", F],
  // Vorrat & Konserven
  ["nudeln", V],
  ["nudel", V],
  ["spaghetti", V],
  ["penne", V],
  ["fusilli", V],
  ["lasagne", [V, T]],
  ["reis", V],
  ["basmati", V],
  ["couscous", V],
  ["bulgur", V],
  ["quinoa", V],
  ["linse", V],
  ["kichererbse", V],
  ["kidneybohne", V],
  ["mehl", V],
  ["zucker", V],
  ["puderzucker", V],
  ["salz", V],
  ["pfeffer", V],
  ["gewürz", V],
  ["paprikapulver", V],
  ["zimt", V],
  ["öl", V],
  ["olivenöl", V],
  ["rapsöl", V],
  ["essig", V],
  ["senf", V],
  ["ketchup", V],
  ["mayonnaise", V],
  ["mayo", V],
  ["brühe", V],
  ["gemüsebrühe", V],
  ["tomatenmark", V],
  ["passata", V],
  ["dosentomaten", V],
  ["konserve", V],
  ["dose", V],
  ["haferflocken", V],
  ["müsli", V],
  ["cornflakes", V],
  ["honig", V],
  ["marmelade", V],
  ["konfitüre", V],
  ["nutella", V],
  ["erdnussbutter", V],
  ["backpulver", V],
  ["hefe", V],
  ["trockenhefe", V],
  ["vanillezucker", V],
  ["soße", V],
  ["sauce", V],
  ["pesto", V],
  ["sojasauce", V],
  ["kokosmilch", V],
  ["nüsse", V],
  ["mandeln", V],
  ["walnüsse", V],
  ["rosinen", V],
  ["semmelbrösel", V],
  ["stärke", V],
  ["suppe", [V, T]],
  ["fertiggericht", [T, V]],
  // Süßes & Snacks
  ["schokolade", S],
  ["schoki", S],
  ["chips", S],
  ["kekse", S],
  ["keks", S],
  ["gummibärchen", S],
  ["bonbons", S],
  ["süßigkeiten", S],
  ["salzstangen", S],
  ["popcorn", S],
  ["müsliriegel", S],
  ["riegel", S],
  ["cracker", S],
  ["erdnüsse", S],
  ["studentenfutter", S],
  ["praline", S],
  // Getränke
  ["wasser", G],
  ["mineralwasser", G],
  ["sprudel", G],
  ["saft", G],
  ["orangensaft", G],
  ["apfelsaft", G],
  ["schorle", G],
  ["limo", G],
  ["limonade", G],
  ["cola", G],
  ["eistee", G],
  ["bier", G],
  ["wein", G],
  ["rotwein", G],
  ["weißwein", G],
  ["sekt", G],
  ["prosecco", G],
  ["kaffee", G],
  ["kaffeebohnen", G],
  ["espresso", G],
  ["kaffeepads", G],
  ["kapseln", G],
  ["tee", G],
  ["kakao", G],
  ["sirup", G],
  ["energydrink", G],
  // Tiefkühl
  ["pizza", [T, B]],
  ["tiefkühlpizza", T],
  ["pommes", T],
  ["eis", T],
  ["eiscreme", T],
  ["eiswürfel", T],
  ["kroketten", T],
  ["rahmspinat", T],
  ["kräuterbutter", [M, T]],
  // Drogerie
  ["zahnpasta", D],
  ["zahncreme", D],
  ["zahnbürste", D],
  ["zahnseide", D],
  ["mundspülung", D],
  ["shampoo", D],
  ["spülung", D],
  ["duschgel", D],
  ["seife", D],
  ["handseife", D],
  ["deo", D],
  ["deodorant", D],
  ["creme", D],
  ["sonnencreme", D],
  ["bodylotion", D],
  ["rasierer", D],
  ["rasierschaum", D],
  ["wattestäbchen", D],
  ["watte", D],
  ["pflaster", D],
  ["toilettenpapier", D],
  ["klopapier", D],
  ["taschentücher", D],
  ["tampons", D],
  ["binden", D],
  ["windeln", D],
  ["feuchttücher", D],
  ["haarspray", D],
  ["kontaktlinsen", D],
  // Haushalt
  ["spülmittel", H],
  ["spültabs", H],
  ["geschirrspültabs", H],
  ["waschmittel", H],
  ["weichspüler", H],
  ["müllbeutel", H],
  ["müllsäcke", H],
  ["küchenrolle", H],
  ["küchenpapier", H],
  ["alufolie", H],
  ["frischhaltefolie", H],
  ["backpapier", H],
  ["gefrierbeutel", H],
  ["schwamm", H],
  ["schwämme", H],
  ["putzmittel", H],
  ["allzweckreiniger", H],
  ["glasreiniger", H],
  ["wc-reiniger", H],
  ["entkalker", H],
  ["batterien", H],
  ["glühbirne", H],
  ["kerzen", H],
  ["servietten", H],
  ["streichhölzer", H],
  ["tücher", H],
  ["lappen", H],
  // Ergänzt für Rezepte (Oktober 2026): oft gekauft, bisher unbekannt.
  ["ricotta", M],
  ["mascarpone", M],
  ["burrata", M],
  ["cheddar", M],
  ["hummus", M],
  ["pizzateig", M],
  ["flammkuchenteig", M],
  ["mürbeteig", M],
  ["blätterteig", [M, T]],
  ["spätzle", [M, V]],
  ["gnocchi", [M, V]],
  ["tortellini", [M, V]],
  ["semmelknödel", [V, M]],
  ["falafel", [M, T]],
  ["edamame", T],
  ["orzo", V],
  ["lasagneplatten", V],
  ["makkaroni", V],
  ["tagliatelle", V],
  ["rigatoni", V],
  ["linguine", V],
  ["farfalle", V],
  ["udon", V],
  ["grieß", V],
  ["polenta", V],
  ["apfelmus", V],
  ["pinienkerne", V],
  ["kürbiskerne", V],
  ["sesam", V],
  ["sesamöl", V],
  ["kapern", V],
  ["ajvar", V],
  ["currypaste", V],
  ["ciabatta", B],
  ["naan", B],
  ["pak choi", O],
  ["zuckerschoten", O],
  ["hokkaido", O],
  ["pastinake", O],
  ["pastinaken", O],
  ["steckrübe", O],
  ["mangold", O],
  ["kaki", O],
  ["pfifferlinge", O],
  ["lachsfilet", [F, T]],
  ["hähnchenschenkel", F],
  ["kasseler", F],
  ["chorizo", F],
  ["pancetta", F],
  ["matjes", F],
  ["mettwurst", F],
  ["mettwürste", F],
  ["kabeljau", [F, T]],
  ["paneer", M],
  ["maultaschen", [M, V]],
  ["knödel", [V, M]],
  ["klöße", [V, M]],
  ["reispapier", V],
  ["misopaste", V],
  ["sardellen", V],
  ["maronen", [V, O]],
  ["mungbohnensprossen", O],
  ["sprossen", O],
  ["mairübchen", O],
  ["entenbrust", F],
  ["scholle", [F, T]],
  ["schollen", [F, T]],
  ["schweinefilet", F],
];

const TABELLE = new Map<string, Kategorie[]>(
  EINTRAEGE.map(([wort, kategorie]) => [
    wort,
    Array.isArray(kategorie) ? kategorie : [kategorie],
  ]),
);
