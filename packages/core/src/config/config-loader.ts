import * as fs from 'node:fs';
import * as path from 'node:path';
import { DevPublisherConfig, DevPublisherConfigSchema } from '../models/config.js';

export class ConfigLoader {
  static load(configPath?: string, overrides?: Partial<DevPublisherConfig>): DevPublisherConfig {
    ConfigLoader.loadEnv();
    let rawConfig: Record<string, unknown> = {};

    const targetPath = configPath || 'devpublisher.yml';
    const absolutePath = path.resolve(process.cwd(), targetPath);

    if (fs.existsSync(absolutePath)) {
      const content = fs.readFileSync(absolutePath, 'utf-8');
      if (absolutePath.endsWith('.json')) {
        rawConfig = JSON.parse(content);
      } else {
        rawConfig = ConfigLoader.parseSimpleYaml(content);
      }
    }

    const merged = {
      ...rawConfig,
      ...overrides,
      source: overrides?.source
        ? { ...(rawConfig['source'] as object), ...overrides.source }
        : rawConfig['source'] || {},
      platforms: overrides?.platforms ? overrides.platforms : rawConfig['platforms'] || {},
      pipeline: overrides?.pipeline
        ? { ...(rawConfig['pipeline'] as object), ...overrides.pipeline }
        : rawConfig['pipeline'] || {}
    };

    return DevPublisherConfigSchema.parse(merged);
  }

  static loadEnv(customPath?: string): void {
    const envPath = customPath
      ? path.resolve(process.cwd(), customPath)
      : path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf-8');
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;
        const idx = trimmed.indexOf('=');
        const key = trimmed.substring(0, idx).trim();
        const value = trimmed
          .substring(idx + 1)
          .trim()
          .replace(/^['"]|['"]$/g, '');
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    }
  }

  private static parseSimpleYaml(content: string): Record<string, unknown> {
    const result: Record<string, any> = {}; // eslint-disable-line @typescript-eslint/no-explicit-any
    let currentSection: string | null = null;
    let currentSubSection: string | null = null;

    const lines = content.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;

      const indent = line.search(/\S/);

      if (trimmed.startsWith('- ')) {
        const itemVal = ConfigLoader.parseYamlValue(trimmed.substring(2).trim());
        if (currentSection && currentSubSection) {
          if (!Array.isArray(result[currentSection][currentSubSection])) {
            result[currentSection][currentSubSection] = [];
          }
          result[currentSection][currentSubSection].push(itemVal);
        } else if (currentSection) {
          if (!Array.isArray(result[currentSection])) {
            result[currentSection] = [];
          }
          result[currentSection].push(itemVal);
        }
        continue;
      }

      if (indent === 0 && line.includes(':')) {
        const parts = line.split(':');
        const key = parts[0]!.trim();
        const val = parts.slice(1).join(':').trim();
        if (val) {
          result[key] = ConfigLoader.parseYamlValue(val);
          currentSection = null;
          currentSubSection = null;
        } else {
          currentSection = key;
          currentSubSection = null;
          if (!result[currentSection]) result[currentSection] = {};
        }
      } else if (indent === 2 && currentSection && line.includes(':')) {
        const parts = line.split(':');
        const key = parts[0]!.trim();
        const val = parts.slice(1).join(':').trim();
        if (val) {
          result[currentSection][key] = ConfigLoader.parseYamlValue(val);
          currentSubSection = null;
        } else {
          currentSubSection = key;
          if (!result[currentSection][currentSubSection]) {
            result[currentSection][currentSubSection] = {};
          }
        }
      } else if (indent === 4 && currentSection && currentSubSection && line.includes(':')) {
        const parts = line.split(':');
        const key = parts[0]!.trim();
        const val = parts.slice(1).join(':').trim();
        result[currentSection][currentSubSection][key] = ConfigLoader.parseYamlValue(val);
      }
    }

    return result;
  }

  private static parseYamlValue(val: string): unknown {
    if (val === 'true') return true;
    if (val === 'false') return false;
    let cleaned = val;
    if (
      (cleaned.startsWith('"') && cleaned.endsWith('"')) ||
      (cleaned.startsWith("'") && cleaned.endsWith("'"))
    ) {
      cleaned = cleaned.slice(1, -1);
    }
    if (cleaned.startsWith('${') && cleaned.endsWith('}')) {
      const envKey = cleaned.slice(2, -1);
      return process.env[envKey] || '';
    }
    return cleaned;
  }
}
