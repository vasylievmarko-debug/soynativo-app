# V1.0 Release Plan

**Цель:** Минимальный рабочий каркас приложения для 80 учеников.  
Три экрана (Профиль, Предстоящие, Прошедшие) + логин. Только читка данных.

---

## 1. ИНВЕНТАРИЗАЦИЯ КОДА

### 1.1 Что используется в v1.0

**Backend:**
- ✅ `apps/backend/src/core/database/` — TypeORM DataSource, entities (User, Lesson)
- ✅ `apps/backend/src/core/di/` — tsyringe container (нужен для Service инъекции)
- ✅ `apps/backend/src/core/logger/` — Pino (базовое логирование)
- ✅ `apps/backend/src/modules/auth/` — JWT tokens, password hashing
  - ❌ refresh token логика — нужно проверить, может быть сломана
  - ❌ guards/decorators для RLS — нужно добавить
- ✅ `apps/backend/src/modules/users/` — User entity, репозиторий
- ✅ `apps/backend/src/modules/lessons/` — Lesson entity, репозиторий
- ✅ `apps/backend/src/shared/middleware/` — CORS, rate-limit, error handler
- ✅ `apps/backend/src/core/http/` — Express setup

**Database schema:**
- ✅ `users` table (id, email, password_hash, role, full_name, timezone)
  - ⚠️ Нужно убедиться, что есть поле `subscription_status` (enum: trial/active/expired)
- ✅ `lessons` table (id, teacher_id, student_id, title, start_time, end_time, timezone, status)
  - ❌ Структуры school/group нет в схеме. Нужно добавить поля `school_id`, `group_id` (оставить пустыми, но система готова)
- ❌ Остальные таблицы (bookings, recordings, notifications) в БД есть, но в v1.0 не используются

**Mobile:**
- ✅ `apps/mobile/src/app/AppProviders.tsx` — Zustand, TanStack Query, i18next setup
- ✅ `apps/mobile/src/shared/api/` — Axios instance с interceptors
- ✅ `apps/mobile/src/shared/store/` — Zustand store structure
- ✅ `apps/mobile/src/shared/theme/` — Тема, токены
- ❌ `apps/mobile/src/shared/ui/` — UI компоненты НЕ полностью готовы. Большинство скелеты.
- ❌ Навигация в `apps/mobile/src/app/RootNavigator.tsx` — существует, но может быть неправильной структуры

**Пакеты:**
- ✅ `packages/shared/` — типы (User, Lesson, JWT payload)
- ❌ `packages/design-tokens/` — если существует, то используется
- ⚠️ `packages/shared/validators/` — Zod схемы нужно проверить/расширить для v1.0

### 1.2 Что НЕ трогаем (оставляем как заготовки)

```
apps/backend/src/modules/bookings/          — для v1.1
apps/backend/src/modules/recordings/        — для v1.4
apps/backend/src/modules/video-call/        — для v1.1+
apps/backend/src/modules/notifications/     — для v1.1+ (BullMQ setup)
apps/backend/src/integrations/telegram/     — для v1.1
apps/backend/src/integrations/google-meet/  — для v1.1+
apps/mobile/src/features/bookings/          — для v1.1
apps/mobile/src/features/video-call/        — для v1.1+
apps/mobile/src/features/notifications/     — для v1.1+
apps/mobile/src/features/recordings/        — для v1.4
```

**Правило:** не удаляем, не дописываем, не рефакторим. Просто оставляем.

### 1.3 Что убрать из кода

**Везде (backend + mobile + docs + roadmap):**
- ❌ Упоминания Stripe (SDK, mock-объекты, const STRIPE_KEY)
- ❌ Упоминания Supabase в коде (если остались после миграции)
- ❌ WebSocket-чат упоминания в roadmap
- ❌ S3 для видео упоминания в roadmap
- ❌ Функция регистрации в приложении (если есть экран SignUp)
- ❌ Любые CTA "купить", "оплатить", ссылки на цены

**Где искать и удалять:**
- `apps/backend/.env.example` — удалить STRIPE_*, SUPABASE_*
- `apps/backend/src/**/*.ts` — grep "stripe\|supabase" (case-insensitive)
- `apps/mobile/.env.example` — то же
- `apps/mobile/src/**/*.ts` — то же
- `README.md`, `ROADMAP.md` (если есть) — упоминания платежей
- `package.json`, `package-lock.json` — зависимости stripe, supabase (если есть)

### 1.4 Что нужно дописать / исправить

**Backend:**
1. ❌ `auth/controllers/login.post` — проверить: есть ли обработка ошибок (неверный пароль, юзер не найден)
2. ❌ `auth/controllers/refresh.post` — проверить: логика refresh token, возврат нового access token
3. ❌ `auth/guards/JwtGuard` — нужен декоратор для защиты endpoints
4. ⚠️ `lessons/controllers/list.get` — создать, фильтрация по status + student_id, сортировка, cursor pagination
5. ⚠️ `users/controllers/me.get` — создать, возврат профиля текущего юзера из JWT
6. ❌ Database migration для добавления полей `school_id`, `group_id`, `subscription_status`
7. ❌ Seed script для создания тестовых данных (1 учитель, 3 ученика, 5 уроков)

**Mobile:**
1. ❌ `features/auth/screens/LoginScreen.tsx` — форма, обработка ошибок, переход в AppTabs
2. ❌ `features/profile/screens/ProfileScreen.tsx` — отображение имени, email, таймзоны, кнопка выхода
3. ❌ `features/lessons/screens/UpcomingLessonsScreen.tsx` — список с FlashList, состояния loading/empty/error
4. ❌ `features/lessons/screens/PastLessonsScreen.tsx` — то же, но отсортировано по убыванию даты
5. ❌ Navigation structure в `app/RootNavigator.tsx` — AuthStack vs AppTabs
6. ❌ UI компоненты: Screen, Card, Avatar, Button, Input, EmptyState, ErrorState, Spinner, Skeleton, TabBar
7. ❌ `shared/i18n/ru.json` — все строки для v1.0 (логин, профиль, предстоящие, прошедшие, ошибки)
8. ❌ TanStack Query hooks для lessons/user (useUpcomingLessons, usePastLessons, useProfile)
9. ❌ Zustand store: authStore (user, isAuthenticated, logout)

---

## 2. BACKEND v1.0 ЧАСТЬ

### 2.1 Endpoints

**POST /auth/login**
```json
Request:
{
  "email": "student@example.com",
  "password": "password123"
}

Response (200 OK):
{
  "accessToken": "eyJh...",
  "refreshToken": "eyJy...",
  "expiresIn": 900
}

Response (401 Unauthorized):
{
  "code": "INVALID_CREDENTIALS",
  "message": "Email or password is incorrect"
}
```

**POST /auth/refresh**
```json
Request:
{
  "refreshToken": "eyJy..."
}

Response (200 OK):
{
  "accessToken": "eyJh...",
  "expiresIn": 900
}

Response (401 Unauthorized):
{
  "code": "INVALID_REFRESH_TOKEN",
  "message": "Refresh token expired or revoked"
}
```

**GET /auth/logout** (не используется в v1.0 на мобильной, но хорошо иметь)
```
Response (200 OK):
{ "success": true }
```

**GET /users/me** (защищено JWT)
```json
Response (200 OK):
{
  "id": "uuid",
  "email": "student@example.com",
  "fullName": "Иван Петров",
  "role": "student",
  "timezone": "Europe/Moscow",
  "subscriptionStatus": "active"
}

Response (401 Unauthorized):
{
  "code": "UNAUTHORIZED",
  "message": "No access token provided"
}
```

**GET /lessons?status=upcoming&limit=20&cursor=null** (защищено JWT)
```json
Response (200 OK):
{
  "items": [
    {
      "id": "uuid",
      "title": "Present Perfect",
      "description": "Ещё один урок грамматики",
      "level": "B1",
      "startTime": "2026-04-29T18:00:00Z",
      "endTime": "2026-04-29T19:00:00Z",
      "teacherName": "María García",
      "status": "scheduled"
    }
  ],
  "nextCursor": "eyJpZCI6InV1aWQifQ=="
}

Response (400 Bad Request):
{
  "code": "INVALID_STATUS",
  "message": "status must be 'upcoming' or 'past'"
}
```

**GET /lessons?status=past&limit=20&cursor=null** (защищено JWT)
```json
Аналогично upcoming, но отсортировано по убыванию startTime
```

### 2.2 Entities

**User:**
```ts
id: UUID
email: string (unique)
passwordHash: string
fullName: string
role: enum ('student', 'teacher', 'admin')  // только 'student' в v1.0
timezone: string (default 'UTC')
subscriptionStatus: enum ('trial', 'active', 'expired')  // default 'active', не используется в логике v1.0
createdAt: timestamp
updatedAt: timestamp
```

**Lesson:**
```ts
id: UUID
title: string
description?: string
level?: string
teacherId: UUID (foreign key to User)
startTime: timestamp (UTC)
endTime: timestamp (UTC)
type: enum ('individual', 'group')  // default 'individual' в v1.0, 'group' появится в v1.5+
status: enum ('draft', 'scheduled', 'in_progress', 'completed', 'cancelled')
googleMeetUrl?: string (добавит админ вручную в БД, не генерируется)
recordingUrl?: string (NULL в v1.0)
createdAt: timestamp
updatedAt: timestamp

// Связь с студентами: через lesson_participants (многие-ко-многим)
// В v1.0: каждый individual урок имеет ровно одну запись в lesson_participants
// В v1.5+: group уроки могут иметь несколько записей
```

**lesson_participants:**
```ts
id: UUID (primary key)
lessonId: UUID (foreign key to lessons)
studentId: UUID (foreign key to users)
createdAt: timestamp

// Уникальное ограничение: UNIQUE (lesson_id, student_id)
// Индекс на student_id для быстрого поиска уроков ученика
```

### 2.3 RLS / Authorization

**Rule 1: ученик видит только свои уроки**
```ts
// В lesson контроллере при GET /lessons
if (req.user.role === 'student') {
  // JOIN lessons + lesson_participants WHERE student_id = req.user.id
  query
    .innerJoin('lesson_participants', 'lp', 'lp.lesson_id = lesson.id')
    .where('lp.student_id = :studentId', { studentId: req.user.id })
}
if (req.user.role === 'teacher') {
  query.where('lesson.teacher_id = :teacherId', { teacherId: req.user.id })
}
if (req.user.role === 'admin') {
  // видит все
}
```

**Rule 2: юзер может получить только свой профиль**
```ts
GET /users/me -> req.user (из JWT)
GET /users/:id -> 404 (не разрешаем в v1.0)
```

**Rule 3: subscription_status не проверяется в v1.0**
```ts
// subscription_status есть в БД (enum: trial, active, expired),
// но логики авторизации на основе него нет.
// Все залогинившиеся ученики видят свои уроки независимо от подписки.
// Проверка появится в v1.4+ после интеграции Stripe.
```

### 2.4 Auth Flow

```
1. POST /auth/login (email + password)
2. Backend: hash + compare password
3. Если верно: sign accessToken (15m) + refreshToken (7d)
4. Вернуть оба токена
5. Мобильное приложение: сохранить tokens в expo-secure-store
6. На каждый запрос: Authorization: Bearer {accessToken}
7. Если 401: попробовать POST /auth/refresh с refreshToken
8. Если refresh сработал: повторить оригинальный запрос
9. Если refresh 401: очистить tokens, перейти на экран логина
```

### 2.5 Что НЕ делаем в v1.0

- ❌ Эндпоинт для создания пользователя (SignUp) — аккаунты создаёт админ/я вручную
- ❌ Password reset — не нужен в MVP
- ❌ 2FA, OTP — нет
- ❌ Social login — нет
- ❌ Endpoints для bookings, recordings, notifications — оставляем скелеты
- ❌ Google Meet API интеграцию на бэке — ссылка кладёт админ в БД

---

## 3. MOBILE v1.0 ЧАСТЬ

### 3.1 Структура навигации

```
RootNavigator
├── AuthStack (когда не залогинен)
│   └── LoginScreen
│
└── AppTabs (когда залогинен, bottom tab navigation с 3 табами)
    ├── Tab 1: Предстоящие уроки
    │   └── UpcomingLessonsScreen
    │
    ├── Tab 2: Прошедшие уроки
    │   └── PastLessonsScreen
    │
    └── Tab 3: Профиль
        └── ProfileScreen
```

Три равноправных таба в bottom navigation (не вложенные, не подтабы внутри одного экрана).

### 3.2 Экраны

**LoginScreen**
- Input (email)
- Input (password)
- Button "Войти"
- Состояния: idle, loading, error (показ текста ошибки)
- На успех: сохранить tokens в expo-secure-store, перейти в AppTabs
- На ошибку: показать alert или inline text

**UpcomingLessonsScreen** (Tab 1 в AppTabs)
- FlashList уроков
- Карточка: дата (в локальной таймзоне), время, тема, имя учителя
- Состояния:
  - loading: 3 скелета карточек
  - empty: EmptyState "Нет предстоящих уроков"
  - error: ErrorState "Не удалось загрузить уроки" + кнопка "Попробовать"
  - success: список карточек
- Pull-to-refresh (refetch)
- Сортировка: по start_time ASC (ближайшие первыми)
- Pagination: опционально; можно загружать всё одним запросом

**PastLessonsScreen** (Tab 2 в AppTabs)
- FlashList уроков
- Карточка: дата (в локальной таймзоне), время, тема, имя учителя
- Состояния: loading, empty, error, success (аналогично UpcomingLessonsScreen)
- Pull-to-refresh (refetch)
- Сортировка: по start_time DESC (свежие первыми)
- Pagination: опционально; можно загружать всё одним запросом

**ProfileScreen** (Tab 3 в AppTabs)
- Avatar (иллюстрация, не реальное фото)
- Текст: Имя ученика
- Текст: Email
- Текст: Таймзона
- Button "Выйти" (clear tokens, перейти в AuthStack)
- Состояния: loading (skeleton), error (retry button)

### 3.3 UI Компоненты (дизайн-система)

Минимальный набор для v1.0:

```
apps/mobile/src/shared/ui/

1. Screen.tsx
   - SafeAreaView + основной контейнер
   - Padding, background, handles notch

2. Card.tsx
   - Container с радиусом и тенью
   - Padding внутри

3. Button.tsx
   - Основной (solid primary color)
   - Secondary (outline)
   - States: idle, loading, disabled
   - Поддержка icon слева

4. Input.tsx
   - TextInput для email/password
   - Label, error text, placeholder
   - Для password: toggle show/hide

5. Avatar.tsx
   - Иллюстрация или инициалы (для v1.0 просто иконка)

6. TabBar.tsx
   - Bottom navigation с 3 табами (Предстоящие, Прошедшие, Профиль)
   - Active/inactive states

7. Text.tsx
   - Variants: h1, h2, body, caption
   - Colors: primary, secondary, error
   - Используется везде вместо стандартного Text

8. Spinner.tsx
   - Loading indicator (Reanimated анимация)

9. Skeleton.tsx
   - Для loading state
   - Variants: line, rectangle (для карточки)

10. EmptyState.tsx
    - Иллюстрация + заголовок + описание

11. ErrorState.tsx
    - Error icon + сообщение + кнопка retry

12. LessonCard.tsx
    - Специфичный компонент для карточки урока
    - Date, time, title, teacher name
```

### 3.4 State Management

**Zustand store (authStore):**
```ts
{
  user: User | null,
  isAuthenticated: boolean,
  isLoading: boolean,
  error: string | null,
  
  actions: {
    login(email, password),
    logout(),
    setUser(user),
    setError(error),
    refresh(), // для refresh token логики
  }
}
```

**TanStack Query:**
```ts
// Hooks:
useProfileQuery()           // GET /users/me
useUpcomingLessonsQuery()   // GET /lessons?status=upcoming
usePastLessonsQuery()       // GET /lessons?status=past
useRefreshTokenMutation()   // POST /auth/refresh
useLoginMutation()          // POST /auth/login
```

### 3.5 i18n (ru.json)

```json
{
  "auth": {
    "title": "Вход",
    "email": "Email",
    "password": "Пароль",
    "submit": "Войти",
    "errors": {
      "invalid_credentials": "Email или пароль неверны",
      "network_error": "Ошибка подключения",
      "required": "Поле обязательно"
    }
  },
  "profile": {
    "title": "Профиль",
    "email": "Email",
    "timezone": "Таймзона",
    "logout": "Выйти"
  },
  "lessons": {
    "upcoming": "Предстоящие",
    "past": "Прошедшие",
    "empty": "Нет уроков",
    "error": "Не удалось загрузить уроки",
    "retry": "Попробовать",
    "at": "в"
  }
}
```

### 3.6 Что НЕ делаем в v1.0

- ❌ Google Meet ссылки (никаких кнопок "Присоединиться")
- ❌ Домашка
- ❌ Перенос уроков
- ❌ Push-уведомления
- ❌ Экран регистрации (SignUp)
- ❌ Social login, биометрия
- ❌ Оффлайн mode (кроме persistent cache)
- ❌ Search, filters (кроме таба upcoming/past)
- ❌ Чат, комментарии
- ❌ Проверка subscription_status в логике (поле есть в БД, но не используется)
- ❌ Экраны "подписка неактивна", "требуется оплата"
- ❌ Middleware проверки подписки

---

## 4. ПЛАН ПО ДНЯМ ДО TestFlight

**Стартовая дата:** 2026-04-28  
**Целевая дата TestFlight:** 2026-05-14 (16-17 дней с risk management)

### День 1-2: Setup + Database ✅ (уже готово)

- [x] Убрать из кода: Stripe, Supabase упоминания
- [x] Добавить в schema: lesson_participants, lesson.type
- [x] Добавить в User: subscription_status, timezone
- [x] Написать миграцию V1Schema
- [x] Написать seed script (1 учитель, 3 ученика, 10 уроков)
- [x] Запустить локально, проверить БД

### День 3: Auth Backend + GET /users/me

- [ ] Проверить/исправить POST /auth/login
- [ ] Проверить/исправить POST /auth/refresh
- [ ] Реализовать GET /users/me (защищено JWT)
- [ ] Добавить RLS checks в контроллеры
- [ ] Написать unit-тесты для auth service
- [ ] Вручную протестировать в Postman/Insomnia

### День 4-5: Lessons API

- [ ] Реализовать GET /lessons?status=upcoming
- [ ] Реализовать GET /lessons?status=past
- [ ] Фильтрация по student_id (из JWT, JOIN с lesson_participants)
- [ ] Сортировка (upcoming ASC, past DESC)
- [ ] Cursor pagination (опционально; можно загружать всё одним запросом)
- [ ] Написать unit-тесты
- [ ] Вручную протестировать в Postman

### День 6: Risk Management — Backend Part 1

**Sentry интеграция:**
- [ ] Установить @sentry/node
- [ ] Инициализировать Sentry в app.ts с DSN из .env
- [ ] Подключить error handler middleware
- [ ] Ловить unhandled exceptions через process.on('uncaughtException')

**Окружения и .env:**
- [ ] Создать .env.development, .env.staging, .env.production
- [ ] SENTRY_DSN в .env (не в коде)
- [ ] DATABASE_URL, REDIS_URL, API_PORT в .env
- [ ] Проверить .gitignore: .env, .env.* исключены
- [ ] Убедиться что нет хардкоженных secrets в коде

**Healthcheck endpoint:**
- [ ] GET /health — проверяет БД и Redis, возвращает 200 если OK
- [ ] Используется для UptimeRobot мониторинга

**Feedback API:**
- [ ] POST /feedback (защищено JWT)
- [ ] Body: { message: string }
- [ ] Ответ включает: user_id, app_version, OS, device (в мобильном)
- [ ] Бэкенд отправляет в мой Telegram через Telegram bot
- [ ] Используется BullMQ job для асинхронной отправки

### День 7: Risk Management — Mobile Part 1 + Sentry

**Sentry интеграция:**
- [ ] Установить @sentry/react-native
- [ ] Инициализировать Sentry в AppProviders с DSN из .env
- [ ] ErrorBoundary обёрнут в Sentry.ErrorBoundary
- [ ] Ловит crashes и errors

**Окружения:**
- [ ] Создать .env.development, .env.production на мобильном
- [ ] API_URL зависит от окружения
- [ ] Вычитать app version из package.json и app.json
- [ ] Никаких хардкоженных URL или ключей

**Feedback форма:**
- [ ] Кнопка в ProfileScreen: "Сообщить о проблеме"
- [ ] Модальное окно с textarea
- [ ] POST /feedback с { message }
- [ ] Response: "Спасибо, ваше сообщение отправлено"
- [ ] На ошибку: retry кнопка

### День 8: Mobile UI Components

- [ ] Создать все компоненты (Screen, Card, Button, Input, TabBar, etc.)
- [ ] Палитра: cold bluish neutrals + purple brand color (Mark Design System)
- [ ] Light/dark theme variant для каждого компонента
- [ ] Prototyping в RN simulator
- [ ] Typography: шрифты, размеры, weights

### День 9: Mobile Auth Flow

- [ ] LoginScreen (форма, обработка ошибок, сохранение tokens)
- [ ] RootNavigator (AuthStack vs AppTabs)
- [ ] Zustand authStore + persistence
- [ ] Axios interceptor для refresh token на 401
- [ ] Прототестирование на iPhone simulator

### День 10: Profile Screen + Privacy Policy

- [ ] ProfileScreen (отображение профиля, кнопка выхода)
- [ ] TanStack Query hook useProfileQuery
- [ ] Skeleton loading state, error state + retry
- [ ] Кнопка "Сообщить о проблеме" (feedback form)
- [ ] Внизу ссылки: "Условия использования", "Политика конфиденциальности"
- [ ] Модальное окно с MarkdownView загружает политику

### День 11-12: Lessons Screens

- [ ] UpcomingLessonsScreen (FlashList, pull-to-refresh)
- [ ] PastLessonsScreen (отсортировано DESC)
- [ ] LessonCard компонент (React.memo)
- [ ] TanStack Query hooks useUpcomingLessonsQuery, usePastLessonsQuery
- [ ] Дата/время в локальной таймзоне (date-fns)
- [ ] Loading/empty/error states
- [ ] Прототестирование

### День 13: i18n + Terms & Privacy

- [ ] Заполнить ru.json все строки (auth, profile, lessons, feedback)
- [ ] Проверить все экраны на русском
- [ ] Текст Terms of Service + Privacy Policy (или placeholder)
- [ ] Убедиться, что дизайн соответствует (отступы, шрифты, цвета)
- [ ] Тестирование light/dark theme

### День 14: Integration Testing

- [ ] Запустить backend + mobile в Docker Compose
- [ ] Полный flow: логин → профиль → список уроков → выход
- [ ] Проверить все состояния (loading, error, empty)
- [ ] Проверить timezone (создать уроки в разных часовых поясах)
- [ ] Проверить feedback отправку (должна придти в Telegram)
- [ ] Проверить Sentry в случае ошибки на мобильном (выключи интернет, вернёшься — должна отправиться)

### День 15: Privacy & Security Audit

- [ ] Финальная проверка .gitignore (нет .env файлов в git)
- [ ] Grep на console.log с чувствительными данными
- [ ] Проверить нет ли JWT secrets в коде
- [ ] Verify all env vars in .env.example
- [ ] Code review перед финалом

### День 16-17: Bug Fixes + TestFlight

- [ ] Фиксить bugs из интеграционного тестирования
- [ ] Код ревью (simplify, убрать unused imports)
- [ ] Написать CHANGELOG для v1.0
- [ ] Commit и push
- [ ] Собрать iOS archive через EAS Build
- [ ] Загрузить на TestFlight
- [ ] Пригласить тестировщиков (по доверенности может быть ты сам)

---

## 5. RISK MANAGEMENT В v1.0

Следующие пункты **обязательны** для v1.0. Они отличают production-ready приложение от prototype'а.

### 5.1 Sentry интеграция

**Backend:**
- Установить `@sentry/node` и `@sentry/tracing`
- Инициализировать Sentry в начале `app.ts` с DSN из `SENTRY_DSN` env var
- Подключить Sentry error handler middleware после других middleware
- Ловить `process.on('uncaughtException')` и отправлять в Sentry
- Бесплатный тариф: 5000 ошибок/месяц достаточно для v1.0

**Mobile:**
- Установить `@sentry/react-native`
- Инициализировать в `AppProviders.tsx` с тем же Sentry project
- Обернуть приложение в `<Sentry.ErrorBoundary>` + custom ErrorBoundary
- Ловит crashes, unhandled promise rejections, console errors

**Результат:** Все ошибки попадают на sentry.io, видны в dashboard, отправляются уведомления.

### 5.2 Автоматические бэкапы PostgreSQL

**Если managed database (DigitalOcean, AWS RDS):**
- Включить автоматические бэкапы в интерфейсе хостера
- Retention: 14 дней (обычно по умолчанию)
- Не требует кода, просто галочка в настройках

**Если Docker на своём сервере:**
- Добавить cron-задачу: `pg_dump` каждую ночь в 02:00 UTC
- Хранить 7 последних копий локально
- Одну копию еженедельно копировать в S3 (дешёво для архива)
- Документировать в README: как восстановить из бэкапа

**Для v1.0:** Достаточно одной недельной копии в S3 + 7 локальных.

### 5.3 UptimeRobot мониторинг

**Backend endpoint:**
- Добавить `GET /health` (публичный, без JWT)
- Проверяет: БД доступна (простой SELECT 1), Redis работает (простой PING)
- Возвращает 200 если OK, 503 если одна из зависимостей упала
- Response: `{ "status": "ok" }`

**UptimeRobot configuration:**
- Создать free account на uptimerobot.com
- Добавить HTTP check: пингует `GET /health` каждые 5 минут
- Уведомление в Telegram при падении (бесплатно)
- Логирует downtime историю — видна в dashboard

**Результат:** Узнаёшь о падении за 5 минут.

### 5.4 Feedback форма в приложении

**Mobile:**
- Кнопка "Сообщить о проблеме" в ProfileScreen (внизу)
- Открывает modal с textarea + кнопка "Отправить"
- POST `/feedback` с `{ message: string }`
- На успех: тост "Спасибо, ваше сообщение отправлено"
- На ошибку: показать ошибку + retry кнопка

**Backend:**
- POST `/feedback` (защищено JWT)
- Body: `{ message: string }`
- Бэкенд включает в отправку: user_id, timestamp, app_version, OS, device
- BullMQ job отправляет в мой Telegram через Telegram bot (тот же, что для уведомлений в v1.1)

**Результат:** Единственный реальный канал узнать о проблемах в v1.0. Критично для feedback loop.

### 5.5 Разделение окружений (.env management)

**Backend + Mobile:**
- Создать `.env.development`, `.env.staging`, `.env.production`
- По умолчанию используется `.env.development` (git ignored)
- CI/CD использует `.env.staging` или `.env.production` из secrets

**В коде:**
- Все конфиги через env vars, **ничего не хардкожено**
- API_URL (mobile): `https://api.soynativo.local` (dev) vs `https://api.soynativo.com` (prod)
- DATABASE_URL, REDIS_URL, SENTRY_DSN, TELEGRAM_BOT_TOKEN — всё через env
- Validate все env vars при старте (используем Zod)

**В git:**
- `.env`, `.env.*` в `.gitignore`
- Только `.env.example` + комментарии (какие переменные нужны)
- Pull request не содержит .env файлов

### 5.6 Privacy Policy и Terms of Service

**На LoginScreen:**
- Внизу маленький текст: "Войдя в приложение, вы соглашаетесь с [Условиями использования] и [Политикой конфиденциальности]"
- Ссылки открывают модальное окно с MarkdownView

**На ProfileScreen:**
- Кнопка "Условия" и "Политика" (опционально, если место позволит)

**Где взять текст:**
- Используй [termly.io](https://termly.io) (генератор бесплатный для MVP)
- Скачай как Markdown или HTML
- Положи в `apps/mobile/src/assets/legal/terms.md` и `privacy.md`
- Mobile загружает из ассетов при старте

**Результат:** Юридическая защита + соответствие AppStore guidelines.

### 5.7 Privacy в коде

**Проверки перед commit:**
1. `cat .gitignore` — убедиться что `.env*` исключены
2. `git ls-files | grep -E '\.env|secrets|token|key'` — нет секретов в git
3. `grep -r "console\.log.*password\|token\|secret" apps/` — нет чувствительных данных в логах
4. `grep -r "STRIPE\|stripe" apps/ backend/` — убедиться что нет Stripe кода
5. `grep -r "YOUR_KEY\|YOUR_TOKEN\|hardcoded" apps/` — нет placeholder ключей
6. Code review перед push: ищи любые хардкоженные URLs, ключи, пароли

**Результат:** Приложение безопасно, no credentials leak риск.

---

## 6. КРИТЕРИИ ГОТОВНОСТИ v1.0

Приложение готово к TestFlight, когда:

### Backend
- [ ] POST /auth/login работает, возвращает accessToken + refreshToken
- [ ] POST /auth/refresh работает при истечении accessToken
- [ ] GET /users/me возвращает корректный профиль
- [ ] GET /lessons?status=upcoming возвращает только будущие уроки текущего юзера в порядке по возрастанию даты
- [ ] GET /lessons?status=past возвращает только прошедшие уроки в порядке по убыванию даты
- [ ] Cursor pagination работает (nextCursor корректный)
- [ ] Ошибки возвращаются с правильными кодами (INVALID_CREDENTIALS, UNAUTHORIZED, etc.)
- [ ] Все endpoints защищены JWT (ученик не видит чужих уроков)
- [ ] БД инициализируется seed scriptом (автоматически при docker-compose up)

### Mobile
- [ ] LoginScreen: форма отправляет email + password, обрабатывает ошибки
- [ ] Токены сохраняются в expo-secure-store (не AsyncStorage)
- [ ] Переход в AppTabs происходит после логина
- [ ] Axios interceptor: на 401 пытается refresh, повторяет запрос
- [ ] ProfileScreen: отображает имя, email, таймзону, кнопка выхода работает
- [ ] UpcomingLessonsScreen: загружает уроки, показывает skeleton при loading, EmptyState если нет уроков, ErrorState если ошибка
- [ ] Карточки уроков: дата/время отображаются в таймзоне пользователя
- [ ] PastLessonsScreen: то же, но отсортировано по убыванию
- [ ] Pull-to-refresh работает
- [ ] Pagination: при скролле до конца загружается следующая страница
- [ ] Все строки на русском (ru.json)
- [ ] Light/dark theme переключаются (если реализовано)
- [ ] Нет console.log, warning'ов, crash'ей
- [ ] Сборка проходит без ошибок (yarn build)

### QA
- [ ] Полный flow: логин → профиль → предстоящие уроки → прошедшие уроки → выход
- [ ] Работает на iPhone 14 Pro (или симулятор)
- [ ] Работает на Android (или эмулятор)
- [ ] Кэш: если отключить интернет, приложение не крашится (показывает cached данные)
- [ ] Перезагрузка приложения: user остаётся залогиненным (tokens в secure store)
- [ ] Если refresh token истёк, перенаправляет на логин
- [ ] Таймзоны: созданы уроки в UTC, но отображаются в локальной таймзоне юзера
  - Пример: Урок на UTC 18:00 для юзера с таймзоной Бангкок (UTC+7) должен показываться как 01:00 (следующий день)

### Risk Management
- [ ] Sentry интеграция на backend (@sentry/node) — ловит exceptions, SENTRY_DSN в .env
- [ ] Sentry интеграция на mobile (@sentry/react-native) — обёрнут в ErrorBoundary
- [ ] GET /health endpoint на backend — проверяет БД + Redis, возвращает 200/503
- [ ] UptimeRobot configured — пингует health endpoint каждые 5 минут, уведомление в Telegram
- [ ] POST /feedback endpoint на backend (защищено JWT, отправляет в Telegram)
- [ ] Feedback форма в ProfileScreen (textarea + отправка)
- [ ] .env.development, .env.staging, .env.production созданы, .env.example документирован
- [ ] .gitignore содержит .env и .env.* — нет secrets в git
- [ ] Grep проверки: нет console.log с passwords/tokens, нет хардкоженных URLs
- [ ] Privacy Policy и Terms of Service: ссылки на LoginScreen, модальные окна с текстом
- [ ] Все env vars валидируются при старте (Zod validation)
- [ ] Changelog для v1.0 написан и закоммичен

---

## 6. РИСКИ И НЕИЗВЕСТНОЕ

### Архитектурные риски

1. **Миграция с текущей схемы на lesson_participants**
   - Текущий код может иметь другую структуру (groups, bookings)
   - Нужно удалить groups и group_students таблицы
   - Добавить lesson_participants (новая таблица)
   - **Action:** Написать миграцию, убедиться что seed скрипт создаёт правильные связи

2. **Lesson.type поле новое**
   - Добавить enum ('individual', 'group'), default 'individual'
   - **Action:** В миграции добавить поле с правильным значением

### Backend риски

1. **Refresh token логика может быть сломана**
   - Нужно проверить: есть ли refresh token хранилище, черный список, истечение?
   - Текущий код может быть просто стабом

2. **RLS проверки**
   - Я написал SQL выше, но в коде может быть иначе или вообще не быть
   - Нужно проверить auth.guards или middleware

3. **Axios interceptor для refresh**
   - На мобильной нужен логику обработки 401 → refresh → retry
   - Текущий код может этого не иметь

### Mobile риски

1. **UI компоненты — skeleton или нет**
   - Я предполагаю, что их нет или они не готовы
   - Если их много готовых, то день 6 будет короче

2. **TanStack Query persistent cache**
   - Код есть в AppProviders, но может быть неправильно настроен
   - При добавлении нового запроса нужно обновить cache buster

3. **Date formatting в разных таймзонах**
   - date-fns + ru локаль + timezone offset — может быть грабли
   - Нужно прототестировать

4. **Permissions (iOS)**
   - Может понадобиться запрос на доступ к calendar/location для future features
   - Но для v1.0 ничего не нужно

### Deployment риски

1. **EAS Build для iOS**
   - Если это первый раз, может быть долго (setup сертификатов, provisioning profiles)
   - Рекомендую начать за день до deadline

2. **TestFlight review**
   - Apple может отклонить, если приложение не полное (но для beta обычно пропускают)
   - Бывают задержки 2-4 часа

---

## 7. ИДЕИ НА v1.1+

Не трогаем, но документируем для следующей версии:

- Перенос уроков (reschedule) — нужен Bookings модуль или Teacher availability
- Telegram-бот уведомления — нужен BullMQ scheduled jobs + webhook
- Google Meet интеграция — при создании урока генерируется ссылка, студент видит "Присоединиться"
- Push-уведомления — FCM setup + BullMQ notifications service
- Записи уроков — Google Drive API или S3 + presigned URLs

---

## 8. ОБЯЗАТЕЛЬНЫЕ ОТЛОЖЕНИЯ НА v1.1+

Закладываем архитектуру, но активная реализация в v1.1+:

- **Feature flags** — архитектура готова, но логика отсутствует
- **Password reset через magic link** — только базовая аутентификация в v1.0
- **Расширенный мониторинг (APM)** — Sentry покрывает ошибки, но no performance tracking

---

## 9. ИТОГОВЫЕ УТОЧНЕНИЯ

**Дизайн-система:**
- Палитра: cold bluish neutrals + purple brand color (Mark Design System)
- Light/dark themes поддерживаются
- Адаптировать под мобильное, соответствие HIG (iOS) / Material (Android)

**Cursor pagination:**
- В v1.0 избыточна (макс ~100 уроков на ученика)
- Можно загружать всё одним запросом без cursor
- Если проще оставить cursor — оставляй

**Apple Developer Account:**
- Ты начнёшь параллельно оформлять ($99/год)
- Будет активен к дню 14-17

**Bэкапы + UptimeRobot:**
- Зависит от выбора хостинга (managed vs Docker)
- Оба должны быть готовы перед первым production deployment (post v1.0)

---

## 10. СУММА: СУХО И РЕАЛИСТИЧНО

**Database:** 
- lesson_participants many-to-many (вместо groups)
- Lesson.type enum (individual/group, default individual)
- User.timezone (default UTC), User.subscriptionStatus (не используется в v1.0 логике)

**Backend:** 
- 5 эндпоинтов: auth/login, auth/refresh, users/me, lessons (upstream/past)
- 1 healthcheck: GET /health для UptimeRobot
- 1 feedback: POST /feedback (отправляет в Telegram)
- RLS через JOIN с lesson_participants
- Sentry + Pino логирование

**Mobile:** 
- 3 равноправных таба: Предстоящие | Прошедшие | Профиль
- Feedback форма в ProfileScreen
- Privacy Policy + Terms of Service (модальные окна)
- TanStack Query + Zustand + date-fns + i18next
- Sentry ошибки + ErrorBoundary
- Expo-secure-store для токенов, MMKV для cache

**Timeline:** 
- 16-17 дней до TestFlight (был 14, добавили risk management)
- Дни 1-2: Database ✅
- Дни 3-5: Backend API (auth, lessons, healthcheck, feedback)
- Дни 6-7: Risk Management (Sentry, .env, privacy, feedback на backend+mobile)
- Дни 8-13: Mobile (UI, auth, screens, i18n, integrations)
- Дни 14-15: QA + Integration Testing
- Дни 16-17: Bugs + TestFlight

**Риски:** 
- Refresh token могут быть не реализован
- UI компоненты могут быть не готовы
- EAS Build первый раз долгий (1-2 часа на setup)
- Sentry + Telegram bot интеграция новые, может быть грабли с permissions

**Unknowns:** 
- Текущее состояние UI компонентов, refresh token логики
- Точное время на интеграцию Telegram bot для feedback
- EAS Build setup на твоём компьютере

---

**День 1-2 уже готовы. День 3 начинаем с auth backend. Жди статуса.**
