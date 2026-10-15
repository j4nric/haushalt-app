# 0011: Benachrichtigungen

- **Status:** angenommen
- **Datum:** 2026-10-15

## Ziel

Mitbekommen, was im Haushalt passiert, ohne die App offen zu haben – vor allem
rund um den Einkauf.

## Entscheidungen

- **Standard-Web-Push mit VAPID**, kein fremder Dienst (Firebase o. ä.). Der Server
  (`web-push`) schickt verschlüsselt an den Push-Dienst des jeweiligen Browsers; der
  sieht nur unlesbare Daten. Schlüssel in der `.env` (`VAPID_*`); ohne Schlüssel gibt
  es in Produktion keine Benachrichtigungen, lokal Wegwerf-Schlüssel.
- **Je Gerät** (ein Abo = ein Browser), an- und abschaltbar unter „Haushalt“, mit
  Auswahl der Arten und Test-Knopf. Gilt für alle Haushalte des Kontos; ein Tipp
  öffnet die App im richtigen Haushalt und Bereich (`/?haushalt=…#plan`). Beim
  Abmelden wird das Gerät abgemeldet.
- **Arten:**
  - 🛒 Neues auf der Liste – gebündelt (90 s je Person): „Anna: Milch, Brot und
    3 weitere“; schon wieder Abgehaktes fällt raus.
  - 🏃 „Anna kauft gerade ein“ – beim ersten Abhaken, dann 2 h Pause je Person.
  - 🍳 Heute im Plan – um 16 Uhr (Berlin), einmal am Tag je Haushalt, mit den Zutaten,
    die dafür noch auf der Liste stehen. Geht an alle, auch an den, der geplant hat.
  - 📖 Neue Rezepte, 👋 neue Mitglieder.
  - 📅 Änderungen am Wochenplan – standardmäßig aus (zu viel Rauschen).
- **Eigene Änderungen melden sich nie** beim Auslöser (auf keinem seiner Geräte).
- **Erkannt wird beim Upload** (`wendeAn` gibt Ereignisse zurück: neu eingefügt
  bzw. abgehakt), nicht über Datenbank-Trigger. Offline Gesammeltes meldet sich, wenn
  das Gerät wieder online ist.
- **Sicherheit:** Abos nur mit Adressen bekannter Push-Dienste (Google, Mozilla,
  Apple, Microsoft) – sonst ließe sich der Server zu Anfragen an beliebige Adressen
  bringen. Höchstens 20 Geräte je Konto; vom Push-Dienst als ungültig gemeldete Abos
  (404/410) werden gelöscht. Die Tabellen `push_abos` und `push_gesendet` werden nicht
  synchronisiert.
- **iPhone:** Push gibt es nur für die zum Home-Bildschirm hinzugefügte App
  (iOS 16.4+); in Safari zeigt die App dafür eine Anleitung.
- **Gebündelt wird im Speicher** – bei einem Neustart des Servers kann eine Sammlung
  verloren gehen. Für Benachrichtigungen ist das vertretbar.
