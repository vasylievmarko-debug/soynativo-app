/**
 * Centralized cache key catalog. Two reasons:
 *
 * 1. Avoid collisions and typos — every key built from one source.
 * 2. Make invalidation explicit — when an entity changes, search the catalog
 *    for keys that include it and bust them in one place.
 *
 * Convention: `<resource>:<id>` or `<resource>:<scope>:<scope-id>`. Versioning
 * (`v1`) lets us roll new shapes without conflicting with cached old shapes.
 */
export const CacheKeys = {
  user: (id: string) => `v1:user:${id}`,
  userByEmail: (email: string) => `v1:user:email:${email.toLowerCase()}`,
  lesson: (id: string) => `v1:lesson:${id}`,
  lessonsUpcoming: (teacherId: string) => `v1:lessons:upcoming:${teacherId}`,
  bookingsByStudent: (studentId: string) => `v1:bookings:student:${studentId}`,
  notificationsUnread: (userId: string) => `v1:notifications:unread:${userId}`,
} as const;

// Default TTLs (seconds). Short enough that staleness windows are tolerable;
// long enough that we get high hit rates. Hot data uses shorter TTLs because
// invalidation is more reliable when writes pass through the cache layer.
export const CacheTTL = {
  short: 30,
  medium: 60 * 5, // 5 min
  long: 60 * 30, // 30 min
} as const;
