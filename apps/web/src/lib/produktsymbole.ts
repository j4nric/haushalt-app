import {
  IconAvocado,
  IconBabyBottle,
  IconBaguette,
  IconBattery,
  IconBottle,
  IconBowl,
  IconBowlChopsticks,
  IconBread,
  IconBubbleTea,
  IconBucket,
  IconBulb,
  IconBurger,
  IconCakeRoll,
  IconCandle,
  IconCheese,
  IconChocolate,
  IconDiaper,
  IconDroplet,
  IconDumpling,
  IconEggs,
  IconFilter,
  IconFishBone,
  IconFlower,
  IconGlassChampagne,
  IconHandSanitizer,
  IconLeaf,
  IconLemon,
  IconMeat,
  IconMelon,
  IconMilkshake,
  IconMug,
  IconMushroom,
  IconPackage,
  IconPaw,
  IconPepper,
  IconPerfume,
  IconPig,
  IconPlant,
  IconRazor,
  IconSalt,
  IconSausage,
  IconSeedling,
  IconSpray,
  IconTeapot,
  IconToiletPaper,
  IconTrash,
  IconVacuumCleaner,
  IconWashMachine,
} from "@tabler/icons-react";
import {
  Apple,
  Baby,
  Banana,
  Bandage,
  Bean,
  Beef,
  Beer,
  BottleWine,
  Broccoli,
  Bubbles,
  Cake,
  CakeSlice,
  Candy,
  Carrot,
  Cat,
  Cherry,
  Citrus,
  Coffee,
  Cookie,
  CookingPot,
  Croissant,
  Cupcake,
  CupSoda,
  Dessert,
  Dog,
  Donut,
  Drumstick,
  Egg,
  Fish,
  GlassWater,
  Grape,
  Ham,
  Hamburger,
  Hop,
  IceCreamCone,
  LeafyGreen,
  Lollipop,
  Martini,
  Milk,
  Nut,
  PaperBag,
  Pill,
  Pizza,
  Popcorn,
  Popsicle,
  Salad,
  Sandwich,
  Shrimp,
  SoapDispenserDroplet,
  Soup,
  SprayCan,
  Toothbrush,
  Wheat,
  Wine,
} from "lucide-react";
import type { ComponentType, CSSProperties } from "react";

/**
 * Symbole für einzelne Produkte („Käse“, „Klopapier“) statt nur für die Kategorie.
 * Flach und einfarbig in Strichoptik: Lucide, wo es ein passendes gibt, sonst
 * Tabler Icons (gleiches Raster, gleiche Strichstärke, MIT-Lizenz).
 *
 * Wie bei der Kategorie-Erkennung trägt bei deutschen Komposita das Wortende die
 * Bedeutung: „Apfelsaft“ ist ein Saft, „Käsekuchen“ ein Kuchen.
 */
export type ProduktSymbol = ComponentType<{
  className?: string;
  style?: CSSProperties;
  "aria-hidden"?: boolean;
}>;

const EINTRAEGE: [ProduktSymbol, string[]][] = [
  // Obst & Gemüse
  [Apple, ["apfel", "äpfel", "birne", "quitte"]],
  [Banana, ["banane"]],
  [Cherry, ["kirsche", "sauerkirsche"]],
  [
    Grape,
    [
      "traube",
      "weintraube",
      "rosine",
      "johannisbeere",
      "heidelbeere",
      "blaubeere",
      "himbeere",
      "brombeere",
      "beere",
      "erdbeere",
      "cranberry",
    ],
  ],
  [IconLemon, ["zitrone", "limette"]],
  [
    Citrus,
    [
      "orange",
      "mandarine",
      "clementine",
      "grapefruit",
      "blutorange",
      "kumquat",
    ],
  ],
  [IconMelon, ["melone", "wassermelone", "honigmelone"]],
  [
    IconAvocado,
    [
      "avocado",
      "mango",
      "kiwi",
      "papaya",
      "pfirsich",
      "nektarine",
      "aprikose",
      "pflaume",
      "zwetschge",
      "ananas",
      "feige",
      "dattel",
      "granatapfel",
      "maracuja",
    ],
  ],
  [
    Carrot,
    [
      "karotte",
      "möhre",
      "mohrrübe",
      "pastinake",
      "rübe",
      "radieschen",
      "rettich",
      "rote bete",
      "sellerie",
      "ingwer",
    ],
  ],
  [
    Broccoli,
    [
      "brokkoli",
      "blumenkohl",
      "romanesco",
      "rosenkohl",
      "kohl",
      "weißkohl",
      "rotkohl",
      "wirsing",
      "kohlrabi",
      "grünkohl",
      "pak choi",
      "spargel",
    ],
  ],
  [
    LeafyGreen,
    [
      "salat",
      "kopfsalat",
      "eisbergsalat",
      "rucola",
      "feldsalat",
      "spinat",
      "mangold",
      "lauch",
      "porree",
      "frühlingszwiebel",
      "petersilie",
      "schnittlauch",
      "dill",
      "minze",
      "koriander",
    ],
  ],
  [
    IconLeaf,
    [
      "basilikum",
      "thymian",
      "rosmarin",
      "oregano",
      "salbei",
      "lorbeer",
      "kräuter",
      "lorbeerblatt",
    ],
  ],
  [
    IconPepper,
    [
      "paprika",
      "chili",
      "peperoni",
      "jalapeño",
      "jalapeno",
      "zucchini",
      "gurke",
      "aubergine",
      "tomate",
      "kirschtomate",
      "cocktailtomate",
    ],
  ],
  [
    IconMushroom,
    [
      "pilz",
      "champignon",
      "pfifferling",
      "steinpilz",
      "shiitake",
      "kräuterseitling",
    ],
  ],
  [Salad, ["rohkost", "salatmischung", "bowl"]],
  [IconSeedling, ["sprossen", "kresse", "keimling"]],
  [
    IconPlant,
    [
      "zwiebel",
      "knoblauch",
      "schalotte",
      "kartoffel",
      "süßkartoffel",
      "kürbis",
      "mais",
      "maiskolben",
    ],
  ],
  [
    Bean,
    [
      "bohne",
      "kidneybohne",
      "linse",
      "kichererbse",
      "erbse",
      "edamame",
      "tofu",
      "tempeh",
    ],
  ],
  [
    Nut,
    [
      "nuss",
      "walnuss",
      "haselnuss",
      "erdnuss",
      "cashew",
      "mandel",
      "pistazie",
      "macadamia",
      "kerne",
      "sonnenblumenkerne",
      "kürbiskerne",
      "pinienkerne",
      "samen",
      "leinsamen",
      "chiasamen",
      "sesam",
    ],
  ],

  // Brot & Backwaren
  [
    IconBread,
    [
      "brot",
      "toast",
      "toastbrot",
      "vollkornbrot",
      "graubrot",
      "schwarzbrot",
      "pumpernickel",
      "knäckebrot",
      "sandwichbrot",
    ],
  ],
  [
    IconBaguette,
    [
      "baguette",
      "ciabatta",
      "fladenbrot",
      "laugenstange",
      "stange",
      "wrap",
      "tortilla",
      "naan",
    ],
  ],
  [
    Croissant,
    [
      "croissant",
      "brötchen",
      "semmel",
      "schrippe",
      "laugenbrezel",
      "brezel",
      "breze",
      "hörnchen",
      "plunder",
      "franzbrötchen",
      "zimtschnecke",
    ],
  ],
  [
    CakeSlice,
    [
      "kuchen",
      "torte",
      "käsekuchen",
      "obstkuchen",
      "streuselkuchen",
      "rührkuchen",
    ],
  ],
  [Cupcake, ["muffin", "cupcake", "berliner", "krapfen"]],
  [Donut, ["donut", "doughnut"]],
  [IconCakeRoll, ["biskuit", "biskuitrolle", "strudel", "stollen"]],

  // Milch, Käse, Eier
  [
    Milk,
    [
      "milch",
      "vollmilch",
      "hafermilch",
      "sojamilch",
      "mandelmilch",
      "buttermilch",
      "kakao",
      "kaba",
      "kefir",
    ],
  ],
  [
    IconMilkshake,
    [
      "joghurt",
      "jogurt",
      "skyr",
      "quark",
      "pudding",
      "dessert",
      "milchreis",
      "grießbrei",
      "ayran",
      "smoothie",
      "shake",
      "milchshake",
    ],
  ],
  [
    IconCheese,
    [
      "käse",
      "gouda",
      "emmentaler",
      "mozzarella",
      "parmesan",
      "feta",
      "camembert",
      "brie",
      "cheddar",
      "frischkäse",
      "hüttenkäse",
      "halloumi",
      "mascarpone",
      "ricotta",
      "bergkäse",
      "butterkäse",
      "gorgonzola",
      "reibekäse",
    ],
  ],
  [
    IconDroplet,
    [
      "sahne",
      "schlagsahne",
      "schmand",
      "crème fraîche",
      "creme fraiche",
      "saure sahne",
      "kondensmilch",
    ],
  ],
  [IconEggs, ["eier", "ei", "wachtelei"]],
  [Egg, ["spiegelei", "rührei", "eiweiß", "eigelb"]],
  [IconPackage, ["butter", "margarine", "ghee", "hefe"]],

  // Fleisch & Fisch
  [
    Beef,
    [
      "rind",
      "rindfleisch",
      "steak",
      "hackfleisch",
      "hack",
      "gulasch",
      "rinderhack",
      "braten",
      "roastbeef",
      "filet",
      "fleisch",
      "schnitzel",
      "kotelett",
    ],
  ],
  [
    IconPig,
    ["schwein", "schweinefleisch", "schweinebauch", "spareribs", "nacken"],
  ],
  [
    Drumstick,
    [
      "hähnchen",
      "huhn",
      "hühnchen",
      "chicken",
      "pute",
      "truthahn",
      "geflügel",
      "keule",
      "hähnchenbrust",
      "putenbrust",
      "chicken wings",
      "nuggets",
      "ente",
    ],
  ],
  [
    Ham,
    [
      "schinken",
      "kochschinken",
      "speck",
      "bacon",
      "salami",
      "aufschnitt",
      "mortadella",
      "lachsschinken",
      "pancetta",
      "chorizo",
      "leberwurst",
      "wurst",
    ],
  ],
  [
    IconSausage,
    [
      "würstchen",
      "bratwurst",
      "wiener",
      "bockwurst",
      "weißwurst",
      "frankfurter",
      "currywurst",
      "cabanossi",
      "merguez",
    ],
  ],
  [
    IconMeat,
    [
      "lamm",
      "kalb",
      "wild",
      "hirsch",
      "reh",
      "leber",
      "frikadelle",
      "bulette",
      "fleischpflanzerl",
    ],
  ],
  [
    Fish,
    [
      "fisch",
      "lachs",
      "forelle",
      "kabeljau",
      "seelachs",
      "dorsch",
      "thunfisch",
      "hering",
      "makrele",
      "sardine",
      "sardelle",
      "matjes",
      "zander",
      "barsch",
      "pangasius",
      "fischstäbchen",
      "rollmops",
    ],
  ],
  [
    Shrimp,
    [
      "garnele",
      "shrimp",
      "krabbe",
      "scampi",
      "meeresfrüchte",
      "muschel",
      "tintenfisch",
      "calamari",
      "hummer",
    ],
  ],
  [IconFishBone, ["fischfond", "surimi", "fischsoße"]],

  // Vorrat
  [
    Wheat,
    [
      "mehl",
      "weizenmehl",
      "dinkelmehl",
      "grieß",
      "haferflocken",
      "flocken",
      "müsli",
      "granola",
      "cornflakes",
      "getreide",
      "hafer",
      "dinkel",
      "couscous",
      "bulgur",
      "quinoa",
      "polenta",
      "paniermehl",
      "semmelbrösel",
      "backpulver",
      "speisestärke",
      "stärke",
    ],
  ],
  [
    IconBowl,
    [
      "nudel",
      "nudeln",
      "pasta",
      "spaghetti",
      "penne",
      "fusilli",
      "farfalle",
      "tagliatelle",
      "lasagne",
      "lasagneplatten",
      "makkaroni",
      "tortellini",
      "gnocchi",
      "spätzle",
      "ravioli",
      "maultasche",
    ],
  ],
  [
    IconBowlChopsticks,
    [
      "reis",
      "basmati",
      "basmatireis",
      "jasminreis",
      "risotto",
      "risottoreis",
      "sushireis",
      "ramen",
      "mie",
      "udon",
      "glasnudel",
      "reisnudel",
      "mienudel",
    ],
  ],
  [IconDumpling, ["dumpling", "gyoza", "wan tan", "wontons", "frühlingsrolle"]],
  [
    IconSalt,
    [
      "salz",
      "pfeffer",
      "gewürz",
      "zimt",
      "muskat",
      "kreuzkümmel",
      "kümmel",
      "curry",
      "currypulver",
      "kurkuma",
      "paprikapulver",
      "vanille",
      "vanillezucker",
      "zucker",
      "puderzucker",
      "rohrzucker",
      "brühe",
      "gemüsebrühe",
      "bouillon",
      "natron",
    ],
  ],
  [
    BottleWine,
    [
      "öl",
      "olivenöl",
      "rapsöl",
      "sonnenblumenöl",
      "sesamöl",
      "essig",
      "balsamico",
      "sojasoße",
      "sojasauce",
      "kokosöl",
      "leinöl",
      "erdnussöl",
      "walnussöl",
      "bratöl",
      "kürbiskernöl",
    ],
  ],
  [
    CookingPot,
    [
      "soße",
      "sauce",
      "tomatensoße",
      "pesto",
      "ketchup",
      "senf",
      "mayonnaise",
      "mayo",
      "remoulade",
      "dressing",
      "chutney",
      "currypaste",
      "tomatenmark",
      "passata",
      "suppe",
      "eintopf",
      "fond",
      "dosentomaten",
      "konserve",
    ],
  ],
  [
    IconPackage,
    [
      "honig",
      "marmelade",
      "konfitüre",
      "gelee",
      "nutella",
      "nussnougatcreme",
      "aufstrich",
      "erdnussbutter",
      "sirup",
      "ahornsirup",
    ],
  ],

  // Süßes & Snacks
  [
    IconChocolate,
    ["schokolade", "schoko", "riegel", "schokoriegel", "praline", "kuvertüre"],
  ],
  [
    Cookie,
    [
      "keks",
      "kekse",
      "plätzchen",
      "cookie",
      "butterkeks",
      "zwieback",
      "waffel",
      "lebkuchen",
      "spekulatius",
      "cracker",
      "reiswaffel",
    ],
  ],
  [
    Candy,
    [
      "bonbon",
      "gummibärchen",
      "gummibär",
      "fruchtgummi",
      "lakritz",
      "süßigkeit",
      "kaugummi",
      "marshmallow",
    ],
  ],
  [Lollipop, ["lolli", "lutscher"]],
  [
    Popcorn,
    [
      "popcorn",
      "chips",
      "kartoffelchips",
      "flips",
      "erdnussflips",
      "salzstangen",
      "brezeln",
      "nachos",
      "tortillachips",
      "snack",
    ],
  ],
  [
    IceCreamCone,
    [
      "eis",
      "speiseeis",
      "eiscreme",
      "eistüte",
      "sorbet",
      "erdbeereis",
      "vanilleeis",
      "schokoeis",
      "milcheis",
    ],
  ],
  [Popsicle, ["eis am stiel", "stieleis", "wassereis"]],
  [
    Dessert,
    ["mousse", "tiramisu", "panna cotta", "götterspeise", "wackelpudding"],
  ],
  [Cake, ["geburtstagskuchen", "sahnetorte"]],

  // Getränke
  [
    GlassWater,
    ["wasser", "mineralwasser", "sprudel", "stilles wasser", "tafelwasser"],
  ],
  [
    CupSoda,
    [
      "cola",
      "limo",
      "limonade",
      "fanta",
      "sprite",
      "spezi",
      "schorle",
      "apfelschorle",
      "eistee",
      "energydrink",
      "energy",
      "brause",
      "tonic",
      "ginger ale",
      "mate",
      "club mate",
      "pepsi",
      "schwip schwap",
    ],
  ],
  [
    IconBottle,
    [
      "saft",
      "apfelsaft",
      "orangensaft",
      "multivitaminsaft",
      "traubensaft",
      "nektar",
      "direktsaft",
    ],
  ],
  [
    Coffee,
    [
      "kaffee",
      "espresso",
      "kaffeebohnen",
      "kaffeepads",
      "kaffeekapseln",
      "cappuccino",
      "latte macchiato",
    ],
  ],
  [
    IconTeapot,
    [
      "tee",
      "grüntee",
      "schwarztee",
      "kräutertee",
      "früchtetee",
      "pfefferminztee",
      "kamillentee",
      "teebeutel",
    ],
  ],
  [IconBubbleTea, ["bubble tea", "eiskaffee"]],
  [
    Beer,
    [
      "bier",
      "pils",
      "radler",
      "weizenbier",
      "weißbier",
      "helles",
      "alster",
      "kölsch",
      "alt",
    ],
  ],
  [Hop, ["hopfen", "malzbier"]],
  [Wine, ["wein", "rotwein", "weißwein", "rosé", "glühwein"]],
  [IconGlassChampagne, ["sekt", "prosecco", "champagner", "crémant"]],
  [
    Martini,
    [
      "gin",
      "wodka",
      "rum",
      "whisky",
      "whiskey",
      "likör",
      "schnaps",
      "aperol",
      "tequila",
      "korn schnaps",
      "martini",
      "vermouth",
    ],
  ],

  // Tiefkühl & Fertiges
  [Pizza, ["pizza", "steinofenpizza", "flammkuchen", "baguettebrötchen"]],
  [IconBurger, ["burger", "hamburger", "cheeseburger"]],
  [Hamburger, ["burgerbrötchen", "burger buns", "buns"]],
  [Sandwich, ["sandwich", "toastie", "panini", "bagel"]],
  [Soup, ["ramen-suppe", "nudelsuppe", "tütensuppe", "fertigsuppe"]],

  // Drogerie
  [
    IconToiletPaper,
    [
      "toilettenpapier",
      "klopapier",
      "küchenrolle",
      "küchenpapier",
      "taschentuch",
      "taschentücher",
      "tempo",
      "feuchttücher",
    ],
  ],
  [
    Toothbrush,
    [
      "zahnbürste",
      "zahnpasta",
      "zahncreme",
      "zahnseide",
      "mundspülung",
      "interdentalbürste",
    ],
  ],
  [
    SoapDispenserDroplet,
    [
      "seife",
      "flüssigseife",
      "handseife",
      "duschgel",
      "shampoo",
      "spülung",
      "conditioner",
      "badezusatz",
      "schaumbad",
    ],
  ],
  [
    IconHandSanitizer,
    [
      "desinfektionsmittel",
      "creme",
      "handcreme",
      "bodylotion",
      "lotion",
      "sonnencreme",
      "sonnenmilch",
      "gesichtscreme",
      "lippenpflege",
      "vaseline",
    ],
  ],
  [
    IconPerfume,
    [
      "deo",
      "deodorant",
      "parfum",
      "parfüm",
      "rasierwasser",
      "haarspray",
      "haargel",
    ],
  ],
  [
    IconRazor,
    ["rasierer", "rasierklinge", "rasierschaum", "rasiergel", "klingen"],
  ],
  [
    IconDiaper,
    [
      "windel",
      "windeln",
      "pants",
      "binde",
      "binden",
      "tampon",
      "tampons",
      "slipeinlage",
      "wattepad",
      "wattestäbchen",
      "watte",
    ],
  ],
  [
    IconBabyBottle,
    [
      "babybrei",
      "babynahrung",
      "pre-milch",
      "folgemilch",
      "schnuller",
      "fläschchen",
    ],
  ],
  [Baby, ["babypuder", "babyöl"]],
  [
    Pill,
    [
      "tablette",
      "tabletten",
      "ibuprofen",
      "paracetamol",
      "aspirin",
      "vitamin",
      "vitamine",
      "magnesium",
      "nahrungsergänzung",
      "medikament",
      "kapseln",
    ],
  ],
  [Bandage, ["pflaster", "verband", "mullbinde"]],

  // Haushalt
  [
    IconSpray,
    [
      "reiniger",
      "allzweckreiniger",
      "glasreiniger",
      "badreiniger",
      "kalkreiniger",
      "fettlöser",
      "backofenreiniger",
      "putzmittel",
      "sprühflasche",
      "wc-reiniger",
      "essigreiniger",
      "entkalker",
    ],
  ],
  [
    SprayCan,
    [
      "spray",
      "insektenspray",
      "raumspray",
      "lufterfrischer",
      "imprägnierspray",
    ],
  ],
  [
    Bubbles,
    [
      "spülmittel",
      "geschirrspülmittel",
      "spültabs",
      "tabs",
      "klarspüler",
      "spülmaschinensalz",
      "regeneriersalz",
    ],
  ],
  [
    IconWashMachine,
    [
      "waschmittel",
      "weichspüler",
      "waschpulver",
      "colorwaschmittel",
      "vollwaschmittel",
      "fleckentferner",
      "wäschestärke",
      "entkalker für waschmaschine",
      "waschmaschinenreiniger",
    ],
  ],
  [
    IconBucket,
    [
      "schwamm",
      "schwämme",
      "lappen",
      "putzlappen",
      "spültuch",
      "mikrofasertuch",
      "wischmopp",
      "mopp",
      "eimer",
      "handschuhe",
      "gummihandschuhe",
      "scheuermilch",
      "stahlwolle",
    ],
  ],
  [IconVacuumCleaner, ["staubsaugerbeutel", "staubsauger", "staubtuch"]],
  [
    IconTrash,
    ["müllbeutel", "müllsack", "mülltüte", "biobeutel", "gelber sack"],
  ],
  [
    PaperBag,
    [
      "frischhaltefolie",
      "alufolie",
      "backpapier",
      "gefrierbeutel",
      "brotdose",
      "butterbrotpapier",
      "tüte",
      "tüten",
      "beutel",
    ],
  ],
  [IconFilter, ["kaffeefilter", "filter", "wasserfilter", "filterkartusche"]],
  [
    IconCandle,
    ["kerze", "teelicht", "streichhölzer", "feuerzeug", "grillanzünder"],
  ],
  [IconBattery, ["batterie", "batterien", "akku"]],
  [IconBulb, ["glühbirne", "leuchtmittel", "lampe"]],
  [IconFlower, ["blumen", "blumenstrauß", "blumenerde", "dünger", "erde"]],
  [Dog, ["hundefutter", "leckerli", "kauknochen", "hund"]],
  [Cat, ["katzenfutter", "katzenstreu", "katze"]],
  [
    IconPaw,
    [
      "tierfutter",
      "futter",
      "streu",
      "vogelfutter",
      "nassfutter",
      "trockenfutter",
    ],
  ],
  [
    IconMug,
    ["kakaopulver", "trinkschokolade", "instantkaffee", "löslicher kaffee"],
  ],
];

const TABELLE = new Map<string, ProduktSymbol>();
for (const [symbol, woerter] of EINTRAEGE) {
  for (const wort of woerter) {
    // Der erste Eintrag gewinnt – spätere Listen sollen nichts überschreiben.
    if (!TABELLE.has(wort)) {
      TABELLE.set(wort, symbol);
    }
  }
}

/** Kürzeste Wortendung, die für Komposita genutzt wird („ei“ nicht in „Brei“). */
const MIN_WORTENDE = 4;

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

function nachschlagen(wort: string, nurLange = false): ProduktSymbol | null {
  for (const variante of varianten(wort)) {
    if (nurLange && variante.length < MIN_WORTENDE) {
      continue;
    }
    const symbol = TABELLE.get(variante);
    if (symbol) {
      return symbol;
    }
  }
  return null;
}

const zwischenspeicher = new Map<string, ProduktSymbol | null>();

/**
 * Symbol zum Produktnamen oder `null`, wenn keins passt (dann gilt das Symbol
 * der Kategorie). Reihenfolge: ganzer Name, letztes Wort, längstes bekanntes
 * Wortende des letzten Worts, dann die übrigen Wörter von hinten.
 */
export function produktSymbol(name: string): ProduktSymbol | null {
  const normal = name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/^(bio|frische?r?|tk|tiefgekühlte?r?)[\s-]+/, "");
  if (!normal) {
    return null;
  }
  const bekannt = zwischenspeicher.get(normal);
  if (bekannt !== undefined) {
    return bekannt;
  }
  const woerter = normal.split(/[\s-]+/).filter((w) => w.length > 1);
  const kandidaten = [normal, ...woerter.slice().reverse()];
  let treffer: ProduktSymbol | null = null;
  for (const [i, kandidat] of kandidaten.entries()) {
    treffer = nachschlagen(kandidat);
    if (!treffer && i > 0) {
      for (let start = 1; start <= kandidat.length - MIN_WORTENDE; start++) {
        treffer = nachschlagen(kandidat.slice(start), true);
        if (treffer) {
          break;
        }
      }
    }
    if (treffer) {
      break;
    }
  }
  zwischenspeicher.set(normal, treffer);
  return treffer;
}
