import * as fs from 'node:fs';
import * as path from 'node:path';

export interface PlatformPublishState {
  externalId: string;
  url: string;
  checksum: string;
  publishedAt: string;
  updatedAt: string;
}

export interface ArticleState {
  slug: string;
  checksum: string;
  platforms: Record<string, PlatformPublishState>;
}

export interface TrackingState {
  version: string;
  articles: Record<string, ArticleState>;
}

export interface TrackingProvider {
  getArticleState(slug: string): Promise<ArticleState | null>;
  setPlatformState(
    slug: string,
    checksum: string,
    platformId: string,
    state: Omit<PlatformPublishState, 'checksum'>
  ): Promise<void>;
  getAllStates(): Promise<Record<string, ArticleState>>;
}

export class FileTrackingProvider implements TrackingProvider {
  private filePath: string;
  private state: TrackingState;

  constructor(filePath = '.devpublisher/state.json') {
    this.filePath = filePath;
    this.state = this.loadState();
  }

  private loadState(): TrackingState {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        return JSON.parse(raw) as TrackingState;
      }
    } catch {
      // Return fresh state on read error
    }
    return { version: '1', articles: {} };
  }

  private saveState(): void {
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.filePath, JSON.stringify(this.state, null, 2), 'utf-8');
    } catch (err) {
      console.error(`Failed to save state file at ${this.filePath}:`, err);
    }
  }

  async getArticleState(slug: string): Promise<ArticleState | null> {
    return this.state.articles[slug] ?? null;
  }

  async setPlatformState(
    slug: string,
    checksum: string,
    platformId: string,
    platformState: Omit<PlatformPublishState, 'checksum'>
  ): Promise<void> {
    if (!this.state.articles[slug]) {
      this.state.articles[slug] = {
        slug,
        checksum,
        platforms: {}
      };
    }

    const article = this.state.articles[slug]!;
    article.checksum = checksum;
    article.platforms[platformId] = {
      ...platformState,
      checksum
    };

    this.saveState();
  }

  async getAllStates(): Promise<Record<string, ArticleState>> {
    return { ...this.state.articles };
  }
}

export class MemoryTrackingProvider implements TrackingProvider {
  private state: TrackingState = { version: '1', articles: {} };

  async getArticleState(slug: string): Promise<ArticleState | null> {
    return this.state.articles[slug] ?? null;
  }

  async setPlatformState(
    slug: string,
    checksum: string,
    platformId: string,
    platformState: Omit<PlatformPublishState, 'checksum'>
  ): Promise<void> {
    if (!this.state.articles[slug]) {
      this.state.articles[slug] = {
        slug,
        checksum,
        platforms: {}
      };
    }

    const article = this.state.articles[slug]!;
    article.checksum = checksum;
    article.platforms[platformId] = {
      ...platformState,
      checksum
    };
  }

  async getAllStates(): Promise<Record<string, ArticleState>> {
    return { ...this.state.articles };
  }
}
