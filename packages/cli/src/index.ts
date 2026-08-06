import * as fs from 'node:fs';
import * as path from 'node:path';
import { Command } from 'commander';
import { DevPublisherEngine } from '@devpublisher/core';
import DevtoPublisherPlugin from '@devpublisher/publisher-devto';

import MediumPublisherPlugin from '@devpublisher/publisher-medium';
import TabnewsPublisherPlugin from '@devpublisher/publisher-tabnews';

const program = new Command();

program
  .name('devpublisher')
  .description('Open source technical content syndication CLI')
  .version('0.1.0');

function createEngine(
  target?: string,
  options?: { platforms?: string; config?: string }
): DevPublisherEngine {
  const engine = new DevPublisherEngine({ configPath: options?.config });

  // Register available publishers
  engine.use(new DevtoPublisherPlugin());

  engine.use(new MediumPublisherPlugin());
  engine.use(new TabnewsPublisherPlugin());

  if (target) {
    const isFile = fs.existsSync(target) && fs.statSync(target).isFile();
    if (isFile) {
      engine.config.source.files = [path.resolve(process.cwd(), target)];
    } else {
      engine.config.source.folder = path.resolve(process.cwd(), target);
    }
  }

  if (options?.platforms) {
    const platformList = options.platforms.split(',').map((p) => p.trim());
    for (const p of platformList) {
      if (!engine.config.platforms[p]) {
        engine.config.platforms[p] = { enabled: true, options: {} };
      } else {
        engine.config.platforms[p]!.enabled = true;
      }
    }
  } else if (Object.keys(engine.config.platforms).length === 0) {
    // Default to devto if no platform explicitly configured
    engine.config.platforms['devto'] = { enabled: true, options: {} };
  }

  return engine;
}

program
  .command('publish')
  .argument('[target]', 'Markdown file or directory to publish', 'content/blog')
  .option('-p, --platforms <platforms>', 'Comma-separated target platforms (e.g., devto,medium)')
  .option('-c, --config <config>', 'Path to devpublisher.yml config file')
  .description('Publish markdown articles to configured platforms')
  .action(async (target: string, options: { platforms?: string; config?: string }) => {
    try {
      const engine = createEngine(target, options);
      const result = await engine.run();

      if (process.env.GITHUB_ACTIONS === 'true') {
        const outDir = path.resolve(process.cwd(), '.devpublisher', 'medium-export');
        if (fs.existsSync(outDir)) {
          try {
            const artifact = await import('@actions/artifact');
            const core = await import('@actions/core');
            const artifactClient = new artifact.DefaultArtifactClient();
            const files = fs.readdirSync(outDir).map((file) => path.join(outDir, file));
            const { id, size } = await artifactClient.uploadArtifact(
              'medium-exports',
              files,
              outDir,
              { retentionDays: 7 }
            );
            core.info(
              `Successfully uploaded medium-exports artifact (ID: ${id}, size: ${size} bytes)`
            );
          } catch (e: unknown) {
            const errMessage = e instanceof Error ? e.message : String(e);
            console.error('Failed to upload medium-exports artifact:', errMessage);
          }
        }
      }

      if (result.failedArticles > 0) {
        process.exit(1);
      }
    } catch (err: unknown) {
      const errMessage = err instanceof Error ? err.message : String(err);
      console.error('❌ Publication error:', errMessage);
      process.exit(1);
    }
  });

program
  .command('validate')
  .argument('[target]', 'Markdown file or directory to validate', 'content/blog')
  .option('-c, --config <config>', 'Path to devpublisher.yml config file')
  .description('Validate frontmatter and syntax of markdown articles')
  .action(async (target: string, options: { config?: string }) => {
    try {
      const engine = createEngine(target, options);
      const results = await engine.validate();
      let hasError = false;

      console.log('\n🔍 Validation Results:\n');
      for (const res of results) {
        const icon = res.valid ? '✅' : '❌';
        console.log(`${icon} ${res.filePath}`);
        for (const issue of res.issues) {
          console.log(
            `   [${issue.severity.toUpperCase()}] ${issue.field ? `${issue.field}: ` : ''}${issue.message}`
          );
        }
        if (!res.valid) hasError = true;
      }
      console.log('');

      if (hasError) process.exit(1);
    } catch (err: unknown) {
      const errMessage = err instanceof Error ? err.message : String(err);
      console.error('❌ Validation error:', errMessage);
      process.exit(1);
    }
  });

program
  .command('list')
  .description('List all registered plugins and publisher platforms')
  .action(() => {
    const engine = createEngine();
    const plugins = engine.listPlugins();

    console.log('\n🔌 Registered DevPublisher Plugins:\n');
    for (const plugin of plugins) {
      console.log(
        `- [${plugin.type.toUpperCase()}] ${plugin.name} (id: ${plugin.id}, v${plugin.version})`
      );
      if (plugin.description) {
        console.log(`  ${plugin.description}`);
      }
    }
    console.log('');
  });

program
  .command('doctor')
  .description('Check system health, environment variables, and plugin configuration')
  .action(() => {
    const engine = createEngine();
    console.log('\n🩺 DevPublisher Health Check:\n');
    console.log(`Node Version:        ${process.version}`);
    console.log(`Working Directory:   ${process.cwd()}`);

    const hasDevtoKey = !!(process.env.DEVTO_API_KEY || engine.config.platforms['devto']?.apiKey);
    const hasTabnewsKey = !!(
      process.env.TABNEWS_SESSION_ID || engine.config.platforms['tabnews']?.apiKey
    );

    console.log(
      `DEVTO_API_KEY:       ${hasDevtoKey ? '✅ Set (loaded from .env or environment)' : '⚠️ Missing (Set DEVTO_API_KEY in .env for Dev.to)'}`
    );
    console.log(
      `TABNEWS_SESSION_ID:  ${hasTabnewsKey ? '✅ Set (loaded from .env or environment)' : '⚪ Optional (Set TABNEWS_SESSION_ID in .env for TabNews)'}`
    );

    console.log(`Registered Plugins:  ${engine.listPlugins().length} active`);
    console.log('\nStatus: Ready for publishing 🚀\n');
  });

program
  .command('init')
  .description('Create sample configuration and .env files')
  .action(() => {
    const configPath = path.resolve(process.cwd(), 'devpublisher.yml');
    const envExamplePath = path.resolve(process.cwd(), '.env.example');

    if (!fs.existsSync(configPath)) {
      const sampleYaml = `# DevPublisher Configuration File
version: "1"

source:
  folder: "content/blog"
  match: "**/*.md"

platforms:
  devto:
    enabled: true
  tabnews:
    enabled: false
  medium:
    enabled: false

pipeline:
  validators:
    - frontmatter
  transformers:
    - canonical-url
  tracking:
    provider: "file"
    file: ".devpublisher/state.json"
`;
      fs.writeFileSync(configPath, sampleYaml, 'utf-8');
      console.log('✅ Created devpublisher.yml');
    } else {
      console.log('ℹ️  devpublisher.yml already exists');
    }

    if (!fs.existsSync(envExamplePath)) {
      const sampleEnv = `# DevPublisher - Environment Variables
# Copy this file to .env and set your credentials (never commit .env!):
# cp .env.example .env

DEVTO_API_KEY=your_devto_api_key_here
TABNEWS_SESSION_ID=your_tabnews_session_id_here
`;
      fs.writeFileSync(envExamplePath, sampleEnv, 'utf-8');
      console.log('✅ Created .env.example');
    }

    console.log(
      '\n🔒 Safe credential setup: Put your API keys only in .env (already in .gitignore).\n'
    );
  });

function getActionArguments(): string[] {
  const file = process.env.INPUT_FILE?.trim();
  const folder = process.env.INPUT_FOLDER?.trim();
  const platforms = process.env.INPUT_PLATFORMS?.trim();
  const config = process.env.INPUT_CONFIG?.trim();
  const args = ['node', 'devpublisher', 'publish', file || folder || 'content/blog'];
  if (platforms) args.push('--platforms', platforms);
  if (config) args.push('--config', config);

  return args;
}

program.parse(process.env.GITHUB_ACTIONS === 'true' ? getActionArguments() : process.argv);
