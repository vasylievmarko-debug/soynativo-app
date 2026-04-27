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
**Целевая дата TestFlight:** 2026-05-12 (2 недели)

### День 1-2: Setup + Database

- [x] Убрать из кода: Stripe, Supabase упоминания, WebSocket-чат
- [ ] Добавить в schema: школы, группы, pivot group_students
- [ ] Добавить в User: subscription_status поле
- [ ] Написать миграцию
- [ ] Написать seed script (1 школа, 1 группа, 1 учитель, 3 ученика, 10 уроков)
- [ ] Запустить локально, проверить БД

### День 3: Auth Backend

- [ ] Проверить/исправить POST /auth/login
- [ ] Проверить/исправить POST /auth/refresh
- [ ] Добавить RLS checks в контроллеры
- [ ] Написать unit-тесты для auth service
- [ ] Вручную протестировать в Postman/Insomnia

### День 4: Lessons API

- [ ] Реализовать GET /lessons?status=upcoming
- [ ] Реализовать GET /lessons?status=past
- [ ] Фильтрация по student_id (из JWT)
- [ ] Сортировка (upcoming ASC, past DESC)
- [ ] Cursor pagination
- [ ] Написать unit-тесты
- [ ] Вручную протестировать в Postman

### День 5: GET /users/me

- [ ] Реализовать GET /users/me
- [ ] Убедиться, что возвращает правильные поля
- [ ] Написать unit-тесты
- [ ] Вручную протестировать

### День 6: Mobile UI Components

- [ ] Создать все компоненты (Screen, Card, Button, Input, TabBar, etc.)
- [ ] Палитра: cold bluish neutrals + purple brand color (Mark Design System)
- [ ] Light/dark theme variant для каждого компонента
- [ ] Prototyping в RN simulator
- [ ] Typography: шрифты, размеры, weights

### День 7: Mobile Auth Flow

- [ ] LoginScreen (форма, обработка ошибок, сохранение tokens)
- [ ] RootNavigator (AuthStack vs AppTabs)
- [ ] Zustand authStore + persistence (если нужно)
- [ ] Axios interceptor для refresh token на 401
- [ ] Прототестирование на iPhone simulator

### День 8: Profile Screen

- [ ] ProfileScreen (отображение профиля, кнопка выхода)
- [ ] TanStack Query hook useProfileQuery
- [ ] Skeleton loading state
- [ ] Error state + retry

### День 9-10: Lessons Screens

- [ ] UpcomingLessonsScreen (FlashList, pagination, pull-to-refresh)
- [ ] PastLessonsScreen
- [ ] LessonCard компонент
- [ ] TanStack Query hooks useUpcomingLessonsQuery, usePastLessonsQuery
- [ ] Дата/время в локальной таймзоне (date-fns)
- [ ] Loading/empty/error states
- [ ] Прототестирование

### День 11: i18n + Polish

- [ ] Заполнить ru.json все строки
- [ ] Проверить все экраны на русском
- [ ] Убедиться, что дизайн соответствует (отступы, шрифты, цвета)
- [ ] Тестирование light/dark theme

### День 12: Integration Testing

- [ ] Запустить backend + mobile в Docker Compose
- [ ] Полный flow: логин → профиль → список уроков → выход
- [ ] Проверить все состояния (loading, error, empty)
- [ ] Проверить timezone (создать уроки в разных часовых поясах)
- [ ] Проверить разные роли (student vs teacher — убедиться, что видят только свои данные)

### День 13-14: Bug Fixes + Archive + TestFlight

- [ ] Фиксить bugs из интеграционного тестирования
- [ ] Код ревью (simplify, убрать unused imports)
- [ ] Написать CHANGELOG для v1.0
- [ ] Commit и push
- [ ] Собрать iOS archive через EAS Build
- [ ] Загрузить на TestFlight
- [ ] Пригласить тестировщиков (по доверенности может быть ты сам)

---

## 5. КРИТЕРИИ ГОТОВНОСТИ v1.0

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

## 8. ИТОГОВЫЕ УТОЧНЕНИЯ

**Дизайн-система:**
- Палитра: cold bluish neutrals + purple brand color
- Light/dark themes
- Адаптировать Mark Design System под мобильное

**Cursor pagination:**
- В v1.0 избыточна (макс ~100 уроков на ученика)
- Можно загружать всё одним запросом без cursor
- Если проще оставить cursor — оставляй

**Apple Developer Account:**
- Ты начнёшь параллельно оформлять ($99/год)
- Будет активен к дню 14

---

## 9. СУММА: СУХО

- **Database:** lesson_participants вместо groups. Lesson.type enum (individual/group, default individual в v1.0). subscription_status есть в User, но не используется в логике.
- **Backend:** 5 эндпоинтов (login, refresh, me, list lessons upcoming/past). RLS через JOIN с lesson_participants. Все ученики видят уроки независимо от подписки.
- **Mobile:** 3 равноправных таба в bottom navigation (Предстоящие, Прошедшие, Профиль). TanStack Query + Zustand. date-fns для таймзон. i18next (ru.json).
- **Timeline:** 14 дней до TestFlight. Дни 1-5: backend (миграция, auth, lessons API). Дни 6-14: mobile (UI, экраны, интеграция, QA).
- **Риски:** текущая схема БД может отличаться, refresh token может быть не реализован, UI компоненты могут быть не готовы. EAS Build setup может затянуться.

---

**Готов начинать день 1. Жду подтверждения.**
