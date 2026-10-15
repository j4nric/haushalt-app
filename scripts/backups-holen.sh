#!/usr/bin/env bash
# Holt die Server-Backups auf diesen Rechner (läuft täglich per launchd, siehe
# docs/betrieb.md). Der verwendete Schlüssel darf auf dem Server nur
# ~/backups lesen (rrsync -ro), sonst nichts.
#
# Warnt per macOS-Mitteilung, wenn das neueste Backup älter als 2 Tage ist
# oder der Server nicht erreichbar war.
set -uo pipefail

SERVER="${HAUSHALT_SERVER:-deploy@62.83.23.90}"
SCHLUESSEL="${HAUSHALT_BACKUP_KEY:-$HOME/.ssh/haushalt-backup}"
ZIEL="${HAUSHALT_BACKUP_ZIEL:-$HOME/Backups/haushalt-app}"
MAX_ALTER_STUNDEN=48

warnen() {
  echo "WARNUNG: $1" >&2
  osascript -e "display notification \"$1\" with title \"Haushalt-App: Backup\"" 2>/dev/null || true
}

mkdir -p "$ZIEL" && chmod 700 "$ZIEL"

# rrsync auf dem Server legt den Pfad fest; hier steht nur "/" als Quelle.
if ! rsync -a --timeout=60 \
  -e "ssh -i $SCHLUESSEL -o BatchMode=yes -o IdentitiesOnly=yes" \
  "$SERVER:/" "$ZIEL/"; then
  warnen "Backups konnten nicht vom Server geholt werden."
  exit 1
fi

# Lokal 30 Tage aufbewahren (auf dem Server sind es 7).
find "$ZIEL" -name 'haushalt-*.dump' -mtime +30 -delete

neuestes=$(ls -t "$ZIEL"/haushalt-*.dump 2>/dev/null | head -1)
if [ -z "$neuestes" ]; then
  warnen "Es gibt noch kein Backup."
  exit 1
fi
alter_stunden=$(( ($(date +%s) - $(stat -f %m "$neuestes")) / 3600 ))
if [ "$alter_stunden" -gt "$MAX_ALTER_STUNDEN" ]; then
  warnen "Das neueste Backup ist ${alter_stunden} Stunden alt."
  exit 1
fi
echo "$(date '+%F %T') ok: $(basename "$neuestes") (${alter_stunden} h alt)"
