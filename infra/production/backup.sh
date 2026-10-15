#!/usr/bin/env bash
# Tägliches Backup der App-Datenbank (läuft auf dem Server als Nutzer deploy,
# gestartet vom systemd-Timer haushalt-backup.timer).
#
# - Vollständiger Dump im pg_dump-Custom-Format (komprimiert, einzeln wiederherstellbar)
# - Wird sofort auf Lesbarkeit geprüft, erst dann unter dem endgültigen Namen abgelegt
# - Dumps älter als AUFBEWAHREN_TAGE werden gelöscht
#
# Nicht gesichert wird powersync_storage: PowerSync baut diesen Zustand aus der
# App-Datenbank selbst neu auf.
set -euo pipefail

ZIEL="${BACKUP_DIR:-$HOME/backups}"
AUFBEWAHREN_TAGE="${AUFBEWAHREN_TAGE:-7}"
cd "$(dirname "$0")"

mkdir -p "$ZIEL"
chmod 700 "$ZIEL"
datei="$ZIEL/haushalt-$(date +%Y-%m-%d_%H%M).dump"
temp="$datei.unfertig"
trap 'rm -f "$temp"' EXIT

# Zugangsdaten nimmt pg_dump aus der Umgebung des Postgres-Containers.
docker compose exec -T postgres sh -c 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" --format=custom' > "$temp"

# Prüfen: Lässt sich das Inhaltsverzeichnis lesen und sind unsere Tabellen drin?
inhalt=$(docker compose exec -T postgres pg_restore --list < "$temp")
for tabelle in haushalte listeneintraege artikel rezepte rezept_zutaten bilder plan_eintraege user; do
  if ! grep -q "TABLE DATA public $tabelle " <<<"$inhalt"; then
    echo "Backup unvollständig: Tabelle $tabelle fehlt" >&2
    exit 1
  fi
done

chmod 600 "$temp"
mv "$temp" "$datei"
find "$ZIEL" -name 'haushalt-*.dump' -mtime +"$AUFBEWAHREN_TAGE" -delete

echo "Backup erstellt: $datei ($(du -h "$datei" | cut -f1))"
