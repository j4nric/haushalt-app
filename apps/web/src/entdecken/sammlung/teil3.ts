import type { SammlungsRezept } from "./typ";

const REZEPTE: SammlungsRezept[] = [
  {
    id: "linsen-dal",
    titel: "Rotes Linsen-Dal",
    dauer: 30,
    schlagwoerter: ["vegan", "reis", "orientalisch", "mealprep"],
    saison: [],
    zutaten: `150 g Linsen, rot
1 Zwiebel
2 Zehen Knoblauch
1 Stück Ingwer
1 Dose Tomaten, gehackt
200 ml Kokosmilch
150 g Reis
1 EL Öl`,
    gewuerze: `1 TL Kurkuma
1 TL Kreuzkümmel
1 TL Garam Masala
Salz
(Koriander)`,
    schritte: `Reis in Salzwasser 15 Minuten garen.
Zwiebel, Knoblauch und Ingwer fein hacken und im Öl 3 Minuten glasig anschwitzen.
Gewürze 1 Minute mitrösten.
Linsen abspülen, mit Tomaten, Kokosmilch und 300 ml Wasser dazugeben.
Etwa 15 Minuten köcheln lassen, bis die Linsen zerfallen, dabei gelegentlich umrühren.
Mit Salz abschmecken und mit Reis servieren, nach Belieben Koriander darüberstreuen.`,
  },
  {
    id: "kichererbsen-curry",
    titel: "Kichererbsen-Curry mit Spinat",
    dauer: 30,
    schlagwoerter: ["vegan", "reis", "asiatisch", "mealprep"],
    saison: [],
    zutaten: `1 Dose Kichererbsen
1 Zwiebel
2 Zehen Knoblauch
1 Stück Ingwer
1 Dose Tomaten, gehackt
400 ml Kokosmilch
150 g Spinat
150 g Reis
1 EL Öl`,
    gewuerze: `2 TL Currypulver
1 TL Kurkuma
1 TL Kreuzkümmel
Salz
(Chili)`,
    schritte: `Reis in Salzwasser 15 Minuten garen.
Zwiebel, Knoblauch und Ingwer hacken und im Öl 3 Minuten anbraten.
Gewürze zugeben und 1 Minute mitrösten.
Tomaten und Kokosmilch angießen, Kichererbsen abgießen und dazugeben.
10 Minuten köcheln lassen.
Spinat unterheben, 2 Minuten zusammenfallen lassen und mit Salz abschmecken.
Mit dem Reis servieren.`,
  },
  {
    id: "ofengemuese-feta",
    titel: "Gemüse-Ofenblech mit Feta",
    dauer: 45,
    schlagwoerter: ["vegetarisch", "ofen", "mediterran", "kartoffeln"],
    saison: [],
    zutaten: `500 g Kartoffeln, festkochend
1 Paprika, rot
1 Zucchini
1 Zwiebel, rot
250 g Kirschtomaten
200 g Feta
3 EL Olivenöl`,
    gewuerze: `1 TL Paprikapulver
Oregano
Thymian
Salz
Pfeffer`,
    schritte: `Ofen auf 200 °C Umluft vorheizen.
Kartoffeln waschen und in Spalten schneiden, Paprika, Zucchini und Zwiebel grob würfeln.
Alles mit Olivenöl und Gewürzen auf einem Blech mischen.
25 Minuten backen.
Kirschtomaten zugeben und Feta darüberbröseln.
Weitere 10 Minuten backen, bis der Feta leicht Farbe nimmt.`,
  },
  {
    id: "kartoffelgratin",
    titel: "Kartoffelgratin",
    dauer: 70,
    schlagwoerter: ["vegetarisch", "ofen", "kartoffeln", "klassiker", "kinder"],
    saison: [],
    zutaten: `800 g Kartoffeln, festkochend
200 ml Sahne
150 ml Milch
1 Zehe Knoblauch
100 g Käse, gerieben
1 EL Butter`,
    gewuerze: `Salz
Pfeffer
1 Prise Muskat`,
    schritte: `Ofen auf 180 °C Umluft vorheizen, eine Auflaufform mit Butter ausstreichen.
Kartoffeln schälen und in dünne Scheiben hobeln.
Sahne und Milch mit gepresstem Knoblauch, Salz, Pfeffer und Muskat verrühren.
Kartoffelscheiben dachziegelartig in die Form schichten und mit der Sahnemilch übergießen.
Mit Käse bestreuen und etwa 50 Minuten goldbraun backen.
Vor dem Servieren 5 Minuten ruhen lassen.`,
  },
  {
    id: "shakshuka",
    titel: "Shakshuka",
    dauer: 30,
    schlagwoerter: ["vegetarisch", "pfanne", "orientalisch", "leicht"],
    saison: [],
    zutaten: `1 Zwiebel
2 Zehen Knoblauch
2 Paprika, rot
2 Dosen Tomaten, gehackt
5 Eier
2 EL Olivenöl
1 Stück Fladenbrot
(50 g Feta)`,
    gewuerze: `1 TL Kreuzkümmel
1 TL Paprikapulver, edelsüß
Salz
Pfeffer
(Petersilie)`,
    schritte: `Zwiebel, Knoblauch und Paprika klein schneiden und im Olivenöl 5 Minuten anbraten.
Gewürze zugeben, dann Tomaten einrühren und 10 Minuten einköcheln lassen.
Mit Salz und Pfeffer abschmecken.
Mit einem Löffel Mulden in die Sauce drücken und die Eier hineinschlagen.
Zugedeckt bei kleiner Hitze 6 bis 8 Minuten stocken lassen.
Nach Belieben mit Feta und Petersilie bestreuen und mit Fladenbrot servieren.`,
  },
  {
    id: "gefuellte-zucchini",
    titel: "Gefüllte Zucchini mit Couscous",
    dauer: 50,
    schlagwoerter: ["vegetarisch", "ofen", "mediterran"],
    saison: [6, 7, 8, 9],
    zutaten: `3 Zucchini
100 g Couscous
150 ml Gemüsebrühe
1 Zwiebel
1 Paprika, rot
200 g Feta
1 Dose Tomaten, passiert
2 EL Olivenöl`,
    gewuerze: `Oregano
Basilikum
Salz
Pfeffer`,
    schritte: `Ofen auf 180 °C Umluft vorheizen.
Couscous mit heißer Brühe übergießen und 5 Minuten quellen lassen.
Zucchini längs halbieren und mit einem Löffel aushöhlen, das Fruchtfleisch hacken.
Zwiebel, Paprika und Zucchinifleisch im Olivenöl 5 Minuten anbraten, mit Couscous und der Hälfte des Fetas mischen und würzen.
Passierte Tomaten in eine Auflaufform geben, Zucchini hineinsetzen und füllen.
Mit restlichem Feta bestreuen und 25 Minuten backen.`,
  },
  {
    id: "ratatouille",
    titel: "Ratatouille mit Baguette",
    dauer: 50,
    schlagwoerter: ["vegan", "mediterran", "leicht", "mealprep"],
    saison: [7, 8, 9],
    zutaten: `1 Aubergine
2 Zucchini
2 Paprika
1 Zwiebel
2 Zehen Knoblauch
1 Dose Tomaten, gehackt
3 EL Olivenöl
1 Baguette`,
    gewuerze: `Kräuter der Provence
1 Lorbeerblatt
Salz
Pfeffer
(Basilikum)`,
    schritte: `Aubergine, Zucchini, Paprika und Zwiebel in mundgerechte Würfel schneiden, Knoblauch hacken.
Aubergine im Olivenöl 5 Minuten kräftig anbraten, dann das übrige Gemüse zugeben.
Tomaten, Kräuter und Lorbeer zufügen und alles salzen.
Zugedeckt bei mittlerer Hitze 25 Minuten schmoren lassen.
Lorbeer entfernen, mit Pfeffer abschmecken und mit Baguette servieren.`,
  },
  {
    id: "kuerbissuppe",
    titel: "Kürbissuppe mit Kokosmilch",
    dauer: 30,
    schlagwoerter: ["vegan", "suppe", "kinder", "leicht"],
    saison: [9, 10, 11],
    zutaten: `1 Kürbis, Hokkaido
1 Zwiebel
1 Stück Ingwer
2 Möhren
700 ml Gemüsebrühe
200 ml Kokosmilch
1 EL Öl`,
    gewuerze: `1 TL Currypulver
Salz
Pfeffer
(Kürbiskernöl)`,
    schritte: `Kürbis waschen, entkernen und mit Schale würfeln, Möhren schälen und klein schneiden.
Zwiebel und Ingwer hacken und im Öl 3 Minuten anschwitzen.
Kürbis, Möhren und Curry dazugeben und 2 Minuten mitbraten.
Mit Brühe ablöschen und 15 Minuten weich kochen.
Kokosmilch einrühren und alles fein pürieren.
Abschmecken und nach Belieben mit ein paar Tropfen Kürbiskernöl servieren.`,
  },
  {
    id: "tomatensuppe",
    titel: "Tomatensuppe mit Grilled Cheese",
    dauer: 30,
    schlagwoerter: ["vegetarisch", "suppe", "kinder", "klassiker"],
    saison: [],
    zutaten: `1 Zwiebel
2 Zehen Knoblauch
2 Dosen Tomaten, stückig
400 ml Gemüsebrühe
100 ml Sahne
1 EL Olivenöl
6 Scheiben Toastbrot
4 Scheiben Käse
1 EL Butter`,
    gewuerze: `1 TL Zucker
Basilikum
Salz
Pfeffer`,
    schritte: `Zwiebel und Knoblauch würfeln und im Olivenöl 3 Minuten glasig dünsten.
Tomaten und Brühe zugeben, mit Zucker, Salz und Pfeffer würzen und 15 Minuten köcheln lassen.
Inzwischen je zwei Toastscheiben mit Käse belegen und außen dünn mit Butter bestreichen.
Die Sandwiches in einer Pfanne je Seite 3 Minuten goldbraun braten, bis der Käse schmilzt.
Suppe pürieren, Sahne einrühren und mit Basilikum abschmecken.
Mit den Käsetoasts servieren.`,
  },
  {
    id: "kartoffelsuppe-wuerstchen",
    titel: "Kartoffelsuppe mit Würstchen",
    dauer: 40,
    schlagwoerter: ["fleisch", "suppe", "kartoffeln", "klassiker", "kinder"],
    saison: [10, 11, 12, 1, 2, 3],
    zutaten: `800 g Kartoffeln, mehligkochend
2 Möhren
1 Stange Lauch
1 Stück Sellerie
1 Zwiebel
1 l Gemüsebrühe
4 Wiener Würstchen
100 ml Sahne
1 EL Butter`,
    gewuerze: `1 TL Majoran
1 Prise Muskat
Salz
Pfeffer
(Petersilie)`,
    schritte: `Kartoffeln, Möhren und Sellerie schälen und würfeln, Lauch in Ringe und Zwiebel in Würfel schneiden.
Zwiebel und Lauch in Butter 3 Minuten andünsten.
Übriges Gemüse zugeben, mit Brühe auffüllen und 20 Minuten weich kochen.
Etwa die Hälfte grob pürieren, sodass noch Stücke bleiben.
Sahne einrühren, mit Majoran, Muskat, Salz und Pfeffer abschmecken.
Würstchen in Scheiben schneiden und in der Suppe 5 Minuten erwärmen.`,
  },
  {
    id: "linseneintopf",
    titel: "Linseneintopf mit Mettwurst",
    dauer: 55,
    schlagwoerter: ["fleisch", "eintopf", "deftig", "klassiker", "mealprep"],
    saison: [10, 11, 12, 1, 2, 3],
    zutaten: `200 g Linsen, braun
400 g Kartoffeln
2 Möhren
1 Stück Sellerie
1 Stange Lauch
1 Zwiebel
1 l Gemüsebrühe
2 Stück Mettwurst
1 EL Öl
2 EL Essig`,
    gewuerze: `1 Lorbeerblatt
1 TL Majoran
Salz
Pfeffer
1 Prise Zucker`,
    schritte: `Zwiebel würfeln und im Öl 3 Minuten anschwitzen.
Linsen abspülen, mit Brühe und Lorbeer zugeben und 15 Minuten köcheln lassen.
Kartoffeln, Möhren und Sellerie schälen und würfeln, Lauch in Ringe schneiden und alles dazugeben.
Mettwürste in den Topf legen und weitere 20 Minuten garen.
Würste herausnehmen, in Scheiben schneiden und zurückgeben.
Mit Essig, Majoran, Salz, Pfeffer und einer Prise Zucker abschmecken.`,
  },
  {
    id: "erbsensuppe",
    titel: "Erbsensuppe mit Speck",
    dauer: 90,
    schlagwoerter: ["fleisch", "suppe", "deftig", "klassiker"],
    saison: [10, 11, 12, 1, 2, 3],
    zutaten: `250 g Erbsen, getrocknet
100 g Speck, gewürfelt
2 Möhren
1 Stück Sellerie
1 Stange Lauch
1 Zwiebel
300 g Kartoffeln
1,2 l Gemüsebrühe`,
    gewuerze: `1 Lorbeerblatt
1 TL Majoran
Salz
Pfeffer`,
    schritte: `Speck in einem großen Topf 3 Minuten auslassen, gewürfelte Zwiebel darin 2 Minuten anschwitzen.
Erbsen abspülen, mit Brühe und Lorbeer zugeben und zugedeckt 45 Minuten köcheln lassen.
Möhren, Sellerie und Kartoffeln schälen und würfeln, Lauch in Ringe schneiden.
Gemüse zugeben und weitere 25 Minuten garen, bis die Erbsen zerfallen.
Lorbeer entfernen, mit Majoran, Salz und Pfeffer abschmecken.
Bei Bedarf mit etwas Wasser verdünnen.`,
  },
  {
    id: "minestrone",
    titel: "Minestrone",
    dauer: 45,
    schlagwoerter: ["vegetarisch", "suppe", "italienisch", "kinder"],
    saison: [],
    zutaten: `1 Zwiebel
2 Möhren
1 Stange Staudensellerie
1 Zucchini
2 Kartoffeln
1 Dose Bohnen, weiß
1 Dose Tomaten, gehackt
1 l Gemüsebrühe
80 g Suppennudeln
2 EL Olivenöl
(30 g Parmesan)`,
    gewuerze: `Basilikum
Oregano
Salz
Pfeffer`,
    schritte: `Zwiebel, Möhren, Sellerie, Zucchini und Kartoffeln klein würfeln.
Zwiebel, Möhren und Sellerie im Olivenöl 5 Minuten andünsten.
Kartoffeln, Tomaten und Brühe zugeben und 15 Minuten köcheln lassen.
Zucchini, abgespülte Bohnen und Nudeln zufügen und weitere 10 Minuten garen.
Mit Kräutern, Salz und Pfeffer abschmecken.
Nach Belieben mit frisch geriebenem Parmesan servieren.`,
  },
  {
    id: "spargel-hollandaise",
    titel: "Spargel mit Kartoffeln und Sauce Hollandaise",
    dauer: 40,
    schlagwoerter: ["vegetarisch", "kartoffeln", "klassiker", "leicht"],
    saison: [4, 5, 6],
    zutaten: `1 kg Spargel, weiß
600 g Kartoffeln, festkochend
3 Eier
150 g Butter
1 Zitrone
(1 Bund Petersilie)`,
    gewuerze: `1 TL Zucker
Salz
Pfeffer`,
    schritte: `Kartoffeln schälen und in Salzwasser etwa 20 Minuten garen.
Spargel schälen, holzige Enden abschneiden.
Spargel in Wasser mit Salz, Zucker und etwas Butter 12 bis 15 Minuten bissfest kochen.
Für die Hollandaise Butter schmelzen; Eigelbe mit 2 EL Wasser und etwas Zitronensaft über einem heißen Wasserbad etwa 5 Minuten cremig aufschlagen.
Die flüssige Butter langsam unterschlagen, mit Salz, Pfeffer und Zitrone abschmecken.
Spargel und Kartoffeln mit der Sauce anrichten, nach Belieben Petersilie darüberstreuen.`,
  },
  {
    id: "spinat-kartoffel-curry",
    titel: "Spinat-Kartoffel-Curry",
    dauer: 35,
    schlagwoerter: ["vegan", "kartoffeln", "asiatisch", "mealprep"],
    saison: [],
    zutaten: `600 g Kartoffeln
1 Zwiebel
2 Zehen Knoblauch
1 Stück Ingwer
300 g Blattspinat, TK
1 Dose Tomaten, gehackt
200 ml Kokosmilch
1 EL Öl
(2 Fladenbrote)`,
    gewuerze: `2 TL Currypulver
1 TL Garam Masala
1 TL Kreuzkümmel
Salz`,
    schritte: `Kartoffeln schälen und in 2 cm große Würfel schneiden.
Zwiebel, Knoblauch und Ingwer fein hacken und im Öl 3 Minuten anbraten.
Gewürze und Kartoffeln zugeben und 2 Minuten mitrösten.
Tomaten, Kokosmilch und 150 ml Wasser angießen und zugedeckt 20 Minuten köcheln lassen.
Spinat einrühren und weitere 5 Minuten garen.
Mit Salz abschmecken und nach Belieben mit Fladenbrot servieren.`,
  },
  {
    id: "blumenkohl-ofen",
    titel: "Ganzer Blumenkohl aus dem Ofen mit Joghurtdip",
    dauer: 55,
    schlagwoerter: ["vegetarisch", "ofen", "orientalisch", "leicht"],
    saison: [],
    zutaten: `1 Kopf Blumenkohl
3 EL Olivenöl
250 g Joghurt, griechisch
1 Zehe Knoblauch
1 Zitrone
1 Dose Kichererbsen
(2 EL Sesam)`,
    gewuerze: `1 TL Paprikapulver, geräuchert
1 TL Kreuzkümmel
Salz
Pfeffer
(Minze)`,
    schritte: `Ofen auf 200 °C Umluft vorheizen.
Blumenkohl von äußeren Blättern befreien und 5 Minuten in Salzwasser vorgaren.
Öl mit Paprika, Kreuzkümmel und Salz verrühren und den Blumenkohl damit einpinseln.
Blumenkohl in eine Form setzen, abgetropfte Kichererbsen drumherum verteilen und 35 Minuten rösten.
Joghurt mit gepresstem Knoblauch, Zitronensaft, Salz und Minze verrühren.
Blumenkohl in Stücke schneiden und mit Kichererbsen und Dip servieren.`,
  },
  {
    id: "ofenkartoffeln-kraeuterquark",
    titel: "Ofenkartoffeln mit Kräuterquark",
    dauer: 60,
    schlagwoerter: ["vegetarisch", "ofen", "kartoffeln", "kinder", "klassiker"],
    saison: [],
    zutaten: `4 Kartoffeln, groß
500 g Quark
100 ml Milch
1 Zehe Knoblauch
1 Bund Schnittlauch
1 Bund Petersilie
1 EL Olivenöl
(1 Gurke)`,
    gewuerze: `Salz
Pfeffer`,
    schritte: `Ofen auf 200 °C Umluft vorheizen.
Kartoffeln gründlich waschen, mit einer Gabel mehrmals einstechen und mit Öl und Salz einreiben.
Auf einem Blech etwa 50 Minuten backen, bis sie weich sind.
Quark mit Milch glatt rühren, Kräuter fein hacken, Knoblauch pressen und unterrühren.
Kräuterquark mit Salz und Pfeffer abschmecken.
Kartoffeln kreuzweise einschneiden, etwas aufdrücken und mit Quark füllen, nach Belieben Gurkenscheiben dazu reichen.`,
  },
  {
    id: "gemuese-quiche",
    titel: "Gemüse-Quiche mit Lauch und Paprika",
    dauer: 80,
    schlagwoerter: ["vegetarisch", "ofen", "mealprep"],
    saison: [],
    zutaten: `200 g Mehl
100 g Butter, kalt
2 Stangen Lauch
1 Paprika, rot
3 Eier
200 g Schmand
100 ml Milch
100 g Käse, gerieben`,
    gewuerze: `1 Prise Muskat
Salz
Pfeffer`,
    schritte: `Mehl mit kalter Butter in Stücken, einer Prise Salz und 3 EL kaltem Wasser rasch zu einem Teig verkneten und 20 Minuten kühlen.
Ofen auf 180 °C Umluft vorheizen.
Teig ausrollen, in eine gefettete Quicheform legen, am Rand hochdrücken und mit einer Gabel einstechen.
Lauch in Ringe schneiden, Paprika würfeln und beides in einer Pfanne mit wenig Wasser 5 Minuten dünsten.
Eier mit Schmand, Milch und der Hälfte des Käses verquirlen und kräftig würzen.
Gemüse auf dem Teig verteilen, Eiermasse darübergießen und mit restlichem Käse bestreuen.
35 bis 40 Minuten goldgelb backen und 10 Minuten abkühlen lassen.`,
  },
  {
    id: "falafel-bowl",
    titel: "Falafel-Bowl mit Joghurtdip",
    dauer: 40,
    schlagwoerter: ["vegetarisch", "orientalisch", "leicht"],
    saison: [],
    zutaten: `1 Dose Kichererbsen
1 Zwiebel, rot
1 Zehe Knoblauch
1 Bund Petersilie
3 EL Mehl
150 g Bulgur
1 Gurke
250 g Kirschtomaten
150 g Joghurt
1 Zitrone
4 EL Öl`,
    gewuerze: `1 TL Kreuzkümmel
1 TL Koriander, gemahlen
Minze
Salz
Pfeffer`,
    schritte: `Bulgur mit der doppelten Menge Salzwasser aufkochen und 10 Minuten quellen lassen.
Kichererbsen gut abtropfen lassen und mit der halben Zwiebel, Knoblauch, halber Petersilie, Mehl und Gewürzen grob pürieren.
Aus der Masse kleine Bällchen formen, etwas flach drücken und im Öl je Seite 3 Minuten knusprig braten.
Gurke, Tomaten und restliche Zwiebel klein schneiden.
Joghurt mit etwas Zitronensaft, Minze und Salz verrühren, Bulgur mit Zitrone und restlicher Petersilie abschmecken.
Alles in Schalen anrichten und mit dem Dip servieren.`,
  },
  {
    id: "chili-sin-carne",
    titel: "Chili sin Carne",
    dauer: 40,
    schlagwoerter: ["vegan", "mexikanisch", "reis", "mealprep"],
    saison: [],
    zutaten: `1 Zwiebel
2 Zehen Knoblauch
1 Paprika, rot
1 Dose Kidneybohnen
1 Dose Mais
1 Dose Tomaten, gehackt
100 g Linsen, rot
200 ml Gemüsebrühe
150 g Reis
1 EL Öl`,
    gewuerze: `1 TL Kreuzkümmel
1 TL Paprikapulver, geräuchert
1 TL Chiliflocken
1 TL Kakao
Salz`,
    schritte: `Reis in Salzwasser 15 Minuten garen.
Zwiebel, Knoblauch und Paprika würfeln und im Öl 5 Minuten anbraten.
Gewürze zugeben und 1 Minute mitrösten.
Tomaten, Brühe und abgespülte Linsen einrühren und 15 Minuten köcheln lassen.
Bohnen und Mais abgießen, unterrühren und weitere 10 Minuten garen.
Mit Salz abschmecken und mit Reis servieren.`,
  },
  {
    id: "gruene-bohnen-eintopf",
    titel: "Grüner Bohneneintopf",
    dauer: 50,
    schlagwoerter: ["fleisch", "eintopf", "kartoffeln", "deftig"],
    saison: [7, 8, 9],
    zutaten: `500 g Bohnen, grün
500 g Kartoffeln
2 Möhren
1 Zwiebel
1 l Gemüsebrühe
100 g Speck, gewürfelt
1 EL Butter`,
    gewuerze: `1 TL Bohnenkraut
Salz
Pfeffer
(Petersilie)`,
    schritte: `Bohnen putzen und in Stücke brechen, Kartoffeln und Möhren schälen und würfeln.
Speck und Zwiebelwürfel in Butter 5 Minuten anbraten.
Gemüse und Bohnenkraut zugeben und mit Brühe auffüllen.
Zugedeckt 25 bis 30 Minuten köcheln lassen, bis alles weich ist.
Mit Salz und Pfeffer abschmecken und nach Belieben mit Petersilie servieren.`,
  },
  {
    id: "pilzpfanne-semmelknoedel",
    titel: "Rahmpilze mit Semmelknödeln",
    dauer: 45,
    schlagwoerter: ["vegetarisch", "pfanne", "klassiker", "deftig"],
    saison: [8, 9, 10],
    zutaten: `250 g Brötchen, altbacken
250 ml Milch
2 Eier
2 Zwiebeln
500 g Champignons
200 ml Sahne
2 EL Butter
1 Bund Petersilie`,
    gewuerze: `1 Prise Muskat
1 TL Thymian
Salz
Pfeffer`,
    schritte: `Brötchen klein würfeln, mit warmer Milch übergießen und 10 Minuten ziehen lassen.
Eine Zwiebel fein würfeln und in 1 EL Butter 3 Minuten glasig dünsten, mit Eiern, der Hälfte der Petersilie, Salz und Muskat zur Brotmasse geben und verkneten.
Mit nassen Händen 6 Knödel formen und in siedendem Salzwasser 20 Minuten ziehen lassen.
Champignons in Scheiben schneiden, zweite Zwiebel würfeln und beides in restlicher Butter 8 Minuten kräftig anbraten.
Sahne angießen, mit Thymian, Salz und Pfeffer würzen und 5 Minuten einkochen lassen.
Knödel mit den Rahmpilzen anrichten und mit Petersilie bestreuen.`,
  },
  {
    id: "brokkoli-kaese-auflauf",
    titel: "Brokkoli-Kartoffel-Auflauf mit Käse",
    dauer: 50,
    schlagwoerter: ["vegetarisch", "ofen", "kartoffeln", "kinder"],
    saison: [],
    zutaten: `600 g Kartoffeln, festkochend
1 Brokkoli
200 ml Sahne
2 Eier
150 g Käse, gerieben
1 EL Butter`,
    gewuerze: `1 Prise Muskat
Salz
Pfeffer`,
    schritte: `Ofen auf 180 °C Umluft vorheizen, eine Auflaufform mit Butter fetten.
Kartoffeln schälen, in Scheiben schneiden und 8 Minuten in Salzwasser vorgaren.
Brokkoli in Röschen teilen und die letzten 3 Minuten mitgaren, dann abgießen.
Sahne mit Eiern, der Hälfte des Käses, Muskat, Salz und Pfeffer verquirlen.
Kartoffeln und Brokkoli in die Form geben, Guss darübergießen und mit restlichem Käse bestreuen.
25 Minuten goldbraun überbacken.`,
  },
  {
    id: "rote-linsen-suppe",
    titel: "Rote-Linsen-Suppe mit Zitrone",
    dauer: 30,
    schlagwoerter: ["vegan", "suppe", "orientalisch", "leicht"],
    saison: [],
    zutaten: `200 g Linsen, rot
1 Zwiebel
2 Möhren
2 Zehen Knoblauch
1 EL Tomatenmark
1 l Gemüsebrühe
1 Zitrone
2 EL Olivenöl
(1 Fladenbrot)`,
    gewuerze: `1 TL Kreuzkümmel
1 TL Paprikapulver
Salz
Pfeffer
(Minze)`,
    schritte: `Zwiebel, Knoblauch und Möhren klein würfeln und im Olivenöl 5 Minuten andünsten.
Tomatenmark und Gewürze zugeben und 1 Minute anrösten.
Linsen abspülen, mit der Brühe dazugeben und 15 Minuten köcheln lassen.
Suppe fein pürieren und mit Zitronensaft, Salz und Pfeffer abschmecken.
Nach Belieben mit Minze und Fladenbrot servieren.`,
  },
  {
    id: "gemuese-frittata",
    titel: "Gemüse-Frittata",
    dauer: 25,
    schlagwoerter: ["vegetarisch", "pfanne", "kinder", "leicht"],
    saison: [],
    zutaten: `6 Eier
300 g Kartoffeln, gekocht
1 Zucchini
1 Paprika, rot
1 Zwiebel
50 g Käse, gerieben
50 ml Milch
2 EL Olivenöl`,
    gewuerze: `Schnittlauch
Salz
Pfeffer`,
    schritte: `Kartoffeln in Scheiben, Zucchini, Paprika und Zwiebel in kleine Würfel schneiden.
Gemüse und Kartoffeln in einer ofenfesten Pfanne im Olivenöl 8 Minuten anbraten.
Eier mit Milch, Käse, Salz, Pfeffer und Schnittlauch verquirlen.
Eiermasse über das Gemüse gießen und bei kleiner Hitze zugedeckt 8 bis 10 Minuten stocken lassen.
In Stücke schneiden und warm oder kalt servieren.`,
  },
];

export default REZEPTE;
