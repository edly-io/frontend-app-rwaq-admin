/**
 * Enrollment codes API: snake_case on the wire with empty filters dropped, camelCase results,
 * the create and patch bodies, and the card.
 */
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import {
  createEnrollmentCode,
  deleteEnrollmentCode,
  getEnrollmentCodeCard,
  getEnrollmentCodes,
  getEnrollmentCodeUses,
  getEnrollmentCodeUsesCsvUrl,
  updateEnrollmentCode,
} from './api';

jest.mock('@edx/frontend-platform/auth', () => ({
  getAuthenticatedHttpClient: jest.fn(),
}));

jest.mock('@edx/frontend-platform', () => {
  const actual = jest.requireActual('@edx/frontend-platform');
  return {
    ...actual,
    getConfig: jest.fn(() => ({ STUDIO_BASE_URL: 'http://studio.local:8001' })),
  };
});

const BASE = 'http://studio.local:8001/api/v1/admin/enrollment-codes';
const get = jest.fn();
const post = jest.fn();
const patch = jest.fn();
const del = jest.fn();

beforeEach(() => {
  [get, post, patch, del].forEach((fn) => fn.mockReset());
  (getAuthenticatedHttpClient as jest.Mock).mockReturnValue({
    get, post, patch, delete: del,
  });
});

describe('enrollment codes api', () => {
  it('lists codes with snake_case filters, drops empty ones and camelCases the rows', async () => {
    get.mockResolvedValue({
      data: {
        pagination: {
          count: 1, num_pages: 1, next: null, previous: null,
        },
        results: [{
          id: 4,
          code: 'ABC234',
          item: {
            kind: 'course', id: 'course-v1:A+B+C', name: 'Safety', organization: 'ARB',
          },
          max_uses: 5,
          uses_count: 2,
          expires_at: null,
          is_active: true,
          status: 'active',
          created_by: 'admin',
          created: '2026-11-01T10:00:00Z',
        }],
      },
    });

    const page = await getEnrollmentCodes({
      status: 'active', courseId: 'course-v1:A+B+C', programUuid: undefined, search: '', page: 2, pageSize: 10,
    });

    expect(get).toHaveBeenCalledWith(`${BASE}/`, {
      params: {
        status: 'active', course_id: 'course-v1:A+B+C', page: 2, page_size: 10,
      },
    });
    expect(page.pagination.numPages).toBe(1);
    expect(page.results[0]).toMatchObject({
      maxUses: 5, usesCount: 2, isActive: true, createdBy: 'admin', item: { id: 'course-v1:A+B+C' },
    });
  });

  it('creates a code for a course, with the generated code left out', async () => {
    post.mockResolvedValue({ data: { id: 9, code: 'ZZZ999', max_uses: 1 } });

    const created = await createEnrollmentCode({
      code: undefined, courseId: 'course-v1:A+B+C', maxUses: 1, expiresAt: '2026-12-31',
    });

    expect(post).toHaveBeenCalledWith(`${BASE}/`, {
      course_id: 'course-v1:A+B+C', max_uses: 1, expires_at: '2026-12-31',
    });
    expect(created.maxUses).toBe(1);
  });

  it('creates a code for a program with a typed code', async () => {
    post.mockResolvedValue({ data: { id: 9 } });
    await createEnrollmentCode({ code: 'RIYADH26', programUuid: 'uuid-1', maxUses: 50 });
    expect(post).toHaveBeenCalledWith(`${BASE}/`, { code: 'RIYADH26', program_uuid: 'uuid-1', max_uses: 50 });
  });

  it('patches only what is given and sends null to clear the expiry', async () => {
    patch.mockResolvedValue({ data: { id: 4, expires_at: null } });
    await updateEnrollmentCode(4, { expiresAt: null, isActive: false, maxUses: undefined });
    expect(patch).toHaveBeenCalledWith(`${BASE}/4/`, { expires_at: null, is_active: false });
  });

  it('deletes a code', async () => {
    del.mockResolvedValue({});
    await deleteEnrollmentCode(4);
    expect(del).toHaveBeenCalledWith(`${BASE}/4/`);
  });

  it('reads the card', async () => {
    get.mockResolvedValue({
      data: {
        code: 'ABC234',
        item_name: 'Safety',
        item_kind: 'course',
        organization_name: 'Arbisoft',
        organization_arabic_name: '',
        logo: 'data:image/png;base64,AAA',
        qr_url: 'https://rwaq.org/?code=ABC234',
        expires_at: null,
        platform: { slogan: 'S', about: 'A', links: [{ type: 'x', url: 'https://x.com/rwaq', text: '@rwaq' }] },
      },
    });
    const card = await getEnrollmentCodeCard(4);
    expect(get).toHaveBeenCalledWith(`${BASE}/4/card/`);
    expect(card.itemName).toBe('Safety');
    expect(card.qrUrl).toBe('https://rwaq.org/?code=ABC234');
    expect(card.platform.links[0].text).toBe('@rwaq');
  });

  it('lists uses with the code, item and date filters', async () => {
    get.mockResolvedValue({
      data: {
        pagination: {
          count: 1, num_pages: 1, next: null, previous: null,
        },
        results: [{
          id: 1,
          student: {
            id: 7, name: 'Sara', username: 'sara', email: 's@x.com',
          },
          code: 'ABC234',
          code_id: 4,
          item: { kind: 'program', id: 'uuid-1', name: 'Leadership' },
          used_at: '2026-11-02T08:00:00Z',
          still_enrolled: false,
        }],
      },
    });

    const page = await getEnrollmentCodeUses({
      codeId: 4, programUuid: 'uuid-1', startDate: '2026-11-01', endDate: '2026-11-30', search: 'sara',
    });

    expect(get).toHaveBeenCalledWith(`${BASE}/uses/`, {
      params: {
        code_id: 4, program_uuid: 'uuid-1', start_date: '2026-11-01', end_date: '2026-11-30', search: 'sara',
      },
    });
    expect(page.results[0].stillEnrolled).toBe(false);
    expect(page.results[0].codeId).toBe(4);
  });

  it('points the CSV download at the uses csv endpoint', () => {
    expect(getEnrollmentCodeUsesCsvUrl()).toBe(`${BASE}/uses/csv/`);
  });
});
