import { Column, Entity, Index, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { BaseEntity } from '@shared/types/base.entity';
import { UserEntity } from '@modules/users/user.entity';
import { LessonEntity } from '@modules/lessons/lesson.entity';
import type { BookingStatus } from '@soynativo/shared';

@Entity({ name: 'bookings' })
@Unique('uq_bookings_lesson_student', ['lessonId', 'studentId'])
@Index(['studentId'])
@Index(['lessonId'])
@Index(['status'])
export class BookingEntity extends BaseEntity {
  @Column({ type: 'uuid' })
  lessonId!: string;

  @ManyToOne(() => LessonEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'lessonId' })
  lesson!: LessonEntity;

  @Column({ type: 'uuid' })
  studentId!: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'studentId' })
  student!: UserEntity;

  @Column({
    type: 'enum',
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending',
  })
  status!: BookingStatus;

  @Column({ type: 'text', nullable: true })
  notes?: string | null;
}
