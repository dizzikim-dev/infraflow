import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./src/__tests__/setup.ts'],
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    // Test timeout
    testTimeout: 10000,
    hookTimeout: 10000,
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      // Coverage thresholds - Phase 1 target: 60%
      thresholds: {
        global: {
          statements: 60,
          branches: 50,
          functions: 60,
          lines: 60,
        },
      },
      // Files to include in coverage
      include: [
        'src/lib/**/*.ts',
        'src/hooks/**/*.ts',
        'src/components/**/*.tsx',
        'src/app/api/**/*.ts',
      ],
      // Files to exclude from coverage
      exclude: [
        'node_modules/',
        'src/__tests__/**',
        'src/generated/**',
        'src/types/**',
        '**/*.d.ts',
        '**/index.ts',
        'src/app/layout.tsx',
        'src/app/page.tsx',
        'src/components/providers/**',
      ],
    },
    // Vitest 4: isolate tests for better reliability
    isolate: true,
    fileParallelism: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
