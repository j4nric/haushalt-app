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

## Nützliche Befehle auf dem Server

```bash
cd ~/haushalt-app/infra/production
docker compose ps                 # Status aller Dienste
docker compose logs -f app        # Logs der App
docker compose logs -f powersync  # Logs des Sync-Dienstes
```

## Offen: Backups

Noch nicht eingerichtet. Vor dem echten Einsatz mindestens ein tägliches
`pg_dump` der Datenbank `haushalt` auf einen anderen Speicherort (z. B. Hetzner
Storage Box) einplanen.
