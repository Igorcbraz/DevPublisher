import {
  Publisher,
  BlogPost,
  PlatformResult,
  ValidationResult,
  PublisherOptions
} from '@devpublisher/core';

export class MediumPublisher implements Publisher {
  readonly platformId = 'medium';
  readonly platformName = 'Medium';

  async validate(post: BlogPost): Promise<ValidationResult> {
    const issues = [];
    if (!post.title) {
      issues.push({ field: 'title', message: 'Medium requires a title', severity: 'error' as const });
    }
    if (!post.content) {
      issues.push({ field: 'content', message: 'Medium requires article content', severity: 'error' as const });
    }

    return {
      valid: issues.filter((i) => i.severity === 'error').length === 0,
      filePath: post.filePath,
      issues
    };
  }

  async publish(post: BlogPost, _options?: PublisherOptions): Promise<PlatformResult> {
    try {
      const fs = await import('fs');
      const path = await import('path');
      
      const outDir = path.resolve(process.cwd(), '.devpublisher', 'medium-export');
      if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
      }

      const fileName = path.basename(post.filePath);
      const outPath = path.join(outDir, fileName);
      
      let contentToExport = post.content;
      if (post.frontmatter.canonical) {
        contentToExport += `\n\n*Originally published at [${post.frontmatter.canonical}](${post.frontmatter.canonical}).*`;
      }

      fs.writeFileSync(outPath, contentToExport, 'utf-8');

      return {
        platformId: this.platformId,
        platformName: this.platformName,
        status: 'published',
        externalId: outPath,
        url: `file://${outPath}`,
        message: `Arquivo exportado para ${outPath} (pronto para copiar e colar no Medium)`
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
      message: 'Medium API does not support updating posts programmatically'
    };
  }

  async delete(_externalId: string, _options?: PublisherOptions): Promise<PlatformResult> {
    return {
      platformId: this.platformId,
      platformName: this.platformName,
      status: 'failed',
      message: 'Medium API does not support deleting posts programmatically'
    };
  }
}
