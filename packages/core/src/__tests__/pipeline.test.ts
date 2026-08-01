import { describe, it, expect, vi } from 'vitest';
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

  createPublisher(): Publisher {
    return new MockPublisher();
  }
}

describe('DevPublisher Pipeline Engine', () => {
  it('should register plugins and execute end-to-end pipeline', async () => {
    const engine = new DevPublisherEngine({
      configOverrides: {
        source: {
          folder: 'examples/content/blog'
        },
        platforms: {
          'mock-platform': { enabled: true }
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
});
