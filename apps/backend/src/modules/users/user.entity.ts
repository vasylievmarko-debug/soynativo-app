import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '@shared/types/base.entity';
import type { UserRole, UserStatus } from '@soynativo/shared';

@Entity({ name: 'users' })
@Index(['email'], { unique: true, where: '"deletedAt" IS NULL' })
export class UserEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  email!: string;

  @Column({ type: 'varchar', length: 255, select: false })
  passwordHash!: string;

  @Column({ type: 'varchar', length: 100 })
  firstName!: string;

  @Column({ type: 'varchar', length: 100 })
  lastName!: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  avatarUrl?: string | null;

  @Column({ type: 'enum', enum: ['student', 'teacher', 'admin'], default: 'student' })
  role!: UserRole;

  @Column({ type: 'enum', enum: ['active', 'inactive', 'suspended'], default: 'active' })
  status!: UserStatus;

  @Column({ type: 'varchar', length: 255, nullable: true })
  telegramChatId?: string | null;

  @Column({ type: 'boolean', default: true })
  notificationsEnabled!: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  lastLoginAt?: Date | null;
}
