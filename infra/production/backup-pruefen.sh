#!/usr/bin/env bash
# Probe-Wiederherstellung: spielt ein Backup in eine Wegwerf-Datenbank ein und
# vergleicht die Zeilenzahlen mit der laufenden Datenbank. Ändert nichts an den
# echten Daten. Aufruf: ./backup-pruefen.sh [dump-datei]  (ohne: das neueste)
set -euo pipefail
cd "$(dirname "$0")"

datei="${1:-$(ls -t "${BACKUP_DIR:-$HOME/backups}"/haushalt-*.dump | head -1)}"
probe=haushalt_probe
echo "Prüfe $datei"

psql() { docker compose exec -T postgres sh -c "psql -v ON_ERROR_STOP=1 -U \"\$POSTGRES_USER\" -d ${1} -tAc \"${2}\""; }

psql postgres "DROP DATABASE IF EXISTS $probe" >/dev/null
psql postgres "CREATE DATABASE $probe" >/dev/null
trap 'psql postgres "DROP DATABASE IF EXISTS $probe" >/dev/null' EXIT
docker compose exec -T postgres sh -c "pg_restore -U \"\$POSTGRES_USER\" -d $probe --no-owner --exit-on-error" < "$datei"

# Seit dem Backup kann die laufende Datenbank gewachsen sein – weniger ist ein Fehler.
fehler=0
for tabelle in haushalte haushalt_mitglieder artikel listeneintraege vorratsbuchungen kaeufe rezepte rezept_zutaten gekocht bilder plan_eintraege '"user"'; do
  live=$(psql '"$POSTGRES_DB"' "SELECT count(*) FROM $tabelle")
  probe_n=$(psql $probe "SELECT count(*) FROM $tabelle")
  printf '%-22s Backup %6s   jetzt %6s\n' "$tabelle" "$probe_n" "$live"
  if [ "$probe_n" -gt "$live" ]; then fehler=1; fi
done
[ "$fehler" -eq 0 ] && echo "Wiederherstellung ok." || { echo "Abweichung!" >&2; exit 1; }
