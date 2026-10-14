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

## 1. Server und Domain

- **Server:** ein kleiner VPS mit Ubuntu 24.04 LTS, 2 vCPU und 4 GB RAM reichen
  (z. B. Hetzner CX22 oder CAX11). SSH-Key beim Anlegen hinterlegen.
- **Domain:** eine Domain oder Subdomain (z. B. `haushalt.example.de`) mit einem
  **A-Record** (und ggf. AAAA) auf die IP des Servers.
- **Firewall:** eingehend nur 22 (SSH), 80 und 443 (TCP) sowie 443 (UDP, HTTP/3).

## 2. Server vorbereiten (einmalig, als root)

```bash
# Docker installieren (offizielles Skript)
curl -fsSL https://get.docker.com | sh

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
`/home/deploy/.ssh/authorized_keys` eintragen (`chmod 600`, Besitzer `deploy`).

## 3. App einrichten (einmalig, als deploy)

```bash
git clone https://github.com/j4nric/haushalt-app.git ~/haushalt-app
cd ~/haushalt-app/infra/production
cp .env.example .env
nano .env   # DOMAIN und alle Geheimnisse setzen (Befehle stehen in der Datei)
```

## 4. GitHub einrichten

Unter **Settings → Environments** eine Umgebung `produktion` anlegen und dort setzen:

| Art | Name | Wert |
|---|---|---|
| Variable | `DEPLOY_HOST` | IP oder Hostname des Servers |
| Variable | `DEPLOY_USER` | `deploy` |
| Variable | `DEPLOY_DOMAIN` | z. B. `haushalt.example.de` |
| Secret | `DEPLOY_SSH_KEY` | Inhalt von `haushalt-deploy` (privater Schlüssel) |
| Secret | `DEPLOY_KNOWN_HOSTS` | Ausgabe von `ssh-keyscan <server-ip>` |

Damit der Job überhaupt startet, `DEPLOY_HOST` zusätzlich als **Repository-Variable**
anlegen (Settings → Secrets and variables → Actions → Variables).

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
