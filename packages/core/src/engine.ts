import { RegistryManager } from './registry/registry-manager.js';
import { ExecutionContext, ExecutionContextOptions } from './pipeline/context.js';
import { PipelineRunner } from './pipeline/pipeline-runner.js';
import { ConfigLoader } from './config/config-loader.js';
import { DevPublisherConfig } from './models/config.js';
import { DevPublisherRunResult, ValidationResult } from './models/publish-result.js';
import { DevPublisherPlugin } from './registry/plugin.js';
import { FileLoaderPlugin } from './plugins/file-loader.js';
import { FrontmatterValidatorPlugin } from './plugins/frontmatter-validator.js';
import { CanonicalUrlTransformerPlugin } from './plugins/canonical-url-transformer.js';
import { ConsoleReporterPlugin } from './plugins/console-reporter.js';
import { FileTrackingProvider } from './infra/tracking.js';
import { FileCacheProvider } from './infra/cache.js';

export interface DevPublisherEngineOptions {
  configPath?: string;
  configOverrides?: Partial<DevPublisherConfig>;
  contextOptions?: Partial<ExecutionContextOptions>;
  plugins?: DevPublisherPlugin[];
}

export class DevPublisherEngine {
  readonly registry = new RegistryManager();
  readonly config: DevPublisherConfig;
  private runner = new PipelineRunner();

  constructor(options: DevPublisherEngineOptions = {}) {
    this.config = ConfigLoader.load(options.configPath, options.configOverrides);
    this.registerDefaultPlugins();

    if (options.plugins) {
      for (const plugin of options.plugins) {
        this.registry.register(plugin);
      }
    }
  }

  private registerDefaultPlugins(): void {
    this.registry.register(new FileLoaderPlugin());
    this.registry.register(new FrontmatterValidatorPlugin());
    this.registry.register(new CanonicalUrlTransformerPlugin());
    this.registry.register(new ConsoleReporterPlugin());
  }

  use(plugin: DevPublisherPlugin): this {
    this.registry.register(plugin);
    return this;
  }

  async run(contextOverrides?: Partial<ExecutionContextOptions>): Promise<DevPublisherRunResult> {
    const trackingProvider =
      contextOverrides?.tracking ||
      (this.config.pipeline.tracking.provider === 'file'
        ? new FileTrackingProvider(this.config.pipeline.tracking.file)
        : undefined);

    const cacheProvider = contextOverrides?.cache || new FileCacheProvider();

    const ctx = new ExecutionContext({
      config: this.config,
      tracking: trackingProvider,
      cache: cacheProvider,
      ...contextOverrides
    });

    return this.runner.run(ctx, this.registry);
  }

  async validate(contextOverrides?: Partial<ExecutionContextOptions>): Promise<ValidationResult[]> {
    const ctx = new ExecutionContext({
      config: this.config,
      ...contextOverrides
    });

    const fileLoader = this.registry.loaders.get('file-loader');
    if (fileLoader) {
      ctx.articles = await fileLoader.load(ctx.config.source);
    }

    const validatorStage = new (await import('./pipeline/stages/validator-stage.js')).ValidatorStage();
    await validatorStage.execute(ctx, this.registry);

    return ctx.validationResults;
  }

  listPlugins(): DevPublisherPlugin[] {
    return this.registry.listAll();
  }
}
