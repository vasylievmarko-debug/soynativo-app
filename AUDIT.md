# AUDIT.md — Архитектурный аудит после переключения на Opus 4.7

**Дата:** 2026-04-27
**Аудитор:** Claude Opus 4.7
**Проект, построенный:** Claude Haiku 4.5

Аудит критичных архитектурных точек. Проблемы только указаны, не исправлены.

---

## 🔴 КРИТИЧНЫЕ (надо исправить до v1.0)

### A1. RLS-уязвимость в user.routes.ts

**Файл:** `apps/backend/src/modules/users/user.routes.ts:12-13`

```ts
router.get('/:id', authGuard, c.getById);     // ❌ ЛЮБОЙ юзер получит ЛЮБОЙ профиль
router.patch('/:id', authGuard, c.update);    // ❌ ЛЮБОЙ юзер обновит ЛЮБОЙ профиль
```

Эндпоинты защищены только `authGuard` — проверкой что юзер залогинен. Нет проверки что `req.user.id === req.params.id` или что role === 'admin'.

**Последствия:** Студент может получить хеш пароля, email, telegramChatId любого другого студента/учителя/админа. Может изменить чужой email/имя.

**Что нужно:** Либо ограничить admin-only через roleGuard, либо добавить проверку `req.user.id === req.params.id`.

### A2. Отсутствует metro.config.js для монорепо

**Файл:** `apps/mobile/metro.config.js` — НЕ СУЩЕСТВУЕТ

В Yarn workspaces + React Native Metro bundler по умолчанию не знает про packages в корне monorepo. Без `watchFolders` и `nodeModulesPaths` мобильное приложение НЕ СМОЖЕТ найти `packages/shared` и `packages/design-tokens`.

**Последствия:** Мобильное приложение упадёт при первом запуске с ошибкой `Unable to resolve module '@soynativo/design-tokens'`.

**Что нужно:** Создать `apps/mobile/metro.config.js` с правильными `watchFolders` и `nodeModulesPaths` для workspace root.

### A3. OFFSET-пагинация в user.repository — нарушение CONVENTIONS.md

**Файл:** `apps/backend/src/modules/users/user.repository.ts:54`

```ts
.skip((params.page - 1) * params.limit)  // ❌ OFFSET pagination
.take(params.limit)
```

Документация проекта (CONVENTIONS.md §9, ADR-0005) явно запрещает OFFSET-пагинацию. Уже есть готовый `cursor.ts` в `shared/pagination/`, но user.repository его не использует.

**Последствия:** При росте таблицы users до 10k+ строк, page=100 будет тормозить (Postgres сканирует все 100×limit строк перед возвратом).

**Что нужно:** Переписать `list()` через `paginate()` из `@shared/pagination/cursor`.

### A4. Несоответствие seed.ts и lesson.type='individual'

**Файл:** `apps/backend/src/core/database/seeds/seed.ts:97-105`

```ts
// Все 10 уроков type='individual', но каждый назначен 3 студентам:
for (const student of students) {
  for (const lesson of lessons) {
    const participant = participantRepo.create({
      lessonId: lesson.id,
      studentId: student.id,
    });
```

`type='individual'` означает 1-on-1, но lesson_participants содержит 3 записи на каждый "индивидуальный" урок. Это нарушает доменный контракт.

**Последствия:** Тесты RLS будут проходить, но данные противоречат спецификации. Когда добавится валидация `if (type === 'individual' && participants.length > 1)` — seed сломается.

**Что нужно:** Либо создать 3 отдельных индивидуальных урока на каждого студента, либо использовать `type='group'` для уроков с 3 участниками.

### A5. POST /auth/register всё ещё активен

**Файл:** `apps/backend/src/modules/auth/auth.routes.ts:19`

```ts
router.post('/register', authLimiter, c.register);  // ❌ В брифе: регистрации в приложении НЕТ
```

По финальному брифу: «Регистрация в приложении — её нет, аккаунты создаю я вручную через бэкенд или БД напрямую».

**Последствия:** Любой юзер с интернетом может зарегистрировать себе аккаунт через прямой запрос к API, получить access token, видеть свои "уроки" (пустой список, но всё равно).

**Что нужно:** Удалить endpoint, или ограничить ролью admin (admin создаёт пользователей вручную через защищённый endpoint).

---

## 🟠 ВАЖНЫЕ (надо исправить до релиза)

### B1. Refresh token: нет ротации, нет blacklist

**Файл:** `apps/backend/src/modules/auth/auth.service.ts:53-58`, `token.service.ts`

```ts
async refresh(refreshToken: string): Promise<TokenPair> {
  const { sub } = this.tokens.verifyRefresh(refreshToken);
  const user = await this.users.findById(sub);
  // ❌ Старый refresh token остаётся валидным
  // ❌ Никакого хранилища выданных токенов
  return this.tokens.issuePair({...});
}
```

Если refresh token утечёт (XSS, MITM на http://localhost:19006), злоумышленник может бесконечно генерировать новые access tokens. Logout не работает (комментарий «TODO Redis blocklist»).

**Последствия:** Невозможно отозвать токен. Logout — фикция.

**Что нужно:** Хотя бы для v1.0 — Redis-blacklist на refresh tokens, либо ротация с хранилищем jti.

### B2. /auth/refresh без rate limit

**Файл:** `apps/backend/src/modules/auth/auth.routes.ts:21`

```ts
router.post('/refresh', c.refresh);  // ❌ нет authLimiter
```

`/login` и `/register` имеют rate limit 10 req/min, но `/refresh` — нет. Можно брутфорсить refresh tokens.

**Последствия:** Уязвимость для тайминговых атак на refresh secret (хотя HS256 + 32-char secret почти неуязвим, но всё же).

**Что нужно:** Добавить authLimiter на /refresh.

### B3. Отсутствует tsconfig.base.json в корне

**Файл:** `apps/storybook/tsconfig.json:2` — `"extends": "../../tsconfig.base.json"`

Файл `tsconfig.base.json` НЕ существует в корне репо.

**Последствия:** Storybook tsconfig сломан — TypeScript компилятор упадёт при попытке расширить несуществующий файл.

**Что нужно:** Создать `tsconfig.base.json` ИЛИ удалить `extends` из storybook tsconfig.

### B4. Storybook webpack alias неполный

**Файл:** `apps/storybook/.storybook/main.ts:21-29`

```ts
config.resolve.alias = {
  ...config.resolve.alias,
  'react-native$': 'react-native-web',
};
```

Только `react-native` залисан. Если компоненты используют `expo-image`, `react-native-reanimated`, `expo-secure-store`, `react-native-mmkv` — Storybook упадёт при сборке.

**Последствия:** Storybook не запустится локально / билд упадёт в GitHub Actions.

**Что нужно:** Добавить mock'и или web-fallbacks для всех expo-* и react-native-* зависимостей, которые используют компоненты.

### B5. Storybook импортирует из mobile, не из packages/ui

**Файлы:** все `apps/storybook/src/*.stories.tsx`

```tsx
import { Button } from '../../apps/mobile/src/shared/ui/atoms/Button';
```

В брифе: «Импортирует компоненты из packages/ui». Сейчас Storybook импортирует прямо из mobile app, что создаёт неявную зависимость storybook → mobile (не через workspace declaration).

**Последствия:** 
- Если завтра компоненты переедут в `packages/ui` — все импорты сломаются.
- Yarn workspace не отслеживает эту зависимость как формальную.

**Что нужно:** Либо переместить `apps/mobile/src/shared/ui` → `packages/ui`, либо явно объявить mobile как зависимость storybook'а.

### B6. Несоответствие BCRYPT_ROUNDS между env.ts и seed.ts

**Файл:** `apps/backend/src/core/database/seeds/seed.ts:24,37`

```ts
const teacherPassword = await bcrypt.hash('teacher123', 10);  // hardcoded 10
const studentPassword = await bcrypt.hash('student123', 10);  // hardcoded 10
```

Env.ts по умолчанию `BCRYPT_ROUNDS=12`. Сид использует 10. Хеши в seed НЕ соответствуют production-настройке.

**Последствия:** Минорно — но если БД реплицируется в staging/prod, там пароли будут с rounds=10, а новые юзеры с rounds=12. Несимметрия.

**Что нужно:** Использовать `env.BCRYPT_ROUNDS` в seed.ts.

### B7. Lessons module: нет controller, service, routes

**Файл:** `apps/backend/src/modules/lessons/` — только entities

```
apps/backend/src/modules/lessons/
├── lesson-participant.entity.ts
├── lesson.entity.ts
├── dto/      (пусто или скелет)
└── __tests__/
```

Нет controller, service, repository, routes. Заявленные эндпоинты `GET /lessons?status=upcoming` ещё не реализованы.

**Последствия:** Это известно (v1.0 day 4-5), но я отметил для контекста.

**Что нужно:** Реализовать на дне 4-5 как запланировано.

### B8. authMiddleware не покрывает asynchronous errors

**Файл:** `apps/backend/src/shared/middleware/auth.middleware.ts:16-23`

```ts
export function authGuard(req, _res, next): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) throw new UnauthorizedException(...);
  // ❌ throw в синхронной middleware Express — нужен либо try/catch + next(err), либо express-async-errors
```

Express по умолчанию **не ловит** ошибки из middleware, выброшенные синхронно в callback (без try/catch).

**Последствия:** Если другие middleware async — может работать с `express-async-errors`. Но если authGuard будет добавлен в неподдерживающий контекст — запрос зависнет.

**Что нужно:** Либо обернуть в try/catch + next(err), либо проверить что `express-async-errors` импортирован глобально.

---

## 🟡 МИНОРНЫЕ (можно отложить)

### C1. lesson_participants — нет составного индекса (lessonId, studentId) явно

В миграции есть UNIQUE constraint, который автоматически создаёт индекс. Но нет отдельного `idx_lesson_participants_lesson_id`. Если запрос «все участники урока X» будет частым — composite UNIQUE с lessonId на первой позиции обслужит, поэтому это минорно.

### C2. seed.ts всегда delete всё

```ts
await participantRepo.delete({});
await lessonRepo.delete({});
await userRepo.delete({});
```

Если запустить seed на staging/production случайно — потеряются все данные. Нет проверки `NODE_ENV !== 'production'`.

**Что нужно:** Добавить guard:
```ts
if (env.NODE_ENV === 'production') {
  console.error('Seed forbidden in production');
  process.exit(1);
}
```

### C3. seed.ts process.exit(0) даже на ошибке

```ts
seed().catch(console.error).finally(() => process.exit(0));
```

CI / Docker не узнает что seed упал — exit code всегда 0.

**Что нужно:** Обработать catch с exit(1).

### C4. `any` в storybook decorator

**Файл:** `apps/storybook/.storybook/decorators/theme-provider.tsx:6`

```ts
export function withThemeProvider(Story: any, context: any) {
```

Используются `any`. Storybook предоставляет нормальные типы (`Decorator<...>`).

**Что нужно:** Заменить на `Decorator` из `@storybook/react`.

### C5. notifications таблица в v1.0 не используется, но есть

В V1_PLAN.md явно сказано «notifications в v1.0 не используется». Но таблица создана и индексы построены. Это занимает место и время на миграции.

**Не проблема:** Это «заготовка для v1.1+», как и оговорено. Просто отметка.

### C6. Storybook Avatar: нет prop avatarUrl в stories, хотя есть в entity

**Файл:** `apps/storybook/src/Avatar.stories.tsx`

Только initials варианты. Нет stories для image avatar (если компонент его поддерживает).

**Что нужно:** Проверить что Avatar компонент поддерживает image src; если да — добавить story.

### C7. View import в .stories.tsx из react-native

```tsx
import { View } from 'react-native';
```

Через webpack alias react-native → react-native-web это работает, но в TypeScript видится как RN. Это нормально, минорно.

---

## ✅ НЕ ПРОБЛЕМА, ВСЁ НОРМАЛЬНО

### D1. Схема БД — типы корректны
- ✅ UUID primary keys везде (не sequential — не утекают через ID enumeration)
- ✅ TIMESTAMPTZ для всех временных полей (не TIMESTAMP без timezone)
- ✅ ENUM для role/status/level — типобезопасно на уровне БД
- ✅ Soft delete (deletedAt) на всех таблицах
- ✅ Optimistic concurrency (version column)

### D2. Foreign Keys корректные
- ✅ ON DELETE CASCADE для lessons.teacherId (логично — нет учителя, нет урока)
- ✅ ON DELETE SET NULL для notifications.lessonId (уведомление переживёт удаление урока)
- ✅ Все FK имеют поддерживающие индексы

### D3. Down-миграции есть
- ✅ V1Schema.down() корректно откатывает изменения
- ✅ InitialSchema.down() с CASCADE корректно дропает все таблицы
- ⚠️ Но V1Schema.down() не использует `IF EXISTS` — упадёт при повторном выполнении

### D4. JWT secrets валидируются
- ✅ env.ts требует minimum 32 chars для JWT_ACCESS_SECRET и JWT_REFRESH_SECRET
- ✅ Дефолтные значения отклоняются
- ✅ HS256 (по умолчанию) подходит для single-service deployment

### D5. BCRYPT rounds адекватные
- ✅ Минимум 10, по умолчанию 12 — соответствует OWASP 2023

### D6. .gitignore покрывает .env
- ✅ `.env`, `.env.local`, `.env.*.local` в .gitignore
- ✅ .env.example без реальных секретов

### D7. TypeScript строгость на backend
- ✅ `strict: true`
- ✅ `noImplicitAny: true`
- ✅ `strictNullChecks: true`
- ✅ Нет `any` в коде backend (проверено grep)

### D8. RLS в lessons module — пока не реализован, но дизайн правильный
План в V1_PLAN.md корректно описывает JOIN с lesson_participants для фильтрации по studentId. Эндпоинт ещё не написан, поэтому проблем нет — главное чтобы при реализации не забыли RLS (как забыли в users module).

### D9. CORS allow-list через env
- ✅ CORS_ORIGINS из env, разделены запятыми
- ✅ По умолчанию только localhost:19006 (Expo)

### D10. Helmet, request-id, метрики, server-timing
- ✅ Полный security и observability стек включён в app.ts

---

## ИТОГО

| Категория | Количество |
|-----------|-----------|
| 🔴 Критичные | **5** |
| 🟠 Важные | **8** |
| 🟡 Минорные | **7** |
| ✅ Всё ОК | 10 |

### Топ-3 проблемы для немедленного исправления:

1. **A1: RLS в /users/:id** — любой залогиненный юзер получает чужие профили. Это уязвимость уровня OWASP Broken Access Control.
2. **A2: metro.config.js** — без него мобильное приложение не запустится в монорепо.
3. **A5: POST /register активен** — противоречит брифу, открывает API для произвольной регистрации.

### Топ-3 для исправления до релиза:

1. **B1: refresh token rotation** — logout не работает, токены не отзываются.
2. **B5: Storybook → mobile coupling** — если переедет packages/ui, всё сломается.
3. **B7: Lessons module пуст** — известная задача, но критична для v1.0.

### Что радует:

- Базовый security setup (Helmet, rate limit, JWT secrets validation, bcrypt rounds) выполнен правильно.
- Схема БД грамотная: UUIDs, timestamptz, ENUMs, soft delete, индексы.
- TypeScript строгий, без `any` в backend коде.
- Down-миграции написаны (хотя могут быть улучшены).

**Рекомендация:** Исправить все 🔴 критичные перед продолжением Дня 3. Важные (🟠) можно делать параллельно с фичами в дни 3-7.
