import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ConfigLoader } from '../config/config-loader.js';

describe('ConfigLoader with Local Environment (.env)', () => {
  let tempDir: string;
  const originalEnv = { ...process.env };

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'devpub-test-env-'));
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
    process.env = { ...originalEnv };
  });

  it('should load key-value pairs from a local .env file into process.env', () => {
    const envFile = path.join(tempDir, '.env');
    fs.writeFileSync(
      envFile,
      `
# Comment line
TEST_DEVTO_KEY=my-secret-devto-key
TEST_QUOTED_DOUBLE="quoted-value"
TEST_QUOTED_SINGLE='single-quoted-value'
TEST_WITH_EQUALS=secret=key=123
`,
      'utf-8'
    );

    ConfigLoader.loadEnv(envFile);

    expect(process.env.TEST_DEVTO_KEY).toBe('my-secret-devto-key');
    expect(process.env.TEST_QUOTED_DOUBLE).toBe('quoted-value');
    expect(process.env.TEST_QUOTED_SINGLE).toBe('single-quoted-value');
    expect(process.env.TEST_WITH_EQUALS).toBe('secret=key=123');
  });

  it('should not overwrite variables that already exist in process.env', () => {
    process.env.TEST_EXISTING_VAR = 'original-value';

    const envFile = path.join(tempDir, '.env');
    fs.writeFileSync(envFile, 'TEST_EXISTING_VAR=overwritten-attempt\n', 'utf-8');

    ConfigLoader.loadEnv(envFile);

    expect(process.env.TEST_EXISTING_VAR).toBe('original-value');
  });

  it('should interpolate environment variables in YAML config (${VAR})', () => {
    process.env.TEST_INTERPOLATE_KEY = 'interpolated-secret-123';

    const yamlFile = path.join(tempDir, 'devpublisher.yml');
    fs.writeFileSync(
      yamlFile,
      `
version: "1"
source:
  folder: "content/blog"
platforms:
  devto:
    enabled: true
    apiKey: "\${TEST_INTERPOLATE_KEY}"
`,
      'utf-8'
    );

    const config = ConfigLoader.load(yamlFile);
    expect(config.platforms['devto']?.apiKey).toBe('interpolated-secret-123');
  });

  it('should allow overriding config options programmatically', () => {
    const yamlFile = path.join(tempDir, 'devpublisher.yml');
    fs.writeFileSync(
      yamlFile,
      `
version: "1"
source:
  folder: "content/blog"
platforms:
  devto:
    enabled: true
`,
      'utf-8'
    );

    const config = ConfigLoader.load(yamlFile, {
      platforms: {
        tabnews: { enabled: true, options: {} }
      }
    });

    expect(config.platforms['devto']).toBeUndefined();
    expect(config.platforms['tabnews']?.enabled).toBe(true);
  });
});
