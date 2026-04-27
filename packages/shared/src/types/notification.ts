export type NotificationType =
  | 'lesson_created'
  | 'lesson_rescheduled'
  | 'booking_confirmed'
  | 'lesson_starting'
  | 'recording_ready';

export interface Notification {
  id: string;
  userId: string;
  lessonId?: string;
  type: NotificationType;
  content: string;
  isRead: boolean;
  telegramSent: boolean;
  createdAt: Date;
}

export interface CreateNotificationInput {
  userId: string;
  lessonId?: string;
  type: NotificationType;
  content: string;
}
