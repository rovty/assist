# Sprint 5 – Dashboard, Widget, Mobile & Developer Experience

> **Duration:** 2 weeks  
> **Goal:** Build the three frontend applications (admin dashboard, embeddable chat widget, agent mobile app), a shared UI component library, an E2E test suite, and auto-generated API documentation.

---

## Table of Contents

1. [Sprint Overview](#sprint-overview)
2. [New Applications](#new-applications)
3. [Shared Package Updates](#shared-package-updates)
4. [Application Details](#application-details)
   - [Dashboard App](#dashboard-app)
   - [Widget App](#widget-app)
   - [Mobile App](#mobile-app)
   - [Shared UI Package](#shared-ui-package)
5. [E2E Test Suite](#e2e-test-suite)
6. [API Documentation](#api-documentation)
7. [Infrastructure Changes](#infrastructure-changes)
8. [Running Locally](#running-locally)
9. [Architecture Diagram](#architecture-diagram)
10. [What's Next (Sprint 6)](#whats-next-sprint-6)

---

## Sprint Overview

### Delivered

| # | Application       | Type           | Framework           | Status |
|---|-------------------|----------------|---------------------|--------|
| 1 | Dashboard         | Web App        | Next.js 15 + React 19 | ✅ Done |
| 2 | Widget            | Embeddable     | Preact + Vite       | ✅ Done |
| 3 | Mobile            | Native App     | React Native + Expo | ✅ Done |
| 4 | Shared UI         | Component Lib  | React + Tailwind    | ✅ Done |
| 5 | E2E Tests         | Test Suite     | Playwright          | ✅ Done |
| 6 | API Docs          | Documentation  | Scalar + OpenAPI    | ✅ Done |

### Also Completed

- **Shared UI package** — Reusable React component library with Tailwind CSS
- **E2E test suite** — Playwright tests covering auth, conversations, bot builder, billing flows
- **OpenAPI spec** — Auto-generated from API Gateway with Scalar docs UI
- **Root configs** — Updated README, workspace config for new apps

---

## New Applications

### Dashboard App

Full-featured React admin panel for workspace owners, agents, and administrators.

**Tech:** Next.js 15 (App Router) + React 19 + Tailwind CSS 4 + shadcn/ui + TanStack Query

**Port:** 3100

**Features:**
- Authentication (login, register, forgot password)
- Workspace Settings (team, billing, channels, integrations)
- Conversation Inbox (list, filters, real-time updates)
- Agent Workspace (queue, active conversations, canned responses)
- Bot Builder UI (visual flow editor with React Flow)
- Lead/CRM Dashboard (pipeline board, lead details, scoring)
- Analytics Dashboard (charts, KPIs, export)
- Knowledge Base Manager (sources, search testing)
- Billing Portal (plans, invoices, usage)
- Notification Center

---

### Widget App

Lightweight embeddable chat widget for customer websites.

**Tech:** Preact 10 + Vite + CSS Modules (target: <30KB gzipped)

**Port:** 3200

**Features:**
- Bubble launcher with unread badge
- Chat interface with message history
- Typing indicators
- File upload support
- Pre-chat form (name, email)
- Offline message form
- Bot flow rendering
- Customizable theme (colors, position, branding)
- Embed via `<script>` tag

---

### Mobile App

Agent mobile app for on-the-go conversation management.

**Tech:** React Native + Expo 52 + React Navigation + TanStack Query

**Features:**
- Push notification support
- Conversation inbox with filters
- Real-time chat with contacts
- Agent status toggle (online/away/offline)
- Quick reply with canned responses
- Lead list and details
- Basic analytics overview

---

### Shared UI Package

Reusable component library consumed by Dashboard and future apps.

**Tech:** React 19 + Tailwind CSS 4 + Class Variance Authority

**Components:**
- Button, Input, Textarea, Select, Checkbox, Radio
- Card, Badge, Avatar, Tooltip
- Dialog, Sheet, Popover, Dropdown Menu
- Table, Pagination
- Tabs, Accordion
- Toast notifications
- Loading spinners & skeletons
- Theme provider (light/dark mode)

---

## E2E Test Suite

**Tech:** Playwright + TypeScript

**Coverage:**
- Auth flows (register, login, logout, password reset)
- Conversation lifecycle (create, message, assign, resolve)
- Bot builder (create bot, add nodes, publish, simulate)
- Lead management (create, score, move pipeline stages)
- Billing (view plans, checkout flow)
- API Gateway (proxy routing, rate limiting, health)

---

## API Documentation

**Tech:** Scalar API Reference + OpenAPI 3.1

**Features:**
- Auto-generated OpenAPI spec from Fastify route schemas
- Interactive API explorer (try-it-out)
- Authentication documentation (JWT flow, API keys)
- Webhook payload documentation
- Code examples in multiple languages (curl, JS, Python, Go)
- Hosted at `/docs` on API Gateway

---

## Application Details

### Dashboard App

**File Structure:**
```
apps/dashboard/
├── package.json
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts
├── postcss.config.mjs
├── .env.local.example
└── src/
    ├── app/
    │   ├── layout.tsx
    │   ├── page.tsx
    │   ├── globals.css
    │   ├── (auth)/
    │   │   ├── login/page.tsx
    │   │   └── register/page.tsx
    │   └── (dashboard)/
    │       ├── layout.tsx
    │       ├── page.tsx
    │       ├── conversations/page.tsx
    │       ├── bots/page.tsx
    │       ├── leads/page.tsx
    │       ├── analytics/page.tsx
    │       ├── knowledge-base/page.tsx
    │       ├── settings/page.tsx
    │       └── billing/page.tsx
    ├── components/
    │   ├── layout/
    │   │   ├── sidebar.tsx
    │   │   ├── header.tsx
    │   │   └── breadcrumb.tsx
    │   ├── conversations/
    │   │   ├── conversation-list.tsx
    │   │   ├── conversation-detail.tsx
    │   │   └── message-input.tsx
    │   ├── bots/
    │   │   ├── bot-list.tsx
    │   │   └── flow-editor.tsx
    │   ├── leads/
    │   │   ├── pipeline-board.tsx
    │   │   └── lead-detail.tsx
    │   ├── analytics/
    │   │   ├── overview-cards.tsx
    │   │   └── chart-container.tsx
    │   └── billing/
    │       ├── plan-cards.tsx
    │       └── usage-meter.tsx
    ├── lib/
    │   ├── api.ts
    │   ├── auth.ts
    │   ├── constants.ts
    │   └── utils.ts
    ├── hooks/
    │   ├── use-auth.ts
    │   ├── use-conversations.ts
    │   ├── use-bots.ts
    │   ├── use-leads.ts
    │   ├── use-analytics.ts
    │   └── use-billing.ts
    └── types/
        └── index.ts
```

**Key Routes:**

| Route | Page | Description |
|-------|------|-------------|
| `/login` | Auth | Login page |
| `/register` | Auth | Registration page |
| `/` | Dashboard | Overview with key metrics |
| `/conversations` | Inbox | Conversation list + detail |
| `/bots` | Bot Builder | Bot list + flow editor |
| `/leads` | CRM | Pipeline board + lead details |
| `/analytics` | Analytics | Charts + KPIs + export |
| `/knowledge-base` | KB | Sources + search testing |
| `/settings` | Settings | Team, channels, integrations |
| `/billing` | Billing | Plans, invoices, usage |

---

### Widget App

**File Structure:**
```
apps/widget/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── index.html
└── src/
    ├── main.tsx
    ├── types.ts
    ├── api.ts
    ├── store.ts
    ├── components/
    │   ├── Widget.tsx
    │   ├── Launcher.tsx
    │   ├── ChatWindow.tsx
    │   ├── MessageList.tsx
    │   ├── MessageBubble.tsx
    │   ├── MessageInput.tsx
    │   ├── PreChatForm.tsx
    │   └── OfflineForm.tsx
    └── styles/
        └── widget.css
```

**Embed Code:**
```html
<script>
  window.AssistConfig = {
    workspaceId: 'ws_xxx',
    theme: { primaryColor: '#6366f1' }
  };
</script>
<script src="https://cdn.assist.rovty.com/widget.js" async></script>
```

---

### Mobile App

**File Structure:**
```
apps/mobile/
├── package.json
├── tsconfig.json
├── app.json
├── babel.config.js
├── metro.config.js
└── src/
    ├── App.tsx
    ├── api.ts
    ├── types.ts
    ├── navigation/
    │   └── index.tsx
    ├── screens/
    │   ├── LoginScreen.tsx
    │   ├── ConversationsScreen.tsx
    │   ├── ChatScreen.tsx
    │   ├── LeadsScreen.tsx
    │   ├── SettingsScreen.tsx
    │   └── AnalyticsScreen.tsx
    ├── components/
    │   ├── MessageBubble.tsx
    │   ├── ConversationCard.tsx
    │   ├── StatusToggle.tsx
    │   └── QuickReply.tsx
    └── hooks/
        ├── useAuth.ts
        └── useConversations.ts
```

---

### Shared UI Package

**File Structure:**
```
packages/ui/
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── src/
    ├── index.ts
    ├── components/
    │   ├── button.tsx
    │   ├── input.tsx
    │   ├── card.tsx
    │   ├── badge.tsx
    │   ├── avatar.tsx
    │   ├── dialog.tsx
    │   ├── table.tsx
    │   ├── tabs.tsx
    │   ├── toast.tsx
    │   ├── skeleton.tsx
    │   └── theme-provider.tsx
    └── lib/
        └── utils.ts
```

---

## E2E Test Suite

**File Structure:**
```
tests/
├── package.json
├── playwright.config.ts
├── tsconfig.json
└── e2e/
    ├── auth.spec.ts
    ├── conversations.spec.ts
    ├── bots.spec.ts
    ├── leads.spec.ts
    ├── billing.spec.ts
    ├── api-gateway.spec.ts
    └── fixtures/
        └── test-helpers.ts
```

---

## Infrastructure Changes

No new Docker containers needed. Dashboard and Widget run as standalone dev servers.

### Port Map (Complete)

| Port | Service/App       | Sprint | Type    |
|------|-------------------|--------|---------|
| 3000 | API Gateway       | 1      | Service |
| 3001 | Auth              | 1      | Service |
| 3002 | Tenant            | 1      | Service |
| 3003 | Conversation      | 2      | Service |
| 3004 | AI Engine         | 2      | Service |
| 3005 | Notification      | 2      | Service |
| 3006 | Knowledge Base    | 3      | Service |
| 3007 | Media             | 3      | Service |
| 3008 | Channel Gateway   | 3      | Service |
| 3009 | Analytics         | 3      | Service |
| 3010 | Webhook           | 3      | Service |
| 3011 | Bot Builder       | 4      | Service |
| 3012 | Lead/CRM          | 4      | Service |
| 3013 | Scheduler         | 4      | Service |
| 3014 | Agent Workspace   | 4      | Service |
| 3015 | Billing           | 4      | Service |
| 3100 | Dashboard         | 5      | App     |
| 3200 | Widget            | 5      | App     |
| 19006| Mobile (Expo)     | 5      | App     |

---

## Running Locally

### 1. Start Infrastructure + Backend Services

```bash
pnpm docker:infra
pnpm dev  # Starts all services
```

### 2. Dashboard

```bash
cd apps/dashboard
pnpm install
pnpm dev
# Open http://localhost:3100
```

### 3. Widget

```bash
cd apps/widget
pnpm install
pnpm dev
# Open http://localhost:3200
```

### 4. Mobile

```bash
cd apps/mobile
pnpm install
pnpm start
# Scan QR code with Expo Go
```

### 5. E2E Tests

```bash
cd tests
pnpm install
pnpm test:e2e         # Run all tests
pnpm test:e2e:ui      # Interactive UI mode
```

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    Frontend Applications                         │
├──────────────┬───────────────┬──────────────────────────────────┤
│  Dashboard   │    Widget     │       Mobile App                 │
│  (Next.js)   │  (Preact)     │    (React Native)               │
│  :3100       │  :3200        │    Expo                          │
└──────┬───────┴──────┬────────┴──────┬───────────────────────────┘
       │              │               │
       ▼              ▼               ▼
┌─────────────────────────────────────────────────────────────────┐
│                     API Gateway (:3000)                          │
│            JWT Auth · Rate Limit · HTTP Proxy                   │
│  /auth /tenants /conversations /ai /notifications /kb /media    │
│  /channels /analytics /webhooks /bots /leads /scheduler         │
│  /workspace /billing                                            │
└─────────────────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────────┐
│                    15 Microservices                              │
│  Auth · Tenant · Conversation · AI · Notification · KB · Media  │
│  Channel · Analytics · Webhook · Bot Builder · Lead/CRM         │
│  Scheduler · Agent Workspace · Billing                          │
└─────────────────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Infrastructure                                │
│  PostgreSQL · MongoDB · Redis · Kafka · ClickHouse · Mailhog   │
└─────────────────────────────────────────────────────────────────┘
```

---

## What's Next (Sprint 6)

| Deliverable              | Description                                                |
|--------------------------|------------------------------------------------------------|
| **CRM Integrations**    | Salesforce, HubSpot, Pipedrive two-way sync                |
| **Enterprise SSO**      | SAML 2.0, OIDC integration for enterprise tenants          |
| **White-label**         | Custom domains, branding, logos per tenant                  |
| **SMS Channel**         | Twilio SMS integration in Channel Gateway                  |
| **GDPR Compliance**     | Data export, deletion, consent management                  |
| **Performance Testing** | K6 load testing, optimization, caching strategy review     |
