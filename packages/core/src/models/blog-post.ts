import { Frontmatter, FrontmatterInput, FrontmatterSchema } from './frontmatter.js';

export interface BlogPostOptions {
  filePath: string;
  frontmatter: FrontmatterInput | Frontmatter;
  content: string;
  rawContent: string;
  checksum?: string;
}

export class BlogPost {
  readonly filePath: string;
  readonly frontmatter: Frontmatter;
  readonly content: string;
  readonly rawContent: string;
  readonly checksum: string;

  constructor(options: BlogPostOptions) {
    this.filePath = options.filePath;
    this.frontmatter = FrontmatterSchema.parse(options.frontmatter);
    this.content = options.content;
    this.rawContent = options.rawContent;
    this.checksum = options.checksum ?? this.calculateChecksum(options.rawContent);
  }

  get title(): string {
    return this.frontmatter.title;
  }

  get slug(): string {
    if (this.frontmatter.slug) {
      return this.frontmatter.slug;
    }
    // Fallback slug generation from title
    return this.frontmatter.title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');
  }

  get isPublished(): boolean {
    return this.frontmatter.published ?? false;
  }

  private calculateChecksum(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return Math.abs(hash).toString(16);
  }
}
