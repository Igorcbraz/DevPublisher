import { EventEmitter } from 'node:events';
import { BlogPost } from '../models/blog-post.js';
import { PlatformResult, ValidationResult } from '../models/publish-result.js';

export type EventMap = {
  'pipeline:start': { runId: string; articlesCount: number };
  'pipeline:end': { runId: string; success: boolean };
  'stage:start': { stageName: string };
  'stage:end': { stageName: string; durationMs: number };
  'article:loaded': { post: BlogPost };
  'article:validated': { result: ValidationResult };
  'article:transformed': { post: BlogPost; platformId: string };
  'publish:before': { post: BlogPost; platformId: string };
  'publish:success': { post: BlogPost; platformId: string; result: PlatformResult };
  'publish:failed': { post: BlogPost; platformId: string; result: PlatformResult };
  'publish:skipped': { post: BlogPost; platformId: string; reason: string };
};

export class EventBus {
  private emitter = new EventEmitter();

  on<K extends keyof EventMap>(event: K, listener: (data: EventMap[K]) => void): this {
    this.emitter.on(event, listener as (...args: unknown[]) => void);
    return this;
  }

  once<K extends keyof EventMap>(event: K, listener: (data: EventMap[K]) => void): this {
    this.emitter.once(event, listener as (...args: unknown[]) => void);
    return this;
  }

  emit<K extends keyof EventMap>(event: K, data: EventMap[K]): boolean {
    return this.emitter.emit(event, data);
  }

  removeListener<K extends keyof EventMap>(event: K, listener: (data: EventMap[K]) => void): this {
    this.emitter.removeListener(event, listener as (...args: unknown[]) => void);
    return this;
  }

  removeAllListeners(): this {
    this.emitter.removeAllListeners();
    return this;
  }
}
