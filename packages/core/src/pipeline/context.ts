import { DevPublisherConfig } from '../models/config.js';
import { BlogPost } from '../models/blog-post.js';
import { ArticlePublishResult, ValidationResult } from '../models/publish-result.js';
import { Logger, ConsoleLogger } from '../infra/logger.js';
import { CacheProvider, MemoryCacheProvider } from '../infra/cache.js';
import { TrackingProvider, MemoryTrackingProvider } from '../infra/tracking.js';
import { EventBus } from '../events/event-bus.js';

export interface ExecutionContextOptions {
  runId?: string;
  config: DevPublisherConfig;
  logger?: Logger;
  cache?: CacheProvider;
  tracking?: TrackingProvider;
  events?: EventBus;
}

export class ExecutionContext {
  readonly id: string;
  readonly config: DevPublisherConfig;
  readonly logger: Logger;
  readonly cache: CacheProvider;
  readonly tracking: TrackingProvider;
  readonly events: EventBus;

  articles: BlogPost[] = [];
  validationResults: ValidationResult[] = [];
  results: ArticlePublishResult[] = [];
  metadata: Record<string, unknown> = {};

  constructor(options: ExecutionContextOptions) {
    this.id = options.runId ?? `run-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    this.config = options.config;
    this.logger = options.logger ?? new ConsoleLogger();
    this.cache = options.cache ?? new MemoryCacheProvider();
    this.tracking = options.tracking ?? new MemoryTrackingProvider();
    this.events = options.events ?? new EventBus();
  }
}
