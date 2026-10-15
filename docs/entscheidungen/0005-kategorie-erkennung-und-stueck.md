# 0005: Kategorie-Erkennung und Mengen nur in Stück

- **Status:** angenommen
- **Datum:** 2026-10-14

## Kategorie-Erkennung

Beim Tippen schlägt die App die Kategorie vor (`packages/db/src/kategorie-erkennung.ts`):

1. **Bekannter Artikel des Haushalts** → dessen gespeicherte Kategorie. Der Haushalt
   „lernt“ dadurch: Einmal als Tiefkühl eingetragene Heidelbeeren fragen nie wieder.
2. **Tabelle** mit gängigen Lebensmitteln und Drogerie-/Haushaltsartikeln, inkl.
   einfacher Plural-/Singularformen.
3. **Wortende** bei Komposita: Im Deutschen trägt das letzte Glied die Bedeutung
   („Apfelsaft“ → Saft → Getränke). Gesucht wird das längste bekannte Wortende ab
   4 Buchstaben (damit „Brei“ nicht als „Ei“ gilt).
4. „TK“, „Tiefkühl…“, „tiefgekühlt“ → immer Tiefkühl.

Mehrdeutige Artikel (frisch/tiefgekühlt/Konserve, z. B. Heidelbeeren, Erbsen, Lachs)
haben mehrere Kategorien, die häufigste zuerst. Die App zeigt sie als Knöpfe; ein Tipp
trägt direkt ein. Enter nimmt die erste.

## Nur Stück

Die Einkaufsliste und der Vorrat zählen nur noch Stück, mit − / + in jeder Zeile:

- Minus bleibt bei 1 stehen; ganz entfernen geht per Wischen (mit Rückgängig).
- Wird ein Artikel eingetragen, der schon offen auf der Liste steht, erhöht sich dessen
  Anzahl statt einer zweiten Zeile.
- Im Vorrat legt „Eintragen“ den Artikel mit Bestand 1 an bzw. erhöht um 1; genaue
  Werte über die Details.

Die Spalten `einheit` und `standardeinheit` bleiben in der Datenbank. Rezepte
(Ausbaustufe 3) werden Gramm und Milliliter wieder brauchen; sie sind dann aber
Sache der Rezepte, nicht der Einkaufsliste.

## Nachtrag: Plural und Konserven (2026-10-15)

- **Gleicher Artikel, andere Form:** „Zwiebel“/„Zwiebeln“, „Ei“/„Eier“, „Apfel“/„Äpfel“
  gelten beim Abgleich als derselbe Artikel (`packages/db/src/namen.ts`; nur das
  letzte Wort wird abgewandelt, die genaue Schreibweise hat Vorrang). Gilt fürs
  Eintragen, für Rezepte → Liste, „Was kann ich kochen?“ und das Abbuchen. Seltsame
  Formen („rei“ aus „reis“) stören nicht, weil nur vorhandene Artikel gefunden werden.
- **Konserven:** „Dose“, „passiert“, „gehackt“, „stückig“, „geschält“, „eingelegt“,
  „aus der Dose“, „im Glas“ → Vorrat & Konserven. Bei Rezept-Zutaten zählt auch die
  Einheit („1 Dose Tomaten“).
