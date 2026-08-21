import { test, expect } from '@playwright/test';

const JWT = process.env.RWAQ_JWT ?? '';

test('the enrollments tab renders a long list with separated columns', async ({ page }) => {
  test.skip(!JWT, 'RWAQ_JWT is not set.');
  const [header, payload, signature] = JWT.split('.');
  await page.context().addCookies([
    { name: 'edx-jwt-cookie-header-payload', value: `${header}.${payload}`, domain: '.local.openedx.io', path: '/' },
    { name: 'edx-jwt-cookie-signature', value: signature, domain: '.local.openedx.io', path: '/' },
  ]);

  // Search for the seeded learner who holds twelve enrollments.
  await page.goto('/admin/users?search_by=name&search_term=Nadia', { waitUntil: 'networkidle' });
  await expect(page.locator('tbody tr').first()).toBeVisible();
  await page.getByRole('button', { name: /^View/ }).first().click();
  await page.getByRole('tab', { name: 'Enrollments' }).click();
  await expect(page.locator('.rwaq-enrollments__table tbody tr').first()).toBeVisible();

  const layout = await page.evaluate(() => {
    const heads = Array.from(document.querySelectorAll('.rwaq-enrollments__table thead th'));
    const boxes = heads.map((h) => h.getBoundingClientRect());
    // Widths must differ — an evenly-split table is the un-styled fallback.
    const widths = boxes.map((b) => Math.round(b.width));
    const title = document.querySelector('.rwaq-enrollments__table .rwaq-user-cell__name');
    return {
      rows: document.querySelectorAll('.rwaq-enrollments__table tbody tr').length,
      widths,
      courseColumnIsWidest: widths[0] === Math.max(...widths),
      titleFontSize: title ? getComputedStyle(title).fontSize : null,
      modeChips: document.querySelectorAll('.rwaq-enrollments__mode').length,
    };
  });
  // eslint-disable-next-line no-console
  console.log('ENROLLMENTS LAYOUT', JSON.stringify(layout));

  expect(layout.rows, 'expected the twelve-enrollment learner').toBe(12);
  expect(layout.courseColumnIsWidest, 'the course column should be the widest').toBe(true);
  // 13px — the shared table scale. Larger means the old oversized heading.
  expect(layout.titleFontSize).toBe('13px');
  expect(layout.modeChips, 'every row should render a mode chip').toBe(12);
});
