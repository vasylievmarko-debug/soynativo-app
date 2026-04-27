# Code conventions

Правила, которые делают код читаемым человеку и **легко парсимым LLM**. Каждый пункт — оптимизация под одну из двух аудиторий или обеих сразу.

## 1. Naming

- **Файлы:** PascalCase для React-компонентов (`LoginScreen.tsx`); kebab-case или dot-notation для остального (`auth.service.ts`, `user.repository.ts`). Смешивать в одной папке нельзя.
- **Папки:** lowercase, kebab-case (`features/video-call`).
- **Симво́лы:** `PascalCase` для классов/типов/компонентов; `camelCase` для переменных/функций; `SCREAMING_SNAKE` только для рантайм-констант (env keys).
- **Booleans:** префикс `is`/`has`/`can`/`should` (`isAuthenticated`, `hasRecording`).
- **Async-функции, возвращающие массив:** множественное число (`listLessons`, не `getLessons`).
- **Async-функции, возвращающие одно:** глагол + существительное (`findLessonById`, `createBooking`).

## 2. Files

- **Один экспорт верхнего уровня на файл.** Если есть второй — это знак, что один из них надо вынести.
- **Файл = ответственность из 1 фразы.** Если описание занимает «и … и …» — раздели.
- **Имя файла = имя экспорта.** `Button.tsx` экспортирует `Button`. Никаких `index.tsx`-обманок (кроме barrel-файлов).
- **Лимит длины файла — 300 строк.** Не догма, но красный флаг для ревьюера.

## 3. Functions

- **Чистые по умолчанию.** Side-effect выделяй в отдельную функцию с глаголом-командой (`sendNotification`, не `getAndSendNotification`).
- **Не больше 4 параметров.** Если их больше — собери в объект (`createLesson({ title, level, ... })`).
- **Возвращай данные, а не флаги.** Лучше `findUser(): User | null`, чем `findUser(out: User): boolean`.
- **Раннее возвращение.** Никаких `else` после `return`.

## 4. Types

- **Никакого `any`** (есть ESLint-правило). Если нужен escape-hatch — `unknown` + сужение типа.
- **`type` для алиасов и unions, `interface` для object-shape, который может расширяться.** Будь последователен — мы используем `interface` для DTO, `type` для unions и enums.
- **Domain-типы общие** живут в `packages/shared/src/types/`. Не дублируй на бэке и в мобильном.
- **Zod как источник правды для рантайм-валидации.** TS-тип выводи через `z.infer`, не пиши вручную.

## 5. Comments

- **WHY, не WHAT.** «Single-flight refresh: concurrent 401s share one /auth/refresh call» — да. «// gets user» — нет.
- **JSDoc-блок на классе/функции** только если поведение неочевидно. Не пиши JSDoc для `getUserById(id: string): Promise<User>`.
- **TODO с контекстом:** `// TODO(auth): add jti blocklist for revocation` — указан модуль/тема.
- **Никаких блоков-разделителей** (`// =====`). Используй пустые строки.

## 6. Imports

- **Алиасы вместо `../../..`.** Настроены в tsconfig + babel: `@app`, `@features`, `@shared`, `@modules`, `@core`, `@config`, `@integrations`, `@soynativo/shared`, `@soynativo/design-tokens`.
- **Порядок групп:** node built-ins → external → internal aliases → relative. ESLint-плагин enforce'ит автоматически.
- **Барреля только в `shared/ui/`, `modules/X/index.ts` (если экспортируется наружу), и пакетах.** Не плодить `index.ts` в каждой папке.

## 7. Errors

- **Бэк:** бросай типизированные `HttpException` (`NotFoundException`, `ConflictException`...). Никогда не пиши `throw new Error('not found')` в сервисах.
- **Mobile:** используй `ErrorBoundary` для UI-катастроф. Сетевые ошибки обрабатывай в TanStack Query через `onError`.
- **Не глотай ошибки.** `catch { }` — запрещён. Минимум — лог с контекстом.

## 8. Tests

- **Один `describe` на класс/функцию, одно `it` на сценарий.**
- **Имя теста = поведение.** «creates a user when email is unique» — да. «test1» — нет.
- **AAA:** Arrange / Act / Assert разделены пустой строкой.
- **Не мокай то, что владеешь** (свои сервисы) — используй test doubles. Мокай только границу системы (HTTP, БД, время).

## 9. Performance — встроено, не пристёгнуто

Полный playbook — [`docs/PERFORMANCE.md`](docs/PERFORMANCE.md). Бюджет — [`docs/adr/0005-performance-budget.md`](docs/adr/0005-performance-budget.md). Минимум, что обязан помнить каждый автор PR:

- **Все списки на бэке — cursor-based.** OFFSET запрещён.
- **Все API hot-paths имеют индекс.** В PR прилагается `EXPLAIN ANALYZE` или ссылка на существующий индекс.
- **Кэш — на write всегда инвалидируется.** Cache miss лучше silent stale data.
- **Heavy work уходит в BullMQ.** В синхронном пути — только то, без чего ответ не имеет смысла.
- **Списки в mobile — через `<List>` (FlashList).** Item-компоненты — `React.memo` со стабильными колбэками (`useStableCallback`).
- **Картинки — через `<Image>` (expo-image).** Никогда `react-native`'s `Image`.
- **Анимации — Reanimated 3.** Никаких `Animated` из RN.
- **Cold load — `<Skeleton>`, не `<Spinner>`.**
- **Tap навигации — `usePrefetch` на `onPressIn`.**
- **Изменение состояния — оптимистичная мутация** (паттерн в PERFORMANCE.md).

## 10. Git

- **Conventional Commits** (см. `commitlint.config.cjs`):
  - `feat(auth): add refresh token rotation`
  - `fix(lessons): correct timezone in startTime serialization`
  - `refactor(notifications): extract telegram dispatcher`
  - `docs`, `test`, `chore`, `build`, `ci`, `style`, `perf`.
- **Маленькие коммиты.** Один коммит = одно изменение, описуемое одной строкой.
- **PR ≤ 400 строк изменений.** Больше — труднее ревьюить.

---

# Что делает код LLM-friendly

LLM читает код как длинную строку и теряется, когда сигнал тонет в шуме. Правила, которые помогают:

1. **Самодостаточные файлы.** Любой файл, открытый в изоляции, должен быть понятен. Достигается:
   - явные импорты (никаких глобалов),
   - JSDoc-block в начале файла объясняющий назначение в 1–2 строки,
   - один экспорт верхнего уровня.

2. **Семантические имена > комментарии.** LLM (как и люди) читает идентификаторы дословно. `tokenStorage.setPair(access, refresh)` понятно без слов; `s.set(a, r)` — нет.

3. **Стабильная структура каталогов.** LLM запоминает «модуль X лежит в `apps/backend/src/modules/X/`». Если иногда лежит в `lib/`, иногда в `services/` — модель ошибается.

4. **Index-файлы как карта модуля.** Когда LLM нужно понять, что делает `@modules/users`, ей достаточно посмотреть `index.ts` (если он есть) или `README.md` модуля.

5. **README на каждом уровне.** Корневой README → docs/ → apps/<app>/src/README.md → modules/<module>/README.md. Каждый описывает свой уровень и ссылается вниз.

6. **Domain language consistent.** Если в одной части кода `Booking`, в другой `Reservation` — LLM путается. Словарь — в [`GLOSSARY.md`](GLOSSARY.md).

7. **Типы — лучшая документация.** `Promise<UserPublicDto>` говорит LLM больше, чем абзац текста. Поэтому DTO явные, не `any`/`object`.

8. **Малое количество абстракций на старте.** Generic factories, complex inheritance, dynamic decorators — LLM (как и junior dev) тратит на них контекст. Пиши плоско, рефактори, когда паттерн повторился 3 раза.

9. **CHANGELOG для значимых решений** — ADRs в `docs/adr/`. LLM читает их и понимает «почему», а не пытается реверсить из кода.

10. **Errors как код пути, а не строки.** `error.code === 'CONFLICT'` парсится надёжно; `error.message.includes('already')` — нет.
