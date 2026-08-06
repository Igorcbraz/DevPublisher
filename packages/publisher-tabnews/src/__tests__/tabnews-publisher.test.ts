import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TabnewsPublisher } from '../tabnews-publisher.js';
import { BlogPost } from '@devpublisher/core';

describe('TabnewsPublisher', () => {
  let publisher: TabnewsPublisher;

  beforeEach(() => {
    publisher = new TabnewsPublisher();
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

  it('should return failed status if TABNEWS_SESSION_ID is missing', async () => {
    const originalSession = process.env.TABNEWS_SESSION_ID;
    delete process.env.TABNEWS_SESSION_ID;

    const post = new BlogPost({
      filePath: 'test.md',
      frontmatter: { title: 'Test Title' },
      content: 'Content body',
      rawContent: 'raw'
    });

    const res = await publisher.publish(post, { apiKey: '' });
    expect(res.status).toBe('failed');
    expect(res.message).toContain('TabNews session ID is missing');

    if (originalSession) process.env.TABNEWS_SESSION_ID = originalSession;
  });

  it('should publish to TabNews using process.env.TABNEWS_SESSION_ID', async () => {
    const originalSession = process.env.TABNEWS_SESSION_ID;
    process.env.TABNEWS_SESSION_ID = 'test-session-cookie-123';

    const post = new BlogPost({
      filePath: 'test.md',
      frontmatter: { title: 'TabNews Test Post' },
      content: 'Post body content',
      rawContent: 'raw'
    });

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'tab-123', owner_username: 'devuser', slug: 'tabnews-test-post' })
    } as unknown as Response);

    const res = await publisher.publish(post);

    expect(res.status).toBe('published');
    expect(res.externalId).toBe('tab-123');
    expect(res.url).toBe('https://www.tabnews.com.br/devuser/tabnews-test-post');
    expect(global.fetch).toHaveBeenCalledWith(
      'https://www.tabnews.com.br/api/v1/contents',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Cookie: 'session_id=test-session-cookie-123'
        })
      })
    );

    if (originalSession) {
      process.env.TABNEWS_SESSION_ID = originalSession;
    } else {
      delete process.env.TABNEWS_SESSION_ID;
    }
  });
});
