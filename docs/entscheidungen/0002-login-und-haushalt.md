# 0002: Login, Haushalt und Datenzugriff

- **Status:** angenommen
- **Datum:** 2026-10-14

## Entscheidung

- **Login:** Better Auth mit E-Mail und Passwort (mind. 10 Zeichen), Sitzung per Cookie.
  Das API läuft für den Browser unter derselben Adresse wie das Frontend (Vite-Proxy
  `/api`), dadurch keine CORS- oder Third-Party-Cookie-Probleme.
- **PowerSync-Token:** Das JWT-Plugin von Better Auth stellt kurzlebige Tokens aus
  (15 min, EdDSA, Payload nur `sub` = Nutzer-ID, `aud` = `powersync`). PowerSync prüft
  sie über `GET /api/auth/jwks`. Kein geteiltes Geheimnis zwischen API und PowerSync.
- **Haushalt:** Ein Nutzer legt einen Haushalt an (wird Besitzer) oder tritt mit einem
  Einladungscode bei (`ABCD-2345`, 7 Tage gültig, einmal verwendbar, ohne verwechselbare
  Zeichen). Vorerst genau ein Haushalt pro Nutzer; das Schema erlaubt später mehrere.
  Kein E-Mail-Versand nötig, der Code wird per Messenger geteilt.

## Datenzugriff: zweimal abgesichert

1. **Lesen:** Die Sync Streams (`infra/powersync/sync-config.yaml`) liefern nur Zeilen
   aus Haushalten, in denen `auth.user_id()` Mitglied ist.
2. **Schreiben:** Das API (`apps/api/src/upload.ts`) prüft jede Operation:
   Positivliste für Tabellen und Spalten, `haushalt_id` muss ein eigener Haushalt sein,
   `haushalt_id`/`artikel_id` sind nach dem Anlegen unveränderlich, `erstellt_von` und
   `erledigt_von` setzt immer der Server. Ein zusammengesetzter Fremdschlüssel sorgt
   in der Datenbank dafür, dass ein Listeneintrag nur Artikel aus seinem Haushalt nutzt.

Abgesichert durch API-Tests gegen eine echte Datenbank (`apps/api/src/*.test.ts`) und
den E2E-Test mit einem dritten, fremden Haushalt.

## Bewusste Abwägungen

- **Keine Unique-Constraints auf Artikelnamen.** Legen zwei Geräte offline beide „Milch“
  an, würde der zweite Upload sonst dauerhaft scheitern. Der Client verwendet vorhandene
  Artikel wieder; echte Dubletten räumen wir bei Bedarf später auf.
- **Abgelehnte Uploads werden verworfen.** Antwortet das API mit 400/403, verwirft der
  Client die Änderung, statt die Warteschlange für immer zu blockieren. Beim nächsten
  Sync gilt der Server-Stand. Netzwerkfehler, 401 und 5xx werden später erneut versucht.
- **Beim Abmelden** werden alle lokalen Daten gelöscht (`disconnectAndClear`), damit auf
  geteilten Geräten nichts zurückbleibt.

## Noch offen

- Passwort vergessen (braucht E-Mail-Versand)
- Haushalt verlassen, Mitglieder entfernen
- Für die Produktion: eigene Replikationsrolle, Publikation nur für synchronisierte Tabellen
