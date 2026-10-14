# 0001: PowerSync als Sync-Engine

- **Status:** angenommen
- **Datum:** 2026-10-14

## Kontext

Einziges Muss der App: Die Einkaufsliste funktioniert offline im Supermarkt und
gleicht sich danach automatisch mit den anderen Haushaltsmitgliedern ab. Dafür
braucht es eine lokale Datenbank im Browser und einen Abgleich mit PostgreSQL.
Kandidaten waren PowerSync (selbst gehostet) und Zero.

## Prototyp

Branch `prototyp/sync-powersync`: eine Tabelle `listeneintraege`, eine minimale
Oberfläche (hinzufügen, abhaken, löschen) und ein Playwright-Test
(`apps/web/e2e/offline-sync.spec.ts`) mit zwei unabhängigen Browsern:

1. Gerät A legt einen Eintrag an → erscheint auf Gerät B.
2. Gerät A verliert das Netz und hakt ab; gleichzeitig ergänzt B einen Eintrag.
   A zeigt „Offline“, die Änderung ist lokal sofort sichtbar, B weiß nichts davon.
3. A hat wieder Netz → beide Änderungen kommen auf beiden Geräten an.

Ergebnis: stabil grün (mehrfach wiederholt, je etwa 11 s).

## Entscheidung

Wir nehmen **PowerSync**. Zero testen wir nicht zusätzlich: Der Prototyp erfüllt
das Muss vollständig, und PowerSync passt gut zum Rest des Stacks:

- Läuft selbst gehostet per Docker neben Postgres, Postgres dient auch als Sync-Ablage.
- Schreibzugriffe laufen über unser eigenes API (`/api/powersync/upload`). Dort
  liegen Validierung und später die Rechteprüfung, in normalem TypeScript.
- Welche Daten ein Gerät bekommt, steht deklarativ in `infra/powersync/sync-config.yaml`.

## Konsequenzen und Erkenntnisse

- **Konflikte:** Ändern zwei Geräte offline dasselbe Feld, gewinnt die zuletzt
  hochgeladene Änderung. Für eine Einkaufsliste ist das vertretbar.
- **Booleans:** SQLite kennt keine; der Client speichert 0/1, das API wandelt um.
- **Uploads:** Felder einzeln übergeben (`op`, `table`, `id`, `opData`), nicht
  `CrudEntry.toJSON()`. Dessen Format ist nicht typisiert.
- **Offline testen:** PowerSync hält die Sync-Verbindung in einem SharedWorker,
  den `context.setOffline()` von Playwright nicht erfasst. Der Test schickt jedes
  Gerät deshalb über einen abschaltbaren Proxy (`apps/web/e2e/netzwerk.ts`).
- **Manuell testen:** zwei *getrennte* Browser-Profile verwenden (z. B. normales
  und privates Fenster). Tabs im selben Profil teilen sich eine lokale Datenbank.
  Der eingebaute Browser der Claude-Desktop-App kann die Worker nicht laden;
  Chrome, Safari und Firefox funktionieren.

## Nachtrag

Login, Haushalte und Zugriffsbeschränkung sind umgesetzt, siehe
[0002: Login, Haushalt und Datenzugriff](0002-login-und-haushalt.md).
