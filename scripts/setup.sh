#!/bin/bash
set -e

echo "🚀 Setting up Assist development environment..."
echo ""

# ─── Check prerequisites ───
echo "📋 Checking prerequisites..."

check_command() {
  if ! command -v "$1" &> /dev/null; then
    echo "❌ $1 is not installed. Please install it first."
    exit 1
  fi
  echo "  ✅ $1 found"
}

check_command node
check_command pnpm
check_command docker
check_command git

NODE_VERSION=$(node -v | cut -d. -f1 | tr -d 'v')
if [ "$NODE_VERSION" -lt 22 ]; then
  echo "❌ Node.js 22+ required. Current: $(node -v)"
  exit 1
fi

echo ""

# ─── Copy environment files ───
echo "📄 Setting up environment files..."
if [ ! -f .env ]; then
  cp .env.example .env
  echo "  ✅ Created .env from .env.example"
  echo "  ⚠️  Please update .env with your Azure OpenAI and Stripe keys"
else
  echo "  ℹ️  .env already exists, skipping"
fi

echo ""

# ─── Install dependencies ───
echo "📦 Installing dependencies..."
pnpm install

echo ""

# ─── Start infrastructure ───
echo "🐳 Starting local infrastructure (PostgreSQL, MongoDB, Redis, Kafka)..."
docker compose -f docker-compose.infra.yml up -d

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 10

# ─── Run database migrations ───
echo "🗄️  Running database migrations..."
cd services/auth && pnpm db:generate && pnpm db:migrate && cd ../..
cd services/tenant && pnpm db:generate && pnpm db:migrate && cd ../..

echo ""

# ─── Seed data ───
echo "🌱 Seeding database..."
cd services/tenant && pnpm db:seed && cd ../..

echo ""
echo "✨ Setup complete! You can now run:"
echo ""
echo "  pnpm dev              # Start all services in development mode"
echo "  pnpm docker:infra     # Start infrastructure containers"
echo "  pnpm test             # Run all tests"
echo ""
echo "📚 Services:"
echo "  Auth Service:     http://localhost:3001  (docs: /docs)"
echo "  Tenant Service:   http://localhost:3002"
echo ""
echo "🛠️  Infrastructure:"
echo "  PostgreSQL:       localhost:5432"
echo "  MongoDB:          localhost:27017"
echo "  Redis:            localhost:6379"
echo "  Kafka:            localhost:9094"
echo "  Kafka UI:         http://localhost:8080"
echo "  ClickHouse:       localhost:8123"
echo "  Mailhog:          http://localhost:8025"
echo ""
