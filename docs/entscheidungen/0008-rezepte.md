# 0008: Rezepte (erster Schritt)

- **Status:** angenommen
- **Datum:** 2026-10-15

## Ziel

Rezepte als gemeinsames Kochbuch des Haushalts und als Einkaufshilfe (1a+b, 2a).
Erster Schritt (12a): anlegen von Hand und per Link, Zutaten auf die Liste,
Kochansicht. Später: Schlagwörter, Favoriten/„zuletzt gekocht“, eigene Fotos,
„Was kann ich jetzt kochen?“, Glücksrad, Kochstatistik, Vorrat beim Kochen abbuchen
(zusammen mit der Wochenplanung).

## Entscheidungen

- **Daten:** `rezepte` (Titel, Portionen, Quelle, Bild-Adresse, Schritte als Text mit
  einem Schritt je Zeile) und `rezept_zutaten` (Position, Menge, freie Einheit, Name,
  Zusatz). Zutaten sind über den **Namen** mit Artikeln verknüpft, nicht per
  Fremdschlüssel: So entstehen keine Artikel für jede Prise Muskat, und offline
  angelegte Rezepte brauchen keine Artikel-Zeilen. Beim Bearbeiten werden die Zutaten
  komplett ersetzt.
- **Zutaten erkennen** (`packages/db/src/zutaten.ts`): Menge (auch ½, 1 1/2, 0,5,
  Spannen → obere Grenze), Einheit (g, kg, ml, l, EL, TL, Prise, Dose, Bund …),
  Name; Klammern und alles nach dem Komma sind Zusatz. Die Menge darf auch hinten
  stehen („Spaghetti 400g“, „Kidneybohnen 2 Dosen“). Gleiche Logik für Eingabe von
  Hand und Import.
- **Gewürze als eigener Absatz:** Spalte `gewuerz` an `rezept_zutaten` (Migration
  0007). Mengen dort optional. Rezeptseiten kennen nur eine Zutatenliste; der Import
  sortiert eindeutige Gewürze (Salz, Pfeffer, Kreuzkümmel …) ohne Menge oder mit
  TL/EL/Prise/Msp. dorthin. Mehrdeutige („Paprika“, „Petersilie“) nur mit
  Gewürz-Einheit und nicht „frisch“. Auf der Einkaufsliste sind Gewürze abgewählt.
- **Link-Import:** Der Server holt die Seite und liest schema.org/Recipe (JSON-LD).
  Schutz vor SSRF: nur http(s), keine privaten/lokalen Adressen (auch nach
  Weiterleitungen), 10 s Zeitlimit, höchstens 5 MB. Lokal nur mit
  `REZEPT_IMPORT_LOKAL=1` (E2E-Tests). Bekannte Lücke: DNS-Rebinding zwischen Prüfung
  und Abruf – für eine Haushalts-App mit angemeldeten Nutzern vertretbar.
- **Bilder:** nur die Adresse aus dem Import; der Service Worker speichert geladene
  Bilder zwischen (offline sichtbar). Eigene Fotos (Upload) kommen später.
- **Auf die Liste (5c):** Auswahl zum Abhaken. Nicht vorausgewählt: steht schon auf
  der Liste, reicht im Vorrat (gleiche Einheit) oder Grundzutat (Salz, Pfeffer, Öl,
  Wasser, Essig, Zucker). Mengen werden in g/ml/Stück umgerechnet; EL, Prise & Co.
  kommen ohne Menge auf die Liste. Die Liste zeigt Mengen jetzt auf der Kachel.
- **Portionen (6a):** umrechenbar in Detail, Kochansicht und beim Übernehmen.
- **Kochansicht (8a+c+d):** große Schrift, Screen Wake Lock, Zutaten abhaken (nur
  lokal), Zeitangaben in Schritten werden zu Timern mit Ton und Vibration.
- **Navigation:** Unterseiten in der Adresse (`#rezepte/<id>/kochen`), damit Zurück
  funktioniert.
