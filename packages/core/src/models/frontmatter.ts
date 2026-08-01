import { z } from 'zod';

export const FrontmatterSchema = z.object({
  title: z.string({ required_error: 'Article title is required' }).min(1, 'Title cannot be empty'),
  description: z.string().optional().default(''),
  slug: z.string().min(1, 'Slug cannot be empty').optional(),
  canonical: z.string().url('Canonical URL must be a valid URL').optional(),
  tags: z.array(z.string()).optional().default([]),
  published: z.boolean().optional().default(false),
  cover: z.string().optional(),
  series: z.string().optional()
}).passthrough();

export type Frontmatter = z.infer<typeof FrontmatterSchema>;
