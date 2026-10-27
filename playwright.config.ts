import { defineConfig, devices } from '@playwright/test';

const baseURL = 'http://127.0.0.1:44210';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env['CI']),
  retries: process.env['CI'] ? 1 : 0,
  reporter: process.env['CI'] ? 'github' : 'list',
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium-desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'chromium-mobile', use: { ...devices['Pixel 7'] } },
  ],
  webServer: [
    {
      command: 'corepack pnpm web:serve',
      url: baseURL,
      reuseExistingServer: false,
      timeout: 120_000,
    },
    {
      command: 'corepack pnpm docs:serve',
      url: 'http://127.0.0.1:44211',
      reuseExistingServer: false,
      timeout: 120_000,
    },
  ],
});
