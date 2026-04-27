import { randomUUID } from 'node:crypto';
import type { UserEntity } from '@modules/users/user.entity';

let counter = 0;

/**
 * Build a UserEntity-shaped object with sensible defaults. Override only the
 * fields the test cares about so it stays focused and resilient to schema
 * changes.
 *
 *   const u = makeUser({ role: 'teacher' });
 */
export function makeUser(overrides: Partial<UserEntity> = {}): UserEntity {
  const id = overrides.id ?? randomUUID();
  counter += 1;
  return {
    id,
    email: overrides.email ?? `user${counter}@test.local`,
    passwordHash: overrides.passwordHash ?? '$2a$10$abcdefghijklmnopqrstuv',
    firstName: overrides.firstName ?? 'Test',
    lastName: overrides.lastName ?? `User${counter}`,
    avatarUrl: overrides.avatarUrl ?? null,
    role: overrides.role ?? 'student',
    status: overrides.status ?? 'active',
    telegramChatId: overrides.telegramChatId ?? null,
    notificationsEnabled: overrides.notificationsEnabled ?? true,
    lastLoginAt: overrides.lastLoginAt ?? null,
    createdAt: overrides.createdAt ?? new Date(),
    updatedAt: overrides.updatedAt ?? new Date(),
    deletedAt: overrides.deletedAt ?? null,
    version: overrides.version ?? 1,
  } as UserEntity;
}
