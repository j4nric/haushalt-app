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
  Schnittstelle, Massenabruf rechtlich nicht gedeckt). Stattdessen gut 100 selbst
  geschriebene Rezepte in `apps/web/src/entdecken/sammlung/` – im Format des
  Rezept-Editors, immer für 2 Personen, mit Gramm-Angaben, Gewürzen getrennt,
  Schlagwörtern und Saison. Keine Lizenzfragen, offline, ohne fremden Dienst; dafür
  ohne Fotos.
- **Qualität per Test** (`sammlung.test.ts`): jede Zutat mit Menge und als
  einkaufbares Produkt benannt („1 Zwiebel, rot“ statt „1 rote Zwiebel“), damit Liste,
  Vorrat und „Was kann ich kochen?“ funktionieren; erlaubte Schlagwörter; vegetarisch
  schließt Fleisch/Fisch aus; Mindestanteile für Vegetarisches, Kinder, Fisch, Schnelles.
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
