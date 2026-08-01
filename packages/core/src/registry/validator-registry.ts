import { DevPublisherPlugin } from './plugin.js';
import { BlogPost } from '../models/blog-post.js';
import { ValidationResult } from '../models/publish-result.js';

export interface ValidatorPlugin extends DevPublisherPlugin {
  readonly type: 'validator';
  validate(post: BlogPost): Promise<ValidationResult>;
}

export class ValidatorRegistry {
  private validators = new Map<string, ValidatorPlugin>();

  register(validator: ValidatorPlugin): void {
    this.validators.set(validator.id, validator);
  }

  get(id: string): ValidatorPlugin | undefined {
    return this.validators.get(id);
  }

  has(id: string): boolean {
    return this.validators.has(id);
  }

  list(): ValidatorPlugin[] {
    return Array.from(this.validators.values());
  }
}
