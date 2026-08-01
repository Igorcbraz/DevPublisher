import { DevPublisherPlugin } from './plugin.js';
import { BlogPost } from '../models/blog-post.js';

export interface TransformerPlugin extends DevPublisherPlugin {
  readonly type: 'transformer';
  transform(post: BlogPost, platformId: string): Promise<BlogPost>;
}

export class TransformerRegistry {
  private transformers = new Map<string, TransformerPlugin>();

  register(transformer: TransformerPlugin): void {
    this.transformers.set(transformer.id, transformer);
  }

  get(id: string): TransformerPlugin | undefined {
    return this.transformers.get(id);
  }

  has(id: string): boolean {
    return this.transformers.has(id);
  }

  list(): TransformerPlugin[] {
    return Array.from(this.transformers.values());
  }
}
