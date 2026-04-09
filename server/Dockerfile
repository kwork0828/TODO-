# ── Build stage ──────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy server deps
COPY server/package*.json ./server/
RUN cd server && npm ci --only=production=false

# Copy shared types and server source
COPY shared/ ./shared/
COPY server/src/ ./server/src/
COPY server/tsconfig.json ./server/

RUN cd server && npm run build

# ── Production stage ──────────────────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

COPY server/package*.json ./server/
RUN cd server && npm ci --only=production

COPY --from=builder /app/server/dist ./server/dist

EXPOSE 5000

CMD ["node", "server/dist/index.js"]
