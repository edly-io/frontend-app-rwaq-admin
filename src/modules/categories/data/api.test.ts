import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getCategories, getCategory, getCategoryCourses } from './api';

jest.mock('@edx/frontend-platform/auth', () => ({ getAuthenticatedHttpClient: jest.fn() }));
jest.mock('@src/data/utils', () => ({ getApiUrl: (path: string) => path }));

it('sends the count ordering unchanged and decodes category and course counts', async () => {
  const get = jest.fn()
    .mockResolvedValueOnce({ data: { results: [{ courses_count: 2, enrollments_count: 12 }] } })
    .mockResolvedValueOnce({ data: { enrollments_count: 12, courses: [{ enrollments_count: 5 }] } })
    .mockResolvedValueOnce({ data: { results: [{ enrollments_count: 5 }] } });
  (getAuthenticatedHttpClient as jest.Mock).mockReturnValue({ get });

  expect(await getCategories({ ordering: '-enrollments_count', pageSize: 5 })).toEqual({
    results: [{ coursesCount: 2, enrollmentsCount: 12 }],
  });
  expect(get).toHaveBeenCalledWith('/rwaq/api/categories/', {
    params: { ordering: '-enrollments_count', page_size: 5 },
  });
  expect(await getCategory(1)).toEqual({ enrollmentsCount: 12, courses: [{ enrollmentsCount: 5 }] });
  expect(await getCategoryCourses(1)).toEqual({ results: [{ enrollmentsCount: 5 }] });
});
