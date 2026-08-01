import * as fs from 'node:fs';
import * as path from 'node:path';

export interface CacheProvider {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlMs?: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
}

export class MemoryCacheProvider implements CacheProvider {
  private store = new Map<string, { value: unknown; expiresAt?: number }>();

  async get<T>(key: string): Promise<T | null> {
    const item = this.store.get(key);
    if (!item) return null;
    if (item.expiresAt && item.expiresAt < Date.now()) {
      this.store.delete(key);
      return null;
    }
    return item.value as T;
  }

  async set<T>(key: string, value: T, ttlMs?: number): Promise<void> {
    const item: { value: unknown; expiresAt?: number } = { value };
    if (ttlMs !== undefined) {
      item.expiresAt = Date.now() + ttlMs;
    }
    this.store.set(key, item);
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key);
  }

  async clear(): Promise<void> {
    this.store.clear();
  }
}

export class FileCacheProvider implements CacheProvider {
  private filePath: string;
  private memoryCache = new MemoryCacheProvider();

  constructor(filePath = '.devpublisher/cache.json') {
    this.filePath = filePath;
    this.loadFromFile();
  }

  private loadFromFile(): void {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        const data = JSON.parse(raw);
        for (const [k, v] of Object.entries(data)) {
          this.memoryCache.set(k, v);
        }
      }
    } catch {
      // Ignore cache file load errors
    }
  }

  private saveToFile(): void {
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      // Note: simple sync write for file cache
    } catch {
      // Ignore cache save errors
    }
  }

  async get<T>(key: string): Promise<T | null> {
    return this.memoryCache.get<T>(key);
  }

  async set<T>(key: string, value: T, ttlMs?: number): Promise<void> {
    await this.memoryCache.set(key, value, ttlMs);
    this.saveToFile();
  }

  async delete(key: string): Promise<void> {
    await this.memoryCache.delete(key);
    this.saveToFile();
  }

  async clear(): Promise<void> {
    await this.memoryCache.clear();
    this.saveToFile();
  }
}
