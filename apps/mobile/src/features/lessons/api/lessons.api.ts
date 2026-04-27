import { http } from '@shared/api/http';
import type { LessonWithTeacher } from '@soynativo/shared';

interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export const lessonsApi = {
  list: (params: { page?: number; limit?: number } = {}) =>
    http.get<Paginated<LessonWithTeacher>>('/lessons', { params }).then((r) => r.data),
  getById: (id: string) => http.get<{ data: LessonWithTeacher }>(`/lessons/${id}`).then((r) => r.data.data),
};
