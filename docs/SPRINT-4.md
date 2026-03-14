# Sprint 4 – Bot Builder, Lead/CRM, Scheduler, Agent Workspace & Billing

> **Duration:** 2 weeks  
> **Goal:** Complete the Assist platform with visual bot building, CRM/lead management, job scheduling, real-time agent workspace, and Stripe billing integration.

---

## Table of Contents

1. [Sprint Overview](#sprint-overview)
2. [New Services](#new-services)
3. [Shared Package Updates](#shared-package-updates)
4. [API Gateway Updates](#api-gateway-updates)
5. [Service Details](#service-details)
   - [Bot Builder Service](#bot-builder-service-port-3011)
   - [Lead/CRM Service](#leadcrm-service-port-3012)
   - [Scheduler Service](#scheduler-service-port-3013)
   - [Agent Workspace Service](#agent-workspace-service-port-3014)
   - [Billing Service](#billing-service-port-3015)
6. [Infrastructure Changes](#infrastructure-changes)
7. [Running Locally](#running-locally)
8. [Architecture Diagram](#architecture-diagram)
9. [What's Next (Sprint 5)](#whats-next-sprint-5)

---

## Sprint Overview

### Delivered

| # | Service           | Port | Database        | Status |
|---|-------------------|------|-----------------|--------|
| 1 | Bot Builder       | 3011 | MongoDB         | ✅ Done |
| 2 | Lead/CRM          | 3012 | MongoDB         | ✅ Done |
| 3 | Scheduler         | 3013 | Redis           | ✅ Done |
| 4 | Agent Workspace   | 3014 | Redis           | ✅ Done |
| 5 | Billing           | 3015 | Redis + Stripe  | ✅ Done |

### Also Completed

- **Shared types** — 5 new type modules: `bot-builder`, `lead-crm`, `scheduler`, `agent-workspace`, `billing`
- **Shared Kafka topics** — 25+ new topic constants across all Sprint 4 domains
- **API Gateway** — New proxy routes for `/bots`, `/leads`, `/scheduler`, `/workspace`, `/billing`
- **Root `.env.example`** — Updated with all new service URLs, ports, and config variables

---

## New Services

### Bot Builder Service (Port 3011)

A visual conversational flow designer supporting node-based flow graphs with versioning, publishing, and simulation.

**Tech:** MongoDB (Mongoose) + Redis cache

**Files:**
```
services/bot-builder/
├── package.json
├── tsconfig.json
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
    │   ├── bot.model.ts
    │   └── bot-version.model.ts
    ├── schemas/
    │   └── bot.schema.ts
    ├── services/
    │   ├── bot.service.ts
    │   └── simulator.service.ts
    └── routes/
        ├── bot.routes.ts
        └── health.routes.ts
```

**API Endpoints:**

| Method | Path                              | Description                         |
|--------|-----------------------------------|-------------------------------------|
| POST   | `/bots`                           | Create a new bot                    |
| GET    | `/bots`                           | List bots for tenant                |
| GET    | `/bots/:id`                       | Get bot details                     |
| PATCH  | `/bots/:id`                       | Update bot metadata                 |
| DELETE | `/bots/:id`                       | Delete bot                          |
| PUT    | `/bots/:id/flow`                  | Save bot flow (nodes & edges)       |
| GET    | `/bots/:id/flow`                  | Get bot flow                        |
| POST   | `/bots/:id/versions`              | Create a new version (snapshot)     |
| GET    | `/bots/:id/versions`              | List versions                       |
| POST   | `/bots/:id/publish`               | Publish bot (make live)             |
| POST   | `/bots/:id/unpublish`             | Unpublish bot                       |
| POST   | `/bots/:id/simulate`              | Simulate conversation through flow  |
| GET    | `/bots/health`                    | Health check                        |

**Key Features:**
- Node-based flow graph model: trigger → condition → action → response nodes
- Supported node types: `trigger`, `message`, `condition`, `action`, `ai_response`, `handoff`, `delay`, `collect_input`, `api_call`, `set_variable`
- Edge connections with condition-based branching
- Flow versioning with immutable snapshots
- Publish/unpublish lifecycle (draft → published → archived)
- Flow simulation engine for testing without live deployment
- Variable interpolation in message nodes (`{{contact.name}}`)
- Kafka events: `bot.created`, `bot.published`, `bot.unpublished`

**Node Type Definitions:**
```
Trigger     → Starts flow (on message, on keyword, on event)
Message     → Send text/media to contact
Condition   → Branch based on variable/intent/sentiment
Action      → Set variable, call API, tag conversation
AI Response → Invoke AI engine for dynamic reply
Handoff     → Escalate to human agent
Delay       → Wait N seconds before continuing
Collect     → Ask question and store answer in variable
API Call    → HTTP request to external service
Set Variable→ Store value for use in later nodes
```

---

### Lead/CRM Service (Port 3012)

Contact-centric CRM with lead scoring, pipeline management, deal tracking, and activity logging.

**Tech:** MongoDB (Mongoose) + Redis cache

**Files:**
```
services/lead-crm/
├── package.json
├── tsconfig.json
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
    │   ├── lead.model.ts
    │   ├── pipeline.model.ts
    │   └── activity.model.ts
    ├── schemas/
    │   └── lead.schema.ts
    ├── services/
    │   ├── lead.service.ts
    │   ├── pipeline.service.ts
    │   └── scoring.service.ts
    └── routes/
        ├── lead.routes.ts
        ├── pipeline.routes.ts
        └── health.routes.ts
```

**API Endpoints:**

| Method | Path                                | Description                          |
|--------|-------------------------------------|--------------------------------------|
| POST   | `/leads`                            | Create lead                          |
| GET    | `/leads`                            | List leads (filtered, paginated)     |
| GET    | `/leads/:id`                        | Get lead details                     |
| PATCH  | `/leads/:id`                        | Update lead                          |
| DELETE | `/leads/:id`                        | Delete lead                          |
| POST   | `/leads/:id/score`                  | Recalculate lead score               |
| POST   | `/leads/:id/activities`             | Log activity                         |
| GET    | `/leads/:id/activities`             | List activities for lead             |
| POST   | `/leads/pipelines`                  | Create pipeline                      |
| GET    | `/leads/pipelines`                  | List pipelines                       |
| GET    | `/leads/pipelines/:id`              | Get pipeline with stage counts       |
| PATCH  | `/leads/pipelines/:id`              | Update pipeline                      |
| DELETE | `/leads/pipelines/:id`              | Delete pipeline                      |
| POST   | `/leads/:id/move`                   | Move lead to pipeline stage          |
| GET    | `/leads/stats`                      | Lead/pipeline statistics             |
| GET    | `/leads/health`                     | Health check                         |

**Key Features:**
- Automatic lead capture from conversations (via Kafka events)
- Configurable lead scoring (engagement, profile completeness, channel, recency)
- Pipeline management with customizable stages (e.g., New → Qualified → Proposal → Won/Lost)
- Activity logging (email, call, note, meeting, task)
- Lead tagging and custom fields
- Pipeline stage movement with timestamp tracking
- Lead statistics: conversion rates, pipeline velocity, stage distribution
- Kafka events: `lead.created`, `lead.updated`, `lead.scored`, `lead.stage_changed`

**Default Lead Score Factors:**
| Factor              | Weight | Description                    |
|---------------------|--------|--------------------------------|
| Profile completeness| 20     | Has email, phone, company      |
| Engagement          | 30     | Message count, response rate   |
| Recency             | 25     | Last interaction timeframe     |
| Channel             | 15     | Preferred channel weight       |
| Manual boost        | 10     | Agent-assigned score           |

---

### Scheduler Service (Port 3013)

Job scheduling engine for recurring tasks, auto-close policies, SLA enforcement, reminders, and business hours management.

**Tech:** Redis (job queue + state) + Kafka events

**Files:**
```
services/scheduler/
├── package.json
├── tsconfig.json
└── src/
    ├── env.ts
    ├── index.ts
    ├── middleware/
    │   ├── auth.ts
    │   └── error-handler.ts
    ├── utils/
    │   └── redis.ts
    ├── schemas/
    │   └── scheduler.schema.ts
    ├── services/
    │   ├── scheduler.service.ts
    │   ├── cron.service.ts
    │   └── business-hours.service.ts
    └── routes/
        ├── scheduler.routes.ts
        └── health.routes.ts
```

**API Endpoints:**

| Method | Path                            | Description                           |
|--------|---------------------------------|---------------------------------------|
| POST   | `/scheduler/jobs`               | Create a scheduled job                |
| GET    | `/scheduler/jobs`               | List jobs for tenant                  |
| GET    | `/scheduler/jobs/:id`           | Get job details                       |
| PATCH  | `/scheduler/jobs/:id`           | Update job                            |
| DELETE | `/scheduler/jobs/:id`           | Delete/cancel job                     |
| POST   | `/scheduler/jobs/:id/pause`     | Pause job                             |
| POST   | `/scheduler/jobs/:id/resume`    | Resume job                            |
| POST   | `/scheduler/business-hours`     | Set business hours                    |
| GET    | `/scheduler/business-hours`     | Get business hours                    |
| GET    | `/scheduler/business-hours/status`| Check if currently within hours     |
| POST   | `/scheduler/sla`                | Create SLA policy                     |
| GET    | `/scheduler/sla`                | List SLA policies                     |
| GET    | `/scheduler/sla/:id`            | Get SLA policy                        |
| PATCH  | `/scheduler/sla/:id`            | Update SLA policy                     |
| DELETE | `/scheduler/sla/:id`            | Delete SLA policy                     |
| GET    | `/scheduler/health`             | Health check                          |

**Key Features:**
- Cron-style job scheduling with Redis sorted sets
- Job types: `auto_close` (inactive conversations), `reminder`, `report`, `sla_check`, `custom`
- Business hours management per tenant (timezone-aware, per-day schedules)
- SLA policy engine: first response time, resolution time, with priority-based targets
- Job lifecycle: `active` → `paused` / `completed` / `failed`
- Automatic conversation auto-close after configurable inactivity period
- Tick-based execution engine (checks every 30 seconds)
- Kafka events: `scheduler.job.created`, `scheduler.job.executed`, `scheduler.job.failed`, `scheduler.sla.breached`

**Built-in Job Templates:**
| Template        | Description                                  |
|-----------------|----------------------------------------------|
| `auto_close`    | Close resolved conversations after N hours   |
| `sla_check`     | Check SLA breaches every 5 minutes           |
| `daily_report`  | Generate daily analytics summary             |
| `cleanup`       | Purge expired data (logs, temp files)        |

---

### Agent Workspace Service (Port 3014)

Real-time agent console backend providing queue management, conversation routing, SLA timers, agent presence, and canned responses.

**Tech:** Redis (state + queues) + Socket.IO (real-time) + Kafka

**Files:**
```
services/agent-workspace/
├── package.json
├── tsconfig.json
└── src/
    ├── env.ts
    ├── index.ts
    ├── middleware/
    │   ├── auth.ts
    │   └── error-handler.ts
    ├── utils/
    │   └── redis.ts
    ├── schemas/
    │   └── workspace.schema.ts
    ├── services/
    │   ├── queue.service.ts
    │   ├── routing.service.ts
    │   └── canned.service.ts
    └── routes/
        ├── workspace.routes.ts
        └── health.routes.ts
```

**API Endpoints:**

| Method | Path                                 | Description                          |
|--------|--------------------------------------|--------------------------------------|
| GET    | `/workspace/queue`                   | Get agent's conversation queue       |
| POST   | `/workspace/queue/pick`              | Pick next conversation from queue    |
| POST   | `/workspace/queue/:id/return`        | Return conversation to queue         |
| GET    | `/workspace/agents`                  | List online agents with status       |
| PATCH  | `/workspace/agents/status`           | Update agent status (online/away/busy) |
| GET    | `/workspace/agents/:id/metrics`      | Get agent real-time metrics          |
| POST   | `/workspace/routing/rules`           | Create routing rule                  |
| GET    | `/workspace/routing/rules`           | List routing rules                   |
| PATCH  | `/workspace/routing/rules/:id`       | Update routing rule                  |
| DELETE | `/workspace/routing/rules/:id`       | Delete routing rule                  |
| POST   | `/workspace/canned`                  | Create canned response               |
| GET    | `/workspace/canned`                  | List canned responses                |
| PATCH  | `/workspace/canned/:id`              | Update canned response               |
| DELETE | `/workspace/canned/:id`              | Delete canned response               |
| GET    | `/workspace/canned/search`           | Search canned responses by shortcut  |
| GET    | `/workspace/stats`                   | Real-time workspace statistics       |
| GET    | `/workspace/health`                  | Health check                         |

**Key Features:**
- Priority-based conversation queue (urgent → high → medium → low)
- Agent routing strategies: round-robin, least-busy, skill-based, manual
- Agent status management (online, away, busy, offline) with auto-away timeout
- Real-time metrics: active conversations, avg response time, queue depth
- Canned responses with `/shortcut` triggers and category grouping
- Agent capacity limits (max concurrent conversations per agent)
- Conversation return-to-queue with reason tracking
- Kafka events: `workspace.conversation.picked`, `workspace.conversation.returned`, `workspace.agent.status_changed`, `workspace.routing.matched`

**Routing Strategy Details:**
| Strategy     | Description                                       |
|-------------|---------------------------------------------------|
| round_robin  | Distribute evenly across available agents         |
| least_busy   | Assign to agent with fewest active conversations  |
| skill_based  | Match conversation tags to agent skills           |
| manual       | Agent manually picks from queue                   |

---

### Billing Service (Port 3015)

Stripe-powered billing engine with subscription lifecycle management, usage metering, and invoice tracking.

**Tech:** Redis (cache + metering) + Stripe API

**Files:**
```
services/billing/
├── package.json
├── tsconfig.json
└── src/
    ├── env.ts
    ├── index.ts
    ├── middleware/
    │   ├── auth.ts
    │   └── error-handler.ts
    ├── utils/
    │   └── redis.ts
    ├── schemas/
    │   └── billing.schema.ts
    ├── services/
    │   ├── billing.service.ts
    │   ├── usage.service.ts
    │   └── stripe.service.ts
    └── routes/
        ├── billing.routes.ts
        ├── stripe-webhook.routes.ts
        └── health.routes.ts
```

**API Endpoints:**

| Method | Path                                  | Description                          |
|--------|---------------------------------------|--------------------------------------|
| POST   | `/billing/subscriptions`              | Create subscription (Stripe checkout)|
| GET    | `/billing/subscriptions`              | Get tenant's subscription            |
| PATCH  | `/billing/subscriptions`              | Update subscription (change plan)    |
| POST   | `/billing/subscriptions/cancel`       | Cancel subscription                  |
| POST   | `/billing/subscriptions/resume`       | Resume cancelled subscription        |
| GET    | `/billing/invoices`                   | List invoices                        |
| GET    | `/billing/invoices/:id`               | Get invoice details                  |
| GET    | `/billing/usage`                      | Get current usage summary            |
| GET    | `/billing/usage/history`              | Get usage history by period          |
| POST   | `/billing/portal`                     | Create Stripe customer portal link   |
| POST   | `/billing/webhooks/stripe`            | Stripe webhook handler (no auth)     |
| GET    | `/billing/plans`                      | List available plans                 |
| GET    | `/billing/health`                     | Health check                         |

**Key Features:**
- Stripe Checkout Session creation for new subscriptions
- Subscription plan changes with proration
- Stripe Customer Portal for self-service billing management
- Usage metering with Redis counters (conversations, AI tokens, storage, agents)
- Usage-based billing thresholds with notifications
- Stripe webhook handling for payment events (paid, failed, cancelled)
- Invoice history with PDF download links
- Plan tier definitions matching existing tenant tiers (Starter, Growth, Business, Enterprise)
- Kafka events: `billing.subscription.created`, `billing.subscription.updated`, `billing.subscription.cancelled`, `billing.payment.succeeded`, `billing.payment.failed`, `billing.usage.threshold_reached`

**Plan Tiers:**
| Plan       | Price  | Conversations | AI Tokens  | Agents | Storage |
|------------|--------|---------------|------------|--------|---------|
| Starter    | $29/mo | 500/mo        | 100K/mo    | 2      | 100MB   |
| Growth     | $79/mo | 2,000/mo      | 500K/mo    | 5      | 1GB     |
| Business   | $199/mo| 10,000/mo     | 2M/mo      | 20     | 10GB    |
| Enterprise | Custom | Unlimited     | Unlimited  | Unlimited | Unlimited |

**Stripe Webhook Events Handled:**
- `checkout.session.completed` — Subscription created
- `invoice.paid` — Payment successful
- `invoice.payment_failed` — Payment failed
- `customer.subscription.updated` — Plan changed
- `customer.subscription.deleted` — Subscription cancelled

---

## Shared Package Updates

### `packages/shared-types/src/`

| File                | New Types                                                                     |
|---------------------|-------------------------------------------------------------------------------|
| `bot-builder.ts`    | `BotStatus`, `BotNodeType`, `BotNode`, `BotEdge`, `BotFlow`, `Bot`, `BotVersion`, `SimulationStep`, `SimulationResult` |
| `lead-crm.ts`      | `LeadStatus`, `LeadSource`, `Lead`, `PipelineStage`, `Pipeline`, `Activity`, `ActivityType`, `LeadScore`, `LeadStats` |
| `scheduler.ts`     | `JobType`, `JobStatus`, `ScheduledJob`, `BusinessHours`, `DaySchedule`, `SLAPolicy`, `SLAPriority`, `SLATarget` |
| `agent-workspace.ts`| `AgentStatus`, `AgentPresence`, `QueueItem`, `RoutingStrategy`, `RoutingRule`, `CannedResponse`, `WorkspaceStats` |
| `billing.ts`       | `PlanTier`, `PlanDefinition`, `Subscription`, `SubscriptionStatus`, `Invoice`, `UsageSummary`, `UsageRecord`, `BillingEvent` |
| `events.ts`        | `BotCreatedEvent`, `BotPublishedEvent`, `LeadCreatedEvent`, `LeadScoredEvent`, `LeadStageChangedEvent`, `JobExecutedEvent`, `SLABreachedEvent`, `AgentStatusChangedEvent`, `SubscriptionCreatedEvent`, `PaymentSucceededEvent`, `PaymentFailedEvent` — all added to `AssistEvent` union |

### `packages/shared-kafka/src/topics.ts`

25+ new topic constants:
- Bot Builder: `BOT_CREATED`, `BOT_UPDATED`, `BOT_PUBLISHED`, `BOT_UNPUBLISHED`, `BOT_DELETED`, `BOT_SIMULATION_RUN`
- Lead/CRM: `LEAD_CREATED`, `LEAD_UPDATED`, `LEAD_DELETED`, `LEAD_SCORED`, `LEAD_STAGE_CHANGED`, `LEAD_ACTIVITY_LOGGED`, `PIPELINE_CREATED`
- Scheduler: `JOB_CREATED`, `JOB_EXECUTED`, `JOB_FAILED`, `JOB_PAUSED`, `JOB_RESUMED`, `SLA_BREACHED`, `SLA_WARNING`
- Agent Workspace: `AGENT_STATUS_CHANGED`, `CONVERSATION_PICKED`, `CONVERSATION_RETURNED`, `ROUTING_MATCHED`
- Billing: `SUBSCRIPTION_CREATED`, `SUBSCRIPTION_UPDATED`, `SUBSCRIPTION_CANCELLED`, `PAYMENT_SUCCEEDED`, `PAYMENT_FAILED`, `USAGE_THRESHOLD_REACHED`

---

## API Gateway Updates

### New Proxy Routes (in `services/api-gateway/src/index.ts`)

| Prefix       | Upstream Service            |
|-------------|-----------------------------|
| `/bots`     | Bot Builder (3011)          |
| `/leads`    | Lead/CRM (3012)             |
| `/scheduler`| Scheduler (3013)            |
| `/workspace`| Agent Workspace (3014)      |
| `/billing`  | Billing (3015)              |

### New Environment Variables (in `services/api-gateway/src/env.ts`)

```
BOT_BUILDER_SERVICE_URL=http://localhost:3011
LEAD_CRM_SERVICE_URL=http://localhost:3012
SCHEDULER_SERVICE_URL=http://localhost:3013
AGENT_WORKSPACE_SERVICE_URL=http://localhost:3014
BILLING_SERVICE_URL=http://localhost:3015
```

### Updated Health Check

Gateway health route now monitors all 15 downstream services.

---

## Infrastructure Changes

No new infrastructure containers needed for Sprint 4. All services use existing MongoDB, Redis, and Kafka from `docker-compose.infra.yml`.

Billing service requires a Stripe API key (test mode for development):
```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
```

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
| 3011 | Bot Builder       | 4      |
| 3012 | Lead/CRM          | 4      |
| 3013 | Scheduler         | 4      |
| 3014 | Agent Workspace   | 4      |
| 3015 | Billing           | 4      |

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

### 3. Start Sprint 4 Services

```bash
# All at once (from repo root)
pnpm --filter @assist/bot-builder dev &
pnpm --filter @assist/lead-crm dev &
pnpm --filter @assist/scheduler dev &
pnpm --filter @assist/agent-workspace dev &
pnpm --filter @assist/billing dev &

# Or individually
cd services/bot-builder && pnpm dev
cd services/lead-crm && pnpm dev
cd services/scheduler && pnpm dev
cd services/agent-workspace && pnpm dev
cd services/billing && pnpm dev
```

### 4. Verify Health

```bash
# Individual services
curl http://localhost:3011/health  # Bot Builder
curl http://localhost:3012/health  # Lead/CRM
curl http://localhost:3013/health  # Scheduler
curl http://localhost:3014/health  # Agent Workspace
curl http://localhost:3015/health  # Billing

# All via gateway
curl http://localhost:3000/health
```

### 5. Test Endpoints

```bash
# Get auth token
TOKEN=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234!"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['accessToken'])")

# Create a bot
curl -X POST http://localhost:3000/bots \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Welcome Bot","description":"Greets new visitors","trigger":"on_message"}'

# Create a lead
curl -X POST http://localhost:3000/leads \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"email":"john@example.com","name":"John Doe","company":"Acme Inc","source":"web"}'

# Create a scheduled job
curl -X POST http://localhost:3000/scheduler/jobs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"type":"auto_close","cronExpression":"*/30 * * * *","config":{"inactiveHours":24}}'

# Check agent queue
curl http://localhost:3000/workspace/queue \
  -H "Authorization: Bearer $TOKEN"

# Get billing plans
curl http://localhost:3000/billing/plans \
  -H "Authorization: Bearer $TOKEN"
```

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        API Gateway (:3000)                       │
│  /bots  /leads  /scheduler  /workspace  /billing  (+ S1–S3)    │
└──┬──────┬────────┬──────────┬───────────┬───────────────────────┘
   │      │        │          │           │
   ▼      ▼        ▼          ▼           ▼
┌──────┐┌──────┐┌────────┐┌─────────┐┌─────────┐
│ Bot  ││Lead/ ││Sched-  ││ Agent   ││ Billing │
│Build ││ CRM  ││ uler   ││Workspace││         │
│:3011 ││:3012 ││ :3013  ││ :3014   ││ :3015   │
└──┬───┘└──┬───┘└──┬─────┘└──┬──────┘└──┬──────┘
   │       │       │         │          │
   ▼       ▼       ▼         ▼          ▼
┌──────────────────────────────────────────────┐
│                  Kafka (KRaft)                │
│  bot.* / lead.* / scheduler.* / workspace.*  │
│  billing.* topics                            │
└──────────────────────────────────────────────┘
   │       │       │         │          │
   ▼       ▼       ▼         ▼          ▼
┌───────┐┌───────┐┌─────┐┌──────┐┌──────────┐
│MongoDB││MongoDB││Redis││Redis ││  Redis   │
│(bots) ││(leads)││(q's)││(state)││+ Stripe  │
└───────┘└───────┘└─────┘└──────┘└──────────┘
```

---

## What's Next (Sprint 5)

| Deliverable        | Description                                         |
|--------------------|-----------------------------------------------------|
| **Dashboard App**  | React admin panel (Next.js) — analytics, bot builder UI, agent workspace UI, settings |
| **Widget App**     | Embeddable chat widget (Preact/React, <30KB gzipped)|
| **Mobile App**     | Agent mobile app (React Native)                     |
| **E2E Tests**      | Full integration test suite across all services      |
| **API Documentation** | OpenAPI 3.1 spec, developer portal               |
