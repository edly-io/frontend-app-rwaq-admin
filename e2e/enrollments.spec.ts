import { test, expect } from '@playwright/test';

const JWT = process.env.RWAQ_JWT ?? '';

test('the enrollments table matches the user list and paginates', async ({ page }) => {
  test.skip(!JWT, 'RWAQ_JWT is not set.');
  const [header, payload, signature] = JWT.split('.');
  await page.context().addCookies([
    { name: 'edx-jwt-cookie-header-payload', value: `${header}.${payload}`, domain: '.local.openedx.io', path: '/' },
    { name: 'edx-jwt-cookie-signature', value: signature, domain: '.local.openedx.io', path: '/' },
  ]);

  // Search for the seeded learner who holds twelve enrollments.
  await page.goto('/admin/users?search_by=name&search_term=Nadia', { waitUntil: 'networkidle' });
  await expect(page.locator('tbody tr').first()).toBeVisible();

  // Read the user list's own name styling first, to compare against. The point
  // of moving this table onto AdminDataTable was that the two match, so the
  // assertion is "same as the list" rather than a hardcoded px value that has
  // to be edited whenever the shared scale changes.
  const listTitleFontSize = await page.evaluate(
    () => getComputedStyle(document.querySelector('.rwaq-user-cell__name')!).fontSize,
  );

  await page.getByRole('button', { name: /^View/ }).first().click();
  await expect(page.locator('.rwaq-card').nth(1).locator('tbody tr').first()).toBeVisible();

  const layout = await page.evaluate(() => {
    const table = document.querySelectorAll('.rwaq-card')[1];
    const heads = Array.from(table.querySelectorAll('thead th'));
    const boxes = heads.map((h) => h.getBoundingClientRect());
    // Widths must differ — an evenly-split table is the un-styled fallback.
    const widths = boxes.map((b) => Math.round(b.width));
    const title = table.querySelector('.rwaq-user-cell__name');
    return {
      rows: table.querySelectorAll('tbody tr').length,
      widths,
      courseColumnIsWidest: widths[0] === Math.max(...widths),
      titleFontSize: title ? getComputedStyle(title).fontSize : null,
      modeChips: table.querySelectorAll('.rwaq-enrollments__mode').length,
    };
  });
  // eslint-disable-next-line no-console
  console.log('ENROLLMENTS LAYOUT', JSON.stringify(layout));

  // Ten, not twelve: the table paginates now, so page one holds a page.
  expect(layout.rows, 'expected a full first page').toBe(10);
  expect(layout.courseColumnIsWidest, 'the course column should be the widest').toBe(true);
  expect(layout.titleFontSize, 'should use the same type scale as the user list')
    .toBe(listTitleFontSize);
  expect(layout.modeChips, 'every row should render a mode chip').toBe(10);

  // Page two holds the remaining two of the twelve.
  await page.getByRole('button', { name: 'Next' }).click();
  await expect
    .poll(() => page.locator('.rwaq-card').nth(1).locator('tbody tr').count())
    .toBe(2);
});
