/**
 * Centralized React Query key factory. Two reasons:
 *
 * 1. **Avoid typos.** A misspelled key looks like a different query — silent
 *    cache miss, no error.
 * 2. **Make invalidation surgical.** `queryClient.invalidateQueries({ queryKey: queryKeys.lessons.all })`
 *    busts every nested key under `lessons` because keys are prefix-matched.
 *
 * Convention from TanStack Query docs: nested factories that build arrays.
 */
export const queryKeys = {
  user: {
    all: ['user'] as const,
    me: () => [...queryKeys.user.all, 'me'] as const,
    byId: (id: string) => [...queryKeys.user.all, id] as const,
  },
  lessons: {
    all: ['lessons'] as const,
    list: (params: { limit?: number } = {}) => [...queryKeys.lessons.all, 'list', params] as const,
    byId: (id: string) => [...queryKeys.lessons.all, id] as const,
  },
  bookings: {
    all: ['bookings'] as const,
    mine: () => [...queryKeys.bookings.all, 'mine'] as const,
    byId: (id: string) => [...queryKeys.bookings.all, id] as const,
  },
  notifications: {
    all: ['notifications'] as const,
    unread: () => [...queryKeys.notifications.all, 'unread'] as const,
  },
} as const;
