import {
  Publisher,
  BlogPost,
  PlatformResult,
  ValidationResult,
  PublisherOptions,
  PlatformConfig
} from '@devpublisher/core';

export class DevtoPublisher implements Publisher {
  readonly platformId = 'devto';
  readonly platformName = 'Dev.to';
  private config?: PlatformConfig;

  constructor(config?: PlatformConfig) {
    this.config = config;
  }

  async validate(post: BlogPost): Promise<ValidationResult> {
    const issues = [];
    if (!post.title) {
      issues.push({ field: 'title', message: 'Dev.to requires a title', severity: 'error' as const });
    }
    if (!post.content) {
      issues.push({ field: 'content', message: 'Dev.to requires article content', severity: 'error' as const });
    }
    if (post.frontmatter.tags && post.frontmatter.tags.length > 4) {
      issues.push({
        field: 'tags',
        message: 'Dev.to supports a maximum of 4 tags',
        severity: 'warning' as const
      });
    }

    return {
      valid: issues.filter((i) => i.severity === 'error').length === 0,
      filePath: post.filePath,
      issues
    };
  }

  async publish(post: BlogPost, options?: PublisherOptions): Promise<PlatformResult> {
    const apiKey = options?.apiKey || (this.config?.apiKey as string) || process.env.DEVTO_API_KEY;

    if (!apiKey) {
      return {
        platformId: this.platformId,
        platformName: this.platformName,
        status: 'failed',
        message: 'Dev.to API key is missing. Set DEVTO_API_KEY environment variable or config apiKey.'
      };
    }

    const payload = {
      article: {
        title: post.title,
        published: post.isPublished,
        body_markdown: post.content,
        tags: post.frontmatter.tags ? post.frontmatter.tags.slice(0, 4) : [],
        canonical_url: post.frontmatter.canonical,
        description: post.frontmatter.description,
        main_image: post.frontmatter.cover,
        series: post.frontmatter.series
      }
    };

    try {
      const response = await fetch('https://dev.to/api/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': apiKey
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        return {
          platformId: this.platformId,
          platformName: this.platformName,
          status: 'failed',
          message: `Dev.to API returned status ${response.status}: ${errorText}`
        };
      }

      const data = (await response.json()) as { id: number; url: string };
      return {
        platformId: this.platformId,
        platformName: this.platformName,
        status: 'published',
        externalId: String(data.id),
        url: data.url,
        message: 'Successfully published to Dev.to'
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

  async update(post: BlogPost, externalId: string, options?: PublisherOptions): Promise<PlatformResult> {
    const apiKey = options?.apiKey || (this.config?.apiKey as string) || process.env.DEVTO_API_KEY;

    if (!apiKey) {
      return {
        platformId: this.platformId,
        platformName: this.platformName,
        status: 'failed',
        message: 'Dev.to API key is missing for article update.'
      };
    }

    const payload = {
      article: {
        title: post.title,
        published: post.isPublished,
        body_markdown: post.content,
        tags: post.frontmatter.tags ? post.frontmatter.tags.slice(0, 4) : [],
        canonical_url: post.frontmatter.canonical,
        description: post.frontmatter.description,
        main_image: post.frontmatter.cover,
        series: post.frontmatter.series
      }
    };

    try {
      const response = await fetch(`https://dev.to/api/articles/${externalId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'api-key': apiKey
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        return {
          platformId: this.platformId,
          platformName: this.platformName,
          status: 'failed',
          message: `Dev.to API update failed with status ${response.status}: ${errorText}`
        };
      }

      const data = (await response.json()) as { id: number; url: string };
      return {
        platformId: this.platformId,
        platformName: this.platformName,
        status: 'updated',
        externalId: String(data.id),
        url: data.url,
        message: 'Successfully updated article on Dev.to'
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

  async delete(_externalId: string, _options?: PublisherOptions): Promise<PlatformResult> {
    return {
      platformId: this.platformId,
      platformName: this.platformName,
      status: 'failed',
      message: 'Dev.to API does not support programmatic deletion via REST API'
    };
  }
}
