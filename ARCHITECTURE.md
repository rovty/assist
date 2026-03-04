# Assist by Rovty — Architecture & Technical Blueprint

### **assist.rovty.com** | The World's Best AI Conversational Platform for SMEs

> Omnichannel AI platform that automates customer conversations, captures leads, and provides 24/7 engagement across web and messaging channels — replacing traditional customer service assistants entirely.

---

## Table of Contents

1. [Vision & Market Positioning](#1-vision--market-positioning)
2. [Competitor Analysis](#2-competitor-analysis)
3. [Platform Differentiators](#3-platform-differentiators)
4. [High-Level Architecture](#4-high-level-architecture)
5. [Microservice Catalogue](#5-microservice-catalogue)
6. [Technology Stack Summary](#6-technology-stack-summary)
7. [AI & Intelligence Layer](#7-ai--intelligence-layer)
8. [Channel Integration Architecture](#8-channel-integration-architecture)
9. [Data Architecture](#9-data-architecture)
10. [Infrastructure & DevOps](#10-infrastructure--devops)
11. [Security Architecture](#11-security-architecture)
12. [Frontend Applications](#12-frontend-applications)
13. [API Design & Communication](#13-api-design--communication)
14. [Deployment Architecture](#14-deployment-architecture)
15. [Scalability Strategy](#15-scalability-strategy)
16. [Monorepo Structure](#16-monorepo-structure)
17. [Development Roadmap](#17-development-roadmap)

---

## 1. Vision & Market Positioning

### Vision
Build the **#1 AI-powered conversational platform** that enables SMEs to fully automate customer engagement, lead capture, and support — delivering enterprise-grade intelligence at SME-friendly pricing.

### Problem Statement
- SMEs spend **$15,000–$80,000/year** on customer service agents handling repetitive queries
- 68% of customers prefer self-service over speaking to a human
- Existing solutions are either too expensive (Intercom, Zendesk) or too basic (Tidio, Crisp)
- No single platform offers true AI autonomy + omnichannel + lead capture for SMEs

### Target Market
| Segment | Company Size | Monthly Budget |
|---------|-------------|---------------|
| Starter | 1–10 employees | $29–$79/mo |
| Growth | 11–50 employees | $149–$399/mo |
| Business | 51–200 employees | $499–$999/mo |
| Enterprise | 200+ employees | Custom pricing |

---

## 2. Competitor Analysis

### Direct Competitors

| Platform | Strengths | Weaknesses | Pricing (Starting) |
|----------|-----------|------------|-------------------|
| **Intercom** | Fin AI Agent, unified inbox, product tours | Expensive ($74/seat/mo), complex pricing, overkill for SMEs | $74/seat/mo |
| **Zendesk** | Enterprise-grade, robust ticketing | Clunky AI, slow innovation, expensive | $55/agent/mo |
| **Drift (Salesloft)** | Conversational marketing, ABM focus | Sales-only focus, no true support AI | $2,500/mo |
| **Freshchat** | Affordable, Freddy AI, multi-channel | Limited AI depth, basic bot builder | $19/agent/mo |
| **Tidio** | SME-friendly, easy setup, Lyro AI | Limited channels, basic analytics | $29/mo |
| **Crisp** | Clean UI, affordable, multi-channel | Weak AI, no lead scoring, limited integrations | $25/mo |
| **ManyChat** | Great for social media automation | No web chat, no support use-case | $15/mo |
| **HubSpot Chat** | Free CRM integration | Basic chatbot, no real AI | Free–$800/mo |
| **Ada** | Strong AI, enterprise automation | Enterprise-only, expensive, no SME plans | Custom ($10K+/mo) |
| **Botpress** | Open-source, flexible, developer-friendly | Requires technical skill, no managed hosting | Free–$495/mo |
| **Yellow.ai** | Enterprise conversational AI, multi-lingual | Complex, enterprise-only, not SME-friendly | Custom |
| **Kommunicate** | AI chatbot + human handoff | Limited features, basic UI | $40/mo |

### Competitive Gap Analysis

```
                    AI Autonomy
                        ▲
                        │
            Ada ●       │       ● Assist (TARGET)
                        │      
         Yellow.ai ●    │    
                        │       ● Intercom
          Botpress ●    │
                        │    ● Freshchat
                        │
     ───────────────────┼──────────────────► Ease of Use
                        │         (SME-friendly)
           Zendesk ●    │    ● Tidio
                        │
             Drift ●    │    ● Crisp
                        │
                        │    ● ManyChat
```

### Where Assist Wins

| Capability | Intercom | Zendesk | Tidio | Crisp | **Assist** |
|-----------|----------|---------|-------|-------|-----------|
| AI Autonomy (GPT-4 level) | ✅ | ❌ | ⚠️ | ❌ | ✅ |
| Omnichannel (8+ channels) | ⚠️ | ✅ | ⚠️ | ⚠️ | ✅ |
| Lead Scoring & Capture | ⚠️ | ❌ | ⚠️ | ❌ | ✅ |
| Knowledge Base RAG | ✅ | ⚠️ | ⚠️ | ❌ | ✅ |
| No-Code Bot Builder | ⚠️ | ❌ | ✅ | ❌ | ✅ |
| SME Pricing (<$50/mo) | ❌ | ❌ | ✅ | ✅ | ✅ |
| Human Handoff + AI Copilot | ✅ | ⚠️ | ⚠️ | ⚠️ | ✅ |
| Real-time Analytics | ⚠️ | ✅ | ❌ | ❌ | ✅ |
| Multi-language (50+) | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ✅ |
| White-label | ❌ | ❌ | ❌ | ❌ | ✅ |
| API-first / Headless | ⚠️ | ⚠️ | ❌ | ❌ | ✅ |

---

## 3. Platform Differentiators

### 3.1 AI-First, Not Rules-First
Unlike competitors that bolt AI onto rule-based systems, Assist is **AI-native**. Every conversation starts with AI understanding intent through Azure OpenAI, falling back to flows only when explicitly configured.

### 3.2 Zero-Config Intelligence
Upload your website URL, PDF docs, or FAQ — Assist auto-trains a RAG pipeline and starts answering accurately in **under 5 minutes**. No manual intent training. No dialog trees.

### 3.3 True Omnichannel with Unified Context
One conversation thread persists across Web → WhatsApp → Email → Instagram. The AI remembers context across channels. No competitor does this well for SMEs.

### 3.4 AI Copilot for Human Agents
When conversations escalate to humans, the AI doesn't disappear — it becomes a copilot: suggesting responses, pulling knowledge articles, and summarizing conversation history in real-time.

### 3.5 Built-in Lead Intelligence
Every conversation is a lead opportunity. Assist auto-captures contact info, scores leads based on engagement, and pushes qualified leads to your CRM — without manual configuration.

### 3.6 SME Economics
Flat, predictable pricing. No per-seat charges for AI conversations. Unlimited AI resolutions at every tier. This alone beats Intercom's $0.99/resolution model.

---

## 4. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CLIENT APPLICATIONS                          │
│  ┌──────────┐  ┌───────────┐  ┌──────────┐  ┌───────────────────┐  │
│  │ Chat     │  │ Dashboard │  │ Bot      │  │ Mobile SDK        │  │
│  │ Widget   │  │ (Next.js) │  │ Builder  │  │ (React Native)    │  │
│  │ (Preact) │  │           │  │ (React)  │  │                   │  │
│  └──────────┘  └───────────┘  └──────────┘  └───────────────────┘  │
└─────────────────────────┬───────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      API GATEWAY (Kong/Traefik)                     │
│  ┌─────────────┐  ┌──────────┐  ┌──────────┐  ┌────────────────┐  │
│  │ Rate        │  │ Auth     │  │ Load     │  │ Request        │  │
│  │ Limiting    │  │ Verify   │  │ Balance  │  │ Transform      │  │
│  └─────────────┘  └──────────┘  └──────────┘  └────────────────┘  │
└─────────────────────────┬───────────────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────────┐
│  WebSocket   │ │  REST APIs   │ │  GraphQL         │
│  Gateway     │ │  (Services)  │ │  (Dashboard BFF) │
│  (Socket.io) │ │              │ │                  │
└──────┬───────┘ └──────┬───────┘ └────────┬─────────┘
       │                │                   │
       ▼                ▼                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     SERVICE MESH (Microservices)                     │
│                                                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                │
│  │ Auth        │  │ Tenant      │  │ Conversation │                │
│  │ Service     │  │ Service     │  │ Engine       │                │
│  │ (Node.js)   │  │ (Node.js)   │  │ (Node.js)    │                │
│  └─────────────┘  └─────────────┘  └─────────────┘                │
│                                                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                │
│  │ AI Engine   │  │ Knowledge   │  │ Channel     │                │
│  │ (Python)    │  │ Base Svc    │  │ Gateway     │                │
│  │             │  │ (Python)    │  │ (Node.js)    │                │
│  └─────────────┘  └─────────────┘  └─────────────┘                │
│                                                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                │
│  │ Bot Builder │  │ Lead & CRM  │  │ Analytics   │                │
│  │ Service     │  │ Service     │  │ Service     │                │
│  │ (Node.js)   │  │ (Node.js)   │  │ (Python)    │                │
│  └─────────────┘  └─────────────┘  └─────────────┘                │
│                                                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                │
│  │ Notification│  │ Media       │  │ Agent       │                │
│  │ Service     │  │ Service     │  │ Workspace   │                │
│  │ (Node.js)   │  │ (Node.js)   │  │ (Node.js)    │                │
│  └─────────────┘  └─────────────┘  └─────────────┘                │
│                                                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                │
│  │ Webhook     │  │ Billing     │  │ Scheduler   │                │
│  │ Service     │  │ Service     │  │ Service     │                │
│  │ (Node.js)   │  │ (Node.js)   │  │ (Node.js)    │                │
│  └─────────────┘  └─────────────┘  └─────────────┘                │
│                                                                     │
└────────────────────────┬────────────────────────────────────────────┘
                         │
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ Event Bus    │ │ Cache Layer  │ │ Data Layer   │
│ (Kafka)      │ │ (Redis)      │ │              │
│              │ │              │ │ PostgreSQL   │
│              │ │              │ │ MongoDB      │
│              │ │              │ │ ClickHouse   │
│              │ │              │ │ pgvector     │
│              │ │              │ │ Azure Blob   │
└──────────────┘ └──────────────┘ └──────────────┘
```

---

## 5. Microservice Catalogue

### 5.1 API Gateway
**Purpose:** Single entry point for all client requests. Handles cross-cutting concerns.

| Aspect | Detail |
|--------|--------|
| **Technology** | Kong Gateway (OSS) on Kubernetes |
| **Responsibilities** | Rate limiting, JWT validation, request routing, SSL termination, request/response transformation, CORS, IP whitelisting |
| **Protocols** | HTTP/2, WebSocket upgrade, gRPC passthrough |
| **Scaling** | Horizontal, stateless |

---

### 5.2 Auth Service
**Purpose:** Identity and access management for all platform users and API consumers.

| Aspect | Detail |
|--------|--------|
| **Technology** | Node.js 22 + TypeScript + Fastify |
| **Database** | PostgreSQL 16 |
| **Cache** | Redis (session store, token blacklist) |
| **Auth Methods** | Email/password, Google OAuth, Microsoft SSO, Magic links, API keys |
| **Features** | Multi-tenant RBAC, JWT (RS256) with refresh tokens, 2FA (TOTP), API key management, rate limiting per tenant, password policies |
| **Key Endpoints** | `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/verify-2fa`, `POST /auth/api-keys` |
| **Events Published** | `user.registered`, `user.logged_in`, `user.deactivated` |

---

### 5.3 Tenant Service
**Purpose:** Multi-tenant management — organizations, workspaces, members, and subscription state.

| Aspect | Detail |
|--------|--------|
| **Technology** | Node.js 22 + TypeScript + Fastify |
| **Database** | PostgreSQL 16 |
| **Features** | Organization CRUD, workspace management, member invitations, role assignment, subscription tier tracking, usage quotas, white-label settings (logo, colors, domain) |
| **Key Endpoints** | `POST /tenants`, `GET /tenants/:id`, `POST /tenants/:id/members`, `PUT /tenants/:id/settings`, `GET /tenants/:id/usage` |
| **Events Published** | `tenant.created`, `tenant.plan_changed`, `tenant.quota_exceeded` |
| **Isolation Model** | Shared database, schema-per-tenant for data isolation |

---

### 5.4 Conversation Engine (Core)
**Purpose:** The heart of the platform — manages all conversations, messages, routing, and real-time delivery.

| Aspect | Detail |
|--------|--------|
| **Technology** | Node.js 22 + TypeScript + Fastify + Socket.io |
| **Database** | MongoDB (conversations & messages — flexible schema, high write throughput) |
| **Cache** | Redis (active conversations, presence, typing indicators) |
| **Features** | Real-time messaging via WebSocket, message persistence, conversation state machine (open → assigned → resolved → closed), message threading, read receipts, typing indicators, file attachments, conversation tagging, priority queue |
| **Key Endpoints** | `POST /conversations`, `GET /conversations/:id/messages`, `POST /conversations/:id/messages`, `PUT /conversations/:id/assign`, `PUT /conversations/:id/resolve` |
| **WebSocket Events** | `message.new`, `message.updated`, `typing.start`, `typing.stop`, `conversation.assigned`, `agent.online` |
| **Events Published** | `conversation.created`, `message.sent`, `conversation.resolved`, `conversation.escalated` |

**Conversation State Machine:**
```
  ┌──────┐    AI responds    ┌───────────┐    Needs human    ┌──────────┐
  │ NEW  │ ───────────────► │ AI_ACTIVE │ ────────────────► │ QUEUED   │
  └──────┘                   └───────────┘                   └──────────┘
                                  │                               │
                           AI resolves                      Agent picks up
                                  │                               │
                                  ▼                               ▼
                            ┌──────────┐                   ┌──────────┐
                            │ RESOLVED │ ◄──────────────── │ ASSIGNED │
                            └──────────┘   Agent resolves  └──────────┘
                                  │                               │
                            Auto-close                     Transfer
                            (24h idle)                           │
                                  ▼                               ▼
                            ┌──────────┐                   ┌──────────┐
                            │ CLOSED   │                   │ ASSIGNED │
                            └──────────┘                   │ (new)    │
                                                           └──────────┘
```

---

### 5.5 AI Engine
**Purpose:** The intelligence core — processes messages, generates responses, classifies intent, and orchestrates AI pipelines.

| Aspect | Detail |
|--------|--------|
| **Technology** | Python 3.12 + FastAPI + LangChain/LangGraph |
| **AI Provider** | Azure OpenAI (GPT-4o, GPT-4o-mini, text-embedding-3-large) |
| **Vector Store** | Azure AI Search + pgvector (PostgreSQL) |
| **Cache** | Redis (response caching, conversation context) |
| **Features** | |

**AI Engine Feature Details:**

| Feature | Description |
|---------|-------------|
| **Conversational AI** | Multi-turn conversations with full context using Azure OpenAI GPT-4o |
| **RAG Pipeline** | Retrieval-Augmented Generation from customer knowledge bases |
| **Intent Classification** | Zero-shot and few-shot intent detection using GPT-4o-mini |
| **Sentiment Analysis** | Real-time sentiment scoring per message |
| **Language Detection** | Auto-detect and respond in 50+ languages |
| **Smart Handoff** | AI confidence scoring — escalate to human when confidence < threshold |
| **AI Copilot** | Suggest responses to human agents in real-time |
| **Conversation Summary** | Auto-generate summaries for long conversations |
| **Entity Extraction** | Extract names, emails, phone numbers, order IDs automatically |
| **Tone Matching** | Adjust AI tone (formal, friendly, professional) per tenant |
| **Guardrails** | Content safety filters, PII redaction, hallucination detection |

**Key Endpoints:**
```
POST /ai/chat                    — Generate AI response for a message
POST /ai/classify-intent         — Classify user intent
POST /ai/extract-entities        — Extract entities from text
POST /ai/sentiment               — Analyze message sentiment
POST /ai/summarize               — Summarize conversation
POST /ai/suggest-response        — Copilot suggestion for agents
POST /ai/detect-language         — Detect message language
POST /ai/embed                   — Generate embeddings for text
```

**Events Published:** `ai.response_generated`, `ai.handoff_triggered`, `ai.confidence_low`

**AI Pipeline Flow:**
```
User Message
    │
    ▼
┌─────────────────┐
│ Language Detect  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌──────────────────┐
│ Intent Classify  │────►│ Entity Extract   │
└────────┬────────┘     └────────┬─────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐     ┌──────────────────┐
│ Sentiment Score  │     │ Context Builder  │
└────────┬────────┘     │ (History + RAG)  │
         │              └────────┬─────────┘
         │                       │
         ▼                       ▼
┌─────────────────────────────────────────┐
│         Azure OpenAI GPT-4o             │
│  System Prompt + Context + User Message │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│          Guardrails & Safety            │
│  (PII redaction, content filter, etc.)  │
└────────────────┬────────────────────────┘
                 │
         ┌───────┴───────┐
         ▼               ▼
   Confidence ≥ 0.7  Confidence < 0.7
         │               │
    Send Response    Trigger Handoff
```

---

### 5.6 Knowledge Base Service
**Purpose:** Manages customer knowledge sources (documents, URLs, FAQs) and provides retrieval for the AI engine.

| Aspect | Detail |
|--------|--------|
| **Technology** | Python 3.12 + FastAPI |
| **Vector Store** | Azure AI Search + pgvector |
| **Storage** | Azure Blob Storage (documents) |
| **Database** | PostgreSQL 16 |
| **Features** | Document ingestion (PDF, DOCX, TXT, HTML), URL crawling & scraping, FAQ management, automatic chunking & embedding (text-embedding-3-large), incremental re-indexing, per-tenant vector namespaces, similarity search with re-ranking |
| **Key Endpoints** | `POST /kb/sources` (upload), `POST /kb/sources/url` (crawl), `GET /kb/search` (semantic search), `DELETE /kb/sources/:id`, `POST /kb/reindex` |
| **Events Published** | `kb.source_added`, `kb.indexing_complete`, `kb.source_deleted` |

**Ingestion Pipeline:**
```
Source (PDF/URL/FAQ)
        │
        ▼
┌──────────────────┐
│ Document Loader  │
│ (Unstructured.io)│
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Text Splitter    │
│ (Recursive,      │
│  1000 tokens,    │
│  200 overlap)    │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Embedding        │
│ (text-embedding- │
│  3-large)        │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Vector Store     │
│ (Azure AI Search │
│  + pgvector)     │
└──────────────────┘
```

---

### 5.7 Channel Gateway
**Purpose:** Unified abstraction layer for all messaging channels. Normalizes inbound messages and formats outbound messages per channel.

| Aspect | Detail |
|--------|--------|
| **Technology** | Node.js 22 + TypeScript + Fastify |
| **Cache** | Redis |
| **Features** | |

**Supported Channels:**

| Channel | Protocol | Integration Method |
|---------|----------|-------------------|
| **Web Widget** | WebSocket | Native (Socket.io) |
| **WhatsApp** | REST + Webhook | WhatsApp Business API (Cloud API) |
| **Facebook Messenger** | REST + Webhook | Meta Graph API |
| **Instagram DM** | REST + Webhook | Meta Graph API |
| **Telegram** | REST + Webhook | Telegram Bot API |
| **SMS** | REST + Webhook | Twilio API |
| **Email** | SMTP + Webhook | SendGrid / Azure Communication Services |
| **Slack** | REST + Events API | Slack Bolt SDK |
| **LINE** | REST + Webhook | LINE Messaging API |
| **Viber** | REST + Webhook | Viber Bot API |

**Channel Message Normalization:**
```typescript
// All channels normalize to this unified format
interface UnifiedMessage {
  channelType: 'web' | 'whatsapp' | 'messenger' | 'instagram' | 'telegram' | 'sms' | 'email' | 'slack';
  channelMessageId: string;
  conversationId: string;
  tenantId: string;
  sender: {
    id: string;
    name?: string;
    email?: string;
    phone?: string;
    avatar?: string;
  };
  content: {
    type: 'text' | 'image' | 'video' | 'audio' | 'file' | 'location' | 'template' | 'interactive';
    text?: string;
    mediaUrl?: string;
    mimeType?: string;
    location?: { lat: number; lng: number };
    buttons?: Array<{ id: string; label: string }>;
  };
  metadata: Record<string, unknown>;
  timestamp: Date;
}
```

**Key Endpoints:**
```
POST /channels/:channelType/webhook     — Receive inbound messages
POST /channels/:channelType/send        — Send outbound message
POST /channels/:channelType/connect     — Connect channel credentials
GET  /channels/:tenantId                — List connected channels
DELETE /channels/:channelType/disconnect — Disconnect a channel
```

---

### 5.8 Bot Builder Service
**Purpose:** Visual no-code bot builder — lets users create conversation flows, triggers, and automated sequences.

| Aspect | Detail |
|--------|--------|
| **Technology** | Node.js 22 + TypeScript + Fastify |
| **Database** | MongoDB (flow definitions — complex nested JSON) |
| **Features** | Visual drag-and-drop flow builder, trigger conditions (URL, keyword, event, time), action nodes (message, question, API call, AI handoff, human handoff, tag, assign), conditional branching, variable collection, template library, A/B testing flows, versioning & rollback |

**Flow Node Types:**
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Trigger     │    │  Message    │    │  Question   │
│  (Entry pt)  │───►│  (Send msg) │───►│  (Collect   │
│              │    │             │    │   input)    │
└─────────────┘    └─────────────┘    └──────┬──────┘
                                             │
                   ┌─────────────┐    ┌──────┴──────┐
                   │  AI Node    │    │  Condition  │
                   │  (GPT resp) │◄───│  (Branch)   │
                   └──────┬──────┘    └─────────────┘
                          │
              ┌───────────┴───────────┐
              ▼                       ▼
       ┌─────────────┐        ┌─────────────┐
       │  Action      │        │  Handoff    │
       │  (API call,  │        │  (To human) │
       │   tag, etc.) │        │             │
       └─────────────┘        └─────────────┘
```

---

### 5.9 Lead & CRM Service
**Purpose:** Captures and scores leads from conversations, manages contact profiles, and syncs with external CRMs.

| Aspect | Detail |
|--------|--------|
| **Technology** | Node.js 22 + TypeScript + Fastify |
| **Database** | PostgreSQL 16 |
| **Features** | Auto-capture contact info from conversations (AI entity extraction), lead scoring (engagement-based + AI-based), contact profile enrichment, custom fields & tags, CRM sync (Salesforce, HubSpot, Pipedrive, Zoho), deal/pipeline management, CSV export/import, contact timeline, company grouping |

**Lead Scoring Algorithm:**
```
Score = Σ (Engagement Signals × Weights)

Signals:
  +10  — Started conversation
  +15  — Provided email
  +20  — Provided phone number
  +25  — Asked about pricing
  +30  — Requested demo
  +10  — Multiple conversations
  -5   — Unresponsive (>7 days)
  +AI  — AI-assessed intent score (0-100, weighted at 0.4)
```

**Key Endpoints:**
```
GET    /leads                        — List leads with filters
GET    /leads/:id                    — Get lead details + timeline
POST   /leads                        — Create lead manually
PUT    /leads/:id                    — Update lead
POST   /leads/:id/score              — Recalculate score
POST   /leads/sync/:crmProvider      — Sync with CRM
GET    /leads/export                  — Export CSV
```

---

### 5.10 Analytics Service
**Purpose:** Conversation analytics, performance metrics, AI performance tracking, and business intelligence.

| Aspect | Detail |
|--------|--------|
| **Technology** | Python 3.12 + FastAPI |
| **Database** | ClickHouse (time-series analytics, columnar storage for fast aggregations) |
| **Cache** | Redis (pre-computed dashboards) |
| **Features** | Real-time conversation metrics, AI resolution rate, average response time, CSAT scores, conversation volume trends, channel breakdown, agent performance, lead conversion funnel, sentiment trends, peak hours analysis, custom date ranges, exportable reports |

**Key Metrics:**
```
┌──────────────────────────────────────────────────────┐
│                  DASHBOARD METRICS                    │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Active Conversations    AI Resolution Rate           │
│  ████████ 142            ████████████ 87.3%           │
│                                                      │
│  Avg Response Time       CSAT Score                   │
│  ██████ 1.2s             ████████████ 4.6/5           │
│                                                      │
│  Leads Captured Today    Human Handoff Rate           │
│  ████████████ 34         ███ 12.7%                    │
│                                                      │
│  Messages Today          Cost Saved (vs Human)        │
│  ████████████████ 2,847  ████████████████ $4,200      │
│                                                      │
└──────────────────────────────────────────────────────┘
```

**Key Endpoints:**
```
GET /analytics/overview              — Dashboard overview
GET /analytics/conversations         — Conversation metrics
GET /analytics/ai-performance        — AI resolution & confidence
GET /analytics/agents                — Agent performance
GET /analytics/leads                 — Lead funnel analytics
GET /analytics/channels              — Channel breakdown
GET /analytics/sentiment             — Sentiment trends
GET /analytics/export                — Export report (PDF/CSV)
```

---

### 5.11 Notification Service
**Purpose:** Manages all outbound notifications — push, email, SMS, and in-app alerts.

| Aspect | Detail |
|--------|--------|
| **Technology** | Node.js 22 + TypeScript + Fastify |
| **Queue** | Apache Kafka (guaranteed delivery) |
| **Features** | Email notifications (SendGrid), push notifications (Firebase FCM), SMS alerts (Twilio), in-app notifications (WebSocket), notification preferences per user, template management, delivery tracking, batching & deduplication |
| **Events Consumed** | `conversation.escalated`, `lead.qualified`, `agent.mentioned`, `tenant.quota_exceeded` |

---

### 5.12 Media Service
**Purpose:** Handle file uploads, image processing, and media storage for all conversations.

| Aspect | Detail |
|--------|--------|
| **Technology** | Node.js 22 + TypeScript + Fastify + Sharp |
| **Storage** | Azure Blob Storage |
| **CDN** | Azure CDN (global delivery) |
| **Features** | Image upload & resize (thumbnails, previews), video/audio upload, document upload (PDF, DOCX), virus scanning (ClamAV), file size limits per tenant tier, signed URLs (time-limited access), automatic format conversion (WebP), compression |
| **Key Endpoints** | `POST /media/upload`, `GET /media/:id`, `DELETE /media/:id` |
| **Limits** | Starter: 100MB, Growth: 1GB, Business: 10GB, Enterprise: Unlimited |

---

### 5.13 Agent Workspace Service
**Purpose:** Backend for the human agent dashboard — queue management, assignment, and agent tools.

| Aspect | Detail |
|--------|--------|
| **Technology** | Node.js 22 + TypeScript + Fastify + Socket.io |
| **Database** | PostgreSQL 16 + Redis |
| **Features** | Conversation queue with priority, round-robin & skill-based assignment, agent availability/status (online, away, busy, offline), conversation transfer, internal notes, canned responses, AI copilot suggestions, SLA timers, concurrent conversation limit, team management |

**Agent Assignment Flow:**
```
New Escalated Conversation
         │
         ▼
┌─────────────────────┐
│ Check Bot Builder   │──── Has specific team? ──► Assign to team queue
│ flow routing rules  │
└─────────┬───────────┘
          │ No specific rule
          ▼
┌─────────────────────┐
│ Skill-based matching│──── Match by language, topic, channel
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ Load balancing      │──── Agent with fewest active conversations
│ (Round-robin +      │     who is online and under capacity
│  least-loaded)      │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ Assign + Notify     │──── Push notification + WebSocket event
└─────────────────────┘
```

---

### 5.14 Webhook Service
**Purpose:** Outbound webhook delivery for tenant integrations and event streaming.

| Aspect | Detail |
|--------|--------|
| **Technology** | Node.js 22 + TypeScript + Fastify |
| **Queue** | Apache Kafka |
| **Features** | Configurable webhook endpoints per tenant, event filtering, HMAC signature verification, automatic retries (exponential backoff: 1m, 5m, 30m, 2h, 12h), delivery logs, payload transformation, webhook testing tool |
| **Subscribable Events** | `conversation.*`, `message.*`, `lead.*`, `agent.*`, `ai.*` |

---

### 5.15 Billing Service
**Purpose:** Subscription management, usage metering, and payment processing.

| Aspect | Detail |
|--------|--------|
| **Technology** | Node.js 22 + TypeScript + Fastify |
| **Database** | PostgreSQL 16 |
| **Payment Provider** | Stripe |
| **Features** | Plan management (Starter, Growth, Business, Enterprise), usage-based metering (AI messages, contacts, storage), Stripe checkout & customer portal, invoice generation, proration on plan changes, usage alerts & quota enforcement, free trial management, coupon/discount codes |

**Pricing Model:**
```
┌─────────────────────────────────────────────────────────────────────┐
│ Plan       │ Monthly  │ AI Messages │ Contacts │ Channels │ Agents │
├────────────┼──────────┼─────────────┼──────────┼──────────┼────────┤
│ Starter    │ $29      │ 1,000/mo    │ 500      │ 3        │ 1      │
│ Growth     │ $79      │ 5,000/mo    │ 2,500    │ 6        │ 3      │
│ Business   │ $199     │ 20,000/mo   │ 10,000   │ 10       │ 10     │
│ Enterprise │ Custom   │ Unlimited   │ Unlimited│ All      │ Unlim  │
└─────────────────────────────────────────────────────────────────────┘
```

---

### 5.16 Scheduler Service
**Purpose:** Cron-based and event-driven scheduled tasks across the platform.

| Aspect | Detail |
|--------|--------|
| **Technology** | Node.js 22 + TypeScript + BullMQ |
| **Queue** | Redis (BullMQ) |
| **Features** | Conversation auto-close (24h idle), scheduled messages, KB re-indexing schedule, analytics aggregation, usage quota reset, trial expiry checks, SLA breach alerts, data retention cleanup |

---

## 6. Technology Stack Summary

### Backend Services

| Layer | Technology | Justification |
|-------|-----------|---------------|
| **Runtime (APIs)** | Node.js 22 + TypeScript | Performance, type safety, massive ecosystem, excellent WebSocket support |
| **Runtime (AI/ML)** | Python 3.12 | Best AI/ML ecosystem, LangChain, Azure OpenAI SDK |
| **API Framework (Node)** | Fastify | 2x faster than Express, schema validation, TypeScript-native |
| **API Framework (Python)** | FastAPI | Async, auto-docs, Pydantic validation, production-ready |
| **WebSocket** | Socket.io | Reliable real-time, rooms/namespaces, auto-reconnect, fallback |
| **API Gateway** | Kong Gateway (OSS) | Plugin ecosystem, rate limiting, auth, zero-downtime |
| **Message Broker** | Apache Kafka | Event sourcing, guaranteed delivery, high throughput, replay |
| **Task Queue** | BullMQ (Redis-backed) | Delayed jobs, cron, retries, concurrency control |
| **GraphQL** | Mercurius (Fastify) | Dashboard BFF, flexible queries, subscriptions |

### Databases

| Database | Use Case | Justification |
|----------|----------|---------------|
| **PostgreSQL 16** | Auth, tenants, leads, billing, agents | ACID, relational data, pgvector for embeddings |
| **MongoDB 7** | Conversations, messages, bot flows | Flexible schema, high write throughput, TTL indexes |
| **ClickHouse** | Analytics & metrics | Columnar storage, 100x faster aggregations than PostgreSQL |
| **Redis 7** | Cache, sessions, pub/sub, queues | Sub-ms latency, pub/sub for real-time, BullMQ backend |
| **Azure AI Search** | Vector search (primary) | Managed, hybrid search (vector + keyword), semantic re-ranking |
| **pgvector** | Vector search (fallback) | Co-located with PostgreSQL, simpler for smaller datasets |

### AI & Intelligence

| Component | Technology |
|-----------|-----------|
| **LLM (Primary)** | Azure OpenAI GPT-4o |
| **LLM (Fast/Cheap)** | Azure OpenAI GPT-4o-mini |
| **Embeddings** | Azure OpenAI text-embedding-3-large (3072 dims) |
| **Orchestration** | LangChain + LangGraph (agentic workflows) |
| **Guardrails** | Azure AI Content Safety + custom PII detector |
| **Document Processing** | Unstructured.io |
| **Observability** | LangSmith (LLM tracing & evaluation) |

### Infrastructure

| Component | Technology |
|-----------|-----------|
| **Container Orchestration** | Kubernetes (Azure AKS) |
| **Container Runtime** | Docker |
| **CI/CD** | GitHub Actions |
| **IaC** | Terraform + Helm Charts |
| **Service Mesh** | Linkerd (lightweight, Rust-based) |
| **API Documentation** | OpenAPI 3.1 + Swagger UI |
| **Monitoring** | Prometheus + Grafana |
| **Logging** | Loki + Grafana (or ELK) |
| **Tracing** | Jaeger (OpenTelemetry) |
| **Error Tracking** | Sentry |
| **Secrets** | Azure Key Vault |
| **DNS & CDN** | Azure Front Door + Azure CDN |
| **Object Storage** | Azure Blob Storage |
| **Email** | SendGrid |
| **SMS** | Twilio |
| **Push Notifications** | Firebase Cloud Messaging |

### Frontend

| Application | Technology | Purpose |
|------------|-----------|---------|
| **Dashboard** | Next.js 15 + React 19 + TypeScript | Admin panel, analytics, settings |
| **Chat Widget** | Preact + TypeScript | Embedded widget (<30KB gzipped) |
| **Bot Builder** | React 19 + React Flow | Visual flow editor |
| **Mobile Admin** | React Native (Expo) | Agent mobile app |
| **UI Components** | Tailwind CSS + shadcn/ui | Consistent design system |
| **State Management** | Zustand + React Query | Server state + client state |
| **Real-time** | Socket.io-client | Live updates |

---

## 7. AI & Intelligence Layer

### 7.1 Azure OpenAI Configuration

```
Azure OpenAI Resource:
├── Deployment: gpt-4o (2024-11-20)
│   ├── Use: Primary conversational AI, complex reasoning
│   ├── TPM: 150K tokens/minute
│   └── Region: East US 2
│
├── Deployment: gpt-4o-mini (2024-07-18)
│   ├── Use: Intent classification, entity extraction, sentiment
│   ├── TPM: 500K tokens/minute
│   └── Region: East US 2
│
└── Deployment: text-embedding-3-large
    ├── Use: Document & query embeddings
    ├── TPM: 350K tokens/minute
    └── Region: East US 2
```

### 7.2 RAG Architecture

```
┌────────────────────────────────────────────────────────┐
│                   QUERY PIPELINE                        │
│                                                        │
│  User Question                                         │
│       │                                                │
│       ▼                                                │
│  ┌──────────────┐                                      │
│  │ Query        │  Rewrite query for better retrieval  │
│  │ Rewriting    │  using GPT-4o-mini                   │
│  └──────┬───────┘                                      │
│         │                                              │
│         ▼                                              │
│  ┌──────────────┐     ┌──────────────┐                 │
│  │ Vector       │     │ Keyword      │                 │
│  │ Search       │     │ Search       │                 │
│  │ (Semantic)   │     │ (BM25)       │                 │
│  └──────┬───────┘     └──────┬───────┘                 │
│         │                    │                          │
│         └────────┬───────────┘                          │
│                  ▼                                      │
│         ┌──────────────┐                                │
│         │ Reciprocal   │  Combine & re-rank results    │
│         │ Rank Fusion  │                                │
│         └──────┬───────┘                                │
│                │                                        │
│                ▼                                        │
│         ┌──────────────┐                                │
│         │ Cross-Encoder│  Re-rank top-20 to top-5      │
│         │ Re-ranking   │                                │
│         └──────┬───────┘                                │
│                │                                        │
│                ▼                                        │
│         Top-5 Relevant Chunks                           │
│                │                                        │
│                ▼                                        │
│  ┌──────────────────────────────────┐                   │
│  │        GENERATION (GPT-4o)       │                   │
│  │                                  │                   │
│  │  System Prompt (tenant-specific) │                   │
│  │  + Retrieved Context Chunks      │                   │
│  │  + Conversation History (last 10)│                   │
│  │  + User Message                  │                   │
│  │                                  │                   │
│  │  → Generated Response            │                   │
│  │  → Confidence Score              │                   │
│  │  → Source References             │                   │
│  └──────────────────────────────────┘                   │
└────────────────────────────────────────────────────────┘
```

### 7.3 AI Safety & Guardrails

| Guardrail | Implementation |
|-----------|---------------|
| **Content Safety** | Azure AI Content Safety API — blocks harmful/inappropriate content |
| **PII Detection** | Custom regex + Microsoft Presidio — detects and redacts sensitive data |
| **Hallucination Check** | Groundedness check — verify response is grounded in retrieved context |
| **Token Limits** | Max 4096 output tokens, max 8192 context window per turn |
| **Rate Limiting** | Per-tenant AI message quota enforcement |
| **Prompt Injection** | Input sanitization + system prompt hardening |
| **Fallback** | If AI fails, graceful fallback to "Let me connect you with a human agent" |

---

## 8. Channel Integration Architecture

### Message Flow (Inbound)

```
External Channel (WhatsApp, Messenger, etc.)
        │
        │  Webhook POST
        ▼
┌─────────────────────┐
│   Channel Gateway   │
│   • Verify webhook  │
│   • Parse payload   │
│   • Normalize to    │
│     UnifiedMessage  │
└─────────┬───────────┘
          │
          │  Kafka: channel.message.inbound
          ▼
┌─────────────────────┐
│ Conversation Engine │
│   • Find/create     │
│     conversation    │
│   • Store message   │
│   • Route to AI     │
└─────────┬───────────┘
          │
          │  Kafka: conversation.message.new
          ▼
┌─────────────────────┐
│     AI Engine       │         (if AI-handled)
│   • Process message │
│   • Generate reply  │
└─────────┬───────────┘
          │
          │  Kafka: ai.response.ready
          ▼
┌─────────────────────┐
│ Conversation Engine │
│   • Store AI reply  │
│   • Emit WebSocket  │
└─────────┬───────────┘
          │
          │  Kafka: channel.message.outbound
          ▼
┌─────────────────────┐
│   Channel Gateway   │
│   • Format for      │
│     target channel  │
│   • Send via API    │
└─────────────────────┘
```

### Cross-Channel Context

```
Customer starts on Web Widget:
  "Hi, I need help with my order #12345"
       │
       │  (AI responds, conversation ongoing)
       │
Customer continues on WhatsApp:
  "Hey, following up on my order issue"
       │
       │  Contact matched by phone/email
       │  Previous context loaded
       │  AI continues seamlessly
       ▼
  "Hi Sarah! I see you were asking about order #12345 earlier.
   The tracking shows it's out for delivery today."
```

---

## 9. Data Architecture

### 9.1 Database Schema Overview

**PostgreSQL (Relational Data)**
```sql
-- Auth & Identity
tenants (id, name, slug, plan_id, settings, created_at)
users (id, tenant_id, email, password_hash, role, status)
api_keys (id, tenant_id, key_hash, name, scopes, expires_at)

-- Leads & Contacts
contacts (id, tenant_id, email, phone, name, company, metadata, score)
contact_events (id, contact_id, event_type, data, timestamp)
lead_scores (id, contact_id, score, factors, calculated_at)

-- Agent Management
agents (id, tenant_id, user_id, status, max_conversations, skills)
teams (id, tenant_id, name, assignment_rule)
team_members (team_id, agent_id)

-- Billing
plans (id, name, price, limits, features)
subscriptions (id, tenant_id, plan_id, stripe_subscription_id, status)
usage_records (id, tenant_id, metric, count, period_start, period_end)

-- Knowledge Base
kb_sources (id, tenant_id, type, name, url, status, last_indexed_at)
kb_chunks (id, source_id, content, embedding, metadata, chunk_index)

-- Channels
channel_connections (id, tenant_id, channel_type, credentials, status)
```

**MongoDB (Conversations)**
```javascript
// conversations collection
{
  _id: ObjectId,
  tenantId: string,
  contactId: string,
  channel: string,
  status: "new" | "ai_active" | "queued" | "assigned" | "resolved" | "closed",
  assignedAgentId: string | null,
  tags: string[],
  priority: "low" | "medium" | "high" | "urgent",
  aiConfidence: number,
  sentimentScore: number,
  metadata: {},
  createdAt: Date,
  updatedAt: Date,
  resolvedAt: Date | null
}

// messages collection
{
  _id: ObjectId,
  conversationId: ObjectId,
  tenantId: string,
  sender: { type: "contact" | "ai" | "agent", id: string },
  content: {
    type: "text" | "image" | "file" | "template" | "system",
    text: string,
    mediaUrl: string,
    buttons: [{ id: string, label: string }]
  },
  aiMetadata: {
    model: string,
    confidence: number,
    intent: string,
    sources: [{ chunkId: string, score: number }]
  },
  readBy: [{ userId: string, readAt: Date }],
  createdAt: Date
}

// bot_flows collection
{
  _id: ObjectId,
  tenantId: string,
  name: string,
  version: number,
  status: "draft" | "active" | "archived",
  trigger: { type: string, conditions: {} },
  nodes: [{
    id: string,
    type: string,
    data: {},
    position: { x: number, y: number },
    connections: [{ targetId: string, condition: string }]
  }],
  createdAt: Date,
  updatedAt: Date
}
```

**ClickHouse (Analytics)**
```sql
-- Event-based analytics (append-only, immutable)
CREATE TABLE conversation_events (
  tenant_id String,
  conversation_id String,
  event_type Enum('created', 'ai_response', 'human_handoff', 'resolved', 'closed'),
  channel String,
  response_time_ms UInt32,
  ai_confidence Float32,
  sentiment_score Float32,
  agent_id Nullable(String),
  timestamp DateTime
) ENGINE = MergeTree()
ORDER BY (tenant_id, timestamp);

CREATE TABLE message_events (
  tenant_id String,
  conversation_id String,
  message_id String,
  sender_type Enum('contact', 'ai', 'agent'),
  channel String,
  word_count UInt16,
  language String,
  timestamp DateTime
) ENGINE = MergeTree()
ORDER BY (tenant_id, timestamp);
```

### 9.2 Data Flow & Event Bus

```
┌──────────────────────────────────────────────────────────────┐
│                    KAFKA TOPIC STRUCTURE                      │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  assist.auth.events            → User lifecycle events       │
│  assist.tenant.events          → Tenant lifecycle events     │
│  assist.conversation.events    → Conversation state changes  │
│  assist.message.events         → All message events          │
│  assist.channel.inbound        → Inbound channel messages    │
│  assist.channel.outbound       → Outbound channel messages   │
│  assist.ai.events              → AI processing events        │
│  assist.lead.events            → Lead scoring & updates      │
│  assist.analytics.events       → Analytics ingestion         │
│  assist.notification.events    → Notification triggers       │
│  assist.webhook.events         → Outbound webhook delivery   │
│  assist.billing.events         → Usage & billing events      │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 10. Infrastructure & DevOps

### 10.1 Kubernetes Architecture (AKS)

```
Azure Kubernetes Service (AKS)
├── Namespace: assist-gateway
│   ├── Kong Gateway (3 replicas)
│   └── Ingress Controller
│
├── Namespace: assist-services
│   ├── auth-service (3 replicas)
│   ├── tenant-service (2 replicas)
│   ├── conversation-engine (5 replicas)     ← Highest traffic
│   ├── ai-engine (4 replicas, GPU nodes)    ← Compute intensive
│   ├── knowledge-base-service (2 replicas)
│   ├── channel-gateway (3 replicas)
│   ├── bot-builder-service (2 replicas)
│   ├── lead-crm-service (2 replicas)
│   ├── analytics-service (2 replicas)
│   ├── notification-service (2 replicas)
│   ├── media-service (2 replicas)
│   ├── agent-workspace-service (3 replicas)
│   ├── webhook-service (2 replicas)
│   ├── billing-service (2 replicas)
│   └── scheduler-service (1 replica)        ← Leader election
│
├── Namespace: assist-data
│   ├── PostgreSQL (Azure Database for PostgreSQL Flexible Server — managed)
│   ├── MongoDB (Azure Cosmos DB for MongoDB — managed)
│   ├── Redis (Azure Cache for Redis — managed, Premium tier)
│   ├── ClickHouse (self-hosted, 3-node cluster)
│   └── Kafka (Azure Event Hubs with Kafka protocol — managed)
│
├── Namespace: assist-monitoring
│   ├── Prometheus
│   ├── Grafana
│   ├── Loki (log aggregation)
│   ├── Jaeger (distributed tracing)
│   └── Sentry (error tracking)
│
└── Namespace: assist-frontend
    ├── dashboard-web (3 replicas)
    └── widget-cdn (served via Azure CDN)
```

### 10.2 CI/CD Pipeline (GitHub Actions)

```
┌─────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  Push   │───►│  Lint &  │───►│  Unit    │───►│  Build   │───►│  Push    │
│  to PR  │    │  Type    │    │  Tests   │    │  Docker  │    │  to ACR  │
└─────────┘    │  Check   │    │  (Jest/  │    │  Images  │    │  (Azure  │
               └──────────┘    │  Pytest) │    └──────────┘    │  Container│
                               └──────────┘                    │  Registry)│
                                                               └────┬─────┘
                                                                    │
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐       │
│ Notify   │◄───│ Deploy   │◄───│ E2E      │◄───│ Deploy   │◄──────┘
│ Slack    │    │ Prod     │    │ Tests    │    │ Staging  │
│          │    │ (Blue/   │    │ (Playwright│   │ (Auto)   │
└──────────┘    │  Green)  │    │  + K6)   │    └──────────┘
               └──────────┘    └──────────┘
```

### 10.3 Monitoring & Alerting

| Metric | Warning | Critical | Action |
|--------|---------|----------|--------|
| API Response Time (p95) | > 500ms | > 2s | Scale up replicas |
| AI Response Time (p95) | > 3s | > 8s | Check Azure OpenAI quotas |
| Error Rate | > 1% | > 5% | Page on-call engineer |
| Kafka Consumer Lag | > 1,000 | > 10,000 | Scale consumers |
| CPU Usage | > 70% | > 90% | HPA auto-scales |
| Memory Usage | > 75% | > 90% | Check for leaks, scale |
| Database Connections | > 80% pool | > 95% pool | Increase pool size |
| WebSocket Connections | > 50K/node | > 80K/node | Add nodes |

---

## 11. Security Architecture

### 11.1 Authentication Flow

```
┌──────────┐                    ┌──────────────┐                 ┌────────────┐
│  Client  │ ── Login ────────► │ Auth Service │ ── Verify ────► │ PostgreSQL │
│          │                    │              │                  │            │
│          │ ◄── JWT (RS256) ── │              │ ◄── User Data ─ │            │
│          │     + Refresh Token│              │                  │            │
└──────────┘                    └──────────────┘                 └────────────┘
     │
     │  JWT in Authorization header
     ▼
┌──────────────┐
│ Kong Gateway │ ── Verify JWT signature (public key)
│              │ ── Check expiry
│              │ ── Extract tenant_id, user_id, role
│              │ ── Add to X-Tenant-ID, X-User-ID headers
│              │ ── Route to service
└──────────────┘
```

### 11.2 Security Measures

| Layer | Measure |
|-------|---------|
| **Transport** | TLS 1.3 everywhere, HSTS, certificate pinning |
| **Authentication** | JWT (RS256, 15min expiry), refresh tokens (7d, rotation), 2FA (TOTP) |
| **Authorization** | RBAC (Owner, Admin, Agent, Viewer), per-tenant data isolation |
| **API Security** | Rate limiting, request size limits, API key scoping, CORS whitelist |
| **Data Encryption** | AES-256 at rest (Azure SSE), TLS in transit, field-level encryption for PII |
| **Secrets** | Azure Key Vault, no secrets in code, rotated quarterly |
| **Input Validation** | JSON Schema validation (Ajv/Pydantic), SQL injection prevention (parameterized), XSS prevention (DOMPurify) |
| **Compliance** | GDPR (data export/delete), SOC 2 Type II readiness, CCPA |
| **Audit Logging** | All admin actions logged, immutable audit trail in ClickHouse |
| **Vulnerability Scanning** | Dependabot, Snyk, Trivy (container scanning) |

---

## 12. Frontend Applications

### 12.1 Dashboard (Next.js)

```
dashboard/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/
│   │   ├── conversations/        # Inbox view
│   │   ├── contacts/             # Lead management
│   │   ├── analytics/            # Metrics & reports
│   │   ├── bot-builder/          # Visual flow editor
│   │   ├── knowledge-base/       # KB management
│   │   ├── channels/             # Channel connections
│   │   ├── team/                 # Agent & team management
│   │   ├── settings/             # Workspace settings
│   │   └── billing/              # Plan & usage
│   └── layout.tsx
├── components/
│   ├── ui/                       # shadcn/ui components
│   ├── conversations/            # Chat UI components
│   ├── analytics/                # Chart components
│   └── bot-builder/              # Flow editor components
├── lib/
│   ├── api/                      # API client (React Query)
│   ├── socket/                   # Socket.io client
│   └── stores/                   # Zustand stores
└── public/
```

### 12.2 Chat Widget (Preact)

Embeddable widget, **< 30KB gzipped**, loads asynchronously, no layout shift.

```html
<!-- Embed code (provided to customers) -->
<script>
  (function(w,d,s,o,f,js,fjs){
    w['AssistWidget']=o;w[o]=w[o]||function(){(w[o].q=w[o].q||[]).push(arguments)};
    js=d.createElement(s);fjs=d.getElementsByTagName(s)[0];
    js.id=o;js.src=f;js.async=1;fjs.parentNode.insertBefore(js,fjs);
  }(window,document,'script','assist','https://widget.assist.rovty.com/v1/assist.js'));
  assist('init', { workspaceId: 'ws_xxxxxx' });
</script>
```

**Widget Features:**
- Real-time chat with AI & human agents
- Rich messages (images, buttons, carousels, forms)
- Typing indicators & read receipts
- File upload (drag & drop)
- Pre-chat forms (name, email)
- Offline message collection
- Multi-language auto-detection
- Custom branding (colors, logo, position, welcome message)
- Mobile responsive
- Accessibility (WCAG 2.1 AA)

---

## 13. API Design & Communication

### 13.1 Inter-Service Communication

| Pattern | Use Case | Technology |
|---------|----------|-----------|
| **Synchronous (REST)** | CRUD operations, real-time queries | HTTP/2 via Fastify |
| **Synchronous (gRPC)** | High-performance internal calls (AI Engine ↔ KB) | gRPC + Protobuf |
| **Asynchronous (Events)** | Event-driven workflows, eventual consistency | Apache Kafka |
| **Real-time (WebSocket)** | Client ↔ Server live updates | Socket.io |
| **GraphQL** | Dashboard BFF (flexible frontend queries) | Mercurius |

### 13.2 API Versioning Strategy

```
Base URL: https://api.assist.rovty.com

REST:     /v1/conversations, /v1/leads
GraphQL:  /graphql (with schema versioning)
WebSocket: wss://ws.assist.rovty.com/v1
Webhooks:  POST https://customer-url.com (with X-Assist-Version header)
```

### 13.3 API Rate Limits

| Plan | REST API | WebSocket | AI Messages |
|------|----------|-----------|-------------|
| Starter | 100 req/min | 5 connections | 1,000/mo |
| Growth | 500 req/min | 20 connections | 5,000/mo |
| Business | 2,000 req/min | 100 connections | 20,000/mo |
| Enterprise | Custom | Custom | Unlimited |

---

## 14. Deployment Architecture

### 14.1 Multi-Region Setup (Phase 2)

```
                    ┌───────────────────┐
                    │  Azure Front Door │
                    │  (Global LB + WAF)│
                    └─────────┬─────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
     ┌────────────┐  ┌────────────┐  ┌────────────┐
     │  East US   │  │  West EU   │  │  SE Asia   │
     │  (Primary) │  │  (EU Data) │  │  (APAC)    │
     │  AKS       │  │  AKS       │  │  AKS       │
     └────────────┘  └────────────┘  └────────────┘
```

### 14.2 Azure Resource Map

| Resource | Azure Service | Tier |
|----------|--------------|------|
| Kubernetes | AKS | Standard |
| PostgreSQL | Azure Database for PostgreSQL Flexible Server | General Purpose |
| MongoDB | Azure Cosmos DB (MongoDB API) | Standard |
| Redis | Azure Cache for Redis | Premium (P1) |
| Kafka | Azure Event Hubs (Kafka) | Standard |
| AI | Azure OpenAI Service | S0 |
| Search | Azure AI Search | Standard S1 |
| Storage | Azure Blob Storage | Hot tier |
| CDN | Azure CDN (Microsoft) | Standard |
| DNS | Azure DNS | — |
| Key Vault | Azure Key Vault | Standard |
| Container Registry | Azure Container Registry | Standard |
| Monitoring | Azure Monitor + Managed Grafana | — |

---

## 15. Scalability Strategy

### 15.1 Scaling Targets

| Metric | Year 1 | Year 2 | Year 3 |
|--------|--------|--------|--------|
| Tenants | 500 | 5,000 | 50,000 |
| Daily Conversations | 50K | 500K | 5M |
| Daily Messages | 500K | 5M | 50M |
| Concurrent WebSocket | 10K | 100K | 1M |
| AI Messages/day | 100K | 1M | 10M |

### 15.2 Scaling Strategies

| Challenge | Strategy |
|-----------|---------|
| **WebSocket Scale** | Socket.io with Redis adapter, horizontal scaling, sticky sessions |
| **Database Scale** | Read replicas, connection pooling (PgBouncer), sharding by tenant_id |
| **AI Scale** | Azure OpenAI PTU (Provisioned Throughput), request queuing, response caching |
| **Kafka Scale** | Partition by tenant_id, consumer groups per service, retention policies |
| **Search Scale** | Azure AI Search replica scaling, index partitioning |
| **CDN** | Widget served globally via Azure CDN, 50ms load times |
| **Cost Optimization** | Spot instances for non-critical workloads, auto-scaling policies, reserved instances |

---

## 16. Monorepo Structure

```
assist/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                    # Lint, test, build
│   │   ├── cd-staging.yml            # Deploy to staging
│   │   ├── cd-production.yml         # Deploy to production
│   │   └── security-scan.yml         # Vulnerability scanning
│   └── CODEOWNERS
│
├── apps/
│   ├── dashboard/                    # Next.js 15 dashboard
│   │   ├── src/
│   │   ├── package.json
│   │   └── Dockerfile
│   │
│   ├── widget/                       # Preact chat widget
│   │   ├── src/
│   │   ├── package.json
│   │   └── Dockerfile
│   │
│   └── mobile/                       # React Native agent app
│       ├── src/
│       └── package.json
│
├── services/
│   ├── auth/                         # Auth Service (Node.js)
│   │   ├── src/
│   │   │   ├── routes/
│   │   │   ├── services/
│   │   │   ├── models/
│   │   │   ├── middleware/
│   │   │   ├── events/
│   │   │   ├── utils/
│   │   │   └── index.ts
│   │   ├── tests/
│   │   ├── prisma/                   # Prisma ORM schema
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── Dockerfile
│   │
│   ├── tenant/                       # Tenant Service
│   ├── conversation/                 # Conversation Engine
│   ├── ai-engine/                    # AI Engine (Python)
│   │   ├── src/
│   │   │   ├── api/
│   │   │   ├── chains/               # LangChain chains
│   │   │   ├── agents/               # LangGraph agents
│   │   │   ├── prompts/              # System prompts
│   │   │   ├── guardrails/           # Safety filters
│   │   │   ├── models/
│   │   │   └── main.py
│   │   ├── tests/
│   │   ├── pyproject.toml
│   │   └── Dockerfile
│   │
│   ├── knowledge-base/               # KB Service (Python)
│   ├── channel-gateway/              # Channel Gateway
│   ├── bot-builder/                  # Bot Builder Service
│   ├── lead-crm/                     # Lead & CRM Service
│   ├── analytics/                    # Analytics Service (Python)
│   ├── notification/                 # Notification Service
│   ├── media/                        # Media Service
│   ├── agent-workspace/              # Agent Workspace Service
│   ├── webhook/                      # Webhook Service
│   ├── billing/                      # Billing Service
│   └── scheduler/                    # Scheduler Service
│
├── packages/
│   ├── shared-types/                 # Shared TypeScript types
│   │   ├── src/
│   │   └── package.json
│   │
│   ├── shared-utils/                 # Shared utilities
│   │   ├── src/
│   │   └── package.json
│   │
│   ├── eslint-config/                # Shared ESLint config
│   ├── tsconfig/                     # Shared TS configs
│   └── ui/                           # Shared UI components
│       ├── src/
│       └── package.json
│
├── infrastructure/
│   ├── terraform/
│   │   ├── modules/
│   │   │   ├── aks/
│   │   │   ├── postgresql/
│   │   │   ├── redis/
│   │   │   ├── cosmosdb/
│   │   │   ├── eventhubs/
│   │   │   ├── openai/
│   │   │   ├── storage/
│   │   │   └── networking/
│   │   ├── environments/
│   │   │   ├── staging/
│   │   │   └── production/
│   │   └── main.tf
│   │
│   ├── helm/
│   │   ├── charts/
│   │   │   ├── assist-service/       # Base Helm chart
│   │   │   └── assist-platform/      # Umbrella chart
│   │   └── values/
│   │       ├── staging.yaml
│   │       └── production.yaml
│   │
│   └── docker/
│       ├── node.Dockerfile           # Base Node.js image
│       └── python.Dockerfile         # Base Python image
│
├── docs/
│   ├── api/                          # API documentation
│   ├── architecture/                 # Architecture decisions (ADRs)
│   ├── runbooks/                     # Operational runbooks
│   └── onboarding/                   # Developer onboarding
│
├── scripts/
│   ├── setup.sh                      # Local dev setup
│   ├── seed.sh                       # Database seeding
│   └── generate-types.sh             # Generate shared types
│
├── turbo.json                        # Turborepo config
├── pnpm-workspace.yaml               # pnpm workspace
├── package.json                      # Root package.json
├── .env.example                      # Environment variables template
├── docker-compose.yml                # Local development stack
├── docker-compose.infra.yml          # Local infrastructure (DB, Redis, Kafka)
└── ARCHITECTURE.md                   # This file
```

---

## 17. Development Roadmap

### Phase 1 — Foundation (Months 1–3)
**Goal:** Core platform with AI chat on web channel

| Sprint | Deliverables |
|--------|-------------|
| **Sprint 1–2** | Monorepo setup, CI/CD, Docker Compose, Auth Service, Tenant Service |
| **Sprint 3–4** | Conversation Engine, WebSocket gateway, basic web widget |
| **Sprint 5–6** | AI Engine (Azure OpenAI integration, basic RAG), Knowledge Base Service |
| **Sprint 7–8** | Dashboard (conversations view, basic analytics), widget polish |
| **Sprint 9–10** | Billing Service (Stripe), Media Service, agent workspace (basic) |
| **Sprint 11–12** | Beta testing, performance tuning, security audit |

**Phase 1 MVP Features:**
- [x] User registration & workspace creation
- [x] AI chatbot on web widget
- [x] Knowledge base (upload docs, URLs)
- [x] Basic conversation inbox
- [x] Human handoff
- [x] Dashboard with basic analytics
- [x] Stripe billing integration

---

### Phase 2 — Omnichannel + Intelligence (Months 4–6)
**Goal:** Multi-channel support and advanced AI features

| Deliverable | Details |
|-------------|---------|
| WhatsApp integration | WhatsApp Business Cloud API |
| Facebook Messenger | Meta Graph API integration |
| Instagram DM | Meta API integration |
| Telegram | Telegram Bot API |
| Email channel | SendGrid inbound + outbound |
| Bot Builder | Visual flow editor with React Flow |
| AI Copilot | Real-time agent suggestions |
| Advanced analytics | ClickHouse integration, dashboards |
| Lead scoring | AI + engagement-based scoring |
| Notification service | Push, email, SMS alerts |

---

### Phase 3 — Enterprise & Scale (Months 7–9)
**Goal:** Enterprise features and scale readiness

| Deliverable | Details |
|-------------|---------|
| CRM integrations | Salesforce, HubSpot, Pipedrive sync |
| SSO (SAML/OIDC) | Enterprise SSO |
| White-label | Custom branding, custom domains |
| SMS channel | Twilio integration |
| Advanced bot builder | A/B testing, analytics per flow |
| Webhook service | Outbound event streaming |
| Multi-language | 50+ language support |
| GDPR tools | Data export, deletion, consent |
| SOC 2 readiness | Security controls & documentation |
| Performance | Load testing (K6), optimization |

---

### Phase 4 — Market Leadership (Months 10–12)
**Goal:** Differentiated features that no competitor offers at this price point

| Deliverable | Details |
|-------------|---------|
| Voice AI | Azure Speech Services integration |
| Mobile SDK | React Native SDK for in-app chat |
| Marketplace | App/integration marketplace |
| Custom AI training | Fine-tuning per tenant |
| Predictive analytics | Churn prediction, revenue forecasting |
| Multi-region | EU + APAC deployment |
| Public API v2 | GraphQL public API |
| Partner program | Reseller/agency dashboard |
| Mobile agent app | React Native admin app |
| AI Playground | Prompt testing & tuning tool |

---

## Appendix A: Environment Variables

```bash
# ─── GLOBAL ───
NODE_ENV=production
LOG_LEVEL=info
PORT=3000

# ─── AUTH ───
JWT_PRIVATE_KEY=<RSA private key from Key Vault>
JWT_PUBLIC_KEY=<RSA public key>
JWT_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d

# ─── DATABASES ───
POSTGRES_URL=postgresql://user:pass@host:5432/assist
MONGODB_URL=mongodb+srv://user:pass@host/assist
REDIS_URL=redis://:pass@host:6380
CLICKHOUSE_URL=http://host:8123

# ─── KAFKA ───
KAFKA_BROKERS=host1:9092,host2:9092
KAFKA_CLIENT_ID=assist

# ─── AZURE OPENAI ───
AZURE_OPENAI_ENDPOINT=https://assist-openai.openai.azure.com/
AZURE_OPENAI_API_KEY=<from Key Vault>
AZURE_OPENAI_GPT4O_DEPLOYMENT=gpt-4o
AZURE_OPENAI_GPT4O_MINI_DEPLOYMENT=gpt-4o-mini
AZURE_OPENAI_EMBEDDING_DEPLOYMENT=text-embedding-3-large

# ─── AZURE AI SEARCH ───
AZURE_SEARCH_ENDPOINT=https://assist-search.search.windows.net
AZURE_SEARCH_API_KEY=<from Key Vault>

# ─── AZURE STORAGE ───
AZURE_STORAGE_CONNECTION_STRING=<from Key Vault>
AZURE_STORAGE_CONTAINER=assist-media

# ─── CHANNELS ───
WHATSAPP_ACCESS_TOKEN=<from Key Vault>
WHATSAPP_VERIFY_TOKEN=<secret>
META_APP_SECRET=<from Key Vault>
TELEGRAM_BOT_TOKEN=<from Key Vault>
TWILIO_ACCOUNT_SID=<from Key Vault>
TWILIO_AUTH_TOKEN=<from Key Vault>
SENDGRID_API_KEY=<from Key Vault>

# ─── BILLING ───
STRIPE_SECRET_KEY=<from Key Vault>
STRIPE_WEBHOOK_SECRET=<from Key Vault>

# ─── MONITORING ───
SENTRY_DSN=<Sentry DSN>
```

---

## Appendix B: Key Architecture Decisions (ADRs)

| # | Decision | Rationale |
|---|----------|-----------|
| ADR-001 | **Monorepo with Turborepo + pnpm** | Shared types, atomic changes, simplified CI, consistent tooling |
| ADR-002 | **Fastify over Express** | 2x performance, built-in schema validation, TypeScript-first |
| ADR-003 | **MongoDB for conversations** | Flexible message schema, high write throughput, TTL indexes for data retention |
| ADR-004 | **PostgreSQL for relational data** | ACID compliance, pgvector for embeddings, mature ecosystem |
| ADR-005 | **ClickHouse for analytics** | 100x faster aggregations, columnar storage, efficient for time-series |
| ADR-006 | **Kafka over RabbitMQ** | Event replay, higher throughput, better for event sourcing, managed via Azure Event Hubs |
| ADR-007 | **Python for AI services** | Best AI/ML ecosystem, LangChain, native Azure OpenAI SDK |
| ADR-008 | **Azure-first infrastructure** | Azure OpenAI exclusive access, integrated ecosystem, enterprise compliance |
| ADR-009 | **Socket.io over raw WS** | Rooms/namespaces, auto-reconnect, fallback transports, Redis adapter for scaling |
| ADR-010 | **Preact for widget** | <30KB bundle, React-compatible API, critical for embed performance |
| ADR-011 | **Kong API Gateway** | Rich plugin ecosystem, rate limiting, auth, open-source |
| ADR-012 | **LangChain + LangGraph** | Composable AI chains, agentic workflows, tool use, memory management |

---

## Appendix C: Estimated Monthly Infrastructure Cost

| Resource | Tier | Monthly Cost |
|----------|------|-------------|
| AKS (10 nodes, D4s v3) | Standard | ~$1,200 |
| Azure Database for PostgreSQL | GP_Standard_D4s_v3, 256GB | ~$400 |
| Azure Cosmos DB (MongoDB) | 10K RU/s | ~$580 |
| Azure Cache for Redis | P1 (6GB) | ~$290 |
| Azure Event Hubs (Kafka) | Standard, 20 TU | ~$440 |
| Azure OpenAI | GPT-4o: 150K TPM | ~$2,000–$5,000 (usage) |
| Azure AI Search | S1 | ~$250 |
| Azure Blob Storage | Hot, 500GB | ~$10 |
| Azure CDN | Standard | ~$30 |
| Azure Front Door | Standard | ~$35 |
| SendGrid | Pro (100K emails) | ~$90 |
| Twilio | Pay-as-you-go | ~$100–$500 |
| Sentry | Team | ~$26 |
| GitHub Actions | Team | ~$44 |
| **Total (estimated)** | | **~$5,500–$9,000/mo** |

> Cost scales with tenant count and AI usage. At 500 paying tenants ($79 avg), revenue = ~$39,500/mo → healthy margins.

---

## Appendix D: API Quick Reference

### Public REST API (for tenant integrations)

```
Authorization: Bearer <api_key>
Base URL: https://api.assist.rovty.com/v1

# Conversations
GET    /conversations                    List conversations
GET    /conversations/:id                Get conversation
POST   /conversations/:id/messages       Send message
PUT    /conversations/:id/assign         Assign to agent
PUT    /conversations/:id/resolve        Resolve conversation

# Contacts
GET    /contacts                         List contacts
POST   /contacts                         Create contact
GET    /contacts/:id                     Get contact
PUT    /contacts/:id                     Update contact

# Knowledge Base
POST   /knowledge-base/sources           Add source
GET    /knowledge-base/sources           List sources
DELETE /knowledge-base/sources/:id       Remove source
POST   /knowledge-base/search            Search KB

# Channels
GET    /channels                         List connected channels
POST   /channels/:type/connect           Connect channel

# Analytics
GET    /analytics/overview               Dashboard metrics
GET    /analytics/conversations          Conversation metrics

# Webhooks
POST   /webhooks                         Create webhook
GET    /webhooks                         List webhooks
DELETE /webhooks/:id                     Delete webhook
```

---

*Document Version: 1.0.0*
*Last Updated: March 2026*
*Author: Assist Platform Team — Rovty*
*Contact: engineering@rovty.com*
