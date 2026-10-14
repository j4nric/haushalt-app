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
- **Farbschema der App:** System (neutral Schwarz/Weiß), Frisch (Grün auf Mint,
  Standard) und Ozean (Blau auf Himmelblau) folgen dem Dunkelmodus des Geräts und
  färben auch Hintergrund und Karten, damit ein Wechsel sofort sichtbar ist. Jeder
  Knopf zeigt eine Farbvorschau. „Eigene“ setzt Akzent, Hintergrund und Karten fest.
  Alle Schemata bestehen aus drei Grundfarben pro Modus; Text-, Linien- und
  Flächenfarben werden abgeleitet (Textfarbe nach WCAG-Kontrast, Zwischentöne per
  `color-mix` in OKLab – OKLCH erzeugte bei fast farblosen Tönen einen Rosastich).
- **Pro Gerät:** Gespeichert im Browser (`apps/web/src/einstellungen.ts`), nicht im
  Haushalt. Jede Person kann ihr Handy anders einstellen. Lässt sich später auf
  Haushaltsebene heben, falls gewünscht.
- **Großer Anfangsbuchstabe:** Neue Artikel werden mit großem ersten Buchstaben
  gespeichert („milch“ → „Milch“); der Rest bleibt, wie getippt.

## Umsetzung

Das Farbschema überschreibt die Variablen aus `index.css` über ein eigenes
`<style id="app-thema">` mit `:root:root`, damit es auch die Dunkelmodus-Regeln
schlägt. Es wird vor dem ersten Rendern angewendet (kein Aufblitzen der Standardfarben).

## Einkaufsliste als Kacheln (Nachtrag)

- Pro Kategorie ein Raster mit 2 Spalten; das Symbol steht einmal links mittig neben
  den Kacheln, die Überschrift ist reiner Text in der Kategoriefarbe. Kacheln sind
  leicht in der Kategoriefarbe getönt.
- Kein Haken, keine Mengen in der Liste: Antippen = gekauft (wandert nach
  „Im Wagen“), nochmal antippen = zurück. Lang drücken öffnet Kategorie ändern und
  Löschen (mit Rückgängig). Ein Artikel, der schon offen auf der Liste steht, wird
  nicht doppelt eingetragen („steht schon auf der Liste“).
- Mengen bleiben im Vorrat (Bestand mit − / +) und in der Datenbank erhalten.

## Spalten der Einkaufsliste (Nachtrag)

- Wählbar unter Haushalt → Darstellung: 1, 2 (Standard) oder 3 Spalten, pro Gerät.
- Jedes Kategorie-Raster nutzt `grid-auto-rows: 1fr`: Bricht ein langer Name um,
  werden alle Kacheln dieser Kategorie gleich hoch; andere Kategorien bleiben kompakt.
- Lange Wörter brechen mit deutscher Silbentrennung (`hyphens: auto`, `lang="de"`).
- Bei 3 Spalten etwas kleinere Schrift und weniger Innenabstand.

## Schnell-Hinzufügen aus dem Verlauf (Nachtrag)

- Das Kategorie-Symbol links neben dem Raster ist ein Knopf (mit kleinem Plus-Abzeichen;
  geöffnet auf einem Kreis in der Kategoriefarbe). Es klappt den Verlauf der Kategorie auf: eine Fläche in kräftiger Kategoriefarbe (weiße Schrift, solange
  WCAG 3:1 erreicht wird) mit allen bisherigen Produkten. Wählbare zuerst, mit Plus;
  schon offen auf der Liste → ausgegraut mit Haken. Sortiert nach deutschem Alphabet.
- Kategorien mit Verlauf, aber ohne offene Einträge, stehen unter „Aus dem Verlauf“.
- Lang drücken nimmt ein Produkt aus dem Verlauf (mit Rückgängig). Das **blendet aus**
  (`artikel.archiviert`, Migration `0003`), statt zu löschen: Vorrat und Buchungen
  hängen am Artikel. Erneutes Eintragen per Name blendet wieder ein.
- Wird ein Eintrag aus „Im Wagen“ zurückgenommen, während derselbe Artikel schon offen
  auf der Liste steht, wird der Wagen-Eintrag gelöscht (samt Vorratsbuchung) statt
  doppelt aufzutauchen.

- Text in den Kacheln ist zentriert.
