/**
 * Dashboard smoke tests — minimal critical-path checks for the admin panel.
 *
 * Scope: confirm that the page loads, the KPI row renders data, the refresh
 * button is present and operable, and no console errors fire on first paint.
 * More detailed scenario coverage (pagination, nav stability, scroll) lives in
 * dashboard.spec.ts; this suite is intentionally narrow so it can run quickly
 * as a first-pass gate.
 *
 * Authentication: identical to dashboard.spec.ts — JWT injected as cookies so
 * the login flow (a separate MFE) is not under test here.
 *
 * Run with:
 *   RWAQ_JWT=<token> npx playwright test e2e/dashboard.smoke.spec.ts \
 *     --config=e2e/playwright.config.ts
 */
import { test, expect, type Page } from '@playwright/test';

const JWT = process.env.RWAQ_JWT ?? '';

/**
 * Collect real console errors and request failures, filtering known
 * environmental noise (brand-theme 404 from a private GitHub URL, React 18
 * defaultProps deprecation warnings from Paragon).
 */
const collectProblems = (page: Page): string[] => {
  const problems: string[] = [];

  const isEnvironmentalNoise = (text: string) => (
    text.includes('raw.githubusercontent.com')
    || text.includes('Failed to load theme variant')
    || text.includes('Support for defaultProps')
  );

  page.on('console', (msg) => {
    if (msg.type() === 'error' && !isEnvironmentalNoise(msg.text())) {
      problems.push(`console error: ${msg.text()}`);
    }
  });

  page.on('requestfailed', (req) => {
    if (!req.url().includes('raw.githubusercontent.com')) {
      problems.push(`request failed: ${req.url()}`);
    }
  });

  return problems;
};

test.beforeEach(async ({ context }) => {
  test.skip(!JWT, 'RWAQ_JWT is not set — skipping smoke tests that require Global Staff auth.');
  const [header, payload, signature] = JWT.split('.');
  await context.addCookies([
    {
      name: 'edx-jwt-cookie-header-payload',
      value: `${header}.${payload}`,
      domain: '.local.openedx.io',
      path: '/',
    },
    {
      name: 'edx-jwt-cookie-signature',
      value: signature,
      domain: '.local.openedx.io',
      path: '/',
    },
  ]);
});

test('dashboard page title is visible on load', async ({ page }) => {
  const problems = collectProblems(page);

  await page.goto('/admin/', { waitUntil: 'networkidle' });

  await expect(
    page.getByRole('heading', { name: 'Dashboard', level: 1 }),
  ).toBeVisible();

  // Guard: no real console errors on the initial paint.
  expect(problems, `page errors on load:\n${problems.join('\n')}`).toEqual([]);
});

test('KPI row renders at least one stat tile', async ({ page }) => {
  await page.goto('/admin/', { waitUntil: 'networkidle' });

  // The KPI grid is present and contains the expected stat labels.  At least
  // one must be visible; if the whole row is missing the page has regressed.
  const kpiRow = page.locator('.rwaq-dash-grid--kpi');
  await expect(kpiRow).toBeVisible();

  // Each label is a direct child text node of a KpiCard inside the grid — the
  // exact label depends on the date-range state, so a partial match is used.
  const firstLabel = kpiRow.getByText('Learners').first();
  await expect(firstLabel).toBeVisible();

  // Sentinel: none of the tiles should render a raw JavaScript coercion artefact
  // in place of a real value.
  await expect(page.getByText('null')).toHaveCount(0);
  await expect(page.getByText('undefined')).toHaveCount(0);
});

test('refresh button is present and clickable', async ({ page }) => {
  await page.goto('/admin/', { waitUntil: 'networkidle' });

  // The button uses aria-label="Refresh dashboard" (see messages.refreshAriaLabel).
  const refreshBtn = page.getByRole('button', { name: 'Refresh dashboard' });
  await expect(refreshBtn).toBeVisible();
  await expect(refreshBtn).toBeEnabled();

  // Click it; the button momentarily becomes disabled while the in-flight
  // requests resolve.  We verify the page does not crash afterwards.
  await refreshBtn.click();

  // Re-enabled once all three queries settle — poll rather than use a fixed
  // sleep so the test is not slower than it needs to be.
  await expect.poll(
    () => refreshBtn.isEnabled(),
    { timeout: 15_000, message: 'Refresh button never re-enabled after click' },
  ).toBe(true);

  // The heading must still be present: the refresh must not navigate away or
  // unmount the page.
  await expect(
    page.getByRole('heading', { name: 'Dashboard', level: 1 }),
  ).toBeVisible();
});

test('no console errors on initial dashboard load', async ({ page }) => {
  const problems = collectProblems(page);

  await page.goto('/admin/', { waitUntil: 'networkidle' });

  // networkidle can settle before all async renders complete; wait for the KPI
  // row so the page has fully painted before we check for errors.
  await expect(page.locator('.rwaq-dash-grid--kpi')).toBeVisible();

  expect(problems, `unexpected console errors:\n${problems.join('\n')}`).toEqual([]);
});
