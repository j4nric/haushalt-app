import type { SammlungsRezept } from "./typ";

/** Teil 6: Klassiker – deutsche und europäische Hausmannskost. */
const REZEPTE: SammlungsRezept[] = [
  {
    id: "sauerbraten-rotkohl-spaetzle",
    titel: "Sauerbraten mit Rotkohl und Spätzle",
    dauer: 150,
    schlagwoerter: ["fleisch", "deftig", "klassiker"],
    saison: [10, 11, 12, 1, 2],
    zutaten: `600 g Sauerbraten, vom Metzger eingelegt
1 Zwiebel
1 Möhre
200 ml Brühe
30 g Rosinen
2 Scheiben Lebkuchen, ohne Glasur
1 Glas Rotkohl
400 g Spätzle, aus dem Kühlregal
1 EL Butter
2 EL Öl`,
    gewuerze: `Salz
Pfeffer
1 Lorbeerblatt
Prise Zucker`,
    schritte: `Fleisch aus der Marinade nehmen, trocken tupfen und 300 ml Marinade abmessen.
Fleisch im Öl im Schmortopf rundum 8–10 Minuten kräftig anbraten.
Zwiebel und Möhre würfeln, zugeben und 5 Minuten mitrösten.
Marinade, Brühe und Lorbeer angießen und zugedeckt bei kleiner Hitze 2 Stunden schmoren.
Fleisch herausnehmen und 10 Minuten ruhen lassen, Lebkuchen in die Soße bröseln, Rosinen zugeben und 5 Minuten köcheln.
Rotkohl 10 Minuten erwärmen, Spätzle in der Butter 5 Minuten schwenken.
Soße mit Salz, Pfeffer und Zucker abschmecken, Fleisch in Scheiben schneiden und servieren.`,
  },
  {
    id: "schweinebraten-semmelknoedel",
    titel: "Schweinebraten mit Semmelknödeln",
    dauer: 150,
    schlagwoerter: ["fleisch", "ofen", "deftig", "klassiker"],
    saison: [10, 11, 12, 1, 2],
    zutaten: `800 g Schweinebraten, aus der Schulter mit Schwarte
2 Zwiebeln
1 Möhre
400 ml Brühe
(200 ml Dunkelbier)
4 Brötchen, vom Vortag
200 ml Milch
2 Eier
1 Bund Petersilie
1 EL Butter`,
    gewuerze: `Salz
Pfeffer
1 TL Kümmel
1 TL Majoran
Muskat`,
    schritte: `Backofen auf 180 °C Umluft vorheizen, Schwarte rautenförmig einschneiden und das Fleisch mit Salz, Pfeffer und Kümmel einreiben.
Zwiebeln und Möhre grob schneiden, mit dem Fleisch (Schwarte nach unten) in einen Bräter legen, 200 ml Brühe angießen und 30 Minuten garen.
Braten wenden, restliche Brühe und Bier zugeben und weitere 1,5 Stunden garen, dabei ab und zu begießen.
Für die Knödel Brötchen würfeln, Milch erwärmen, darübergießen und 15 Minuten einweichen.
Gehackte Petersilie in der Butter 1 Minute andünsten, mit Eiern, Salz und Muskat unter die Brötchen kneten und 4 Knödel formen.
Knödel in siedendem Salzwasser 20 Minuten ziehen lassen, das Wasser darf nicht sprudeln.
Für die Kruste den Ofen in den letzten 15 Minuten auf 220 °C Grill stellen, Soße durch ein Sieb gießen und abschmecken.`,
  },
  {
    id: "maultaschen-in-bruehe",
    titel: "Maultaschen in Brühe",
    dauer: 20,
    schlagwoerter: ["fleisch", "suppe", "kinder", "klassiker"],
    saison: [],
    zutaten: `400 g Maultaschen
1 l Brühe
1 Möhre
1 Stange Lauch
1 Zwiebel
1 EL Butter
(1 Bund Schnittlauch)`,
    gewuerze: `Salz
Pfeffer
Muskat`,
    schritte: `Möhre in feine Scheiben, Lauch in Ringe schneiden, Zwiebel würfeln.
Zwiebel in der Butter 3 Minuten glasig dünsten.
Brühe angießen, Möhre und Lauch zugeben und 5 Minuten köcheln lassen.
Maultaschen einlegen und bei kleiner Hitze 8–10 Minuten ziehen lassen.
Mit Salz, Pfeffer und Muskat abschmecken und mit Schnittlauch bestreut servieren.`,
  },
  {
    id: "kohlrouladen-salzkartoffeln",
    titel: "Kohlrouladen mit Salzkartoffeln",
    dauer: 90,
    schlagwoerter: ["fleisch", "kartoffeln", "deftig", "klassiker"],
    saison: [10, 11, 12, 1, 2],
    zutaten: `1 Kopf Weißkohl
350 g Hackfleisch, gemischt
1 Zwiebel
1 Ei
1 Brötchen, vom Vortag
1 EL Tomatenmark
400 ml Brühe
100 ml Sahne
700 g Kartoffeln
2 EL Öl`,
    gewuerze: `Salz
Pfeffer
1 TL Kümmel
1 TL Paprikapulver, edelsüß`,
    schritte: `Strunk aus dem Kohl schneiden, den Kopf in Salzwasser 5–6 Minuten kochen und 8 große Blätter ablösen.
Brötchen 10 Minuten einweichen, ausdrücken und mit Hackfleisch, gewürfelter Zwiebel, Ei, Salz, Pfeffer und Paprikapulver verkneten.
Je zwei Kohlblätter übereinanderlegen, Füllung daraufgeben, die Seiten einschlagen, aufrollen und mit Küchengarn binden.
Rouladen im Öl rundum 6–8 Minuten anbraten, Tomatenmark 1 Minute mitrösten und mit Brühe ablöschen.
Kümmel zugeben und zugedeckt bei kleiner Hitze 45 Minuten schmoren.
Kartoffeln schälen und in Salzwasser 20 Minuten kochen.
Sahne in die Soße rühren, 2 Minuten köcheln, abschmecken und mit den Kartoffeln servieren.`,
  },
  {
    id: "senfeier-kartoffelpueree",
    titel: "Senfeier mit Kartoffelpüree",
    dauer: 30,
    schlagwoerter: ["vegetarisch", "kartoffeln", "kinder", "klassiker"],
    saison: [],
    zutaten: `6 Eier
800 g Kartoffeln, mehligkochend
250 ml Milch
40 g Butter
2 EL Mehl
300 ml Gemüsebrühe
100 ml Sahne
2 EL Senf, mittelscharf`,
    gewuerze: `Salz
Pfeffer
Muskat
Prise Zucker
(Schnittlauch)`,
    schritte: `Kartoffeln schälen, würfeln und in Salzwasser 15–20 Minuten weich kochen.
Eier in kochendem Wasser 8 Minuten kochen, kalt abschrecken und pellen.
20 g Butter schmelzen, Mehl einrühren und 1 Minute anschwitzen.
Brühe und Sahne nach und nach einrühren und 5 Minuten köcheln lassen.
Senf und Zucker unterrühren, mit Salz und Pfeffer abschmecken und die halbierten Eier darin erwärmen.
Kartoffeln abgießen, mit warmer Milch und restlicher Butter stampfen, mit Muskat würzen und mit den Senfeiern servieren.`,
  },
  {
    id: "leberkaese-spiegelei-gurkensalat",
    titel: "Leberkäse mit Spiegelei und Gurkensalat",
    dauer: 20,
    schlagwoerter: ["fleisch", "pfanne", "kinder", "klassiker"],
    saison: [],
    zutaten: `2 Scheiben Leberkäse, je 1,5 cm dick
2 Eier
1 Gurke
150 g Joghurt
1 EL Essig, hell
2 Brötchen
1 EL Öl
(1 TL Senf)`,
    gewuerze: `Salz
Pfeffer
Prise Zucker
(Dill)`,
    schritte: `Gurke in feine Scheiben hobeln, leicht salzen und 5 Minuten ziehen lassen.
Joghurt mit Essig, Zucker, Pfeffer und Dill verrühren, Gurke ausdrücken und untermischen.
Leberkäse im Öl bei mittlerer Hitze von jeder Seite 3–4 Minuten knusprig braten und herausnehmen.
Eier in die Pfanne schlagen und 4 Minuten braten, bis das Eiweiß fest ist, salzen und pfeffern.
Spiegelei auf den Leberkäse setzen und mit Gurkensalat, Brötchen und Senf servieren.`,
  },
  {
    id: "labskaus-rote-bete",
    titel: "Labskaus mit Spiegelei und Roter Bete",
    dauer: 45,
    schlagwoerter: ["fleisch", "kartoffeln", "deftig", "klassiker"],
    saison: [],
    zutaten: `700 g Kartoffeln, mehligkochend
1 Dose Rindfleisch, als Corned Beef
1 Zwiebel
2 Gewürzgurken
1 Glas Rote Bete
2 Eier
(2 Stück Matjes)
2 EL Butter`,
    gewuerze: `Salz
Pfeffer
Muskat`,
    schritte: `Kartoffeln schälen, würfeln und in Salzwasser 20 Minuten weich kochen.
Zwiebel fein würfeln und in 1 EL Butter 5 Minuten weich dünsten.
Corned Beef würfeln, zur Zwiebel geben und 3 Minuten erhitzen.
Kartoffeln abgießen, mit etwas Gurkenwasser und Rote-Bete-Saft zur Fleischmasse geben und grob stampfen, mit Salz, Pfeffer und Muskat abschmecken.
Eier in der restlichen Butter 4 Minuten zu Spiegeleiern braten.
Labskaus mit Spiegelei, Gewürzgurken, Roter Bete und nach Wunsch Matjes anrichten.`,
  },
  {
    id: "himmel-und-erde-blutwurst",
    titel: "Himmel und Erde mit Blutwurst",
    dauer: 40,
    schlagwoerter: ["fleisch", "kartoffeln", "deftig", "klassiker"],
    saison: [9, 10, 11, 12, 1],
    zutaten: `700 g Kartoffeln, mehligkochend
2 Äpfel, säuerlich
300 g Blutwurst, in Scheiben
2 Zwiebeln
100 ml Milch
30 g Butter
2 EL Öl`,
    gewuerze: `Salz
Pfeffer
Muskat
Prise Zucker`,
    schritte: `Kartoffeln schälen, würfeln und in Salzwasser 20 Minuten weich kochen.
Äpfel schälen, entkernen, in Spalten schneiden und mit 3 EL Wasser und Zucker 8–10 Minuten weich dünsten.
Zwiebeln in Ringe schneiden und in 1 EL Öl 10 Minuten goldbraun braten.
Blutwurst im restlichen Öl von jeder Seite 2–3 Minuten braten.
Kartoffeln abgießen, mit Milch und Butter stampfen, mit Salz und Muskat würzen und die Hälfte der Äpfel unterheben.
Püree mit Blutwurst, Zwiebeln und den übrigen Äpfeln anrichten.`,
  },
  {
    id: "huehnerfrikassee-reis",
    titel: "Hühnerfrikassee mit Reis",
    dauer: 45,
    schlagwoerter: ["geflügel", "reis", "kinder", "klassiker"],
    saison: [],
    zutaten: `400 g Hähnchenbrust
500 ml Hühnerbrühe
150 g Champignons
150 g Erbsen, tiefgekühlt
1 Glas Spargel
30 g Butter
2 EL Mehl
100 ml Sahne
160 g Reis
(½ Zitrone)`,
    gewuerze: `Salz
Pfeffer
1 Lorbeerblatt
Prise Zucker`,
    schritte: `Brühe mit Lorbeer aufkochen, Hähnchenbrust einlegen und bei kleiner Hitze 15 Minuten gar ziehen lassen.
Reis in Salzwasser 15–18 Minuten kochen.
Hähnchen herausnehmen, 5 Minuten abkühlen lassen und in Stücke zupfen, Brühe aufheben.
Champignons in Scheiben schneiden und in der Butter 4 Minuten braten, Mehl darüberstäuben und 1 Minute anschwitzen.
400 ml Brühe und Sahne einrühren und 5 Minuten köcheln lassen.
Hähnchen, Erbsen und abgetropften Spargel zugeben und 3 Minuten erhitzen.
Mit Zitronensaft, Zucker, Salz und Pfeffer abschmecken und mit Reis servieren.`,
  },
  {
    id: "kartoffelauflauf-lauch",
    titel: "Kartoffelauflauf mit Lauch und Käse",
    dauer: 65,
    schlagwoerter: ["vegetarisch", "ofen", "kartoffeln", "kinder"],
    saison: [],
    zutaten: `800 g Kartoffeln, festkochend
1 Stange Lauch
200 ml Sahne
150 ml Milch
2 Eier
150 g Käse, gerieben
1 EL Butter`,
    gewuerze: `Salz
Pfeffer
Muskat
(Thymian)`,
    schritte: `Backofen auf 180 °C Umluft vorheizen und eine Auflaufform mit Butter fetten.
Kartoffeln schälen, in dünne Scheiben schneiden und in Salzwasser 5 Minuten vorgaren, abgießen.
Lauch in Ringe schneiden.
Sahne, Milch und Eier verquirlen und mit Salz, Pfeffer, Muskat und Thymian kräftig würzen.
Kartoffeln und Lauch abwechselnd in die Form schichten, Eiersahne darübergießen und mit Käse bestreuen.
Auflauf 40 Minuten goldbraun backen und vor dem Servieren 5 Minuten ruhen lassen.`,
  },
  {
    id: "wiener-schnitzel-kartoffelsalat",
    titel: "Wiener Schnitzel mit Kartoffel-Gurken-Salat",
    dauer: 50,
    schlagwoerter: ["fleisch", "kartoffeln", "pfanne", "klassiker"],
    saison: [],
    zutaten: `2 Kalbsschnitzel, dünn geschnitten
3 EL Mehl
2 Eier
80 g Semmelbrösel
600 g Kartoffeln, festkochend
½ Gurke
1 Zwiebel, rot
150 ml Gemüsebrühe
2 EL Essig, hell
5 EL Öl
2 EL Butter
1 Zitrone
(2 EL Preiselbeeren)`,
    gewuerze: `Salz
Pfeffer
1 TL Senf
Prise Zucker
(Schnittlauch)`,
    schritte: `Kartoffeln mit Schale in Salzwasser 20 Minuten kochen, pellen und noch warm in Scheiben schneiden.
Brühe mit Essig, Senf, Zucker, fein gewürfelter Zwiebel, Salz und Pfeffer aufkochen, über die Kartoffeln gießen und 20 Minuten ziehen lassen.
Gurke in feine Scheiben hobeln und mit 3 EL Öl unter den Salat mischen.
Schnitzel flach klopfen, salzen, pfeffern und nacheinander in Mehl, verquirltem Ei und Semmelbröseln wenden, nicht andrücken.
Butter mit restlichem Öl reichlich erhitzen und die Schnitzel unter Schwenken von jeder Seite 2–3 Minuten goldbraun backen.
Auf Küchenpapier abtropfen lassen und mit Zitronenspalten, Kartoffelsalat und nach Wunsch Preiselbeeren servieren.`,
  },
  {
    id: "zwiebelkuchen-blech",
    titel: "Zwiebelkuchen vom Blech",
    dauer: 90,
    schlagwoerter: ["vegetarisch", "ofen", "deftig", "klassiker"],
    saison: [9, 10, 11],
    zutaten: `250 g Mehl
½ Würfel Hefe
125 ml Milch, lauwarm
3 EL Öl
800 g Zwiebeln
200 g Schmand
2 Eier
1 EL Butter`,
    gewuerze: `Salz
Pfeffer
1 TL Kümmel
Muskat`,
    schritte: `Hefe in der lauwarmen Milch auflösen, mit Mehl, Öl und ½ TL Salz zu einem glatten Teig kneten und zugedeckt 45 Minuten gehen lassen.
Zwiebeln halbieren, in feine Streifen schneiden und in der Butter bei mittlerer Hitze 15 Minuten glasig dünsten, 10 Minuten abkühlen lassen.
Schmand mit Eiern, Salz, Pfeffer und Muskat verrühren und unter die Zwiebeln mischen.
Backofen auf 200 °C Ober-/Unterhitze vorheizen, Teig auf einem gefetteten Blech dünn ausrollen.
Zwiebelmasse auf dem Teig verteilen und mit Kümmel bestreuen.
Zwiebelkuchen 25–30 Minuten backen und vor dem Anschneiden 5 Minuten abkühlen lassen.`,
  },
  {
    id: "spaetzlepfanne-pilze-spinat",
    titel: "Spätzlepfanne mit Pilzen und Spinat",
    dauer: 25,
    schlagwoerter: ["vegetarisch", "pfanne", "kinder", "klassiker"],
    saison: [],
    zutaten: `400 g Spätzle, aus dem Kühlregal
250 g Champignons
100 g Blattspinat
1 Zwiebel
150 ml Sahne
80 g Bergkäse, gerieben
2 EL Butter`,
    gewuerze: `Salz
Pfeffer
Muskat`,
    schritte: `Champignons in Scheiben schneiden, Zwiebel würfeln.
Spätzle in 1 EL Butter bei mittlerer Hitze 5–6 Minuten goldbraun braten und herausnehmen.
Zwiebel und Champignons in der restlichen Butter 5 Minuten braten.
Sahne angießen, Spinat zugeben und 2 Minuten zusammenfallen lassen, mit Salz, Pfeffer und Muskat würzen.
Spätzle untermischen, Käse darüberstreuen und zugedeckt 2 Minuten schmelzen lassen.`,
  },
  {
    id: "huehnersuppe-nudeln",
    titel: "Hühnersuppe mit Nudeln",
    dauer: 100,
    schlagwoerter: ["geflügel", "suppe", "kinder", "klassiker"],
    saison: [],
    zutaten: `2 Hähnchenschenkel
2 Möhren
1 Stange Lauch
150 g Sellerie
1 Zwiebel
80 g Suppennudeln
(1 Bund Petersilie)`,
    gewuerze: `Salz
Pfeffer
1 Lorbeerblatt
5 Pfefferkörner`,
    schritte: `Hähnchenschenkel mit 1,5 l kaltem Wasser, halbierter Zwiebel, Lorbeer, Pfefferkörnern und 1 TL Salz aufkochen.
Schaum abschöpfen und bei kleiner Hitze 1 Stunde köcheln lassen.
Hähnchen herausnehmen, 10 Minuten abkühlen lassen, Fleisch von Haut und Knochen lösen und klein zupfen.
Brühe durch ein Sieb gießen, Möhren, Sellerie und Lauch klein schneiden und darin 10 Minuten garen.
Nudeln zugeben und 6–8 Minuten mitkochen.
Fleisch zurück in die Suppe geben, abschmecken und mit Petersilie bestreuen.`,
  },
  {
    id: "coq-au-vin",
    titel: "Coq au Vin mit Baguette",
    dauer: 100,
    schlagwoerter: ["geflügel", "deftig", "klassiker"],
    saison: [10, 11, 12, 1, 2],
    zutaten: `4 Hähnchenschenkel
100 g Speck, gewürfelt
200 g Champignons
8 Zwiebeln, klein
2 Zehen Knoblauch
1 EL Tomatenmark
1 EL Mehl
400 ml Rotwein
200 ml Hühnerbrühe
1 Baguette
1 EL Öl`,
    gewuerze: `Salz
Pfeffer
2 Zweige Thymian
1 Lorbeerblatt
(Petersilie)`,
    schritte: `Hähnchenschenkel salzen und pfeffern, kleine Zwiebeln schälen, Champignons halbieren.
Speck im Öl im Schmortopf 4 Minuten auslassen, Hähnchen zugeben und von jeder Seite 4–5 Minuten goldbraun braten, herausnehmen.
Zwiebeln, Champignons und Knoblauch 5 Minuten im Bratfett braten, Tomatenmark und Mehl 1 Minute mitrösten.
Mit Rotwein und Brühe ablöschen, Thymian und Lorbeer zugeben und das Hähnchen zurück in den Topf legen.
Zugedeckt bei kleiner Hitze 1 Stunde schmoren.
Deckel abnehmen, die Soße 10 Minuten einkochen, abschmecken und mit Petersilie und Baguette servieren.`,
  },
  {
    id: "moussaka",
    titel: "Moussaka",
    dauer: 100,
    schlagwoerter: ["fleisch", "ofen", "mediterran", "klassiker"],
    saison: [],
    zutaten: `2 Auberginen
400 g Kartoffeln, festkochend
300 g Hackfleisch, vom Rind
1 Zwiebel
1 Zehe Knoblauch
1 Dose Tomaten, gehackt
30 g Butter
2 EL Mehl
400 ml Milch
1 Ei
50 g Parmesan, gerieben
5 EL Olivenöl`,
    gewuerze: `1 TL Oregano
½ TL Zimt
Muskat
Salz
Pfeffer`,
    schritte: `Backofen auf 200 °C Umluft vorheizen, Auberginen und geschälte Kartoffeln in 1 cm dicke Scheiben schneiden.
Scheiben mit 4 EL Öl und Salz mischen, auf zwei Blechen verteilen und 20 Minuten backen.
Zwiebel und Knoblauch würfeln, Hackfleisch im restlichen Öl 5 Minuten krümelig braten, Zwiebel und Knoblauch 2 Minuten mitbraten.
Tomaten, Oregano und Zimt zugeben, salzen, pfeffern und 15 Minuten köcheln lassen.
Butter schmelzen, Mehl 1 Minute anschwitzen, Milch einrühren, 5 Minuten köcheln, vom Herd nehmen und Ei, Muskat und die Hälfte des Parmesans unterrühren.
Kartoffeln, Hackfleisch und Auberginen in eine Form schichten, mit der Soße bedecken und mit restlichem Parmesan bestreuen.
Ofen auf 180 °C stellen, Moussaka 35–40 Minuten goldbraun backen und 10 Minuten ruhen lassen.`,
  },
  {
    id: "boeuf-bourguignon",
    titel: "Boeuf Bourguignon mit Kartoffelpüree",
    dauer: 180,
    schlagwoerter: ["fleisch", "deftig", "klassiker", "mealprep"],
    saison: [10, 11, 12, 1, 2],
    zutaten: `600 g Rindergulasch, aus der Schulter
100 g Speck, gewürfelt
2 Möhren
8 Zwiebeln, klein
200 g Champignons
2 Zehen Knoblauch
1 EL Tomatenmark
1 EL Mehl
400 ml Rotwein
200 ml Rinderbrühe
700 g Kartoffeln, mehligkochend
150 ml Milch
40 g Butter
2 EL Öl`,
    gewuerze: `Salz
Pfeffer
2 Zweige Thymian
1 Lorbeerblatt
Muskat`,
    schritte: `Fleisch trocken tupfen, Möhren in dicke Scheiben schneiden, kleine Zwiebeln schälen.
Speck im Öl im Schmortopf 4 Minuten auslassen und herausnehmen, Fleisch portionsweise je 3–4 Minuten kräftig anbraten.
Möhren und Zwiebeln 5 Minuten mitbraten, Tomatenmark und Mehl 1 Minute mitrösten.
Mit Rotwein und Brühe ablöschen, Speck, Knoblauch, Thymian und Lorbeer zugeben und zugedeckt bei kleiner Hitze 2,5 Stunden schmoren.
Champignons vierteln, in 10 g Butter 5 Minuten braten und für die letzten 15 Minuten zum Fleisch geben.
Kartoffeln schälen und in Salzwasser 20 Minuten kochen, mit Milch und restlicher Butter zu Püree stampfen und mit Muskat würzen.
Schmorgericht abschmecken und mit dem Püree servieren.`,
  },
  {
    id: "spaghetti-puttanesca",
    titel: "Spaghetti alla Puttanesca",
    dauer: 25,
    schlagwoerter: ["fisch", "pasta", "italienisch", "klassiker"],
    saison: [],
    zutaten: `250 g Spaghetti
1 Dose Tomaten, gehackt
4 Sardellen, in Öl
60 g Oliven, schwarz
2 EL Kapern
2 Zehen Knoblauch
3 EL Olivenöl
(1 Bund Petersilie)`,
    gewuerze: `½ TL Chiliflocken
1 TL Oregano
Salz
Pfeffer`,
    schritte: `Spaghetti in reichlich Salzwasser 9–10 Minuten bissfest kochen.
Knoblauch in Scheiben schneiden, Sardellen hacken, Oliven halbieren.
Knoblauch, Sardellen und Chili im Öl 2 Minuten bei mittlerer Hitze anschwitzen, bis die Sardellen zerfallen.
Tomaten, Oliven, Kapern und Oregano zugeben und 10 Minuten köcheln lassen.
Spaghetti abgießen, dabei etwas Nudelwasser auffangen, und mit der Soße und 3 EL Nudelwasser 1 Minute durchschwenken.
Mit Pfeffer abschmecken und mit gehackter Petersilie servieren.`,
  },
  {
    id: "tortilla-espanola",
    titel: "Tortilla española",
    dauer: 40,
    schlagwoerter: ["vegetarisch", "kartoffeln", "mediterran", "klassiker"],
    saison: [],
    zutaten: `600 g Kartoffeln, festkochend
1 Zwiebel
6 Eier
100 ml Olivenöl
(1 Paprika, rot)`,
    gewuerze: `Salz
Pfeffer
(Paprikapulver, geräuchert)`,
    schritte: `Kartoffeln schälen und in dünne Scheiben schneiden, Zwiebel in feine Streifen schneiden.
Kartoffeln und Zwiebel im Öl in einer beschichteten Pfanne bei mittlerer Hitze 15–20 Minuten weich garen, nicht bräunen.
Eier mit Salz und Pfeffer verquirlen, Kartoffeln abtropfen lassen, untermischen und 5 Minuten ziehen lassen.
2 EL vom Öl in der Pfanne erhitzen, Masse hineingeben und bei kleiner Hitze zugedeckt 8 Minuten stocken lassen.
Tortilla mithilfe eines Tellers wenden und weitere 4–5 Minuten braten.
Lauwarm oder kalt in Stücken servieren.`,
  },
  {
    id: "ossobuco-polenta",
    titel: "Ossobuco mit Polenta",
    dauer: 135,
    schlagwoerter: ["fleisch", "italienisch", "deftig", "klassiker"],
    saison: [10, 11, 12, 1, 2],
    zutaten: `2 Scheiben Kalbfleisch, aus der Haxe, je 4 cm dick
2 EL Mehl
1 Zwiebel
1 Möhre
1 Stange Staudensellerie
1 Dose Tomaten, gehackt
150 ml Weißwein
300 ml Brühe
1 Zitrone, unbehandelt
1 Zehe Knoblauch
150 g Polenta
20 g Butter
2 EL Olivenöl`,
    gewuerze: `Salz
Pfeffer
1 Lorbeerblatt
(1 Bund Petersilie)`,
    schritte: `Haxenscheiben am Rand einschneiden, salzen, pfeffern und in Mehl wenden.
Fleisch im Öl im Schmortopf von jeder Seite 4–5 Minuten anbraten und herausnehmen.
Zwiebel, Möhre und Sellerie würfeln und 5 Minuten anbraten, mit Wein ablöschen und 2 Minuten einkochen.
Tomaten, Brühe und Lorbeer zugeben, Fleisch einlegen und zugedeckt bei kleiner Hitze 1,5–2 Stunden schmoren.
Für die Gremolata Zitronenschale, Knoblauch und Petersilie fein hacken.
Polenta in 600 ml kochendes Salzwasser rühren und unter Rühren 5–10 Minuten quellen lassen, Butter unterrühren.
Ossobuco mit Soße auf der Polenta anrichten und mit Gremolata bestreuen.`,
  },
  {
    id: "gnocchi-al-forno",
    titel: "Gnocchi al forno mit Mozzarella",
    dauer: 30,
    schlagwoerter: ["vegetarisch", "italienisch", "ofen", "kinder"],
    saison: [],
    zutaten: `500 g Gnocchi, aus dem Kühlregal
500 g Passata
1 Zwiebel
1 Zehe Knoblauch
125 g Mozzarella
30 g Parmesan, gerieben
1 EL Olivenöl`,
    gewuerze: `1 TL Oregano
Salz
Pfeffer
(Basilikum)`,
    schritte: `Backofen auf 200 °C Umluft vorheizen.
Zwiebel und Knoblauch würfeln und im Öl 3 Minuten andünsten.
Passata und Oregano zugeben, salzen, pfeffern und 5 Minuten köcheln lassen.
Gnocchi roh untermischen und alles in eine Auflaufform geben.
Mozzarella zerzupfen, mit Parmesan darauf verteilen und 15–18 Minuten backen, bis der Käse goldbraun ist.
Mit Basilikum bestreut servieren.`,
  },
  {
    id: "ungarisches-paprikahuhn",
    titel: "Ungarisches Paprikahuhn mit Nudeln",
    dauer: 60,
    schlagwoerter: ["geflügel", "pasta", "deftig", "klassiker"],
    saison: [],
    zutaten: `4 Hähnchenschenkel
2 Zwiebeln
2 Paprika, rot
1 Zehe Knoblauch
1 EL Tomatenmark
300 ml Hühnerbrühe
150 g Schmand
200 g Bandnudeln
2 EL Öl`,
    gewuerze: `2 EL Paprikapulver, edelsüß
½ TL Paprikapulver, rosenscharf
Salz
Pfeffer`,
    schritte: `Hähnchenschenkel salzen und im Öl im Schmortopf von jeder Seite 4–5 Minuten goldbraun braten, herausnehmen.
Zwiebeln würfeln, Paprika in Streifen schneiden und im Bratfett 5 Minuten braten.
Knoblauch, Tomatenmark und Paprikapulver unterrühren, 30 Sekunden rösten und sofort mit Brühe ablöschen.
Hähnchen zurück in den Topf legen und zugedeckt bei kleiner Hitze 35 Minuten schmoren.
Bandnudeln in Salzwasser 8–10 Minuten kochen.
Hähnchen herausnehmen, Schmand in die Soße rühren, nicht mehr kochen lassen, abschmecken und mit den Nudeln servieren.`,
  },
  {
    id: "koettbullar-preiselbeeren",
    titel: "Köttbullar mit Preiselbeeren und Kartoffelpüree",
    dauer: 45,
    schlagwoerter: ["fleisch", "kartoffeln", "kinder", "klassiker"],
    saison: [],
    zutaten: `400 g Hackfleisch, gemischt
1 Zwiebel
1 Ei
3 EL Semmelbrösel
800 g Kartoffeln, mehligkochend
150 ml Milch
40 g Butter
1 EL Mehl
250 ml Rinderbrühe
100 ml Sahne
1 TL Sojasauce
4 EL Preiselbeeren, aus dem Glas
1 EL Öl`,
    gewuerze: `Salz
Pfeffer
Muskat
Prise Piment`,
    schritte: `Kartoffeln schälen, würfeln und in Salzwasser 20 Minuten weich kochen.
Semmelbrösel in 3 EL Milch 5 Minuten quellen lassen, Zwiebel sehr fein würfeln.
Hackfleisch mit Bröseln, Zwiebel, Ei, Salz, Pfeffer und Piment verkneten und kleine Bällchen formen.
Bällchen in Öl und 10 g Butter rundum 8–10 Minuten braten und herausnehmen.
Mehl ins Bratfett rühren, 1 Minute anschwitzen, Brühe, Sahne und Sojasauce einrühren und 5 Minuten köcheln, Bällchen darin erwärmen.
Kartoffeln mit restlicher Milch und Butter zu Püree stampfen, mit Muskat würzen und mit Köttbullar, Soße und Preiselbeeren servieren.`,
  },
  {
    id: "fish-and-chips-ofen",
    titel: "Fish and Chips aus dem Ofen",
    dauer: 45,
    schlagwoerter: ["fisch", "ofen", "kartoffeln", "kinder"],
    saison: [],
    zutaten: `400 g Kabeljau, als Filet
800 g Kartoffeln, festkochend
2 EL Mehl
1 Ei
60 g Semmelbrösel
150 g Erbsen, tiefgekühlt
4 EL Mayonnaise
1 Gewürzgurke
1 Zitrone
4 EL Öl`,
    gewuerze: `Salz
Pfeffer
1 TL Paprikapulver, edelsüß
(Dill)`,
    schritte: `Backofen auf 220 °C Umluft vorheizen.
Kartoffeln mit Schale in dicke Stäbchen schneiden, mit 3 EL Öl, Salz und Paprikapulver mischen und 20 Minuten backen.
Fisch in 4 Stücke schneiden, salzen, nacheinander in Mehl, verquirltem Ei und Semmelbröseln wenden.
Fisch auf ein zweites Blech legen, mit restlichem Öl beträufeln und mit den Pommes weitere 15 Minuten backen, die Pommes einmal wenden.
Erbsen in wenig Salzwasser 4 Minuten garen und grob zerdrücken.
Mayonnaise mit gehackter Gewürzgurke, Dill und Zitronensaft verrühren und alles mit Zitronenspalten servieren.`,
  },
  {
    id: "scholle-finkenwerder-art",
    titel: "Scholle Finkenwerder Art mit Kartoffelsalat",
    dauer: 50,
    schlagwoerter: ["fisch", "kartoffeln", "pfanne", "klassiker"],
    saison: [5, 6, 7, 8],
    zutaten: `2 Schollen, küchenfertig
100 g Speck, gewürfelt
3 EL Mehl
600 g Kartoffeln, festkochend
1 Zwiebel
150 ml Gemüsebrühe
2 EL Essig, hell
3 EL Öl
30 g Butter
1 Zitrone`,
    gewuerze: `Salz
Pfeffer
1 TL Senf
Prise Zucker
(Petersilie)`,
    schritte: `Kartoffeln mit Schale in Salzwasser 20 Minuten kochen, pellen und in Scheiben schneiden.
Brühe mit Essig, Senf, Zucker, halber gewürfelter Zwiebel, Salz und Pfeffer aufkochen, mit 2 EL Öl über die Kartoffeln geben und 20 Minuten ziehen lassen.
Speck mit der restlichen Zwiebel in einer großen Pfanne 5 Minuten knusprig auslassen und herausnehmen.
Schollen waschen, trocken tupfen, salzen, mit Zitronensaft beträufeln und in Mehl wenden.
Schollen in Butter und restlichem Öl im Speckfett von jeder Seite 4–5 Minuten goldbraun braten.
Mit Speck bestreuen und mit Kartoffelsalat, Zitronenspalten und Petersilie servieren.`,
  },
];

export default REZEPTE;
