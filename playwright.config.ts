import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/interface', workers: 1, retries: 0,
  use: { baseURL: 'http://localhost:8081', ...devices['iPhone 13'], defaultBrowserType: 'chromium', channel: process.platform === 'win32' ? 'msedge' : undefined, screenshot: 'only-on-failure', trace: 'retain-on-failure' },
  webServer: { command: 'npm run web -- --port 8081 --host localhost', url: 'http://localhost:8081', reuseExistingServer: !process.env.CI, timeout: 180000 },
});
