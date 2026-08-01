import { DevPublisherPlugin } from './plugin.js';
import { LoaderRegistry, LoaderPlugin } from './loader-registry.js';
import { ValidatorRegistry, ValidatorPlugin } from './validator-registry.js';
import { TransformerRegistry, TransformerPlugin } from './transformer-registry.js';
import { PublisherRegistry, PublisherPlugin } from './publisher-registry.js';
import { ReporterRegistry, ReporterPlugin } from './reporter-registry.js';

export class RegistryManager {
  readonly loaders = new LoaderRegistry();
  readonly validators = new ValidatorRegistry();
  readonly transformers = new TransformerRegistry();
  readonly publishers = new PublisherRegistry();
  readonly reporters = new ReporterRegistry();

  register(plugin: DevPublisherPlugin): void {
    switch (plugin.type) {
      case 'loader':
        this.loaders.register(plugin as LoaderPlugin);
        break;
      case 'validator':
        this.validators.register(plugin as ValidatorPlugin);
        break;
      case 'transformer':
        this.transformers.register(plugin as TransformerPlugin);
        break;
      case 'publisher':
        this.publishers.register(plugin as PublisherPlugin);
        break;
      case 'reporter':
        this.reporters.register(plugin as ReporterPlugin);
        break;
      default:
        throw new Error(`Unsupported plugin type: ${(plugin as DevPublisherPlugin).type}`);
    }
  }

  listAll(): DevPublisherPlugin[] {
    return [
      ...this.loaders.list(),
      ...this.validators.list(),
      ...this.transformers.list(),
      ...this.publishers.list(),
      ...this.reporters.list()
    ];
  }
}
