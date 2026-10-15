# 0013: Kassenbon in den Vorrat übernehmen

- **Status:** angenommen
- **Datum:** 2026-10-16

## Ziel

Nach dem Einkauf den eBon (PDF, z. B. aus der REWE-App) hochladen – die Artikel
landen im Vorrat, ohne alles einzeln einzutragen.

## Entscheidungen

- **Lesen im Browser** mit pdf.js (`pdfjs-dist`, erst beim Hochladen geladen, für
  offline vorgespeichert). Der Bon verlässt das Gerät nicht. eBons haben eine echte
  Textebene, eine Texterkennung ist nicht nötig; ihre „Verschlüsselung“ sperrt nur
  Bearbeiten und Drucken und braucht zum Lesen kein Passwort.
- **Zerlegen** (`kassenbon/zerlegen.ts`): Zeilen „NAME … 1,99 B“, darunter „4 Stk x“
  bzw. „0,512 kg x“. Pfand, Leergut, Rabatte und negative Beträge werden übersprungen,
  gleiche Positionen zusammengezählt. Nach REWE gebaut, aber allgemein gehalten.
- **Zuordnen** (`kassenbon/zuordnen.ts`), in dieser Reihenfolge:
  1. gelernte Zuordnung (`bon_artikel`, synchronisiert, wie die Barcodes),
  2. gleicher Name (auch Plural/Singular),
  3. Wortanfang – Kassen kürzen („ROSENBROE.“ → Rosenbrötchen),
  4. Wortende – Komposita („WEIDEMILCH“ → Milch).
  Sonst ein lesbarer Vorschlag („BIO WEIDEMILCH“ → „Bio Weidemilch“, OE/UE/AE →
  Umlaut, Verpackungskürzel weg).
- **Prüfen vor dem Buchen:** Alles steht in einer Liste mit Häkchen, Namen (änderbar,
  mit Vorschlägen) und Anzahl. Frisches (Obst, Gemüse, Brot) ist abgewählt, außer es
  wird schon im Vorrat geführt.
- **Buchen:** je Position Packungen bzw. Stück (gewogene Ware = 1), als Einkauf mit
  Kaufdatum vom Bon. Steht der Artikel offen auf der Liste, wird er dort abgehakt (die
  Buchung hängt am Eintrag – Haken zurück nimmt sie zurück).
- **Doppelt?** Markt, Datum, Bon-Nr. und TSE-Transaktion ergeben einen Schlüssel
  (`kassenbons`, synchronisiert). Derselbe Bon zeigt einen Hinweis, wird aber nicht
  verboten – zwei Geräte offline dürfen sich nicht gegenseitig den Upload sperren.

## Bekannte Grenzen

- Nur PDF-eBons mit Text; fotografierte Papierbons bräuchten Texterkennung.
- Kürzel ohne Treffer brauchen einmal Hilfe beim Namen; danach kennt die App sie.
