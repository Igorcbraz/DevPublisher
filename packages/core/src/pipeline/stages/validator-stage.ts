import { PipelineStage } from '../stage.js';
import { ExecutionContext } from '../context.js';
import { RegistryManager } from '../../registry/registry-manager.js';
import { ValidationResult } from '../../models/publish-result.js';

export class ValidatorStage implements PipelineStage {
  readonly name = 'ValidatorStage';

  async execute(ctx: ExecutionContext, registry: RegistryManager): Promise<void> {
    ctx.logger.info('Running Validator Stage...');
    const validatorIds = ctx.config.pipeline.validators;
    ctx.validationResults = [];

    for (const post of ctx.articles) {
      let overallValid = true;
      const combinedIssues = [];

      for (const valId of validatorIds) {
        const validator = registry.validators.get(valId);
        if (!validator) {
          ctx.logger.warn(`Validator plugin '${valId}' not found in registry`);
          continue;
        }

        const res = await validator.validate(post);
        if (!res.valid) overallValid = false;
        combinedIssues.push(...res.issues);
      }

      const valResult: ValidationResult = {
        valid: overallValid,
        filePath: post.filePath,
        issues: combinedIssues
      };

      ctx.validationResults.push(valResult);
      ctx.events.emit('article:validated', { result: valResult });
    }
  }
}
