# Mobile architecture

Структура — feature-sliced. Бизнес-функции живут в `features/`, всё переиспользуемое — в `shared/`, точка входа и навигация — в `app/`.

```
src/
├── app/                    # Bootstrapping и навигация верхнего уровня
│   ├── App.tsx
│   ├── providers/          # QueryProvider, ThemeProvider, i18n init
│   └── navigation/         # Root / Auth / App навигаторы
├── features/               # Бизнес-функции (вертикальные слайсы)
│   ├── auth/
│   │   ├── api/            # http-вызовы (без UI)
│   │   ├── components/     # компоненты, специфичные для feature
│   │   ├── hooks/          # React Query хуки
│   │   ├── screens/        # экраны feature
│   │   └── store/          # локальный state, если нужен
│   ├── lessons/
│   ├── bookings/
│   ├── profile/
│   └── video-call/         # Google Meet интеграция
└── shared/                 # Общая инфраструктура
    ├── api/                # axios + token-storage + interceptors
    ├── ui/
    │   ├── atoms/          # Button, Text, Screen (presentational, без бизнеса)
    │   ├── molecules/      # composite-компоненты
    │   ├── organisms/      # сложные блоки
    │   └── theme/          # tokens + ThemeProvider
    ├── i18n/               # i18next + ru/en/es
    ├── store/              # глобальные stores (auth)
    ├── hooks/
    ├── utils/
    └── config/             # env
```

## Правила импортов

Чтобы избежать спагетти и сохранить «включаемость» feature'ов:

- `app/` импортирует из `features/` и `shared/`.
- `features/X` импортирует из `shared/`, **не** из `features/Y`. Если две функции делят что-то — выноси в `shared/`.
- `shared/` ничего не знает о features.

Это даёт нам возможность добавлять новые features (например `payments/`, `chat/`) без касания существующих.

## State management

- **TanStack Query** — серверное состояние (списки уроков, бронирования). Кэш, retry, инвалидация.
- **Zustand** — клиентское состояние, которое нужно нескольким экранам (auth, theme override).
- **Локальное `useState`** — для всего остального.

## Навигация

`RootNavigator` переключает между `AuthNavigator` и `AppTabs` в зависимости от `isAuthenticated`. Hydration происходит при старте — пока флаг ещё не загружен, рендерится spinner.

## i18n

Языки переключаются через `i18n.changeLanguage()`. Все строки — через `t('namespace.key')`, никаких хардкодов в JSX.

## Theme

Цвета/spacing/typography только через `useTheme()` (см. `shared/ui/theme/ThemeProvider.tsx`). Это позволит позже добавить темизацию для школы (брендовые цвета).
