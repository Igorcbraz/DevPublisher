import { PlatformConfig, Publisher, PublisherPlugin } from '@devpublisher/core';
import { MediumPublisher } from './medium-publisher.js';

export class MediumPublisherPlugin implements PublisherPlugin {
  readonly id = 'medium';
  readonly name = 'Medium Publisher';
  readonly version = '1.0.0';
  readonly type = 'publisher';
  readonly description = 'Medium publisher plugin';

  createPublisher(_config?: PlatformConfig): Publisher {
    return new MediumPublisher();
  }
}
