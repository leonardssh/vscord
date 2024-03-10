import { defineConfig } from 'tsup';

const { NODE_ENV } = process.env;

const isProduction = NODE_ENV === 'production';

export default defineConfig({
  entry: ['src/extension.ts'],
  external: ['vscode'],
  format: 'cjs',
  target: 'node18',
  sourcemap: !isProduction ? 'inline' : false,
  minify: isProduction,
  clean: true
});
