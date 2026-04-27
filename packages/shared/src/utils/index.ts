// Common utilities shared across mobile and backend

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

export const formatTime = (date: Date): string => {
  return new Intl.DateTimeFormat('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

export const getLevelLabel = (level: string): string => {
  const labels: Record<string, string> = {
    A1: 'Beginner',
    A2: 'Elementary',
    B1: 'Intermediate',
    B2: 'Upper Intermediate',
    C1: 'Advanced',
    C2: 'Proficiency',
  };
  return labels[level] || level;
};

export const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    scheduled: 'Запланирован',
    in_progress: 'Идёт',
    completed: 'Завершён',
    cancelled: 'Отменён',
    pending: 'В ожидании',
    confirmed: 'Подтвержден',
  };
  return labels[status] || status;
};

export const isPast = (date: Date): boolean => {
  return new Date(date) < new Date();
};

export const isUpcoming = (date: Date, hoursAhead = 24): boolean => {
  const now = new Date();
  const target = new Date(date);
  const hoursDiff = (target.getTime() - now.getTime()) / (1000 * 60 * 60);
  return hoursDiff > 0 && hoursDiff <= hoursAhead;
};
