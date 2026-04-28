import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { View } from 'react-native';
// @ts-ignore
import { Text } from '../../mobile/src/shared/ui/atoms/Text';

const meta: Meta<typeof Text> = {
  title: 'Atoms/Text',
  component: Text,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['h1', 'h2', 'h3', 'body', 'caption', 'label'],
    },
    color: {
      control: 'select',
      options: ['default', 'muted', 'success', 'error'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Text>;

export const H1: Story = {
  args: {
    children: 'Заголовок 1',
    variant: 'h1',
  },
};

export const H2: Story = {
  args: {
    children: 'Заголовок 2',
    variant: 'h2',
  },
};

export const H3: Story = {
  args: {
    children: 'Заголовок 3',
    variant: 'h3',
  },
};

export const Body: Story = {
  args: {
    children: 'Обычный текст body',
    variant: 'body',
  },
};

export const Caption: Story = {
  args: {
    children: 'Маленький текст caption',
    variant: 'caption',
  },
};

export const Label: Story = {
  args: {
    children: 'Метка',
    variant: 'label',
  },
};

export const AllVariants: Story = {
  render: () => (
    <View style={{ gap: 12, padding: 16 }}>
      <Text variant="h1">H1: Заголовок уровня 1</Text>
      <Text variant="h2">H2: Заголовок уровня 2</Text>
      <Text variant="h3">H3: Заголовок уровня 3</Text>
      <Text variant="body">Body: Основной текст</Text>
      <Text variant="caption">Caption: Маленький текст</Text>
      <Text variant="label">Label: Метка</Text>
    </View>
  ),
};

export const Colors: Story = {
  render: () => (
    <View style={{ gap: 12, padding: 16 }}>
      <Text variant="body">Default text</Text>
      <Text variant="body" color="muted">
        Muted text
      </Text>
      <Text variant="body" color="success">
        Success text
      </Text>
      <Text variant="body" color="error">
        Error text
      </Text>
    </View>
  ),
};
