import { inject, injectable } from 'tsyringe';
import type { Redis } from 'ioredis';
import { Tokens } from '@core/di/tokens';

/**
 * Thin wrapper over Redis that JSON-serializes values and exposes a typed
 * `getOrSet` for cache-aside patterns (the common case).
 */
@injectable()
export class CacheService {
  constructor(@inject(Tokens.Redis) private readonly redis: Redis) {}

  async get<T>(key: string): Promise<T | null> {
    const raw = await this.redis.get(key);
    return raw ? (JSON.parse(raw) as T) : null;
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    const payload = JSON.stringify(value);
    if (ttlSeconds) await this.redis.set(key, payload, 'EX', ttlSeconds);
    else await this.redis.set(key, payload);
  }

  async del(key: string | string[]): Promise<void> {
    const keys = Array.isArray(key) ? key : [key];
    if (keys.length) await this.redis.del(...keys);
  }

  async getOrSet<T>(key: string, ttlSeconds: number, loader: () => Promise<T>): Promise<T> {
    const hit = await this.get<T>(key);
    if (hit !== null) return hit;
    const value = await loader();
    await this.set(key, value, ttlSeconds);
    return value;
  }
}
