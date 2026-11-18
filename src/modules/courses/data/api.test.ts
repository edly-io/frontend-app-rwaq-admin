import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { updateCoursePricing } from './api';

jest.mock('@edx/frontend-platform/auth', () => ({ getAuthenticatedHttpClient: jest.fn() }));
jest.mock('@src/data/utils', () => ({ getStudioApiUrl: (path: string) => `http://studio.local${path}` }));

it('sends the course catalog visibility setting to the backend', async () => {
  const put = jest.fn().mockResolvedValue({ data: { hide_from_catalog: true } });
  (getAuthenticatedHttpClient as jest.Mock).mockReturnValue({ put });
  const result = await updateCoursePricing('course-v1:A+B+C', { hideFromCatalog: true });
  expect(put).toHaveBeenCalledWith(expect.stringContaining('/pricing/'), { hide_from_catalog: true });
  expect(result.hideFromCatalog).toBe(true);
});
