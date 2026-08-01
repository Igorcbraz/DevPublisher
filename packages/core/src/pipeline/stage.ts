import { ExecutionContext } from './context.js';
import { RegistryManager } from '../registry/registry-manager.js';

export interface PipelineStage {
  readonly name: string;
  execute(ctx: ExecutionContext, registry: RegistryManager): Promise<void>;
}
