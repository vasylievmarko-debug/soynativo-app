import { Column, Entity, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@shared/types/base.entity';
import { UserEntity } from '@modules/users/user.entity';
import { LessonEntity } from '@modules/lessons/lesson.entity';
import type { NotificationType } from '@soynativo/shared';

@Entity({ name: 'notifications' })
@Index(['userId', 'createdAt'])
@Index(['isRead'])
export class NotificationEntity extends BaseEntity {
  @Column({ type: 'uuid' })
  userId!: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: UserEntity;

  @Column({ type: 'uuid', nullable: true })
  lessonId?: string | null;

  @ManyToOne(() => LessonEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'lessonId' })
  lesson?: LessonEntity | null;

  @Column({
    type: 'enum',
    enum: ['lesson_created', 'lesson_rescheduled', 'booking_confirmed', 'lesson_starting', 'recording_ready'],
  })
  type!: NotificationType;

  @Column({ type: 'text' })
  content!: string;

  @Column({ type: 'boolean', default: false })
  isRead!: boolean;

  @Column({ type: 'boolean', default: false })
  telegramSent!: boolean;
}
