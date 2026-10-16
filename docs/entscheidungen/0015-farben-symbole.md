# 0015 – Farbschemata und Produktsymbole

## Farbschemata

- Zwölf Schemata: System, Frisch, Ozean, Petrol, Salbei, Senf, Terrakotta, Beere,
  Lavendel, Schiefer, Mitternacht (immer dunkel) und Eigene. Jedes hat eine helle und
  eine dunkle Variante aus derselben Farbfamilie; der Akzent erreicht auf Hintergrund
  und Karten mindestens 4,5 : 1.
- **Alles hört aufs Schema.** Feste Farben in den Modulen (Schneeflocke im Vorrat,
  Scanner, Lieblingsgericht, Favoritenstern, „Vielleicht vergessen“, Glücksrad,
  Hinweise im Plan) sind durch Tokens ersetzt: `--erfolg`, `--warning`,
  `--destructive`, `--frost`, `--favorit`. Sie bleiben erkennbar (grün bleibt grün),
  rücken aber leicht zum Akzent hin (10 % Farbton in OKLCH).
- **Kategoriefarben „Passend“** (neue Voreinstellung): die kräftigen Farben, um 16 %
  Farbton zum Akzent gedreht, gleiche Helligkeit. Mehr Angleichung ließ Kategorien
  verschwimmen (Fleisch rot → braun wie Brot im Schema „Frisch“). Gerechnet wird in
  Hex statt `color-mix`, damit die Kontrastprüfung (`knalligeFlaeche`) weiter greift.

## Produktsymbole

Verglichen: Lucide (schon im Einsatz, ~60 Lebensmittel), Tabler Icons (MIT, ~55
Lebensmittel plus Drogerie/Haushalt: Käse, Brot, Würstchen, Pilz, Klopapier,
Waschmaschine …), Phosphor (MIT, ~45, ähnlich Lucide), OpenMoji schwarz
(sehr spezifisch, aber CC BY-SA und dickerer Emoji-Strich).

Entscheidung: **Lucide + Tabler** – gleiches 24er-Raster, 2 px runde Striche, flach
und einfarbig in der Kategoriefarbe. Tabler (`@tabler/icons-react`) füllt die Lücken;
einzeln importiert, nur Benutztes landet im Bundle.

Zuordnung `lib/produktsymbole.ts`: deutsche Wörter → Symbol, wie die
Kategorie-Erkennung über Wortende („Bergkäse“ → Käse, „Käsekuchen“ → Kuchen).
Unbekanntes zeigt das Kategorie-Symbol. Abschaltbar unter Darstellung.
