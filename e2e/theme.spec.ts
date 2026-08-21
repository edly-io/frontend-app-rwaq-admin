import { test, expect } from '@playwright/test';

const JWT = process.env.RWAQ_JWT ?? '';

test.beforeEach(async ({ context }) => {
  test.skip(!JWT, 'RWAQ_JWT is not set.');
  const [header, payload, signature] = JWT.split('.');
  await context.addCookies([
    { name: 'edx-jwt-cookie-header-payload', value: `${header}.${payload}`, domain: '.local.openedx.io', path: '/' },
    { name: 'edx-jwt-cookie-signature', value: signature, domain: '.local.openedx.io', path: '/' },
  ]);
});

test('the dark toggle actually applies the dark palette', async ({ page }) => {
  // Regression: Paragon ships no dark theme, so setThemeVariant('dark') stored
  // the preference and then *removed* data-paragon-theme-variant instead of
  // setting it. Every dark rule keys off that attribute, so the whole theme
  // silently failed to apply while localStorage claimed it was on.
  await page.goto('/admin/', { waitUntil: 'networkidle' });
  await expect(page.getByRole('heading', { name: 'Dashboard', level: 1 })).toBeVisible();

  await page.locator('.rwaq-admin-topbar button').first().click();
  await page.waitForTimeout(800);

  const applied = await page.evaluate(() => ({
    attribute: document.documentElement.getAttribute('data-paragon-theme-variant'),
    bodyBackground: getComputedStyle(document.body).backgroundColor,
  }));

  expect(applied.attribute, 'the theme attribute was not set to dark').toBe('dark');
  // The dark page token is #0d0d0e — anything near-white means the palette
  // never applied, which is exactly how this regressed.
  expect(applied.bodyBackground, 'the dark palette did not apply').toBe('rgb(13, 13, 14)');
});
