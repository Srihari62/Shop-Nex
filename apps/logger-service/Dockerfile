# ---- Base Stage ----
FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV NX_DAEMON=false
RUN corepack enable && corepack prepare pnpm@10.15.1 --activate

# ---- Dependencies Stage ----
FROM base AS deps
WORKDIR /app

# Copy root configurations
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json nx.json ./

# Copy shared packages and the specific app
COPY packages/ ./packages/
COPY apps/logger-service/ ./apps/logger-service/

# Install dependencies for building
RUN pnpm install --node-linker=hoisted --network-concurrency=8 --fetch-retries=5 --filter @eshop/logger-service... --frozen-lockfile

# ---- Build Stage ----
FROM deps AS builder
WORKDIR /app

# Build the application
RUN pnpm nx build @eshop/logger-service --configuration=production

# ---- Production Dependencies Stage ----
FROM base AS prod-deps
WORKDIR /app

# Copy the generated package.json and lockfile from build output
COPY --from=builder /app/apps/logger-service/dist/package.json /app/apps/logger-service/dist/pnpm-lock.yaml ./
RUN pnpm install --node-linker=hoisted --network-concurrency=8 --fetch-retries=5 --prod --frozen-lockfile

# ---- Runner Stage ----
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=6008

RUN apk add --no-cache dumb-init

RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

COPY --from=builder /app/apps/logger-service/dist/main.js ./main.js
COPY --from=prod-deps /app/node_modules ./node_modules

USER nodejs

EXPOSE 6008

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "main.js"]
