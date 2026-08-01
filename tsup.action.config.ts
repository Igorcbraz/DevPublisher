import { defineConfig } from 'tsup';
import { writeFile } from 'node:fs/promises';

export default defineConfig({
  entry: ['packages/cli/src/index.ts'],
  format: ['cjs'],
  target: 'node20',
  outDir: 'dist',
  outExtension: () => ({ js: '.js' }),
  clean: true,
  sourcemap: false,
  dts: false,
  noExternal: [/.*/],
  onSuccess: async () => {
    await writeFile('dist/package.json', '{"type":"commonjs"}\n');
  }
});
