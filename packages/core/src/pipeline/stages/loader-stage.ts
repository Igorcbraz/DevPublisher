import { PipelineStage } from '../stage.js';
import { ExecutionContext } from '../context.js';
import { RegistryManager } from '../../registry/registry-manager.js';

export class LoaderStage implements PipelineStage {
  readonly name = 'LoaderStage';

  async execute(ctx: ExecutionContext, registry: RegistryManager): Promise<void> {
    ctx.logger.info('Running Loader Stage...');
    const loaders = registry.loaders.list();
    if (loaders.length === 0) {
      ctx.logger.warn('No loaders registered in RegistryManager');
      return;
    }

    // Default to the first registered loader or file-loader
    const loader = registry.loaders.get('file-loader') || loaders[0]!;
    const loadedPosts = await loader.load(ctx.config.source);
    ctx.articles = loadedPosts;

    ctx.logger.info(`Loaded ${ctx.articles.length} article(s)`);
    for (const post of ctx.articles) {
      ctx.events.emit('article:loaded', { post });
    }
  }
}
