import {
  PublisherPlugin,
  Publisher,
  BlogPost,
  PlatformResult,
  ValidationResult,
  PublisherOptions,
  PlatformConfig
} from '@devpublisher/core';

export class MediumPublisher implements Publisher {
  readonly platformId = 'medium';
  readonly platformName = 'Medium';

  async validate(_post: BlogPost): Promise<ValidationResult> {
    throw new Error('MediumPublisher is not implemented yet');
  }

  async publish(_post: BlogPost, _options?: PublisherOptions): Promise<PlatformResult> {
    throw new Error('MediumPublisher is not implemented yet');
  }

  async update(_post: BlogPost, _externalId: string, _options?: PublisherOptions): Promise<PlatformResult> {
    throw new Error('MediumPublisher is not implemented yet');
  }

  async delete(_externalId: string, _options?: PublisherOptions): Promise<PlatformResult> {
    throw new Error('MediumPublisher is not implemented yet');
  }
}

export class MediumPublisherPlugin implements PublisherPlugin {
  readonly id = 'medium';
  readonly name = 'Medium Publisher (Stub)';
  readonly version = '0.1.0';
  readonly type = 'publisher';
  readonly description = 'Medium publisher plugin (Not Implemented)';

  createPublisher(_config?: PlatformConfig): Publisher {
    return new MediumPublisher();
  }
}

export default MediumPublisherPlugin;
