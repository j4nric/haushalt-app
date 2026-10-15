import type { SammlungsRezept } from "./typ";

/** Teil 5: Asiatisch – Currys, Nudeln, Bowls und Suppen von Thailand bis Indien. */
const REZEPTE: SammlungsRezept[] = [
  {
    id: "rotes-thai-curry-haehnchen",
    titel: "Rotes Thai-Curry mit Hähnchen",
    dauer: 30,
    schlagwoerter: ["geflügel", "reis", "asiatisch"],
    saison: [],
    zutaten: `150 g Jasminreis
300 g Hähnchenbrust
1 Paprika, rot
150 g Zuckerschoten
1 Dose Kokosmilch
1 EL Currypaste, rot
1 EL Fischsoße
1 Limette
1 EL Rapsöl`,
    gewuerze: `1 TL Zucker
Thai-Basilikum, zum Bestreuen`,
    schritte: `Reis in 250 ml Salzwasser aufkochen und zugedeckt 12–15 Minuten bei kleiner Hitze garen.
Hähnchen in Streifen, Paprika in Würfel schneiden.
Currypaste im Öl 1 Minute anrösten, Hähnchen zugeben und 3 Minuten anbraten.
Kokosmilch angießen, Paprika und Zuckerschoten zugeben und 8 Minuten köcheln lassen.
Mit Fischsoße, Zucker und Limettensaft abschmecken.
Mit Thai-Basilikum bestreuen und mit dem Reis servieren.`,
  },
  {
    id: "pad-thai-garnelen",
    titel: "Pad Thai mit Garnelen",
    dauer: 30,
    schlagwoerter: ["fisch", "pfanne", "asiatisch"],
    saison: [],
    zutaten: `150 g Reisnudeln, breit
200 g Garnelen, geschält
2 Eier
100 g Mungbohnensprossen
3 Frühlingszwiebeln
1 Zehe Knoblauch
2 EL Fischsoße
1 EL Sojasoße
1 EL Rohrzucker
1 Limette
40 g Erdnüsse, geröstet
2 EL Rapsöl`,
    gewuerze: `1 Prise Chiliflocken
Koriander, zum Bestreuen`,
    schritte: `Reisnudeln in heißem Wasser 10 Minuten einweichen und abgießen.
Fischsoße, Sojasoße, Zucker und den Saft einer halben Limette verrühren.
Garnelen und Knoblauch im Öl 2 Minuten braten, an den Rand schieben.
Eier in die Pfanne schlagen und 1 Minute stocken lassen, dabei zerteilen.
Nudeln und Soße zugeben und 2–3 Minuten unter Wenden braten.
Sprossen und Frühlingszwiebeln 30 Sekunden mitschwenken.
Mit gehackten Erdnüssen, Koriander, Chili und Limettenspalten servieren.`,
  },
  {
    id: "gruenes-thai-curry-tofu",
    titel: "Grünes Thai-Curry mit Tofu und Gemüse",
    dauer: 30,
    schlagwoerter: ["vegan", "reis", "asiatisch"],
    saison: [],
    zutaten: `150 g Jasminreis
200 g Tofu, natur
1 Zucchini
150 g Brokkoli
1 Dose Kokosmilch
1 EL Currypaste, grün
1 EL Sojasoße
1 Limette
2 EL Rapsöl`,
    gewuerze: `1 TL Zucker
Thai-Basilikum, zum Bestreuen`,
    schritte: `Reis in 250 ml Salzwasser aufkochen und zugedeckt 12–15 Minuten garen.
Tofu würfeln und in 1 EL Öl 5–6 Minuten goldbraun braten, herausnehmen.
Zucchini würfeln, Brokkoli in kleine Röschen teilen.
Currypaste im restlichen Öl 1 Minute anrösten, mit Kokosmilch ablöschen.
Gemüse zugeben und 6–8 Minuten köcheln lassen, bis es bissfest ist.
Tofu unterheben, mit Sojasoße, Zucker und Limettensaft abschmecken und mit Reis servieren.`,
  },
  {
    id: "tom-kha-gai",
    titel: "Tom Kha Gai",
    dauer: 35,
    schlagwoerter: ["geflügel", "suppe", "asiatisch", "leicht"],
    saison: [],
    zutaten: `250 g Hähnchenbrust
1 Dose Kokosmilch
500 ml Hühnerbrühe
150 g Champignons
1 Tomate
1 Stück Ingwer, daumengroß
2 EL Fischsoße
1 Limette`,
    gewuerze: `2 Stangen Zitronengras
3 Kaffirlimettenblätter
1 Chili, rot
1 TL Zucker
Koriander, zum Bestreuen`,
    schritte: `Zitronengras in Stücke schneiden und andrücken, Ingwer in Scheiben schneiden.
Brühe und Kokosmilch mit Zitronengras, Ingwer und Limettenblättern aufkochen und 10 Minuten ziehen lassen.
Hähnchen in dünne Streifen, Champignons in Scheiben, Tomate in Spalten schneiden.
Hähnchen und Champignons zugeben und 8 Minuten leise köcheln lassen.
Tomate zugeben und 2 Minuten mitziehen lassen.
Mit Fischsoße, Zucker, Limettensaft und Chili abschmecken und mit Koriander servieren.`,
  },
  {
    id: "pho-rind",
    titel: "Pho mit Rindfleisch",
    dauer: 50,
    schlagwoerter: ["fleisch", "suppe", "asiatisch", "leicht"],
    saison: [10, 11, 12, 1, 2, 3],
    zutaten: `150 g Reisnudeln, schmal
200 g Rinderhüftsteak
1 l Rinderbrühe
1 Zwiebel
1 Stück Ingwer, daumengroß
100 g Mungbohnensprossen
2 Frühlingszwiebeln
2 EL Fischsoße
1 Limette`,
    gewuerze: `2 Sternanis
1 Zimtstange
3 Gewürznelken
1 TL Zucker
Koriander, zum Bestreuen
Minze, zum Bestreuen`,
    schritte: `Zwiebel und Ingwer halbieren und in einer trockenen Pfanne 5 Minuten dunkel anrösten.
Brühe mit Zwiebel, Ingwer, Sternanis, Zimt und Nelken aufkochen und 30 Minuten leise köcheln lassen.
Rindfleisch für 15 Minuten ins Gefrierfach legen, dann hauchdünn aufschneiden.
Reisnudeln in heißem Wasser 8–10 Minuten einweichen, abgießen und auf Schalen verteilen.
Brühe abseihen und mit Fischsoße und Zucker abschmecken.
Rohes Fleisch auf die Nudeln legen und mit der kochend heißen Brühe übergießen.
Mit Sprossen, Frühlingszwiebeln, Kräutern und Limettenspalten servieren.`,
  },
  {
    id: "bibimbap-spinat-ei",
    titel: "Bibimbap mit Spinat und Ei",
    dauer: 40,
    schlagwoerter: ["vegetarisch", "reis", "asiatisch"],
    saison: [],
    zutaten: `150 g Sushireis
2 Eier
150 g Babyspinat
2 Möhren
150 g Champignons
1 Zucchini
1 EL Chilipaste, koreanisch
2 EL Sojasoße
1 EL Sesamöl
2 EL Rapsöl
1 EL Sesam`,
    gewuerze: `Salz
1 Zehe Knoblauch, gerieben`,
    schritte: `Reis waschen, mit 220 ml Wasser aufkochen und zugedeckt 15 Minuten bei kleiner Hitze garen, dann 10 Minuten ruhen lassen.
Möhren und Zucchini in feine Streifen, Champignons in Scheiben schneiden.
Gemüse nacheinander in etwas Rapsöl je 2–3 Minuten braten und leicht salzen.
Spinat mit Knoblauch 1 Minute zusammenfallen lassen und mit Sesamöl würzen.
Eier als Spiegeleier 3–4 Minuten braten.
Reis in Schalen füllen, Gemüse und Ei darauf anrichten.
Chilipaste mit Sojasoße verrühren, darüberträufeln und mit Sesam bestreuen.`,
  },
  {
    id: "bulgogi-bowl",
    titel: "Bulgogi-Bowl mit Reis",
    dauer: 50,
    schlagwoerter: ["fleisch", "reis", "asiatisch", "kinder"],
    saison: [],
    zutaten: `150 g Sushireis
300 g Rinderhüftsteak
1 Birne
3 EL Sojasoße
1 EL Honig
1 EL Sesamöl
1 Zehe Knoblauch
1 Möhre
1 Gurke
2 Frühlingszwiebeln
1 EL Rapsöl
1 EL Sesam`,
    gewuerze: `1 TL Ingwer, gerieben
Pfeffer`,
    schritte: `Fleisch in hauchdünne Streifen schneiden.
Halbe Birne fein reiben, mit Sojasoße, Honig, Sesamöl, Knoblauch und Ingwer verrühren.
Fleisch darin mindestens 30 Minuten marinieren.
Reis mit 220 ml Wasser aufkochen und zugedeckt 15 Minuten garen.
Möhre und Gurke in Stifte, Frühlingszwiebeln in Ringe schneiden.
Fleisch im heißen Öl portionsweise 2–3 Minuten scharf anbraten.
Reis, Fleisch und Gemüse in Schalen anrichten und mit Sesam bestreuen.`,
  },
  {
    id: "japchae-gemuese",
    titel: "Japchae mit Glasnudeln und Gemüse",
    dauer: 30,
    schlagwoerter: ["vegan", "pfanne", "asiatisch"],
    saison: [],
    zutaten: `150 g Glasnudeln
150 g Babyspinat
1 Möhre
1 Paprika, rot
150 g Champignons
1 Zwiebel
3 EL Sojasoße
1 EL Rohrzucker
2 EL Sesamöl
1 EL Rapsöl
1 EL Sesam`,
    gewuerze: `1 Zehe Knoblauch, gehackt
Pfeffer`,
    schritte: `Glasnudeln in kochendem Wasser 5–6 Minuten garen, kalt abspülen und mit der Schere kürzen.
Sojasoße, Zucker und 1 EL Sesamöl verrühren.
Zwiebel, Möhre und Paprika in Streifen, Champignons in Scheiben schneiden.
Gemüse im Rapsöl mit Knoblauch 4 Minuten braten, Spinat 1 Minute mitbraten.
Nudeln und Soße zugeben und 2 Minuten unter Wenden braten.
Mit restlichem Sesamöl, Pfeffer und Sesam abschmecken.`,
  },
  {
    id: "mapo-tofu-pilze",
    titel: "Mapo Tofu mit Pilzen",
    dauer: 25,
    schlagwoerter: ["vegan", "reis", "asiatisch"],
    saison: [],
    zutaten: `150 g Jasminreis
400 g Tofu, seidig
150 g Shiitake-Pilze
2 Frühlingszwiebeln
1 Zehe Knoblauch
1 EL Chilibohnenpaste
2 EL Sojasoße
200 ml Gemüsebrühe
1 TL Speisestärke
2 EL Rapsöl`,
    gewuerze: `1 TL Ingwer, gerieben
1 TL Szechuanpfeffer, gemörsert`,
    schritte: `Reis in 250 ml Salzwasser aufkochen und zugedeckt 12–15 Minuten garen.
Tofu in Würfel, Pilze fein hacken, Frühlingszwiebeln in Ringe schneiden.
Pilze im Öl 4 Minuten kräftig anbraten, Knoblauch, Ingwer und Chilibohnenpaste 1 Minute mitrösten.
Brühe und Sojasoße angießen, Tofu vorsichtig zugeben und 5 Minuten leise köcheln lassen.
Stärke mit etwas Wasser anrühren, einrühren und 1 Minute binden lassen.
Mit Szechuanpfeffer und Frühlingszwiebeln bestreuen und mit Reis servieren.`,
  },
  {
    id: "kung-pao-chicken",
    titel: "Kung Pao Chicken",
    dauer: 25,
    schlagwoerter: ["geflügel", "pfanne", "reis", "asiatisch"],
    saison: [],
    zutaten: `150 g Jasminreis
300 g Hähnchenbrust
1 Paprika, rot
3 Frühlingszwiebeln
50 g Erdnüsse, ungesalzen
3 EL Sojasoße
1 EL Reisessig
1 EL Rohrzucker
2 TL Speisestärke
2 EL Rapsöl`,
    gewuerze: `4 Chilischoten, getrocknet
1 Zehe Knoblauch, gehackt
1 TL Ingwer, gerieben
½ TL Szechuanpfeffer`,
    schritte: `Reis in 250 ml Salzwasser aufkochen und zugedeckt 12–15 Minuten garen.
Hähnchen würfeln und mit 1 EL Sojasoße und 1 TL Stärke mischen, 10 Minuten ziehen lassen.
Restliche Sojasoße, Essig, Zucker, Stärke und 3 EL Wasser verrühren.
Erdnüsse in der trockenen Pfanne 2 Minuten rösten, herausnehmen.
Hähnchen im Öl 4–5 Minuten braten, Chilis, Knoblauch, Ingwer und Paprika 2 Minuten mitbraten.
Soße zugeben und 1 Minute eindicken lassen, Erdnüsse und Frühlingszwiebeln unterheben.`,
  },
  {
    id: "gebratene-nudeln-rind",
    titel: "Gebratene Nudeln mit Rind",
    dauer: 25,
    schlagwoerter: ["fleisch", "pfanne", "asiatisch"],
    saison: [],
    zutaten: `200 g Mie-Nudeln
250 g Rinderhüftsteak
1 Paprika, rot
150 g Pak Choi
1 Möhre
2 Frühlingszwiebeln
3 EL Sojasoße
2 EL Austernsoße
1 TL Speisestärke
2 EL Rapsöl`,
    gewuerze: `1 Zehe Knoblauch, gehackt
1 TL Ingwer, gerieben
Pfeffer`,
    schritte: `Nudeln in kochendem Wasser 4 Minuten garen, abgießen und abtropfen lassen.
Rindfleisch in dünne Streifen schneiden und mit 1 EL Sojasoße und der Stärke mischen.
Paprika und Möhre in Streifen, Pak Choi in Stücke, Frühlingszwiebeln in Ringe schneiden.
Fleisch im heißen Öl 2 Minuten scharf anbraten und herausnehmen.
Gemüse mit Knoblauch und Ingwer 3–4 Minuten pfannenrühren.
Nudeln, Fleisch, restliche Sojasoße und Austernsoße zugeben und 2 Minuten durchbraten.`,
  },
  {
    id: "bami-goreng",
    titel: "Bami Goreng mit Hähnchen",
    dauer: 30,
    schlagwoerter: ["geflügel", "pfanne", "asiatisch", "kinder"],
    saison: [],
    zutaten: `200 g Mie-Nudeln
250 g Hähnchenbrust
2 Eier
200 g Weißkohl
1 Möhre
1 Zwiebel
1 Zehe Knoblauch
3 EL Ketjap Manis
1 EL Sojasoße
2 EL Rapsöl`,
    gewuerze: `1 TL Currypulver
(1 Prise Chili)`,
    schritte: `Nudeln in kochendem Wasser 4 Minuten garen und abgießen.
Hähnchen in Streifen, Kohl in feine Streifen, Möhre in Stifte schneiden, Zwiebel und Knoblauch würfeln.
Hähnchen im Öl 4 Minuten anbraten, Zwiebel und Knoblauch 1 Minute mitbraten.
Kohl und Möhre zugeben und 4–5 Minuten braten.
Eier verquirlen, in die Pfanne geben und 1 Minute stocken lassen.
Nudeln, Ketjap Manis, Sojasoße und Curry zugeben und 2 Minuten durchschwenken. Für Kinder ohne Chili servieren.`,
  },
  {
    id: "nasi-goreng-spiegelei",
    titel: "Nasi Goreng mit Spiegelei",
    dauer: 30,
    schlagwoerter: ["vegetarisch", "reis", "pfanne", "asiatisch", "kinder"],
    saison: [],
    zutaten: `200 g Basmatireis
3 Eier
1 Möhre
150 g Weißkohl
100 g Erbsen, tiefgekühlt
2 Frühlingszwiebeln
1 Zehe Knoblauch
3 EL Ketjap Manis
1 Gurke
2 EL Rapsöl`,
    gewuerze: `Salz
1 TL Currypulver
(1 TL Sambal Oelek)`,
    schritte: `Reis in 400 ml Salzwasser 12–15 Minuten garen und mindestens 30 Minuten abkühlen lassen (oder Reis vom Vortag nehmen).
Möhre und Kohl fein schneiden, Frühlingszwiebeln in Ringe schneiden.
Gemüse und Knoblauch in 1 EL Öl 4 Minuten braten, Erbsen 2 Minuten mitbraten.
Reis und Curry zugeben und 5 Minuten unter Wenden braten, bis er leicht knusprig ist.
Ketjap Manis unterrühren und abschmecken.
Eier im restlichen Öl 3–4 Minuten zu Spiegeleiern braten und auf den Reis setzen.
Mit Gurkenscheiben servieren, Sambal Oelek nur für die Großen dazustellen.`,
  },
  {
    id: "chicken-katsu-curry",
    titel: "Chicken Katsu Curry",
    dauer: 45,
    schlagwoerter: ["geflügel", "reis", "asiatisch", "kinder"],
    saison: [],
    zutaten: `150 g Sushireis
300 g Hähnchenbrust
1 Ei
3 EL Mehl
60 g Paniermehl
1 Zwiebel
1 Möhre
1 Kartoffel
400 ml Gemüsebrühe
1 EL Honig
1 EL Sojasoße
1 EL Butter
100 ml Rapsöl`,
    gewuerze: `Salz
2 TL Currypulver, mild
1 TL Ingwer, gerieben`,
    schritte: `Reis mit 220 ml Wasser aufkochen und zugedeckt 15 Minuten garen.
Zwiebel, Möhre und Kartoffel klein würfeln und in der Butter 5 Minuten anschwitzen.
Curry und 1 EL Mehl einrühren, mit Brühe ablöschen und 15 Minuten köcheln lassen.
Soße mit Honig, Sojasoße und Ingwer abschmecken und fein pürieren.
Hähnchen flach klopfen, salzen, in Mehl, verquirltem Ei und Paniermehl wenden.
Im heißen Öl je Seite 4–5 Minuten goldbraun braten und auf Küchenpapier abtropfen lassen.
Hähnchen in Streifen schneiden und mit Reis und Currysoße servieren.`,
  },
  {
    id: "yaki-udon-gemuese",
    titel: "Yaki Udon mit Gemüse",
    dauer: 20,
    schlagwoerter: ["vegetarisch", "pfanne", "asiatisch", "kinder"],
    saison: [],
    zutaten: `400 g Udon, vorgegart
200 g Weißkohl
1 Möhre
150 g Champignons
2 Frühlingszwiebeln
1 Zehe Knoblauch
3 EL Sojasoße
1 EL Honig
1 EL Sesamöl
1 EL Rapsöl`,
    gewuerze: `1 TL Ingwer, gerieben
(Sesam, zum Bestreuen)`,
    schritte: `Udon mit kochendem Wasser übergießen, 1 Minute ziehen lassen und mit einer Gabel lockern, abgießen.
Kohl in Streifen, Möhre in Stifte, Champignons in Scheiben, Frühlingszwiebeln in Ringe schneiden.
Gemüse mit Knoblauch und Ingwer im Rapsöl 4–5 Minuten scharf anbraten.
Sojasoße, Honig und Sesamöl verrühren.
Nudeln und Soße zugeben und 2 Minuten unter Wenden braten.
Mit Frühlingszwiebeln und Sesam bestreut servieren.`,
  },
  {
    id: "miso-ramen-ei",
    titel: "Miso-Ramen mit Ei",
    dauer: 35,
    schlagwoerter: ["vegetarisch", "suppe", "asiatisch"],
    saison: [10, 11, 12, 1, 2, 3],
    zutaten: `200 g Ramen-Nudeln
2 Eier
800 ml Gemüsebrühe
2 EL Misopaste
150 g Pak Choi
100 g Champignons
2 Frühlingszwiebeln
100 g Mais, aus der Dose
2 EL Sojasoße
1 TL Sesamöl`,
    gewuerze: `1 Zehe Knoblauch, gerieben
1 TL Ingwer, gerieben
(1 Prise Chiliflocken)`,
    schritte: `Eier in kochendem Wasser 6–7 Minuten wachsweich kochen, kalt abschrecken und pellen.
Brühe mit Knoblauch und Ingwer aufkochen, Champignons in Scheiben zugeben und 5 Minuten köcheln lassen.
Pak Choi halbieren und 2 Minuten in der Brühe garen.
Topf vom Herd nehmen, Misopaste und Sojasoße einrühren (Miso nicht mehr kochen).
Nudeln in Wasser 3–4 Minuten garen, abgießen und auf Schalen verteilen.
Brühe und Gemüse darübergeben, mit halbierten Eiern, Mais, Frühlingszwiebeln und Sesamöl servieren.`,
  },
  {
    id: "onigiri-bowl-lachs",
    titel: "Onigiri-Bowl mit Lachs",
    dauer: 30,
    schlagwoerter: ["fisch", "reis", "asiatisch", "leicht"],
    saison: [],
    zutaten: `150 g Sushireis
250 g Lachsfilet
1 Avocado
1 Gurke
100 g Edamame, tiefgekühlt
2 EL Sojasoße
1 EL Reisessig
1 EL Mayonnaise
1 EL Rapsöl
1 EL Sesam
(1 Pck. Noriblätter)`,
    gewuerze: `Salz
1 TL Zucker`,
    schritte: `Reis waschen, mit 220 ml Wasser aufkochen und zugedeckt 15 Minuten garen, dann 10 Minuten ruhen lassen.
Reisessig mit Zucker und 1 Prise Salz verrühren und unter den Reis heben.
Edamame in kochendem Wasser 3 Minuten garen und abgießen.
Lachs salzen und im Öl je Seite 3–4 Minuten braten, dann mit der Gabel zerpflücken und mit 1 EL Sojasoße mischen.
Gurke und Avocado in Würfel schneiden.
Reis in Schalen füllen, Lachs, Gemüse und Edamame darauf verteilen.
Mit Mayonnaise, restlicher Sojasoße, Sesam und zerkleinerten Noriblättern servieren.`,
  },
  {
    id: "butter-chicken",
    titel: "Butter Chicken mit Basmatireis",
    dauer: 45,
    schlagwoerter: ["geflügel", "reis", "asiatisch", "kinder"],
    saison: [],
    zutaten: `150 g Basmatireis
350 g Hähnchenbrust
150 g Joghurt
1 Zwiebel
2 Zehen Knoblauch
1 Stück Ingwer, daumengroß
1 Dose Tomaten, passiert
100 ml Sahne
30 g Butter
(2 Stück Naan)`,
    gewuerze: `Salz
2 TL Garam Masala
1 TL Paprikapulver, edelsüß
1 TL Kurkuma
1 TL Zucker
Koriander, zum Bestreuen`,
    schritte: `Hähnchen würfeln, mit Joghurt, 1 TL Garam Masala, Paprika und Salz mischen und 15 Minuten marinieren.
Reis in 300 ml Salzwasser aufkochen und zugedeckt 12–15 Minuten garen.
Zwiebel, Knoblauch und Ingwer fein hacken und in der Butter 4 Minuten weich dünsten.
Restliche Gewürze 30 Sekunden mitrösten, Tomaten zugeben und 10 Minuten köcheln lassen.
Hähnchen in der Soße 8–10 Minuten gar ziehen lassen.
Sahne und Zucker einrühren, 2 Minuten köcheln lassen und mit Reis, Koriander und Naan servieren.`,
  },
  {
    id: "palak-paneer",
    titel: "Palak Paneer",
    dauer: 35,
    schlagwoerter: ["vegetarisch", "reis", "asiatisch"],
    saison: [],
    zutaten: `150 g Basmatireis
200 g Paneer
450 g Blattspinat, tiefgekühlt
1 Zwiebel
2 Zehen Knoblauch
1 Stück Ingwer, daumengroß
1 Tomate
100 ml Sahne
2 EL Rapsöl`,
    gewuerze: `Salz
1 TL Kreuzkümmel, ganz
1 TL Garam Masala
½ TL Kurkuma
1 Prise Chili`,
    schritte: `Spinat in einem Topf 8 Minuten auftauen lassen und grob pürieren.
Reis in 300 ml Salzwasser aufkochen und zugedeckt 12–15 Minuten garen.
Paneer würfeln und in 1 EL Öl 4–5 Minuten rundum goldbraun braten, herausnehmen.
Kreuzkümmel im restlichen Öl 30 Sekunden rösten, Zwiebel, Knoblauch und Ingwer 4 Minuten mitdünsten.
Gewürfelte Tomate und Gewürze zugeben und 3 Minuten köcheln lassen.
Spinat und Sahne einrühren und 5 Minuten köcheln lassen.
Paneer unterheben, salzen und mit dem Reis servieren.`,
  },
  {
    id: "chana-masala",
    titel: "Chana Masala",
    dauer: 30,
    schlagwoerter: ["vegan", "asiatisch", "mealprep"],
    saison: [],
    zutaten: `150 g Basmatireis
2 Dosen Kichererbsen
1 Dose Tomaten, gehackt
1 Zwiebel
2 Zehen Knoblauch
1 Stück Ingwer, daumengroß
1 Zitrone
2 EL Rapsöl`,
    gewuerze: `Salz
1 TL Kreuzkümmel
2 TL Garam Masala
1 TL Koriander, gemahlen
½ TL Kurkuma
1 Prise Chili
Koriander, zum Bestreuen`,
    schritte: `Reis in 300 ml Salzwasser aufkochen und zugedeckt 12–15 Minuten garen.
Zwiebel, Knoblauch und Ingwer fein hacken und im Öl 5 Minuten goldgelb braten.
Gewürze zugeben und 30 Sekunden mitrösten.
Tomaten und abgetropfte Kichererbsen zugeben und 15 Minuten köcheln lassen.
Einen Teil der Kichererbsen am Topfrand zerdrücken, damit die Soße bindet.
Mit Zitronensaft und Salz abschmecken und mit Koriander und Reis servieren.`,
  },
  {
    id: "dal-makhani",
    titel: "Dal Makhani",
    dauer: 60,
    schlagwoerter: ["vegetarisch", "eintopf", "asiatisch", "mealprep"],
    saison: [10, 11, 12, 1, 2, 3],
    zutaten: `150 g Belugalinsen
1 Dose Kidneybohnen
1 Dose Tomaten, passiert
1 Zwiebel
2 Zehen Knoblauch
1 Stück Ingwer, daumengroß
40 g Butter
100 ml Sahne
150 g Basmatireis
(2 Stück Naan)`,
    gewuerze: `Salz
1 TL Kreuzkümmel
2 TL Garam Masala
1 TL Paprikapulver, edelsüß
1 Prise Chili`,
    schritte: `Linsen abspülen und in 600 ml Wasser 25 Minuten weich kochen.
Zwiebel, Knoblauch und Ingwer fein hacken und in der Hälfte der Butter 5 Minuten dünsten.
Gewürze 30 Sekunden mitrösten, Tomaten zugeben und 5 Minuten köcheln lassen.
Linsen samt Kochwasser und abgetropfte Kidneybohnen zugeben und 20 Minuten sämig köcheln lassen.
In der Zwischenzeit Reis in 300 ml Salzwasser 12–15 Minuten garen.
Restliche Butter und Sahne einrühren, salzen und mit Reis oder Naan servieren.`,
  },
  {
    id: "massaman-curry-rind",
    titel: "Massaman-Curry mit Rind und Kartoffeln",
    dauer: 75,
    schlagwoerter: ["fleisch", "kartoffeln", "asiatisch", "deftig"],
    saison: [10, 11, 12, 1, 2],
    zutaten: `400 g Rindergulasch
400 g Kartoffeln, festkochend
1 Zwiebel
1 Dose Kokosmilch
2 EL Currypaste, Massaman
200 ml Rinderbrühe
40 g Erdnüsse, geröstet
1 EL Fischsoße
1 EL Rohrzucker
1 Limette
1 EL Rapsöl`,
    gewuerze: `1 Zimtstange
1 Sternanis`,
    schritte: `Fleisch in mundgerechte Würfel schneiden und im Öl 5 Minuten rundum anbraten.
Zwiebel in Spalten schneiden, mit der Currypaste 2 Minuten mitrösten.
Kokosmilch, Brühe, Zimt und Sternanis zugeben und zugedeckt 40 Minuten leise schmoren.
Kartoffeln schälen, würfeln, zugeben und weitere 20 Minuten garen, bis sie weich sind.
Mit Fischsoße, Zucker und Limettensaft abschmecken.
Mit gehackten Erdnüssen bestreuen und servieren.`,
  },
  {
    id: "sommerrollen-erdnussdip",
    titel: "Sommerrollen mit Erdnussdip",
    dauer: 30,
    schlagwoerter: ["vegan", "leicht", "asiatisch"],
    saison: [5, 6, 7, 8, 9],
    zutaten: `1 Pck. Reispapier
80 g Reisnudeln, schmal
200 g Tofu, geräuchert
1 Möhre
1 Gurke
1 Paprika, rot
1 Kopf Salat
3 EL Erdnussbutter
2 EL Sojasoße
1 Limette
1 EL Ahornsirup`,
    gewuerze: `Minze
Koriander
1 Prise Chiliflocken`,
    schritte: `Reisnudeln in heißem Wasser 5 Minuten einweichen, abgießen und kalt abspülen.
Tofu, Möhre, Gurke und Paprika in feine Streifen schneiden, Salat in Streifen zupfen.
Erdnussbutter mit Sojasoße, Limettensaft, Ahornsirup, Chili und 3 EL warmem Wasser glatt rühren.
Ein Reispapier 10 Sekunden in lauwarmes Wasser tauchen und auf ein feuchtes Brett legen.
Salat, Nudeln, Gemüse, Tofu und Kräuter darauflegen, Seiten einschlagen und straff aufrollen.
Mit den übrigen Blättern ebenso verfahren und mit dem Dip servieren.`,
  },
  {
    id: "sweet-chili-lachs",
    titel: "Sweet-Chili-Lachs mit Reis und Pak Choi",
    dauer: 25,
    schlagwoerter: ["fisch", "reis", "ofen", "asiatisch", "kinder"],
    saison: [],
    zutaten: `150 g Jasminreis
2 Stück Lachsfilet
4 EL Sweet-Chili-Soße
1 EL Sojasoße
1 Limette
250 g Pak Choi
1 EL Sesamöl
1 EL Sesam`,
    gewuerze: `Salz
1 TL Ingwer, gerieben`,
    schritte: `Ofen auf 200 °C Umluft vorheizen.
Reis in 250 ml Salzwasser aufkochen und zugedeckt 12–15 Minuten garen.
Sweet-Chili-Soße, Sojasoße, Ingwer und etwas Limettensaft verrühren.
Lachs in eine Form legen, mit der Hälfte der Soße bestreichen und 12–14 Minuten backen.
Pak Choi halbieren und im Sesamöl 3–4 Minuten braten, leicht salzen.
Lachs mit der restlichen Soße beträufeln, mit Sesam bestreuen und mit Reis und Pak Choi servieren.`,
  },
  {
    id: "erdnuss-tofu-pfanne",
    titel: "Erdnuss-Tofu-Pfanne mit Brokkoli",
    dauer: 25,
    schlagwoerter: ["vegan", "pfanne", "reis", "asiatisch", "kinder"],
    saison: [],
    zutaten: `150 g Basmatireis
200 g Tofu, natur
250 g Brokkoli
1 Paprika, rot
1 Möhre
3 EL Erdnussbutter
3 EL Sojasoße
200 ml Kokosmilch
1 Limette
2 EL Rapsöl
(30 g Erdnüsse, geröstet)`,
    gewuerze: `1 TL Ingwer, gerieben
1 Zehe Knoblauch, gerieben`,
    schritte: `Reis in 300 ml Salzwasser aufkochen und zugedeckt 12–15 Minuten garen.
Tofu würfeln und in 1 EL Öl 6–8 Minuten knusprig braten, herausnehmen.
Brokkoli in Röschen teilen, Paprika und Möhre in Streifen schneiden.
Gemüse im restlichen Öl 5 Minuten braten.
Erdnussbutter, Sojasoße, Kokosmilch, Ingwer und Knoblauch verrühren, zugeben und 3 Minuten köcheln lassen.
Tofu unterheben, mit Limettensaft abschmecken und mit Reis und Erdnüssen servieren.`,
  },
];

export default REZEPTE;
