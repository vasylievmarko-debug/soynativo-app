# Technical Debt — Soynativo

Список технических долгов, которые **не блокируют v1.0**, но требуют рефакторинга после релиза. Каждый пункт: суть проблемы → предлагаемое решение → когда чинить.

---

## Pre-existing TypeScript errors in mobile

Surfaced during SDK 50 → 51 migration but not related. These existed before and were not caught because previous type-check runs may not have been done.

1. **`apps/mobile/src/app/providers/AppProviders.tsx:4:10`**
   Import: `createSyncStoragePersister` from `@tanstack/query-async-storage-persister`
   Should be: `createAsyncStoragePersister`

   **Fix:** rename import + verify usage works correctly with async storage persister pattern.

2. **`apps/mobile/src/shared/ui/atoms/__tests__/Button.test.tsx:9:33`**
   Property `toHaveTextContent` not on `JestMatchers`.

   **Fix:** Setup `@testing-library/jest-native` via jest setup file:
   - Install `@testing-library/jest-native` if not present
   - Add to `apps/mobile/jest.setup.ts`:
     ```ts
     import '@testing-library/jest-native/extend-expect';
     ```
   - Reference setup file in jest.config

**When:** After full SDK migration (Step 4 done).
**Why later:** These don't block Metro bundler. Fixing them during migration would mix concerns.

---

## Worker DI compatibility under tsx

`apps/backend/src/core/queue/workers/notifications.worker.ts` uses tsyringe DI but is launched via tsx in `worker:notifications` script. This will fail with same error backend dev had: "TypeInfo not known".

When worker becomes needed (Telegram notifications, scheduled jobs), migrate `worker:notifications` script to `@swc-node/register` similar to dev script.

**Workaround:** same `.swcrc` applies, just change script in `apps/backend/package.json` from:

```
"worker:notifications": "tsx src/core/queue/workers/notifications.worker.ts"
```

To:

```
"worker:notifications": "node --import @swc-node/register/esm-register src/core/queue/workers/notifications.worker.ts"
```

**When:** when notifications feature is implemented (v1.1+).

---

## Refactor: shared package resolution (Вариант C)

**Сейчас:** `packages/shared` собирается в `dist/`, и backend/mobile импортируют оттуда.

`packages/shared/package.json` указывает `"main": "dist/index.js"` и `"types": "dist/index.d.ts"`. Backend `apps/backend/tsconfig.json` ставит `"paths": { "@soynativo/shared": ["../../packages/shared/dist"] }`. Mobile резолвит через workspace symlink в `node_modules/@soynativo/shared`, который тоже бьёт в `dist/`.

**Проблема:** требует ручного ребилда (`yarn workspace @soynativo/shared build`) при каждом изменении в `packages/shared/src`. Хрупко: новый разработчик / CI / `git clean -fdx` забудут собрать → 6 ошибок type-check, тесты не запускаются, mobile падает на runtime в `LessonsScreen` (см. инцидент 2026-04-29).

**Решение:** перенацелить package.json `main`/`types` на `src/index.ts` и backend `tsconfig.paths` тоже на `src/`. Mobile metro уже работает через workspace symlink — ничего менять не нужно. Для backend в dev-режиме нужен `ts-node` или `tsx`, чтобы резолвить `.ts` напрямую без билда. Для production-сборки backend всё равно потребуется собирать shared (через bundler в `apps/backend/dist` или через `tsc -b` с project references).

**Когда:** после v1.0, не блокирует релиз. Сейчас обходится одной командой `yarn workspace @soynativo/shared build`.

**Связанные файлы:**
- `packages/shared/package.json`
- `apps/backend/tsconfig.json` (поле `paths`)
- `apps/backend/package.json` (dev-скрипты, если перейдём на `tsx`)

---

## Minor: jest `testTimeout` warning

**Сейчас:** При запуске `yarn workspace @soynativo/backend test` jest показывает:
```
Validation Warning:
Unknown option "testTimeout" with value 30000 was found.
```

**Проблема:** Опция `testTimeout` указана не там, где её ожидает jest 30+ (вероятно в multi-project config она должна быть на уровне отдельных projects, а не на root). Не влияет на работу тестов, но мусорит вывод.

**Решение:** Переместить `testTimeout` из root jest config в каждый `projects[].testTimeout` или удалить если не используется.

**Когда:** в любой момент, тривиальный фикс на 5 минут.

---

## Refactor: empty-string handling in env validation

**Сейчас:** Текущая Zod схема в `apps/backend/src/config/env.ts` падает на пустых строках для опциональных URL-полей (`GOOGLE_MEET_REDIRECT_URI`, `TELEGRAM_WEBHOOK_URL`, `SENTRY_DSN`).

**Корень:** `z.string().url().optional()` разрешает только `undefined`, а `.env` с пустой строкой даёт `""` — это валидная строка, но невалидный URL. В результате при копировании `.env.example` (где такие поля стоят пустыми) валидация падает, хотя поля и должны быть необязательными.

**Решение:** добавить preprocess `(val) => val === '' ? undefined : val` ко всем optional URL полям, или использовать `z.string().url().or(z.literal('')).optional()`. Также проверить остальные `.optional()` поля в схеме — есть ли там аналогичная проблема (например, опциональные строки, которые сейчас не проявились).

**Обходной путь сейчас:** соответствующие строки закомментированы в `apps/backend/.env` и `apps/backend/.env.example` (инцидент 2026-04-29).

**Когда:** после v1.0, требует тестирования на всех env-полях.

**Связанные файлы:**
- `apps/backend/src/config/env.ts`
- `apps/backend/.env.example` (можно раскомментировать поля после фикса)

---

## Standardize bcrypt import style across backend

Project mixes two import styles for `bcryptjs`:
- `auth.service.ts` and `seed.ts` use: `import bcrypt from 'bcryptjs'`
- `auth.integration.test.ts` uses: `import * as bcrypt from 'bcryptjs'`

Both work but inconsistently. Namespace-style works under jest/ts-jest but failed under tsx (esbuild). Default import works in both contexts.

**Recommended:** standardize on default import everywhere. Update `auth.integration.test.ts` to match.

**When:** post-v1.0, low priority.
