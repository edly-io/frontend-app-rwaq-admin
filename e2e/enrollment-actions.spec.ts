/**
 * The enrollment write flows, against the real dev environment.
 *
 * Not a maintained E2E suite — this is the headless equivalent of clicking
 * through it, kept in the repo because the acceptance criteria are about
 * behaviour that no unit test can see: whether the reason is genuinely
 * required before a request is sent, whether a 409 surfaces as "reload"
 * instead of a silent overwrite, and whether the toast stops short of
 * claiming the queued work is done.
 *
 * Every test cleans up after itself, since it writes to a shared database.
 */
import { test, expect, Page } from '@playwright/test';

const JWT = process.env.RWAQ_JWT ?? '';
/** The learner these tests act on — seeded, and not used by the other specs. */
const LEARNER = process.env.RWAQ_LEARNER ?? 'Tariq';

const authenticate = async (page: Page) => {
  const [header, payload, signature] = JWT.split('.');
  await page.context().addCookies([
    { name: 'edx-jwt-cookie-header-payload', value: `${header}.${payload}`, domain: '.local.openedx.io', path: '/' },
    { name: 'edx-jwt-cookie-signature', value: signature, domain: '.local.openedx.io', path: '/' },
  ]);
};

/**
 * The open dialog.
 *
 * Everything inside a modal is addressed through this rather than off `page`:
 * the sidebar has a "Courses" nav item and the dialog has a "Course" field, so
 * an unscoped getByLabel('Course') matches both and fails on strictness.
 */
const dialog = (page: Page) => page.getByRole('dialog').last();

/**
 * Open the learner's detail *page*.
 *
 * View used to open a modal whose Enrollments tab then opened more modals on
 * top of it. It is a route now, so this navigates and waits for the page's
 * enrollments card rather than clicking through a dialog.
 */
const openEnrollmentsTab = async (page: Page) => {
  await page.goto(
    `/admin/users?search_by=name&search_term=${encodeURIComponent(LEARNER)}`,
    { waitUntil: 'networkidle' },
  );
  await expect(page.locator('tbody tr').first()).toBeVisible();
  await page.getByRole('button', { name: /^View/ }).first().click();
  await expect(page).toHaveURL(/\/admin\/users\/\d+$/);
  await expect(page.getByRole('button', { name: 'Enroll in a course' })).toBeVisible();
  // The enrollments table is the second card; wait for it rather than for the
  // profile card, which renders first from an already-cached detail query.
  await expect(page.locator('.rwaq-card').nth(1)).toBeVisible();
};

test.beforeEach(async ({ page }) => {
  test.skip(!JWT, 'RWAQ_JWT is not set.');
  await authenticate(page);
});

// AC-8: the reason is required, and the block happens before the request.
test('will not submit without a reason', async ({ page }) => {
  await openEnrollmentsTab(page);

  const requests: string[] = [];
  page.on('request', (request) => {
    if (request.method() === 'POST' && request.url().includes('/enrollments/')) {
      requests.push(request.url());
    }
  });

  await page.getByRole('button', { name: 'Enroll in a course' }).click();
  const form = dialog(page);
  await form.getByRole('textbox', { name: 'Course' }).fill('a');
  // Two characters is the search floor, so one must not fire a request.
  await page.waitForTimeout(600);
  await form.getByRole('textbox', { name: 'Course' }).fill('an');
  await form.locator('.rwaq-course-picker__option:not([disabled])').first().click();

  await form.getByRole('button', { name: 'Enroll', exact: true }).click();
  await expect(form.getByText('A reason is required.')).toBeVisible();
  expect(requests, 'nothing should be sent while the form is invalid').toHaveLength(0);
});

// AC-1/2/12: enrolling works end to end, and the toast does not overclaim.
test('enrolls, then changes the mode, then unenrolls', async ({ page }) => {
  await openEnrollmentsTab(page);

  // ── Enroll ────────────────────────────────────────────────────────────────
  await page.getByRole('button', { name: 'Enroll in a course' }).click();
  const enrollForm = dialog(page);
  await enrollForm.getByRole('textbox', { name: 'Course' }).fill('an');
  const option = enrollForm.locator('.rwaq-course-picker__option:not([disabled])').first();
  await expect(option).toBeVisible();
  const courseName = (await option.locator('.rwaq-user-cell__name').innerText()).trim();
  await option.click();

  await expect(enrollForm.getByText('Selected course')).toBeVisible();
  await enrollForm.getByLabel('Reason').selectOption('Testing / QA');
  await enrollForm.getByRole('button', { name: 'Enroll', exact: true }).click();

  const toast = page.locator('.toast, [role="alert"]').filter({ hasText: 'Enrolled in' });
  await expect(toast).toBeVisible();
  // AC-12: grades and certificates are queued, so the wording must say
  // "shortly" rather than reporting them done.
  await expect(toast).toContainText('update shortly');

  // Asserted on the course's own row rather than on the total row count. A
  // second run of this test re-enrolls the course it unenrolled last time, and
  // that is a reactivation — the row already exists, so the count correctly
  // does not move. Counting made the test fail on its own success.
  const row = page.locator('.rwaq-card tbody tr')
    .filter({ hasText: courseName });
  await expect(row).toHaveCount(1);
  await expect(row.getByText('Active', { exact: true })).toBeVisible();
  // The reason written a moment ago is visible on the row itself.
  await expect(row.locator('.rwaq-enrollments__audit')).toContainText('Testing / QA');

  // ── Change mode ───────────────────────────────────────────────────────────
  const modeBefore = (await row.locator('.rwaq-enrollments__mode').innerText()).trim();
  await row.getByRole('button', { name: /^Change mode/ }).click();
  const modeForm = dialog(page);
  // The current mode must not be offered as a target.
  const options = await modeForm.getByLabel('New mode').locator('option').allInnerTexts();
  await modeForm.getByLabel('Reason').selectOption('Enrollment correction');
  await modeForm.getByRole('button', { name: 'Change mode', exact: true }).click();

  await expect(page.locator('[role="alert"], .toast').filter({ hasText: 'Mode changed to' }))
    .toBeVisible();
  await expect.poll(async () => (await row.locator('.rwaq-enrollments__mode').innerText()).trim())
    .not.toBe(modeBefore);

  // ── Unenroll ──────────────────────────────────────────────────────────────
  await row.getByRole('button', { name: /^Unenroll/ }).click();
  const unenrollForm = dialog(page);
  await expect(unenrollForm.getByText(/grades and any certificate stay on record/)).toBeVisible();
  await unenrollForm.getByLabel('Reason').selectOption('Enrollment correction');
  await unenrollForm.getByRole('button', { name: 'Unenroll', exact: true }).click();

  await expect(page.locator('[role="alert"], .toast').filter({ hasText: 'Unenrolled from' }))
    .toBeVisible();

  // AC-7: soft delete — the row stays, marked unenrolled, and its actions go.
  await expect(row).toHaveCount(1);
  await expect(row.getByText('Unenrolled')).toBeVisible();
  await expect(row.getByRole('button', { name: /^Change mode/ })).toBeDisabled();
  expect(options, 'the current mode should not be offered as a target')
    .not.toContain(modeBefore);
});

// AC-3: an active enrollment cannot be created twice from the picker.
test('shows an already-enrolled course as unpickable', async ({ page }) => {
  await openEnrollmentsTab(page);
  // Specifically an *active* row. The first row may be one a previous test
  // unenrolled from, and that one is legitimately selectable again — picking it
  // here would assert the opposite of the rule.
  const activeRow = page.locator('.rwaq-card tbody tr')
    .filter({ has: page.getByText('Active', { exact: true }) })
    .first();
  await expect(activeRow).toBeVisible();
  const firstCourse = (await activeRow.locator('.rwaq-user-cell__name').innerText()).trim();

  await page.getByRole('button', { name: 'Enroll in a course' }).click();
  const form = dialog(page);
  await form.getByRole('textbox', { name: 'Course' }).fill(firstCourse.slice(0, 6));

  const disabled = form.locator('.rwaq-course-picker__option[disabled]').first();
  await expect(disabled).toBeVisible();
  await expect(disabled).toContainText('Already enrolled');
});

/*
 * AC-6: a stale tab must not silently overwrite a concurrent change.
 *
 * The API's own 409 is covered by the backend tests and was confirmed against
 * the real database. What those cannot show is what the admin sees, so the
 * response is forced here and the assertion is purely about the UI: an
 * explicit "reload" message, the dialog still open, and the form's values
 * intact so nothing has to be retyped.
 */
test('asks the admin to reload when the enrollment changed underneath them', async ({ page }) => {
  await openEnrollmentsTab(page);

  await page.route('**/enrollments/**', async (route) => {
    if (route.request().method() === 'PATCH') {
      await route.fulfill({
        status: 409,
        contentType: 'application/json',
        body: JSON.stringify({ detail: 'Enrollment mode is no longer honor.' }),
      });
      return;
    }
    await route.continue();
  });

  const row = page.locator('.rwaq-card tbody tr')
    .filter({ has: page.getByText('Active', { exact: true }) }).first();
  const modeBefore = (await row.locator('.rwaq-enrollments__mode').innerText()).trim();
  await row.getByRole('button', { name: /^Change mode/ }).click();

  const form = dialog(page);
  await form.getByLabel('Reason').selectOption('Enrollment correction');
  await form.getByRole('button', { name: 'Change mode', exact: true }).click();

  await expect(form.getByText(/changed while you had it open/)).toBeVisible();
  await expect(form.getByText(/Reload to see where it stands/)).toBeVisible();
  // Still open, and the reason still filled in — a conflict is not a reset.
  await expect(form).toBeVisible();
  await expect(form.getByLabel('Reason')).toHaveValue('Enrollment correction');
  // And nothing was written: the row is unchanged behind the dialog.
  expect((await row.locator('.rwaq-enrollments__mode').innerText()).trim()).toBe(modeBefore);

  // The alert carries the action it names. Telling an admin to reload without
  // giving them a way to do it makes "close and reopen" the real instruction.
  await form.getByRole('button', { name: 'Reload' }).click();
  // Named rather than `dialog(page)`: that helper is .last(), and once this
  // dialog closes .last() resolves to the User details dialog behind it, which
  // is meant to stay open — so the assertion would fail on correct behaviour.
  await expect(page.getByRole('dialog', { name: 'Change enrollment mode' })).toBeHidden();
});

// The dark palette is defined by this repo rather than inherited from Paragon,
// so every new surface has to be checked against it explicitly — a modal that
// misses the tokens renders dark text on a dark ground.
test('renders the enroll form in the dark palette', async ({ page }) => {
  await page.goto('/admin/users', { waitUntil: 'networkidle' });
  // Through the real toggle. Setting the attribute directly does not survive:
  // the theme hook re-applies it from stored state on the next render, so the
  // page silently reverts to light and the assertions below pass on the wrong
  // palette — which is exactly what happened the first time this was written.
  await page.locator('.rwaq-admin-topbar button').first().click();
  await expect.poll(() => page.evaluate(
    () => document.documentElement.getAttribute('data-paragon-theme-variant'),
  )).toBe('dark');

  await openEnrollmentsTab(page);
  await page.getByRole('button', { name: 'Enroll in a course' }).click();

  const form = dialog(page);
  await form.getByRole('textbox', { name: 'Course' }).fill('an');
  await expect(form.locator('.rwaq-course-picker__option').first()).toBeVisible();

  const contrast = await page.evaluate(() => {
    const luminance = (colour: string) => {
      const [r, g, b] = colour.match(/\d+/g)!.slice(0, 3).map(Number);
      const channel = (value: number) => {
        const scaled = value / 255;
        return scaled <= 0.03928 ? scaled / 12.92 : ((scaled + 0.055) / 1.055) ** 2.4;
      };
      return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
    };
    // Walk up for the nearest painted background: a transparent element tells
    // us nothing about what its text actually sits on.
    const backgroundOf = (start: Element) => {
      let node: Element | null = start;
      while (node) {
        const background = getComputedStyle(node).backgroundColor;
        if (background && !background.includes('rgba(0, 0, 0, 0)')) { return background; }
        node = node.parentElement;
      }
      return 'rgb(255, 255, 255)';
    };
    const measure = (selector: string) => {
      const element = document.querySelector(selector);
      if (!element) { return null; }
      const text = luminance(getComputedStyle(element).color);
      const background = luminance(backgroundOf(element));
      const [light, dark] = text > background ? [text, background] : [background, text];
      return Math.round(((light + 0.05) / (dark + 0.05)) * 100) / 100;
    };
    return {
      option: measure('.rwaq-course-picker__option .rwaq-user-cell__name'),
      key: measure('.rwaq-course-picker__option .rwaq-user-cell__meta'),
      label: measure('.pgn__form-label'),
    };
  });
  // eslint-disable-next-line no-console
  console.log('DARK CONTRAST', JSON.stringify(contrast));

  // The palette first: light mode also clears 4.5:1, so contrast on its own
  // cannot tell the two themes apart and would pass against the wrong one.
  const surfaces = await page.evaluate(() => ({
    body: getComputedStyle(document.body).backgroundColor,
    modal: getComputedStyle(document.querySelector('.pgn__modal')!).backgroundColor,
    picker: getComputedStyle(document.querySelector('.rwaq-course-picker__results')!).backgroundColor,
    optionText: getComputedStyle(
      document.querySelector('.rwaq-course-picker__option .rwaq-user-cell__name')!,
    ).color,
  }));
  // eslint-disable-next-line no-console
  console.log('DARK SURFACES', JSON.stringify(surfaces));
  expect(surfaces.body, 'the dark palette did not apply').toBe('rgb(13, 13, 14)');
  // The dark card token is #16181b. White here means the modal never switched,
  // which also silently makes the contrast figures below a light-mode reading.
  expect(surfaces.modal, 'the modal kept a light surface').toBe('rgb(22, 24, 27)');
  expect(surfaces.picker, 'the picker kept a light surface').toBe('rgb(22, 24, 27)');

  // 4.5:1 is WCAG AA for body text; the course key is small but not fine print.
  expect(contrast.option!).toBeGreaterThanOrEqual(4.5);
  expect(contrast.key!).toBeGreaterThanOrEqual(4.5);
  expect(contrast.label!).toBeGreaterThanOrEqual(4.5);
});
