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
```

Weitere Befehle (Entwicklungsserver, Tests, Datenbank) folgen mit den nächsten Schritten.
