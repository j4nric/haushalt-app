import type { SammlungsRezept } from "./typ";

/** Teil 1: Nudeln, Reis und Getreide. */
const REZEPTE: SammlungsRezept[] = [
  {
    id: "spaghetti-bolognese",
    titel: "Spaghetti Bolognese",
    dauer: 50,
    schlagwoerter: ["pasta", "fleisch", "kinder", "klassiker", "italienisch"],
    saison: [],
    zutaten: `250 g Spaghetti
300 g Hackfleisch, gemischt
1 Zwiebel
1 Möhre
1 Zehe Knoblauch
1 Dose Tomaten, gehackt
2 EL Tomatenmark
1 EL Olivenöl
(30 g Parmesan)`,
    gewuerze: `Salz
Pfeffer
1 TL Oregano
1 Prise Zucker`,
    schritte: `Zwiebel, Möhre und Knoblauch fein würfeln.
Hackfleisch im Olivenöl krümelig anbraten, Gemüse kurz mitbraten.
Tomatenmark einrühren und kurz anrösten.
Tomaten zugeben, würzen und zugedeckt 25 Minuten köcheln lassen.
Spaghetti nach Packungsangabe in Salzwasser kochen.
Soße abschmecken und mit den Spaghetti und Parmesan servieren.`,
  },
  {
    id: "spaghetti-carbonara",
    titel: "Spaghetti Carbonara",
    dauer: 25,
    schlagwoerter: ["pasta", "fleisch", "klassiker", "italienisch"],
    saison: [],
    zutaten: `250 g Spaghetti
120 g Speck, gewürfelt
3 Eier
50 g Parmesan, gerieben
1 TL Olivenöl`,
    gewuerze: `Salz
Pfeffer, frisch gemahlen`,
    schritte: `Spaghetti in reichlich Salzwasser bissfest kochen.
Speck im Olivenöl knusprig auslassen.
Eier mit Parmesan und viel Pfeffer verquirlen.
Spaghetti abgießen, dabei eine Tasse Nudelwasser auffangen.
Nudeln zum Speck geben, Pfanne vom Herd nehmen.
Eiermasse und etwas Nudelwasser unterrühren, bis eine cremige Soße entsteht.`,
  },
  {
    id: "penne-tomate-ricotta",
    titel: "Penne mit Tomaten-Ricotta-Soße",
    dauer: 25,
    schlagwoerter: ["pasta", "vegetarisch", "kinder", "italienisch"],
    saison: [],
    zutaten: `250 g Penne
1 Dose Tomaten, passiert
125 g Ricotta
1 Zwiebel
1 Zehe Knoblauch
1 EL Olivenöl
(30 g Parmesan)`,
    gewuerze: `Salz
Pfeffer
1 TL Oregano
Basilikum, zum Bestreuen`,
    schritte: `Penne nach Packungsangabe kochen.
Zwiebel und Knoblauch fein würfeln und im Olivenöl glasig dünsten.
Tomaten zugeben, würzen und 10 Minuten köcheln lassen.
Ricotta einrühren, bis die Soße cremig ist.
Penne untermischen und mit Basilikum und Parmesan servieren.`,
  },
  {
    id: "lasagne-klassisch",
    titel: "Lasagne",
    dauer: 90,
    schlagwoerter: ["pasta", "fleisch", "ofen", "klassiker", "italienisch"],
    saison: [],
    zutaten: `200 g Lasagnenudeln
300 g Hackfleisch, gemischt
1 Zwiebel
1 Möhre
1 Dose Tomaten, gehackt
2 EL Tomatenmark
30 g Butter
30 g Mehl
400 ml Milch
1 Mozzarella
40 g Parmesan, gerieben
1 EL Olivenöl`,
    gewuerze: `Salz
Pfeffer
1 TL Oregano
1 Prise Muskat`,
    schritte: `Zwiebel und Möhre würfeln, mit dem Hackfleisch im Olivenöl anbraten.
Tomatenmark und Tomaten zugeben, würzen und 20 Minuten köcheln lassen.
Butter schmelzen, Mehl anschwitzen, Milch einrühren und zu einer Béchamel aufkochen, mit Salz und Muskat würzen.
Ofen auf 180 °C Umluft vorheizen.
Fleischsoße, Lasagneplatten und Béchamel abwechselnd in eine Auflaufform schichten.
Mit Béchamel abschließen, mit Mozzarella und Parmesan belegen.
35–40 Minuten backen und vor dem Anschneiden 10 Minuten ruhen lassen.`,
  },
  {
    id: "kaesespaetzle",
    titel: "Käsespätzle mit Röstzwiebeln",
    dauer: 30,
    schlagwoerter: ["vegetarisch", "kinder", "klassiker", "deftig"],
    saison: [],
    zutaten: `500 g Spätzle, aus dem Kühlregal
150 g Bergkäse, gerieben
2 Zwiebeln
30 g Butter
(1 Kopf Salat)`,
    gewuerze: `Salz
Pfeffer
1 Prise Muskat
Schnittlauch, zum Bestreuen`,
    schritte: `Ofen auf 180 °C Umluft vorheizen.
Zwiebeln in Ringe schneiden und in der Hälfte der Butter goldbraun braten.
Spätzle in der restlichen Butter erwärmen und würzen.
Spätzle und Käse abwechselnd in eine Auflaufform schichten.
10 Minuten im Ofen backen, bis der Käse geschmolzen ist.
Mit Röstzwiebeln und Schnittlauch servieren.`,
  },
  {
    id: "gemuese-risotto",
    titel: "Gemüse-Risotto",
    dauer: 40,
    schlagwoerter: ["reis", "vegetarisch", "kinder", "italienisch"],
    saison: [],
    zutaten: `200 g Risottoreis
1 Zucchini
1 Möhre
100 g Erbsen, tiefgekühlt
1 Zwiebel
750 ml Gemüsebrühe
100 ml Weißwein
30 g Butter
40 g Parmesan, gerieben
1 EL Olivenöl`,
    gewuerze: `Salz
Pfeffer`,
    schritte: `Zwiebel fein würfeln, Zucchini und Möhre klein schneiden.
Zwiebel im Olivenöl glasig dünsten, Reis zugeben und kurz mitrösten.
Mit Weißwein ablöschen und einkochen lassen.
Nach und nach heiße Brühe angießen und unter Rühren 20 Minuten garen.
Nach 10 Minuten Möhre und Zucchini, kurz vor Schluss die Erbsen zugeben.
Butter und Parmesan unterrühren, abschmecken und 2 Minuten ruhen lassen.`,
  },
  {
    id: "pilzrisotto",
    titel: "Pilzrisotto",
    dauer: 40,
    schlagwoerter: ["reis", "vegetarisch", "italienisch"],
    saison: [9, 10, 11],
    zutaten: `200 g Risottoreis
300 g Champignons
1 Zwiebel
1 Zehe Knoblauch
750 ml Gemüsebrühe
100 ml Weißwein
30 g Butter
40 g Parmesan, gerieben
2 EL Olivenöl`,
    gewuerze: `Salz
Pfeffer
1 Zweig Thymian
Petersilie, zum Bestreuen`,
    schritte: `Champignons in Scheiben schneiden und in 1 EL Olivenöl kräftig anbraten, beiseitestellen.
Zwiebel und Knoblauch würfeln und im restlichen Öl glasig dünsten.
Reis zugeben, kurz rösten und mit Weißwein ablöschen.
Brühe nach und nach angießen und 20 Minuten unter Rühren garen.
Pilze, Butter und Parmesan unterrühren.
Abschmecken und mit Petersilie bestreut servieren.`,
  },
  {
    id: "gebratener-reis-ei",
    titel: "Gebratener Reis mit Ei und Gemüse",
    dauer: 25,
    schlagwoerter: ["reis", "vegetarisch", "pfanne", "asiatisch", "kinder"],
    saison: [],
    zutaten: `200 g Reis
3 Eier
1 Paprika
1 Möhre
100 g Erbsen, tiefgekühlt
2 Frühlingszwiebeln
3 EL Sojasoße
2 EL Rapsöl`,
    gewuerze: `Salz
Pfeffer
1 TL Ingwer, gerieben`,
    schritte: `Reis kochen und gut abkühlen lassen (am besten vom Vortag).
Paprika und Möhre fein würfeln, Frühlingszwiebeln in Ringe schneiden.
Eier in 1 EL Öl zu Rührei braten und herausnehmen.
Gemüse im restlichen Öl 4 Minuten scharf anbraten.
Reis zugeben und unter Wenden braten, bis er leicht knusprig ist.
Rührei und Sojasoße untermischen und abschmecken.`,
  },
  {
    id: "curry-reispfanne-haehnchen",
    titel: "Curry-Reispfanne mit Hähnchen",
    dauer: 30,
    schlagwoerter: ["reis", "geflügel", "pfanne", "asiatisch"],
    saison: [],
    zutaten: `200 g Basmatireis
300 g Hähnchenbrust
1 Paprika
1 Zucchini
1 Zwiebel
200 ml Kokosmilch
2 EL Rapsöl`,
    gewuerze: `Salz
2 TL Currypulver
1 Prise Chili`,
    schritte: `Reis nach Packungsangabe kochen.
Hähnchen in Streifen, Gemüse in Würfel schneiden.
Hähnchen im Öl rundum anbraten, herausnehmen.
Zwiebel, Paprika und Zucchini 5 Minuten braten, Curry darüberstäuben.
Mit Kokosmilch ablöschen, Hähnchen zugeben und 5 Minuten köcheln lassen.
Reis untermischen und abschmecken.`,
  },
  {
    id: "couscous-bowl",
    titel: "Couscous-Bowl mit Kichererbsen",
    dauer: 20,
    schlagwoerter: ["vegan", "leicht", "orientalisch", "mealprep"],
    saison: [6, 7, 8, 9],
    zutaten: `150 g Couscous
1 Dose Kichererbsen
1 Gurke
200 g Kirschtomaten
1 Paprika
1 Zwiebel, rot
1 Zitrone
3 EL Olivenöl`,
    gewuerze: `Salz
Pfeffer
1 TL Kreuzkümmel
1 Bund Petersilie
Minze, zum Bestreuen`,
    schritte: `Couscous mit 200 ml kochendem Salzwasser übergießen und 5 Minuten quellen lassen.
Kichererbsen abspülen und abtropfen lassen.
Gurke, Tomaten, Paprika und Zwiebel klein schneiden, Petersilie hacken.
Zitronensaft, Olivenöl, Kreuzkümmel, Salz und Pfeffer verrühren.
Couscous auflockern, alles in Schalen anrichten und mit Dressing beträufeln.`,
  },
  {
    id: "bulgur-gemuese-pfanne",
    titel: "Bulgur-Pfanne mit Paprika und Feta",
    dauer: 30,
    schlagwoerter: ["vegetarisch", "pfanne", "orientalisch"],
    saison: [],
    zutaten: `150 g Bulgur
2 Paprika
1 Zucchini
1 Zwiebel
2 EL Tomatenmark
350 ml Gemüsebrühe
100 g Feta
2 EL Olivenöl`,
    gewuerze: `Salz
Pfeffer
1 TL Paprikapulver, edelsüß
1 TL Kreuzkümmel
Petersilie, zum Bestreuen`,
    schritte: `Zwiebel, Paprika und Zucchini würfeln.
Gemüse im Olivenöl 5 Minuten anbraten.
Tomatenmark und Gewürze einrühren, kurz mitrösten.
Bulgur zugeben, mit Brühe ablöschen und zugedeckt 12 Minuten quellen lassen.
Abschmecken, Feta darüberbröseln und mit Petersilie servieren.`,
  },
  {
    id: "ofen-nudeln-tomate-mozzarella",
    titel: "Ofen-Nudeln mit Tomate und Mozzarella",
    dauer: 40,
    schlagwoerter: ["pasta", "vegetarisch", "ofen", "kinder"],
    saison: [],
    zutaten: `250 g Penne
1 Dose Tomaten, gehackt
150 ml Sahne
1 Zwiebel
1 Zehe Knoblauch
1 Mozzarella
30 g Parmesan, gerieben
1 EL Olivenöl`,
    gewuerze: `Salz
Pfeffer
1 TL Oregano
Basilikum, zum Bestreuen`,
    schritte: `Ofen auf 200 °C Umluft vorheizen.
Penne 3 Minuten kürzer als angegeben kochen.
Zwiebel und Knoblauch im Olivenöl andünsten, Tomaten und Sahne zugeben und würzen.
Nudeln mit der Soße mischen und in eine Auflaufform geben.
Mit Mozzarella und Parmesan belegen und 20 Minuten goldbraun backen.`,
  },
  {
    id: "pesto-pasta-basilikum",
    titel: "Pesto-Pasta mit Kirschtomaten",
    dauer: 15,
    schlagwoerter: ["pasta", "vegetarisch", "kinder", "italienisch"],
    saison: [],
    zutaten: `250 g Spaghetti
1 Glas Pesto
250 g Kirschtomaten
(30 g Parmesan)`,
    gewuerze: `Salz
Pfeffer
Basilikum, zum Bestreuen`,
    schritte: `Spaghetti nach Packungsangabe in Salzwasser kochen.
Kirschtomaten halbieren.
Nudeln abgießen, etwas Nudelwasser auffangen und mit Pesto und einem Schuss Nudelwasser vermischen.
Tomaten unterheben, mit Basilikum und Parmesan servieren.`,
  },
  {
    id: "linsen-bolognese",
    titel: "Linsen-Bolognese",
    dauer: 40,
    schlagwoerter: ["pasta", "vegan", "mealprep", "italienisch"],
    saison: [],
    zutaten: `250 g Spaghetti
120 g Linsen, rot
1 Zwiebel
1 Möhre
1 Stange Staudensellerie
1 Zehe Knoblauch
1 Dose Tomaten, gehackt
2 EL Tomatenmark
300 ml Gemüsebrühe
2 EL Olivenöl`,
    gewuerze: `Salz
Pfeffer
1 TL Oregano
1 TL Paprikapulver, geräuchert`,
    schritte: `Zwiebel, Möhre, Sellerie und Knoblauch fein würfeln.
Gemüse im Olivenöl 5 Minuten anbraten, Tomatenmark einrühren.
Linsen, Tomaten und Brühe zugeben und 20 Minuten köcheln lassen, bis die Linsen weich sind.
Spaghetti nach Packungsangabe kochen.
Soße kräftig abschmecken und mit den Spaghetti servieren.`,
  },
  {
    id: "paella-light",
    titel: "Paella mit Hähnchen und Garnelen",
    dauer: 50,
    schlagwoerter: ["reis", "geflügel", "fisch", "mediterran"],
    saison: [],
    zutaten: `200 g Paellareis
250 g Hähnchenbrust
150 g Garnelen
1 Paprika, rot
1 Zwiebel
2 Zehen Knoblauch
100 g Erbsen, tiefgekühlt
600 ml Hühnerbrühe
1 Zitrone
2 EL Olivenöl`,
    gewuerze: `Salz
Pfeffer
1 TL Paprikapulver, geräuchert
1 Prise Safran
Petersilie, zum Bestreuen`,
    schritte: `Hähnchen in Würfel schneiden, Paprika, Zwiebel und Knoblauch würfeln.
Hähnchen im Olivenöl in einer großen Pfanne anbraten, Gemüse kurz mitbraten.
Reis und Gewürze zugeben und unter Rühren 2 Minuten rösten.
Brühe angießen und ohne Rühren 18 Minuten leise köcheln lassen.
Garnelen und Erbsen darauflegen und weitere 5 Minuten garen.
Mit Zitronenspalten und Petersilie servieren.`,
  },
  {
    id: "gnocchi-pfanne-spinat",
    titel: "Gnocchi-Pfanne mit Spinat und Tomaten",
    dauer: 20,
    schlagwoerter: ["vegetarisch", "pfanne", "kinder", "italienisch"],
    saison: [],
    zutaten: `500 g Gnocchi
150 g Babyspinat
250 g Kirschtomaten
1 Zehe Knoblauch
100 ml Sahne
40 g Parmesan, gerieben
2 EL Olivenöl`,
    gewuerze: `Salz
Pfeffer
1 Prise Muskat`,
    schritte: `Gnocchi im Olivenöl rundum goldbraun braten.
Knoblauch fein hacken, Tomaten halbieren und beides 2 Minuten mitbraten.
Spinat zugeben und zusammenfallen lassen.
Sahne und Parmesan einrühren und kurz köcheln lassen.
Mit Salz, Pfeffer und Muskat abschmecken.`,
  },
  {
    id: "mac-and-cheese",
    titel: "Mac and Cheese",
    dauer: 30,
    schlagwoerter: ["pasta", "vegetarisch", "kinder", "ofen"],
    saison: [],
    zutaten: `250 g Hörnchennudeln
30 g Butter
2 EL Mehl
400 ml Milch
150 g Cheddarkäse, gerieben
30 g Paniermehl`,
    gewuerze: `Salz
Pfeffer
1 TL Senf
1 Prise Muskat`,
    schritte: `Ofen auf 200 °C Umluft vorheizen.
Hörnchennudeln bissfest kochen und abgießen.
Butter schmelzen, Mehl anschwitzen und nach und nach die Milch einrühren.
Soße aufkochen, zwei Drittel des Käses darin schmelzen und würzen.
Nudeln untermischen, in eine Form geben, mit restlichem Käse und Paniermehl bestreuen.
10 Minuten überbacken, bis die Oberfläche knusprig ist.`,
  },
  {
    id: "ramen-nudelpfanne",
    titel: "Ramen-Nudelpfanne mit Chinakohl",
    dauer: 20,
    schlagwoerter: ["vegan", "pfanne", "asiatisch", "leicht"],
    saison: [],
    zutaten: `200 g Ramen-Nudeln
200 g Chinakohl
200 g Champignons
1 Möhre
2 Frühlingszwiebeln
1 Zehe Knoblauch
3 EL Sojasoße
1 EL Ahornsirup
2 EL Rapsöl`,
    gewuerze: `1 TL Ingwer, gerieben
1 Prise Chili`,
    schritte: `Nudeln nach Packungsangabe garen und abgießen.
Chinakohl, Champignons und Möhre in Streifen, Frühlingszwiebeln in Ringe schneiden.
Gemüse mit Knoblauch und Ingwer im Öl 4 Minuten scharf anbraten.
Sojasoße und Ahornsirup verrühren.
Nudeln und Soße in die Pfanne geben und kurz durchschwenken.
Mit Frühlingszwiebeln bestreut servieren.`,
  },
  {
    id: "tortellini-sahnesosse",
    titel: "Tortellini in Schinken-Sahnesoße",
    dauer: 15,
    schlagwoerter: ["pasta", "fleisch", "kinder", "klassiker"],
    saison: [],
    zutaten: `500 g Tortellini, aus dem Kühlregal
150 g Kochschinken, gewürfelt
200 ml Sahne
100 g Erbsen, tiefgekühlt
30 g Parmesan, gerieben
1 TL Butter`,
    gewuerze: `Salz
Pfeffer
1 Prise Muskat`,
    schritte: `Tortellini nach Packungsangabe kochen.
Schinken in der Butter kurz anbraten.
Sahne und Erbsen zugeben und 3 Minuten köcheln lassen.
Parmesan einrühren und mit Salz, Pfeffer und Muskat abschmecken.
Tortellini untermischen und sofort servieren.`,
  },
  {
    id: "spinat-lasagne",
    titel: "Spinat-Lasagne mit Ricotta",
    dauer: 70,
    schlagwoerter: ["pasta", "vegetarisch", "ofen", "italienisch"],
    saison: [],
    zutaten: `200 g Lasagnenudeln
450 g Blattspinat, tiefgekühlt
250 g Ricotta
1 Zwiebel
2 Zehen Knoblauch
1 Dose Tomaten, passiert
1 Mozzarella
40 g Parmesan, gerieben
1 EL Olivenöl`,
    gewuerze: `Salz
Pfeffer
1 Prise Muskat
1 TL Oregano`,
    schritte: `Spinat auftauen und gut ausdrücken.
Zwiebel und Knoblauch würfeln, im Olivenöl andünsten und den Spinat kurz mitdünsten.
Spinat mit Ricotta und der Hälfte des Parmesans mischen, mit Salz, Pfeffer und Muskat würzen.
Ofen auf 180 °C Umluft vorheizen, Tomaten mit Oregano und Salz würzen.
Tomatensoße, Lasagneplatten und Spinatmasse abwechselnd schichten, mit Tomatensoße abschließen.
Mit Mozzarella und restlichem Parmesan belegen und 35 Minuten backen.`,
  },
  {
    id: "orzo-ofengemuese",
    titel: "Orzo mit Zucchini und Feta",
    dauer: 25,
    schlagwoerter: ["pasta", "vegetarisch", "mediterran", "leicht"],
    saison: [6, 7, 8, 9],
    zutaten: `200 g Orzo
1 Zucchini
1 Paprika, gelb
200 g Kirschtomaten
1 Zehe Knoblauch
500 ml Gemüsebrühe
100 g Feta
1 Zitrone
2 EL Olivenöl`,
    gewuerze: `Salz
Pfeffer
1 TL Oregano
Basilikum, zum Bestreuen`,
    schritte: `Zucchini und Paprika würfeln, Knoblauch hacken.
Gemüse im Olivenöl 4 Minuten anbraten.
Orzo zugeben, kurz mitrösten und mit Brühe ablöschen.
Unter gelegentlichem Rühren 10 Minuten garen, bis die Brühe aufgenommen ist.
Halbierte Tomaten, etwas Zitronenabrieb und Saft unterheben.
Mit zerbröseltem Feta und Basilikum servieren.`,
  },
  {
    id: "kuerbis-risotto",
    titel: "Kürbis-Risotto",
    dauer: 45,
    schlagwoerter: ["reis", "vegetarisch", "kinder", "italienisch"],
    saison: [9, 10, 11],
    zutaten: `200 g Risottoreis
400 g Kürbis, Hokkaido
1 Zwiebel
800 ml Gemüsebrühe
100 ml Weißwein
30 g Butter
40 g Parmesan, gerieben
1 EL Olivenöl`,
    gewuerze: `Salz
Pfeffer
1 Prise Muskat
Salbei, zum Bestreuen`,
    schritte: `Kürbis entkernen und mit Schale in kleine Würfel schneiden, Zwiebel fein würfeln.
Zwiebel im Olivenöl glasig dünsten, Kürbis und Reis zugeben und kurz mitrösten.
Mit Weißwein ablöschen und einkochen lassen.
Brühe nach und nach angießen und 20–25 Minuten unter Rühren garen.
Butter und Parmesan unterrühren, mit Salz, Pfeffer und Muskat abschmecken.
Mit Salbei bestreut servieren.`,
  },
  {
    id: "spargel-pasta-zitrone",
    titel: "Spargel-Pasta mit Zitrone",
    dauer: 25,
    schlagwoerter: ["pasta", "vegetarisch", "leicht"],
    saison: [4, 5, 6],
    zutaten: `250 g Bandnudeln
500 g Spargel, grün
1 Zitrone
150 ml Sahne
40 g Parmesan, gerieben
1 EL Butter
1 EL Olivenöl`,
    gewuerze: `Salz
Pfeffer
Basilikum, zum Bestreuen`,
    schritte: `Holzige Enden vom Spargel abschneiden, Stangen schräg in Stücke schneiden.
Bandnudeln nach Packungsangabe kochen.
Spargel in Olivenöl und Butter 5 Minuten bissfest braten.
Sahne, Zitronenabrieb und etwas Saft zugeben und kurz einkochen lassen.
Nudeln und Parmesan untermischen, abschmecken und mit Basilikum servieren.`,
  },
  {
    id: "asia-nudeln-haehnchen",
    titel: "Asia-Nudeln mit Hähnchen",
    dauer: 25,
    schlagwoerter: ["geflügel", "pfanne", "asiatisch", "kinder"],
    saison: [],
    zutaten: `200 g Mie-Nudeln
300 g Hähnchenbrust
1 Paprika, rot
1 Möhre
150 g Brokkoli
2 Frühlingszwiebeln
1 Zehe Knoblauch
4 EL Sojasoße
1 EL Honig
2 EL Rapsöl`,
    gewuerze: `1 TL Ingwer, gerieben`,
    schritte: `Nudeln nach Packungsangabe einweichen oder kochen.
Hähnchen in feine Streifen schneiden, Paprika und Möhre in Streifen, Brokkoli in kleine Röschen teilen.
Hähnchen im Öl scharf anbraten und herausnehmen.
Gemüse mit Ingwer und Knoblauch 4 Minuten unter Rühren braten.
Sojasoße und Honig verrühren, mit Nudeln und Hähnchen in die Pfanne geben.
Alles gut durchschwenken und sofort servieren.`,
  },
  {
    id: "lachs-spinat-pasta",
    titel: "Lachs-Pasta mit Spinat",
    dauer: 25,
    schlagwoerter: ["pasta", "fisch", "kinder"],
    saison: [],
    zutaten: `250 g Penne
250 g Lachs, ohne Haut
150 g Babyspinat
200 ml Sahne
1 Zitrone
1 Zehe Knoblauch
1 EL Olivenöl`,
    gewuerze: `Salz
Pfeffer
Dill, zum Bestreuen`,
    schritte: `Penne nach Packungsangabe kochen.
Lachs würfeln, salzen und im Olivenöl kurz rundum anbraten, herausnehmen.
Knoblauch hacken, kurz andünsten und mit Sahne ablöschen.
Spinat zugeben und zusammenfallen lassen, mit Zitronensaft abschmecken.
Lachs und Nudeln vorsichtig unterheben und mit Dill servieren.`,
  },
];

export default REZEPTE;
