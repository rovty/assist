# Sprint 1 — Foundation & Core Services

## Assist by Rovty | AI Conversational Platform

**Sprint Duration:** 2 weeks  
**Status:** ✅ Complete  
**Version:** 0.1.0  

---

## Table of Contents

1. [Sprint Overview](#1-sprint-overview)
2. [Architecture Decisions](#2-architecture-decisions)
3. [Monorepo Structure](#3-monorepo-structure)
4. [Tech Stack & Rationale](#4-tech-stack--rationale)
5. [Infrastructure](#5-infrastructure)
6. [Auth Service](#6-auth-service)
7. [Tenant Service](#7-tenant-service)
8. [Shared Packages](#8-shared-packages)
9. [Authentication Flow](#9-authentication-flow)
10. [Multi-Tenancy Flow](#10-multi-tenancy-flow)
11. [Database Architecture](#11-database-architecture)
12. [API Reference](#12-api-reference)
13. [CI/CD Pipeline](#13-cicd-pipeline)
14. [Setup & Running Guide](#14-setup--running-guide)
15. [Testing Guide](#15-testing-guide)
16. [What's Next (Sprint 2)](#16-whats-next-sprint-2)

---

## 1. Sprint Overview

### Objectives

Sprint 1 establishes the foundational infrastructure for the Assist platform — a world-class AI conversational platform competing with Intercom, Zendesk, Drift, and Tidio.

### Deliverables

| # | Deliverable | Status |
|---|-------------|--------|
| 1 | Monorepo setup (Turborepo + pnpm workspaces) | ✅ |
| 2 | Shared packages (types, utils, tsconfig, eslint) | ✅ |
| 3 | Docker Compose local infrastructure | ✅ |
| 4 | Base Dockerfiles (Node.js, Python) | ✅ |
| 5 | Auth Service (JWT, RBAC, API keys, refresh tokens) | ✅ |
| 6 | Tenant Service (multi-tenancy, plans, invitations) | ✅ |
| 7 | GitHub Actions CI pipeline | ✅ |
| 8 | Developer setup scripts & documentation | ✅ |

### Why These First?

Every other service in the platform depends on **authentication** and **multi-tenancy**. Without knowing *who* is making a request and *which workspace* they belong to, no other feature (conversations, AI, analytics) can function. This is why auth + tenant are Sprint 1 — they're the **zero-dependency foundation**.

---

## 2. Architecture Decisions

### 2.1 Why Microservices?

The platform targets **enterprise customers** with 100K+ concurrent conversations. A monolith cannot:
- Scale the AI engine independently from chat routing
- Deploy NLP model updates without restarting the whole platform
- Isolate failures (a Kafka consumer crash shouldn't take down the REST API)

Each service owns its domain, database schema, and can be deployed independently.

### 2.2 Why Turborepo + pnpm (Not Nx or Lerna)?

| Tool | Pros | Why We Chose/Rejected |
|------|------|----------------------|
| **Turborepo** ✅ | Zero-config, fast, built by Vercel | Simplest setup, great caching, task orchestration |
| Nx | More features, generators | Overkill for our needs, steeper learning curve |
| Lerna | Mature | Slow, no built-in task caching, effectively deprecated |

Turborepo gives us:
- **Task dependency graph** — `build` runs `^build` (dependencies first)
- **Remote caching** — CI builds skip unchanged packages
- **Parallel execution** — independent tasks run simultaneously

### 2.3 Why Fastify (Not Express)?

| Framework | Req/sec (benchmark) | Why |
|-----------|-------------------|-----|
| **Fastify 5** ✅ | ~77,000 | 2x Express, built-in schema validation, TypeScript-first |
| Express | ~35,000 | Legacy, no built-in validation, middleware soup |
| Hono | ~100,000 | Too new, smaller ecosystem for enterprise features |

Fastify provides:
- **JSON Schema validation** via Zod integration
- **Lifecycle hooks** for clean middleware (`preHandler`, `onSend`)
- **Built-in Swagger** generation from route schemas
- **Plugin architecture** — each route file is a self-contained plugin

### 2.4 Why Prisma (Not Drizzle, TypeORM, or Knex)?

| ORM | Why Chose/Rejected |
|-----|-------------------|
| **Prisma 6** ✅ | Best DX, declarative schema, auto-generated types, migrations |
| Drizzle | Great performance but less mature migration tooling |
| TypeORM | Decorator-heavy, poor TypeScript inference |
| Knex | Query builder only, no type safety for models |

Key Prisma features we use:
- **Custom output paths** — each service generates its own Prisma Client to `src/generated/prisma/` to avoid conflicts
- **PostgreSQL extensions** — `citext` for case-insensitive emails via `previewFeatures = ["postgresqlExtensions"]`
- **Schema-per-service** — auth uses `?schema=auth`, tenant uses `?schema=tenant` in the same PostgreSQL database

### 2.5 Why PostgreSQL + MongoDB + Redis (Polyglot Persistence)?

| Database | Purpose | Why This One |
|----------|---------|-------------|
| **PostgreSQL 16** | Auth, tenants, billing, structured data | ACID transactions, JSON support, extensions (citext, pgcrypto) |
| **MongoDB 7** | Conversations, messages, knowledge base | Flexible schema for varying message types (text, image, file, AI) |
| **Redis 7** | Caching, sessions, token blacklist, real-time presence | Sub-millisecond reads, pub/sub for WebSocket fan-out |
| **Kafka (KRaft)** | Event streaming between services | Guaranteed delivery, replay capability, decoupled services |
| **ClickHouse 24** | Analytics, reporting | Column-oriented, 100x faster than PostgreSQL for aggregations |

### 2.6 Why Separate Prisma Clients Per Service?

When two services share `@prisma/client`, the last `prisma generate` overwrites the first. This caused our initial build failures. Solution:

```prisma
generator client {
  provider = "prisma-client-js"
  output   = "../src/generated/prisma"  // Service-local output
}
```

Each service gets its own type-safe client matching its own schema. This also enables independent schema evolution — auth can add columns without touching tenant's Prisma types.

---

## 3. Monorepo Structure

```
assist/
├── apps/                          # Frontend applications (Sprint 3+)
│   ├── web/                       # Next.js customer dashboard
│   ├── widget/                    # Embeddable chat widget (Preact)
│   └── admin/                     # Internal admin panel
├── services/                      # Backend microservices
│   ├── auth/                      # ✅ Sprint 1 — Authentication & authorization
│   ├── tenant/                    # ✅ Sprint 1 — Multi-tenant workspace mgmt
│   ├── conversation/              # Sprint 2 — Real-time chat engine
│   ├── ai-engine/                 # Sprint 2 — Azure OpenAI integration
│   ├── knowledge-base/            # Sprint 3 — RAG document processing
│   ├── lead/                      # Sprint 3 — Lead capture & scoring
│   ├── notification/              # Sprint 2 — Email, push, webhooks
│   ├── analytics/                 # Sprint 3 — ClickHouse aggregations
│   ├── billing/                   # Sprint 4 — Stripe subscriptions
│   ├── channel/                   # Sprint 3 — WhatsApp, Messenger, etc.
│   ├── bot-builder/               # Sprint 3 — Visual flow builder
│   ├── integration/               # Sprint 4 — CRM, Slack connectors
│   ├── media/                     # Sprint 3 — File upload (Azure Blob)
│   ├── search/                    # Sprint 3 — Full-text search
│   ├── scheduler/                 # Sprint 4 — Cron jobs, reminders
│   └── api-gateway/               # Sprint 2 — Kong/custom gateway
├── packages/                      # Shared code
│   ├── shared-types/              # ✅ TypeScript interfaces & enums
│   ├── shared-utils/              # ✅ Logger, errors, ID gen, env loader
│   ├── tsconfig/                  # ✅ Base TS configs (node, react)
│   └── eslint-config/             # ✅ Shared linting rules
├── infrastructure/                # DevOps
│   └── docker/                    # Base Dockerfiles (Node, Python)
├── scripts/                       # Dev tooling
│   ├── setup.sh                   # One-command dev setup
│   └── init-db.sql                # PostgreSQL initialization
├── docker-compose.infra.yml       # ✅ Local dev infrastructure
├── turbo.json                     # ✅ Task orchestration
├── pnpm-workspace.yaml            # ✅ Workspace config
└── package.json                   # ✅ Root scripts
```

### Why This Layout?

- **`services/` separate from `apps/`** — Backend scales with Kubernetes, frontend deploys to Vercel/CDN
- **`packages/`** — Shared code is consumed via pnpm workspace protocol (`workspace:*`), no publishing needed
- **One DB schema per service** — Auth owns its tables, Tenant owns its tables. No cross-service joins.

---

## 4. Tech Stack & Rationale

### Runtime & Language

| Technology | Version | Purpose |
|-----------|---------|---------|
| Node.js | 22 LTS | Runtime for all TypeScript services |
| TypeScript | 5.9 | Type safety across the entire monorepo |
| pnpm | 10.30 | Fast, disk-efficient package manager with workspaces |

### Backend Framework

| Technology | Version | Purpose |
|-----------|---------|---------|
| Fastify | 5.2 | HTTP framework (2x faster than Express) |
| @fastify/cors | 11.0 | Cross-origin resource sharing |
| @fastify/helmet | 13.0 | Security headers |
| @fastify/rate-limit | 10.2 | API rate limiting |
| @fastify/swagger | 9.4 | OpenAPI spec generation |

### Database & ORM

| Technology | Version | Purpose |
|-----------|---------|---------|
| Prisma | 6.19 | Type-safe ORM with migrations |
| PostgreSQL | 16 | Primary relational database |
| Redis (ioredis) | 7 | Caching, token blacklist |

### Authentication

| Technology | Purpose |
|-----------|---------|
| jsonwebtoken | JWT access token signing/verification |
| bcryptjs | Password hashing (12 rounds) |
| crypto (Node.js) | Refresh token generation (64 random bytes) |

### Validation & Utilities

| Technology | Purpose |
|-----------|---------|
| Zod | Runtime schema validation (env vars, request bodies) |
| Pino | Structured JSON logging |

### Build & CI

| Technology | Purpose |
|-----------|---------|
| Turborepo | Monorepo task orchestration |
| tsx | TypeScript execution in dev (no compile step) |
| Vitest | Unit & integration testing |
| GitHub Actions | CI/CD pipeline |
| Docker | Container builds |

---

## 5. Infrastructure

### 5.1 Docker Compose Services

All infrastructure runs locally via `docker-compose.infra.yml`:

| Container | Image | Port | Purpose | Healthcheck |
|-----------|-------|------|---------|-------------|
| assist-postgres | postgres:16-alpine | 5432 | Auth + Tenant databases | `pg_isready` |
| assist-mongodb | mongo:7 | 27017 | Conversations (Sprint 2+) | `mongosh ping` |
| assist-redis | redis:7-alpine | 6379 | Caching, token blacklist | `redis-cli ping` |
| assist-kafka | apache/kafka:latest | 9092, 9094 | Event streaming (Sprint 2+) | `kafka-topics.sh --list` |
| assist-kafka-ui | provectuslabs/kafka-ui | 8080 | Kafka topic browser | - |
| assist-clickhouse | clickhouse-server:24 | 8123, 9000 | Analytics (Sprint 3+) | `wget ping` |
| assist-mailhog | mailhog/mailhog | 1025, 8025 | Email testing | - |

### 5.2 PostgreSQL Schema Isolation

Instead of separate PostgreSQL instances per service, we use **schema-level isolation** within a single database:

```
assist (database)
├── auth         (schema) — users, tenants (minimal), refresh_tokens, api_keys, audit_logs
├── tenant       (schema) — tenants (full), settings, members, invitations, plans, subscriptions
├── leads        (schema) — Sprint 3
├── billing      (schema) — Sprint 4
└── knowledge_base (schema) — Sprint 3
```

**Why?** Single PostgreSQL instance is simpler for development. In production, each service can point to its own RDS instance if needed — the connection string is the only thing that changes.

### 5.3 Kafka Configuration (KRaft Mode)

Kafka runs in **KRaft mode** (no Zookeeper dependency):

- **Internal listener:** `kafka:9092` (for service-to-service within Docker)
- **External listener:** `localhost:9094` (for local development)
- **Cluster ID:** `assist-local-cluster-001`

### 5.4 Dev Credentials

All local services use consistent credentials:

| Service | Username | Password |
|---------|----------|----------|
| PostgreSQL | `assist` | `assist_dev_password` |
| MongoDB | `assist` | `assist_dev_password` |
| ClickHouse | `assist` | `assist_dev_password` |

> ⚠️ These are **development only**. Production uses Azure Key Vault / environment secrets.

---

## 6. Auth Service

### 6.1 Overview

**Port:** 3001  
**Schema:** `auth`  
**Responsibilities:** User registration, login, JWT management, refresh token rotation, API key management, RBAC

### 6.2 Database Models

```
┌────────────────┐     ┌────────────────┐
│     Tenant     │────<│      User      │
│                │     │                │
│ id (uuid)      │     │ id (uuid)      │
│ name           │     │ email (citext) │
│ slug (unique)  │     │ passwordHash   │
│ createdAt      │     │ name           │
│ updatedAt      │     │ role (enum)    │
└────────────────┘     │ status (enum)  │
        │              │ tenantId (fk)  │
        │              │ ...            │
        │              └────────────────┘
        │                    │    │
        │                    │    │
        ▼                    ▼    ▼
┌────────────────┐  ┌──────────────┐  ┌────────────────┐
│    ApiKey      │  │ RefreshToken │  │   AuditLog     │
│                │  │              │  │                │
│ keyHash        │  │ token (unique│  │ action         │
│ keyPrefix      │  │ userId (fk)  │  │ resource       │
│ scopes[]       │  │ expiresAt    │  │ metadata       │
│ createdBy (fk) │  │ revokedAt    │  │ tenantId       │
│ tenantId (fk)  │  │ userAgent    │  │ userId         │
└────────────────┘  └──────────────┘  └────────────────┘
```

### 6.3 Roles & Permissions (RBAC)

| Role | Users | API Keys | Settings | Billing |
|------|-------|----------|----------|---------|
| **OWNER** | Full CRUD | Full CRUD | Full | Full |
| **ADMIN** | View, Update roles | Full CRUD | Full | View |
| **AGENT** | View self | None | None | None |
| **VIEWER** | View self | None | None | None |

### 6.4 Service Architecture

```
services/auth/
├── prisma/
│   ├── schema.prisma              # Database models
│   └── migrations/                # Version-controlled schema changes
│       └── 20260304202236_init/
├── src/
│   ├── index.ts                   # Fastify server bootstrap
│   ├── env.ts                     # Zod-validated environment variables
│   ├── generated/prisma/          # Auto-generated Prisma Client
│   ├── utils/
│   │   ├── db.ts                  # Prisma client singleton (with slow query logging)
│   │   └── redis.ts               # ioredis client
│   ├── schemas/
│   │   ├── auth.schema.ts         # Zod schemas for registration/login
│   │   └── api-key.schema.ts      # Zod schemas for API key operations
│   ├── services/
│   │   ├── auth.service.ts        # Core auth logic (register, login, refresh, logout)
│   │   └── api-key.service.ts     # API key CRUD + verification
│   ├── middleware/
│   │   ├── auth.ts                # JWT authentication + role authorization
│   │   └── error-handler.ts       # Centralized error handling
│   └── routes/
│       ├── auth.routes.ts         # /auth/* endpoints
│       ├── user.routes.ts         # /users/* endpoints
│       ├── api-key.routes.ts      # /api-keys/* endpoints
│       └── health.routes.ts       # /health endpoint
├── tests/
│   └── auth.test.ts               # Vitest tests
├── package.json
└── tsconfig.json
```

### 6.5 Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 3001 | HTTP server port |
| `DATABASE_URL` | — | PostgreSQL connection string with `?schema=auth` |
| `REDIS_URL` | — | Redis connection string |
| `JWT_SECRET` | — | HMAC secret for JWT signing (min 32 chars) |
| `JWT_EXPIRY` | `15m` | Access token lifetime |
| `REFRESH_TOKEN_EXPIRY` | `7d` | Refresh token lifetime |
| `BCRYPT_ROUNDS` | `12` | Password hashing cost factor |
| `CORS_ORIGINS` | `http://localhost:3000` | Allowed CORS origins |

### 6.6 Plugins & Middleware Stack

```
Request → CORS → Helmet → Rate Limit (100/min) → Route Handler
                                                        │
                                      ┌─────────────────┤
                                      │ Public routes    │ Protected routes
                                      │ (register,login) │ (me, users, api-keys)
                                      │                  │
                                      │           authenticate() middleware
                                      │           → Extract Bearer token
                                      │           → Check Redis blacklist
                                      │           → jwt.verify()
                                      │           → Set request.user
                                      │                  │
                                      │           authorize('OWNER','ADMIN')
                                      │           → Check role permissions
                                      │                  │
                                      ▼                  ▼
                              errorHandler() ← catches all errors
                              → AppError → structured JSON response
                              → Zod validation → 400 with details
                              → Rate limit → 429
                              → Unknown → 500 (sanitized in production)
```

---

## 7. Tenant Service

### 7.1 Overview

**Port:** 3002  
**Schema:** `tenant`  
**Responsibilities:** Workspace management, settings, member management, invitations, plans, usage tracking

### 7.2 Database Models

```
┌─────────────┐     ┌──────────────────┐     ┌──────────────┐
│    Plan     │────<│     Tenant       │────<│  TenantMember│
│             │     │                  │     │              │
│ tier        │     │ status (enum)    │     │ userId       │
│ priceMonthly│     │ name, slug       │     │ role         │
│ priceYearly │     │ planId (fk)      │     │ joinedAt     │
│ limits...   │     └──────────────────┘     └──────────────┘
│ features[]  │            │    │    │
└─────────────┘            │    │    │
                           ▼    ▼    ▼
              ┌───────────────┐ ┌──────────────┐ ┌────────────────┐
              │TenantSettings │ │ Subscription │ │  Invitation    │
              │               │ │              │ │                │
              │ branding      │ │ stripeId     │ │ email          │
              │ AI config     │ │ status       │ │ token (unique) │
              │ widget config │ │ period       │ │ status (enum)  │
              │ notifications │ │ trialEndsAt  │ │ expiresAt      │
              └───────────────┘ └──────────────┘ └────────────────┘
```

### 7.3 Pricing Plans (Seeded)

| Plan | Monthly | Yearly | AI Messages | Contacts | Agents | Channels |
|------|---------|--------|-------------|----------|--------|----------|
| **Starter** | $29 | $278 | 1,000/mo | 500 | 1 | 3 |
| **Growth** | $79 | $758 | 5,000/mo | 2,500 | 3 | 6 |
| **Business** | $199 | $1,908 | 20,000/mo | 10,000 | 10 | 10 |
| **Enterprise** | Custom | Custom | Unlimited | Unlimited | 999 | 20 |

### 7.4 Authentication Model

The tenant service does **not** verify JWTs itself. It expects an **API Gateway** (Sprint 2) to sit in front:

```
Client → API Gateway → JWT Verified → Headers injected → Tenant Service
                                           │
                                    X-Tenant-ID: uuid
                                    X-User-ID: uuid
                                    X-User-Role: OWNER
```

This pattern allows the tenant service to be stateless regarding auth — it trusts the gateway.

### 7.5 Tenant Settings Structure

| Category | Settings |
|----------|----------|
| **Branding** | `logoUrl`, `primaryColor` (#6366f1), `widgetPosition` (bottom-right) |
| **AI Config** | `aiEnabled`, `aiTone` (friendly), `confidenceThreshold` (0.7), `maxTokens` (1024), `systemPrompt` |
| **Widget** | `widgetEnabled`, `allowedDomains[]`, `preChatForm`, `offlineFormEnabled` |
| **Notifications** | `emailOnNewConversation`, `emailOnEscalation`, `pushEnabled` |
| **Messages** | `welcomeMessage`, `offlineMessage` |

---

## 8. Shared Packages

### 8.1 @assist/shared-types

Centralized TypeScript interfaces and enums consumed by all services:

```typescript
// Enums
UserRole    → OWNER | ADMIN | AGENT | VIEWER
UserStatus  → ACTIVE | INACTIVE | PENDING | SUSPENDED

// Interfaces
User        → { id, email, name, role, status, avatarUrl, tenantId, ... }
Tenant      → { id, name, slug, status, plan, settings, ... }
JwtPayload  → { sub, tenantId, email, role, iat, exp }
Conversation → { id, tenantId, contactId, assigneeId, status, channel, ... }
Message     → { id, conversationId, role (user|assistant|agent|system), content, ... }

// Event Types (Kafka)
BaseEvent   → { eventId, timestamp, tenantId, source, version }
AssistEvent → UserCreated | ConversationStarted | MessageSent | AIResponseGenerated | ...

// Response Wrappers
ApiResponse<T>       → { success: boolean, data?: T, error?: { code, message, details } }
PaginatedResponse<T> → { data: T[], pagination: { page, pageSize, total, totalPages } }
HealthCheckResponse  → { status, service, version, uptime, timestamp, checks }
```

### 8.2 @assist/shared-utils

Reusable utilities:

| Export | Purpose |
|--------|---------|
| `createLogger(name)` | Creates a Pino logger with structured output |
| `loadEnv(zodSchema)` | Validates `process.env` against a Zod schema, throws descriptive errors |
| `baseEnvSchema` | Common env vars: `NODE_ENV`, `LOG_LEVEL` |
| `generateId(prefix, size)` | Generates `usr_abc123` style IDs using `crypto.randomBytes` |
| `generateApiKey()` | Generates `ak_...` (40 chars) secure API keys |
| `getKeyPrefix(key, length)` | Returns first N chars for display |
| `success<T>(data)` | Wraps data in `{ success: true, data }` |
| `error(code, message)` | Wraps in `{ success: false, error: { code, message } }` |
| `AppError` | Base error class with `statusCode`, `code`, `toResponse()` |
| `NotFoundError` | 404 — `new NotFoundError('User', userId)` |
| `BadRequestError` | 400 |
| `UnauthorizedError` | 401 |
| `ForbiddenError` | 403 |
| `ConflictError` | 409 |
| `RateLimitError` | 429 |

### 8.3 @assist/tsconfig

Shared TypeScript configurations:

- **base.json** — Strict mode, ES2022 target, `noUnusedLocals`, `noUnusedParameters`
- **node.json** — Extends base, `module: "Node16"`, `moduleResolution: "Node16"`
- **react.json** — Extends base, JSX support, DOM lib (for frontend apps)

---

## 9. Authentication Flow

### 9.1 Registration Flow

```
                         POST /auth/register
                         { email, password, name, tenantName }
                                    │
                                    ▼
                    ┌──── Check email uniqueness ────┐
                    │   prisma.user.findUnique()     │
                    └────────────────────────────────┘
                                    │ (unique)
                                    ▼
                    ┌──── Generate tenant slug ──────┐
                    │   "My Workspace" → "my-workspace" │
                    │   Check slug uniqueness         │
                    └────────────────────────────────┘
                                    │
                                    ▼
                    ┌──── Hash password ─────────────┐
                    │   bcrypt.hash(password, 12)    │
                    └────────────────────────────────┘
                                    │
                                    ▼
                    ┌──── Transaction ───────────────┐
                    │   1. Create Tenant (name, slug)│
                    │   2. Create User (OWNER role)  │
                    │      status: ACTIVE             │
                    └────────────────────────────────┘
                                    │
                                    ▼
                    ┌──── Generate Tokens ───────────┐
                    │   Access: JWT HS256 (15min)     │
                    │   Refresh: 64 random bytes hex  │
                    └────────────────────────────────┘
                                    │
                                    ▼
                    Return { user, tenant, accessToken, refreshToken }
```

### 9.2 Login Flow

```
                          POST /auth/login
                          { email, password }
                                    │
                                    ▼
                    ┌──── Find user by email ────────┐
                    │   Include tenant relation       │
                    │   (case-insensitive via citext) │
                    └────────────────────────────────┘
                                    │
                                    ▼
                    ┌──── Verify password ───────────┐
                    │   bcrypt.compare()              │
                    └────────────────────────────────┘
                                    │
                                    ▼
                    ┌──── Check account status ──────┐
                    │   Must be ACTIVE                │
                    └────────────────────────────────┘
                                    │
                                    ▼
                    ┌──── Generate Tokens ───────────┐
                    │   Access: JWT (15min)            │
                    │   Refresh: stored in DB          │
                    │     + userAgent, ipAddress       │
                    └────────────────────────────────┘
                                    │
                                    ▼
                    ┌──── Update lastLoginAt ────────┐
                    └────────────────────────────────┘
                                    │
                                    ▼
                    Return { user, tenant, accessToken, refreshToken }
```

### 9.3 Token Refresh Flow (Rotation)

```
                    POST /auth/refresh
                    { refreshToken }
                            │
                            ▼
              ┌──── Find token in DB ──────────┐
              │   Include user + tenant          │
              │   Check not revoked              │
              │   Check not expired              │
              └──────────────────────────────────┘
                            │
                            ▼
              ┌──── Rotate tokens ─────────────┐
              │   1. Revoke old refresh token   │
              │   2. Generate new access token  │
              │   3. Generate new refresh token │
              │   4. Store new refresh in DB    │
              │   (atomic $transaction)          │
              └──────────────────────────────────┘
                            │
                            ▼
              Return { user, accessToken, refreshToken }
```

**Why rotation?** If a refresh token is stolen, the legitimate user's next refresh will fail (token already revoked), signaling compromise.

### 9.4 JWT Verification (Middleware)

```
                    Any protected route
                    Authorization: Bearer <token>
                            │
                            ▼
              ┌──── Extract token ─────────────┐
              │   Strip "Bearer " prefix        │
              └──────────────────────────────────┘
                            │
                            ▼
              ┌──── Check Redis blacklist ─────┐
              │   GET bl:<token>                │
              │   If exists → 401 Unauthorized  │
              └──────────────────────────────────┘
                            │ (not blacklisted)
                            ▼
              ┌──── jwt.verify() ──────────────┐
              │   HS256 with JWT_SECRET         │
              │   Returns { sub, tenantId,      │
              │     email, role, iat, exp }      │
              └──────────────────────────────────┘
                            │
                            ▼
              request.user = payload
              → Next handler
```

### 9.5 Logout Flow

```
                    POST /auth/logout
                    { refreshToken, accessToken }
                            │
                            ▼
              ┌──── Revoke refresh token ──────┐
              │   UPDATE WHERE token = ?        │
              │   SET revokedAt = NOW()         │
              └──────────────────────────────────┘
                            │
                            ▼
              ┌──── Blacklist access token ────┐
              │   SETEX bl:<token> <ttl> "1"   │
              │   TTL = token's remaining life  │
              │   (stored in Redis)              │
              └──────────────────────────────────┘
```

---

## 10. Multi-Tenancy Flow

### 10.1 Data Isolation Model

Every database table has a `tenant_id` column. Queries always filter by tenant:

```typescript
// Auth service — users are scoped to their tenant
prisma.user.findMany({
  where: { tenantId: request.user.tenantId }
});

// Tenant service — settings are scoped to the requesting tenant
prisma.tenantSettings.findUnique({
  where: { tenantId: tenantCtx.tenantId }
});
```

### 10.2 Request Flow (Current - Sprint 1)

```
Client App
    │
    ├── Auth requests → Auth Service (JWT verification built-in)
    │                    Direct Prisma queries with tenantId
    │
    └── Tenant requests → Tenant Service (trusts gateway headers)
                          X-Tenant-ID, X-User-ID, X-User-Role
```

### 10.3 Request Flow (Sprint 2+ with API Gateway)

```
Client App → API Gateway → Verify JWT → Inject Headers → Microservice
                  │
                  ├── X-Tenant-ID: <from JWT>
                  ├── X-User-ID: <from JWT sub>
                  ├── X-User-Role: <from JWT role>
                  └── X-Request-ID: <generated>
```

### 10.4 Invitation Flow

```
OWNER/ADMIN calls POST /tenants/invite
{ email: "agent@company.com", role: "AGENT" }
        │
        ▼
Check existing member → 409 if already member
Check existing invite → 409 if pending invite exists
        │
        ▼
Generate invitation token (32 random bytes)
Create Invitation (status: PENDING, expires: 7 days)
        │
        ▼
TODO: Send email via Notification Service (Sprint 2)
        │
        ▼
Invitee clicks link → GET /tenants/invite/accept?token=xxx
        │
        ▼
Validate token (not expired, not revoked)
Create TenantMember record
Update invitation status to ACCEPTED
```

---

## 11. Database Architecture

### 11.1 Auth Schema (PostgreSQL `auth.*`)

| Table | Key Columns | Indexes |
|-------|------------|---------|
| `users` | id (UUID), email (citext, unique), password_hash, role, status, tenant_id | tenant_id, email |
| `tenants` | id (UUID), name, slug (unique) | slug |
| `refresh_tokens` | id, token (unique), user_id, expires_at, revoked_at | user_id, token |
| `api_keys` | id, key_hash (unique), key_prefix, scopes[], tenant_id, created_by | tenant_id, key_hash |
| `audit_logs` | id, tenant_id, user_id, action, resource, metadata | (tenant_id, created_at), user_id |

### 11.2 Tenant Schema (PostgreSQL `tenant.*`)

| Table | Key Columns | Indexes |
|-------|------------|---------|
| `tenants` | id, name, slug (unique), status, plan_id | slug |
| `tenant_settings` | id, tenant_id (unique), branding, AI config, widget, notifications | tenant_id |
| `tenant_members` | id, tenant_id, user_id, role | (tenant_id, user_id) unique |
| `invitations` | id, tenant_id, email, token (unique), status, expires_at | tenant_id, token |
| `plans` | id, name, tier (unique), pricing, limits, features[] | tier |
| `subscriptions` | id, tenant_id (unique), stripe_customer_id, status | tenant_id |
| `usage_records` | id, tenant_id, metric, count, period_start | (tenant_id, metric, period_start) |

### 11.3 Why `citext` for Emails?

PostgreSQL's `citext` extension provides **case-insensitive text**. Without it:

```sql
-- These would be different users (bad!):
SELECT * FROM users WHERE email = 'User@Example.com';
SELECT * FROM users WHERE email = 'user@example.com';
```

With `citext`, they match automatically at the database level, no `LOWER()` calls needed.

---

## 12. API Reference

### Auth Service (port 3001)

#### Public Endpoints

```
POST /auth/register
  Body: { email, password (min 8), name, tenantName }
  Returns: { user, tenant, accessToken, refreshToken }

POST /auth/login
  Body: { email, password }
  Returns: { user, tenant, accessToken, refreshToken }

POST /auth/refresh
  Body: { refreshToken }
  Returns: { user, accessToken, refreshToken }

POST /auth/logout
  Body: { refreshToken?, accessToken? }
  Returns: { message: "Logged out" }
```

#### Protected Endpoints (require `Authorization: Bearer <token>`)

```
GET  /auth/me                        → Current user profile + tenant
POST /auth/change-password           → { currentPassword, newPassword }

GET  /users                          → List tenant users (OWNER/ADMIN only)
GET  /users/:id                      → Get user by ID (same tenant)
PUT  /users/:id/role                 → Update role (OWNER/ADMIN only)
PUT  /users/:id/status               → Update status (OWNER/ADMIN only)

POST /api-keys                       → Create API key (returns raw key once)
GET  /api-keys                       → List API keys (masked)
DELETE /api-keys/:id                 → Revoke API key

GET  /health                         → Service health + DB + Redis checks
```

#### Swagger Docs

Interactive API documentation available at: **http://localhost:3001/docs**

### Tenant Service (port 3002)

All endpoints require gateway headers: `X-Tenant-ID`, `X-User-ID`, `X-User-Role`

```
GET    /tenants/current               → Current tenant details
PUT    /tenants/current               → Update tenant (OWNER/ADMIN)
GET    /tenants/settings              → Get tenant settings
PUT    /tenants/settings              → Update settings (OWNER/ADMIN)
GET    /tenants/usage                 → Current usage stats
GET    /tenants/members               → List workspace members
POST   /tenants/invite                → Invite member (OWNER/ADMIN)
POST   /tenants/invite/accept         → Accept invitation
DELETE /tenants/members/:userId       → Remove member (OWNER/ADMIN)
GET    /tenants/plans                 → List available plans

GET    /health                         → Service health + DB check
```

---

## 13. CI/CD Pipeline

### GitHub Actions Workflow (`.github/workflows/ci.yml`)

```
Push / PR to main
        │
        ▼
┌─── Lint ──────────────────────────┐
│ pnpm lint (Turborepo parallel)    │
└───────────────────────────────────┘
        │
        ▼
┌─── Test ──────────────────────────┐
│ Services:                          │
│   - PostgreSQL (5432)              │
│   - Redis (6379)                   │
│ Run: pnpm test:ci                  │
└───────────────────────────────────┘
        │
        ▼
┌─── Build Docker ──────────────────┐
│ docker build -f node.Dockerfile   │
│ --target runner                    │
│ (multi-stage: deps→builder→runner) │
└───────────────────────────────────┘
        │ (main branch only)
        ▼
┌─── Deploy Staging ────────────────┐
│ kubectl / helm deploy (Sprint 4)   │
└───────────────────────────────────┘
```

### Docker Multi-Stage Build

```dockerfile
# Stage 1: Install dependencies only
FROM node:22-alpine AS deps
# Stage 2: Build TypeScript
FROM deps AS builder
# Stage 3: Production runtime
FROM node:22-alpine AS runner
USER nodejs (non-root)
HEALTHCHECK --interval=30s CMD curl -f http://localhost:$PORT/health
```

---

## 14. Setup & Running Guide

### Prerequisites

| Requirement | Version | Check |
|-------------|---------|-------|
| Node.js | ≥ 22 | `node -v` |
| pnpm | ≥ 10 | `pnpm -v` |
| Docker | Latest | `docker -v` |
| Docker Compose | v2+ | `docker compose version` |

### Quick Start (First Time)

```bash
# 1. Clone and enter the project
cd /Users/iresh/Documents/Rovty/services/assist/assist

# 2. Install all dependencies
pnpm install

# 3. Start infrastructure (PostgreSQL, Redis, Kafka, etc.)
pnpm docker:infra

# 4. Wait for healthchecks (about 30 seconds), then verify
docker ps    # All 7 containers should show "healthy"

# 5. Generate Prisma clients
cd services/auth && npx prisma generate && cd ../..
cd services/tenant && npx prisma generate && cd ../..

# 6. Run database migrations
cd services/auth && npx prisma migrate dev --name init && cd ../..
cd services/tenant && npx prisma migrate dev --name init && cd ../..

# 7. Seed pricing plans
cd services/tenant && npx tsx prisma/seed.ts && cd ../..

# 8. Build all packages
pnpm build

# 9. Start services
cd services/auth && npx tsx --env-file=.env src/index.ts &
cd services/tenant && npx tsx --env-file=.env src/index.ts &
```

### Daily Development

```bash
# Start infrastructure (if not already running)
pnpm docker:infra

# Start services in watch mode (auto-restart on changes)
cd services/auth && pnpm dev
cd services/tenant && pnpm dev    # in another terminal

# Or use Turborepo to start all
pnpm dev
```

### Useful Commands

```bash
# Build everything
pnpm build

# Run all tests
pnpm test

# Lint all packages
pnpm lint

# Type-check without building
pnpm type-check

# Format code
pnpm format

# Stop infrastructure
pnpm docker:infra:down

# Open Prisma Studio (visual DB browser)
cd services/auth && npx prisma studio
cd services/tenant && npx prisma studio

# Reset a database
cd services/auth && npx prisma migrate reset --force
```

### Dev Tool URLs

| Tool | URL |
|------|-----|
| Auth Service | http://localhost:3001 |
| Auth Swagger Docs | http://localhost:3001/docs |
| Tenant Service | http://localhost:3002 |
| Tenant Swagger Docs | http://localhost:3002/docs |
| Kafka UI | http://localhost:8080 |
| Mailhog (emails) | http://localhost:8025 |
| ClickHouse HTTP | http://localhost:8123 |

---

## 15. Testing Guide

### 15.1 Health Checks

```bash
# Auth service health (should show database: ok, redis: ok)
curl http://localhost:3001/health | python3 -m json.tool

# Tenant service health (should show database: ok)
curl http://localhost:3002/health | python3 -m json.tool
```

**Expected Response:**
```json
{
    "status": "healthy",
    "service": "auth-service",
    "version": "0.1.0",
    "uptime": 57.365,
    "timestamp": "2026-03-04T20:28:50.827Z",
    "checks": {
        "database": "ok",
        "redis": "ok"
    }
}
```

### 15.2 Registration

```bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@rovty.com",
    "password": "SecurePass123!",
    "name": "Admin User",
    "tenantName": "Rovty"
  }' | python3 -m json.tool
```

**Expected:** Returns user object with `role: "OWNER"`, tenant with slug `"rovty"`, plus `accessToken` and `refreshToken`.

### 15.3 Duplicate Registration (should fail)

```bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@rovty.com",
    "password": "AnotherPass!",
    "name": "Duplicate",
    "tenantName": "Another"
  }' | python3 -m json.tool
```

**Expected:** `{ "success": false, "error": { "code": "CONFLICT", "message": "A user with this email already exists" } }`

### 15.4 Login

```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@rovty.com",
    "password": "SecurePass123!"
  }' | python3 -m json.tool
```

**Expected:** Returns user, tenant, accessToken, refreshToken. `lastLoginAt` should be set.

### 15.5 Wrong Password (should fail)

```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@rovty.com",
    "password": "WrongPassword"
  }' | python3 -m json.tool
```

**Expected:** `{ "success": false, "error": { "code": "UNAUTHORIZED", "message": "Invalid email or password" } }`

### 15.6 Get Profile (Authenticated)

```bash
# Replace <TOKEN> with the accessToken from login response
TOKEN="<your-access-token>"

curl http://localhost:3001/auth/me \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
```

**Expected:** User profile + tenant info.

### 15.7 Missing Auth Header (should fail)

```bash
curl http://localhost:3001/auth/me | python3 -m json.tool
```

**Expected:** `{ "success": false, "error": { "code": "UNAUTHORIZED", "message": "Missing or invalid Authorization header" } }`

### 15.8 List Users (OWNER role required)

```bash
curl http://localhost:3001/users \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
```

**Expected:** Paginated list of users in the tenant.

### 15.9 Token Refresh

```bash
# Use the refreshToken from login response
REFRESH="<your-refresh-token>"

curl -X POST http://localhost:3001/auth/refresh \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\": \"$REFRESH\"}" | python3 -m json.tool
```

**Expected:** New accessToken + new refreshToken. Old refresh token is revoked.

### 15.10 Logout

```bash
curl -X POST http://localhost:3001/auth/logout \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"refreshToken\": \"$REFRESH\",
    \"accessToken\": \"$TOKEN\"
  }" | python3 -m json.tool
```

**Expected:** `{ "success": true, "data": { "message": "Logged out successfully" } }`

Then verify the old token no longer works:
```bash
curl http://localhost:3001/auth/me \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
```
**Expected:** `401 Unauthorized` (token blacklisted in Redis)

### 15.11 Tenant Plans

```bash
# Tenant service uses gateway-style headers
curl http://localhost:3002/tenants/plans \
  -H "X-Tenant-ID: <tenant-id-from-register>" \
  -H "X-User-ID: <user-id>" \
  -H "X-User-Role: OWNER" | python3 -m json.tool
```

**Expected:** Array of 4 plans (Starter, Growth, Business, Enterprise)

### 15.12 API Key Management

```bash
# Create an API key
curl -X POST http://localhost:3001/api-keys \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Production Widget",
    "scopes": ["conversations:read", "conversations:write"]
  }' | python3 -m json.tool
```

**Expected:** Returns the API key (shown only once!) with `id`, `name`, `key`, `keyPrefix`.

```bash
# List API keys (key is masked)
curl http://localhost:3001/api-keys \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
```

### 15.13 Change Password

```bash
curl -X POST http://localhost:3001/auth/change-password \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "SecurePass123!",
    "newPassword": "NewSecure456!"
  }' | python3 -m json.tool
```

**Expected:** Success. All existing refresh tokens are revoked (force re-login on all devices).

### 15.14 Automated Tests

```bash
# Run all tests via Vitest
pnpm test

# Run tests for a specific service
pnpm --filter @assist/auth test

# Watch mode (re-runs on file changes)
pnpm --filter @assist/auth test:watch
```

### 15.15 Database Inspection

```bash
# Visual DB browser for auth schema
cd services/auth && npx prisma studio
# Opens at http://localhost:5555

# Or query directly via Docker
docker exec -it assist-postgres psql -U assist -d assist -c \
  "SELECT id, email, name, role, status FROM auth.users;"

docker exec -it assist-postgres psql -U assist -d assist -c \
  "SELECT name, tier, price_monthly FROM tenant.plans;"
```

---

## 16. What's Next (Sprint 2)

### Sprint 2 Scope (Weeks 3-4)

| Deliverable | Description |
|-------------|-------------|
| **Conversation Service** | Real-time chat engine with WebSocket (Socket.IO) |
| **AI Engine** | Azure OpenAI integration (GPT-4o), LangChain orchestration |
| **API Gateway** | Request routing, JWT verification, rate limiting, header injection |
| **Notification Service** | Email (SMTP), push notifications, webhook delivery |
| **Kafka Integration** | Event-driven communication between services |

### Key Architecture Changes in Sprint 2

```
Sprint 1 (Current):
  Client → Auth Service (direct)
  Client → Tenant Service (direct, manual headers)

Sprint 2 (Target):
  Client → API Gateway → Auth verification → Route to service
              │
              ├── /auth/*        → Auth Service
              ├── /tenants/*     → Tenant Service
              ├── /conversations → Conversation Service
              ├── /ai/*          → AI Engine (FastAPI/Python)
              └── /ws            → WebSocket upgrade → Conversation Service
```

### AI Engine (Sprint 2 Preview)

```python
# FastAPI service using Azure OpenAI + LangChain
# Planned endpoints:
POST /ai/chat              → Generate AI response with context
POST /ai/summarize         → Summarize conversation
POST /ai/sentiment         → Analyze message sentiment
POST /ai/suggest-reply     → Agent assistance suggestions
POST /ai/classify          → Intent classification for routing
```

---

## Appendix A: Environment File Templates

### services/auth/.env

```env
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://assist:assist_dev_password@localhost:5432/assist?schema=auth
REDIS_URL=redis://localhost:6379
JWT_SECRET=super-secret-jwt-key-must-be-at-least-32-chars-long
JWT_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d
BCRYPT_ROUNDS=12
CORS_ORIGINS=http://localhost:3000
```

### services/tenant/.env

```env
NODE_ENV=development
PORT=3002
DATABASE_URL=postgresql://assist:assist_dev_password@localhost:5432/assist?schema=tenant
REDIS_URL=redis://localhost:6379
CORS_ORIGINS=http://localhost:3000
```

---

## Appendix B: Troubleshooting

### Port Already in Use

```bash
# Find and kill process on port 3001
kill $(lsof -ti:3001)
```

### Prisma Migration Drift

```bash
# Reset and re-apply all migrations
cd services/auth && npx prisma migrate reset --force
```

### Docker Containers Not Healthy

```bash
# Check logs
docker logs assist-postgres
docker logs assist-redis

# Restart everything
pnpm docker:infra:down && pnpm docker:infra
```

### TypeScript Build Errors After Schema Change

```bash
# Regenerate Prisma client + rebuild
cd services/auth && npx prisma generate
pnpm build
```

### Node.js 22 Not Found

```bash
# macOS with Homebrew
brew install node@22
export PATH="/opt/homebrew/opt/node@22/bin:$PATH"
```

---

*Document last updated: March 5, 2026*  
*Sprint 1 completed by: Rovty Engineering Team*
