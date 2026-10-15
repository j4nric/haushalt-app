# Produktions-Image: API (gebündelt) + gebautes Frontend + Migrationen.
# Bauen: docker build -t haushalt-app .

# --- Bauen -------------------------------------------------------------------
FROM node:25-slim AS bauen
WORKDIR /app
# Die mit Node 24 gelieferte Corepack-Version kann pnpm 12 nicht starten.
RUN npm install -g corepack@latest && corepack enable

# Erst nur die Paketdateien, damit Docker die Installation cachen kann.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
COPY packages/db/package.json packages/db/
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm --filter @haushalt/web build && pnpm --filter @haushalt/api build

# --- Laufzeit ----------------------------------------------------------------
FROM node:25-slim
ENV NODE_ENV=production \
    API_PORT=3000 \
    FRONTEND_DIR=/app/web \
    MIGRATIONS_DIR=/app/drizzle
WORKDIR /app
COPY --from=bauen /app/apps/api/dist/index.mjs ./index.mjs
COPY --from=bauen /app/apps/web/dist ./web
COPY --from=bauen /app/packages/db/drizzle ./drizzle
USER node
EXPOSE 3000
HEALTHCHECK --interval=10s --timeout=3s --retries=5 \
  CMD ["node", "-e", "fetch('http://localhost:3000/api/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"]
CMD ["node", "index.mjs"]
