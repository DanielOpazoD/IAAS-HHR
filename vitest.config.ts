import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/__tests__/setup.ts'],
    exclude: ['e2e/**', 'node_modules/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary'],
      include: ['src/utils/**', 'src/hooks/**'],
      exclude: ['src/**/*.test.ts', 'src/__tests__/**'],
      thresholds: {
        // Utility functions should have high coverage
        'src/utils/**': {
          statements: 80,
          branches: 70,
          functions: 80,
        },
      },
    },
  },
})
