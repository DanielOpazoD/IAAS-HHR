import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    // Force demo mode (no Firebase) so E2E tests don't hit auth
    command: 'VITE_FIREBASE_API_KEY="" VITE_FIREBASE_AUTH_DOMAIN="" VITE_FIREBASE_PROJECT_ID="" npm run dev -- --port 5173',
    url: 'http://localhost:5173',
    reuseExistingServer: false,
    timeout: 30_000,
  },
})
