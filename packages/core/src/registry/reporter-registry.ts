import { DevPublisherPlugin } from './plugin.js';
import { DevPublisherRunResult } from '../models/publish-result.js';

export interface ReporterPlugin extends DevPublisherPlugin {
  readonly type: 'reporter';
  report(result: DevPublisherRunResult): Promise<void>;
}

export class ReporterRegistry {
  private reporters = new Map<string, ReporterPlugin>();

  register(reporter: ReporterPlugin): void {
    this.reporters.set(reporter.id, reporter);
  }

  get(id: string): ReporterPlugin | undefined {
    return this.reporters.get(id);
  }

  has(id: string): boolean {
    return this.reporters.has(id);
  }

  list(): ReporterPlugin[] {
    return Array.from(this.reporters.values());
  }
}
