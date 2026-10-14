# 0004: Oberfläche

- **Status:** angenommen
- **Datum:** 2026-10-14

## Entscheidungen

| Frage | Entscheidung |
|---|---|
| Farbwelt | Neutral mit Grün als Akzent (wie das App-Icon). Farben als CSS-Variablen in `apps/web/src/index.css`. |
| Navigation | Leiste unten (Einkaufsliste, Vorrat, Haushalt), im Daumenbereich. Ansicht steht in der Adresse (`#vorrat`, `#haushalt`). |
| Neue Einträge | Schlankes Eingabefeld unten; Menge, Einheit und Kategorie klappen nur bei Bedarf auf. |
| Bedienung der Liste | Ganze Zeile antippen = abhaken, nach links wischen = löschen (mit „Rückgängig“), lang drücken = bearbeiten. Mit Maus zusätzlich ein Menü pro Zeile. |
| Hell/Dunkel | Folgt automatisch der Geräteeinstellung. |

## Umsetzung

- **Tailwind CSS 4** und **shadcn/ui** (Komponenten liegen als eigener Code in
  `src/components/ui/`, keine Laufzeit-Bibliothek). Native `<select>` statt
  shadcn-Select: Auf dem Handy öffnet sich so die gewohnte System-Auswahl.
- Gesten in `src/hooks/use-wischen.ts`. Antippen bleibt ein normaler Klick, damit auch
  Tastatur und Screenreader funktionieren; nach Wischen/langem Drücken wird der Klick
  unterdrückt.
- „Rückgängig“ merkt sich die gelöschte Zeile und legt sie mit derselben id neu an.

## Beim Einrichten aufgefallen

- `shadcn add` hat `cn` aus einem gleichnamigen, fremden npm-Paket importiert statt aus
  `@/lib/utils`, und `next-themes` installiert. Beides entfernt. Nach künftigen
  `shadcn add` die Importe und neuen Abhängigkeiten prüfen.
