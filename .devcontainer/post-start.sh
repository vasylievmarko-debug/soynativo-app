#!/bin/bash
set -e

echo "🔄 Codespace post-start: Проверка сервисов..."

# Проверить что PostgreSQL готов
echo "⏳ Ожидание PostgreSQL..."
for i in {1..30}; do
  if pg_isready -h postgres -U soynativo -d soynativo >/dev/null 2>&1; then
    echo "✅ PostgreSQL готов"
    break
  fi
  echo "  Попытка $i/30..."
  sleep 1
done

# Проверить что Redis готов
echo "⏳ Ожидание Redis..."
for i in {1..30}; do
  if redis-cli -h redis ping >/dev/null 2>&1; then
    echo "✅ Redis готов"
    break
  fi
  echo "  Попытка $i/30..."
  sleep 1
done

echo "🎉 Все сервисы готовы!"
echo ""
echo "Для работы используй:"
echo "  yarn workspace @soynativo/backend dev       # Запустить backend"
echo "  yarn workspace @soynativo/backend test      # Запустить тесты"
echo "  yarn workspace @soynativo/backend migration:run  # Применить миграции"
echo "  yarn workspace @soynativo/backend seed      # Заполнить БД тестовыми данными"
echo ""
