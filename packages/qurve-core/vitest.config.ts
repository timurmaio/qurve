import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
  },
  resolve: {
    alias: {
      '@qurve/core': resolve(__dirname, './src/index.ts'),
    },
  },
});
