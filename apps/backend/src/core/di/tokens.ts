// Symbols used by tsyringe for resolving infrastructure dependencies.
// Domain services are registered by class reference; only "interface-like"
// abstractions and primitives need string/symbol tokens.
export const Tokens = {
  // Infrastructure
  DataSource: Symbol('DataSource'),
  Redis: Symbol('Redis'),
  Logger: Symbol('Logger'),
  EventBus: Symbol('EventBus'),

  // Repositories (registered as interfaces so they can be swapped in tests)
  UserRepository: Symbol('UserRepository'),
  LessonRepository: Symbol('LessonRepository'),
  BookingRepository: Symbol('BookingRepository'),
  NotificationRepository: Symbol('NotificationRepository'),

  // Queues
  NotificationsQueue: Symbol('NotificationsQueue'),
  RemindersQueue: Symbol('RemindersQueue'),

  // External integrations
  GoogleMeetClient: Symbol('GoogleMeetClient'),
  TelegramClient: Symbol('TelegramClient'),
} as const;

export type Token = (typeof Tokens)[keyof typeof Tokens];
