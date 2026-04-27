import { EventEmitter } from 'node:events';
import { injectable } from 'tsyringe';
import { logger } from '@core/logger/logger';

export interface DomainEvent<TPayload = unknown> {
  name: string;
  occurredAt: Date;
  payload: TPayload;
}

export type EventHandler<TPayload = unknown> = (event: DomainEvent<TPayload>) => Promise<void> | void;

/**
 * In-process event bus. Modules publish domain events here and other modules
 * subscribe without coupling to each other. When the system grows we can swap
 * the implementation for a distributed broker (Kafka, RabbitMQ, NATS) without
 * touching call sites — only the bootstrap registration changes.
 */
@injectable()
export class EventBus {
  private readonly emitter = new EventEmitter({ captureRejections: true });

  constructor() {
    this.emitter.setMaxListeners(100);
    this.emitter.on('error', (err) => logger.error({ err }, 'EventBus handler failure'));
  }

  publish<TPayload>(name: string, payload: TPayload): void {
    const event: DomainEvent<TPayload> = { name, occurredAt: new Date(), payload };
    logger.debug({ event: name }, 'domain event published');
    this.emitter.emit(name, event);
  }

  subscribe<TPayload>(name: string, handler: EventHandler<TPayload>): void {
    this.emitter.on(name, async (event: DomainEvent<TPayload>) => {
      try {
        await handler(event);
      } catch (err) {
        logger.error({ err, event: name }, 'Event handler threw');
      }
    });
  }
}
