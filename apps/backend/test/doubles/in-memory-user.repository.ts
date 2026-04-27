import { randomUUID } from 'node:crypto';
import type { CreateUserData, UserRepository } from '@modules/users/user.repository';
import type { UserEntity } from '@modules/users/user.entity';
import { makeUser } from '../fixtures/user.fixture';

/**
 * In-memory test double for UserRepository. Use in unit tests instead of
 * mocking TypeORM — gives realistic behavior (uniqueness, lookup) without
 * the I/O cost. Implements the full public surface of UserRepository.
 */
export class InMemoryUserRepository implements Pick<
  UserRepository,
  'findById' | 'findByEmail' | 'create' | 'update' | 'softDelete' | 'list'
> {
  private store = new Map<string, UserEntity>();

  async findById(id: string): Promise<UserEntity | null> {
    return this.store.get(id) ?? null;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    for (const u of this.store.values()) {
      if (u.email === email && !u.deletedAt) return u;
    }
    return null;
  }

  async create(data: CreateUserData): Promise<UserEntity> {
    const user = makeUser({ ...data, id: randomUUID() });
    this.store.set(user.id, user);
    return user;
  }

  async update(id: string, patch: Partial<UserEntity>): Promise<UserEntity | null> {
    const existing = this.store.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...patch, updatedAt: new Date() };
    this.store.set(id, updated);
    return updated;
  }

  async softDelete(id: string): Promise<unknown> {
    const u = this.store.get(id);
    if (u) this.store.set(id, { ...u, deletedAt: new Date() });
    return { affected: u ? 1 : 0 };
  }

  async list({ page, limit, role }: { page: number; limit: number; role?: UserEntity['role'] }): Promise<[UserEntity[], number]> {
    const all = [...this.store.values()].filter((u) => !u.deletedAt && (!role || u.role === role));
    return [all.slice((page - 1) * limit, page * limit), all.length];
  }

  // Test-only helpers
  seed(...users: UserEntity[]): void {
    for (const u of users) this.store.set(u.id, u);
  }

  clear(): void {
    this.store.clear();
  }
}
