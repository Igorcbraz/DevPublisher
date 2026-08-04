import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  BlogPost,
  DevPublisherEngine,
  MemoryCacheProvider,
  MemoryTrackingProvider
} from '@devpublisher/core';
import { HashnodePublisherPlugin } from '../hashnode-plugin.js';
import { HashnodePublisher } from '../hashnode-publisher.js';

function createPost(): BlogPost {
  return new BlogPost({
    filePath: 'test.md',
    frontmatter: {
      title: 'Hashnode Test Post',
      description: 'A test post',
      tags: ['typescript'],
      published: true
    },
    content: 'Article content',
    rawContent: 'Article content'
  });
}

function mockSuccess(operation: 'publishPost' | 'updatePost'): void {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({
      data: {
        [operation]: {
          post: { id: 'hashnode-post-123', url: 'https://example.hashnode.dev/hashnode-test-post' }
        }
      }
    })
  } as Response);
}

describe('HashnodePublisher', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubEnv('HASHNODE_TOKEN', '');
    vi.stubEnv('HASHNODE_PUBLICATION_ID', '');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('validates the Hashnode token and publication ID configuration', async () => {
    const publisher = new HashnodePublisher();

    const result = await publisher.validate(createPost());

    expect(result.valid).toBe(false);
    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'token', message: 'HASHNODE_TOKEN is required' }),
        expect.objectContaining({
          field: 'publicationId',
          message: 'HASHNODE_PUBLICATION_ID is required'
        })
      ])
    );
  });

  it('publishes a new post through the Hashnode GraphQL API', async () => {
    const publisher = new HashnodePublisher({
      apiKey: 'hashnode-token',
      publicationId: 'publication-123',
      options: {}
    });
    mockSuccess('publishPost');

    const result = await publisher.publish(createPost());

    expect(result).toMatchObject({
      status: 'published',
      externalId: 'hashnode-post-123',
      url: 'https://example.hashnode.dev/hashnode-test-post'
    });
    expect(global.fetch).toHaveBeenCalledWith(
      'https://gql.hashnode.com',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ Authorization: 'hashnode-token' }),
        body: expect.stringContaining('publishPost')
      })
    );
  });

  it('updates an existing post through the Hashnode GraphQL API', async () => {
    const publisher = new HashnodePublisher({
      apiKey: 'hashnode-token',
      publicationId: 'publication-123',
      options: {}
    });
    mockSuccess('updatePost');

    const result = await publisher.update(createPost(), 'hashnode-post-123');

    expect(result).toMatchObject({ status: 'updated', externalId: 'hashnode-post-123' });
    const requestBody = JSON.parse(
      (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0]?.[1]?.body as string
    );
    expect(requestBody.variables.input.id).toBe('hashnode-post-123');
  });

  it('skips unchanged posts when their Hashnode tracking state exists', async () => {
    const engine = new DevPublisherEngine({
      configOverrides: {
        source: { folder: 'examples/content/blog', match: '**/*.md' },
        platforms: {
          hashnode: {
            enabled: true,
            apiKey: 'hashnode-token',
            publicationId: 'publication-123',
            options: {}
          }
        }
      }
    });
    const tracking = new MemoryTrackingProvider();
    engine.use(new HashnodePublisherPlugin());
    mockSuccess('publishPost');

    await engine.run({ tracking, cache: new MemoryCacheProvider() });
    const secondRun = await engine.run({ tracking, cache: new MemoryCacheProvider() });

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(secondRun.results[0]?.platformResults[0]?.status).toBe('skipped');
  });
});
