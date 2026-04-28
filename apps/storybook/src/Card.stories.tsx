import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { View } from 'react-native';
// @ts-ignore
import { Card } from '../../mobile/src/shared/ui/molecules/Card';
// @ts-ignore
import { Text } from '../../mobile/src/shared/ui/atoms/Text';

const meta: Meta<typeof Card> = {
  title: 'Molecules/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    elevation: { control: 'select', options: ['sm', 'md', 'lg'] },
    padded: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  render: (args) => (
    <Card {...args} style={{ width: 300 }}>
      <Text variant="body">Содержимое карточки</Text>
    </Card>
  ),
  args: {
    elevation: 'md',
    padded: true,
  },
};

export const WithElevation: Story = {
  render: () => (
    <View style={{ gap: 16 }}>
      <Card elevation="sm" style={{ width: 300 }}>
        <Text variant="body">Elevation: sm</Text>
      </Card>
      <Card elevation="md" style={{ width: 300 }}>
        <Text variant="body">Elevation: md</Text>
      </Card>
      <Card elevation="lg" style={{ width: 300 }}>
        <Text variant="body">Elevation: lg</Text>
      </Card>
    </View>
  ),
};

export const Unpaded: Story = {
  render: (args) => (
    <Card {...args} style={{ width: 300, height: 150 }}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text variant="body">No padding</Text>
      </View>
    </Card>
  ),
  args: {
    padded: false,
  },
};
