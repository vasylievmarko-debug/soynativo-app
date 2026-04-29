# Daily Reports — Soynativo

Ежедневные отчёты Claude по работе над проектом. Новые записи добавляются **сверху**.

Формат каждого отчёта:
- **Сделано** — конкретные завершённые пункты
- **Изменения в коде** — затронутые файлы / коммиты
- **Решения** — архитектурные или процессные решения, принятые в этот день
- **Блокеры / открытые вопросы**
- **Что дальше** — план на следующий день

Разделитель между отчётами — горизонтальная линия (`---`) + заголовок с датой.

================================================================================

## 2026-04-29 (morning session)

**Done:**
- Fixed __filename → import.meta.url in data-source.ts
- Migrations ran successfully (InitialSchema + V1Schema)
- 6 tables created in DB
- Fixed bcrypt namespace import → default import in seed.ts
- Seed ran successfully
- A4 verified: 18 individual lessons (9 past + 9 future)
- 4 users created (1 teacher + 3 students)
- Each lesson has exactly 1 participant

**Decisions:**
- Variant A for bcrypt (default import) + TODO for namespace cleanup
- Removed completed item from TODO_TECHNICAL_DEBT.md

**Status: backend fully operational locally**
- Postgres + Redis healthy
- All migrations applied
- Seed data loaded
- Test credentials:
  teacher: teacher@example.com / teacher123
  students: student1/2/3@example.com / student123

**Next priorities:**
1. Decide v1.0 scope (BookingsScreen, Google Meet, Telegram bot)
2. Risk Management minimum (Sentry, /health, feedback, Privacy)
3. First run on iPhone via Expo Go
4. Run integration tests against local DB

================================================================================

## 2026-04-29 (overnight session)

**Done:**
- @soynativo/shared package built (dist/, type-check 0 errors)
- 4 unit tests passing
- Docker Desktop installed and running
- Postgres 16 + Redis 7 healthy
- Git author fixed (local + global)
- Migration tool: typeorm-ts-node-esm → tsx
- .env created with proper credentials
- .env.example fixed (commented empty URLs)

**Decisions:**
- Variant A for shared package (build dist/)
- Variant A1 for migration tool (tsx wrapper)
- Variant A for env empty strings
- Defer __filename ESM fix to next session

**Blockers:**
- data-source.ts uses __filename in ESM
- Migrations and seed both blocked

**Next session priorities:**
1. Fix __filename → import.meta.url (Variant A)
2. Run migrations, verify A4
3. Run seed
4. Decide v1.0 scope: BookingsScreen, Google Meet, Telegram bot
5. Risk Management minimum
6. First run on iPhone via Expo Go

**Note for next session:**
Switch model to Sonnet 4.6 for routine tasks to save quota.
Keep Opus 4.7 only for architecture decisions.

================================================================================

## 2026-04-29 — День: процесс отчётов + Storybook

### Сделано
- Обсудили текущее состояние проекта по `V1_STATUS.md`: дни 1-2 завершены, на очереди дни 3-5 (backend API: auth, `/users/me`, `/lessons` с JOIN на `lesson_participants`, unit-тесты).
- Помог запустить Storybook локально: проверил конфиг `apps/storybook/.storybook/main.ts`, удостоверился, что webpack-сборка проходит и порт `6006` слушается. У пользователя Storybook теперь работает.
- Ввели процесс ежедневных отчётов (этот файл).

### Изменения в коде
- Новый файл: `docs/reports/DAILY_REPORTS.md` (этот отчёт).
- Ничего не правил в коде приложения.

### Решения
- **Daily reports**: один файл `docs/reports/DAILY_REPORTS.md`, новые отчёты сверху, разделитель `---` + заголовок `## YYYY-MM-DD`. Содержание определяю я; пишу в конце каждого рабочего дня.
- Структура отчёта: Сделано / Изменения в коде / Решения / Блокеры / Что дальше.

### Блокеры / открытые вопросы
- Нет блокеров. Перед стартом Дня 3 нужно проверить локально (по `V1_STATUS.md` §6):
  - `yarn migration:run` отрабатывает
  - `yarn seed` создаёт teacher + 3 students + 10 lessons
  - `yarn dev` поднимает backend на `:3000`
  - `auth.service.ts` / `token.service.ts` — реальная логика refresh token или стабы

### Что дальше
- День 3: проверить состояние auth модуля (`apps/backend/src/modules/auth/`), доделать `login` / `refresh` если стабы.
- Реализовать `GET /users/me`.
- Начать `GET /lessons?status=upcoming` и `?status=past` с JOIN на `lesson_participants`.

================================================================================
