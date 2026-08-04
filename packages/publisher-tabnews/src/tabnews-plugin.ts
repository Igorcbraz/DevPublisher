import { PlatformConfig, Publisher, PublisherPlugin } from '@devpublisher/core';
import { TabnewsPublisher } from './tabnews-publisher.js';

export class TabnewsPublisherPlugin implements PublisherPlugin {
  readonly id = 'tabnews';
  readonly name = 'TabNews Publisher';
  readonly version = '1.0.0';
  readonly type = 'publisher';
  readonly description = 'TabNews publisher plugin';

  createPublisher(config?: PlatformConfig): Publisher {
    return new TabnewsPublisher(config);
  }
}
