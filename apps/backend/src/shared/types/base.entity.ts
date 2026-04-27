import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  VersionColumn,
} from 'typeorm';

/**
 * Base class for all domain entities. Provides:
 * - UUID primary keys (avoid leaking sequential IDs)
 * - createdAt / updatedAt for auditing
 * - deletedAt for soft delete (recovery + analytics)
 * - version column for optimistic concurrency control
 */
export abstract class BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deletedAt?: Date | null;

  @VersionColumn()
  version!: number;
}
