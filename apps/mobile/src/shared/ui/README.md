# UI library — atomic design

Layered like atomic design (Brad Frost):

```
shared/ui/
├── theme/         # ThemeProvider + semantic theme (consumes design-tokens)
├── atoms/         # Text, Button, Input, Avatar, Spinner, Stack, Screen
├── molecules/     # FormField, Card, Badge, ListItem
├── organisms/     # EmptyState, ErrorBoundary
└── catalog/       # UICatalogScreen — live gallery for designer review
```

## Правила

- **Никогда не используй цвет/spacing/typography строкой.** Только через `useTheme()` или токены из `@soynativo/design-tokens`.
- **Direction атомов:** atoms ← molecules ← organisms. Атом не знает про молекулу.
- **Один компонент — один файл** в kebab-case (`form-field.tsx`) или PascalCase (`FormField.tsx`) — пакет требует консистентности; мы выбрали PascalCase.
- **Public API** — через `index.ts` (barrel). Никогда не импортируй из внутренних путей `shared/ui/atoms/Button.tsx` снаружи `shared/ui/`.

## Accessibility

Каждый интерактивный компонент должен:
- иметь `accessibilityRole` (`button`, `link`, `header`, `summary`);
- иметь читаемое `accessibilityLabel` (если содержимое нетекстовое);
- отдавать `accessibilityState` (`disabled`, `busy`, `selected`, `checked`).

Пример: `<Button>` уже выставляет `accessibilityRole="button"` и `accessibilityState={{ disabled, busy }}`.

## UI Catalog

`UICatalogScreen` — это страница со всеми компонентами и их состояниями.
- Дизайнер сравнивает с Figma и валидирует.
- Разработчик заглядывает перед тем, как писать новый компонент.
- Регресс через RNTL: каждый компонент имеет тест в `__tests__/`.

В будущем можно подключить настоящий Storybook (`@storybook/react-native`), но он тяжёлый — пока catalog-экран покрывает 80% пользы.

## Когда добавлять новый компонент

1. **Атом:** примитив без бизнес-смысла (`Toggle`, `Slider`).
2. **Молекула:** комбинация атомов с одной зоной ответственности (`SearchBar`, `RatingStars`).
3. **Организм:** сложный блок (`LessonCard`, `BookingForm`) — но если он используется только в одной feature, помести его в `features/X/components/`, а не в `shared/ui/`.

Правило большого пальца: **поднимай в `shared/ui/` только когда это нужно второй feature**.
