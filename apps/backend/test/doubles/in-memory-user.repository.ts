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

  async list({
    cursor,
    limit,
    role,
  }: {
    cursor?: string;
    limit: number;
    role?: UserEntity['role'];
  }): Promise<{ items: UserEntity[]; nextCursor: string | null }> {
    const all = [...this.store.values()]
      .filter((u) => !u.deletedAt && (!role || u.role === role))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    let startIdx = 0;
    if (cursor) {
      try {
        const decoded = JSON.parse(Buffer.from(cursor, 'base64url').toString('utf8'));
        const idx = all.findIndex((u) => u.id === decoded.id);
        if (idx >= 0) startIdx = idx + 1;
      } catch {
        /* ignore invalid cursor */
      }
    }

    const slice = all.slice(startIdx, startIdx + limit);
    const hasMore = startIdx + limit < all.length;
    const last = slice[slice.length - 1];
    const nextCursor =
      hasMore && last
        ? Buffer.from(
            JSON.stringify({ v: last.createdAt.toISOString(), id: last.id })
          ).toString('base64url')
        : null;

    return { items: slice, nextCursor };
  }

  // Test-only helpers
  seed(...users: UserEntity[]): void {
    for (const u of users) this.store.set(u.id, u);
  }

  clear(): void {
    this.store.clear();
  }
}
