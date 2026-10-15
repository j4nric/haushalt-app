# Betrieb: Server einrichten und ausrollen

Die App läuft auf einem einzelnen Server mit Docker Compose
([`infra/production/`](../infra/production/)):

```
Internet ──HTTPS──▶ Caddy ──┬── /powersync/* ──▶ PowerSync ──┐
                            └── alles andere ──▶ App (API + Frontend)
                                                     │        │
                                                     ▼        ▼
                                                   PostgreSQL ◀┘
```

Nach jedem Merge auf `main` baut GitHub Actions das Image
`ghcr.io/j4nric/haushalt-app`, und der Job „Auf Server ausrollen“ startet es auf
dem Server, sobald die Variablen unten gesetzt sind.

## Aktueller Stand

| | |
|---|---|
| Server | Netcup VPS 500, Debian 13, 2 vCPU, 4 GB RAM (+ 2 GB Swap), IPv4 `62.83.23.90` |
| Adresse | https://62-83-23-90.sslip.io (sslip.io löst den Namen auf die IP auf, kostenlos) |
| Zugang | SSH nur mit Schlüssel; Nutzer `root` und `deploy` (Docker-Gruppe) |
| Firewall | ufw: eingehend nur 22/tcp, 80/tcp, 443/tcp, 443/udp |
| Updates | unattended-upgrades spielt Sicherheitsupdates automatisch ein |

## 1. Server und Domain

- **Server:** ein kleiner VPS mit Debian 13 oder Ubuntu 24.04, mindestens 2 vCPU und
  4 GB RAM (PowerSync braucht bis zu 1 GB). **Mit IPv4-Adresse:** GitHub und die
  GitHub-Actions-Runner sind nur per IPv4 erreichbar.
- **Domain:** ohne eigene Domain `<ip-mit-bindestrichen>.sslip.io`. Mit eigener Domain
  einen **A-Record** auf die IP des Servers setzen und `DOMAIN` in der Server-`.env`
  sowie die Variable `DEPLOY_DOMAIN` anpassen. Achtung: Die lokalen Daten im Browser
  hängen an der Adresse; nach einem Umzug einmal neu anmelden.
- **Firewall:** eingehend nur 22 (SSH), 80 und 443 (TCP) sowie 443 (UDP, HTTP/3).

## 2. Server vorbereiten (einmalig, als root)

```bash
# Docker installieren (offizielles Skript)
curl -fsSL https://get.docker.com | sh

# Firewall
apt-get install -y ufw
ufw allow 22/tcp && ufw allow 80/tcp && ufw allow 443/tcp && ufw allow 443/udp
ufw --force enable

# Eigener Nutzer für Deployments, darf Docker verwenden
adduser --disabled-password --gecos "" deploy
usermod -aG docker deploy
mkdir -p /home/deploy/.ssh && chmod 700 /home/deploy/.ssh
```

Für GitHub Actions ein **eigenes** Schlüsselpaar erzeugen (lokal, ohne Passphrase):

```bash
ssh-keygen -t ed25519 -N "" -C "github-actions-deploy" -f haushalt-deploy
```

Den Inhalt von `haushalt-deploy.pub` auf dem Server in
`/home/deploy/.ssh/authorized_keys` eintragen (`chmod 600`, Besitzer `deploy`), mit
vorangestelltem `no-port-forwarding,no-agent-forwarding,no-X11-forwarding `.

Passwort-Anmeldung abschalten (`/etc/ssh/sshd_config.d/10-haerten.conf`), **erst
nachdem** die Anmeldung per Schlüssel funktioniert:

```
PasswordAuthentication no
KbdInteractiveAuthentication no
PermitRootLogin prohibit-password
```

Danach `sshd -t && systemctl reload ssh`.

## 3. App einrichten (einmalig, als deploy)

```bash
git clone https://github.com/j4nric/haushalt-app.git ~/haushalt-app
cd ~/haushalt-app/infra/production
cp .env.example .env
nano .env   # DOMAIN und alle Geheimnisse setzen (Befehle stehen in der Datei)
```

## 4. GitHub einrichten

Unter **Settings → Secrets and variables → Actions** auf Repository-Ebene:

| Art | Name | Wert |
|---|---|---|
| Variable | `DEPLOY_HOST` | IP oder Hostname des Servers |
| Variable | `DEPLOY_USER` | `deploy` |
| Variable | `DEPLOY_DOMAIN` | z. B. `62-83-23-90.sslip.io` |
| Secret | `DEPLOY_SSH_KEY` | Inhalt von `haushalt-deploy` (privater Schlüssel) |
| Secret | `DEPLOY_KNOWN_HOSTS` | Ausgabe von `ssh-keyscan <server-ip>` (Fingerabdruck vorher prüfen!) |

Danach rollt jeder Merge auf `main` automatisch aus. Den ersten Lauf kann man unter
Actions → CI → „Re-run all jobs“ auf dem letzten `main`-Commit anstoßen.

## Überwachung

Der Workflow `.github/workflows/ueberwachung.yml` prüft alle 30 Minuten:

- App und Datenbank (`/api/health`), Sync-Dienst (`/powersync/probes/liveness`) –
  mit drei Versuchen, damit ein Deploy keinen Fehlalarm auslöst
- HTTPS-Zertifikat (mindestens 14 Tage gültig)
- per SSH: neuestes Backup höchstens 26 h alt, Festplatte unter 85 %, alle vier
  Container laufen

Bei einem Problem öffnet er ein Issue mit dem Label `ausfall` – GitHub benachrichtigt
darüber (App bzw. E-Mail, je nach Einstellung „Watching“). Ändern sich die Probleme,
kommt ein Kommentar dazu; ist alles wieder gut, schließt er das Issue selbst.
Von Hand starten: Actions → Überwachung → „Run workflow“.

GitHub pausiert geplante Workflows, wenn 60 Tage nichts im Repository passiert –
dann in Actions wieder aktivieren.

## Updates der Abhängigkeiten

Dependabot (`.github/dependabot.yml`) öffnet jeden Montag um 6 Uhr Pull Requests:

- **npm-Pakete:** kleine Updates (Minor/Patch) gesammelt in einem PR, große
  Versionssprünge einzeln – die lesen sich am besten mit den Release Notes.
- **GitHub Actions** gesammelt, **Docker-Images** (Node, PowerSync, Caddy) einzeln.
- **Postgres** nur innerhalb der Hauptversion: Von 18 auf 19 müssen die Daten
  umziehen (Dump einspielen) – das bleibt Handarbeit.
- **Sicherheitslücken** meldet GitHub sofort und Dependabot öffnet dafür einen
  eigenen PR, unabhängig vom Montag.

Jeder PR läuft durch die CI (Lint, Typcheck, Tests, E2E). Grün → mergen; nach dem
Merge rollt die CI wie gewohnt aus. Schlägt die CI fehl, braucht das Update Anpassungen.

## Admin-Panel

Wer in der App unter „Haushalt“ alle Nutzer und Haushalte sehen darf, steht in
`infra/production/.env`:

```bash
ADMIN_EMAILS=j4n.ric@gmail.com
```

Nach einer Änderung: `docker compose up -d app`.

## Fotos aufräumen

Das API löscht kurz nach dem Start und dann täglich Fotos, die kein Rezept mehr als
Bild verwendet (ersetzt, entfernt, Rezept gelöscht) und die älter als 24 Stunden
sind. Die Frist schützt frisch hochgeladene Fotos, deren Rezept noch nicht
gespeichert oder noch nicht vom Gerät hochgeladen ist. Im Admin-Panel stehen die
Zahlen; „Jetzt aufräumen“ löscht sofort (Frist 1 Stunde). Im Log:
`docker compose logs app | grep Aufgeräumt`.

## Nützliche Befehle auf dem Server

```bash
cd ~/haushalt-app/infra/production
docker compose ps                 # Status aller Dienste
docker compose logs -f app        # Logs der App
docker compose logs -f powersync  # Logs des Sync-Dienstes
```

## Backups

Zwei Stufen: täglich ein Dump auf dem Server, täglich eine Kopie auf einen anderen
Rechner (hier: Jans Mac). Gesichert wird die App-Datenbank `haushalt` – mit allen
Listen, Vorräten, Rezepten, Fotos und Plänen. `powersync_storage` nicht: Den Zustand
baut PowerSync aus der App-Datenbank selbst neu auf.

| | Wo | Wann | Aufbewahrung |
|---|---|---|---|
| Dump | Server, `/home/deploy/backups/haushalt-JJJJ-MM-TT_HHMM.dump` | täglich 03:30 (systemd-Timer, holt Verpasstes nach) | 7 Tage |
| Kopie | Mac, `~/Backups/haushalt-app/` | täglich 10:00 (launchd, holt nach dem Aufwachen nach) | 30 Tage |

- `infra/production/backup.sh` erzeugt den Dump (`pg_dump`, Custom-Format), prüft ihn
  mit `pg_restore --list` auf die wichtigsten Tabellen und legt ihn erst dann ab
  (Rechte 600).
- `scripts/backups-holen.sh` holt per `rsync` ab und meldet sich per Mitteilung, wenn
  das Abholen scheitert oder das neueste Backup älter als 48 Stunden ist. Log:
  `~/Library/Logs/haushalt-backups.log`.
- Der Mac nutzt einen **eigenen Schlüssel** `~/.ssh/haushalt-backup`, der auf dem
  Server nur lesen darf, und nur `~/backups`:
  `restrict,command="/usr/bin/rrsync -ro /home/deploy/backups" ssh-ed25519 …`
  (in `/home/deploy/.ssh/authorized_keys`; braucht das Paket `rsync`).

### Einrichten (einmalig)

Auf dem Server als root:

```bash
apt-get install -y rsync
cp /home/deploy/haushalt-app/infra/production/systemd/haushalt-backup.* /etc/systemd/system/
systemctl daemon-reload
systemctl enable --now haushalt-backup.timer
systemctl start haushalt-backup.service   # einmal sofort
```

Auf dem Mac (im Repository):

```bash
ssh-keygen -t ed25519 -N "" -C haushalt-backup -f ~/.ssh/haushalt-backup
# öffentlichen Schlüssel mit der restrict/rrsync-Zeile oben beim Nutzer deploy eintragen
sed -e "s#REPO#$PWD#" -e "s#HOME#$HOME#g" scripts/de.haushalt-app.backups.plist \
  > ~/Library/LaunchAgents/de.haushalt-app.backups.plist
launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/de.haushalt-app.backups.plist
```

### Prüfen

```bash
systemctl list-timers haushalt-backup.timer          # Server: nächster Lauf
journalctl -u haushalt-backup.service -n 20          # Server: letzte Läufe
~/haushalt-app/infra/production/backup-pruefen.sh    # Server: Probe-Wiederherstellung
```

`backup-pruefen.sh` spielt das neueste Backup in eine Wegwerf-Datenbank ein,
vergleicht die Zeilenzahlen mit der laufenden Datenbank und löscht sie wieder.
Am besten ab und zu laufen lassen – ein Backup ist erst gut, wenn es sich
wiederherstellen lässt.

### Im Ernstfall wiederherstellen

```bash
cd ~/haushalt-app/infra/production
docker compose stop app powersync
docker compose exec -T postgres sh -c 'dropdb -U "$POSTGRES_USER" "$POSTGRES_DB" && createdb -U "$POSTGRES_USER" "$POSTGRES_DB"'
docker compose exec -T postgres sh -c 'pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" --no-owner' < ~/backups/haushalt-JJJJ-MM-TT_HHMM.dump
docker compose up -d
```

Ein Backup vom Mac vorher mit `scp` nach `~/backups/` auf den Server kopieren.
Danach synchronisieren sich die Geräte neu; was ein Gerät seit dem Backup offline
geändert hat, lädt es beim nächsten Verbinden hoch.
