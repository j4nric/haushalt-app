# 0009: Wochenplan

- **Status:** angenommen
- **Datum:** 2026-10-15

## Ziel

Abendessen für die nächsten zwei Wochen planen, die Zutaten gesammelt einkaufen und
beim Kochen den Vorrat abbuchen (Antworten 1a, 2b, 3a, 4b, 5a+b+c, 6b, 7a, 8a, 9a,
10a, 11a+b+c, 12b).

## Entscheidungen

- **Daten:** `plan_eintraege` (Datum, optional Rezept, Titel, Portionen, erledigt,
  `gekocht_id`). Der Titel wird mitgeschrieben, damit Einträge gelöschte Rezepte
  überstehen; freier Text („Reste“) ist ein Eintrag ohne Rezept. Kein Fremdschlüssel
  aufs Rezept und keine „ein Eintrag pro Tag“-Regel, damit offline Geplantes beim
  Hochladen nie scheitert – zwei Einträge am selben Tag zeigt die App beide.
- **Standard-Portionen** als Haushalts-Einstellung (`haushalte.standard_portionen`),
  geändert über `PATCH /api/haushalte/:id` (braucht Netz), synchronisiert wie der
  Haushalt. Je Eintrag änderbar.
- **Ansicht:** eigener Tab „Plan“, 14 Tage ab heute als Liste; eine Woche zurück
  zählt für Bilanz und Abwechslung.
- **Planen:** im Plan je Tag (Suche, Favoriten, „Was ist da?“, freier Text mit
  Schnellwahl), im Rezept „Einplanen“, „Woche füllen“ für leere Tage der nächsten
  sieben (gewichtet wie das Glücksrad, nichts doppelt, kürzlich Gekochtes seltener).
- **Verschieben/Tauschen** über das Menü des Eintrags statt Ziehen (handyfreundlich).
- **Woche einkaufen:** Zutaten der offenen Rezepte der nächsten sieben Tage, nach
  Portionen umgerechnet und zusammengezählt (gleicher Name + gleiche Einheit), mit
  derselben Vorauswahl wie beim Einzelrezept. Mengen ohne kaufbare Einheit (EL)
  erscheinen einmal ohne Menge.
- **Kochen:** „Fertig gekocht“ fragt nach, was aus dem Vorrat verbraucht wurde
  (vorbelegt nach Rezept und Portionen, nie mehr als vorhanden; unklare Einheiten
  abgewählt), bucht als Verbrauch, prüft den Mindestbestand, legt den Kochvorgang an
  und hakt den Plan-Eintrag ab (ohne Plan: den heutigen mit diesem Rezept). Alles in
  einer Transaktion und mit Rückgängig.
- **Einkaufsliste:** Karte „Heute gibt's …“ mit „Kochen“.
- **Spaß:** „🔁 schon am Mo“ bei demselben Rezept innerhalb von drei Tagen (geplant
  oder gekocht); Wochenbilanz der letzten sieben Tage („3× gekocht · 2× Reste“).
