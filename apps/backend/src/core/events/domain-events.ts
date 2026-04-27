// Centralized catalog of domain event names. Modules publish/subscribe via
// these constants so renaming or refactoring cannot silently break listeners.

export const DomainEvents = {
  User: {
    Registered: 'user.registered',
    Updated: 'user.updated',
    Deleted: 'user.deleted',
  },
  Lesson: {
    Created: 'lesson.created',
    Rescheduled: 'lesson.rescheduled',
    Cancelled: 'lesson.cancelled',
    Started: 'lesson.started',
    Completed: 'lesson.completed',
  },
  Booking: {
    Created: 'booking.created',
    Confirmed: 'booking.confirmed',
    Cancelled: 'booking.cancelled',
  },
  Recording: {
    Ready: 'recording.ready',
  },
} as const;
