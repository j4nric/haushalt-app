# Haushalt-App

Eine gemeinsame App für den Haushalt: Einkaufsliste, Vorrat, Rezepte und Wochenplanung.
Wichtigste Anforderung: Die Einkaufsliste funktioniert **offline** im Supermarkt und
gleicht sich automatisch ab, sobald wieder Netz da ist.

## Ausbaustufen

1. **Einkaufsliste**: geteilt, offline-fähig, mit Login und Haushalt *(in Arbeit)*
2. **Vorrat**: Mengen pro Artikel, „im Laden abgehakt → Vorrat erhöht“
3. **Rezepte**: Zutaten verweisen auf dieselben Artikel
4. **Wochenplanung**

## Stack

| Bereich | Technik |
|---|---|
| Frontend | React, Vite, TanStack Router, Tailwind CSS, shadcn/ui, PWA |
| Offline und Sync | Lokale SQLite im Browser + Sync-Engine (PowerSync, wird im Prototyp geprüft) |
| Backend | Hono, PostgreSQL, Drizzle ORM, Better Auth |
| Qualität | TypeScript (strict), Biome, Vitest, Playwright, GitHub Actions |
| Betrieb | Docker Compose, GitHub Container Registry, VPS |

## Struktur

```
haushalt-app/
├── apps/
│   ├── web/              # React + Vite PWA
│   └── api/              # Hono API
├── packages/
│   └── db/               # Drizzle-Schema, Migrationen, gemeinsame Typen
└── docs/entscheidungen/  # Kurze Notizen zu Architekturentscheidungen
```

## Voraussetzungen

- Node.js 24 (siehe `.nvmrc`)
- pnpm über Corepack: `corepack enable`
- Docker Desktop

## Loslegen

```bash
git clone git@github.com:j4nric/haushalt-app.git
cd haushalt-app
pnpm install
cp .env.example .env   # danach Passwort und Schlüssel in .env eintragen
pnpm infra:up          # startet PostgreSQL und PowerSync
```

## Lokale Infrastruktur

`docker-compose.yml` startet zwei Dienste:

| Dienst | Port | Zweck |
|---|---|---|
| `postgres` | 5432 | App-Datenbank `haushalt` und Sync-Ablage `powersync_storage` |
| `powersync` | 8080 | Sync-Dienst: repliziert Änderungen aus Postgres auf die Geräte |

Konfiguration liegt in `infra/`: `postgres/init/` läuft nur beim ersten Start,
`powersync/service.yaml` ist die Dienstkonfiguration, `powersync/sync-config.yaml`
legt fest, welche Daten synchronisiert werden.

## Befehle

| Befehl | Zweck |
|---|---|
| `pnpm check` | Alles prüfen, was auch die CI prüft (Lint, Typcheck, Tests) |
| `pnpm lint` / `pnpm lint:fix` | Biome: Code prüfen bzw. automatisch formatieren und korrigieren |
| `pnpm typecheck` | TypeScript in allen Paketen prüfen |
| `pnpm test` / `pnpm test:watch` | Vitest einmalig bzw. im Watch-Modus |
| `pnpm infra:up` / `pnpm infra:down` | Postgres und PowerSync starten bzw. stoppen |
| `pnpm infra:logs` | Logs der Dienste live verfolgen |
| `pnpm infra:reset` | Dienste stoppen **und alle lokalen Daten löschen** |

Entwicklungsserver folgen mit den nächsten Schritten.

## Arbeitsweise

`main` ist geschützt: Änderungen kommen nur über Pull Requests, und die CI
(Lint, Typcheck, Tests) muss grün sein. Vor dem Push lokal `pnpm check` laufen lassen.
