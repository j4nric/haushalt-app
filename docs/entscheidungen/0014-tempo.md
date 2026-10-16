# 0014: Tempo – sofort statt hübsch

- **Status:** angenommen
- **Datum:** 2026-10-16

## Ziel

Die App wirkte leicht träge. Messen, Ursachen finden, merklich schneller machen.

## Messung

Produktions-Build, Chromium mit 4-fach gedrosselter CPU (≈ Mittelklasse-Handy),
Handy-Viewport, realistische Daten (80 Artikel, 40 im Vorrat, 25 auf der Liste, 200 Käufe,
20 Rezepte). Gemessen **im Browser**: vom Pointer-/Tastendruck bis zum ersten Bild, in dem
das Ergebnis sichtbar ist (wie INP), Mittel aus 3 Runden. Skript:
`docs/messung-tempo.spec.ts.txt` (zum Ausführen nach `apps/web/e2e/` kopieren).

| Aktion | vorher | nachher |
|---|---|---|
| Tab → Liste | 334 ms | 51 ms |
| Tab → Rezepte | 348 ms | 43 ms |
| Tab → Plan | 242 ms | 43 ms |
| Tab → Vorrat | 397 ms | 113 ms (ab dem 2. Mal ~60 ms) |
| Entdecken öffnen | 388 ms | 179 ms (ab dem 2. Mal ~80 ms) |
| Rezept-Vorschau öffnen | 130 ms | 68 ms |

## Entscheidungen

- **Weniger Bewegung:** keine Seitenübergänge (View Transitions), kein versetztes
  Einblenden, kein Hüpfen der Symbole, Knöpfe ohne Schrumpf-Animation. Drawer öffnen in
  0,22 s ohne Nachfedern. **Bleiben** als Features: Abhaken mit Kritzeln (mit Abbrechen
  per zweitem Tipp) und der Flug in den Wagen, dazu Wischen, Scanlinie und Glücksrad.
- **Bereiche bleiben bestehen** (React `<Activity>`): Einmal gebaute Tabs behalten Zustand
  und Daten; ausgeblendet ruhen ihre Abfragen und Effekte. Nach dem Start werden alle im
  Leerlauf vorgebaut und ihr Code vorgeladen – auch das erste Öffnen ist schnell. Jeder
  Bereich liest nur Adressen seines eigenen Bereichs (`useUnterseite(bereich)`) und
  behält seine Scrollposition.
- **Weniger neu zeichnen:** Vorrat-Zeilen vergleichen ihre Daten und zeichnen nur bei
  Änderung neu; „Entdecken“ zerlegt die Sammlung einmal und zeigt erst 24 Karten, beim
  Scrollen mehr.
- **Eingabe im Vorrat oben** unter der Kopfzeile (bleibt beim Scrollen stehen) – die
  iPhone-Tastatur kann sie nicht verdecken. Die Liste behält ihre Leiste unten.
- **Rezept-Vorschau** ohne vaul-iOS-Scroll-Sperre (`disablePreventScroll={false}`, nur
  Lesen): Die Sperre unterband am Rand das Nachfedern. `overscroll-contain` verhindert,
  dass die Seite dahinter mitscrollt.
