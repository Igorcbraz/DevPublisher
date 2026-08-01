export type PluginType = 'loader' | 'validator' | 'enricher' | 'transformer' | 'publisher' | 'reporter';

export interface DevPublisherPlugin {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly type: PluginType;
  readonly description?: string;
}
