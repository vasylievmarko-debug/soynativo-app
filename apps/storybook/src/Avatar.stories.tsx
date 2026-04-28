import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { View } from 'react-native';
// @ts-ignore
import { Avatar } from '../../mobile/src/shared/ui/atoms/Avatar';

const meta: Meta<typeof Avatar> = {
  title: 'Atoms/Avatar',
  component: Avatar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    initials: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof Avatar>;

export const WithInitials: Story = {
  args: {
    initials: 'МГ',
    size: 'md',
  },
};

export const Small: Story = {
  args: {
    initials: 'ИП',
    size: 'sm',
  },
};

export const Large: Story = {
  args: {
    initials: 'АП',
    size: 'lg',
  },
};

export const AllSizes: Story = {
  render: () => (
    <View style={{ gap: 16, padding: 16, flexDirection: 'row', alignItems: 'center' }}>
      <Avatar initials="МГ" size="sm" />
      <Avatar initials="МГ" size="md" />
      <Avatar initials="МГ" size="lg" />
    </View>
  ),
};
