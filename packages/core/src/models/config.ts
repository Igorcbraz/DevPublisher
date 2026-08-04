import { z } from 'zod';

export const PlatformConfigSchema = z.object({
  enabled: z.boolean().default(true),
  apiKey: z.string().optional(),
  publicationId: z.string().optional(),
  options: z.record(z.unknown()).optional().default({})
});

export type PlatformConfig = z.infer<typeof PlatformConfigSchema>;

export const SourceConfigSchema = z.object({
  folder: z.string().default('content/blog'),
  match: z.string().default('**/*.md'),
  files: z.array(z.string()).optional()
});

export type SourceConfig = z.infer<typeof SourceConfigSchema>;

export const TrackingConfigSchema = z.object({
  provider: z.enum(['file', 'memory']).default('file'),
  file: z.string().default('.devpublisher/state.json')
});

export type TrackingConfig = z.infer<typeof TrackingConfigSchema>;

export const PipelineConfigSchema = z.object({
  validators: z.array(z.string()).default(['frontmatter']),
  transformers: z.array(z.string()).default(['canonical-url']),
  tracking: TrackingConfigSchema.default({})
});

export type PipelineConfig = z.infer<typeof PipelineConfigSchema>;

export const DevPublisherConfigSchema = z.object({
  version: z.string().default('1'),
  source: SourceConfigSchema.default({}),
  platforms: z.record(PlatformConfigSchema).default({}),
  pipeline: PipelineConfigSchema.default({})
});

export type DevPublisherConfig = z.infer<typeof DevPublisherConfigSchema>;
