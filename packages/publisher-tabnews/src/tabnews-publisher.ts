import {
  Publisher,
  BlogPost,
  PlatformResult,
  ValidationResult,
  PublisherOptions,
  PlatformConfig
} from '@devpublisher/core';

export class TabnewsPublisher implements Publisher {
  readonly platformId = 'tabnews';
  readonly platformName = 'TabNews';
  private config?: PlatformConfig;

  constructor(config?: PlatformConfig) {
    this.config = config;
  }

  async validate(post: BlogPost): Promise<ValidationResult> {
    const issues = [];
    if (!post.title) {
      issues.push({ field: 'title', message: 'TabNews requires a title', severity: 'error' as const });
    }
    if (!post.content) {
      issues.push({ field: 'content', message: 'TabNews requires article content', severity: 'error' as const });
    }

    return {
      valid: issues.filter((i) => i.severity === 'error').length === 0,
      filePath: post.filePath,
      issues
    };
  }

  async publish(post: BlogPost, options?: PublisherOptions): Promise<PlatformResult> {
    const sessionId = options?.apiKey || (this.config?.apiKey as string) || process.env.TABNEWS_SESSION_ID;

    if (!sessionId) {
      return {
        platformId: this.platformId,
        platformName: this.platformName,
        status: 'failed',
        message: 'TabNews session ID is missing. Set TABNEWS_SESSION_ID environment variable.'
      };
    }

    const payload = {
      title: post.title,
      body: post.content.trim(),
      status: post.isPublished ? 'published' : 'draft',
      source_url: post.frontmatter.canonical || ''
    };

    try {
      const response = await fetch('https://www.tabnews.com.br/api/v1/contents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': `session_id=${sessionId}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        return {
          platformId: this.platformId,
          platformName: this.platformName,
          status: 'failed',
          message: `TabNews API returned status ${response.status}: ${errorText}`
        };
      }

      const data = (await response.json()) as any;
      return {
        platformId: this.platformId,
        platformName: this.platformName,
        status: 'published',
        externalId: data.id,
        url: `https://www.tabnews.com.br/${data.owner_username}/${data.slug}`,
        message: 'Successfully published to TabNews'
      };
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      return {
        platformId: this.platformId,
        platformName: this.platformName,
        status: 'failed',
        error,
        message: error.message
      };
    }
  }

  async update(_post: BlogPost, _externalId: string, _options?: PublisherOptions): Promise<PlatformResult> {
    return {
      platformId: this.platformId,
      platformName: this.platformName,
      status: 'failed',
      message: 'TabNews update is not implemented yet in this plugin.'
    };
  }

  async delete(_externalId: string, _options?: PublisherOptions): Promise<PlatformResult> {
    return {
      platformId: this.platformId,
      platformName: this.platformName,
      status: 'failed',
      message: 'TabNews deletion is not implemented yet in this plugin.'
    };
  }
}
