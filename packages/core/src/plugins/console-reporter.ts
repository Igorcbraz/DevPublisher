import { ReporterPlugin } from '../registry/reporter-registry.js';
import { DevPublisherRunResult } from '../models/publish-result.js';

export class ConsoleReporterPlugin implements ReporterPlugin {
  readonly id = 'console-reporter';
  readonly name = 'Console Reporter';
  readonly version = '1.0.0';
  readonly type = 'reporter';
  readonly description = 'Formats and outputs execution summary to console';

  async report(result: DevPublisherRunResult): Promise<void> {
    console.log('\n==================================================');
    console.log('            DEVPUBLISHER RUN SUMMARY             ');
    console.log('==================================================');
    console.log(`Run ID:               ${result.runId}`);
    console.log(`Total Articles:       ${result.totalArticles}`);
    console.log(`Successful:           ${result.successfulArticles}`);
    console.log(`Failed:               ${result.failedArticles}`);
    console.log('--------------------------------------------------');

    for (const articleRes of result.results) {
      console.log(`\n📄 Article: ${articleRes.title} (${articleRes.slug})`);
      console.log(`   File: ${articleRes.filePath}`);
      for (const pRes of articleRes.platformResults) {
        const icon =
          pRes.status === 'published' || pRes.status === 'updated'
            ? '✅'
            : pRes.status === 'skipped'
              ? '⏭️'
              : '❌';
        console.log(`   ${icon} [${pRes.platformName}] ${pRes.status.toUpperCase()}`);
        if (pRes.url) console.log(`      URL: ${pRes.url}`);
        if (pRes.message) console.log(`      Message: ${pRes.message}`);
        if (pRes.error) console.log(`      Error: ${pRes.error.message}`);
      }
    }
    console.log('==================================================\n');
  }
}
