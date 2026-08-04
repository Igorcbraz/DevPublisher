import {
  BlogPost,
  PlatformConfig,
  PlatformResult,
  Publisher,
  PublisherOptions,
  ValidationIssue,
  ValidationResult
} from '@devpublisher/core';

const HASHNODE_ENDPOINT = 'https://gql.hashnode.com';

const PUBLISH_POST_MUTATION = `
  mutation PublishPost($input: PublishPostInput!) {
    publishPost(input: $input) {
      post {
        id
        url
      }
    }
  }
`;

const UPDATE_POST_MUTATION = `
  mutation UpdatePost($input: UpdatePostInput!) {
    updatePost(input: $input) {
      post {
        id
        url
      }
    }
  }
`;

interface HashnodePost {
  id: string;
  url: string;
}

interface HashnodeGraphqlResponse {
  data?: {
    publishPost?: { post?: HashnodePost };
    updatePost?: { post?: HashnodePost };
  };
  errors?: Array<{ message?: string }>;
}

interface HashnodePostInput {
  title: string;
  contentMarkdown: string;
  tags: Array<{ name: string; slug: string }>;
  slug: string;
  subtitle?: string;
  originalArticleURL?: string;
  coverImageOptions?: { coverImageURL: string };
}

export class HashnodePublisher implements Publisher {
  readonly platformId = 'hashnode';
  readonly platformName = 'Hashnode';

  constructor(private readonly config?: PlatformConfig) {}

  async validate(post: BlogPost): Promise<ValidationResult> {
    const issues: ValidationIssue[] = [];

    if (!post.title) {
      issues.push({ field: 'title', message: 'Hashnode requires a title', severity: 'error' });
    }
    if (!post.content.trim()) {
      issues.push({
        field: 'content',
        message: 'Hashnode requires article content',
        severity: 'error'
      });
    }
    if (post.frontmatter.tags.length === 0) {
      issues.push({
        field: 'tags',
        message: 'Hashnode requires at least one tag',
        severity: 'error'
      });
    }
    if (!this.getToken()) {
      issues.push({ field: 'token', message: 'HASHNODE_TOKEN is required', severity: 'error' });
    }
    if (!this.getPublicationId()) {
      issues.push({
        field: 'publicationId',
        message: 'HASHNODE_PUBLICATION_ID is required',
        severity: 'error'
      });
    }

    return {
      valid: issues.every((issue) => issue.severity !== 'error'),
      filePath: post.filePath,
      issues
    };
  }

  async publish(post: BlogPost, options?: PublisherOptions): Promise<PlatformResult> {
    const token = this.getToken(options);
    const publicationId = this.getPublicationId(options);
    const configurationError = this.getConfigurationError(token, publicationId);
    if (configurationError) return this.failedResult(configurationError);

    try {
      const response = await this.executeMutation(
        'publishPost',
        PUBLISH_POST_MUTATION,
        {
          input: {
            publicationId,
            ...this.createPostInput(post)
          }
        },
        token!
      );
      const publishedPost = response.data?.publishPost?.post;
      if (!publishedPost) return this.failedResult('Hashnode did not return the published post');

      return {
        platformId: this.platformId,
        platformName: this.platformName,
        status: 'published',
        externalId: publishedPost.id,
        url: publishedPost.url,
        message: 'Successfully published to Hashnode'
      };
    } catch (error) {
      return this.failedResult(this.errorMessage(error));
    }
  }

  async update(
    post: BlogPost,
    externalId: string,
    options?: PublisherOptions
  ): Promise<PlatformResult> {
    const token = this.getToken(options);
    const publicationId = this.getPublicationId(options);
    const configurationError = this.getConfigurationError(token, publicationId);
    if (configurationError) return this.failedResult(configurationError);

    try {
      const response = await this.executeMutation(
        'updatePost',
        UPDATE_POST_MUTATION,
        {
          input: {
            id: externalId,
            ...this.createPostInput(post)
          }
        },
        token!
      );
      const updatedPost = response.data?.updatePost?.post;
      if (!updatedPost) return this.failedResult('Hashnode did not return the updated post');

      return {
        platformId: this.platformId,
        platformName: this.platformName,
        status: 'updated',
        externalId: updatedPost.id,
        url: updatedPost.url,
        message: 'Successfully updated on Hashnode'
      };
    } catch (error) {
      return this.failedResult(this.errorMessage(error));
    }
  }

  async delete(_externalId: string, _options?: PublisherOptions): Promise<PlatformResult> {
    return this.failedResult('Hashnode deletion is not supported by this publisher');
  }

  private getToken(options?: PublisherOptions): string | undefined {
    return options?.apiKey || this.config?.apiKey || process.env.HASHNODE_TOKEN;
  }

  private getPublicationId(options?: PublisherOptions): string | undefined {
    return (
      options?.config?.publicationId ||
      this.config?.publicationId ||
      process.env.HASHNODE_PUBLICATION_ID
    );
  }

  private getConfigurationError(token?: string, publicationId?: string): string | undefined {
    if (!token) return 'Hashnode token is missing. Set HASHNODE_TOKEN.';
    if (!publicationId) return 'Hashnode publication ID is missing. Set HASHNODE_PUBLICATION_ID.';
    return undefined;
  }

  private createPostInput(post: BlogPost): HashnodePostInput {
    const input: HashnodePostInput = {
      title: post.title,
      contentMarkdown: post.content,
      slug: post.slug,
      tags: post.frontmatter.tags.map((tag) => ({ name: tag, slug: this.toTagSlug(tag) }))
    };

    if (post.frontmatter.description) input.subtitle = post.frontmatter.description;
    if (post.frontmatter.canonical) input.originalArticleURL = post.frontmatter.canonical;
    if (post.frontmatter.cover) input.coverImageOptions = { coverImageURL: post.frontmatter.cover };

    return input;
  }

  private async executeMutation(
    operation: string,
    query: string,
    variables: Record<string, unknown>,
    token: string
  ): Promise<HashnodeGraphqlResponse> {
    const response = await fetch(HASHNODE_ENDPOINT, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: token
      },
      body: JSON.stringify({ operationName: operation, query, variables })
    });

    if (!response.ok) {
      throw new Error(`Hashnode API returned status ${response.status}: ${await response.text()}`);
    }

    const payload = (await response.json()) as HashnodeGraphqlResponse;
    if (payload.errors?.length) {
      throw new Error(
        payload.errors.map((error) => error.message || 'Unknown GraphQL error').join('; ')
      );
    }

    return payload;
  }

  private toTagSlug(tag: string): string {
    return tag
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private failedResult(message: string): PlatformResult {
    return {
      platformId: this.platformId,
      platformName: this.platformName,
      status: 'failed',
      message
    };
  }

  private errorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
  }
}
