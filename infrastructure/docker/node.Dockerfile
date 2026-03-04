# Base Node.js Dockerfile for all Node services
# Multi-stage build for minimal production images

# ─── Stage 1: Install dependencies ───
FROM node:22-alpine AS deps
RUN corepack enable && corepack prepare pnpm@10.30.3 --activate
WORKDIR /app

COPY pnpm-workspace.yaml pnpm-lock.yaml package.json turbo.json ./
COPY packages/shared-types/package.json ./packages/shared-types/
COPY packages/shared-utils/package.json ./packages/shared-utils/
COPY packages/tsconfig/package.json ./packages/tsconfig/

# Copy the target service package.json (set via build arg)
ARG SERVICE_NAME
COPY services/${SERVICE_NAME}/package.json ./services/${SERVICE_NAME}/

RUN pnpm install --frozen-lockfile --filter=@assist/${SERVICE_NAME}...

# ─── Stage 2: Build ───
FROM node:22-alpine AS builder
RUN corepack enable && corepack prepare pnpm@10.30.3 --activate
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/shared-types/node_modules ./packages/shared-types/node_modules
COPY --from=deps /app/packages/shared-utils/node_modules ./packages/shared-utils/node_modules
COPY --from=deps /app/services/${SERVICE_NAME}/node_modules ./services/${SERVICE_NAME}/node_modules

COPY pnpm-workspace.yaml pnpm-lock.yaml package.json turbo.json ./
COPY packages/ ./packages/

ARG SERVICE_NAME
COPY services/${SERVICE_NAME}/ ./services/${SERVICE_NAME}/

RUN pnpm turbo run build --filter=@assist/${SERVICE_NAME}

# ─── Stage 3: Production image ───
FROM node:22-alpine AS runner
RUN corepack enable && corepack prepare pnpm@10.30.3 --activate

RUN addgroup --system --gid 1001 assist && \
    adduser --system --uid 1001 assist

WORKDIR /app

ARG SERVICE_NAME
ENV NODE_ENV=production
ENV SERVICE_NAME=${SERVICE_NAME}

COPY --from=builder --chown=assist:assist /app/services/${SERVICE_NAME}/dist ./dist
COPY --from=builder --chown=assist:assist /app/services/${SERVICE_NAME}/package.json ./
COPY --from=builder --chown=assist:assist /app/services/${SERVICE_NAME}/node_modules ./node_modules
COPY --from=builder --chown=assist:assist /app/node_modules/.pnpm ./node_modules/.pnpm

# Copy Prisma files if they exist
COPY --from=builder --chown=assist:assist /app/services/${SERVICE_NAME}/prisma ./prisma 2>/dev/null || true

USER assist

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

CMD ["node", "dist/index.js"]
