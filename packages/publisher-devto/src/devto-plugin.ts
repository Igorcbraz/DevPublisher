import { PublisherPlugin, Publisher, PlatformConfig } from '@devpublisher/core';
import { DevtoPublisher } from './devto-publisher.js';

export class DevtoPublisherPlugin implements PublisherPlugin {
  readonly id = 'devto';
  readonly name = 'Dev.to Publisher';
  readonly version = '1.0.0';
  readonly type = 'publisher';
  readonly description = 'Official Dev.to cross-posting publisher plugin';

  createPublisher(config?: PlatformConfig): Publisher {
    return new DevtoPublisher(config);
  }
}
