# 0003: Vorrat

- **Status:** angenommen
- **Datum:** 2026-10-14

## Entscheidungen

| Frage | Entscheidung |
|---|---|
| Welche Artikel stehen im Vorrat? | Nur als „Vorratsartikel“ markierte. Voreinstellung nach Kategorie (`packages/db/src/vorrat.ts`): an für Vorrat & Konserven, Süßes & Snacks, Getränke, Tiefkühl, Drogerie, Haushalt; aus für Frisches. Pro Artikel umstellbar. |
| Wann wird Gekauftes gebucht? | Sofort beim Abhaken. Haken zurücknehmen löscht die Buchung wieder. |
| Worin wird gezählt? | Immer in **Packungen bzw. Stück** (seit Oktober 2026, siehe unten). |
| Einträge ohne Menge? | Ein Einkauf = eine Packung. „3 Stk.“ = 3; „1 kg“ bei Packungen à 500 g = 2. |
| Verbrauch? | Von Hand: Plus/Minus (eine Packung), Wischen nach links = aufgebraucht, Bestand antippen und setzen, Inventur. Nach dem Kochen über das Rezept. |
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

## Packungen statt Gramm (Oktober 2026)

Im Alltag zählt man „2 Packungen Nudeln“, nicht „1000 g“. Deshalb:

- Der Bestand zählt **Packungen bzw. Stück**. Plus/Minus ändern um eine Packung.
- Ein Artikel hat optional eine **Packungsgröße** (`packung_menge`/`packung_einheit`,
  z. B. 500 g). Sie kommt vom gescannten Barcode, vom ersten Einkauf mit Gewicht
  („Mehl 1 kg“) oder aus dem Dialog. Rezepte rechnen damit Gramm und Milliliter in
  Packungen um („reicht der Vorrat?“, Abbuchen nach dem Kochen).
- **Angebrochen** wird nur markiert, nicht anteilig gezählt (`angebrochen`). Ein Rest
  nach dem Kochen öffnet eine Packung; „−“ verbraucht die offene. Für „reicht es?“
  zählt eine offene Packung halb. Ohne Bestand ist nichts offen.
- Migration 0013 stellt bisherige g/ml-Artikel um: mit bekannter Packungsgröße
  aufgerundet (Rest = angebrochen), sonst wird jeder Rest eine Packung. Der
  Mindestbestand wird mit umgerechnet. Die Spalte `standardeinheit` bleibt für ältere
  App-Stände, ist aber immer „stueck“.

## Pflege

- **Detail-Dialog:** Bestand und Mindestbestand mit −/+, „eine ist angebrochen“,
  Name, Kategorie, Packungsgröße; darunter der Verlauf (wer hat wann gekauft,
  verbraucht, korrigiert). „Aufgebraucht“ und „Nicht mehr führen“ stehen getrennt.
- **Suchen und Filtern:** Was unten getippt wird, filtert zugleich; Filter Alle/Knapp/
  Leer. Leeres steht am Ende seiner Kategorie, ausgegraut.
- **Wischen:** links = aufgebraucht (mit Rückgängig), rechts = auf die Liste.
- **Inventur:** alle Artikel nacheinander in Supermarkt-Reihenfolge; „Stimmt“ oder
  korrigieren, jede Änderung wird sofort gebucht.
- **Eingabe mit Menge** in Liste und Vorrat: „Mehl 1 kg“, „2 Dosen Tomaten“, „Eier 10“
  werden zerlegt (`zerlegeEingabe`); mit Zusatz („Milch, laktosefrei“) bleibt alles Name.
- Artikel werden per Namen **in JavaScript** gesucht – SQLites `lower()` kennt keine
  Umlaute, „Äpfel“ wäre sonst jedes Mal ein neuer Artikel geworden.

## Bekannte Grenzen

- Verbrauchen zwei Geräte offline gleichzeitig unter den Mindestbestand, landet der
  Artikel unter Umständen zweimal auf der Liste.
- Welche Packung wie voll ist, weiß die App nicht – nur, dass eine offen ist.
- Keine Lagerorte, kein Mindesthaltbarkeitsdatum.
