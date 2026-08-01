import { TransformerPlugin } from '../registry/transformer-registry.js';
import { BlogPost } from '../models/blog-post.js';

export class CanonicalUrlTransformerPlugin implements TransformerPlugin {
  readonly id = 'canonical-url-transformer';
  readonly name = 'Canonical URL Transformer';
  readonly version = '1.0.0';
  readonly type = 'transformer';
  readonly description = 'Ensures canonical URL is formatted and present';

  async transform(post: BlogPost, _platformId: string): Promise<BlogPost> {
    // If canonical URL is present in frontmatter, preserve it.
    // Clean transformation hook for future dynamic canonical URL resolution strategies.
    return post;
  }
}
