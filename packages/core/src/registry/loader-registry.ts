import { DevPublisherPlugin } from './plugin.js';
import { BlogPost } from '../models/blog-post.js';
import { SourceConfig } from '../models/config.js';

export interface LoaderPlugin extends DevPublisherPlugin {
  readonly type: 'loader';
  load(config: SourceConfig): Promise<BlogPost[]>;
}

export class LoaderRegistry {
  private loaders = new Map<string, LoaderPlugin>();

  register(loader: LoaderPlugin): void {
    this.loaders.set(loader.id, loader);
  }

  get(id: string): LoaderPlugin | undefined {
    return this.loaders.get(id);
  }

  has(id: string): boolean {
    return this.loaders.has(id);
  }

  list(): LoaderPlugin[] {
    return Array.from(this.loaders.values());
  }
}
