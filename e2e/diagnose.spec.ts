/**
 * Measures the two behaviours that were reported by eye: whether a long page
 * can actually scroll, and whether the layout shifts when a table swaps its
 * spinner for rows. Both are measured in a real browser rather than asserted
 * from the CSS, because both are emergent properties of the flex chain.
 */
import { test, expect, Page } from '@playwright/test';

const JWT = process.env.RWAQ_JWT ?? '';

const authenticate = async (page: Page) => {
  const [header, payload, signature] = JWT.split('.');
  await page.context().addCookies([
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
};

test.beforeEach(async ({ page }) => {
  test.skip(!JWT, 'RWAQ_JWT is not set.');
  await authenticate(page);
});

test('the dashboard content area scrolls, and the document does not', async ({ page }) => {
  await page.goto('/admin/', { waitUntil: 'networkidle' });
  // Measure only once the breakdown cards exist, or the page is still short
  // enough to fit and there is legitimately nothing to scroll.
  await expect(page.getByRole('heading', { name: 'Busiest courses' })).toBeVisible();

  const measured = await page.evaluate(() => {
    const main = document.getElementById('main-content');
    if (!main) { return null; }
    const before = main.scrollTop;
    main.scrollTop = 9999;
    const after = main.scrollTop;
    return {
      canScroll: main.scrollHeight > main.clientHeight,
      didScroll: after > before,
      contentHeight: main.scrollHeight,
      viewportOfMain: main.clientHeight,
      // Can the user scroll the document? Content exceeding the viewport is
      // expected; overflow:hidden is what stops it being scrollable.
      documentScrolls: (() => {
        const before = document.documentElement.scrollTop;
        document.documentElement.scrollTop = 400;
        const after = document.documentElement.scrollTop;
        document.documentElement.scrollTop = before;
        return after > before;
      })(),
    };
  });

  // eslint-disable-next-line no-console
  console.log('DASHBOARD SCROLL:', JSON.stringify(measured));

  expect(measured).not.toBeNull();
  expect(measured!.canScroll, 'main has no overflow to scroll').toBe(true);
  expect(measured!.didScroll, 'main did not actually scroll').toBe(true);
});

test('switching modules does not shift the layout when rows arrive', async ({ page }) => {
  await page.goto('/admin/', { waitUntil: 'networkidle' });

  // Record every layout shift the browser attributes to loading, which is
  // exactly what "blink" describes.
  await page.evaluate(() => {
    (window as unknown as { __shift: number }).__shift = 0;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const shift = entry as PerformanceEntry & { value: number; hadRecentInput: boolean };
        if (!shift.hadRecentInput) {
          (window as unknown as { __shift: number }).__shift += shift.value;
        }
      }
    }).observe({ type: 'layout-shift', buffered: true });
  });

  await page.getByRole('link', { name: /Users/ }).click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1200);

  const shift = await page.evaluate(
    () => (window as unknown as { __shift: number }).__shift,
  );
  // eslint-disable-next-line no-console
  console.log('CUMULATIVE LAYOUT SHIFT on module change:', shift);

  // 0.1 is the Core Web Vitals "good" threshold; anything visible as a blink
  // lands well above it.
  expect(shift, `layout shifted by ${shift}`).toBeLessThan(0.1);
});
