# 0010: Barcode scannen

- **Status:** angenommen
- **Datum:** 2026-10-15

## Ziel

Produkte per Kamera scannen: in der Einkaufsliste auf die Liste setzen bzw. – steht
es dort schon offen – abhaken (im Laden einfach scannen, was in den Wagen wandert);
im Vorrat einbuchen.

## Entscheidungen

- **Erkennung im Browser:** die eingebaute `BarcodeDetector`-Schnittstelle, wo
  vorhanden (Android/Chrome); sonst `barcode-detector` mit `zxing-wasm` (iPhone/Safari).
  Die Bibliothek wird erst beim ersten Scannen geladen (≈ 1,1 MB WASM), kommt aus
  der App selbst (nicht vom CDN) und liegt im Service-Worker-Cache – offline nutzbar.
  Prüfziffer wird geprüft (Schutz vor Fehllesungen). Formate: EAN-13/-8, UPC-A/-E.
- **Eigener Name statt Produktname:** Ein Barcode wird mit einem Artikel des
  Haushalts verknüpft (`artikel_barcodes`, synchronisiert). „Milbona Frische
  Vollmilch 3,5 %“ wird einmalig zu „Milch“; danach wird der Code sofort erkannt,
  auch offline. Mehrere Codes pro Artikel (verschiedene Marken) sind möglich.
- **Produktdaten über den Server:** `GET /api/produkte/:barcode` fragt Open Food Facts
  (ODbL, Quellenhinweis im Dialog) und merkt sich die Antwort in `produkte`
  (gefunden 30 Tage, nicht gefunden 1 Tag). So sieht OFF nicht, wer scannt; Bilder
  von OFF lädt die App deshalb bewusst nicht. Begrenzung: 30/min, 500/Tag pro Konto.
- **Vorschläge:** Kurzname ohne Marke, Prozente und Mengen; passende vorhandene
  Artikel (Wort gleich oder Wortende, auch Plural). Die Wahl ist eindeutig: Vorschlag
  antippen = verknüpfen, Namensfeld antippen = neu anlegen; der Knopf nennt das Ziel.
- **Packungsgröße** („500 g“, „1 l“) wird mit dem Barcode gespeichert; im Vorrat wird
  sie eingebucht, wenn sie zur Einheit des Artikels passt, sonst 1 Stück bzw.
  Nachfrage.
- **Tests:** E2E mit simulierter Kamera (Chromium, Y4M-Bild des Barcodes, im Test
  erzeugt) und erzwungener Bibliothek – also der iPhone-Weg; Open Food Facts als
  lokale Attrappe (`PRODUKT_QUELLE`).
