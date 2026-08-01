export type PlatformStatus = 'published' | 'updated' | 'skipped' | 'failed';

export interface PlatformResult {
  platformId: string;
  platformName: string;
  status: PlatformStatus;
  externalId?: string;
  url?: string;
  message?: string;
  error?: Error;
  publishedAt?: string;
}

export interface ArticlePublishResult {
  filePath: string;
  slug: string;
  title: string;
  platformResults: PlatformResult[];
  success: boolean;
}

export interface ValidationIssue {
  field?: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationResult {
  valid: boolean;
  filePath: string;
  issues: ValidationIssue[];
}

export interface DevPublisherRunResult {
  runId: string;
  totalArticles: number;
  successfulArticles: number;
  failedArticles: number;
  results: ArticlePublishResult[];
  validationResults: ValidationResult[];
}
