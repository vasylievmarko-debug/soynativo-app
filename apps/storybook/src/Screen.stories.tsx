import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
// @ts-ignore
import { Screen } from '../../apps/mobile/src/shared/ui/atoms/Screen';
// @ts-ignore
import { Text } from '../../apps/mobile/src/shared/ui/atoms/Text';

const meta: Meta<typeof Screen> = {
  title: 'Atoms/Screen',
  component: Screen,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Screen>;

export const Default: Story = {
  render: () => (
    <Screen>
      <Text variant="h1">Экран</Text>
      <Text variant="body">Основное содержимое с безопасным отступом</Text>
    </Screen>
  ),
};

export const WithBackground: Story = {
  render: () => (
    <Screen style={{ backgroundColor: '#f0f0f0' }}>
      <Text variant="h2">Кастомный фон</Text>
    </Screen>
  ),
};
