import {
  PublisherPlugin,
  Publisher,
  BlogPost,
  PlatformResult,
  ValidationResult,
  PublisherOptions,
  PlatformConfig
} from '@devpublisher/core';

export class HashnodePublisher implements Publisher {
  readonly platformId = 'hashnode';
  readonly platformName = 'Hashnode';

  async validate(_post: BlogPost): Promise<ValidationResult> {
    throw new Error('HashnodePublisher is not implemented yet');
  }

  async publish(_post: BlogPost, _options?: PublisherOptions): Promise<PlatformResult> {
    throw new Error('HashnodePublisher is not implemented yet');
  }

  async update(_post: BlogPost, _externalId: string, _options?: PublisherOptions): Promise<PlatformResult> {
    throw new Error('HashnodePublisher is not implemented yet');
  }

  async delete(_externalId: string, _options?: PublisherOptions): Promise<PlatformResult> {
    throw new Error('HashnodePublisher is not implemented yet');
  }
}

export class HashnodePublisherPlugin implements PublisherPlugin {
  readonly id = 'hashnode';
  readonly name = 'Hashnode Publisher (Stub)';
  readonly version = '0.1.0';
  readonly type = 'publisher';
  readonly description = 'Hashnode publisher plugin (Not Implemented)';

  createPublisher(_config?: PlatformConfig): Publisher {
    return new HashnodePublisher();
  }
}

export default HashnodePublisherPlugin;
