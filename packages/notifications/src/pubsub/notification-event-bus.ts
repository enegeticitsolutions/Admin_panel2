import { EventEmitter } from 'events';

export type NotificationEventHandler<T = any> = (payload: T) => Promise<void> | void;

export interface INotificationEventBus {
  publish<T = any>(eventName: string, payload: T): Promise<void>;
  subscribe<T = any>(eventName: string, handler: NotificationEventHandler<T>): void;
  unsubscribe<T = any>(eventName: string, handler: NotificationEventHandler<T>): void;
}

/**
 * Modular In-Memory Event Bus for Notifications.
 * Designed with standard Pub/Sub semantics so it can be swapped with Redis Pub/Sub,
 * AWS SQS/SNS, Kafka, or RabbitMQ as the platform scales.
 */
export class NotificationEventBus implements INotificationEventBus {
  private static instance: NotificationEventBus;
  private emitter: EventEmitter;

  private constructor() {
    this.emitter = new EventEmitter();
    this.emitter.setMaxListeners(50); // support multiple channel subscribers per event
  }

  public static getInstance(): NotificationEventBus {
    if (!NotificationEventBus.instance) {
      NotificationEventBus.instance = new NotificationEventBus();
    }
    return NotificationEventBus.instance;
  }

  public async publish<T = any>(eventName: string, payload: T): Promise<void> {
    console.log(`[NotificationPubSub] 📢 Event Published: "${eventName}"`, payload);
    this.emitter.emit(eventName, payload);
  }

  public subscribe<T = any>(eventName: string, handler: NotificationEventHandler<T>): void {
    this.emitter.on(eventName, async (payload: T) => {
      try {
        await handler(payload);
      } catch (err: any) {
        console.error(`[NotificationPubSub] Error in subscriber for "${eventName}":`, err.message || err);
      }
    });
  }

  public unsubscribe<T = any>(eventName: string, handler: NotificationEventHandler<T>): void {
    this.emitter.off(eventName, handler);
  }
}

export const notificationBus = NotificationEventBus.getInstance();
