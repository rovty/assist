# Sprint 3 – Knowledge, Media, Channels, Analytics & Webhooks

> **Duration:** 2 weeks  
> **Goal:** Extend the Assist platform with RAG-powered knowledge bases, file storage, omnichannel messaging, real-time analytics, and developer-facing webhook APIs.

---

## Table of Contents

1. [Sprint Overview](#sprint-overview)
2. [New Services](#new-services)
3. [Shared Package Updates](#shared-package-updates)
4. [API Gateway Updates](#api-gateway-updates)
5. [Service Details](#service-details)
   - [Knowledge Base Service](#knowledge-base-service-port-3006)
   - [Media Service](#media-service-port-3007)
   - [Channel Gateway Service](#channel-gateway-service-port-3008)
   - [Analytics Service](#analytics-service-port-3009)
   - [Webhook Service](#webhook-service-port-3010)
6. [Infrastructure Changes](#infrastructure-changes)
7. [Running Locally](#running-locally)
8. [Architecture Diagram](#architecture-diagram)
9. [What's Next (Sprint 4)](#whats-next-sprint-4)

---

## Sprint Overview

### Delivered

| # | Service             | Port | Database     | Status |
|---|---------------------|------|--------------|--------|
| 1 | Knowledge Base      | 3006 | MongoDB      | ✅ Done |
| 2 | Media               | 3007 | Redis + FS   | ✅ Done |
| 3 | Channel Gateway     | 3008 | Redis        | ✅ Done |
| 4 | Analytics           | 3009 | ClickHouse   | ✅ Done |
| 5 | Webhook             | 3010 | Redis        | ✅ Done |

### Also Completed

- **Shared types** — 5 new type modules: `knowledge-base`, `media`, `channel`, `analytics`, `webhook`
- **Shared Kafka topics** — 20+ new topic constants across all Sprint 3 domains
- **API Gateway** — New proxy routes for `/kb`, `/media`, `/channels`, `/analytics`, `/webhooks`
- **Root `.env.example`** — Updated with all new service URLs, ports, and config variables

---

## New Services

### Knowledge Base Service (Port 3006)

A RAG (Retrieval-Augmented Generation) knowledge base engine supporting multiple source types with embeddings-based semantic search.

**Tech:** MongoDB (Mongoose) + Redis cache + OpenAI/Azure OpenAI embeddings

**Files:**
```
services/knowledge-base/
├── package.json
├── tsconfig.json
├── .env
└── src/
    ├── env.ts
    ├── index.ts
    ├── middleware/
    │   ├── auth.ts
    │   └── error-handler.ts
    ├── utils/
    │   ├── redis.ts
    │   └── db.ts
    ├── models/
    │   ├── source.model.ts
    │   └── chunk.model.ts
    ├── schemas/
    │   └── kb.schema.ts
    ├── services/
    │   ├── embedding.service.ts
    │   ├── chunker.service.ts
    │   └── kb.service.ts
    └── routes/
        ├── kb.routes.ts
        └── health.routes.ts
```

**API Endpoints:**

| Method | Path                    | Description                           |
|--------|-------------------------|---------------------------------------|
| POST   | `/kb/sources`           | Create a new KB source (URL, text, FAQ, PDF, sitemap) |
| GET    | `/kb/sources`           | List all sources for tenant           |
| GET    | `/kb/sources/:id`       | Get source details                    |
| DELETE | `/kb/sources/:id`       | Delete source and its chunks          |
| POST   | `/kb/sources/faq`       | Bulk import FAQ pairs                 |
| POST   | `/kb/search`            | Semantic search across knowledge base |
| GET    | `/kb/stats`             | Get KB stats (sources, chunks, etc.)  |
| GET    | `/kb/health`            | Health check                          |

**Key Features:**
- Multi-source ingestion: URLs (with cheerio HTML parsing), FAQ pairs, raw text, sitemap crawling, PDF placeholders
- Sentence-aware text chunking with configurable size/overlap
- Embedding generation via Azure OpenAI, OpenAI, or mock (dev mode)
- Cosine-similarity vector search with configurable `topK` and `threshold`
- Async processing pipeline — sources go through `processing` → `ready` / `error` states
- Redis-cached search results (5 min TTL per query hash)
- Kafka events: `kb.source.created`, `kb.source.ready`, `kb.source.failed`

---

### Media Service (Port 3007)

File upload, storage, and retrieval service with quota tracking, image optimization, and multiple storage backends.

**Tech:** Redis (metadata) + Local FS / Azure Blob Storage + sharp (image processing) + @fastify/multipart

**API Endpoints:**

| Method | Path                     | Description                        |
|--------|--------------------------|------------------------------------|
| POST   | `/media/upload`          | Upload file (multipart/form-data)  |
| GET    | `/media/files`           | List tenant's files                |
| GET    | `/media/files/:id`       | Get file metadata                  |
| GET    | `/media/files/:id/download` | Download file                   |
| GET    | `/media/content/:id`     | Internal content retrieval         |
| DELETE | `/media/files/:id`       | Delete file                        |
| GET    | `/media/quota`           | Get storage quota usage            |
| GET    | `/media/health`          | Health check                       |

**Key Features:**
- MIME type validation with configurable allowlists
- Per-tenant file size limits (50MB default)
- Image optimization with sharp (resize to 2048px, JPEG 85% quality)
- Thumbnail generation for images
- Local filesystem storage with Azure Blob Storage support (pluggable)
- Quota tracking in Redis with per-tenant limits
- Kafka events: `media.uploaded`, `media.deleted`

---

### Channel Gateway Service (Port 3008)

Omnichannel message routing hub supporting WhatsApp Business, Telegram Bot, and Facebook Messenger.

**Tech:** Redis (connection state) + provider-specific APIs

**API Endpoints:**

| Method | Path                              | Description                       |
|--------|-----------------------------------|-----------------------------------|
| POST   | `/channels/connect`               | Connect a new channel             |
| GET    | `/channels`                       | List tenant's channel connections |
| GET    | `/channels/:id`                   | Get connection details            |
| PATCH  | `/channels/:id`                   | Update connection config          |
| POST   | `/channels/:id/disconnect`        | Disconnect channel                |
| DELETE | `/channels/:id`                   | Delete connection                 |
| POST   | `/channels/send`                  | Send outbound message             |
| POST   | `/channels/webhooks/whatsapp`     | WhatsApp incoming webhook         |
| GET    | `/channels/webhooks/whatsapp`     | WhatsApp webhook verification     |
| POST   | `/channels/webhooks/messenger`    | Messenger incoming webhook        |
| GET    | `/channels/webhooks/messenger`    | Messenger webhook verification    |
| POST   | `/channels/webhooks/telegram`     | Telegram incoming webhook         |
| GET    | `/channels/health`                | Health check                      |

**Key Features:**
- Provider abstraction layer for WhatsApp, Telegram, Messenger
- WhatsApp Cloud API integration with signature verification
- Telegram Bot API with `/setWebhook` auto-registration
- Messenger webhook with X-Hub-Signature SHA256 verification
- Connection state management in Redis
- Inbound message normalization to common `InboundChannelMessage` format
- Outbound message routing based on provider type
- Kafka events: `channel.connected`, `channel.disconnected`, `channel.message.received`, `channel.message.sent`

---

### Analytics Service (Port 3009)

Real-time analytics dashboard with conversation metrics, agent performance, AI usage tracking, and channel distribution.

**Tech:** ClickHouse (time-series OLAP) + Redis (caching) + Kafka (event ingestion)

**API Endpoints:**

| Method | Path                    | Description                        |
|--------|-------------------------|------------------------------------|
| GET    | `/analytics/overview`   | Dashboard overview metrics         |
| GET    | `/analytics/conversations` | Conversation metrics by period  |
| GET    | `/analytics/agents`     | Agent performance leaderboard      |
| GET    | `/analytics/ai`         | AI usage and accuracy metrics      |
| GET    | `/analytics/channels`   | Channel distribution breakdown     |
| POST   | `/analytics/track`      | Track single event                 |
| POST   | `/analytics/track/batch` | Track batch of events (up to 500) |
| GET    | `/analytics/health`     | Health check                       |

**Query Parameters (all GET endpoints):**

| Param   | Type   | Default | Options                     |
|---------|--------|---------|-----------------------------|
| period  | string | `day`   | `hour`, `day`, `week`, `month` |
| from    | string | auto    | ISO 8601 datetime           |
| to      | string | now     | ISO 8601 datetime           |
| channel | string | —       | Filter by channel           |

**Key Features:**
- ClickHouse MergeTree tables with 90-day TTL for raw events
- SummingMergeTree materialized tables for pre-aggregated conversation/agent/AI metrics
- Period-aware caching (1 min for hourly, 5 min for daily, 15 min for weekly, 1 hr for monthly)
- Auto-initialization of ClickHouse database and tables on startup
- Mock data fallback when ClickHouse is unavailable (dev mode)
- Redis event buffer for ClickHouse write failures
- Batch event ingestion (up to 500 events per call)

**ClickHouse Tables:**
- `events` — Raw event stream (partitioned by month, 90-day TTL)
- `conversation_metrics` — Daily conversation aggregates
- `agent_metrics` — Per-agent daily performance
- `ai_metrics` — Daily AI usage/accuracy stats

---

### Webhook Service (Port 3010)

Developer-facing webhook management with HMAC-SHA256 signed deliveries, automatic retries, and delivery logging.

**Tech:** Redis (endpoints, deliveries, stats, retry queue)

**API Endpoints:**

| Method | Path                                                    | Description              |
|--------|---------------------------------------------------------|--------------------------|
| POST   | `/webhooks/endpoints`                                   | Create endpoint          |
| GET    | `/webhooks/endpoints`                                   | List endpoints           |
| GET    | `/webhooks/endpoints/:id`                               | Get endpoint             |
| PATCH  | `/webhooks/endpoints/:id`                               | Update endpoint          |
| DELETE | `/webhooks/endpoints/:id`                               | Delete endpoint          |
| GET    | `/webhooks/endpoints/:id/stats`                         | Delivery statistics      |
| GET    | `/webhooks/endpoints/:id/deliveries`                    | List delivery attempts   |
| POST   | `/webhooks/endpoints/:id/deliveries/:deliveryId/retry`  | Retry failed delivery    |
| POST   | `/webhooks/dispatch`                                    | Dispatch event (internal)|

**Key Features:**
- HMAC-SHA256 signature verification (Stripe-style `sha256=` prefix)
- Auto-generated webhook secrets (`whsec_` prefix)
- Configurable retry policy per endpoint (max retries, backoff interval)
- Delivery attempt logging with request/response capture (7-day TTL)
- Per-endpoint statistics (total, success, failed, last delivery timestamp)
- Redis sorted-set backed retry queue with exponential backoff
- Event filtering — endpoints subscribe to specific event types
- Batch dispatch to all matching enabled endpoints
- Custom header injection per endpoint

**Webhook Payload Format:**
```json
{
  "id": "whdl_abc123",
  "event": "conversation.created",
  "timestamp": 1700000000000,
  "data": { ... }
}
```

**Signature Headers:**
- `X-Webhook-Id` — Unique delivery ID
- `X-Webhook-Timestamp` — Unix timestamp
- `X-Webhook-Signature` — `sha256={hmac_hex}`
- `X-Webhook-Retry` — Retry count (on retries)

---

## Shared Package Updates

### `packages/shared-types/src/`

| File               | New Types                                                                      |
|--------------------|--------------------------------------------------------------------------------|
| `knowledge-base.ts`| `KBSourceType`, `KBSourceStatus`, `KBSource`, `KBChunk`, `KBSearchResult`, `KBSearchQuery`, `KBStats` |
| `media.ts`         | `MediaType`, `MediaStorage`, `MediaFile`, `UploadResult`, `MediaQuota`, `ALLOWED_MIME_TYPES`, `MAX_FILE_SIZES` |
| `channel.ts`       | `ChannelProvider`, `ChannelConnectionStatus`, `ChannelConnection`, `ChannelCredentials`, `ChannelConfig`, `InboundChannelMessage`, `OutboundChannelMessage` |
| `analytics.ts`     | `MetricPeriod`, `AnalyticsOverview`, `ConversationMetrics`, `AgentMetrics`, `ChannelMetrics`, `AiMetrics`, `AnalyticsEvent`, `AnalyticsQuery` |
| `webhook.ts`       | `WebhookEndpoint`, `RetryPolicy`, `WebhookStats`, `WebhookDelivery`, `WebhookLog`, `WEBHOOK_EVENTS` |
| `events.ts`        | `KBSourceCreatedEvent`, `KBSourceReadyEvent`, `KBSourceFailedEvent`, `MediaUploadedEvent`, `ChannelConnectedEvent`, `ChannelDisconnectedEvent`, `ChannelMessageReceivedEvent`, `AnalyticsTrackEvent` — all added to `AssistEvent` union |

### `packages/shared-kafka/src/topics.ts`

20+ new topic constants:
- KB: `KB_SOURCE_CREATED`, `KB_SOURCE_READY`, `KB_SOURCE_FAILED`, `KB_SOURCE_DELETED`, `KB_SEARCH_PERFORMED`
- Media: `MEDIA_UPLOADED`, `MEDIA_DELETED`, `MEDIA_PROCESSED`
- Channel: `CHANNEL_CONNECTED`, `CHANNEL_DISCONNECTED`, `CHANNEL_MESSAGE_RECEIVED`, `CHANNEL_MESSAGE_SENT`, `CHANNEL_MESSAGE_FAILED`
- Webhook: `WEBHOOK_DISPATCHED`, `WEBHOOK_DELIVERED`, `WEBHOOK_FAILED`, `WEBHOOK_ENDPOINT_CREATED`, `WEBHOOK_ENDPOINT_DELETED`
- Analytics: `ANALYTICS_EVENT_TRACKED`, `ANALYTICS_BATCH_TRACKED`

---

## API Gateway Updates

### New Proxy Routes (in `services/api-gateway/src/index.ts`)

| Prefix       | Upstream Service         |
|-------------|--------------------------|
| `/kb`       | Knowledge Base (3006)    |
| `/media`    | Media (3007)             |
| `/channels` | Channel Gateway (3008)   |
| `/analytics`| Analytics (3009)         |
| `/webhooks` | Webhook (3010)           |

### New Environment Variables (in `services/api-gateway/src/env.ts`)

```
KNOWLEDGE_BASE_SERVICE_URL=http://localhost:3006
MEDIA_SERVICE_URL=http://localhost:3007
CHANNEL_GATEWAY_SERVICE_URL=http://localhost:3008
ANALYTICS_SERVICE_URL=http://localhost:3009
WEBHOOK_SERVICE_URL=http://localhost:3010
```

### Updated Health Check

Gateway health route now monitors all 10 downstream services.

---

## Infrastructure Changes

### ClickHouse (already in `docker-compose.infra.yml`)

- Image: `clickhouse/clickhouse-server:24`
- HTTP port: `8123`, Native port: `9000`
- Database: `assist_analytics`
- Auto-initialized with MergeTree and SummingMergeTree tables on analytics service startup

### Port Map (Complete)

| Port | Service           | Sprint |
|------|-------------------|--------|
| 3000 | API Gateway       | 1      |
| 3001 | Auth              | 1      |
| 3002 | Tenant            | 1      |
| 3003 | Conversation      | 2      |
| 3004 | AI Engine         | 2      |
| 3005 | Notification      | 2      |
| 3006 | Knowledge Base    | 3      |
| 3007 | Media             | 3      |
| 3008 | Channel Gateway   | 3      |
| 3009 | Analytics         | 3      |
| 3010 | Webhook           | 3      |

---

## Running Locally

### 1. Start Infrastructure

```bash
pnpm docker:infra
# Starts: PostgreSQL, MongoDB, Redis, Kafka, ClickHouse, Mailhog, Kafka UI
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Start Sprint 3 Services

```bash
# All at once (from repo root)
pnpm --filter @assist/knowledge-base dev &
pnpm --filter @assist/media dev &
pnpm --filter @assist/channel-gateway dev &
pnpm --filter @assist/analytics dev &
pnpm --filter @assist/webhook dev &

# Or individually
cd services/knowledge-base && pnpm dev
cd services/media && pnpm dev
cd services/channel-gateway && pnpm dev
cd services/analytics && pnpm dev
cd services/webhook && pnpm dev
```

### 4. Verify Health

```bash
# Individual services
curl http://localhost:3006/health  # Knowledge Base
curl http://localhost:3007/health  # Media
curl http://localhost:3008/health  # Channel Gateway
curl http://localhost:3009/health  # Analytics
curl http://localhost:3010/health  # Webhook

# All via gateway
curl http://localhost:3000/health
```

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        API Gateway (:3000)                       │
│  /kb  /media  /channels  /analytics  /webhooks  (+ sprint 1&2) │
└──┬──────┬────────┬──────────┬───────────┬───────────────────────┘
   │      │        │          │           │
   ▼      ▼        ▼          ▼           ▼
┌──────┐┌──────┐┌────────┐┌─────────┐┌─────────┐
│  KB  ││Media ││Channel ││Analytics││ Webhook │
│:3006 ││:3007 ││Gateway ││ :3009   ││ :3010   │
│      ││      ││ :3008  ││         ││         │
└──┬───┘└──┬───┘└──┬─────┘└──┬──────┘└──┬──────┘
   │       │       │         │          │
   ▼       ▼       ▼         ▼          ▼
┌──────────────────────────────────────────────┐
│                  Kafka (KRaft)                │
│  kb.* / media.* / channel.* / analytics.*    │
│  webhook.* topics                            │
└──────────────────────────────────────────────┘
   │       │       │         │          │
   ▼       ▼       ▼         ▼          ▼
┌───────┐┌─────┐┌─────┐┌──────────┐┌───────┐
│MongoDB││Redis││Redis││ClickHouse││ Redis  │
│(docs) ││(FS) ││(st) ││(OLAP)    ││(state) │
└───────┘└─────┘└─────┘└──────────┘└───────┘
```

---

## What's Next (Sprint 4)

| Service           | Description                                        |
|-------------------|----------------------------------------------------|
| **Bot Builder**   | Visual conversational flow designer with node graph |
| **Lead/CRM**      | Contact management, lead scoring, pipeline tracking |
| **Scheduler**     | Appointment booking, business hours, SLA management |
| **Agent Workspace**| Real-time agent console with conversation routing  |
| **Billing**       | Stripe integration, subscription plans, usage metering |
| **Dashboard App** | React admin panel (Next.js)                        |
| **Widget App**    | Embeddable chat widget (Preact/React)              |
