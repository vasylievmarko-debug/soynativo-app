# AUDIT_FIXES.md — Отчёт об исправлении критичных проблем

**Дата:** 2026-04-27
**Аудитор:** Claude Opus 4.7
**Исправил:** Claude Opus 4.7

Все 5 🔴 критичных проблем из AUDIT.md исправлены. Бонусом закрыт 🟠 B2 и 🟠 B6.

---

## A1 — RLS-уязвимость в /users/:id ✅

**Что было:**
```ts
router.get('/:id', authGuard, c.getById);     // любой видел чужой профиль
router.patch('/:id', authGuard, c.update);    // любой обновлял чужой профиль
```

**Что сделано:**
- `apps/backend/src/modules/users/user.routes.ts` — оставлен только `GET /me`
- `apps/backend/src/modules/users/user.controller.ts` — оставлен только метод `me`
- `apps/backend/src/modules/users/dto/user.dto.ts` — добавлены `timezone`, `subscriptionStatus` в `UserPublicDto` (нужны для /me)
- Service-методы (getById, update, list, delete) **остались как заготовка** для admin-панели в v1.4+, но НЕ маршрутизированы

**Поверхность API сейчас:**
```
GET /api/v1/users/me  → returns own profile (timezone, subscriptionStatus included)
```

Никаких других /users эндпоинтов в v1.0 нет.

---

## A2 — metro.config.js ✅

**Что было:** файл отсутствовал. Mobile не нашёл бы packages/* в монорепо.

**Что сделано:** создан `apps/mobile/metro.config.js`:
```js
const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);
config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];
config.resolver.disableHierarchicalLookup = true;

module.exports = config;
```

**Что нужно проверить руками:**
```bash
cd apps/mobile
npx expo start --clear
# Не должно быть ошибок "Unable to resolve module @soynativo/shared"
```

⚠️ Я не могу запустить Expo из этого окружения (нет sandbox для GUI). Это **обязательно** проверить тебе локально.

---

## A3 — OFFSET pagination → cursor ✅

**Что было:**
```ts
list(params): Promise<[UserEntity[], number]> {
  return qb.skip((page - 1) * limit).take(limit).getManyAndCount();
}
```

**Что сделано:**
- `apps/backend/src/modules/users/user.repository.ts` — переписан через `paginate()` из `@shared/pagination/cursor`
- Сортировка: `createdAt DESC` (свежие первыми)
- Возвращает `{ items, nextCursor }` вместо `[items, count]`
- `apps/backend/src/modules/users/dto/user.dto.ts` — `ListUsersQuerySchema` переименована в `ListUsersCursorQuerySchema` с полями `{ cursor, limit, role }` вместо `{ page, limit, role }`
- `apps/backend/src/modules/users/user.service.ts` — обновлён под новый возвращаемый тип
- `apps/backend/test/doubles/in-memory-user.repository.ts` — `list()` обновлён под cursor-сигнатуру

**Замечание:** в v1.0 `list()` всё равно никем не вызывается (нет admin-роутера), но он соответствует CONVENTIONS.md §9.

---

## A4 — seed.ts: индивидуальные уроки ✅

**Что было:**
- 10 уроков, все `type='individual'`
- Каждый назначен 3 студентам (нарушение домена)
- bcrypt hardcoded 10 rounds

**Что сделано:** `apps/backend/src/core/database/seeds/seed.ts`
- **18 уроков** (6 на каждого из 3 студентов)
- Каждый урок: ровно **1 запись** в `lesson_participants`
- 3 прошлых (status='completed') + 3 будущих (status='scheduled') на студента
- Уроки разнесены по часам дня (10:00, 12:00, 14:00) чтобы не было конфликтов teacher schedule
- Использует `env.BCRYPT_ROUNDS` (исправляет 🟠 B6)
- Добавлен production-guard: `if (NODE_ENV === 'production') exit(1)`
- Корректный exit code на ошибке: `process.exit(1)` вместо `exit(0)`
- Замена `delete({})` на `createQueryBuilder().delete().execute()`

**Финальный datset:**
```
3 students × 6 lessons = 18 lessons
Each lesson has 1 participant (true individual)
9 past + 9 upcoming
```

---

## A5 — POST /auth/register удалён ✅

**Что было:** открытый endpoint регистрации, противоречил брифу.

**Что удалено:**

| Файл | Что удалено |
|------|-------------|
| `apps/backend/src/modules/auth/dto/auth.dto.ts` | `RegisterSchema`, `RegisterDto` |
| `apps/backend/src/modules/auth/auth.service.ts` | метод `register()`, импорт `ConflictException` |
| `apps/backend/src/modules/auth/auth.controller.ts` | метод `register` |
| `apps/backend/src/modules/auth/auth.routes.ts` | `router.post('/register', ...)` |
| `apps/mobile/src/features/auth/api/auth.api.ts` | метод `register()` (заменён на `refresh()`) |
| `apps/backend/src/modules/auth/__tests__/auth.service.test.ts` | блок `describe('register')` (заменён на `login` + `refresh` тесты) |
| `apps/backend/test/integration/auth.integration.test.ts` | сценарий register (переписан на seed → login → /me) |

**Что осталось как заготовка:**
- `DomainEvents.User.Registered` — экспортируется, но не публикуется
- `EventBus` — на месте

**API surface auth теперь:**
```
POST /api/v1/auth/login    (rate limit 10/min)
POST /api/v1/auth/refresh  (rate limit 10/min) ← добавлен rate limit (бонус B2)
POST /api/v1/auth/logout   (no-op stub)
```

---

## Бонусные исправления (попутно с критичными)

### 🟠 B2: rate limit на /auth/refresh — закрыт
```ts
router.post('/refresh', authLimiter, c.refresh);  // было без limiter
```

### 🟠 B6: BCRYPT_ROUNDS hardcoded — закрыт
seed.ts теперь использует `env.BCRYPT_ROUNDS` (по умолчанию 12).

### 🟡 C2: seed без production guard — закрыт
```ts
if (env.NODE_ENV === 'production') {
  console.error('❌ Seed forbidden in production');
  process.exit(1);
}
```

### 🟡 C3: seed exit code на ошибке — закрыт
```ts
seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  });
```

---

## Дополнительная проверка по запросу

### a) Sentry интеграция

**Статус:** ❌ НЕ ИНТЕГРИРОВАНА.

**Что есть:**
- `SENTRY_DSN` объявлена в `apps/backend/src/config/env.ts:45` (опционально)
- `EXPO_PUBLIC_SENTRY_DSN` объявлена в `apps/mobile/.env.example:4`
- Комментарий в `apps/mobile/src/shared/ui/organisms/ErrorBoundary.tsx:28`:
  ```tsx
  // TODO: forward to Sentry once configured.
  ```

**Что отсутствует:**
- `@sentry/node` SDK — не установлен в `apps/backend/package.json`
- `@sentry/react-native` SDK — не установлен в `apps/mobile/package.json`
- `Sentry.init()` — нет ни в `app.ts`, ни в `AppProviders.tsx`
- Нет error handler middleware для Sentry в Express

**Где добавить:**
1. Backend: `apps/backend/src/app.ts` — `Sentry.init()` в начале `createApp()`, обработчик `Sentry.Handlers.errorHandler()` перед `errorHandler`
2. Mobile: `apps/mobile/src/app/AppProviders.tsx` — `Sentry.init()` при старте, оборачивание `<Sentry.ErrorBoundary>` корня

**Запланировано:** День 6-7 в V1_PLAN.md (Risk Management). Пока не сделано.

---

## Что обнаружилось дополнительно (не в плане):

### Healthcheck endpoints — ✅ УЖЕ РЕАЛИЗОВАНЫ

В `apps/backend/src/app.ts` обнаружено три endpoint'а:
```ts
GET /health  → 200 status: ok (всегда)
GET /live    → liveness check (process alive)
GET /ready   → readiness check (DB + Redis)  ← это нужно для UptimeRobot
```

`GET /ready` уже проверяет PostgreSQL + Redis и возвращает 503 при падении одного из них. Для UptimeRobot нужно подключить именно `/ready`, а не `/health`.

**Action:** В V1_PLAN.md обновить раздел Risk Management — указать `/ready` вместо `/health` для UptimeRobot.

---

## Что не делал

По правилам аудита: **не исправлял** 🟠 важные и 🟡 минорные кроме тех что попутно закрыли (B2, B6, C2, C3).

**Остаются открытыми:**

🟠 Важные:
- B1: refresh token rotation/blacklist (дни 6-7 — Sentry+Risk)
- B3: tsconfig.base.json не существует (Storybook сломан) — НАДО решить до Storybook деплоя
- B4: Storybook webpack alias неполный
- B5: Storybook → mobile coupling (если переедет packages/ui)
- B7: Lessons module пуст (день 4-5 — Lessons API)
- B8: authMiddleware async errors (низкий риск, есть `express-async-errors`)

🟡 Минорные:
- C1, C4, C5, C6, C7 — оставлены на потом

---

## Проверка изменений

```bash
# Type-check passed
yarn workspace @soynativo/backend type-check
# (только deprecation warning о baseUrl от TS 7 — не блокирует)

# Чисто:
grep -rn "auth\.register\|RegisterSchema\|/auth/register" apps/ --include='*.ts' --include='*.tsx' | grep -v node_modules
# → 0 результатов

# user.routes.ts:
grep -E "router\\." apps/backend/src/modules/users/user.routes.ts
# → router.get('/me', authGuard, c.me);  (только это)
```

---

## Что нужно проверить тебе руками

1. **A2: Mobile запуск**
   ```bash
   yarn install
   cd apps/mobile && npx expo start --clear
   ```
   Должно запуститься без ошибок резолва пакетов. (Я не могу запустить Expo в sandbox.)

2. **A4: Seed**
   ```bash
   docker compose up -d
   yarn workspace @soynativo/backend migration:run
   yarn workspace @soynativo/backend seed
   # Проверить:
   psql -d soynativo -c "SELECT type, count(*) FROM lessons GROUP BY type;"
   # → individual: 18

   psql -d soynativo -c "SELECT lesson_id, count(*) FROM lesson_participants GROUP BY lesson_id LIMIT 5;"
   # → каждый lesson_id имеет ровно 1 участника
   ```

3. **A5: register endpoint вернёт 404**
   ```bash
   yarn workspace @soynativo/backend dev
   curl -X POST http://localhost:3000/api/v1/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"x@x.com","password":"12345678"}'
   # → 404 NOT_FOUND
   ```

---

## Готовность к продолжению Дня 3

✅ Все критичные исправлены и запушены  
✅ Type-check проходит  
✅ Sentry проверен — отсутствует, запланирован на дни 6-7  
✅ Healthcheck `/ready` уже работает (использовать его для UptimeRobot)  
⚠️ Нужна ручная проверка локально (A2 metro, A4 seed)

**Если ручная проверка ОК — можно продолжать День 3 (Auth Backend + GET /users/me).**

Большая часть работы Дня 3 уже сделана как побочный эффект исправлений:
- ✅ login flow готов (исправлен)
- ✅ refresh с rate limit готов
- ✅ /me endpoint готов
- ⏳ Остаётся: unit-тесты login + refresh, manual Postman test
