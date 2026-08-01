import { PipelineStage } from '../stage.js';
import { ExecutionContext } from '../context.js';
import { RegistryManager } from '../../registry/registry-manager.js';
import { DevPublisherRunResult } from '../../models/publish-result.js';

export class ReporterStage implements PipelineStage {
  readonly name = 'ReporterStage';

  async execute(ctx: ExecutionContext, registry: RegistryManager): Promise<void> {
    ctx.logger.info('Running Reporter Stage...');
    const reporters = registry.reporters.list();

    const totalArticles = ctx.results.length;
    const successfulArticles = ctx.results.filter((r) => r.success).length;
    const failedArticles = totalArticles - successfulArticles;

    const runResult: DevPublisherRunResult = {
      runId: ctx.id,
      totalArticles,
      successfulArticles,
      failedArticles,
      results: ctx.results,
      validationResults: ctx.validationResults
    };

    for (const reporter of reporters) {
      await reporter.report(runResult);
    }
  }
}
