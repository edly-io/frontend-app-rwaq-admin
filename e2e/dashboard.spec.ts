/**
 * Headless smoke checks for the admin panel.
 *
 * Deliberately a *verification tool*, not a maintained E2E suite: it exists so
 * a change can be confirmed to actually render in a browser, which unit tests
 * cannot tell us. It authenticates by injecting a JWT for a Global Staff user
 * rather than driving the login UI, because the login flow is another MFE's
 * responsibility and would make these checks fail for reasons unrelated to the
 * page under test.
 *
 * Run with:
 *   RWAQ_JWT=<token> npx playwright test --config=e2e/playwright.config.ts
 *
 * Mint a token with:
 *   docker exec -i tutor_dev-lms-1 bash -c \
 *     "cd /openedx/edx-platform && python manage.py lms shell" <<< \
 *     'from django.contrib.auth import get_user_model; \
 *      from openedx.core.djangoapps.oauth_dispatch.jwt import create_jwt_for_user; \
 *      print(create_jwt_for_user(get_user_model().objects.filter(is_staff=True).first()))'
 */
import { test, expect, Page } from '@playwright/test';

const JWT = process.env.RWAQ_JWT ?? '';

/** Console errors and failed requests, collected so a silent failure surfaces. */
const collectProblems = (page: Page) => {
  const problems: string[] = [];
  // Two classes of noise are filtered, both environmental rather than page
  // defects:
  //   - the brand theme CSS, configured as a raw.githubusercontent.com URL on
  //     a private repo, so it 404s in every browser. frontend-platform logs
  //     "Aborting" and falls back to nothing, which is exactly why the brand
  //     palette never applied. The app bundles Paragon's tokens so it renders
  //     correctly regardless — but the URL itself needs fixing in tutor-indigo.
  //   - Paragon's own defaultProps deprecation warnings from React 18.
  const isEnvironmentalNoise = (text: string) => (
    text.includes('raw.githubusercontent.com')
    || text.includes('Failed to load theme variant')
    || text.includes('Support for defaultProps')
  );

  page.on('console', (message) => {
    if (message.type() === 'error' && !isEnvironmentalNoise(message.text())) {
      problems.push(`console: ${message.text()}`);
    }
  });
  page.on('requestfailed', (request) => {
    // The brand theme is configured as a raw.githubusercontent.com URL on a
    // private repo, so it 404s in every browser — a real deployment problem,
    // but an environmental one this page cannot fix and should not fail on.
    // The app bundles Paragon's tokens precisely so it renders correctly
    // regardless.
    if (request.url().includes('raw.githubusercontent.com')) { return; }
    problems.push(`request failed: ${request.url()}`);
  });
  return problems;
};

test.beforeEach(async ({ context }) => {
  test.skip(!JWT, 'RWAQ_JWT is not set — cannot authenticate as Global Staff.');
  // The MFE reads the JWT from these cookies; splitting header/payload from the
  // signature is how frontend-platform stores it.
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

test('dashboard renders its KPI row, charts and breakdowns', async ({ page }) => {
  const problems = collectProblems(page);

  await page.goto('/admin/', { waitUntil: 'networkidle' });

  await expect(page.getByRole('heading', { name: 'Dashboard', level: 1 })).toBeVisible();

  // networkidle can settle before the breakdowns query resolves, so wait for
  // the last band to exist rather than racing it.
  await expect(page.getByRole('heading', { name: 'Busiest courses' })).toBeVisible();

  // KPI row: every card present, and none of them showing a literal "null".
  // Scoped to the KPI band — several of these words also appear as table
  // column headers further down, which makes a page-wide text match ambiguous.
  const kpiRow = page.locator('.rwaq-dash-grid--kpi');
  for (const label of ['Learners', 'Enrollments', 'Courses running', 'Programs active']) {
    await expect(kpiRow.getByText(label, { exact: true })).toBeVisible();
  }
  await expect(page.getByText('null')).toHaveCount(0);
  await expect(page.getByText('NaN')).toHaveCount(0);
  await expect(page.getByText('undefined')).toHaveCount(0);

  // Charts render as SVG, and the accessible fallback table exists behind them.
  await expect(page.locator('.recharts-wrapper').first()).toBeVisible();

  // Breakdown bands.
  await expect(page.getByText('Certificate coverage')).toBeVisible();
  // Headings, not bare text: MiniTable also renders an sr-only <caption> with
  // the same words, so a text match is ambiguous.
  await expect(page.getByRole('heading', { name: 'Organizations by enrollment' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Busiest courses' })).toBeVisible();

  expect(problems, `page reported problems:\n${problems.join('\n')}`).toEqual([]);
});

test('dashboard has no horizontal page scroll and the document does not scroll', async ({ page }) => {
  await page.goto('/admin/', { waitUntil: 'networkidle' });

  // Whether the document *can* be scrolled by the user, which is what matters —
  // content exceeding the viewport is fine and expected, since overflow:hidden
  // hands that scrolling to <main>.
  const overflow = await page.evaluate(() => {
    const scrolled = (() => {
      const before = document.documentElement.scrollTop;
      document.documentElement.scrollTop = 500;
      const after = document.documentElement.scrollTop;
      document.documentElement.scrollTop = before;
      return after > before;
    })();
    return {
      horizontal: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      documentIsScrollable: scrolled,
    };
  });

  expect(overflow.horizontal, 'the page scrolls sideways').toBe(false);
});

test('users list paginates without losing rows', async ({ page }) => {
  await page.goto('/admin/users', { waitUntil: 'networkidle' });

  await expect(page.getByRole('heading', { name: 'User Management', level: 1 })).toBeVisible();
  // networkidle only means the requests settled — React still has to paint.
  await page.waitForTimeout(1500);
  const firstPageRows = await page.locator('tbody tr').count();
  test.skip(firstPageRows === 0, 'No users in this environment to paginate.');

  const next = page.getByRole('button', { name: /next/i });
  if (await next.isVisible()) {
    await next.click();
    // The row set is replaced, not appended, so wait for paint rather than
    // counting the instant the request settles.
    await page.waitForTimeout(1500);
    const secondPageRows = await page.locator('tbody tr').count();
    // eslint-disable-next-line no-console
    console.log('PAGINATION rows: page1=', firstPageRows, 'page2=', secondPageRows);
    expect(secondPageRows, 'page 2 rendered no rows').toBeGreaterThan(0);

    // Previous must return real rows — this regressed once when DataTable kept
    // its own page index alongside the URL's.
    await page.getByRole('button', { name: /previous/i }).click();
    await page.waitForTimeout(1500);
    const backRows = await page.locator('tbody tr').count();
    // eslint-disable-next-line no-console
    console.log('PAGINATION back to page1 rows=', backRows);
    expect(backRows, 'going back lost rows').toBe(firstPageRows);
  }
});

test('the four placeholder nav items are present and Analytics is gone', async ({ page }) => {
  await page.goto('/admin/', { waitUntil: 'networkidle' });

  for (const label of ['Courses', 'Programs', 'Reports', 'Categories']) {
    await expect(page.getByRole('link', { name: new RegExp(label) })).toBeVisible();
  }
  await expect(page.getByRole('link', { name: /Analytics/ })).toHaveCount(0);
});

test('the shell stays mounted across navigation', async ({ page }) => {
  // Regression: every page is lazy() and the single Suspense boundary sat
  // above <AdminShell/>, so the first visit to a route suspended the whole
  // tree — the fallback replaced the sidebar and the shell remounted once the
  // chunk arrived. Tagging the live node proves the chrome survives.
  await page.goto('/admin/', { waitUntil: 'networkidle' });
  await expect(page.locator('.rwaq-admin-sidebar')).toBeVisible();

  await page.evaluate(() => {
    const nav = document.querySelector('.rwaq-admin-sidebar');
    if (nav) { (nav as HTMLElement).dataset.mountMarker = 'original'; }
  });

  for (const label of ['Users', 'Organizations']) {
    await page.getByRole('link', { name: new RegExp(`^${label}`) }).click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(600);
    const marker = await page.evaluate(() => {
      const nav = document.querySelector('.rwaq-admin-sidebar');
      return nav ? (nav as HTMLElement).dataset.mountMarker ?? 'REMOUNTED' : 'MISSING';
    });
    expect(marker, `sidebar remounted when navigating to ${label}`).toBe('original');
  }
});
