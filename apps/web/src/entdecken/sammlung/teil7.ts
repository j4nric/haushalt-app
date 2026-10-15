import type { SammlungsRezept } from "./typ";

/** Frühling und Sommer: was März bis September frisch auf den Markt kommt. */
const REZEPTE: SammlungsRezept[] = [
  {
    id: "baerlauch-pesto-pasta",
    titel: "Bärlauch-Pesto-Pasta",
    dauer: 20,
    schlagwoerter: ["vegetarisch", "pasta", "italienisch", "leicht"],
    saison: [3, 4],
    zutaten: `250 g Spaghetti
1 Bund Bärlauch
40 g Parmesan
30 g Pinienkerne
80 ml Olivenöl
1 Zitrone
(150 g Kirschtomaten)`,
    gewuerze: `Salz
Pfeffer`,
    schritte: `Spaghetti in reichlich Salzwasser 9 bis 10 Minuten bissfest kochen.
Pinienkerne in einer trockenen Pfanne 3 Minuten goldbraun rösten.
Bärlauch waschen, trocken schütteln und grob schneiden.
Bärlauch mit Pinienkernen, Parmesan, Olivenöl und etwas Zitronensaft fein pürieren, salzen und pfeffern.
Nudeln abgießen, dabei eine Tasse Kochwasser auffangen.
Pesto mit etwas Kochwasser unter die Nudeln mischen, nach Belieben halbierte Kirschtomaten dazugeben.`,
  },
  {
    id: "spargel-risotto-erbsen",
    titel: "Spargel-Risotto mit Erbsen",
    dauer: 40,
    schlagwoerter: ["vegetarisch", "reis", "italienisch"],
    saison: [4, 5, 6],
    zutaten: `500 g Spargel, grün
150 g Risottoreis
1 Zwiebel
100 ml Weißwein
700 ml Gemüsebrühe
100 g Erbsen, TK
40 g Parmesan
2 EL Butter`,
    gewuerze: `1 Zitrone, Abrieb
Salz
Pfeffer`,
    schritte: `Holzige Spargelenden abschneiden, Stangen in 3 cm lange Stücke schneiden, Spitzen beiseitelegen.
Brühe erhitzen, Zwiebel fein würfeln und in 1 EL Butter 3 Minuten glasig dünsten.
Reis zugeben, 1 Minute mitrösten und mit Weißwein ablöschen.
Nach und nach heiße Brühe angießen und den Reis unter Rühren 18 Minuten garen.
Nach 10 Minuten die Spargelstücke, nach 15 Minuten Spitzen und Erbsen zugeben.
Restliche Butter und Parmesan unterrühren, mit Zitronenabrieb, Salz und Pfeffer abschmecken und 2 Minuten ruhen lassen.`,
  },
  {
    id: "ofenspargel-kraeuterbutter",
    titel: "Weißer Spargel aus dem Ofen mit Kräuterbutter",
    dauer: 50,
    schlagwoerter: ["vegetarisch", "ofen", "kartoffeln", "leicht"],
    saison: [4, 5, 6],
    zutaten: `1 kg Spargel, weiß
500 g Frühkartoffeln
60 g Kräuterbutter
1 Zitrone
2 EL Olivenöl`,
    gewuerze: `1 TL Zucker
Salz
Pfeffer
(Petersilie)`,
    schritte: `Ofen auf 200 °C Umluft vorheizen.
Kartoffeln waschen, halbieren, mit Olivenöl und Salz mischen und auf einem Blech 15 Minuten vorbacken.
Spargel schälen und die holzigen Enden abschneiden.
Spargel auf ein großes Stück Backpapier legen, mit Salz, Zucker und Zitronenscheiben belegen und Kräuterbutter in Flocken darauf verteilen.
Papier zu einem Päckchen falten, neben die Kartoffeln aufs Blech legen und alles 25 bis 30 Minuten garen.
Päckchen öffnen, Spargel mit der geschmolzenen Butter und den Kartoffeln servieren.`,
  },
  {
    id: "rhabarber-crumble",
    titel: "Rhabarber-Erdbeer-Crumble mit Vanillesoße",
    dauer: 50,
    schlagwoerter: ["vegetarisch", "süß", "ofen", "kinder"],
    saison: [4, 5, 6],
    zutaten: `500 g Rhabarber
250 g Erdbeeren
120 g Mehl
50 g Haferflocken
100 g Butter, kalt
100 g Zucker
500 ml Vanillesoße`,
    gewuerze: `1 Pck. Vanillezucker
1 Prise Salz
(1 TL Zimt)`,
    schritte: `Ofen auf 180 °C Umluft vorheizen.
Rhabarber putzen und in 2 cm lange Stücke schneiden, Erdbeeren halbieren.
Obst mit 50 g Zucker und Vanillezucker in einer Auflaufform mischen und 10 Minuten ziehen lassen.
Mehl, Haferflocken, restlichen Zucker, Salz und kalte Butter mit den Fingern zu Streuseln reiben.
Streusel über das Obst geben und 30 Minuten goldbraun backen.
5 Minuten abkühlen lassen und mit warmer oder kalter Vanillesoße servieren.`,
  },
  {
    id: "erdbeer-spinat-salat-feta",
    titel: "Erdbeer-Spinat-Salat mit Feta",
    dauer: 15,
    schlagwoerter: ["vegetarisch", "salat", "leicht"],
    saison: [5, 6, 7],
    zutaten: `150 g Babyspinat
300 g Erdbeeren
150 g Feta
40 g Walnüsse
1 Zwiebel, rot
3 EL Olivenöl
2 EL Essig, Balsamico
1 TL Honig
1 Baguette`,
    gewuerze: `Salz
Pfeffer
(Minze)`,
    schritte: `Walnüsse in einer trockenen Pfanne 3 Minuten rösten und grob hacken.
Spinat waschen und trocken schleudern, Erdbeeren vierteln, Zwiebel in feine Ringe schneiden.
Olivenöl, Essig, Honig, Salz und Pfeffer zu einem Dressing verrühren.
Spinat, Erdbeeren und Zwiebel mit dem Dressing mischen.
Feta darüberbröseln, Walnüsse und nach Belieben Minze darüberstreuen und mit Baguette servieren.`,
  },
  {
    id: "gazpacho",
    titel: "Gazpacho mit Röstbrot",
    dauer: 50,
    schlagwoerter: ["vegan", "suppe", "mediterran", "leicht"],
    saison: [7, 8],
    zutaten: `800 g Tomaten, reif
1 Gurke
1 Paprika, rot
1 Zwiebel, klein
1 Zehe Knoblauch
2 Scheiben Weißbrot
4 EL Olivenöl
2 EL Essig, Sherry
1 Ciabatta`,
    gewuerze: `1 TL Paprikapulver, edelsüß
Salz
Pfeffer
(Basilikum)`,
    schritte: `Tomaten, Gurke, Paprika und Zwiebel grob würfeln, ein paar Würfel zum Bestreuen beiseitelegen.
Weißbrot ohne Rinde in etwas Wasser 5 Minuten einweichen und ausdrücken.
Gemüse mit Brot, Knoblauch, 3 EL Olivenöl, Essig und Gewürzen fein pürieren, eventuell etwas kaltes Wasser zugeben.
Suppe kräftig abschmecken und zugedeckt 30 Minuten im Kühlschrank durchziehen lassen.
Ciabatta in Scheiben schneiden, mit restlichem Öl beträufeln und in einer Pfanne je Seite 2 Minuten rösten.
Gazpacho kalt mit den Gemüsewürfeln und dem Röstbrot servieren.`,
  },
  {
    id: "grillgemuese-halloumi",
    titel: "Grillgemüse mit Halloumi",
    dauer: 30,
    schlagwoerter: ["vegetarisch", "pfanne", "mediterran", "leicht"],
    saison: [6, 7, 8],
    zutaten: `250 g Halloumi
1 Zucchini
1 Aubergine
1 Paprika, rot
1 Zwiebel, rot
4 EL Olivenöl
1 Zitrone
1 Fladenbrot
(150 g Joghurt)`,
    gewuerze: `1 TL Oregano
1 Zehe Knoblauch
Salz
Pfeffer
(Minze)`,
    schritte: `Zucchini und Aubergine in 1 cm dicke Scheiben, Paprika in breite Streifen und Zwiebel in Spalten schneiden.
Gemüse mit 3 EL Olivenöl, gepresstem Knoblauch, Oregano und Salz mischen und 5 Minuten ziehen lassen.
Gemüse portionsweise in einer Grillpfanne oder auf dem Grill je Seite 3 bis 4 Minuten grillen.
Halloumi in Scheiben schneiden, mit restlichem Öl bestreichen und je Seite 2 Minuten goldbraun grillen.
Fladenbrot 2 Minuten mitwärmen.
Alles mit Zitronensaft beträufeln, pfeffern und nach Belieben mit Joghurt und Minze servieren.`,
  },
  {
    id: "zucchini-lasagne-ricotta",
    titel: "Zucchini-Lasagne mit Ricotta",
    dauer: 70,
    schlagwoerter: ["vegetarisch", "ofen", "pasta", "italienisch"],
    saison: [6, 7, 8, 9],
    zutaten: `3 Zucchini
150 g Lasagneplatten
250 g Ricotta
1 Dose Tomaten, passiert
125 g Mozzarella
1 Zwiebel
2 Zehen Knoblauch
30 g Parmesan
2 EL Olivenöl`,
    gewuerze: `Basilikum
Oregano
1 Prise Muskat
Salz
Pfeffer`,
    schritte: `Ofen auf 180 °C Umluft vorheizen.
Zwiebel und Knoblauch würfeln, im Olivenöl 3 Minuten andünsten, Tomaten zugeben und 10 Minuten köcheln lassen, mit Oregano, Salz und Pfeffer würzen.
Zucchini längs in dünne Scheiben hobeln, Ricotta mit Parmesan, Muskat, Salz und Pfeffer verrühren.
Abwechselnd Tomatensoße, Lasagneplatten, Zucchini und Ricotta in eine Auflaufform schichten, mit Soße abschließen.
Mozzarella zerzupfen und darauf verteilen.
40 Minuten goldbraun backen und vor dem Anschneiden 10 Minuten ruhen lassen.`,
  },
  {
    id: "tomaten-galette-ziegenkaese",
    titel: "Tomaten-Galette mit Ziegenkäse",
    dauer: 75,
    schlagwoerter: ["vegetarisch", "ofen", "mediterran"],
    saison: [7, 8, 9],
    zutaten: `200 g Mehl
120 g Butter, kalt
500 g Tomaten, bunt
100 g Ziegenkäse
1 Ei
1 EL Senf
1 EL Olivenöl`,
    gewuerze: `Thymian
Salz
Pfeffer
(Basilikum)`,
    schritte: `Mehl, kalte Butter in Stücken, 1 Prise Salz und 4 EL kaltes Wasser rasch verkneten und 20 Minuten kühlen.
Tomaten in Scheiben schneiden, salzen und auf Küchenpapier 10 Minuten abtropfen lassen.
Ofen auf 200 °C Ober-/Unterhitze vorheizen.
Teig auf Backpapier rund ausrollen, mit Senf bestreichen und einen 4 cm breiten Rand frei lassen.
Tomaten und zerbröselten Ziegenkäse darauf verteilen, mit Thymian, Pfeffer und Öl würzen und den Rand darüberklappen.
Rand mit verquirltem Ei bestreichen und 35 Minuten goldbraun backen.
5 Minuten abkühlen lassen und nach Belieben mit Basilikum servieren.`,
  },
  {
    id: "pfifferlinge-serviettenknoedel",
    titel: "Pfifferlinge in Rahm mit Serviettenknödel",
    dauer: 55,
    schlagwoerter: ["vegetarisch", "klassiker", "deftig"],
    saison: [7, 8, 9],
    zutaten: `400 g Pfifferlinge
250 g Brötchen, altbacken
200 ml Milch
2 Eier
2 Zwiebeln
150 ml Sahne
3 EL Butter
1 Bund Petersilie`,
    gewuerze: `1 Prise Muskat
Salz
Pfeffer`,
    schritte: `Brötchen würfeln, mit warmer Milch übergießen und 10 Minuten einweichen.
Eine Zwiebel würfeln, in 1 EL Butter 3 Minuten dünsten und mit Eiern, halber Petersilie, Salz und Muskat unter die Brotmasse kneten.
Masse zu einer Rolle formen, fest in ein nasses Küchentuch wickeln, die Enden zubinden und 30 Minuten in siedendem Salzwasser ziehen lassen.
Pfifferlinge trocken putzen, große halbieren, zweite Zwiebel fein würfeln.
Pilze in restlicher Butter bei starker Hitze 5 Minuten braten, Zwiebel 1 Minute mitbraten.
Sahne angießen und 3 Minuten einkochen lassen, salzen und pfeffern.
Knödel auswickeln, in Scheiben schneiden und mit den Rahmpilzen und restlicher Petersilie servieren.`,
  },
  {
    id: "fruehkartoffeln-kraeuterquark",
    titel: "Neue Kartoffeln mit Kräuterquark",
    dauer: 25,
    schlagwoerter: ["vegetarisch", "kartoffeln", "kinder", "leicht"],
    saison: [5, 6, 7],
    zutaten: `800 g Frühkartoffeln
500 g Quark
100 ml Milch
1 Bund Schnittlauch
1 Bund Petersilie
1 Zehe Knoblauch
1 Gurke
1 EL Butter`,
    gewuerze: `Dill
Salz
Pfeffer`,
    schritte: `Kartoffeln gründlich waschen und mit Schale in Salzwasser 15 bis 20 Minuten garen.
Quark mit Milch glatt rühren.
Kräuter fein hacken, Knoblauch pressen, beides unter den Quark rühren und mit Salz und Pfeffer abschmecken.
Gurke in Scheiben schneiden und leicht salzen.
Kartoffeln abgießen, in der Butter schwenken und mit Kräuterquark und Gurke servieren.`,
  },
  {
    id: "erbsen-minz-suppe",
    titel: "Erbsen-Minz-Suppe",
    dauer: 20,
    schlagwoerter: ["vegetarisch", "suppe", "kinder", "leicht"],
    saison: [5, 6],
    zutaten: `500 g Erbsen, TK
1 Zwiebel
1 Kartoffel, mehligkochend
600 ml Gemüsebrühe
100 g Crème fraîche
1 EL Butter
(1 Baguette)`,
    gewuerze: `Minze
1 Zitrone, Saft
Salz
Pfeffer`,
    schritte: `Zwiebel würfeln, Kartoffel schälen und klein würfeln.
Zwiebel in Butter 3 Minuten glasig dünsten.
Kartoffel und Brühe zugeben und 8 Minuten köcheln lassen.
Erbsen zufügen und weitere 4 Minuten garen.
Minzblätter dazugeben, alles fein pürieren und die Hälfte der Crème fraîche einrühren.
Mit Zitronensaft, Salz und Pfeffer abschmecken, mit restlicher Crème fraîche und nach Belieben Baguette servieren.`,
  },
  {
    id: "kirschmichel",
    titel: "Kirschmichel",
    dauer: 60,
    schlagwoerter: ["vegetarisch", "süß", "ofen", "kinder", "klassiker"],
    saison: [6, 7],
    zutaten: `4 Brötchen, altbacken
300 ml Milch
3 Eier
60 g Zucker
50 g Butter
500 g Kirschen
50 g Mandeln, gemahlen
(1 EL Puderzucker)`,
    gewuerze: `1 Pck. Vanillezucker
1 TL Zimt
1 Prise Salz`,
    schritte: `Ofen auf 180 °C Umluft vorheizen, eine Auflaufform mit etwas Butter fetten.
Brötchen in Scheiben schneiden, mit warmer Milch übergießen und 10 Minuten einweichen.
Kirschen waschen und entsteinen.
Weiche Butter mit Zucker, Vanillezucker und Eigelben schaumig rühren, Mandeln, Zimt und die Brotmasse unterheben.
Eiweiße mit der Prise Salz steif schlagen und unterziehen, dann die Kirschen untermischen.
Masse in die Form füllen und 40 Minuten goldbraun backen.
5 Minuten abkühlen lassen und nach Belieben mit Puderzucker bestäuben.`,
  },
  {
    id: "panzanella",
    titel: "Panzanella",
    dauer: 25,
    schlagwoerter: ["vegan", "salat", "italienisch", "leicht"],
    saison: [7, 8, 9],
    zutaten: `200 g Ciabatta, vom Vortag
500 g Tomaten, reif
1 Gurke
1 Paprika, gelb
1 Zwiebel, rot
1 EL Kapern
5 EL Olivenöl
2 EL Essig, Rotwein`,
    gewuerze: `Basilikum
1 Zehe Knoblauch
Salz
Pfeffer`,
    schritte: `Ciabatta in Würfel schneiden und in 2 EL Olivenöl in einer Pfanne 5 Minuten goldbraun rösten.
Tomaten grob würfeln, salzen und in einer Schüssel 5 Minuten Saft ziehen lassen.
Gurke und Paprika würfeln, Zwiebel in feine Ringe schneiden.
Restliches Öl mit Essig, gepresstem Knoblauch, Salz und Pfeffer verrühren.
Gemüse, Kapern, Brot und Dressing mit den Tomaten mischen und 10 Minuten durchziehen lassen.
Mit reichlich Basilikum servieren.`,
  },
  {
    id: "gefuellte-tomaten-hack",
    titel: "Gefüllte Tomaten mit Hackfleisch und Reis",
    dauer: 60,
    schlagwoerter: ["fleisch", "ofen", "reis", "mediterran", "kinder"],
    saison: [7, 8, 9],
    zutaten: `4 Fleischtomaten
250 g Hackfleisch, gemischt
80 g Reis
1 Zwiebel
1 Zehe Knoblauch
1 Dose Tomaten, passiert
50 g Feta
2 EL Olivenöl`,
    gewuerze: `1 TL Oregano
1 TL Paprikapulver
Petersilie
Salz
Pfeffer`,
    schritte: `Reis in Salzwasser 10 Minuten vorgaren und abgießen.
Ofen auf 180 °C Umluft vorheizen.
Von den Tomaten einen Deckel abschneiden, Tomaten aushöhlen und das Innere hacken.
Zwiebel und Knoblauch würfeln und mit dem Hack im Olivenöl 5 Minuten krümelig braten.
Reis, gehacktes Tomatenfleisch und Gewürze untermischen und die Tomaten damit füllen.
Passierte Tomaten in eine Form geben, Tomaten hineinsetzen, Feta darüberbröseln und Deckel auflegen.
30 Minuten backen und mit Petersilie bestreut servieren.`,
  },
  {
    id: "haehnchenspiesse-tzatziki",
    titel: "Hähnchenspieße mit Tzatziki und Fladenbrot",
    dauer: 45,
    schlagwoerter: ["geflügel", "mediterran", "kinder", "pfanne"],
    saison: [6, 7, 8],
    zutaten: `400 g Hähnchenbrust
1 Paprika, rot
1 Zucchini
4 EL Olivenöl
1 Zitrone
250 g Joghurt, griechisch
1 Gurke, klein
2 Zehen Knoblauch
1 Fladenbrot`,
    gewuerze: `1 TL Oregano
1 TL Paprikapulver
Dill
Salz
Pfeffer`,
    schritte: `Hähnchen in 3 cm große Würfel schneiden und mit 3 EL Öl, Zitronensaft, einer gepressten Knoblauchzehe, Oregano und Paprika 20 Minuten marinieren.
Für das Tzatziki Gurke raspeln, salzen und nach 5 Minuten gut ausdrücken.
Gurke mit Joghurt, restlichem Knoblauch, Dill, Salz und Pfeffer verrühren.
Paprika und Zucchini in Stücke schneiden und abwechselnd mit dem Hähnchen auf Spieße stecken.
Spieße in einer Grillpfanne oder auf dem Grill rundum 10 bis 12 Minuten braten, bis das Fleisch durch ist.
Fladenbrot 2 Minuten mitwärmen und alles mit dem Tzatziki servieren.`,
  },
  {
    id: "lachs-blech-gruener-spargel",
    titel: "Lachs vom Blech mit grünem Spargel",
    dauer: 30,
    schlagwoerter: ["fisch", "ofen", "kartoffeln", "leicht"],
    saison: [4, 5, 6],
    zutaten: `2 Stück Lachsfilet
500 g Spargel, grün
400 g Frühkartoffeln
1 Zitrone
3 EL Olivenöl
(100 g Crème fraîche)`,
    gewuerze: `Dill
Salz
Pfeffer`,
    schritte: `Ofen auf 200 °C Umluft vorheizen.
Kartoffeln halbieren, mit 2 EL Öl und Salz mischen und auf dem Blech 10 Minuten vorbacken.
Holzige Enden vom Spargel abschneiden, Spargel mit restlichem Öl und Salz mischen.
Spargel und Lachs zu den Kartoffeln aufs Blech legen, Lachs salzen und mit Zitronenscheiben belegen.
Alles weitere 12 bis 15 Minuten backen, bis der Lachs gar ist.
Mit Dill und Pfeffer bestreuen und nach Belieben mit Crème fraîche servieren.`,
  },
  {
    id: "wassermelone-feta-salat",
    titel: "Wassermelonen-Salat mit Feta und Minze",
    dauer: 15,
    schlagwoerter: ["vegetarisch", "salat", "leicht"],
    saison: [7, 8],
    zutaten: `800 g Wassermelone
150 g Feta
1 Gurke
1 Zwiebel, rot
3 EL Olivenöl
1 Limette
(1 Ciabatta)`,
    gewuerze: `Minze
Salz
Pfeffer`,
    schritte: `Melone schälen und in mundgerechte Würfel schneiden, Gurke würfeln.
Zwiebel in feine Ringe schneiden und mit Limettensaft und einer Prise Salz 5 Minuten ziehen lassen.
Olivenöl mit der Zwiebel samt Saft und Pfeffer verrühren.
Melone und Gurke auf einer Platte verteilen, Dressing darübergeben.
Feta darüberbröseln, mit Minze bestreuen und nach Belieben mit Ciabatta servieren.`,
  },
  {
    id: "radieschen-gurken-salat-bratkartoffeln",
    titel: "Radieschen-Gurken-Salat mit Bratkartoffeln",
    dauer: 35,
    schlagwoerter: ["vegetarisch", "salat", "kartoffeln", "kinder"],
    saison: [5, 6, 7],
    zutaten: `700 g Kartoffeln, festkochend
1 Bund Radieschen
1 Gurke
1 Zwiebel
150 g Schmand
1 EL Essig
3 EL Öl
(2 Eier)`,
    gewuerze: `Dill
Schnittlauch
1 TL Zucker
Salz
Pfeffer`,
    schritte: `Kartoffeln mit Schale in Salzwasser 15 Minuten vorgaren, abgießen, kurz ausdampfen lassen und in Scheiben schneiden.
Kartoffeln in einer großen Pfanne im Öl 10 bis 12 Minuten rundum knusprig braten, Zwiebelwürfel die letzten 3 Minuten mitbraten.
Inzwischen Radieschen und Gurke in dünne Scheiben hobeln.
Schmand mit Essig, Zucker, Salz, Pfeffer und gehacktem Dill verrühren und mit dem Gemüse mischen.
Nach Belieben Eier in der Pfanne 4 Minuten zu Spiegeleiern braten.
Bratkartoffeln salzen, mit Schnittlauch bestreuen und mit dem Salat servieren.`,
  },
  {
    id: "mairuebchen-gemuese",
    titel: "Mairübchen-Gemüse mit Spiegelei und Kartoffeln",
    dauer: 30,
    schlagwoerter: ["vegetarisch", "kartoffeln", "leicht"],
    saison: [5, 6],
    zutaten: `500 g Mairübchen
2 Möhren
500 g Frühkartoffeln
100 ml Gemüsebrühe
2 EL Butter
4 Eier`,
    gewuerze: `1 TL Zucker
Schnittlauch
Petersilie
Salz
Pfeffer`,
    schritte: `Kartoffeln waschen und mit Schale in Salzwasser 20 Minuten garen.
Mairübchen schälen und in Spalten schneiden, das zarte Grün fein hacken, Möhren in Scheiben schneiden.
Rübchen und Möhren in 1 EL Butter 2 Minuten andünsten, mit Zucker bestreuen und mit Brühe ablöschen.
Zugedeckt 8 bis 10 Minuten bissfest garen, bis die Brühe fast verkocht ist.
Eier in restlicher Butter bei mittlerer Hitze 4 Minuten zu Spiegeleiern braten.
Gemüse mit Kräutern und dem Rübengrün mischen, abschmecken und mit Kartoffeln und Spiegeleiern servieren.`,
  },
  {
    id: "kabeljau-zuckerschoten-fruehkartoffeln",
    titel: "Kabeljau mit Zuckerschoten und Frühkartoffeln",
    dauer: 30,
    schlagwoerter: ["fisch", "pfanne", "kartoffeln", "kinder", "leicht"],
    saison: [5, 6, 7],
    zutaten: `300 g Kabeljau, Filet
500 g Frühkartoffeln
200 g Zuckerschoten
1 Zitrone
2 EL Butter
1 EL Öl`,
    gewuerze: `Dill
Salz
Pfeffer`,
    schritte: `Kartoffeln waschen, halbieren und in Salzwasser 15 bis 20 Minuten garen.
Zuckerschoten putzen und in Salzwasser 2 Minuten blanchieren, dann kalt abschrecken.
Fisch trocken tupfen, salzen und im Öl bei mittlerer Hitze je Seite 3 bis 4 Minuten braten.
Butter in einer zweiten Pfanne aufschäumen, Zuckerschoten und abgegossene Kartoffeln darin 2 Minuten schwenken.
Mit Zitronensaft, Dill, Salz und Pfeffer abschmecken und mit dem Fisch servieren.`,
  },
  {
    id: "kohlrabi-schnitzel",
    titel: "Kohlrabi-Schnitzel mit Kartoffelpüree",
    dauer: 40,
    schlagwoerter: ["vegetarisch", "pfanne", "kinder", "kartoffeln"],
    saison: [5, 6, 7],
    zutaten: `2 Kohlrabi
2 Eier
4 EL Mehl
80 g Semmelbrösel
700 g Kartoffeln, mehligkochend
150 ml Milch
2 EL Butter
4 EL Öl
1 Zitrone`,
    gewuerze: `1 Prise Muskat
Salz
Pfeffer`,
    schritte: `Kartoffeln schälen, würfeln und in Salzwasser 20 Minuten weich kochen.
Kohlrabi schälen, in 1 cm dicke Scheiben schneiden und in Salzwasser 5 Minuten vorgaren, dann trocken tupfen.
Scheiben salzen und nacheinander in Mehl, verquirltem Ei und Semmelbröseln wenden.
Im heißen Öl je Seite 3 Minuten goldbraun braten.
Kartoffeln abgießen, mit warmer Milch und Butter zu Püree stampfen und mit Muskat und Salz würzen.
Schnitzel mit Zitronenspalten und Püree servieren.`,
  },
  {
    id: "sommer-spaghetti-rohe-tomaten",
    titel: "Sommer-Spaghetti mit rohen Tomaten",
    dauer: 20,
    schlagwoerter: ["vegetarisch", "pasta", "italienisch", "leicht"],
    saison: [7, 8, 9],
    zutaten: `250 g Spaghetti
500 g Tomaten, reif
2 Zehen Knoblauch
4 EL Olivenöl
1 Zitrone
(30 g Parmesan)`,
    gewuerze: `Basilikum
1 Prise Chiliflocken
Salz
Pfeffer`,
    schritte: `Tomaten klein würfeln, Knoblauch fein hacken.
Tomaten mit Knoblauch, Olivenöl, etwas Zitronenabrieb, Salz und Chili mischen und 10 Minuten ziehen lassen.
Spaghetti in Salzwasser 9 bis 10 Minuten bissfest kochen.
Nudeln abgießen und heiß unter die Tomaten mischen.
Mit zerzupftem Basilikum und Pfeffer abschmecken und nach Belieben Parmesan darüberreiben.`,
  },
  {
    id: "kalte-gurkensuppe-dill",
    titel: "Kalte Gurkensuppe mit Dill",
    dauer: 15,
    schlagwoerter: ["vegetarisch", "suppe", "leicht"],
    saison: [6, 7, 8],
    zutaten: `2 Gurken
400 g Joghurt
1 Zehe Knoblauch
200 ml Gemüsebrühe, kalt
2 EL Olivenöl
30 g Walnüsse
1 Baguette`,
    gewuerze: `Dill
1 Zitrone, Saft
Salz
Pfeffer`,
    schritte: `Walnüsse in einer trockenen Pfanne 3 Minuten rösten und hacken.
Gurken schälen, ein Stück fein würfeln und beiseitelegen, den Rest grob schneiden.
Gurke mit Joghurt, Knoblauch, Brühe, Öl und reichlich Dill fein pürieren.
Mit Zitronensaft, Salz und Pfeffer abschmecken und 5 Minuten kalt stellen.
Mit Gurkenwürfeln, Walnüssen und Dill bestreuen und mit Baguette servieren.`,
  },
  {
    id: "gnocchi-zucchini-salbeibutter",
    titel: "Gnocchi mit Zucchini und Salbeibutter",
    dauer: 25,
    schlagwoerter: ["vegetarisch", "pfanne", "italienisch", "kinder"],
    saison: [6, 7, 8, 9],
    zutaten: `500 g Gnocchi
2 Zucchini
200 g Kirschtomaten
50 g Butter
40 g Parmesan
1 EL Olivenöl
1 Zitrone`,
    gewuerze: `Salbei
Salz
Pfeffer`,
    schritte: `Zucchini in halbe Scheiben schneiden, Kirschtomaten halbieren.
Gnocchi in der Pfanne im Olivenöl 6 bis 8 Minuten rundum goldbraun braten.
Zucchini zugeben und 4 Minuten mitbraten.
Butter und Salbeiblätter dazugeben und 2 Minuten aufschäumen lassen, bis die Butter nussig duftet.
Tomaten unterschwenken, mit Zitronenabrieb, Salz und Pfeffer abschmecken.
Mit gehobeltem Parmesan servieren.`,
  },
];

export default REZEPTE;
