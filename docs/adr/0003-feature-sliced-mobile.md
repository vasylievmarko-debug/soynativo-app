# ADR-0003: Feature-sliced architecture для мобильного приложения

**Status:** Accepted
**Date:** 2026-04-27

## Context

В кроссплатформенном приложении нужно поддерживать рост (новые features: payments, chat, gamification, marketplace), переиспользование UI и низкий cognitive load для нового разработчика.

## Decision

Используем **feature-sliced layout**:

```
src/
├── app/         # bootstrap, navigation, providers
├── features/    # вертикальные слайсы (auth, lessons, bookings, ...)
└── shared/      # инфраструктура (api, ui kit, theme, i18n)
```

**Правила импортов** (enforce'им через ESLint в будущем):
- `app/` → `features/`, `shared/` ✅
- `features/X` → `shared/` ✅
- `features/X` → `features/Y` ❌ (нарушение — выноси общее в `shared/`)
- `shared/` → ничего ❌

UI разделён на atoms/molecules/organisms внутри `shared/ui/` (atomic design).

## Consequences

**Плюсы:**
- Новые features добавляются без касания существующего кода.
- Удалить feature = удалить одну папку.
- Granular code-splitting в будущем (на iOS/Android можно lazy-load экранов).

**Минусы:**
- Соблазн дублировать код вместо выноса в `shared/`.
- На очень мелких feature'ах структура из 5 подпапок выглядит избыточно (это ОК — единообразие важнее).

## State management

- **TanStack Query** — серверное состояние (источник правды — бэкенд).
- **Zustand** — клиентское состояние, нужное нескольким экранам (auth, theme).
- **useState** — локальное состояние компонента.

Не используем Redux: для нашего scope он избыточен.
