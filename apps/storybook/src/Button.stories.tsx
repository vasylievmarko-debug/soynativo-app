import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { View } from 'react-native';
// Импортируем Button из мобильного приложения
// @ts-ignore - react-native-web compatibility
import { Button } from '../../apps/mobile/src/shared/ui/atoms/Button';

/**
 * Button компонент для основных действий.
 *
 * Используется для:
 * - Отправки форм (Login, Feedback)
 * - Подтверждения действий
 * - Вызова основных функций (логин, выход, сохранить)
 *
 * Доступные варианты:
 * - **primary** — основное действие (синий фон)
 * - **secondary** — дополнительное действие (outline)
 * - **ghost** — минималистичный (только текст)
 * - **danger** — деструктивное действие (красный, например удалить)
 *
 * Размеры:
 * - **sm** — маленький (28px высота)
 * - **md** — средний (44px, стандарт)
 * - **lg** — большой (52px)
 */
const meta: Meta<typeof Button> = {
  title: 'Atoms/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Универсальный button компонент для всех типов действий в приложении.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
      description: 'Текст кнопки',
    },
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost', 'danger'],
      description: 'Визуальный стиль кнопки',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Размер кнопки',
    },
    disabled: {
      control: 'boolean',
      description: 'Отключить кнопку',
    },
    loading: {
      control: 'boolean',
      description: 'Показать loading spinner (автоматически отключает кнопку)',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

/**
 * Primary кнопка — основное действие.
 * Используется для главных CTA: Войти, Сохранить, Отправить.
 */
export const Primary: Story = {
  args: {
    label: 'Войти',
    variant: 'primary',
    size: 'md',
  },
};

/**
 * Secondary кнопка — дополнительные действия.
 * Используется для Отмена, Очистить, Вернуться.
 */
export const Secondary: Story = {
  args: {
    label: 'Отмена',
    variant: 'secondary',
    size: 'md',
  },
};

/**
 * Loading состояние.
 * Показывается во время отправки формы или обработки запроса.
 */
export const Loading: Story = {
  args: {
    label: 'Отправляю...',
    variant: 'primary',
    size: 'md',
    loading: true,
  },
};

/**
 * Disabled состояние.
 * Кнопка неактивна, но не показывает loading.
 */
export const Disabled: Story = {
  args: {
    label: 'Недоступно',
    variant: 'primary',
    size: 'md',
    disabled: true,
  },
};

/**
 * Все размеры и варианты вместе.
 */
export const AllVariants: Story = {
  render: () => (
    <View style={{ gap: 16, padding: 16 }}>
      {/* Primary */}
      <View>
        <Button label="Primary SM" variant="primary" size="sm" />
      </View>
      <View>
        <Button label="Primary MD (standard)" variant="primary" size="md" />
      </View>
      <View>
        <Button label="Primary LG" variant="primary" size="lg" />
      </View>

      {/* Secondary */}
      <View style={{ marginTop: 16 }}>
        <Button label="Secondary MD" variant="secondary" size="md" />
      </View>

      {/* Ghost */}
      <View style={{ marginTop: 16 }}>
        <Button label="Ghost MD" variant="ghost" size="md" />
      </View>

      {/* Danger */}
      <View style={{ marginTop: 16 }}>
        <Button label="Danger (Delete)" variant="danger" size="md" />
      </View>

      {/* Loading & Disabled */}
      <View style={{ marginTop: 16 }}>
        <Button label="Loading..." variant="primary" size="md" loading />
      </View>
      <View>
        <Button label="Disabled" variant="primary" size="md" disabled />
      </View>
    </View>
  ),
};
