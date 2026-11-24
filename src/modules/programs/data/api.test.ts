import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { bulkEnrollLearners } from './api';

jest.mock('@edx/frontend-platform/auth', () => ({ getAuthenticatedHttpClient: jest.fn() }));
jest.mock('@src/data/utils', () => ({ getStudioApiUrl: (path: string) => `http://studio.local${path}` }));

it('uses the backend address for failures even when the pasted list contains non-ASCII spaces', async () => {
  const post = jest.fn().mockResolvedValue({
    data: {
      enrolled: [],
      already_enrolled: [],
      invited: [],
      failed: [{ index: 1, email: 'second@example.com', reason: 'Could not enroll learner' }],
      course_failures: [],
      notification_failures: [],
    },
  });
  (getAuthenticatedHttpClient as jest.Mock).mockReturnValue({ post });
  const result = await bulkEnrollLearners('program', 'first@example.com\u00a0second@example.com');
  expect(result.failed[0].email).toBe('second@example.com');
});
