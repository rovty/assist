# Sprint 2 — Completed

## Overview

Sprint 2 adds the **API Gateway**, **Conversation Service**, **AI Engine**, **Notification Service**, and shared infrastructure packages (Kafka, notification types). All 4 new services run alongside the Sprint 1 Auth & Tenant services, with the API Gateway unifying access on port 3000.

---

## Architecture

```
┌──────────────────────────────────────────────────────┐
│                   API Gateway (:3000)                  │
│          JWT Auth · Rate Limit · HTTP Proxy           │
└─────┬──────┬──────┬──────┬──────┬────────────────────┘
      │      │      │      │      │
      ▼      ▼      ▼      ▼      ▼
   Auth   Tenant  Convo   AI    Notify
  :3001   :3002   :3003  :3004  :3005
      │      │      │             │
      ▼      ▼      ▼             ▼
   Postgres  │   MongoDB      Mailhog
      │      │      │         (:1025)
      ▼      ▼      ▼
      Redis (:6379)   Kafka (:9094)
```

## Services Summary

| Service | Port | DB | Purpose |
|---------|------|-----|---------|
| API Gateway | 3000 | Redis | JWT auth, rate limiting, HTTP proxy routing |
| Auth | 3001 | PostgreSQL + Redis | Authentication, users, API keys |
| Tenant | 3002 | PostgreSQL | Multi-tenant management, plans, invitations |
| Conversation | 3003 | MongoDB + Redis | Real-time chat, contacts, Socket.IO |
| AI Engine | 3004 | Redis | Azure OpenAI/OpenAI integration, chat/summarize/sentiment |
| Notification | 3005 | Redis | Email (Mailhog), webhooks, in-app notifications |

---

## New Shared Packages

### `@assist/shared-kafka`
Kafka producer/consumer utilities wrapping KafkaJS.

- **`createKafkaClient(config)`** — Creates KafkaJS client with retry config
- **`TOPICS`** — 20+ topic constants (auth, tenant, conversation, message, AI, notification events)
- **`createProducer(kafka, source)`** — EventProducer with `publish()` and `publishBatch()`
- **`createConsumer(kafka, groupId)`** — EventConsumer with `subscribe()` and handler registration

### `@assist/shared-types` (updated)
Added notification types: `NotificationChannel`, `NotificationStatus`, `NotificationType`, `EmailPayload`, `WebhookPayload`, `WebhookConfig`.

---

## API Gateway (`:3000`)

**Key features:**
- JWT verification with Redis token blacklist
- Tenant context injection (x-tenant-id, x-user-id, x-user-role headers)
- Per-tenant rate limiting (200 req/min default)
- Swagger UI at `/docs`
- Health check aggregating all downstream services

**Public routes (no JWT):** `/auth/register`, `/auth/login`, `/auth/refresh`, `/health`, `*/health`

**Proxy routes:**
| Gateway Path | Upstream Service |
|---|---|
| `/auth/*`, `/users/*`, `/api-keys/*` | Auth Service |
| `/tenants/*` | Tenant Service |
| `/conversations/*`, `/contacts/*` | Conversation Service |
| `/ai/*` | AI Engine |
| `/notifications/*` | Notification Service |

---

## Conversation Service (`:3003`)

### Models (MongoDB/Mongoose)

**Contact** — Customer/end-user record
- Fields: tenantId, name, email, phone, channel, avatarUrl, externalId, tags, metadata, leadScore, lastSeenAt
- Indexes: tenantId+email (unique), tenantId+externalId (unique sparse), tenantId+createdAt

**Conversation** — Chat thread
- Fields: tenantId, contactId, channel, status (new/ai_active/queued/assigned/resolved/closed), assignedAgentId, priority, tags, subject, metadata, aiConfidence, messageCount, lastMessageAt, firstResponseAt, resolvedAt
- Indexes: tenantId+status+updatedAt, tenantId+assignedAgentId+status

**Message** — Individual message in a conversation
- Sender types: contact, ai, agent, system
- Content types: text, image, video, audio, file, location, system
- AI metadata: model, confidence, intent, sources, tokensUsed, responseTimeMs
- Indexes: conversationId+createdAt, tenantId+createdAt

### API Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/conversations` | List conversations (filtered, paginated) |
| POST | `/conversations` | Create conversation + initial message |
| GET | `/conversations/:id` | Get conversation by ID |
| PATCH | `/conversations/:id` | Update conversation |
| POST | `/conversations/:id/assign` | Assign to agent |
| GET | `/conversations/:id/messages` | Get messages (paginated) |
| POST | `/conversations/:id/messages` | Send message |
| POST | `/conversations/:id/read` | Mark messages as read |
| GET | `/contacts` | List contacts |
| POST | `/contacts` | Create contact |
| GET | `/contacts/:id` | Get contact |
| GET | `/contacts/:id/conversations` | Get contact's conversations |

### Socket.IO (Real-time)

Connected via JWT auth. Events:
- `conversation:join/leave` — Room management
- `message:send` — Send + broadcast message
- `typing:start/stop` — Typing indicators
- `messages:read` — Read receipts
- `agents:online` — Agent presence (Redis-backed)

### AI Integration

When a **contact** sends a message, the service automatically:
1. Calls AI Engine `POST /ai/chat` with conversation history
2. Saves AI response as a new message
3. Updates conversation status to `ai_active`
4. If AI confidence < 0.5, changes status to `queued` (escalation)

---

## AI Engine (`:3004`)

### Provider Chain
1. **Azure OpenAI** → if `AZURE_OPENAI_API_KEY` set
2. **OpenAI API** → if `OPENAI_API_KEY` set
3. **Mock mode** → returns simulated responses (default for dev)

### API Endpoints

| Method | Path | Description |
|---|---|---|
| POST | `/ai/chat` | Chat completion with confidence scoring |
| POST | `/ai/summarize` | Conversation summarization (JSON format) |
| POST | `/ai/sentiment` | Sentiment analysis (-1 to 1 score) |
| POST | `/ai/suggest-reply` | Generate reply suggestions (multiple tones) |
| POST | `/ai/classify` | Intent classification with urgency |
| GET | `/ai/status` | Provider info and configuration status |

### Chat Response
```json
{
  "response": "Here's how to reset your password: ...",
  "confidence": 0.85,
  "intent": "password_reset",
  "model": "gpt-4o",
  "tokensUsed": { "prompt": 150, "completion": 80, "total": 230 },
  "responseTimeMs": 1235,
  "finishReason": "stop"
}
```

---

## Notification Service (`:3005`)

### Email
- Uses **nodemailer** with SMTP
- Local dev: Mailhog (port 1025, UI at port 8025)
- Pre-built templates: conversation assigned, escalation, invitation

### Webhooks
- HMAC-SHA256 signed payloads
- Retry with exponential backoff (1s, 2s, 4s)
- Per-tenant webhook registration with event filtering
- Stats tracking (delivered/failed counts in Redis)

### API Endpoints

| Method | Path | Description |
|---|---|---|
| POST | `/notifications` | Send notification (email/webhook/in_app/push) |
| GET | `/notifications` | List notifications (admin) |
| GET | `/notifications/me` | Get user's notifications |
| GET | `/notifications/:id` | Get notification |
| POST | `/notifications/webhooks` | Register webhook (admin) |
| GET | `/notifications/webhooks` | List webhooks (admin) |
| GET | `/notifications/webhooks/:id` | Get webhook (admin) |
| PATCH | `/notifications/webhooks/:id` | Update webhook (admin) |
| DELETE | `/notifications/webhooks/:id` | Delete webhook (admin) |

---

## Running

```bash
# 1. Infrastructure (if not running)
docker-compose -f docker-compose.infra.yml up -d

# 2. Install deps
pnpm install

# 3. Build all
pnpm build

# 4. Start all services (in separate terminals)
cd services/auth && pnpm dev
cd services/tenant && pnpm dev
cd services/conversation && pnpm dev
cd services/ai-engine && pnpm dev
cd services/notification && pnpm dev
cd services/api-gateway && pnpm dev    # Start gateway last

# 5. Health check
curl http://localhost:3000/health
```

## Testing

```bash
# Login through gateway
TOKEN=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234!"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['accessToken'])")

# Create conversation (auto-triggers AI response)
curl -X POST http://localhost:3000/conversations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"channel":"web","contactName":"John Doe","contactEmail":"john@example.com","initialMessage":"Hello, I need help!"}'

# AI chat
curl -X POST http://localhost:3000/ai/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"conversationId":"<id>","messages":[{"role":"user","content":"How do I reset my password?"}],"userMessage":"How do I reset my password?"}'

# Send email notification (arrives in Mailhog UI at http://localhost:8025)
curl -X POST http://localhost:3000/notifications \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"recipientId":"<userId>","recipientEmail":"test@example.com","channel":"email","type":"system.alert","subject":"Test","body":"<h1>Hello</h1>"}'

# Register webhook
curl -X POST http://localhost:3000/notifications/webhooks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"url":"https://webhook.site/test","events":["*"]}'
```

---

## File Structure

```
packages/
  shared-kafka/         # NEW — Kafka producer/consumer utilities
    src/client.ts       # KafkaJS client factory
    src/topics.ts       # 20+ topic constants
    src/producer.ts     # EventProducer (publish/publishBatch)
    src/consumer.ts     # EventConsumer (subscribe/handler)
  shared-types/
    src/notification.ts # NEW — Notification types

services/
  api-gateway/          # NEW — Port 3000
    src/middleware/auth.ts      # JWT verify + header injection
    src/routes/health.routes.ts # Aggregated health check
    src/index.ts               # HTTP proxy registrations
  conversation/         # NEW — Port 3003
    src/models/         # Mongoose: Contact, Conversation, Message
    src/services/       # CRUD + AI integration
    src/routes/         # REST endpoints
    src/websocket/      # Socket.IO (JWT auth, rooms, typing, presence)
  ai-engine/            # NEW — Port 3004
    src/services/ai.service.ts     # Azure OpenAI / OpenAI / mock
    src/services/prompt.service.ts # System prompts
    src/routes/ai.routes.ts        # /chat, /summarize, /sentiment, etc.
  notification/         # NEW — Port 3005
    src/services/email.service.ts       # Nodemailer + templates
    src/services/webhook.service.ts     # HMAC-signed webhooks + retry
    src/services/notification.service.ts # Orchestrator
    src/routes/notification.routes.ts    # CRUD endpoints
    src/routes/webhook.routes.ts         # Webhook management
```

---

## Environment Variables

Each service has a `.env` file. Key additions for Sprint 2:

| Variable | Service | Default |
|---|---|---|
| `JWT_SECRET` | Gateway | (required, min 32 chars) |
| `MONGODB_URL` | Conversation | `mongodb://...` |
| `KAFKA_BROKERS` | Multiple | `localhost:9094` |
| `AI_SERVICE_URL` | Conversation | `http://localhost:3004` |
| `AZURE_OPENAI_ENDPOINT` | AI Engine | (optional) |
| `AZURE_OPENAI_API_KEY` | AI Engine | (optional) |
| `OPENAI_API_KEY` | AI Engine | (optional — falls back to mock) |
| `SMTP_HOST` | Notification | `localhost` |
| `SMTP_PORT` | Notification | `1025` (Mailhog) |
