import type { SammlungsRezept } from "./typ";

/** Teil 8: Saisonale Gerichte für Herbst und Winter (Oktober bis Februar). */
const REZEPTE: SammlungsRezept[] = [
  {
    id: "gruenkohl-mit-kasseler-und-kartoffeln",
    titel: "Grünkohl mit Kasseler und Kartoffeln",
    dauer: 75,
    schlagwoerter: ["fleisch", "kartoffeln", "deftig", "klassiker"],
    saison: [11, 12, 1, 2],
    zutaten: `600 g Grünkohl, frisch oder tiefgekühlt
2 Zwiebeln
400 g Kasseler, am Stück
800 g Kartoffeln, festkochend
400 ml Gemüsebrühe
2 EL Haferflocken
1 TL Senf
2 EL Rapsöl`,
    gewuerze: `Salz
Pfeffer
Muskat
(Piment)`,
    schritte: `Frischen Grünkohl von den Stielen zupfen, waschen und 2 Minuten in Salzwasser blanchieren, dann grob hacken.
Zwiebeln würfeln und im Öl 3–4 Minuten glasig dünsten.
Grünkohl, Brühe und Kasseler zugeben und zugedeckt 45 Minuten schmoren.
Kartoffeln schälen und in Salzwasser 20 Minuten garen.
Kasseler herausnehmen, Haferflocken und Senf unter den Kohl rühren und 5 Minuten weiterköcheln.
Mit Salz, Pfeffer und Muskat abschmecken und mit dem in Scheiben geschnittenen Kasseler und den Kartoffeln servieren.`,
  },
  {
    id: "rotkohl-mit-apfel-und-semmelknoedeln",
    titel: "Rotkohl mit Apfel und Semmelknödeln",
    dauer: 50,
    schlagwoerter: ["vegetarisch", "deftig", "klassiker"],
    saison: [10, 11, 12, 1, 2],
    zutaten: `1 Kopf Rotkohl, klein
2 Äpfel, säuerlich
1 Zwiebel
2 EL Butter
150 ml Apfelsaft
3 EL Essig
1 EL Zucker
1 Pck. Semmelknödel
200 g Champignons
100 ml Sahne`,
    gewuerze: `Salz
Pfeffer
Lorbeer
Nelken
(Zimt)`,
    schritte: `Rotkohl vierteln, den Strunk entfernen und den Kohl in feine Streifen schneiden.
Zwiebel würfeln, Äpfel schälen und klein schneiden.
Zwiebel in der Butter 3 Minuten andünsten, Zucker darüberstreuen und 1 Minute karamellisieren lassen.
Rotkohl, Äpfel, Apfelsaft, Essig, Lorbeer und Nelken zugeben und zugedeckt 40 Minuten schmoren.
Semmelknödel in siedendem Salzwasser 20 Minuten ziehen lassen.
Champignons in Scheiben schneiden, 5 Minuten anbraten, Sahne zugeben und 3 Minuten einkochen.
Rotkohl mit Salz und Pfeffer abschmecken und mit Knödeln und Pilzrahm servieren.`,
  },
  {
    id: "gnocchi-mit-kuerbis-und-salbeibutter",
    titel: "Gnocchi mit Kürbis und Salbeibutter",
    dauer: 25,
    schlagwoerter: ["vegetarisch", "kinder", "pfanne", "italienisch"],
    saison: [9, 10, 11],
    zutaten: `1/2 Kürbis, Hokkaido
500 g Gnocchi, aus dem Kühlregal
3 EL Butter
1 EL Olivenöl
40 g Parmesan`,
    gewuerze: `Salz
Pfeffer
Salbei
(Muskat)`,
    schritte: `Kürbis entkernen und mit Schale in kleine Würfel schneiden.
Kürbiswürfel im Öl bei mittlerer Hitze 8–10 Minuten braten, bis sie weich sind.
Gnocchi zugeben und 5 Minuten rundum goldbraun mitbraten.
Butter und Salbeiblätter in die Pfanne geben und 2 Minuten aufschäumen lassen.
Mit Salz, Pfeffer und etwas Muskat würzen.
Mit frisch geriebenem Parmesan servieren.`,
  },
  {
    id: "ofenkuerbis-mit-feta",
    titel: "Ofenkürbis mit Feta und Honig",
    dauer: 40,
    schlagwoerter: ["vegetarisch", "ofen", "mediterran"],
    saison: [9, 10, 11],
    zutaten: `1 Kürbis, Hokkaido
1 Zwiebel, rot
200 g Feta
3 EL Olivenöl
1 EL Honig
30 g Kürbiskerne
1 Fladenbrot`,
    gewuerze: `Salz
Pfeffer
Thymian
(Chiliflocken)`,
    schritte: `Backofen auf 200 °C Ober-/Unterhitze vorheizen.
Kürbis entkernen und mit Schale in Spalten schneiden, Zwiebel in Streifen schneiden.
Gemüse mit Öl, Salz, Pfeffer und Thymian mischen und auf einem Blech verteilen.
25 Minuten backen.
Feta darüberbröckeln, mit Honig beträufeln und weitere 8 Minuten backen.
Kürbiskerne in einer trockenen Pfanne 2–3 Minuten rösten, darüberstreuen und mit Fladenbrot servieren.`,
  },
  {
    id: "maronensuppe",
    titel: "Maronensuppe",
    dauer: 35,
    schlagwoerter: ["vegetarisch", "suppe", "leicht"],
    saison: [10, 11, 12],
    zutaten: `250 g Maronen, vorgegart
1 Zwiebel
1 Karotte
1 Kartoffel
1 EL Butter
700 ml Gemüsebrühe
100 ml Sahne
(2 Scheiben Brot)`,
    gewuerze: `Salz
Pfeffer
Muskat
(Thymian)`,
    schritte: `Zwiebel, Karotte und Kartoffel schälen und klein würfeln, Maronen grob hacken.
Zwiebel in der Butter 3 Minuten andünsten, Gemüse und Maronen zugeben und 2 Minuten mitdünsten.
Mit Brühe ablöschen und zugedeckt 20 Minuten köcheln lassen.
Sahne zugeben und die Suppe fein pürieren.
Mit Salz, Pfeffer und Muskat abschmecken.
Nach Belieben Brotwürfel 3 Minuten in der Pfanne rösten und darüberstreuen.`,
  },
  {
    id: "rosenkohl-pasta-mit-walnuessen",
    titel: "Rosenkohl-Pasta mit Walnüssen",
    dauer: 25,
    schlagwoerter: ["vegetarisch", "pasta", "pfanne"],
    saison: [10, 11, 12, 1, 2],
    zutaten: `250 g Bandnudeln
400 g Rosenkohl
1 Zwiebel
1 Zehe Knoblauch
2 EL Olivenöl
40 g Walnüsse
100 ml Sahne
50 g Parmesan
(1 Zitrone)`,
    gewuerze: `Salz
Pfeffer
(Chiliflocken)`,
    schritte: `Nudeln in Salzwasser 8–10 Minuten bissfest kochen, dabei eine Tasse Nudelwasser aufheben.
Rosenkohl putzen und halbieren, Zwiebel und Knoblauch fein würfeln.
Rosenkohl mit den Schnittflächen nach unten im Öl 6–8 Minuten anbraten.
Zwiebel und Knoblauch zugeben und 2 Minuten mitbraten.
Walnüsse hacken und 1 Minute mitrösten.
Sahne, etwas Nudelwasser und die Nudeln unterheben, mit Parmesan, Salz, Pfeffer und etwas Zitronenabrieb abschmecken.`,
  },
  {
    id: "pastinakensuppe-mit-apfel",
    titel: "Pastinakensuppe mit Apfel",
    dauer: 30,
    schlagwoerter: ["vegan", "suppe", "leicht"],
    saison: [10, 11, 12, 1, 2],
    zutaten: `500 g Pastinaken
1 Apfel
1 Zwiebel
2 EL Rapsöl
700 ml Gemüsebrühe
100 ml Hafermilch
(1 Bund Petersilie)`,
    gewuerze: `Salz
Pfeffer
Muskat
(Ingwer)`,
    schritte: `Pastinaken und Zwiebel schälen und würfeln, Apfel schälen, entkernen und klein schneiden.
Zwiebel im Öl 3 Minuten andünsten, Pastinaken und Apfel zugeben und 2 Minuten mitdünsten.
Mit Brühe aufgießen und zugedeckt 20 Minuten köcheln lassen.
Hafermilch zugeben und die Suppe fein pürieren.
Mit Salz, Pfeffer, Muskat und etwas Ingwer abschmecken und mit Petersilie servieren.`,
  },
  {
    id: "steckruebeneintopf-mit-mettwurst",
    titel: "Steckrübeneintopf",
    dauer: 60,
    schlagwoerter: ["fleisch", "eintopf", "deftig", "klassiker"],
    saison: [10, 11, 12, 1, 2],
    zutaten: `1 Steckrübe, ca. 800 g
400 g Kartoffeln, mehligkochend
2 Karotten
1 Zwiebel
2 Mettwürste
1 EL Rapsöl
1 l Gemüsebrühe
1 Bund Petersilie`,
    gewuerze: `Salz
Pfeffer
Majoran
(Muskat)`,
    schritte: `Steckrübe, Kartoffeln, Karotten und Zwiebel schälen und in Würfel schneiden.
Zwiebel im Öl 3 Minuten andünsten.
Steckrübe und Karotten zugeben und 5 Minuten anschwitzen.
Brühe, Kartoffeln und die ganzen Mettwürste zugeben und zugedeckt 35 Minuten köcheln lassen.
Mettwürste herausnehmen und in Scheiben schneiden, einen Teil des Gemüses grob zerdrücken.
Wurst zurückgeben, mit Salz, Pfeffer und Majoran abschmecken und mit Petersilie bestreuen.`,
  },
  {
    id: "rote-bete-risotto",
    titel: "Rote-Bete-Risotto mit Ziegenkäse",
    dauer: 40,
    schlagwoerter: ["vegetarisch", "reis", "italienisch"],
    saison: [9, 10, 11, 12, 1, 2],
    zutaten: `200 g Risottoreis
300 g Rote Bete, vorgegart
1 Zwiebel
2 EL Butter
100 ml Weißwein
800 ml Gemüsebrühe
40 g Parmesan
100 g Ziegenfrischkäse
(30 g Walnüsse)`,
    gewuerze: `Salz
Pfeffer
(Thymian)`,
    schritte: `Rote Bete fein würfeln, Zwiebel fein hacken, Brühe heiß halten.
Zwiebel in 1 EL Butter 3 Minuten glasig dünsten, Reis zugeben und 1 Minute mitrösten.
Mit Weißwein ablöschen und 2 Minuten einkochen lassen.
Nach und nach heiße Brühe zugießen und den Reis unter Rühren 18–20 Minuten garen.
In den letzten 5 Minuten die Rote Bete unterrühren.
Restliche Butter und Parmesan unterziehen, 2 Minuten ruhen lassen und mit Ziegenkäse und Walnüssen servieren.`,
  },
  {
    id: "pilzgulasch-mit-bandnudeln",
    titel: "Pilzgulasch mit Bandnudeln",
    dauer: 40,
    schlagwoerter: ["vegetarisch", "pasta", "deftig"],
    saison: [9, 10, 11],
    zutaten: `600 g Champignons, braun
2 Zwiebeln
1 Paprika, rot
2 EL Rapsöl
1 EL Tomatenmark
1 EL Mehl
400 ml Gemüsebrühe
100 g Schmand
250 g Bandnudeln`,
    gewuerze: `Salz
Pfeffer
Paprikapulver, edelsüß
Kümmel
(Petersilie)`,
    schritte: `Pilze vierteln, Zwiebeln würfeln, Paprika in Stücke schneiden.
Pilze im Öl portionsweise 5 Minuten scharf anbraten und herausnehmen.
Zwiebeln und Paprika 4 Minuten anbraten, Tomatenmark und Paprikapulver 1 Minute mitrösten.
Mehl darüberstäuben, mit Brühe ablöschen, Pilze und Kümmel zugeben und 15 Minuten schmoren.
Nudeln in Salzwasser 8–10 Minuten bissfest kochen.
Gulasch mit Salz und Pfeffer abschmecken und mit Schmand und Nudeln servieren.`,
  },
  {
    id: "franzoesische-zwiebelsuppe",
    titel: "Französische Zwiebelsuppe",
    dauer: 60,
    schlagwoerter: ["vegetarisch", "suppe", "ofen", "klassiker"],
    saison: [10, 11, 12, 1, 2],
    zutaten: `5 Zwiebeln
2 EL Butter
1 TL Zucker
1 EL Mehl
150 ml Weißwein
800 ml Gemüsebrühe
4 Scheiben Baguette
100 g Käse, gerieben`,
    gewuerze: `Salz
Pfeffer
Thymian
Lorbeer`,
    schritte: `Zwiebeln halbieren und in feine Streifen schneiden.
Zwiebeln in der Butter bei mittlerer Hitze 20–25 Minuten goldbraun schmoren, dabei öfter rühren.
Zucker und Mehl darüberstreuen und 1 Minute mitrösten.
Mit Weißwein ablöschen, Brühe, Thymian und Lorbeer zugeben und 15 Minuten köcheln lassen.
Backofengrill vorheizen, Suppe mit Salz und Pfeffer abschmecken und in ofenfeste Schalen füllen.
Baguettescheiben auflegen, mit Käse bestreuen und 3–5 Minuten goldbraun überbacken.`,
  },
  {
    id: "apfelpfannkuchen-mit-zimt",
    titel: "Apfelpfannkuchen mit Zimt",
    dauer: 30,
    schlagwoerter: ["vegetarisch", "süß", "kinder", "pfanne"],
    saison: [9, 10, 11],
    zutaten: `200 g Mehl
3 Eier
350 ml Milch
1 EL Zucker
2 Äpfel
3 EL Butter
(150 g Joghurt)`,
    gewuerze: `Salz
Zimt
Zucker`,
    schritte: `Mehl, Eier, Milch, Zucker und eine Prise Salz glatt rühren und 10 Minuten quellen lassen.
Äpfel schälen, entkernen und in dünne Spalten schneiden.
Etwas Butter in einer Pfanne erhitzen und einige Apfelspalten darin 1–2 Minuten andünsten.
Eine Kelle Teig darübergießen und 2–3 Minuten stocken lassen.
Pfannkuchen wenden und 2 Minuten fertig backen, mit dem restlichen Teig ebenso verfahren.
Mit Zimt und Zucker bestreuen und nach Belieben mit Joghurt servieren.`,
  },
  {
    id: "hokkaido-kichererbsen-curry",
    titel: "Hokkaido-Kichererbsen-Curry mit Reis",
    dauer: 35,
    schlagwoerter: ["vegan", "reis", "asiatisch", "kinder"],
    saison: [9, 10, 11],
    zutaten: `1/2 Kürbis, Hokkaido
1 Dose Kichererbsen
1 Zwiebel
1 Zehe Knoblauch
1 Stück Ingwer, daumengroß
1 EL Currypaste, gelb
1 Dose Kokosmilch
200 g Basmatireis
1 EL Rapsöl
100 g Blattspinat`,
    gewuerze: `Salz
Currypulver
(Koriander)
(Limettensaft)`,
    schritte: `Reis in Salzwasser 12 Minuten garen und 5 Minuten zugedeckt quellen lassen.
Kürbis entkernen und mit Schale würfeln, Zwiebel, Knoblauch und Ingwer fein hacken.
Zwiebel, Knoblauch und Ingwer im Öl 2–3 Minuten andünsten, Currypaste 1 Minute mitrösten.
Kürbis, abgetropfte Kichererbsen und Kokosmilch zugeben und 15 Minuten köcheln lassen.
Spinat unterheben und 1 Minute zusammenfallen lassen.
Mit Salz und etwas Limettensaft abschmecken und mit dem Reis servieren.`,
  },
  {
    id: "entenbrust-mit-orangensosse-und-rosenkohl",
    titel: "Entenbrust mit Orangensoße und Rosenkohl",
    dauer: 50,
    schlagwoerter: ["geflügel", "kartoffeln", "deftig"],
    saison: [11, 12],
    zutaten: `2 Entenbrust
2 Orangen
150 ml Hühnerbrühe
1 TL Speisestärke
1 EL Honig
400 g Rosenkohl
600 g Kartoffeln, festkochend
1 EL Butter`,
    gewuerze: `Salz
Pfeffer
(Zimt)
(Thymian)`,
    schritte: `Backofen auf 160 °C Ober-/Unterhitze vorheizen, Kartoffeln in Salzwasser 20 Minuten garen.
Haut der Entenbrust rautenförmig einschneiden, salzen und pfeffern.
Entenbrust auf der Hautseite in einer kalten Pfanne langsam 8–10 Minuten braten, wenden und 2 Minuten weiterbraten.
Fleisch auf ein Blech legen und im Ofen 10–12 Minuten fertig garen, dann 5 Minuten ruhen lassen.
Fett bis auf einen Rest abgießen, Saft der Orangen, Brühe und Honig zugeben und 5 Minuten einkochen, mit angerührter Stärke binden.
Rosenkohl halbieren, in Salzwasser 6–8 Minuten garen und in der Butter schwenken.
Entenbrust in Scheiben schneiden und mit Soße, Rosenkohl und Kartoffeln servieren.`,
  },
  {
    id: "hirschgulasch-mit-spaetzle",
    titel: "Hirschgulasch mit Spätzle und Preiselbeeren",
    dauer: 150,
    schlagwoerter: ["fleisch", "deftig", "klassiker"],
    saison: [10, 11, 12],
    zutaten: `600 g Hirschgulasch
2 Zwiebeln
1 Karotte
2 EL Rapsöl
1 EL Tomatenmark
200 ml Rotwein
400 ml Rinderbrühe
2 EL Preiselbeeren, aus dem Glas
400 g Spätzle, aus dem Kühlregal
1 EL Butter`,
    gewuerze: `Salz
Pfeffer
Lorbeer
Wacholderbeeren
(Rosmarin)`,
    schritte: `Fleisch trocken tupfen, Zwiebeln und Karotte würfeln.
Fleisch im Öl portionsweise je 4–5 Minuten kräftig anbraten und herausnehmen.
Zwiebeln und Karotte 5 Minuten anrösten, Tomatenmark 1 Minute mitrösten.
Mit Rotwein ablöschen und 3 Minuten einkochen lassen.
Fleisch, Brühe, Lorbeer und angedrückte Wacholderbeeren zugeben und zugedeckt 1,5–2 Stunden schmoren.
Preiselbeeren einrühren und mit Salz und Pfeffer abschmecken.
Spätzle in der Butter 4–5 Minuten goldbraun braten und zum Gulasch servieren.`,
  },
  {
    id: "sellerieschnitzel-mit-kraeuterquark",
    titel: "Sellerieschnitzel mit Kräuterquark",
    dauer: 35,
    schlagwoerter: ["vegetarisch", "pfanne", "kinder"],
    saison: [10, 11, 12, 1, 2],
    zutaten: `1 Knolle Sellerie
2 Eier
4 EL Mehl
80 g Semmelbrösel
5 EL Rapsöl
250 g Quark
3 EL Milch
1 Bund Schnittlauch
(1 Zitrone)`,
    gewuerze: `Salz
Pfeffer
(Paprikapulver)`,
    schritte: `Sellerie schälen und in knapp 1 cm dicke Scheiben schneiden.
Scheiben in Salzwasser 6–8 Minuten vorgaren, abtropfen lassen und trocken tupfen.
Eier verquirlen, Scheiben nacheinander in Mehl, Ei und Semmelbröseln wenden.
Im heißen Öl von jeder Seite 3–4 Minuten goldbraun braten.
Quark mit Milch glatt rühren, Schnittlauch hineinschneiden und mit Salz und Pfeffer würzen.
Schnitzel mit Kräuterquark und Zitronenspalten servieren.`,
  },
  {
    id: "wintergemuese-vom-blech-mit-hummus",
    titel: "Wintergemüse vom Blech mit Hummus",
    dauer: 50,
    schlagwoerter: ["vegan", "ofen", "leicht", "mealprep"],
    saison: [10, 11, 12, 1, 2],
    zutaten: `2 Pastinaken
3 Karotten
2 Knollen Rote Bete
300 g Rosenkohl
1 Zwiebel, rot
4 EL Olivenöl
200 g Hummus
1 Fladenbrot`,
    gewuerze: `Salz
Pfeffer
Thymian
(Kreuzkümmel)`,
    schritte: `Backofen auf 200 °C Ober-/Unterhitze vorheizen.
Pastinaken, Karotten und Rote Bete schälen und in Stücke schneiden, Rosenkohl halbieren, Zwiebel in Spalten schneiden.
Gemüse mit Öl, Salz, Pfeffer, Thymian und Kreuzkümmel mischen und auf einem Blech verteilen.
35–40 Minuten backen, nach 20 Minuten einmal wenden.
Fladenbrot in den letzten 5 Minuten mit in den Ofen legen.
Gemüse mit Hummus und Fladenbrot servieren.`,
  },
  {
    id: "pastinakenpueree-mit-bratwurst",
    titel: "Pastinakenpüree mit Bratwurst und Zwiebeln",
    dauer: 30,
    schlagwoerter: ["fleisch", "kartoffeln", "kinder", "deftig"],
    saison: [10, 11, 12, 1, 2],
    zutaten: `400 g Pastinaken
400 g Kartoffeln, mehligkochend
150 ml Milch
2 EL Butter
4 Stück Bratwurst
2 Zwiebeln
1 EL Rapsöl`,
    gewuerze: `Salz
Pfeffer
Muskat`,
    schritte: `Pastinaken und Kartoffeln schälen, in Stücke schneiden und in Salzwasser 15–20 Minuten weich kochen.
Zwiebeln in Ringe schneiden.
Bratwürste im Öl rundum 10–12 Minuten braten und warm stellen.
Zwiebeln im Bratfett 6–8 Minuten goldbraun braten.
Gemüse abgießen, Milch und Butter erwärmen und alles zu Püree stampfen, mit Salz und Muskat würzen.
Püree mit Bratwurst und Zwiebeln servieren.`,
  },
  {
    id: "kartoffel-lauch-suppe",
    titel: "Kartoffel-Lauch-Suppe",
    dauer: 30,
    schlagwoerter: ["vegetarisch", "suppe", "kartoffeln", "kinder"],
    saison: [10, 11, 12, 1, 2],
    zutaten: `600 g Kartoffeln, mehligkochend
2 Stangen Lauch
1 Zwiebel
1 EL Butter
800 ml Gemüsebrühe
100 ml Sahne
(1 Bund Schnittlauch)`,
    gewuerze: `Salz
Pfeffer
Muskat
(Majoran)`,
    schritte: `Kartoffeln und Zwiebel schälen und würfeln, Lauch putzen, waschen und in Ringe schneiden.
Zwiebel und Lauch in der Butter 4 Minuten andünsten.
Kartoffeln und Brühe zugeben und zugedeckt 15–20 Minuten köcheln lassen.
Sahne zugeben und die Suppe grob oder fein pürieren.
Mit Salz, Pfeffer und Muskat abschmecken und mit Schnittlauch bestreuen.`,
  },
  {
    id: "bratapfel-milchreis",
    titel: "Bratapfel-Milchreis",
    dauer: 45,
    schlagwoerter: ["vegetarisch", "süß", "kinder"],
    saison: [11, 12, 1],
    zutaten: `200 g Milchreis
800 ml Milch
2 EL Zucker
1 Pck. Vanillezucker
2 Äpfel
2 EL Butter
30 g Rosinen
30 g Mandeln, gehobelt`,
    gewuerze: `Salz
Zimt
(Kardamom)`,
    schritte: `Milch mit Zucker, Vanillezucker und einer Prise Salz aufkochen, Milchreis einrühren.
Bei kleinster Hitze zugedeckt 30 Minuten quellen lassen, dabei gelegentlich umrühren.
Äpfel schälen, entkernen und würfeln.
Apfelwürfel in der Butter mit Rosinen und Zimt 5 Minuten weich dünsten.
Mandeln in einer trockenen Pfanne 2–3 Minuten goldbraun rösten.
Milchreis mit den Bratäpfeln und Mandeln anrichten.`,
  },
  {
    id: "gruenkohl-pesto-pasta",
    titel: "Grünkohl-Pesto-Pasta",
    dauer: 25,
    schlagwoerter: ["vegetarisch", "pasta", "leicht"],
    saison: [11, 12, 1, 2],
    zutaten: `250 g Spaghetti
150 g Grünkohl, frisch
1 Zehe Knoblauch
40 g Walnüsse
50 g Parmesan
6 EL Olivenöl
(1 Zitrone)`,
    gewuerze: `Salz
Pfeffer`,
    schritte: `Nudeln in Salzwasser 9–11 Minuten bissfest kochen, eine Tasse Nudelwasser aufheben.
Grünkohl von den Stielen zupfen und 1 Minute in kochendem Salzwasser blanchieren, kalt abschrecken und ausdrücken.
Walnüsse in einer trockenen Pfanne 2–3 Minuten rösten.
Grünkohl mit Knoblauch, Walnüssen, Parmesan und Öl fein pürieren, mit Salz, Pfeffer und Zitronensaft abschmecken.
Nudeln mit dem Pesto und etwas Nudelwasser mischen.`,
  },
  {
    id: "feldsalat-mit-warmen-pilzen",
    titel: "Feldsalat mit warmen Pilzen",
    dauer: 20,
    schlagwoerter: ["vegetarisch", "salat", "leicht"],
    saison: [10, 11, 12, 1, 2],
    zutaten: `150 g Feldsalat
400 g Champignons, braun
1 Zwiebel, rot
3 EL Olivenöl
2 EL Balsamicoessig
1 TL Honig
1 TL Senf
30 g Walnüsse
1 Baguette`,
    gewuerze: `Salz
Pfeffer
(Thymian)`,
    schritte: `Feldsalat waschen, putzen und trocken schleudern.
Essig, Honig, Senf, 2 EL Öl, Salz und Pfeffer zu einem Dressing verrühren.
Pilze in Scheiben schneiden, Zwiebel fein würfeln.
Pilze im restlichen Öl 5–6 Minuten scharf anbraten, Zwiebel und Thymian 1 Minute mitbraten und salzen.
Walnüsse grob hacken und 2 Minuten mitrösten.
Feldsalat mit Dressing mischen, warme Pilze darauf verteilen und mit Baguette servieren.`,
  },
  {
    id: "ofen-spitzkohl-mit-parmesan",
    titel: "Ofen-Spitzkohl mit Parmesan und Joghurt",
    dauer: 45,
    schlagwoerter: ["vegetarisch", "ofen", "leicht"],
    saison: [10, 11, 12, 1, 2, 3],
    zutaten: `1 Kopf Spitzkohl
3 EL Olivenöl
40 g Parmesan
250 g Joghurt
1 Zehe Knoblauch
1 Zitrone
30 g Kürbiskerne
1 Baguette`,
    gewuerze: `Salz
Pfeffer
Paprikapulver, geräuchert
(Chiliflocken)`,
    schritte: `Backofen auf 220 °C Ober-/Unterhitze vorheizen.
Spitzkohl der Länge nach vierteln, den Strunk dran lassen.
Kohlviertel mit Öl bepinseln, mit Salz, Pfeffer und Paprikapulver würzen und auf ein Blech legen.
25–30 Minuten backen, bis die Ränder dunkel und knusprig sind.
Parmesan darüberreiben und weitere 5 Minuten backen.
Joghurt mit gepresstem Knoblauch, Zitronensaft und Salz verrühren.
Kohl mit Joghurt, gerösteten Kürbiskernen und Baguette servieren.`,
  },
  {
    id: "lachs-auf-rahmwirsing",
    titel: "Lachs auf Rahmwirsing mit Kartoffeln",
    dauer: 35,
    schlagwoerter: ["fisch", "kartoffeln", "leicht"],
    saison: [10, 11, 12, 1, 2],
    zutaten: `2 Stück Lachsfilet
1/2 Kopf Wirsing
1 Zwiebel
1 EL Butter
150 ml Sahne
100 ml Gemüsebrühe
600 g Kartoffeln, festkochend
1 EL Rapsöl
(1 Zitrone)`,
    gewuerze: `Salz
Pfeffer
Muskat`,
    schritte: `Kartoffeln schälen und in Salzwasser 20 Minuten garen.
Wirsing vom Strunk befreien und in feine Streifen schneiden, Zwiebel würfeln.
Zwiebel in der Butter 3 Minuten andünsten, Wirsing zugeben und 3 Minuten mitdünsten.
Brühe und Sahne zugeben und 10 Minuten offen köcheln lassen, mit Salz, Pfeffer und Muskat abschmecken.
Lachs salzen und pfeffern, im Öl auf der Hautseite 4 Minuten braten, wenden und 2–3 Minuten fertig garen.
Lachs auf dem Rahmwirsing mit Kartoffeln und Zitronenspalten servieren.`,
  },
  {
    id: "kabeljau-mit-rote-bete-und-kartoffeln",
    titel: "Kabeljau mit Rote Bete und Meerrettichkartoffeln",
    dauer: 30,
    schlagwoerter: ["fisch", "kartoffeln", "pfanne"],
    saison: [10, 11, 12, 1, 2],
    zutaten: `2 Stück Kabeljau
300 g Rote Bete, vorgegart
600 g Kartoffeln, festkochend
1 EL Essig
1 TL Honig
2 EL Butter
1 EL Rapsöl
1 Bund Dill`,
    gewuerze: `Salz
Pfeffer
Meerrettich, aus dem Glas
(Mehl)`,
    schritte: `Kartoffeln schälen und in Salzwasser 20 Minuten garen.
Rote Bete würfeln, mit Essig, Honig, Salz und Pfeffer in einem Topf 5 Minuten erwärmen.
Kabeljau trocken tupfen, salzen und leicht mehlieren.
Fisch im Öl von jeder Seite 3–4 Minuten braten.
Kartoffeln abgießen, mit Butter und 1–2 TL Meerrettich schwenken.
Mit Rote Bete und Fisch anrichten und mit gehacktem Dill bestreuen.`,
  },
];

export default REZEPTE;
