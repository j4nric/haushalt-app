import type { SammlungsRezept } from "./typ";

/** Teil 4: Schnelle Feierabendküche, Salate, Kinderklassiker und süße Hauptgerichte. */
const REZEPTE: SammlungsRezept[] = [
  {
    id: "pfannkuchen",
    titel: "Pfannkuchen",
    dauer: 25,
    schlagwoerter: ["vegetarisch", "süß", "kinder", "klassiker"],
    saison: [],
    zutaten: `250 g Mehl
3 Eier
450 ml Milch
1 EL Zucker
3 EL Butter
(1 Glas Apfelmus)`,
    gewuerze: `Salz
(Zimt)
(Zucker)`,
    schritte: `Mehl, Eier, Milch, Zucker und eine Prise Salz zu einem glatten Teig verrühren.
Teig 10 Minuten quellen lassen.
Etwas Butter in einer beschichteten Pfanne erhitzen.
Eine kleine Kelle Teig hineingeben und durch Schwenken dünn verteilen.
Pfannkuchen 2–3 Minuten goldbraun backen, wenden und die zweite Seite 1–2 Minuten backen.
Mit Zimt und Zucker oder Apfelmus servieren.`,
  },
  {
    id: "kaiserschmarrn",
    titel: "Kaiserschmarrn",
    dauer: 30,
    schlagwoerter: ["vegetarisch", "süß", "klassiker", "pfanne"],
    saison: [],
    zutaten: `4 Eier
200 g Mehl
350 ml Milch
2 EL Zucker
1 Pck. Vanillezucker
40 g Rosinen
3 EL Butter
2 EL Puderzucker
(1 Glas Apfelmus)`,
    gewuerze: `Salz`,
    schritte: `Eier trennen, Eiweiß mit einer Prise Salz steif schlagen.
Eigelb, Mehl, Milch, Zucker und Vanillezucker glatt rühren, Eischnee unterheben.
Butter in einer großen Pfanne schmelzen, Teig hineingießen und Rosinen darüberstreuen.
Bei mittlerer Hitze 5–6 Minuten stocken lassen, bis die Unterseite gebräunt ist.
Teig vierteln, wenden, 3–4 Minuten backen und mit zwei Pfannenwendern in Stücke reißen.
Mit etwas Zucker 1–2 Minuten karamellisieren lassen.
Mit Puderzucker bestäuben und mit Apfelmus servieren.`,
  },
  {
    id: "milchreis-mit-apfelmus",
    titel: "Milchreis mit Apfelmus",
    dauer: 40,
    schlagwoerter: ["vegetarisch", "süß", "kinder", "klassiker"],
    saison: [],
    zutaten: `250 g Milchreis
1 l Milch
2 EL Zucker
1 Pck. Vanillezucker
1 EL Butter
1 Glas Apfelmus`,
    gewuerze: `Salz
Zimt
(Zucker)`,
    schritte: `Milch mit Zucker, Vanillezucker, Butter und einer Prise Salz aufkochen.
Milchreis einrühren und einmal aufkochen lassen.
Bei kleinster Hitze mit Deckel etwa 30 Minuten quellen lassen, dabei gelegentlich umrühren.
Milchreis 5 Minuten ruhen lassen, bis er schön cremig ist.
Mit Apfelmus sowie Zimt und Zucker servieren.`,
  },
  {
    id: "arme-ritter",
    titel: "Arme Ritter",
    dauer: 20,
    schlagwoerter: ["vegetarisch", "süß", "kinder", "pfanne"],
    saison: [],
    zutaten: `8 Scheiben Toastbrot, vom Vortag
3 Eier
250 ml Milch
1 EL Zucker
1 Pck. Vanillezucker
3 EL Butter
(1 Glas Apfelmus)`,
    gewuerze: `Zimt
Zucker`,
    schritte: `Eier, Milch, Zucker und Vanillezucker in einem tiefen Teller verquirlen.
Toastscheiben von jeder Seite 30 Sekunden in der Eiermilch einweichen.
Butter in einer Pfanne erhitzen.
Brotscheiben darin von jeder Seite 2–3 Minuten goldbraun braten.
Mit Zimt und Zucker bestreuen und warm servieren, gern mit Apfelmus.`,
  },
  {
    id: "kartoffelpuffer-mit-apfelmus",
    titel: "Kartoffelpuffer mit Apfelmus",
    dauer: 40,
    schlagwoerter: ["vegetarisch", "kartoffeln", "kinder", "klassiker"],
    saison: [10, 11, 12, 1, 2],
    zutaten: `1 kg Kartoffeln, mehligkochend
1 Zwiebel
2 Eier
3 EL Mehl
6 EL Rapsöl
1 Glas Apfelmus`,
    gewuerze: `Salz
Pfeffer
(Muskat)`,
    schritte: `Kartoffeln schälen und mit der Zwiebel fein reiben.
Masse in einem Sieb gut ausdrücken.
Mit Eiern und Mehl vermengen, mit Salz, Pfeffer und Muskat würzen.
Öl in einer großen Pfanne erhitzen.
Je einen Esslöffel Teig hineingeben, flach drücken und von jeder Seite 3–4 Minuten knusprig braten.
Puffer auf Küchenpapier abtropfen lassen und mit Apfelmus servieren.`,
  },
  {
    id: "fischstaebchen-mit-kartoffelsalat",
    titel: "Fischstäbchen mit Kartoffelsalat",
    dauer: 40,
    schlagwoerter: ["fisch", "kinder", "kartoffeln", "klassiker"],
    saison: [],
    zutaten: `800 g Kartoffeln, festkochend
15 Fischstäbchen
1 Zwiebel
1 Gurke
150 ml Gemüsebrühe
3 EL Essig
3 EL Rapsöl
2 EL Rapsöl, zum Braten
1 Bund Schnittlauch
(1 Zitrone)`,
    gewuerze: `Salz
Pfeffer
Zucker
(Senf)`,
    schritte: `Kartoffeln in der Schale etwa 20 Minuten garen, abgießen, pellen und in Scheiben schneiden.
Zwiebel fein würfeln und mit der heißen Brühe, Essig, Öl, Salz, Pfeffer und einer Prise Zucker verrühren.
Marinade über die warmen Kartoffeln gießen und vorsichtig mischen.
Gurke in dünne Scheiben hobeln, Schnittlauch schneiden und beides unterheben.
Fischstäbchen im Öl von jeder Seite 3–4 Minuten goldbraun braten.
Mit Kartoffelsalat und Zitronenspalten servieren.`,
  },
  {
    id: "ruehrei-mit-bratkartoffeln",
    titel: "Rührei mit Bratkartoffeln",
    dauer: 30,
    schlagwoerter: ["vegetarisch", "kartoffeln", "pfanne", "klassiker"],
    saison: [],
    zutaten: `800 g Kartoffeln, festkochend, vom Vortag gekocht
1 Zwiebel
6 Eier
50 ml Milch
3 EL Rapsöl
1 EL Butter
1 Bund Schnittlauch`,
    gewuerze: `Salz
Pfeffer
(Paprikapulver)`,
    schritte: `Gekochte Kartoffeln pellen und in Scheiben schneiden, Zwiebel würfeln.
Öl in einer großen Pfanne erhitzen und die Kartoffeln darin rundum 10–12 Minuten knusprig braten.
Zwiebel zugeben, 2 Minuten mitbraten und mit Salz, Pfeffer und Paprika würzen.
Eier mit Milch, Salz und Pfeffer verquirlen.
Butter in einer zweiten Pfanne schmelzen, Eier hineingeben und bei kleiner Hitze 3–4 Minuten langsam stocken lassen.
Schnittlauch schneiden, über das Rührei streuen und mit den Bratkartoffeln servieren.`,
  },
  {
    id: "wraps-mit-haehnchen-und-gemuese",
    titel: "Wraps mit Hähnchen und Gemüse",
    dauer: 25,
    schlagwoerter: ["geflügel", "kinder", "mexikanisch", "pfanne"],
    saison: [],
    zutaten: `6 Tortilla-Wraps
400 g Hähnchenbrust
1 Paprika, rot
1 Dose Mais
1 Eisbergsalat, klein
2 Tomaten
150 g Joghurt
100 g Käse, gerieben
2 EL Rapsöl`,
    gewuerze: `Salz
Pfeffer
Paprikapulver
(Knoblauchpulver)`,
    schritte: `Hähnchenbrust in Streifen schneiden und mit Salz, Pfeffer und Paprikapulver würzen.
Fleisch im Öl rundum 6–8 Minuten braten, bis es durch ist.
Paprika in Streifen schneiden, Tomaten würfeln, Salat in Streifen schneiden, Mais abtropfen lassen.
Joghurt mit Salz und etwas Knoblauch verrühren.
Wraps in einer trockenen Pfanne je 30 Sekunden erwärmen.
Wraps mit Joghurt bestreichen, mit Fleisch, Gemüse und Käse belegen und einrollen.`,
  },
  {
    id: "quesadillas",
    titel: "Quesadillas",
    dauer: 20,
    schlagwoerter: ["vegetarisch", "mexikanisch", "pfanne", "kinder"],
    saison: [],
    zutaten: `6 Tortilla-Wraps
200 g Käse, gerieben
1 Dose Kidneybohnen
1 Dose Mais
1 Paprika
2 Frühlingszwiebeln
150 g Schmand
1 EL Rapsöl`,
    gewuerze: `Salz
Pfeffer
(Kreuzkümmel)
(Chiliflocken)`,
    schritte: `Bohnen und Mais abspülen und abtropfen lassen, Paprika fein würfeln, Frühlingszwiebeln in Ringe schneiden.
Gemüse mischen und mit Salz, Pfeffer und Kreuzkümmel würzen.
Eine Hälfte jedes Wraps mit Käse und Gemüse belegen, die andere Hälfte darüberklappen.
Pfanne dünn mit Öl auspinseln und die Quesadillas von jeder Seite 2–3 Minuten knusprig backen, bis der Käse schmilzt.
In Stücke schneiden und mit Schmand servieren.`,
  },
  {
    id: "gemuese-blechpizza",
    titel: "Schnelle Gemüse-Blechpizza",
    dauer: 30,
    schlagwoerter: ["vegetarisch", "ofen", "italienisch", "kinder"],
    saison: [],
    zutaten: `1 Pck. Pizzateig, aus dem Kühlregal
200 g Passata
1 Paprika
1 Dose Mais
150 g Champignons
250 g Mozzarella
1 EL Olivenöl`,
    gewuerze: `Salz
Pfeffer
Oregano
(Basilikum)`,
    schritte: `Backofen auf 220 °C Ober-/Unterhitze vorheizen.
Pizzateig mit dem Backpapier auf ein Blech legen.
Passata mit Öl, Salz, Pfeffer und Oregano verrühren und auf dem Teig verstreichen.
Paprika in Streifen und Pilze in Scheiben schneiden, Mais abtropfen lassen, Mozzarella zerzupfen.
Pizza mit Gemüse und Mozzarella belegen.
Etwa 15 Minuten backen, bis der Rand goldbraun ist.`,
  },
  {
    id: "flammkuchen",
    titel: "Flammkuchen",
    dauer: 30,
    schlagwoerter: ["fleisch", "ofen", "klassiker"],
    saison: [],
    zutaten: `1 Pck. Flammkuchenteig, aus dem Kühlregal
200 g Crème fraîche
2 Zwiebeln
150 g Speck, gewürfelt
(1 Bund Schnittlauch)`,
    gewuerze: `Salz
Pfeffer
(Muskat)`,
    schritte: `Backofen auf 230 °C Ober-/Unterhitze vorheizen.
Teig mit dem Backpapier auf ein Blech legen.
Crème fraîche mit Salz, Pfeffer und Muskat verrühren und dünn auf dem Teig verstreichen.
Zwiebeln in feine Ringe schneiden und mit dem Speck darauf verteilen.
Etwa 12 Minuten backen, bis der Rand knusprig ist.
Mit Schnittlauch bestreuen und in Stücke schneiden.`,
  },
  {
    id: "toast-hawaii",
    titel: "Toast Hawaii",
    dauer: 20,
    schlagwoerter: ["fleisch", "ofen", "kinder", "klassiker"],
    saison: [],
    zutaten: `6 Scheiben Toastbrot
2 EL Butter
6 Scheiben Kochschinken
1 Dose Ananas, in Scheiben
6 Scheiben Käse`,
    gewuerze: `(Paprikapulver)`,
    schritte: `Backofen auf 200 °C Ober-/Unterhitze vorheizen.
Toastbrot leicht toasten und dünn mit Butter bestreichen.
Je eine Scheibe Schinken und Ananas darauflegen.
Mit Käse abdecken und auf ein Blech mit Backpapier legen.
Etwa 10 Minuten überbacken, bis der Käse zerläuft.
Nach Belieben mit etwas Paprikapulver bestreut servieren.`,
  },
  {
    id: "griechischer-salat-mit-fladenbrot",
    titel: "Griechischer Salat mit Fladenbrot",
    dauer: 20,
    schlagwoerter: ["vegetarisch", "salat", "mediterran", "leicht"],
    saison: [6, 7, 8, 9],
    zutaten: `4 Tomaten
1 Gurke
1 Paprika, grün
1 Zwiebel, rot
200 g Feta
80 g Oliven, schwarz
4 EL Olivenöl
2 EL Essig
1 Fladenbrot`,
    gewuerze: `Salz
Pfeffer
Oregano`,
    schritte: `Tomaten, Gurke und Paprika in mundgerechte Stücke schneiden.
Zwiebel in feine Ringe schneiden und mit dem Gemüse und den Oliven mischen.
Öl, Essig, Salz, Pfeffer und Oregano zu einem Dressing verrühren und unterheben.
Feta in Würfel brechen und auf den Salat geben.
Fladenbrot im Ofen bei 200 °C 5 Minuten aufbacken und dazu servieren.`,
  },
  {
    id: "caesar-salad",
    titel: "Caesar Salad mit Hähnchen",
    dauer: 25,
    schlagwoerter: ["geflügel", "salat", "leicht"],
    saison: [],
    zutaten: `2 Köpfe Römersalat
350 g Hähnchenbrust
3 Scheiben Toastbrot
50 g Parmesan
3 EL Mayonnaise
3 EL Joghurt
1 Zitrone
1 Zehe Knoblauch
1 TL Senf
3 EL Olivenöl`,
    gewuerze: `Salz
Pfeffer`,
    schritte: `Toastbrot würfeln und in 1 EL Öl 3–4 Minuten goldbraun rösten.
Hähnchenbrust salzen, pfeffern und im restlichen Öl von beiden Seiten 10–12 Minuten braten, dann in Streifen schneiden.
Mayonnaise, Joghurt, Zitronensaft, Senf, gepressten Knoblauch und die Hälfte des fein geriebenen Parmesans verrühren und abschmecken.
Salat waschen und in breite Streifen schneiden.
Salat mit Dressing mischen, Hähnchen und Brotwürfel darauf verteilen.
Mit dem übrigen Parmesan bestreuen.`,
  },
  {
    id: "nudelsalat-mit-thunfisch",
    titel: "Nudelsalat mit Thunfisch",
    dauer: 30,
    schlagwoerter: ["fisch", "salat", "pasta", "mealprep"],
    saison: [],
    zutaten: `300 g Nudeln, kurz
2 Dosen Thunfisch, im eigenen Saft
150 g Erbsen, tiefgekühlt
1 Dose Mais
1 Paprika, rot
3 Gewürzgurken
150 g Joghurt
3 EL Mayonnaise
1 Bund Schnittlauch`,
    gewuerze: `Salz
Pfeffer
(Zitronensaft)`,
    schritte: `Nudeln in Salzwasser 10–12 Minuten bissfest kochen, in den letzten 2 Minuten die Erbsen mitgaren.
Alles abgießen, kalt abspülen und abtropfen lassen.
Paprika und Gewürzgurken würfeln, Mais und Thunfisch abtropfen lassen.
Joghurt mit Mayonnaise, etwas Gurkenwasser, Salz und Pfeffer verrühren.
Alles mit den Nudeln mischen und Schnittlauch darüberschneiden.
Mindestens 15 Minuten durchziehen lassen und nochmals abschmecken.`,
  },
  {
    id: "kartoffelsalat-mit-wuerstchen",
    titel: "Kartoffelsalat mit Würstchen",
    dauer: 45,
    schlagwoerter: ["fleisch", "kartoffeln", "salat", "klassiker", "kinder"],
    saison: [],
    zutaten: `1 kg Kartoffeln, festkochend
6 Würstchen
4 Gewürzgurken
1 Zwiebel
3 Eier
4 EL Mayonnaise
150 g Joghurt
1 TL Senf
(1 Bund Schnittlauch)`,
    gewuerze: `Salz
Pfeffer
(Zucker)`,
    schritte: `Kartoffeln in der Schale etwa 20 Minuten garen, Eier 10 Minuten hart kochen.
Kartoffeln pellen, 10 Minuten abkühlen lassen und in Scheiben schneiden.
Eier pellen und würfeln, Gewürzgurken und Zwiebel fein würfeln.
Mayonnaise, Joghurt, Senf und etwas Gurkenwasser verrühren, mit Salz, Pfeffer und einer Prise Zucker abschmecken.
Alles mit den Kartoffeln mischen und 20 Minuten ziehen lassen.
Würstchen in heißem, nicht kochendem Wasser 5 Minuten erwärmen und zum Salat servieren.`,
  },
  {
    id: "burger",
    titel: "Burger",
    dauer: 30,
    schlagwoerter: ["fleisch", "kinder", "pfanne", "klassiker"],
    saison: [],
    zutaten: `500 g Rinderhackfleisch
5 Burger-Brötchen
5 Scheiben Käse
2 Tomaten
1 Zwiebel, rot
1 Kopf Salat
2 Gewürzgurken
3 EL Ketchup
2 EL Mayonnaise
1 EL Rapsöl`,
    gewuerze: `Salz
Pfeffer`,
    schritte: `Hackfleisch zu 5 flachen Patties formen, in der Mitte leicht eindrücken.
Tomaten, Zwiebel und Gewürzgurken in Scheiben schneiden, Salat waschen.
Patties im heißen Öl von jeder Seite 3–4 Minuten braten, dann salzen und pfeffern.
Je eine Scheibe Käse auflegen und 1 Minute schmelzen lassen.
Brötchen aufschneiden und mit den Schnittflächen in der Pfanne 1–2 Minuten anrösten.
Brötchen mit Ketchup und Mayonnaise bestreichen, mit Salat, Patty, Tomate, Zwiebel und Gurke belegen.`,
  },
  {
    id: "hotdogs",
    titel: "Hotdogs",
    dauer: 20,
    schlagwoerter: ["fleisch", "kinder", "ofen"],
    saison: [],
    zutaten: `6 Hotdog-Brötchen
6 Würstchen
4 Gewürzgurken
3 EL Röstzwiebeln
3 EL Ketchup
2 EL Senf
2 EL Mayonnaise`,
    gewuerze: `(Currypulver)`,
    schritte: `Backofen auf 180 °C Ober-/Unterhitze vorheizen.
Würstchen in heißem, nicht kochendem Wasser etwa 5 Minuten erwärmen.
Brötchen der Länge nach einschneiden und 3–4 Minuten im Ofen aufbacken.
Gewürzgurken in dünne Scheiben schneiden.
Würstchen in die Brötchen legen, mit Gurken belegen und mit Ketchup, Senf und Mayonnaise garnieren.
Mit Röstzwiebeln bestreuen und sofort servieren.`,
  },
  {
    id: "zucchinipuffer",
    titel: "Zucchinipuffer mit Kräuterquark",
    dauer: 30,
    schlagwoerter: ["vegetarisch", "pfanne", "leicht"],
    saison: [6, 7, 8, 9],
    zutaten: `2 Zucchini
1 Karotte
2 Eier
4 EL Mehl
50 g Käse, gerieben
250 g Quark
3 EL Milch
1 Bund Schnittlauch
4 EL Rapsöl`,
    gewuerze: `Salz
Pfeffer
(Knoblauchpulver)`,
    schritte: `Zucchini und Karotte grob raspeln, salzen und 10 Minuten ziehen lassen.
Gemüse kräftig ausdrücken und mit Eiern, Mehl und Käse vermengen, pfeffern.
Quark mit Milch glatt rühren, Schnittlauch hineinschneiden und mit Salz und Pfeffer würzen.
Öl in einer Pfanne erhitzen und je einen Esslöffel Teig flach hineinsetzen.
Puffer von jeder Seite 3–4 Minuten goldbraun braten.
Mit dem Kräuterquark servieren.`,
  },
  {
    id: "tomate-mozzarella-mit-ciabatta",
    titel: "Tomate-Mozzarella mit Ciabatta",
    dauer: 15,
    schlagwoerter: ["vegetarisch", "italienisch", "salat", "leicht"],
    saison: [6, 7, 8, 9],
    zutaten: `5 Tomaten, reif
250 g Mozzarella
1 Bund Basilikum
3 EL Olivenöl
2 EL Balsamicoessig
1 Ciabatta`,
    gewuerze: `Salz
Pfeffer`,
    schritte: `Ciabatta im Ofen bei 200 °C 8–10 Minuten aufbacken.
Tomaten und Mozzarella in Scheiben schneiden.
Abwechselnd dachziegelartig auf einer Platte anrichten.
Basilikumblätter dazwischenstecken.
Mit Salz und Pfeffer würzen, mit Öl und Balsamico beträufeln.
Mit dem warmen Ciabatta servieren.`,
  },
  {
    id: "erdbeer-quark-pfannkuchen",
    titel: "Erdbeer-Quark-Pfannkuchen",
    dauer: 30,
    schlagwoerter: ["vegetarisch", "süß", "kinder"],
    saison: [5, 6, 7],
    zutaten: `200 g Mehl
3 Eier
400 ml Milch
500 g Erdbeeren
250 g Quark
100 g Joghurt
3 EL Zucker
1 Pck. Vanillezucker
3 EL Butter`,
    gewuerze: `Salz
(Puderzucker)`,
    schritte: `Mehl, Eier, Milch, 1 EL Zucker und eine Prise Salz glatt verrühren und 10 Minuten quellen lassen.
Erdbeeren waschen, putzen und in Stücke schneiden.
Quark mit Joghurt, restlichem Zucker und Vanillezucker cremig rühren.
Butter portionsweise in einer Pfanne erhitzen und dünne Pfannkuchen je Seite 1–2 Minuten ausbacken.
Pfannkuchen mit Quark bestreichen, Erdbeeren darauf verteilen und zusammenklappen.
Nach Belieben mit Puderzucker bestäuben.`,
  },
  {
    id: "griessbrei",
    titel: "Grießbrei",
    dauer: 15,
    schlagwoerter: ["vegetarisch", "süß", "kinder", "klassiker"],
    saison: [],
    zutaten: `800 ml Milch
100 g Grieß
3 EL Zucker
1 Pck. Vanillezucker
1 EL Butter
(300 g Himbeeren, tiefgekühlt)`,
    gewuerze: `Salz
(Zimt)`,
    schritte: `Milch mit Zucker, Vanillezucker, Butter und einer Prise Salz aufkochen.
Topf vom Herd ziehen und den Grieß mit dem Schneebesen einrühren.
Bei kleiner Hitze unter Rühren 3–5 Minuten quellen lassen, bis der Brei andickt.
2 Minuten ruhen lassen und mit Zimt oder warmen Himbeeren servieren.`,
  },
  {
    id: "ofenkartoffel-spalten-mit-dip",
    titel: "Ofenkartoffel-Spalten mit Dip",
    dauer: 45,
    schlagwoerter: ["vegetarisch", "ofen", "kartoffeln", "kinder"],
    saison: [],
    zutaten: `1,2 kg Kartoffeln, festkochend
4 EL Olivenöl
250 g Quark
150 g Joghurt
1 Zehe Knoblauch
1 Bund Schnittlauch
(1 Gurke)`,
    gewuerze: `Salz
Pfeffer
Paprikapulver
(Rosmarin)`,
    schritte: `Backofen auf 220 °C Ober-/Unterhitze vorheizen.
Kartoffeln gründlich waschen und mit Schale in Spalten schneiden.
Mit Öl, Salz, Paprikapulver und Rosmarin mischen und auf einem Blech mit Backpapier verteilen.
Etwa 30 Minuten backen, nach der Hälfte einmal wenden.
Quark, Joghurt, gepressten Knoblauch und geschnittenen Schnittlauch verrühren, mit Salz und Pfeffer abschmecken.
Spalten mit dem Dip und nach Belieben Gurkensticks servieren.`,
  },
  {
    id: "spiegelei-mit-spinat-und-kartoffeln",
    titel: "Spiegelei mit Spinat und Kartoffeln",
    dauer: 30,
    schlagwoerter: ["vegetarisch", "kartoffeln", "klassiker"],
    saison: [],
    zutaten: `800 g Kartoffeln
450 g Blattspinat, tiefgekühlt
1 Zwiebel
1 Zehe Knoblauch
100 ml Sahne
5 Eier
2 EL Butter`,
    gewuerze: `Salz
Pfeffer
Muskat`,
    schritte: `Kartoffeln schälen und in Salzwasser etwa 20 Minuten garen.
Zwiebel und Knoblauch fein würfeln und in 1 EL Butter 2–3 Minuten glasig dünsten.
Spinat zugeben, bei mittlerer Hitze 8–10 Minuten auftauen lassen und mit Sahne verfeinern.
Spinat mit Salz, Pfeffer und Muskat abschmecken.
Restliche Butter in einer Pfanne erhitzen und die Eier 4–5 Minuten als Spiegeleier braten.
Kartoffeln abgießen und mit Spinat und Spiegelei servieren.`,
  },
  {
    id: "couscous-salat",
    titel: "Couscous-Salat",
    dauer: 20,
    schlagwoerter: ["vegetarisch", "salat", "orientalisch", "mealprep"],
    saison: [],
    zutaten: `250 g Couscous
300 ml Gemüsebrühe
1 Gurke
1 Paprika, rot
250 g Kirschtomaten
3 Frühlingszwiebeln
1 Bund Petersilie
1 Zitrone
4 EL Olivenöl
(150 g Feta)`,
    gewuerze: `Salz
Pfeffer
(Kreuzkümmel)
(Minze)`,
    schritte: `Brühe aufkochen, über den Couscous gießen und abgedeckt 5 Minuten quellen lassen.
Couscous mit einer Gabel auflockern und 10 Minuten abkühlen lassen.
Gurke, Paprika und Tomaten klein schneiden, Frühlingszwiebeln in Ringe schneiden, Petersilie hacken.
Zitronensaft mit Öl, Salz, Pfeffer und Kreuzkümmel verrühren.
Alles mit dem Couscous mischen und 10 Minuten durchziehen lassen.
Nach Belieben mit zerbröseltem Feta servieren.`,
  },
];

export default REZEPTE;
