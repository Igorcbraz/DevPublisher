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
  esbuildOptions(options) {
    options.alias = {
      ...options.alias,
      '@devpublisher/core': './packages/core/src/index.ts',
      '@devpublisher/publisher-devto': './packages/publisher-devto/src/index.ts',
      '@devpublisher/publisher-medium': './packages/publisher-medium/src/index.ts',
      '@devpublisher/publisher-tabnews': './packages/publisher-tabnews/src/index.ts'
    };
  },
  onSuccess: async () => {
    await writeFile('dist/package.json', '{"type":"commonjs"}\n');
  }
});
