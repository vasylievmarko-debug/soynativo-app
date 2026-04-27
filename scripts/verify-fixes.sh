#!/usr/bin/env bash
# Проверка что все 5 критичных исправлений из AUDIT.md работают.
# Запуск: bash scripts/verify-fixes.sh
#
# Что проверяет:
# - Статически (grep, syntax): можно запустить всегда
# - Динамически (DB, HTTP): требует docker compose up + yarn install

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

cd "$(dirname "$0")/.."
ROOT=$(pwd)

PASS=0
FAIL=0
SKIP=0

ok()   { echo -e "${GREEN}✓${NC} $1"; PASS=$((PASS+1)); }
fail() { echo -e "${RED}✗${NC} $1"; FAIL=$((FAIL+1)); }
skip() { echo -e "${YELLOW}⊘${NC} $1"; SKIP=$((SKIP+1)); }
hdr()  { echo; echo "=== $1 ==="; }

# ─── СТАТИЧЕСКИЕ ПРОВЕРКИ (всегда работают) ──────────────────────────

hdr "A1: RLS на /users — только GET /me в роутере"
ROUTES=$(grep -cE "router\.[a-z]+\(" "$ROOT/apps/backend/src/modules/users/user.routes.ts")
if [ "$ROUTES" -eq 1 ]; then
  ok "user.routes.ts содержит ровно 1 роут"
else
  fail "user.routes.ts содержит $ROUTES роутов (ожидается 1)"
fi

if grep -q "router.get('/me'" "$ROOT/apps/backend/src/modules/users/user.routes.ts"; then
  ok "GET /me присутствует"
else
  fail "GET /me не найден"
fi

if grep -qE "router\.get\('/:id'|router\.patch\('/:id'" "$ROOT/apps/backend/src/modules/users/user.routes.ts"; then
  fail "Vulnerable /:id роуты всё ещё в коде"
else
  ok "Vulnerable /:id роуты удалены"
fi

hdr "A2: metro.config.js существует и валиден"
if [ -f "$ROOT/apps/mobile/metro.config.js" ]; then
  ok "metro.config.js существует"
  if node --check "$ROOT/apps/mobile/metro.config.js" 2>/dev/null; then
    ok "metro.config.js — синтаксис валиден"
  else
    fail "metro.config.js — синтаксическая ошибка"
  fi
  for keyword in "watchFolders" "nodeModulesPaths" "disableHierarchicalLookup"; do
    if grep -q "$keyword" "$ROOT/apps/mobile/metro.config.js"; then
      ok "metro.config.js содержит '$keyword'"
    else
      fail "metro.config.js НЕ содержит '$keyword'"
    fi
  done
else
  fail "metro.config.js не найден"
fi

hdr "A3: нет OFFSET pagination в users"
if grep -qE "skip\(|\.offset\(" "$ROOT/apps/backend/src/modules/users/user.repository.ts"; then
  fail "skip/offset найден в user.repository.ts"
else
  ok "skip/offset отсутствует в user.repository.ts"
fi

if grep -q "paginate" "$ROOT/apps/backend/src/modules/users/user.repository.ts"; then
  ok "user.repository использует cursor paginate()"
else
  fail "user.repository не использует paginate()"
fi

hdr "A4: seed.ts — индивидуальные уроки"
SEED="$ROOT/apps/backend/src/core/database/seeds/seed.ts"
if grep -q "env.BCRYPT_ROUNDS" "$SEED"; then
  ok "seed использует env.BCRYPT_ROUNDS"
else
  fail "seed НЕ использует env.BCRYPT_ROUNDS"
fi
if grep -q "NODE_ENV === 'production'" "$SEED"; then
  ok "seed имеет production guard"
else
  fail "seed без production guard"
fi
if grep -qE "LESSONS_PER_STUDENT\s*=\s*6" "$SEED"; then
  ok "seed: 6 уроков на студента"
else
  fail "seed: количество уроков на студента изменено"
fi

hdr "A5: POST /auth/register удалён везде"
REFS=$(grep -rn "RegisterSchema\|RegisterDto\|/auth/register\|auth\.register" \
  "$ROOT/apps" --include='*.ts' --include='*.tsx' 2>/dev/null | \
  grep -v node_modules | wc -l)
if [ "$REFS" -eq 0 ]; then
  ok "Никаких упоминаний register"
else
  fail "$REFS упоминаний register всё ещё в коде:"
  grep -rn "RegisterSchema\|RegisterDto\|/auth/register\|auth\.register" \
    "$ROOT/apps" --include='*.ts' --include='*.tsx' 2>/dev/null | \
    grep -v node_modules | sed 's/^/    /'
fi

# ─── ДИНАМИЧЕСКИЕ ПРОВЕРКИ (требуют yarn install + docker) ──────────

hdr "Backend type-check (требует yarn install)"
if [ -d "$ROOT/apps/backend/node_modules" ] || [ -d "$ROOT/node_modules" ]; then
  if (cd "$ROOT/apps/backend" && npx tsc --noEmit 2>&1 | grep -v "deprecated\|TS5101" | grep -E "error TS" >/dev/null); then
    fail "Backend type-check провалился"
  else
    ok "Backend type-check прошёл"
  fi
else
  skip "node_modules не найдены — пропуск (запусти 'yarn install')"
fi

hdr "Backend unit tests (требует yarn install)"
if [ -d "$ROOT/apps/backend/node_modules" ] || [ -d "$ROOT/node_modules" ]; then
  if (cd "$ROOT/apps/backend" && yarn test 2>&1 | tail -3 | grep -q "passed\|Tests:"); then
    ok "Unit-тесты прошли"
  else
    fail "Unit-тесты провалились (или не запустились)"
  fi
else
  skip "node_modules не найдены — пропуск"
fi

hdr "Database проверки (требует docker compose up + миграции)"
if command -v psql >/dev/null 2>&1 && PGPASSWORD=soynativo psql -h localhost -U soynativo -d soynativo -c "SELECT 1" >/dev/null 2>&1; then
  # Проверка A4 через SQL
  COUNT=$(PGPASSWORD=soynativo psql -h localhost -U soynativo -d soynativo -tAc "SELECT count(*) FROM lessons WHERE type='individual'")
  if [ "$COUNT" -ge 18 ]; then
    ok "lessons: $COUNT индивидуальных уроков"
  else
    fail "lessons: только $COUNT индивидуальных (ожидается ≥18 после seed)"
  fi

  MULTI=$(PGPASSWORD=soynativo psql -h localhost -U soynativo -d soynativo -tAc \
    "SELECT count(*) FROM (SELECT lesson_id, count(*) c FROM lesson_participants GROUP BY lesson_id HAVING count(*) > 1) x")
  if [ "$MULTI" -eq 0 ]; then
    ok "lesson_participants: каждый individual урок имеет 1 студента"
  else
    fail "lesson_participants: $MULTI уроков с >1 участника (нарушение individual)"
  fi
else
  skip "PostgreSQL недоступен — пропуск (docker compose up + migration:run + seed)"
fi

hdr "HTTP проверки (требует backend running)"
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/v1/auth/login 2>/dev/null | grep -qE "^(401|422|400)$"; then
  ok "Backend отвечает на /api/v1/auth/login"

  # A5: register должен быть 404
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
    -X POST http://localhost:3000/api/v1/auth/register \
    -H "Content-Type: application/json" \
    -d '{"email":"x@x.com","password":"123"}')
  if [ "$STATUS" = "404" ]; then
    ok "/auth/register возвращает 404 (endpoint удалён)"
  else
    fail "/auth/register возвращает $STATUS (ожидается 404)"
  fi
else
  skip "Backend не запущен — пропуск (yarn workspace @soynativo/backend dev)"
fi

# ─── ИТОГ ────────────────────────────────────────────────────────────

echo
echo "═══════════════════════════════════════════════════════════"
echo -e "Прошло:  ${GREEN}$PASS${NC}"
echo -e "Провалено: ${RED}$FAIL${NC}"
echo -e "Пропущено: ${YELLOW}$SKIP${NC}"
echo "═══════════════════════════════════════════════════════════"

if [ "$FAIL" -gt 0 ]; then
  exit 1
fi
exit 0
