import { PipelineStage } from '../stage.js';
import { ExecutionContext } from '../context.js';
import { RegistryManager } from '../../registry/registry-manager.js';
import { BlogPost } from '../../models/blog-post.js';

export class TransformerStage implements PipelineStage {
  readonly name = 'TransformerStage';

  async execute(ctx: ExecutionContext, registry: RegistryManager): Promise<void> {
    ctx.logger.info('Running Transformer Stage...');
    const transformerIds = ctx.config.pipeline.transformers;
    const transformedPosts: BlogPost[] = [];

    for (const post of ctx.articles) {
      let currentPost = post;
      for (const transId of transformerIds) {
        const transformer = registry.transformers.get(transId);
        if (!transformer) continue;
        currentPost = await transformer.transform(currentPost, 'all');
      }
      transformedPosts.push(currentPost);
    }

    ctx.articles = transformedPosts;
  }
}
