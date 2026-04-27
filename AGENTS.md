# AGENTS.md — instructions for AI coding agents

Этот файл читают AI-агенты (Claude, Cursor, Copilot Workspace, Aider, …) перед тем, как редактировать код. Если ты — AI-агент, **прочитай его до первого изменения**.

## TL;DR (если нет времени читать всё)

1. Архитектура: модульный монолит на backend (`apps/backend/src/modules/`), feature-sliced на mobile (`apps/mobile/src/features/`). См. [`docs/adr/`](docs/adr/).
2. Стек: TypeScript + Node/Express + TypeORM/Postgres + Redis/BullMQ (backend); React Native/Expo + TanStack Query + Zustand + i18next (mobile).
3. Терминология жёсткая: см. [`GLOSSARY.md`](GLOSSARY.md). Не выдумывай синонимы.
4. Стиль: см. [`CONVENTIONS.md`](CONVENTIONS.md). Эту единицу читать целиком при первом редактировании.
5. Тесты обязательны для бизнес-логики. См. [`apps/backend/test/README.md`](apps/backend/test/README.md).
6. Никаких новых зависимостей без явного разрешения автора PR.

## Файлы, которые надо прочитать перед началом работы

| Задача                        | Минимум для прочтения                                                              |
|-------------------------------|------------------------------------------------------------------------------------|
| Любая правка в backend        | `apps/backend/src/modules/README.md`, `CONVENTIONS.md`, `GLOSSARY.md`              |
| Любая правка в mobile         | `apps/mobile/src/README.md`, `apps/mobile/src/shared/ui/README.md`, `CONVENTIONS.md` |
| Новый модуль или фича         | соответствующий ADR в `docs/adr/`, `GLOSSARY.md`                                   |
| UI-компоненты                 | `apps/mobile/src/shared/ui/README.md`, `packages/design-tokens/README.md`          |
| Изменение API контракта       | `docs/API.md`, существующие `*.controller.ts` в модуле                             |
| Тесты                         | `apps/backend/test/README.md`, `apps/mobile/test/render.tsx`                       |

## Жёсткие правила

✅ **Всегда:**
- Сначала читай `index.ts`/`README.md` модуля, чтобы понять его публичный API.
- Используй существующие токены/компоненты из `@soynativo/design-tokens` и `@shared/ui`.
- Для бэка: бросай `HttpException`, не `new Error()`.
- Для mobile: токены из `useTheme()`, никаких хардкоженных цветов/spacing.
- При изменении API — обнови JSDoc у controller'а (он попадёт в OpenAPI).
- Добавляй тесты к новой бизнес-логике (test doubles, не моки TypeORM).
- Обновляй `GLOSSARY.md`, если вводишь новый доменный термин.

❌ **Никогда:**
- Не используй `any`. Если нужен — `unknown` + type narrowing.
- Не импортируй один feature из другого (`features/X` ↔ `features/Y` запрещено). Общее — в `shared/`.
- Не используй `synchronize: true` в TypeORM. Только миграции.
- Не пиши секреты в код. Только через `env` (валидируется Zod при старте).
- Не сохраняй токены в AsyncStorage / MMKV. Только `expo-secure-store`.
- Не вводи новый стиль/паттерн без обновления `CONVENTIONS.md`.

## Решения

- **Где хранить новый компонент?** Если используется в одной feature — `apps/mobile/src/features/<feature>/components/`. Если в двух+ — `apps/mobile/src/shared/ui/`.
- **Где хранить новый сервис на бэке?** Если у него своя сущность — новый модуль в `apps/backend/src/modules/<name>/`. Если это утилита — `apps/backend/src/shared/`. Если внешняя интеграция — `apps/backend/src/integrations/<name>/`.
- **Когда делать модуль vs функцию?** Модуль — когда есть entity + репозиторий + бизнес-правила. Иначе — функция в `shared/utils/`.

## Tool tips

- Перед коммитом: `yarn lint && yarn type-check && yarn test`.
- Перед PR: `yarn test:integration` (требует поднятого `docker compose up -d postgres redis`).
- Не запускай миграции в коде агента; только через `yarn workspace @soynativo/backend migration:run`.

## Когда запросить уточнение у человека

- Изменение схемы БД с потерей данных.
- Добавление новой внешней зависимости.
- Изменение публичного API (breaking change).
- Введение нового слоя/абстракции.
- Конфликт между двумя ADR (в этом случае — пиши новый ADR с supersede'ом).

## Коммит и PR

- Conventional Commits (см. CONVENTIONS.md §9).
- В PR-описании — что изменилось и **почему**, ссылка на issue/ADR.
- Дополни релевантные README/ADR, если нужно.

---

Если что-то в этом файле противоречит инструкции пользователя в чате — ВЫИГРЫВАЕТ инструкция пользователя. Но сначала упомяни конфликт в ответе, чтобы человек принял осознанное решение.
