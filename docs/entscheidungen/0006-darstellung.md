# 0006: Darstellung – Kategorie-Farben und Farbschema

- **Status:** angenommen
- **Datum:** 2026-10-14

## Entscheidungen

- **Kategorie-Farben und Symbole:** Jede Kategorie hat eine Farbe und ein schlichtes
  Symbol (lucide). Überschriften erscheinen in der Farbe, das Symbol steht vor jedem
  Artikelnamen in Liste und Vorrat. „Im Wagen“ bleibt neutral.
- **Paletten:** Kräftig (Standard), Gedeckt, Schlicht (alles in der Akzentfarbe) und
  Eigene (Farbwähler pro Kategorie, Start mit der zuletzt gewählten Palette).
  Kräftig und Gedeckt sind so gewählt, dass sie auf hellem und dunklem Hintergrund
  lesbar bleiben.
- **Farbschema der App:** Frisch (Grün, Standard) und Ozean (Blau) folgen dem
  Dunkelmodus des Geräts. „Eigene“ setzt Akzent, Hintergrund und Karten fest; Text-,
  Linien- und Flächenfarben werden daraus abgeleitet (Textfarbe nach WCAG-Kontrast,
  Zwischentöne per `color-mix`).
- **Pro Gerät:** Gespeichert im Browser (`apps/web/src/einstellungen.ts`), nicht im
  Haushalt. Jede Person kann ihr Handy anders einstellen. Lässt sich später auf
  Haushaltsebene heben, falls gewünscht.
- **Großer Anfangsbuchstabe:** Neue Artikel werden mit großem ersten Buchstaben
  gespeichert („milch“ → „Milch“); der Rest bleibt, wie getippt.

## Umsetzung

Das Farbschema überschreibt die Variablen aus `index.css` über ein eigenes
`<style id="app-thema">` mit `:root:root`, damit es auch die Dunkelmodus-Regeln
schlägt. Es wird vor dem ersten Rendern angewendet (kein Aufblitzen der Standardfarben).
