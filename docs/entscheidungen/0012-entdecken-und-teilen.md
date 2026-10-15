# 0012: Rezepte entdecken und per Teilen importieren

- **Status:** angenommen
- **Datum:** 2026-10-15

## Ziel

Die Rezeptseite leichter befüllen: Ideen bekommen, ohne selbst zu suchen, und
Rezepte aus anderen Apps ohne Kopieren übernehmen.

## Entscheidungen

- **Eigene Startsammlung statt fremder Datenbank.** Geprüft: Wikibooks-Kochbuch (frei,
  CC BY-SA, aber uneinheitlich und als Wiki-Text), TheMealDB (englisch, Testschlüssel
  nur für Entwicklung, für Veröffentlichung kostenpflichtig), Chefkoch (keine offizielle
  Schnittstelle, Massenabruf rechtlich nicht gedeckt). Stattdessen 200 selbst
  geschriebene Rezepte (seit Oktober 2026 auch Asiatisches, Klassiker und
  Saisonales für Frühling/Sommer und Herbst/Winter) in `apps/web/src/entdecken/sammlung/` – im Format des
  Rezept-Editors, immer für 2 Personen, mit Gramm-Angaben, Gewürzen getrennt,
  Schlagwörtern und Saison. Keine Lizenzfragen, offline, ohne fremden Dienst; dafür
  ohne Fotos.
- **Qualität per Test** (`sammlung.test.ts`): jede Zutat mit Menge und als
  einkaufbares Produkt benannt („1 Zwiebel, rot“ statt „1 rote Zwiebel“), damit Liste,
  Vorrat und „Was kann ich kochen?“ funktionieren; erlaubte Schlagwörter; vegetarisch
  schließt Fleisch/Fisch aus; Mindestanteile für Vegetarisches, Kinder, Fisch, Schnelles.
- **Garzeiten als Timer:** Jeder Schritt mit Warte-, Gar- oder Backzeit nennt sie als
  Zahl („9–11 Minuten“, „1,5 Stunden“) statt „nach Packungsangabe“ – im Kochmodus
  wird daraus ein antippbarer Timer (`lib/timer.ts`). Der Sammlungstest verlangt bei
  Rezepten ab 15 Minuten mindestens eine erkennbare Zeit.
- **„Entdecken“** (`#rezepte/entdecken`, erst beim Öffnen geladen): Vorschläge nach
  Vorrat (je Hauptzutat im Vorrat Punkte), Saison (passt: Plus, außerhalb: Minus) und
  einem Tageszufall – die Liste springt nicht bei jedem Öffnen, „🎲 Andere“ würfelt neu.
  Was der Haushalt schon hat (gleicher Titel), wird nicht mehr vorgeschlagen.
  „In unsere Rezepte“ kopiert das Rezept; danach gehört es dem Haushalt und ist frei
  änderbar.
- **Teilen → Haushalt** (Web Share Target im Manifest, `/teilen`): Der erste Link aus
  `url`, `text` oder `title` landet im Link-Import des Editors und wird sofort geholt.
  Der Link wartet in `sessionStorage`, falls erst angemeldet werden muss.
  Funktioniert mit der installierten App unter Android (Chrome); iOS unterstützt
  Share Targets für Web-Apps nicht – dort bleibt Link einfügen.

## Nachtrag: Übereinstimmung mit dem Vorrat

- Rezeptkarten und Vorschläge zeigen einen farbigen Balken (rot < 40 %, gelb < 80 %,
  sonst grün): Anteil der zählenden Zutaten (ohne Gewürze, Optionales, Salz/Öl & Co.),
  die im Vorrat sind. „Beste Übereinstimmung“ sortiert danach – auf der Rezeptseite
  und in „Entdecken“.
- **Oberbegriffe** (`findeImVorrat`): „Öl“ im Vorrat reicht für „Olivenöl“ oder
  „Rapsöl“ im Rezept und umgekehrt; ebenso Essig, Mehl, Zucker, Brühe, Senf, Nudeln,
  Paprikapulver, Honig. Zwei verschiedene Sorten („Rapsöl“ ↔ „Sesamöl“) passen nicht,
  und andere Wörter bleiben genau („Reis“ macht keinen „Milchreis“).
