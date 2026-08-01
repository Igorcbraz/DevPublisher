import { ExecutionContext } from './context.js';
import { PipelineStage } from './stage.js';
import { RegistryManager } from '../registry/registry-manager.js';
import { LoaderStage } from './stages/loader-stage.js';
import { ValidatorStage } from './stages/validator-stage.js';
import { TransformerStage } from './stages/transformer-stage.js';
import { PublisherStage } from './stages/publisher-stage.js';
import { ReporterStage } from './stages/reporter-stage.js';
import { DevPublisherRunResult } from '../models/publish-result.js';

export class PipelineRunner {
  private stages: PipelineStage[] = [];

  constructor(stages?: PipelineStage[]) {
    this.stages = stages || [
      new LoaderStage(),
      new ValidatorStage(),
      new TransformerStage(),
      new PublisherStage(),
      new ReporterStage()
    ];
  }

  async run(ctx: ExecutionContext, registry: RegistryManager): Promise<DevPublisherRunResult> {
    ctx.events.emit('pipeline:start', { runId: ctx.id, articlesCount: ctx.articles.length });

    try {
      for (const stage of this.stages) {
        const start = Date.now();
        ctx.events.emit('stage:start', { stageName: stage.name });
        await stage.execute(ctx, registry);
        ctx.events.emit('stage:end', { stageName: stage.name, durationMs: Date.now() - start });
      }

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

      ctx.events.emit('pipeline:end', { runId: ctx.id, success: failedArticles === 0 });
      return runResult;
    } catch (err) {
      ctx.events.emit('pipeline:end', { runId: ctx.id, success: false });
      throw err;
    }
  }
}
