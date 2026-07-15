import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/components/**/*.{ts,tsx}'],
      thresholds: {
        lines: 85,
        functions: 80,
        statements: 85,
        branches: 70,
      },
    },
  },
});
