import { PlatformConfig, Publisher, PublisherPlugin } from '@devpublisher/core';
import { HashnodePublisher } from './hashnode-publisher.js';

export class HashnodePublisherPlugin implements PublisherPlugin {
  readonly id = 'hashnode';
  readonly name = 'Hashnode Publisher';
  readonly version = '1.0.0';
  readonly type = 'publisher';
  readonly description = 'Official Hashnode GraphQL cross-posting publisher plugin';

  createPublisher(config?: PlatformConfig): Publisher {
    return new HashnodePublisher(config);
  }
}
