# Soynativo Storybook

Витрина дизайн-системы компонентов мобильного приложения. Использует `react-native-web` для отображения компонентов в браузере.

## Запуск локально

```bash
# Установить зависимости
yarn install

# Запустить Storybook
yarn workspace @soynativo/storybook storybook

# Storybook откроется на http://localhost:6006
```

## Сборка для продакшена

```bash
yarn workspace @soynativo/storybook build-storybook

# Результат: `storybook-static/` директория, готовая к деплою
```

## Структура

```
apps/storybook/
├── .storybook/
│   ├── main.ts       # Конфигурация Storybook
│   └── preview.ts    # Глобальные стили и viewport presets
├── src/
│   ├── Button.stories.tsx
│   ├── Input.stories.tsx
│   ├── Card.stories.tsx
│   └── ...
└── package.json
```

## Компоненты в витрине

Все компоненты импортируются из `apps/mobile/src/shared/ui`. Изменения в мобильном приложении автоматически отражаются в Storybook.

**Атомы:**
- Button (primary, secondary, ghost, danger; sm, md, lg)
- Input (empty, filled, error, password)
- Text (h1, h2, body, caption; color variants)
- Avatar
- Screen
- Card
- Spinner
- Skeleton

**Молекулы:**
- FormField
- ListItem
- Badge

**Организмы:**
- EmptyState
- ErrorState
- ErrorBoundary

**Специализированные:**
- LessonCard (разные статусы, темы)
- List / TabBar

## Темы

Переключение между light/dark темами доступно в Storybook UI (иконка луны/солнца в toolbar).

## Деплой на Vercel

1. Подключить репозиторий к Vercel
2. В Build Settings:
   - Framework: Custom
   - Build Command: `yarn workspace @soynativo/storybook build-storybook`
   - Output Directory: `apps/storybook/storybook-static`
3. Deploy

## Deплой на Netlify

1. Подключить репозиторий
2. В Build Settings:
   - Build command: `yarn workspace @soynativo/storybook build-storybook`
   - Publish directory: `apps/storybook/storybook-static`
3. Deploy

## CI/CD

GitHub Actions автоматически собирает Storybook при пуше. Deploy на Vercel/Netlify также автоматический.

## Разработка новой story

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../../apps/mobile/src/shared/ui/atoms/Button';

const meta: Meta<typeof Button> = {
  title: 'Atoms/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    variant: { control: 'select', options: ['primary', 'secondary'] },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: { label: 'Click me', variant: 'primary' },
};
```

## Решение проблем

**Q: React Native Web несовместима с Reanimated 3?**  
A: Реанимированные компоненты должны иметь fallback для web. Обычно это просто скрывает анимацию, но функционал работает.

**Q: Как использовать темы из `useTheme()` в story?**  
A: Обернуть компонент в `ThemeProvider` или использовать Storybook's theme addon (WIP).

**Q: Картинки не загружаются?**  
A: Убедись что путь к assets корректен. Может понадобиться публичная директория.
