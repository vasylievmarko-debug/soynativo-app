import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { View } from 'react-native';
// @ts-ignore
import { Card } from '../../apps/mobile/src/shared/ui/molecules/Card';
// @ts-ignore
import { Text } from '../../apps/mobile/src/shared/ui/atoms/Text';
// @ts-ignore
import { Avatar } from '../../apps/mobile/src/shared/ui/atoms/Avatar';

/**
 * Карточка урока — специализированный компонент для отображения информации об уроке.
 *
 * Используется на:
 * - UpcomingLessonsScreen
 * - PastLessonsScreen
 *
 * Содержит:
 * - Дата и время урока (в таймзоне пользователя)
 * - Название урока
 * - Имя учителя с аватаром
 * - Статус (scheduled, completed, cancelled)
 */

interface LessonCardProps {
  title: string;
  teacherName: string;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

function LessonCardComponent({
  title,
  teacherName,
  startTime,
  endTime,
  status,
}: LessonCardProps) {
  const statusColors: Record<string, string> = {
    scheduled: '#4CAF50',
    completed: '#2196F3',
    cancelled: '#f44336',
  };

  return (
    <Card style={{ width: 300, marginVertical: 8 }}>
      <View style={{ gap: 12 }}>
        {/* Time */}
        <View>
          <Text variant="caption" color="muted">
            {startTime} – {endTime}
          </Text>
        </View>

        {/* Title */}
        <Text variant="h3">{title}</Text>

        {/* Teacher */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Avatar initials={teacherName.substring(0, 2)} size="sm" />
          <Text variant="body">{teacherName}</Text>
        </View>

        {/* Status badge */}
        <View
          style={{
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 6,
            backgroundColor: statusColors[status] + '20',
            alignSelf: 'flex-start',
          }}
        >
          <Text variant="caption" style={{ color: statusColors[status] }}>
            {status === 'scheduled' && 'Запланирован'}
            {status === 'completed' && 'Завершён'}
            {status === 'cancelled' && 'Отменён'}
          </Text>
        </View>
      </View>
    </Card>
  );
}

const meta: Meta<typeof LessonCardComponent> = {
  title: 'Components/LessonCard',
  component: LessonCardComponent,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
    teacherName: { control: 'text' },
    startTime: { control: 'text' },
    endTime: { control: 'text' },
    status: { control: 'select', options: ['scheduled', 'completed', 'cancelled'] },
  },
};

export default meta;
type Story = StoryObj<typeof LessonCardComponent>;

export const Scheduled: Story = {
  args: {
    title: 'Present Perfect',
    teacherName: 'María García',
    startTime: '18:00',
    endTime: '19:00',
    status: 'scheduled',
  },
};

export const Completed: Story = {
  args: {
    title: 'Past Simple',
    teacherName: 'José López',
    startTime: '17:00',
    endTime: '18:00',
    status: 'completed',
  },
};

export const Cancelled: Story = {
  args: {
    title: 'Future Tense',
    teacherName: 'Ana Martínez',
    startTime: '19:00',
    endTime: '20:00',
    status: 'cancelled',
  },
};

export const AllStatuses: Story = {
  render: () => (
    <View style={{ gap: 16, padding: 16 }}>
      <LessonCardComponent
        title="Scheduled Lesson"
        teacherName="МГ"
        startTime="18:00"
        endTime="19:00"
        status="scheduled"
      />
      <LessonCardComponent
        title="Completed Lesson"
        teacherName="АП"
        startTime="17:00"
        endTime="18:00"
        status="completed"
      />
      <LessonCardComponent
        title="Cancelled Lesson"
        teacherName="ИВ"
        startTime="19:00"
        endTime="20:00"
        status="cancelled"
      />
    </View>
  ),
};
