/**
 * Playwright config for the admin panel's headless checks.
 *
 * Points at the running tutor dev server rather than starting its own — the MFE
 * needs Studio and the LMS alongside it, so spawning an isolated server would
 * test a page that cannot reach its API.
 */
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  timeout: 60_000,
  expect: { timeout: 15_000 },
  // Serial: these all hit one shared dev environment.
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL: process.env.RWAQ_BASE_URL ?? 'http://apps.local.openedx.io:2011',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    ...devices['Desktop Chrome'],
  },
});
