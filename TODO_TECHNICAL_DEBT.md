# Technical Debt — Soynativo

Список технических долгов, которые **не блокируют v1.0**, но требуют рефакторинга после релиза. Каждый пункт: суть проблемы → предлагаемое решение → когда чинить.

---

## Migrate data-source.ts to ESM (next session priority)

`apps/backend/src/core/database/data-source.ts` использует `__filename`, который undefined в ESM scope. Backend имеет `"type": "module"`, но `data-source.ts` использует CommonJS паттерн.

Это **блокирует** `migration:run` и `seed` (seed использует тот же data-source).

**Решение (Variant A):** Заменить `__filename.endsWith('.js')` на `import.meta.url.endsWith('.js')`. Семантика та же, корректно для ESM.

Также проверить другие CJS-паттерны в backend:
- `__dirname`
- `require()`
- `module.exports`

**Время:** 15-30 минут следующей сессии.

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
