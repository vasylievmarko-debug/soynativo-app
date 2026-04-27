import { Column, Entity, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@shared/types/base.entity';
import { LessonEntity } from './lesson.entity';
import { UserEntity } from '@modules/users/user.entity';

@Entity({ name: 'lesson_participants' })
@Index(['studentId'])
@Index(['lessonId', 'studentId'], { unique: true })
export class LessonParticipantEntity extends BaseEntity {
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
}
