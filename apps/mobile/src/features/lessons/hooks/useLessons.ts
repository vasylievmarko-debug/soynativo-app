import { useInfiniteQuery } from '@tanstack/react-query';
import { lessonsApi } from '../api/lessons.api';

export function useLessons(limit = 20) {
  return useInfiniteQuery({
    queryKey: ['lessons', { limit }],
    initialPageParam: 1,
    queryFn: ({ pageParam }) => lessonsApi.list({ page: pageParam as number, limit }),
    getNextPageParam: (last) => (last.page * last.limit < last.total ? last.page + 1 : undefined),
    staleTime: 30_000,
  });
}
