# 0007: Kaufhistorie, „Vielleicht vergessen?“, Produkte mit Persönlichkeit

- **Status:** angenommen
- **Datum:** 2026-10-15

## Entscheidungen

- **Kaufhistorie als eigene Tabelle `kaeufe`:** Jeder abgehakte Listeneintrag legt eine
  Zeile an (alle Artikel, nicht nur Vorratsartikel); Zurücknehmen löscht sie.
  Unveränderlich wie die Vorratsbuchungen, `erstellt_von` setzt der Server. „Wagen
  leeren“ löscht Listeneinträge, die Käufe bleiben. Vorratsbuchungen allein reichen
  nicht, weil sie nur für Vorratsartikel entstehen.
- **„Vielleicht vergessen?“:** Ab drei verschiedenen Kauftagen gilt der Median der
  Abstände als üblicher Rhythmus. Überfällig ab dem 1,5-Fachen (mindestens ein Tag
  mehr), höchstens bis zum 4-Fachen + 7 Tage – danach wird es vermutlich nicht mehr
  gebraucht. Höchstens drei Erinnerungen, die dringendsten zuerst. Wegtippen gilt bis
  zum nächsten Kauf und nur auf diesem Gerät.
- **Produkte mit Persönlichkeit:** Emoji nach Name (sonst Kategorie). Überfällige
  Produkte melden sich in der Karte selbst zu Wort; im Verlauf sagen Vorschläge, die
  seit mindestens drei Wochen nicht gekauft wurden, einen kurzen Satz („vermisst dich
  💔“). Der Satz hängt fest am Namen, damit er nicht bei jedem Neuzeichnen wechselt.
- **Flug in den Wagen:** Nach dem Abhaken fliegt das Emoji im Bogen zum sichtbaren
  Wagen-Ziel (Knopf „Zum Wagen“ oder Wagen-Symbol, sonst unten mittig), dort wackelt
  der Wagen. Bei „Bewegung reduzieren“ entfällt der Flug.
- **Kategorie-Check in der Datenbank alphabetisch** (Migration 0004), damit eine andere
  Anzeige-Reihenfolge keine Migration auslöst.
