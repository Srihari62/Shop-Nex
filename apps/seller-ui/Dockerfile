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
COPY apps/seller-ui/ ./apps/seller-ui/

# Install dependencies
RUN pnpm install --node-linker=hoisted --network-concurrency=8 --fetch-retries=5 --filter @eshop/seller-ui... --frozen-lockfile

# ---- Build Stage ----
FROM deps AS builder
WORKDIR /app

# Copy prisma schema
COPY prisma/ ./prisma/
RUN pnpm prisma generate

ENV NEXT_PUBLIC_SERVER_URI=https://shopnexnow.store/
ENV NEXT_PUBLIC_USER_UI_LINK=https://shopnexnow.store
ENV NEXT_PUBLIC_CHAATTING_WEBSOCKET_URI=wss://shopnexnow.store/ws-chatting
ENV NODE_ENV=production
RUN pnpm nx build @eshop/seller-ui

# ---- Runner Stage ----
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN apk add --no-cache dumb-init

RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

COPY --from=builder --chown=nodejs:nodejs /app/apps/seller-ui/.next/standalone ./
COPY --from=builder --chown=nodejs:nodejs /app/apps/seller-ui/.next/static ./apps/seller-ui/.next/static
COPY --from=builder --chown=nodejs:nodejs /app/apps/seller-ui/public ./apps/seller-ui/public

USER nodejs

EXPOSE 3000

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "apps/seller-ui/server.js"]
