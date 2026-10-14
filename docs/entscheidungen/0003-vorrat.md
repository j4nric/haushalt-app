# 0003: Vorrat

- **Status:** angenommen
- **Datum:** 2026-10-14

## Entscheidungen

| Frage | Entscheidung |
|---|---|
| Welche Artikel stehen im Vorrat? | Nur als „Vorratsartikel“ markierte. Voreinstellung nach Kategorie (`packages/db/src/vorrat.ts`): an für Vorrat & Konserven, Süßes & Snacks, Getränke, Tiefkühl, Drogerie, Haushalt; aus für Frisches. Pro Artikel umstellbar. |
| Wann wird Gekauftes gebucht? | Sofort beim Abhaken. Haken zurücknehmen löscht die Buchung wieder. |
| Einträge ohne Menge? | Zählen als 1 Stück, wenn die Standardeinheit Stück ist. Bei g/ml oder abweichender Einheit wird nicht gebucht, die App weist darauf hin. |
| Verbrauch? | Von Hand: Plus/Minus (1 Stück bzw. 100 g/ml), „Aufgebraucht“, Bestand antippen und direkt setzen. Später zusätzlich über Rezepte. |
| Knapp? | Optionaler Mindestbestand pro Artikel. Fällt der Bestand darunter, kommt der Artikel automatisch auf die Einkaufsliste, aufgefüllt bis zum Mindestbestand, aber nur, wenn er dort nicht schon offen steht. |

## Datenmodell: Buchungen statt Bestandszahl

Der Bestand ist die Summe aller `vorratsbuchungen` eines Artikels (`+` Einkauf/Korrektur,
`−` Verbrauch). Eine einzelne Zahl pro Artikel würde offline Änderungen verlieren:
Verbrauchen zwei Geräte gleichzeitig je ein Stück, gewinnt beim Abgleich die zuletzt
hochgeladene Zahl, und es fehlt ein Verbrauch. Buchungen werden nur angehängt und
kollidieren nie. Abgesichert durch den E2E-Test „Offline-Verbrauch auf zwei Geräten
geht nicht verloren“. Nebeneffekt: ein Verlauf, wer wann was gekauft oder verbraucht hat.

- Buchungen sind unveränderlich (das API lehnt PATCH ab), dürfen aber gelöscht werden.
- `listeneintrag_id` verweist ohne Fremdschlüssel auf den abgehakten Eintrag. Hat ein
  anderes Gerät den Eintrag inzwischen gelöscht, darf die offline erfasste Buchung
  beim Upload nicht scheitern.
- Alle Vorrat-Aktionen laufen auf dem Gerät in einer lokalen Transaktion
  (`apps/web/src/vorratsaktionen.ts`) und funktionieren damit offline.

## Bekannte Grenzen

- Verbrauchen zwei Geräte offline gleichzeitig unter den Mindestbestand, landet der
  Artikel unter Umständen zweimal auf der Liste.
- Keine Umrechnungen („1 Packung = 500 g“), keine Lagerorte, kein Mindesthaltbarkeitsdatum.
