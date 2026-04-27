import { Column, Entity, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@shared/types/base.entity';
import { UserEntity } from '@modules/users/user.entity';
import type { LessonLevel, LessonStatus } from '@soynativo/shared';

@Entity({ name: 'lessons' })
@Index(['startTime'])
@Index(['teacherId', 'startTime'])
@Index(['status'])
export class LessonEntity extends BaseEntity {
  @Column({ type: 'uuid' })
  teacherId!: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'teacherId' })
  teacher!: UserEntity;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({ type: 'varchar', length: 50 })
  language!: string;

  @Column({ type: 'enum', enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] })
  level!: LessonLevel;

  @Column({ type: 'timestamptz' })
  startTime!: Date;

  @Column({ type: 'integer' })
  durationMinutes!: number;

  @Column({ type: 'integer', default: 20 })
  maxStudents!: number;

  @Column({
    type: 'enum',
    enum: ['scheduled', 'in_progress', 'completed', 'cancelled'],
    default: 'scheduled',
  })
  status!: LessonStatus;

  @Column({ type: 'varchar', length: 255, nullable: true })
  googleMeetId?: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  recordingUrl?: string | null;
}
