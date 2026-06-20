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
COPY apps/user-ui/ ./apps/user-ui/

# Install dependencies
RUN pnpm install --node-linker=hoisted --network-concurrency=8 --fetch-retries=5 --filter @eshop/user-ui... --frozen-lockfile

# ---- Build Stage ----
FROM deps AS builder
WORKDIR /app

# Copy prisma schema
COPY prisma/ ./prisma/
RUN pnpm prisma generate

ENV NEXT_PUBLIC_SERVER_URI=https://shopnexnow.store
ENV NEXT_PUBLIC_CHATTING_WEBSOCKET_URI=wss://shopnexnow.store/ws-chatting
ENV NEXT_PUBLIC_CHAATTING_WEBSOCKET_URI=wss://shopnexnow.store/ws-chatting
ENV NEXT_PUBLIC_SELLER_SERVER_URI=https://seller.shopnexnow.store
ENV NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_51PXzbSSGnmKVDMGjMqZWNz1dVlfYkrLFxKz8odWopqSVaZjh6HMA1ykIybHoDmGYbfC35RcmxpfCXDjhzmglqh3T00C3MjQgjL
ENV NODE_ENV=production
RUN pnpm nx build @eshop/user-ui

# ---- Runner Stage ----
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN apk add --no-cache dumb-init

RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

COPY --from=builder --chown=nodejs:nodejs /app/apps/user-ui/.next/standalone ./
COPY --from=builder --chown=nodejs:nodejs /app/apps/user-ui/.next/static ./apps/user-ui/.next/static
COPY --from=builder --chown=nodejs:nodejs /app/apps/user-ui/public ./apps/user-ui/public

USER nodejs

EXPOSE 3000

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "apps/user-ui/server.js"]
