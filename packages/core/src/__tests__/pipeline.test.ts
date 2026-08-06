import { describe, it, expect } from 'vitest';
import { DevPublisherEngine } from '../engine.js';
import { PublisherPlugin, Publisher } from '../registry/publisher-registry.js';
import { BlogPost } from '../models/blog-post.js';
import { PlatformResult, ValidationResult } from '../models/publish-result.js';
import { MemoryTrackingProvider } from '../infra/tracking.js';
import { MemoryCacheProvider } from '../infra/cache.js';

class MockPublisher implements Publisher {
  readonly platformId = 'mock-platform';
  readonly platformName = 'Mock Platform';

  async validate(_post: BlogPost): Promise<ValidationResult> {
    return { valid: true, filePath: _post.filePath, issues: [] };
  }

  async publish(post: BlogPost): Promise<PlatformResult> {
    return {
      platformId: this.platformId,
      platformName: this.platformName,
      status: 'published',
      externalId: 'mock-123',
      url: `https://mock.com/${post.slug}`
    };
  }

  async update(post: BlogPost, externalId: string): Promise<PlatformResult> {
    return {
      platformId: this.platformId,
      platformName: this.platformName,
      status: 'updated',
      externalId,
      url: `https://mock.com/${post.slug}`
    };
  }

  async delete(): Promise<PlatformResult> {
    return {
      platformId: this.platformId,
      platformName: this.platformName,
      status: 'published'
    };
  }
}

class MockPublisherPlugin implements PublisherPlugin {
  readonly id = 'mock-platform';
  readonly name = 'Mock Platform Plugin';
  readonly version = '1.0.0';
  readonly type = 'publisher';

  publishCalls = 0;
  updateCalls = 0;

  createPublisher(): Publisher {
    const publisher = new MockPublisher();
    return {
      platformId: publisher.platformId,
      platformName: publisher.platformName,
      validate: publisher.validate.bind(publisher),
      publish: async (post: BlogPost): Promise<PlatformResult> => {
        this.publishCalls += 1;
        return publisher.publish(post);
      },
      update: async (post: BlogPost, externalId: string): Promise<PlatformResult> => {
        this.updateCalls += 1;
        return publisher.update(post, externalId);
      },
      delete: publisher.delete.bind(publisher)
    };
  }
}

describe('DevPublisher Pipeline Engine', () => {
  it('should register plugins and execute end-to-end pipeline', async () => {
    const engine = new DevPublisherEngine({
      configOverrides: {
        source: {
          folder: 'examples/content/blog',
          match: '**/*.md'
        },
        platforms: {
          'mock-platform': { enabled: true, options: {} }
        }
      }
    });

    engine.use(new MockPublisherPlugin());

    const result = await engine.run({
      tracking: new MemoryTrackingProvider(),
      cache: new MemoryCacheProvider()
    });

    expect(result.totalArticles).toBeGreaterThan(0);
    expect(result.successfulArticles).toBe(result.totalArticles);
    expect(result.failedArticles).toBe(0);
    expect(result.results[0]?.platformResults[0]?.status).toBe('published');
    expect(result.results[0]?.platformResults[0]?.externalId).toBe('mock-123');
  });

  it('should skip unchanged articles that have already been published', async () => {
    const engine = new DevPublisherEngine({
      configOverrides: {
        source: {
          folder: 'examples/content/blog',
          match: '**/*.md'
        },
        platforms: {
          'mock-platform': { enabled: true, options: {} }
        }
      }
    });
    const plugin = new MockPublisherPlugin();
    const tracking = new MemoryTrackingProvider();

    engine.use(plugin);
    await engine.run({ tracking, cache: new MemoryCacheProvider() });
    const secondRun = await engine.run({ tracking, cache: new MemoryCacheProvider() });

    expect(plugin.publishCalls).toBeGreaterThan(0);
    expect(plugin.updateCalls).toBe(0);
    expect(secondRun.results[0]?.platformResults[0]?.status).toBe('skipped');
  });

  it('should update an article whose content has changed since publication', async () => {
    const engine = new DevPublisherEngine({
      configOverrides: {
        source: {
          folder: 'examples/content/blog',
          match: '**/*.md'
        },
        platforms: {
          'mock-platform': { enabled: true, options: {} }
        }
      }
    });
    const plugin = new MockPublisherPlugin();
    const tracking = new MemoryTrackingProvider();

    await tracking.setPlatformState(
      'hello-world-devpublisher',
      'outdated-checksum',
      'mock-platform',
      {
        externalId: 'mock-123',
        url: 'https://mock.com/hello-world-devpublisher',
        publishedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    );
    engine.use(plugin);

    const result = await engine.run({ tracking, cache: new MemoryCacheProvider() });

    expect(plugin.publishCalls).toBe(0);
    expect(plugin.updateCalls).toBe(1);
    expect(result.results[0]?.platformResults[0]?.status).toBe('updated');
  });
});
