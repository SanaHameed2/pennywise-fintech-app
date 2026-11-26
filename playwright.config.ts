import { defineConfig, devices } from '@playwright/test';

// The E2E suite runs against a production build served by `vite preview`, with the Supabase backend faked
// at the network level (tests/e2e/support/mockSupabase.ts): no secrets, no shared state, deterministic.
const PORT = 4173;
const executablePath = process.env.CHROMIUM_PATH;           // optional: use a pre-installed Chromium
const extraArgs = (process.env.CHROMIUM_ARGS ?? '').split(' ').filter(Boolean);

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    trace: 'on-first-retry',
    reducedMotion: 'reduce',
    serviceWorkers: 'block',     // the PWA spec re-enables them; elsewhere they would bypass page.route() mocks
  },
  webServer: {
    command: `npm run build && npm run preview -- --port ${PORT} --strictPort --host 127.0.0.1`,
    url: `http://127.0.0.1:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 180 * 1000,
    env: { VITE_SUPABASE_URL: 'https://qa.supabase.co', VITE_SUPABASE_ANON_KEY: 'qa-anon-key' },
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'], launchOptions: { executablePath, args: extraArgs } } },
  ],
});
