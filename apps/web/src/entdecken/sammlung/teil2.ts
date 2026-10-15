import type { SammlungsRezept } from "./typ";

/** Teil 2: Fleisch, Geflügel und Fisch mit Beilage. */
const REZEPTE: SammlungsRezept[] = [
  {
    id: "haehnchen-curry-reis",
    titel: "Hähnchen-Curry mit Reis",
    dauer: 35,
    schlagwoerter: ["geflügel", "reis", "asiatisch", "kinder"],
    saison: [],
    zutaten: `400 g Hähnchenbrust
1 Zwiebel
1 Zehe Knoblauch
1 Stück Ingwer, daumengroß
1 Paprika, rot
1 Dose Kokosmilch
180 g Reis
2 EL Öl
(1 Limette)`,
    gewuerze: `2 TL Currypulver
Salz
Pfeffer
(1 TL Kurkuma)`,
    schritte: `Reis nach Packungsangabe kochen.
Hähnchen in mundgerechte Stücke, Zwiebel und Paprika in Streifen schneiden, Knoblauch und Ingwer fein hacken.
Hähnchen im Öl rundum anbraten, salzen und herausnehmen.
Zwiebel, Paprika, Knoblauch und Ingwer im selben Topf 3 Minuten braten, Currypulver kurz mitrösten.
Kokosmilch angießen und 5 Minuten köcheln lassen.
Hähnchen zurück in die Soße geben, 5 Minuten ziehen lassen und abschmecken.
Mit Reis anrichten, nach Wunsch mit Limettensaft beträufeln.`,
  },
  {
    id: "zuercher-geschnetzeltes-roesti",
    titel: "Geschnetzeltes Zürcher Art mit Rösti",
    dauer: 50,
    schlagwoerter: ["fleisch", "kartoffeln", "klassiker", "pfanne"],
    saison: [],
    zutaten: `400 g Kalbfleisch, in feinen Streifen
250 g Champignons
1 Zwiebel
150 ml Sahne
100 ml Brühe
(50 ml Weißwein)
700 g Kartoffeln, festkochend
20 g Butter
4 EL Öl`,
    gewuerze: `Salz
Pfeffer
Muskat
(Petersilie)`,
    schritte: `Kartoffeln schälen, grob raspeln, kräftig ausdrücken und mit Salz und Muskat würzen.
Kartoffelmasse in einer Pfanne in 3 EL Öl flach drücken und von jeder Seite 8–10 Minuten goldbraun braten.
Champignons in Scheiben schneiden, Zwiebel fein würfeln.
Fleisch im restlichen Öl in einer zweiten Pfanne portionsweise scharf anbraten und herausnehmen.
Zwiebel und Champignons in der Butter anbraten, mit Wein und Brühe ablöschen.
Sahne zugeben, sämig einkochen und abschmecken.
Fleisch nur noch kurz in der Soße erwärmen und mit der Rösti servieren.`,
  },
  {
    id: "frikadellen-kartoffelpueree",
    titel: "Frikadellen mit Kartoffelpüree",
    dauer: 45,
    schlagwoerter: ["fleisch", "kartoffeln", "kinder", "klassiker"],
    saison: [],
    zutaten: `400 g Hackfleisch, gemischt
1 Zwiebel
1 Ei
1 Brötchen, vom Vortag
800 g Kartoffeln, mehligkochend
200 ml Milch
30 g Butter
2 EL Öl`,
    gewuerze: `Salz
Pfeffer
1 TL Senf
1 TL Paprikapulver, edelsüß
Muskat`,
    schritte: `Kartoffeln schälen, würfeln und in Salzwasser etwa 20 Minuten weich kochen.
Brötchen in Wasser einweichen und gut ausdrücken, Zwiebel fein würfeln.
Hackfleisch mit Brötchen, Zwiebel, Ei, Senf, Salz, Pfeffer und Paprikapulver verkneten.
Aus der Masse 6 flache Frikadellen formen und im Öl bei mittlerer Hitze von jeder Seite 5–6 Minuten braten.
Milch mit Butter erwärmen, Kartoffeln abgießen und mit der Milch zu Püree stampfen.
Püree mit Salz und Muskat abschmecken und mit den Frikadellen servieren.`,
  },
  {
    id: "schnitzel-bratkartoffeln",
    titel: "Schnitzel mit Bratkartoffeln",
    dauer: 50,
    schlagwoerter: ["fleisch", "kartoffeln", "kinder", "klassiker"],
    saison: [],
    zutaten: `3 Schnitzel, vom Schwein
3 EL Mehl
2 Eier
80 g Semmelbrösel
800 g Kartoffeln, festkochend
1 Zwiebel
6 EL Öl
(1 Zitrone)`,
    gewuerze: `Salz
Pfeffer
Paprikapulver`,
    schritte: `Kartoffeln mit Schale etwa 20 Minuten kochen, abgießen, abkühlen lassen, pellen und in Scheiben schneiden.
Kartoffelscheiben in 3 EL Öl knusprig braten, Zwiebel in Würfeln dazugeben, mit Salz, Pfeffer und Paprikapulver würzen.
Schnitzel flach klopfen, salzen und pfeffern.
Schnitzel nacheinander in Mehl, verquirltem Ei und Semmelbröseln wenden.
Schnitzel im restlichen heißen Öl von jeder Seite 3–4 Minuten goldbraun braten.
Mit den Bratkartoffeln und nach Wunsch Zitronenspalten servieren.`,
  },
  {
    id: "rindergulasch-salzkartoffeln",
    titel: "Rindergulasch mit Salzkartoffeln",
    dauer: 150,
    schlagwoerter: ["fleisch", "kartoffeln", "deftig", "klassiker", "mealprep"],
    saison: [1, 2, 10, 11, 12],
    zutaten: `600 g Rindergulasch
3 Zwiebeln
1 Paprika, rot
2 EL Tomatenmark
400 ml Brühe
(100 ml Rotwein)
700 g Kartoffeln
2 EL Öl`,
    gewuerze: `2 EL Paprikapulver, edelsüß
1 TL Paprikapulver, rosenscharf
1 TL Kümmel
1 TL Majoran
Salz
Pfeffer`,
    schritte: `Zwiebeln grob würfeln, Paprika in Stücke schneiden.
Fleisch im Öl in einem Schmortopf portionsweise kräftig anbraten.
Zwiebeln dazugeben und mitbraten, bis sie Farbe nehmen.
Tomatenmark und Paprikapulver unterrühren, kurz rösten und mit Rotwein und Brühe ablöschen.
Kümmel und Majoran zugeben, zugedeckt bei kleiner Hitze etwa 1,5 Stunden schmoren.
Paprika zugeben und weitere 30 Minuten schmoren, bis das Fleisch zart ist.
Kartoffeln schälen, in Salzwasser 20 Minuten kochen und zum Gulasch servieren.`,
  },
  {
    id: "chili-con-carne",
    titel: "Chili con Carne mit Reis",
    dauer: 45,
    schlagwoerter: ["fleisch", "mexikanisch", "reis", "mealprep"],
    saison: [],
    zutaten: `400 g Hackfleisch, vom Rind
1 Zwiebel
2 Zehen Knoblauch
1 Paprika, rot
1 Dose Tomaten, gehackt
1 Dose Kidneybohnen
1 Dose Mais
2 EL Tomatenmark
160 g Reis
2 EL Öl
(1 Becher Schmand)`,
    gewuerze: `1 TL Kreuzkümmel
1 TL Paprikapulver
½ TL Chiliflocken
1 TL Oregano
Salz
Pfeffer`,
    schritte: `Zwiebel, Knoblauch und Paprika würfeln.
Hackfleisch im Öl krümelig braten, Zwiebel und Knoblauch mitbraten.
Tomatenmark und Gewürze unterrühren und kurz anrösten.
Tomaten und Paprika zugeben und 20 Minuten offen köcheln lassen.
Bohnen und Mais abspülen, untermischen und 5 Minuten mitkochen.
Reis nach Packungsangabe garen und das Chili mit Reis und nach Wunsch Schmand servieren.`,
  },
  {
    id: "haehnchenschenkel-ofenkartoffeln",
    titel: "Hähnchenschenkel mit Ofenkartoffeln",
    dauer: 60,
    schlagwoerter: ["geflügel", "ofen", "kartoffeln", "kinder"],
    saison: [],
    zutaten: `4 Hähnchenschenkel
800 g Kartoffeln, festkochend
1 Paprika, gelb
1 Zwiebel, rot
4 EL Öl`,
    gewuerze: `2 TL Paprikapulver, edelsüß
1 TL Rosmarin
Salz
Pfeffer
(Knoblauchpulver)`,
    schritte: `Backofen auf 200 °C Umluft vorheizen.
Hähnchenschenkel trocken tupfen und mit 2 EL Öl, Paprikapulver, Salz und Pfeffer einreiben.
Kartoffeln gründlich waschen und mit Schale in Spalten schneiden, Paprika und Zwiebel grob schneiden.
Gemüse mit restlichem Öl, Rosmarin und Salz mischen und auf einem Blech verteilen.
Hähnchenschenkel darauflegen und 40–45 Minuten backen, bis die Haut knusprig ist und kein rosa Saft mehr austritt.`,
  },
  {
    id: "lachs-ofengemuese",
    titel: "Lachs mit Ofengemüse",
    dauer: 40,
    schlagwoerter: ["fisch", "ofen", "leicht", "mediterran"],
    saison: [],
    zutaten: `350 g Lachsfilet, ohne Haut
600 g Kartoffeln, festkochend
1 Zucchini
1 Paprika, rot
200 g Cherrytomaten
1 Zitrone
3 EL Olivenöl`,
    gewuerze: `Salz
Pfeffer
1 TL Thymian
(Dill)`,
    schritte: `Backofen auf 200 °C Umluft vorheizen.
Kartoffeln in Spalten schneiden, mit 2 EL Öl, Thymian und Salz mischen und 15 Minuten auf dem Blech vorbacken.
Zucchini und Paprika in grobe Stücke schneiden, mit den Tomaten und restlichem Öl zu den Kartoffeln geben.
Lachs in zwei Stücke teilen, salzen, pfeffern und auf das Gemüse legen.
Zitrone in Scheiben auf den Lachs legen und alles weitere 15 Minuten backen.
Nach Wunsch mit frischem Dill bestreuen.`,
  },
  {
    id: "seelachs-senfsosse",
    titel: "Fischfilet in Senfsoße mit Kartoffeln",
    dauer: 30,
    schlagwoerter: ["fisch", "kartoffeln", "kinder", "klassiker"],
    saison: [],
    zutaten: `400 g Seelachs, als Filet
700 g Kartoffeln
20 g Butter
1 EL Mehl
200 ml Brühe
100 ml Sahne
2 EL Senf, mittelscharf
1 EL Öl
(½ Zitrone)`,
    gewuerze: `Salz
Pfeffer
1 TL Dill
Prise Zucker`,
    schritte: `Kartoffeln schälen, vierteln und in Salzwasser etwa 20 Minuten kochen.
Butter in einem Topf schmelzen, Mehl einrühren und kurz anschwitzen.
Brühe und Sahne nach und nach einrühren, aufkochen und 3 Minuten köcheln lassen.
Senf, Dill und Zucker unterrühren, mit Salz und Pfeffer abschmecken.
Fisch in Stücke schneiden, salzen, mit Zitronensaft beträufeln und im Öl von jeder Seite 2–3 Minuten braten.
Fisch mit Kartoffeln und Senfsoße anrichten.`,
  },
  {
    id: "kabeljau-tomaten-kartoffeln",
    titel: "Kabeljau auf Tomaten mit Kartoffeln",
    dauer: 45,
    schlagwoerter: ["fisch", "ofen", "kartoffeln", "mediterran"],
    saison: [],
    zutaten: `400 g Kabeljau, als Filet
700 g Kartoffeln, festkochend
300 g Cherrytomaten
1 Zwiebel, rot
1 Zehe Knoblauch
(2 EL Oliven, schwarz)
1 Zitrone
3 EL Olivenöl`,
    gewuerze: `Salz
Pfeffer
1 TL Oregano
(Petersilie)`,
    schritte: `Backofen auf 200 °C Umluft vorheizen.
Kartoffeln in dünne Scheiben schneiden, mit 2 EL Öl und Salz mischen und in einer Auflaufform 20 Minuten backen.
Tomaten halbieren, Zwiebel in Ringe schneiden, Knoblauch fein hacken.
Tomaten, Zwiebel, Knoblauch und Oliven mit Oregano und restlichem Öl auf die Kartoffeln geben.
Kabeljau salzen, pfeffern, mit Zitronensaft beträufeln und obenauf legen.
Weitere 15 Minuten backen, bis der Fisch gerade durch ist, und mit Petersilie bestreuen.`,
  },
  {
    id: "garnelenpfanne-knoblauch-reis",
    titel: "Knoblauch-Garnelenpfanne mit Reis",
    dauer: 25,
    schlagwoerter: ["fisch", "pfanne", "reis", "mediterran"],
    saison: [],
    zutaten: `300 g Garnelen, geschält
160 g Reis
3 Zehen Knoblauch
1 Zucchini
200 g Cherrytomaten
1 Zitrone
3 EL Olivenöl
(1 Bund Petersilie)`,
    gewuerze: `Salz
Pfeffer
½ TL Chiliflocken`,
    schritte: `Reis nach Packungsangabe kochen.
Garnelen abspülen und trocken tupfen, Knoblauch in feine Scheiben schneiden.
Zucchini würfeln, Tomaten halbieren.
Zucchini im Öl 4 Minuten braten, Garnelen und Knoblauch zugeben und 3 Minuten braten, bis die Garnelen rosa sind.
Tomaten kurz mitschwenken, mit Zitronensaft, Chili, Salz und Pfeffer abschmecken.
Mit gehackter Petersilie bestreuen und mit Reis servieren.`,
  },
  {
    id: "putengeschnetzeltes-reis",
    titel: "Putengeschnetzeltes mit Reis",
    dauer: 30,
    schlagwoerter: ["geflügel", "pfanne", "reis", "kinder"],
    saison: [],
    zutaten: `400 g Putenbrust
250 g Champignons
1 Zwiebel
200 ml Sahne
100 ml Brühe
160 g Reis
2 EL Öl`,
    gewuerze: `Salz
Pfeffer
1 TL Paprikapulver, edelsüß
(Petersilie)`,
    schritte: `Reis nach Packungsangabe kochen.
Putenbrust in Streifen, Champignons in Scheiben schneiden, Zwiebel würfeln.
Fleisch im Öl rundum anbraten, mit Salz, Pfeffer und Paprikapulver würzen und herausnehmen.
Zwiebel und Champignons in der Pfanne 5 Minuten braten.
Mit Brühe und Sahne ablöschen und 3 Minuten einkochen lassen.
Fleisch zurück in die Soße geben, kurz erhitzen und mit Reis servieren.`,
  },
  {
    id: "koenigsberger-klopse",
    titel: "Königsberger Klopse mit Kartoffeln",
    dauer: 60,
    schlagwoerter: ["fleisch", "kartoffeln", "klassiker"],
    saison: [],
    zutaten: `400 g Hackfleisch, gemischt
1 Brötchen, vom Vortag
1 Zwiebel
1 Ei
700 g Kartoffeln
750 ml Brühe
30 g Butter
2 EL Mehl
100 ml Sahne
2 EL Kapern
½ Zitrone`,
    gewuerze: `Salz
Pfeffer
1 TL Senf
1 Lorbeerblatt
Prise Zucker`,
    schritte: `Brötchen einweichen und ausdrücken, Zwiebel fein würfeln.
Hackfleisch mit Brötchen, Zwiebel, Ei, Senf, Salz und Pfeffer verkneten und 8 Klopse formen.
Brühe mit Lorbeer aufkochen, Klopse hineinlegen und bei kleiner Hitze 15 Minuten gar ziehen lassen.
Kartoffeln schälen und in Salzwasser etwa 20 Minuten kochen.
Klopse herausnehmen, Butter schmelzen, Mehl einrühren und mit 500 ml der Brühe glatt rühren.
Sahne und Kapern zugeben, 5 Minuten köcheln und mit Zitronensaft, Zucker und Salz abschmecken.
Klopse in der Soße erwärmen und mit den Kartoffeln servieren.`,
  },
  {
    id: "haehnchen-fajitas",
    titel: "Hähnchen-Fajitas",
    dauer: 30,
    schlagwoerter: ["geflügel", "mexikanisch", "pfanne", "kinder"],
    saison: [],
    zutaten: `400 g Hähnchenbrust
2 Paprika, rot und gelb
1 Zwiebel
6 Tortillas, klein
1 Becher Schmand
1 Avocado
1 Limette
2 EL Öl
(100 g Käse, gerieben)`,
    gewuerze: `1 TL Paprikapulver, geräuchert
1 TL Kreuzkümmel
½ TL Chilipulver
Salz
Pfeffer`,
    schritte: `Hähnchen, Paprika und Zwiebel in Streifen schneiden.
Hähnchen mit 1 EL Öl, den Gewürzen und etwas Limettensaft mischen.
Hähnchen in einer heißen Pfanne 5 Minuten scharf anbraten und herausnehmen.
Paprika und Zwiebel im restlichen Öl 4 Minuten bissfest braten, Hähnchen wieder untermischen.
Avocado zerdrücken und mit Limettensaft und Salz abschmecken.
Tortillas kurz in einer trockenen Pfanne erwärmen und mit Füllung, Schmand, Avocado und Käse belegen.`,
  },
  {
    id: "teriyaki-lachs-reis",
    titel: "Teriyaki-Lachs mit Reis und Brokkoli",
    dauer: 30,
    schlagwoerter: ["fisch", "asiatisch", "reis", "leicht"],
    saison: [],
    zutaten: `350 g Lachsfilet, ohne Haut
160 g Reis
1 Brokkoli
4 EL Sojasauce
2 EL Honig
1 Zehe Knoblauch
1 Stück Ingwer, daumengroß
1 TL Speisestärke
1 EL Öl
(2 Frühlingszwiebeln)`,
    gewuerze: `(1 EL Sesam)
Pfeffer`,
    schritte: `Reis nach Packungsangabe kochen.
Brokkoli in Röschen teilen und in den letzten 5 Minuten über dem Reis dämpfen oder in Salzwasser garen.
Sojasauce, Honig, geriebenen Knoblauch und Ingwer mit Stärke und 3 EL Wasser verrühren.
Lachs in Würfel schneiden und im Öl von allen Seiten 3–4 Minuten braten.
Soße angießen und unter Schwenken einkochen, bis der Lachs glänzend überzogen ist.
Mit Reis und Brokkoli anrichten, mit Sesam und Frühlingszwiebelringen bestreuen.`,
  },
  {
    id: "schweinefilet-champignonrahm",
    titel: "Schweinefilet in Champignonrahm mit Bandnudeln",
    dauer: 35,
    schlagwoerter: ["fleisch", "pfanne", "klassiker"],
    saison: [],
    zutaten: `450 g Schweinefilet
300 g Champignons
1 Zwiebel
200 ml Sahne
100 ml Brühe
250 g Bandnudeln
1 EL Butter
1 EL Öl`,
    gewuerze: `Salz
Pfeffer
1 TL Thymian
(Petersilie)`,
    schritte: `Schweinefilet in 2 cm dicke Medaillons schneiden und leicht flach drücken.
Medaillons im Öl von jeder Seite 2–3 Minuten braten, salzen, pfeffern und warm stellen.
Bandnudeln nach Packungsangabe kochen.
Zwiebel würfeln und Champignons in Scheiben in der Butter anbraten.
Mit Brühe und Sahne ablöschen, Thymian zugeben und sämig einkochen lassen.
Medaillons mit ihrem Saft in die Soße legen, 2 Minuten ziehen lassen und mit den Nudeln servieren.`,
  },
  {
    id: "rinderrouladen-rotkohl",
    titel: "Rinderrouladen mit Rotkohl und Kartoffeln",
    dauer: 150,
    schlagwoerter: ["fleisch", "kartoffeln", "deftig", "klassiker"],
    saison: [1, 2, 10, 11, 12],
    zutaten: `3 Scheiben Rouladenfleisch, vom Rind
6 Scheiben Speck, durchwachsen
2 Gewürzgurken
2 Zwiebeln
1 Möhre
3 TL Senf
1 EL Tomatenmark
(150 ml Rotwein)
400 ml Brühe
1 Glas Rotkohl
700 g Kartoffeln
2 EL Öl`,
    gewuerze: `Salz
Pfeffer
1 Lorbeerblatt
2 Wacholderbeeren`,
    schritte: `Rouladen flach auslegen, salzen, pfeffern und mit Senf bestreichen.
Mit Speck, Gurkenstreifen und einer halben Zwiebel in Streifen belegen, aufrollen und mit Küchengarn oder Rouladennadeln fixieren.
Rouladen im Öl im Schmortopf rundum kräftig anbraten und herausnehmen.
Restliche Zwiebel und Möhre gewürfelt anbraten, Tomatenmark kurz mitrösten und mit Rotwein und Brühe ablöschen.
Rouladen mit Lorbeer und Wacholder zurück in den Topf legen und zugedeckt etwa 1,5 Stunden schmoren.
Kartoffeln kochen und Rotkohl erwärmen.
Soße nach Wunsch pürieren, abschmecken und alles zusammen servieren.`,
  },
  {
    id: "gyros-pfanne-tzatziki",
    titel: "Gyros-Pfanne mit Tzatziki und Fladenbrot",
    dauer: 30,
    schlagwoerter: ["fleisch", "pfanne", "mediterran"],
    saison: [],
    zutaten: `450 g Schweinefleisch, aus dem Nacken
2 Zwiebeln
1 Paprika, grün
250 g Joghurt, griechisch
½ Gurke
2 Zehen Knoblauch
1 Fladenbrot
3 EL Öl`,
    gewuerze: `2 TL Gyrosgewürz
1 TL Oregano
Salz
Pfeffer`,
    schritte: `Fleisch in dünne Streifen schneiden und mit 1 EL Öl, Gyrosgewürz und Oregano mischen.
Gurke grob raspeln, gut ausdrücken und mit Joghurt, gepresstem Knoblauch und Salz zu Tzatziki verrühren.
Zwiebeln in Ringe, Paprika in Streifen schneiden.
Fleisch im restlichen Öl in einer großen Pfanne portionsweise scharf anbraten.
Zwiebeln und Paprika zugeben und 4 Minuten mitbraten, mit Salz und Pfeffer abschmecken.
Fladenbrot kurz im Ofen aufbacken und mit Gyros und Tzatziki servieren.`,
  },
  {
    id: "haehnchen-suess-sauer",
    titel: "Hähnchen süß-sauer mit Reis",
    dauer: 35,
    schlagwoerter: ["geflügel", "asiatisch", "reis", "kinder"],
    saison: [],
    zutaten: `400 g Hähnchenbrust
1 Paprika, rot
1 Möhre
1 Zwiebel
1 Dose Ananas, in Stücken
3 EL Ketchup
2 EL Essig, hell
2 EL Sojasauce
1 EL Speisestärke
160 g Reis
2 EL Öl`,
    gewuerze: `1 EL Zucker
Salz
Pfeffer`,
    schritte: `Reis nach Packungsangabe kochen.
Hähnchen würfeln und mit 1 TL Stärke und 1 EL Sojasauce mischen.
Paprika und Zwiebel in Stücke, Möhre in dünne Scheiben schneiden.
150 ml Ananassaft mit Ketchup, Essig, restlicher Sojasauce, Zucker und Stärke verrühren.
Hähnchen im Öl goldbraun braten, Gemüse zugeben und 4 Minuten mitbraten.
Ananas und Soße zugeben, aufkochen lassen, bis sie bindet, und mit Reis servieren.`,
  },
  {
    id: "thunfisch-bowl",
    titel: "Thunfisch-Bowl mit Reis und Gemüse",
    dauer: 25,
    schlagwoerter: ["fisch", "reis", "leicht", "asiatisch"],
    saison: [],
    zutaten: `160 g Reis
2 Dosen Thunfisch, im eigenen Saft
1 Gurke
1 Avocado
1 Möhre
1 Dose Mais
2 Frühlingszwiebeln
3 EL Mayonnaise
2 EL Sojasauce
1 EL Essig, hell`,
    gewuerze: `(1 EL Sesam)
(Chiliflocken)
Salz`,
    schritte: `Reis nach Packungsangabe kochen, mit Essig und einer Prise Salz würzen und etwas abkühlen lassen.
Gurke und Avocado in Würfel schneiden, Möhre raspeln, Frühlingszwiebeln in Ringe schneiden.
Thunfisch abtropfen lassen und zerpflücken, Mais abspülen.
Mayonnaise mit 1 EL Sojasauce glatt rühren.
Reis in Schalen verteilen, Thunfisch und Gemüse darauf anrichten.
Mit Soße, restlicher Sojasauce und nach Wunsch Sesam und Chili beträufeln.`,
  },
  {
    id: "forelle-muellerin",
    titel: "Forelle Müllerin mit Petersilienkartoffeln",
    dauer: 40,
    schlagwoerter: ["fisch", "kartoffeln", "klassiker"],
    saison: [],
    zutaten: `2 Forellen, küchenfertig
700 g Kartoffeln, festkochend
3 EL Mehl
60 g Butter
1 EL Öl
1 Zitrone
1 Bund Petersilie`,
    gewuerze: `Salz
Pfeffer`,
    schritte: `Kartoffeln schälen und in Salzwasser etwa 20 Minuten kochen.
Forellen waschen, trocken tupfen, innen und außen salzen und pfeffern und mit Zitronensaft beträufeln.
Forellen in Mehl wenden und überschüssiges Mehl abklopfen.
Öl und 20 g Butter erhitzen, Forellen darin von jeder Seite 5–6 Minuten goldbraun braten.
Restliche Butter in einem kleinen Topf aufschäumen und gehackte Petersilie zugeben.
Kartoffeln in einem Teil der Petersilienbutter schwenken, Fisch mit dem Rest übergießen und mit Zitronenspalten servieren.`,
  },
  {
    id: "matjes-pellkartoffeln",
    titel: "Matjes mit Pellkartoffeln",
    dauer: 30,
    schlagwoerter: ["fisch", "kartoffeln", "klassiker", "leicht"],
    saison: [6, 7],
    zutaten: `6 Stück Matjes, als Filet
800 g Kartoffeln, festkochend
200 g Schmand
150 g Joghurt
1 Apfel, säuerlich
1 Zwiebel, rot
1 Gurke, klein
1 Bund Schnittlauch`,
    gewuerze: `Salz
Pfeffer
Prise Zucker`,
    schritte: `Kartoffeln mit Schale in Salzwasser etwa 20 Minuten kochen.
Apfel und Gurke fein würfeln, Zwiebel in feine Ringe schneiden.
Schmand und Joghurt verrühren, Apfel, Gurke und Zwiebel untermischen.
Soße mit Salz, Pfeffer und Zucker abschmecken und Schnittlauchröllchen unterheben.
Matjes trocken tupfen und mit der Soße und den Pellkartoffeln servieren.`,
  },
  {
    id: "zitronen-haehnchen-bohnen",
    titel: "Zitronen-Hähnchen mit grünen Bohnen und Reis",
    dauer: 30,
    schlagwoerter: ["geflügel", "pfanne", "reis", "leicht"],
    saison: [],
    zutaten: `400 g Hähnchenbrust
1 Zitrone, unbehandelt
2 Zehen Knoblauch
1 EL Honig
150 ml Brühe
20 g Butter
300 g Bohnen, grün
160 g Reis
1 EL Öl`,
    gewuerze: `Salz
Pfeffer
1 TL Thymian`,
    schritte: `Reis nach Packungsangabe kochen, Bohnen putzen und in Salzwasser 8 Minuten garen.
Hähnchenbrust waagerecht halbieren, salzen, pfeffern und mit Thymian würzen.
Hähnchen im Öl von jeder Seite 4–5 Minuten braten und herausnehmen.
Knoblauch fein hacken und kurz anbraten, mit Brühe, Zitronensaft, etwas Zitronenschale und Honig ablöschen.
Soße 3 Minuten einkochen lassen und die Butter einrühren.
Hähnchen in der Soße wenden und mit Bohnen und Reis servieren.`,
  },
  {
    id: "hackbaellchen-tomatensosse-couscous",
    titel: "Hackbällchen in Tomatensoße mit Couscous",
    dauer: 40,
    schlagwoerter: ["fleisch", "orientalisch", "kinder", "mealprep"],
    saison: [],
    zutaten: `400 g Hackfleisch, vom Rind
1 Zwiebel
1 Ei
3 EL Semmelbrösel
1 Zehe Knoblauch
500 g Passata
180 g Couscous
250 ml Brühe
2 EL Öl
(1 Bund Petersilie)`,
    gewuerze: `1 TL Kreuzkümmel
1 TL Paprikapulver, edelsüß
½ TL Zimt
Salz
Pfeffer`,
    schritte: `Zwiebel und Knoblauch fein würfeln.
Hackfleisch mit der Hälfte der Zwiebel, Ei, Semmelbröseln, Kreuzkümmel, Paprikapulver, Salz und Pfeffer verkneten und walnussgroße Bällchen formen.
Bällchen im Öl rundum anbraten und herausnehmen.
Restliche Zwiebel und Knoblauch im Bratfett andünsten, Passata und Zimt zugeben.
Bällchen in die Soße legen und zugedeckt 15 Minuten köcheln lassen.
Couscous mit heißer Brühe übergießen, 5 Minuten quellen lassen und auflockern.
Mit Couscous anrichten und mit Petersilie bestreuen.`,
  },
  {
    id: "gefuellte-paprika-reis",
    titel: "Gefüllte Paprika mit Reis",
    dauer: 65,
    schlagwoerter: ["fleisch", "ofen", "reis", "klassiker"],
    saison: [],
    zutaten: `4 Paprika
300 g Hackfleisch, gemischt
1 Zwiebel
1 Ei
220 g Reis
500 g Passata
100 ml Brühe
1 EL Öl
(100 g Feta)`,
    gewuerze: `1 TL Paprikapulver, edelsüß
1 TL Oregano
Salz
Pfeffer`,
    schritte: `Backofen auf 180 °C Umluft vorheizen, 60 g Reis 10 Minuten vorkochen, den übrigen Reis als Beilage garen.
Zwiebel würfeln und im Öl glasig dünsten.
Hackfleisch mit vorgekochtem Reis, Zwiebel, Ei, Paprikapulver, Salz und Pfeffer vermengen.
Paprika oben aufschneiden, entkernen und mit der Masse füllen, Deckel wieder aufsetzen.
Passata mit Brühe, Oregano, Salz und Pfeffer in eine Auflaufform geben und die Paprika hineinsetzen.
Etwa 45 Minuten backen, nach Wunsch in den letzten 10 Minuten Feta darüberbröseln, und mit Reis servieren.`,
  },
];

export default REZEPTE;
