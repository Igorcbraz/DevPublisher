import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DevtoPublisher } from '../devto-publisher.js';
import { BlogPost } from '@devpublisher/core';

describe('DevtoPublisher', () => {
  let publisher: DevtoPublisher;

  beforeEach(() => {
    publisher = new DevtoPublisher();
    vi.restoreAllMocks();
  });

  it('should validate blog post correctly', async () => {
    const post = new BlogPost({
      filePath: 'test.md',
      frontmatter: { title: 'Test Title' },
      content: 'Content body',
      rawContent: 'raw'
    });

    const val = await publisher.validate(post);
    expect(val.valid).toBe(true);
    expect(val.issues.length).toBe(0);
  });

  it('should return failed status if API key is missing', async () => {
    const post = new BlogPost({
      filePath: 'test.md',
      frontmatter: { title: 'Test Title' },
      content: 'Content body',
      rawContent: 'raw'
    });

    const res = await publisher.publish(post, { apiKey: '' });
    expect(res.status).toBe('failed');
    expect(res.message).toContain('API key is missing');
  });

  it('should call Dev.to API and return published result on 200 response', async () => {
    const post = new BlogPost({
      filePath: 'test.md',
      frontmatter: { title: 'Test Title', tags: ['typescript'], published: true },
      content: 'Content body',
      rawContent: 'raw'
    });

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 98765, url: 'https://dev.to/user/test-title' })
    } as any);

    const res = await publisher.publish(post, { apiKey: 'devto-secret-key' });

    expect(res.status).toBe('published');
    expect(res.externalId).toBe('98765');
    expect(res.url).toBe('https://dev.to/user/test-title');
    expect(global.fetch).toHaveBeenCalledWith(
      'https://dev.to/api/articles',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'api-key': 'devto-secret-key'
        })
      })
    );
  });
});
