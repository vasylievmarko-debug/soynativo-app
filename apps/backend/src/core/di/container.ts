import 'reflect-metadata';
import { container } from 'tsyringe';
import { Tokens } from './tokens';
import { logger } from '@core/logger/logger';
import { EventBus } from '@core/events/event-bus';

/**
 * Wire infrastructure singletons into the DI container.
 *
 * Domain modules register themselves via @injectable() decorators on their
 * classes; this function only handles cross-cutting infrastructure that is
 * shared across modules (logger, event bus, data source, redis, queues...).
 *
 * The DataSource and Redis client are registered lazily by `bootstrap()` once
 * connections are open, so callers can resolve them anywhere in the app.
 */
export function registerCoreServices(): void {
  container.registerInstance(Tokens.Logger, logger);
  container.registerSingleton(Tokens.EventBus, EventBus);
}

export { container };
