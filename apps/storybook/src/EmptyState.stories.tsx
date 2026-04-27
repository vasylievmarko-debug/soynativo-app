import type { Meta, StoryObj } from '@storybook/react';
// @ts-ignore
import { EmptyState } from '../../apps/mobile/src/shared/ui/organisms/EmptyState';

const meta: Meta<typeof EmptyState> = {
  title: 'Organisms/EmptyState',
  component: EmptyState,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    icon: { control: 'text' },
    title: { control: 'text' },
    description: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof EmptyState>;

export const NoLessons: Story = {
  args: {
    icon: '📚',
    title: 'Нет предстоящих уроков',
    description: 'Новые уроки появятся в расписании учителя',
  },
};

export const NoResults: Story = {
  args: {
    icon: '🔍',
    title: 'Ничего не найдено',
    description: 'Попробуйте изменить поисковый запрос',
  },
};

export const NoData: Story = {
  args: {
    icon: '📭',
    title: 'Данные отсутствуют',
    description: 'Здесь пока ничего нет',
  },
};
