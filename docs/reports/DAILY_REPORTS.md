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

## 2026-04-29 — iPhone deployment day

**Цель сессии:** Запустить mobile app на физическом iPhone 14 Pro Max. Отправная точка — утренняя сессия закончилась с рабочим backend + Metro на SDK 52 локально, без проверки на устройстве.

**Главный результат:** ✅ Soynativo работает на iPhone 14 Pro Max (iOS 26.3.1) через `expo run:ios --device`. Bundle загружается через Metro по Wi-Fi LAN, backend `:3000` отвечает, login UI отображается, MMKV-cached query state работает.

### Стратегические решения

1. **SDK 53 миграция отложена.** yarn 1 hoisting детерминированно ставит `metro@0.80.x` в hoisted позицию даже после `rm -rf node_modules + yarn install`. SDK 53 требует `metro@0.82+` (для `importLocationsPlugin`), но yarn 1 не даст этому случиться. Решено: остаться на SDK 52, мигрировать на pnpm в отдельном sprint, после pnpm — пройти 53 → 54.

2. **Apple Developer $99/год — НЕ покупаем сейчас.** Используем Personal Team (бесплатный signing через Apple ID) с ограничением 7-day re-signing. Это покрывает локальную разработку и тестирование. EAS Build / TestFlight подключим когда v1.0 будет готов к альфе или когда понадобится shareable build.

3. **Pnpm миграция отложена.** Полная миграция yarn 1 → pnpm + миграция SDK 53/54 оценена в ~3 дня focused work. Не блокирует v1.0 на SDK 52. Запланировано в `TODO_TECHNICAL_DEBT.md` отдельным пунктом.

4. **Bundle identifier изменён** с `com.soynativo.app` на `com.markvasiliev.soynativo`. Старый ID был зарегистрирован глобально на стороне Apple, что мешало free signing. Новый — уникальный под Apple ID Mark, работает с Personal Team. Обновлены `ios.bundleIdentifier` и `android.package` в `app.json`.

5. **`apps/mobile/ios/` закоммичен (bare workflow).** Прежде проект был в "managed" режиме (без `ios/`). Теперь native проект коммитится в репо — signing config (Personal Team) сохраняется между машинами и `expo prebuild` не сотрёт его. `Pods/` и `build/` исключены через `apps/mobile/.gitignore`.

### Сделано (коммиты)

- `aed4acf` — feat(mobile): align bundle identifier for Personal Team signing
- `c24994d` — fix(mobile): RN 0.76 / New Arch dependency fixes (MMKV 2→3 + sync persister)
- `4a8f55d` — chore(mobile): add expo prebuild scripts (yarn android/ios)
- `b89454f` — chore(mobile): gitignore iOS Pods and build artifacts
- `5532e60` — feat(mobile): commit native iOS project for Personal Team signing
- `be45485` — docs: close fixed createSyncStoragePersister TS error

Также от утренней сессии (merge):
- `23d9686` — merge: SDK 50 → 52 migration

### Технические препятствия, преодолённые сегодня (хронологически)

1. **SDK 53 yarn 1 hoisting блок.** Попытка `expo install expo@^53.0.0 --fix` сделала install чисто, но Metro упал с `Cannot find module 'metro/src/ModuleGraph/worker/importLocationsPlugin'`. yarn 1 hoisting детерминированно держит `metro@0.80.x` в корне `node_modules`. → **Откат на SDK 52** через `git reset --hard 10d2fe9`.

2. **Bundle ID `com.soynativo.app` занят глобально.** Personal Team free signing отказался выдать certificate. → Изменён на `com.markvasiliev.soynativo` в Xcode + `app.json` синхронизирован.

3. **iOS Developer Mode выключен.** Build падал с `Device is busy (Waiting to reconnect)`. → Включён в Settings → Privacy & Security → Developer Mode на iPhone, перезагружен.

4. **DDI (Developer Disk Image) не загружен.** Даже с Developer Mode ON, `xcrun devicectl` показывал `connected (no DDI)`. xcodebuild не мог push DDI сам. → Загружен через Xcode → Window → Devices and Simulators (one-time pairing handshake).

5. **`Untrusted Developer`** popup на iPhone после первой установки. → Settings → General → VPN & Device Management → Trust "Apple Development: ...".

6. **MMKV 2.11.0 крашился на New Arch.** RN 0.76 + Turbo Modules — старая 2.x не поддерживает. → Upgrade на `react-native-mmkv@3.3.3` (без `nitro-modules` зависимости — её требует только 4.x).

7. **`createSyncStoragePersister` undefined в runtime.** Pre-existing bug: `AppProviders.tsx` импортировал `createSyncStoragePersister` из `@tanstack/query-async-storage-persister`, но в этом пакете есть только `createAsyncStoragePersister`. Решение: установлен правильный пакет `@tanstack/query-sync-storage-persister@5.100.6`, в `AppProviders.tsx` исправлен import path, удалён неиспользуемый async-storage-persister.

### Открытые вопросы / 7-day reminder

- **Personal Team signing истечёт ~2026-05-06.** Через неделю нужно будет: подключить iPhone по USB, разблокировать, выполнить `npx expo run:ios --device "iPhone mark"` (или открыть workspace в Xcode и нажать Run) — Xcode переподпишет. Без этого приложение перестанет запускаться на iPhone.
- **`i18next::pluralResolver` warning** в Hermes (нет полного `Intl.PluralRules`). Не блокирует приложение, fallback на compatibilityJSON v3. Чинить потом — добавить polyfill или использовать `compatibilityJSON: 'v3'` в i18next config.
- **TS error `toHaveTextContent`** в `Button.test.tsx` — по-прежнему открыт. Низкий приоритет (только в тесте, не runtime).

### Что дальше (вне scope сегодня)

**Бизнес-логика:**
- Homework module (домашние задания учеников)
- Чёткое разделение ролей Student / Teacher (текущий UI одинаковый для обоих)
- BookingsScreen логика (сейчас placeholder)

**Risk Management минимум для v1.0:**
- Sentry интеграция (backend + mobile)
- `/health` endpoint
- Feedback flow через Telegram
- Privacy Policy / ToS экраны

**Инфраструктура (отдельные sprint'ы):**
- Pnpm миграция (~1-2 дня)
- SDK 53 → 54 после pnpm (~2-4 часа)
- Google Meet / Telegram bot — v1.1+

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
