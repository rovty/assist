# Assist by Rovty

> **assist.rovty.com** — AI Conversational Platform for SMEs

Omnichannel AI platform that automates customer conversations, captures leads, and provides 24/7 engagement across web and messaging channels.

## Quick Start

```bash
# 1. Clone the repo
git clone <repo-url>
cd assist

# 2. Run setup (installs deps, starts infra, runs migrations)
chmod +x scripts/setup.sh
./scripts/setup.sh

# 3. Start all services in dev mode
pnpm dev
```

## Architecture

See [ARCHITECTURE.md](ARCHITECTURE.md) for the complete technical blueprint.

## Project Structure

```
assist/
├── apps/                   # Frontend applications
│   ├── dashboard/          # Next.js 15 admin panel (port 3100)
│   ├── widget/             # Preact embeddable chat widget (port 3200)
│   └── mobile/             # React Native + Expo agent app
├── services/               # Backend microservices
│   ├── api-gateway/        # Unified API proxy + docs (port 3000)
│   ├── auth/               # Authentication & authorization (port 3001)
│   ├── tenant/             # Multi-tenant workspace management (port 3002)
│   ├── conversation/       # Conversation engine (port 3003)
│   ├── ai-engine/          # AI/ML service - Python (port 3004)
│   ├── notification/       # Email, push, in-app notifications (port 3005)
│   ├── knowledge-base/     # RAG document ingestion & search (port 3006)
│   ├── media/              # File uploads & storage (port 3007)
│   ├── channel-gateway/    # Omnichannel message routing (port 3008)
│   ├── analytics/          # ClickHouse analytics pipeline (port 3009)
│   ├── webhook/            # Webhook delivery & management (port 3010)
│   ├── bot-builder/        # Visual bot flow engine (port 3011)
│   ├── lead-crm/           # Lead management & scoring (port 3012)
│   ├── scheduler/          # Job scheduling & cron (port 3013)
│   ├── agent-workspace/    # Agent routing & queues (port 3014)
│   └── billing/            # Plans, subscriptions, usage (port 3015)
├── packages/               # Shared packages
│   ├── ui/                 # Shared React component library
│   ├── shared-types/       # TypeScript type definitions
│   ├── shared-utils/       # Logger, errors, ID generation
│   ├── shared-kafka/       # Kafka client wrappers
│   ├── tsconfig/           # Shared TS configurations
│   └── eslint-config/      # Shared ESLint configuration
├── tests/                  # E2E test suite (Playwright)
├── infrastructure/         # Docker, Terraform, Helm
├── docs/                   # Sprint docs, API docs, runbooks
└── scripts/                # Development scripts
```

## Development

```bash
pnpm dev              # Start all services + apps
pnpm build            # Build all packages
pnpm test             # Run all tests
pnpm lint             # Lint all code
pnpm type-check       # TypeScript checking
pnpm docker:infra     # Start local infrastructure
pnpm docker:infra:down # Stop infrastructure
pnpm --filter @assist/e2e-tests test  # Run E2E tests
```

## Services & Apps

| Name | Port | Type | Sprint |
|------|------|------|--------|
| API Gateway | 3000 | Service | 1 |
| Auth | 3001 | Service | 1 |
| Tenant | 3002 | Service | 1 |
| Conversation | 3003 | Service | 2 |
| AI Engine | 3004 | Service | 2 |
| Notification | 3005 | Service | 2 |
| Knowledge Base | 3006 | Service | 3 |
| Media | 3007 | Service | 3 |
| Channel Gateway | 3008 | Service | 3 |
| Analytics | 3009 | Service | 3 |
| Webhook | 3010 | Service | 3 |
| Bot Builder | 3011 | Service | 4 |
| Lead/CRM | 3012 | Service | 4 |
| Scheduler | 3013 | Service | 4 |
| Agent Workspace | 3014 | Service | 4 |
| Billing | 3015 | Service | 4 |
| Dashboard | 3100 | Web App | 5 |
| Widget | 3200 | Embeddable | 5 |
| Mobile (Expo) | 19006 | Native App | 5 |

## Tech Stack

- **Runtime:** Node.js 22, TypeScript, Fastify
- **Frontend:** Next.js 15, React 19, Preact, React Native (Expo)
- **Styling:** Tailwind CSS 4, shadcn/ui patterns
- **Database:** PostgreSQL 16, MongoDB 7, Redis 7, ClickHouse
- **AI:** Azure OpenAI
- **Messaging:** Apache Kafka
- **Monorepo:** Turborepo + pnpm
- **ORM:** Prisma
- **Testing:** Vitest (unit), Playwright (E2E)
- **CI/CD:** GitHub Actions
- **Infrastructure:** Docker, Kubernetes (AKS), Terraform

## API Documentation

Interactive API docs are available at `http://localhost:3000/docs` when the API Gateway is running.
See [docs/api/README.md](docs/api/README.md) for the full route reference.

## License

Proprietary — Rovty
