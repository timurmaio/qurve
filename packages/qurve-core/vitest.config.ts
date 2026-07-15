import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.test.ts',
        'src/index.ts',
        'src/types.ts',
        'src/core/mockCanvas.ts',
      ],
      // Core is the portable contract — keep thresholds high and enforced in CI.
      thresholds: {
        lines: 96,
        functions: 99,
        statements: 96,
        branches: 88,
      },
    },
  },
});
