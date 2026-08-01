import { describe, it, expect } from 'vitest';
import { BlogPost } from '../models/blog-post.js';

describe('BlogPost Domain Model', () => {
  it('should parse title and generate automatic slug fallback', () => {
    const post = new BlogPost({
      filePath: 'test/path.md',
      frontmatter: { title: 'My Awesome Technical Post!' },
      content: '# Body content',
      rawContent: '---\ntitle: "My Awesome Technical Post!"\n---\n# Body content'
    });

    expect(post.title).toBe('My Awesome Technical Post!');
    expect(post.slug).toBe('my-awesome-technical-post');
    expect(post.isPublished).toBe(false);
    expect(post.checksum).toBeDefined();
  });

  it('should respect custom slug and published status from frontmatter', () => {
    const post = new BlogPost({
      filePath: 'test/path.md',
      frontmatter: {
        title: 'Custom Slug Article',
        slug: 'my-custom-slug',
        published: true
      },
      content: 'Body',
      rawContent: 'raw'
    });

    expect(post.slug).toBe('my-custom-slug');
    expect(post.isPublished).toBe(true);
  });
});
