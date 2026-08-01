import * as fs from 'node:fs';
import * as path from 'node:path';
import { DevPublisherConfig, DevPublisherConfigSchema } from '../models/config.js';

export class ConfigLoader {
  static load(configPath?: string, overrides?: Partial<DevPublisherConfig>): DevPublisherConfig {
    let rawConfig: Record<string, unknown> = {};

    const targetPath = configPath || 'devpublisher.yml';
    const absolutePath = path.resolve(process.cwd(), targetPath);

    if (fs.existsSync(absolutePath)) {
      const content = fs.readFileSync(absolutePath, 'utf-8');
      if (absolutePath.endsWith('.json')) {
        rawConfig = JSON.parse(content);
      } else {
        // Basic YAML loader without heavy third party deps if simple, or parse basic lines
        rawConfig = ConfigLoader.parseSimpleYaml(content);
      }
    }

    const merged = {
      ...rawConfig,
      ...overrides,
      source: {
        ...(rawConfig['source'] as object),
        ...(overrides?.source as object)
      },
      platforms: {
        ...(rawConfig['platforms'] as object),
        ...(overrides?.platforms as object)
      },
      pipeline: {
        ...(rawConfig['pipeline'] as object),
        ...(overrides?.pipeline as object)
      }
    };

    return DevPublisherConfigSchema.parse(merged);
  }

  private static parseSimpleYaml(content: string): Record<string, unknown> {
    // Basic key-value parser for simple yml files without extra dependencies
    const result: Record<string, any> = {};
    let currentSection: string | null = null;
    let currentSubSection: string | null = null;

    const lines = content.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;

      const indent = line.search(/\S/);

      if (indent === 0 && line.includes(':')) {
        const [key] = line.split(':');
        currentSection = key!.trim();
        currentSubSection = null;
        if (!result[currentSection]) result[currentSection] = {};
      } else if (indent === 2 && currentSection && line.includes(':')) {
        const parts = line.split(':');
        const key = parts[0]!.trim();
        const val = parts.slice(1).join(':').trim();
        if (val) {
          result[currentSection][key] = ConfigLoader.parseYamlValue(val);
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
    if (val.startsWith('"') && val.endsWith('"')) return val.slice(1, -1);
    if (val.startsWith("'") && val.endsWith("'")) return val.slice(1, -1);
    // Environment variable interpolation (${ENV_VAR})
    if (val.startsWith('${') && val.endsWith('}')) {
      const envKey = val.slice(2, -1);
      return process.env[envKey] || '';
    }
    return val;
  }
}
