import * as path from 'node:path';
import { PipelineStage } from '../stage.js';
import { ExecutionContext } from '../context.js';
import { RegistryManager } from '../../registry/registry-manager.js';
import { PlatformResult } from '../../models/publish-result.js';

export class PublisherStage implements PipelineStage {
  readonly name = 'PublisherStage';

  async execute(ctx: ExecutionContext, registry: RegistryManager): Promise<void> {
    ctx.logger.info('Running Publisher Stage...');
    ctx.results = [];

    const activePlatforms = Object.entries(ctx.config.platforms).filter(
      ([_, config]) => config && config.enabled !== false
    );

    if (activePlatforms.length === 0) {
      ctx.logger.warn('No active target platforms enabled in config');
      return;
    }

    for (const post of ctx.articles) {
      const valRes = ctx.validationResults.find((r) => r.filePath === post.filePath);
      if (valRes && !valRes.valid) {
        ctx.logger.warn(`Skipping publication for invalid article: ${post.filePath}`);
        const fileName = path.basename(post.filePath, path.extname(post.filePath));
        ctx.results.push({
          filePath: post.filePath,
          slug: post.frontmatter.slug || fileName,
          title: post.frontmatter.title || fileName,
          platformResults: [],
          success: false
        });
        continue;
      }

      const platformResults: PlatformResult[] = [];

      for (const [platformId, platformConfig] of activePlatforms) {
        const plugin = registry.publishers.get(platformId);
        if (!plugin) {
          ctx.logger.warn(`Publisher plugin for platform '${platformId}' not registered`);
          platformResults.push({
            platformId,
            platformName: platformId,
            status: 'failed',
            message: `Publisher plugin for '${platformId}' is not registered`
          });
          continue;
        }

        ctx.events.emit('publish:before', { post, platformId });

        try {
          const publisher = plugin.createPublisher(platformConfig);
          const articleState = await ctx.tracking.getArticleState(post.slug);
          const platformState = articleState?.platforms[platformId];

          let result: PlatformResult;

          if (platformState && platformState.externalId) {
            if (platformState.checksum === post.checksum) {
              ctx.logger.info(`Skipping unchanged article '${post.slug}' on ${plugin.name}...`);
              result = {
                platformId,
                platformName: plugin.name,
                status: 'skipped',
                externalId: platformState.externalId,
                url: platformState.url,
                message: 'Article content has not changed since the last publication'
              };
            } else {
              // Already published with changed content -> update
              ctx.logger.info(
                `Updating article '${post.slug}' on ${plugin.name} (ID: ${platformState.externalId})...`
              );
              result = await publisher.update(post, platformState.externalId, {
                apiKey: platformConfig.apiKey,
                config: platformConfig
              });
            }
          } else {
            // New article -> publish
            ctx.logger.info(`Publishing article '${post.slug}' to ${plugin.name}...`);
            result = await publisher.publish(post, {
              apiKey: platformConfig.apiKey,
              config: platformConfig
            });
          }

          if (result.status === 'published' || result.status === 'updated') {
            if (result.externalId && result.url) {
              await ctx.tracking.setPlatformState(post.slug, post.checksum, platformId, {
                externalId: result.externalId,
                url: result.url,
                publishedAt: platformState?.publishedAt || new Date().toISOString(),
                updatedAt: new Date().toISOString()
              });
            }
            ctx.events.emit('publish:success', { post, platformId, result });
          } else if (result.status === 'skipped') {
            ctx.events.emit('publish:skipped', {
              post,
              platformId,
              reason: result.message || 'Skipped'
            });
          } else {
            ctx.events.emit('publish:failed', { post, platformId, result });
          }

          platformResults.push(result);
        } catch (err: unknown) {
          const error = err instanceof Error ? err : new Error(String(err));
          ctx.logger.error(`Error publishing '${post.slug}' to ${platformId}: ${error.message}`);
          const failResult: PlatformResult = {
            platformId,
            platformName: plugin.name,
            status: 'failed',
            error,
            message: error.message
          };
          ctx.events.emit('publish:failed', { post, platformId, result: failResult });
          platformResults.push(failResult);
        }
      }

      const hasFailures = platformResults.some((r) => r.status === 'failed');
      ctx.results.push({
        filePath: post.filePath,
        slug: post.slug,
        title: post.title,
        platformResults,
        success: !hasFailures
      });
    }
  }
}
