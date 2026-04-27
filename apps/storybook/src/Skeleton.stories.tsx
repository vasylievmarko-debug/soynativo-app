import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { View } from 'react-native';
// @ts-ignore
import { Skeleton } from '../../apps/mobile/src/shared/ui/atoms/Skeleton';

const meta: Meta<typeof Skeleton> = {
  title: 'Atoms/Skeleton',
  component: Skeleton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['line', 'circle', 'rect'] },
    width: { control: 'number' },
    height: { control: 'number' },
  },
};

export default meta;
type Story = StoryObj<typeof Skeleton>;

export const Line: Story = {
  args: {
    variant: 'line',
    width: 300,
    height: 16,
  },
};

export const Circle: Story = {
  args: {
    variant: 'circle',
    width: 48,
    height: 48,
  },
};

export const Rect: Story = {
  args: {
    variant: 'rect',
    width: 300,
    height: 150,
  },
};

export const LoadingCard: Story = {
  render: () => (
    <View style={{ gap: 12, padding: 16, width: 300 }}>
      <Skeleton variant="circle" width={48} height={48} />
      <Skeleton variant="line" width="100%" height={16} />
      <Skeleton variant="line" width="80%" height={12} />
      <View style={{ marginTop: 8 }}>
        <Skeleton variant="rect" width="100%" height={100} />
      </View>
    </View>
  ),
};
