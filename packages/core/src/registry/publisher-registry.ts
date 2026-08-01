import { DevPublisherPlugin } from './plugin.js';
import { BlogPost } from '../models/blog-post.js';
import { PlatformResult, ValidationResult } from '../models/publish-result.js';
import { PlatformConfig } from '../models/config.js';

export interface PublisherOptions {
  apiKey?: string;
  config?: PlatformConfig;
  [key: string]: unknown;
}

export interface Publisher {
  readonly platformId: string;
  readonly platformName: string;
  validate(post: BlogPost): Promise<ValidationResult>;
  publish(post: BlogPost, options?: PublisherOptions): Promise<PlatformResult>;
  update(post: BlogPost, externalId: string, options?: PublisherOptions): Promise<PlatformResult>;
  delete(externalId: string, options?: PublisherOptions): Promise<PlatformResult>;
}

export interface PublisherPlugin extends DevPublisherPlugin {
  readonly type: 'publisher';
  createPublisher(config?: PlatformConfig): Publisher;
}

export class PublisherRegistry {
  private plugins = new Map<string, PublisherPlugin>();

  register(plugin: PublisherPlugin): void {
    this.plugins.set(plugin.id, plugin);
  }

  get(id: string): PublisherPlugin | undefined {
    return this.plugins.get(id);
  }

  has(id: string): boolean {
    return this.plugins.has(id);
  }

  list(): PublisherPlugin[] {
    return Array.from(this.plugins.values());
  }
}
