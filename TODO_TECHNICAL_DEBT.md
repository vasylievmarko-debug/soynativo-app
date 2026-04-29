# Technical Debt — Soynativo

Список технических долгов, которые **не блокируют v1.0**, но требуют рефакторинга после релиза. Каждый пункт: суть проблемы → предлагаемое решение → когда чинить.

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
