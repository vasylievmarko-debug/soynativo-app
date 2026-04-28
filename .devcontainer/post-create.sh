#!/bin/bash
set -e

echo "🚀 Codespace post-create: Инициализация среды разработки..."

# 1. Установить зависимости
echo "📦 yarn install..."
yarn install --frozen-lockfile

# 2. Создать .env файл для разработки
echo "⚙️ Создание .env файла..."
cat > apps/backend/.env <<EOF
NODE_ENV=development
PORT=3000
API_PREFIX=/api
API_VERSION=v1

DATABASE_URL=postgres://soynativo:soynativo@postgres:5432/soynativo
DATABASE_POOL_SIZE=10
DATABASE_LOGGING=false

REDIS_URL=redis://redis:6379

JWT_ACCESS_SECRET=codespace-dev-access-secret-must-be-at-least-32-chars-long
JWT_REFRESH_SECRET=codespace-dev-refresh-secret-must-be-32-chars-long-different
JWT_ACCESS_TTL=15m
JWT_REFRESH_TTL=30d
BCRYPT_ROUNDS=4

CORS_ORIGINS=http://localhost:3000,http://localhost:3001,http://localhost:19006

RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=100

LOG_LEVEL=info

# Optional integrations (can be empty)
GOOGLE_MEET_CLIENT_ID=
GOOGLE_MEET_CLIENT_SECRET=
GOOGLE_MEET_REDIRECT_URI=

TELEGRAM_BOT_TOKEN=
TELEGRAM_WEBHOOK_URL=

SENTRY_DSN=
EOF

echo "✅ Codespace готов к работе!"
echo ""
echo "Дальше нужно:"
echo "1. yarn workspace @soynativo/backend migration:run"
echo "2. yarn workspace @soynativo/backend seed"
echo "3. yarn workspace @soynativo/backend dev"
echo ""
