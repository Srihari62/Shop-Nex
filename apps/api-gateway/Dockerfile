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
COPY apps/api-gateway/ ./apps/api-gateway/

# Install dependencies for building
RUN pnpm install --node-linker=hoisted --network-concurrency=8 --fetch-retries=5 --filter @eshop/api-gateway... --frozen-lockfile

# ---- Build Stage ----
FROM deps AS builder
WORKDIR /app

# Copy prisma schema
COPY prisma/ ./prisma/
RUN pnpm prisma generate

# Build the application
RUN pnpm nx build @eshop/api-gateway --configuration=production

# ---- Production Dependencies Stage ----
FROM base AS prod-deps
WORKDIR /app

# Copy the generated package.json and lockfile from build output
COPY --from=builder /app/apps/api-gateway/dist/package.json /app/apps/api-gateway/dist/pnpm-lock.yaml ./
RUN pnpm install --node-linker=hoisted --network-concurrency=8 --fetch-retries=5 --prod --frozen-lockfile

# Copy generated prisma client engines
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client

# ---- Runner Stage ----
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

RUN apk add --no-cache dumb-init

RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

COPY --from=builder /app/apps/api-gateway/dist/main.js ./main.js
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma

USER nodejs

EXPOSE 8080

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "main.js"]
