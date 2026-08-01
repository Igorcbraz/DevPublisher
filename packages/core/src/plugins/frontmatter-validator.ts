import { ValidatorPlugin } from '../registry/validator-registry.js';
import { BlogPost } from '../models/blog-post.js';
import { FrontmatterSchema } from '../models/frontmatter.js';
import { ValidationResult, ValidationIssue } from '../models/publish-result.js';

export class FrontmatterValidatorPlugin implements ValidatorPlugin {
  readonly id = 'frontmatter';
  readonly name = 'Frontmatter Validator';
  readonly version = '1.0.0';
  readonly type = 'validator';
  readonly description = 'Validates article frontmatter against domain schema';

  async validate(post: BlogPost): Promise<ValidationResult> {
    const parseResult = FrontmatterSchema.safeParse(post.frontmatter);
    const issues: ValidationIssue[] = [];

    if (!parseResult.success) {
      for (const err of parseResult.error.issues) {
        issues.push({
          field: err.path.join('.'),
          message: err.message,
          severity: 'error'
        });
      }
    }

    if (!post.content || post.content.trim().length === 0) {
      issues.push({
        field: 'content',
        message: 'Article markdown content body is empty',
        severity: 'warning'
      });
    }

    return {
      valid: issues.filter((i) => i.severity === 'error').length === 0,
      filePath: post.filePath,
      issues
    };
  }
}
