import { EventEmitter } from 'events';
import type { XPTriggerType } from '../types/index.js';
import type { NotificationType } from './notification.js';

// Typed event map
interface EventMap {
  'xp:award': { userId: string; triggerType: XPTriggerType; topicId?: string };
  'notification:queue': { userId: string; type: NotificationType; metadata?: Record<string, unknown> };
}

type EventName = keyof EventMap;

class AppEvents {
  private emitter = new EventEmitter();

  emit<K extends EventName>(event: K, payload: EventMap[K]): void {
    this.emitter.emit(event, payload);
  }

  on<K extends EventName>(event: K, handler: (payload: EventMap[K]) => void): void {
    this.emitter.on(event, handler);
  }
}

export const appEvents = new AppEvents();

// Register handlers (lazy imports to avoid circular deps)
appEvents.on('xp:award', async (payload) => {
  try {
    const { awardXP } = await import('./gamification.js');
    await awardXP(payload.userId, { triggerType: payload.triggerType, topicId: payload.topicId });
  } catch (e) { console.warn('[events:xp:award]', e); }
});

appEvents.on('notification:queue', async (payload) => {
  try {
    const { queueNotification } = await import('./notification.js');
    await queueNotification(payload.userId, payload.type, payload.metadata);
  } catch (e) { console.warn('[events:notification:queue]', e); }
});
