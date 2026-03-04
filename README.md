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
├── apps/               # Frontend applications (dashboard, widget, mobile)
├── services/           # Backend microservices
│   ├── auth/           # Authentication & authorization
│   ├── tenant/         # Multi-tenant workspace management
│   ├── conversation/   # Conversation engine (coming soon)
│   ├── ai-engine/      # AI/ML service - Python (coming soon)
│   └── ...             # More services per ARCHITECTURE.md
├── packages/           # Shared packages
│   ├── shared-types/   # TypeScript type definitions
│   ├── shared-utils/   # Logger, errors, ID generation
│   ├── tsconfig/       # Shared TS configurations
│   └── eslint-config/  # Shared ESLint configuration
├── infrastructure/     # Docker, Terraform, Helm
├── docs/               # Documentation
└── scripts/            # Development scripts
```

## Development

```bash
pnpm dev              # Start all services
pnpm build            # Build all packages
pnpm test             # Run all tests
pnpm lint             # Lint all code
pnpm type-check       # TypeScript checking
pnpm docker:infra     # Start local infrastructure
pnpm docker:infra:down # Stop infrastructure
```

## Services (Sprint 1)

| Service | Port | Status |
|---------|------|--------|
| Auth | 3001 | ✅ Ready |
| Tenant | 3002 | ✅ Ready |

## Tech Stack

- **Runtime:** Node.js 22, TypeScript, Fastify
- **Database:** PostgreSQL 16, MongoDB 7, Redis 7
- **AI:** Azure OpenAI (coming Sprint 3)
- **Monorepo:** Turborepo + pnpm
- **ORM:** Prisma
- **CI/CD:** GitHub Actions

## License

Proprietary — Rovty
