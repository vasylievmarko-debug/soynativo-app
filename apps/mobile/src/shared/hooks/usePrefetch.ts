import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

/**
 * Returns a fire-and-forget prefetch function. Use on tap/long-press of a
 * navigable item — by the time the screen mounts, data is in cache and
 * renders instantly.
 *
 *   const prefetch = usePrefetch();
 *
 *   <ListItem
 *     onPressIn={() => prefetch(queryKeys.lessons.byId(lesson.id), () => fetchLesson(lesson.id))}
 *     onPress={() => navigation.navigate('LessonDetails', { id: lesson.id })}
 *   />
 */
export function usePrefetch() {
  const qc = useQueryClient();
  return useCallback(
    <T,>(queryKey: readonly unknown[], queryFn: () => Promise<T>, staleTimeMs = 30_000) => {
      void qc.prefetchQuery({ queryKey, queryFn, staleTime: staleTimeMs });
    },
    [qc]
  );
}
