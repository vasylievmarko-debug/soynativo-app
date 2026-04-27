# V1.0 Status Report

**Дата:** 2026-04-27  
**Ветка:** `claude/language-learning-app-LWdbd`  
**Статус:** Дни 1-2 завершены. Готов к началу Дня 3.

---

## 1. ФИНАЛЬНАЯ СХЕМА БД

### Migrations

```
1714200000000-InitialSchema.ts
├── users table
├── lessons table
├── bookings table (заготовка для v1.1)
├── notifications table (заготовка для v1.1+)
└── Enums: user_role, user_status, lesson_level, lesson_status

1714250000000-V1Schema.ts (новая)
├── ADD user.timezone (VARCHAR 50, default 'UTC')
├── ADD user.subscriptionStatus (enum: trial|active|expired)
├── ADD lessons.type (enum: individual|group, default 'individual')
├── CREATE TABLE lesson_participants (many-to-many)
└── CREATE enums: subscription_status, lesson_type
```

### Таблицы в v1.0

**users**
```sql
id UUID PK
email VARCHAR UNIQUE
passwordHash VARCHAR
firstName VARCHAR
lastName VARCHAR
avatarUrl VARCHAR nullable
role enum (student|teacher|admin)
status enum (active|inactive|suspended)
timezone VARCHAR (default 'UTC') — ✅ НОВОЕ
subscriptionStatus enum (trial|active|expired) — ✅ НОВОЕ
telegramChatId VARCHAR nullable
notificationsEnabled BOOLEAN
lastLoginAt TIMESTAMPTZ nullable
createdAt, updatedAt, deletedAt, version
```

**lessons**
```sql
id UUID PK
teacherId UUID FK → users
title VARCHAR
description TEXT nullable
language VARCHAR
level enum (A1|A2|B1|B2|C1|C2)
startTime TIMESTAMPTZ
durationMinutes INTEGER
type enum (individual|group) — ✅ НОВОЕ, default 'individual'
maxStudents INTEGER (default 20)
status enum (scheduled|in_progress|completed|cancelled)
googleMeetId VARCHAR nullable
recordingUrl VARCHAR nullable
createdAt, updatedAt, deletedAt, version
```

**lesson_participants** — ✅ НОВАЯ ТАБЛИЦА
```sql
id UUID PK
lessonId UUID FK → lessons (CASCADE)
studentId UUID FK → users (CASCADE)
createdAt, updatedAt, deletedAt, version
UNIQUE(lessonId, studentId)
INDEX ON studentId — для быстрого поиска уроков ученика
```

**bookings** (заготовка для v1.1)
```sql
id UUID PK
lessonId UUID FK → lessons
studentId UUID FK → users
status enum (pending|confirmed|cancelled|completed)
notes TEXT nullable
createdAt, updatedAt, deletedAt, version
UNIQUE(lessonId, studentId)
```

**notifications** (заготовка для v1.1+)
```sql
id UUID PK
userId UUID FK → users
lessonId UUID FK → lessons nullable
type enum (lesson_created|lesson_rescheduled|booking_confirmed|lesson_starting|recording_ready)
content TEXT
isRead BOOLEAN
telegramSent BOOLEAN
createdAt, updatedAt, deletedAt, version
```

---

## 2. УДАЛЕНО ИЗ КОДА

**Проверено grep'ом:**

```
❌ STRIPE — 0 упоминаний (не найдено)
❌ SUPABASE — 0 упоминаний (не найдено)
❌ SIGNUP (экран регистрации) — 0 упоминаний (не найдено)
❌ group_students (таблица) — 0 упоминаний в коде (заменена на lesson_participants)
❌ S3 для видео (из MVP) — не в коде, только в roadmap v1.4
❌ WebSocket-чат (из roadmap) — socket.io импортируется как заготовка, но не используется
```

**Что осталось (это OK — заготовки для v1.1+):**
- `socket.io` dependency в package.json (импортируется в server.ts, но не инициализируется)
- `bookings` таблица в БД (переделается в v1.1 для reschedule, пока не используется)
- `recordings` module скелет (заполнится в v1.4)
- `notifications` модуль скелет (активируется в v1.1)
- `integrations/telegram` скелет (используется только для feedback в v1.0)
- `integrations/google-meet` скелет (используется в v1.1+)

---

## 3. RISK MANAGEMENT — СТАТУС ИНТЕГРАЦИИ

### ✅ ГОТОВО (дни 1-2)

**Environment Management:**
- [x] `.env.example` содержит все необходимые переменные (DATABASE_URL, REDIS_URL, SENTRY_DSN, JWT_*, TELEGRAM_*, GOOGLE_MEET_*)
- [x] `.gitignore` содержит `.env`, `.env.local`, `.env.*.local` — secrets не попадут в git
- [x] Backend: SENTRY_DSN в .env.example
- [x] Mobile: EXPO_PUBLIC_SENTRY_DSN в .env.example

**Database:**
- [x] lesson_participants заменила groups/group_students
- [x] subscription_status добавлена в users (не используется в логике v1.0)
- [x] Миграция V1Schema.ts готова к запуску

**Seed Data:**
- [x] 1 учитель (teacher@example.com, пароль: teacher123)
- [x] 3 ученика (student{1,2,3}@example.com, пароль: student123)
- [x] 10 уроков (6 будущих, 4 прошедших)

### ⏳ ТРЕБУЕТСЯ (дни 3-7)

**Sentry Integration:**
- [ ] Backend: `@sentry/node` установить, инициализировать в app.ts
- [ ] Mobile: `@sentry/react-native` установить, обернуть в ErrorBoundary в AppProviders.tsx
- [ ] Настроить отправку ошибок в sentry.io (требуется SENTRY_DSN из dashboard)

**Healthcheck Endpoint:**
- [ ] GET /health (публичный) — проверяет БД + Redis
- [ ] Возвращает { "status": "ok" } или 503 при падении

**Feedback System:**
- [ ] POST /feedback backend endpoint (защищено JWT)
- [ ] BullMQ job для отправки в Telegram
- [ ] Mobile UI: кнопка "Сообщить о проблеме" в ProfileScreen
- [ ] Modal с textarea + отправкой

**Privacy & Compliance:**
- [ ] Privacy Policy текст (termly.io или заглушка)
- [ ] Terms of Service текст (termly.io или заглушка)
- [ ] Модальные окна на LoginScreen (ссылки: "Условия", "Политика")
- [ ] ProfileScreen: кнопка обратной связи

**Backups:**
- [ ] Если managed DB (RDS, DigitalOcean) — галочка в интерфейсе (14d retention)
- [ ] Если Docker — pg_dump cron скрипт + S3 upload

**Monitoring:**
- [ ] UptimeRobot account + HTTP check на /health (5m interval)
- [ ] Telegram notification при падении

---

## 4. ТЕКУЩЕЕ СОСТОЯНИЕ ПЛАНА

**День 1-2:** ✅ ЗАВЕРШЕНЫ
- [x] Миграция: lesson_participants, lesson.type, user.timezone, user.subscription_status
- [x] Entities: обновлены UserEntity, LessonEntity, новая LessonParticipantEntity
- [x] Seed script: 1 учитель, 3 ученика, 10 уроков
- [x] Проверка: Stripe/Supabase/SignUp удалены

**День 3-5:** ⏳ СЛЕДУЮЩИЕ
- [ ] AUTH backend (login, refresh — проверить/исправить)
- [ ] GET /users/me endpoint
- [ ] GET /lessons?status=upcoming & ?status=past endpoints с JOIN lesson_participants
- [ ] Unit-тесты для auth + lessons

**День 6-7:** ⏳ Risk Management
- [ ] Sentry integration (backend + mobile)
- [ ] Healthcheck endpoint
- [ ] Feedback endpoint + form
- [ ] .env files separation
- [ ] Privacy Policy/ToS screens

**День 8-13:** ⏳ Mobile (UI, screens, auth flow)

**День 14-15:** ⏳ QA + Integration Testing

**День 16-17:** ⏳ Bug fixes + TestFlight

**Реалистичный прогноз до TestFlight:** 16-17 дней (до 2026-05-14).

---

## 5. КАК ЗАПУСТИТЬ ЛОКАЛЬНО

### Prerequisites (на Mac)

```bash
# Зависимости (если не установлены)
brew install postgresql redis node@18

# Или через Docker (проще):
docker compose up -d  # Поднимает postgres + redis

# Установить зависимости proекта
yarn install
```

### Запуск Backend

```bash
# 1. Выполнить миграции
yarn workspace @soynativo/backend migration:run

# 2. Загрузить seed data
yarn workspace @soynativo/backend seed

# 3. Запустить в dev mode
yarn workspace @soynativo/backend dev

# Backend доступен: http://localhost:3000
# API: http://localhost:3000/api/v1
# Swagger: http://localhost:3000/api/v1/docs (если готов)
```

### Запуск Mobile

```bash
# Terminal 1: Expo dev server
yarn workspace @soynativo/mobile start

# Выбрать платформу:
# - 'i' для iOS simulator
# - 'a' для Android emulator
# - или отсканировать QR код в Expo Go на iPhone
```

### Тестовые Credentials (из seed)

**Teacher:**
- Email: `teacher@example.com`
- Password: `teacher123`

**Students:**
- Email: `student1@example.com`, `student2@example.com`, `student3@example.com`
- Password: `student123` (для всех)

### Ожидаемый flow после логина (когда API готов)

```
Login Screen (email + password)
  ↓
POST /auth/login
  ↓
AppTabs (3 равноправных таба)
  ├── Tab 1: Upcoming Lessons (GET /lessons?status=upcoming)
  ├── Tab 2: Past Lessons (GET /lessons?status=past)
  └── Tab 3: Profile (GET /users/me)

Expected data:
- 6 upcoming lessons (startTime > now)
- 4 past lessons (startTime < now)
- Student enrolled in all 10 lessons through lesson_participants
```

---

## 6. ВОПРОСЫ И НЕИЗВЕСТНОЕ

### Риски, требующие проверки

1. **Refresh Token логика**
   - Текущий код в `apps/backend/src/modules/auth/` может быть стабом
   - Нужно проверить: есть ли реальная валидация refresh token?
   - Есть ли чёрный список токенов или логика истечения?
   - **Action:** Проверить auth.service.ts и token.service.ts на День 3

2. **RLS проверки**
   - В V1_PLAN.md написано как должно быть (JOIN с lesson_participants)
   - Нужно убедиться что контроллеры это реально делают
   - **Action:** Grep по lesson контроллеру, проверить наличие RLS

3. **UI компоненты**
   - `apps/mobile/src/shared/ui/` может содержать скелеты или старые компоненты
   - Нужна проверка что реально есть: Screen, Card, Button, Input, Skeleton
   - **Action:** Список файлов в ui/ на День 8

4. **Sentry + Telegram bot интеграция**
   - Feedback endpoint требует отправки в Telegram
   - Нужна библиотека `telegraf` (уже в package.json)
   - Нужен рабочий TELEGRAM_BOT_TOKEN перед v1.1
   - **Action:** Понять есть ли уже telegram bot setup или нужно создавать

5. **EAS Build первый раз**
   - Если это первый раз building iOS на EAS, может потребоваться:
     - Apple Developer Account ($99/год) — ты начинаешь параллельно
     - Provisioning profiles + certificates
     - Может занять 1-2 часа на первый раз
   - **Action:** Проверить готов ли Apple account к дню 16

6. **Privacy Policy / Terms текст**
   - Нужен реальный текст или заглушка?
   - Если реальный — использовать termly.io (бесплатно)
   - **Action:** Уточнить текст перед днём 13

7. **Backups стратегия**
   - Зависит от выбора хостинга для v1.0 demo
   - Managed (RDS, DigitalOcean, Heroku) → auto backups
   - Docker на своём сервере → pg_dump cron
   - **Action:** Уточнить где будет hosted v1.0

### Что проверить прямо сейчас перед День 3

```bash
# 1. Убедиться что migrations готовы
cd apps/backend
yarn migration:run  # Должна успешно выполниться

# 2. Убедиться что seed работает
yarn seed  # Должен создать 1 teacher + 3 students + 10 lessons

# 3. Убедиться что backend стартует
yarn dev  # Должен слушать на :3000

# 4. Проверить что auth endpoints отвечают (даже если не готовы)
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "teacher@example.com", "password": "teacher123"}'
# Ожидается либо token, либо error 500/501, но не 404
```

---

## 7. ИТОГО

**Commit history (последние):**
- `feat(day1-2): v1.0 database schema` — миграции + entities + seed
- `refine: V1_PLAN.md - add risk management` — план 16-17 дней

**Files changed в дни 1-2:**
- 4 новых файла (entities + миграция + seed)
- 2 обновлённых файла (UserEntity + LessonEntity)
- 0 удалённых файлов

**Готовность к День 3:** 
- ✅ Database готова
- ✅ Seed data готова
- ⏳ Backend API требует реализации (auth, lessons endpoints)
- ⏳ Risk management требует интеграции (Sentry, healthcheck, feedback)

---

**Ветка готова к pull request. Жди на день 3 готовности к auth backend.**
