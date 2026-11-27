/**
 * UserDetailPage — regression tests for bugs fixed in ulmo/rwaq-dev.
 *
 * Bug 1: Empty profile fields (job, country, biography, org-admin-of) were
 * rendering the raw i18n key `rwaq.admin.users.detail.none` instead of the
 * em-dash fallback.  Root cause: messages.ts had defaultMessage: '' for that
 * key, so React Intl fell back to the message id.  Fix: defaultMessage: '—'.
 */
import { screen } from '@testing-library/react';
import { renderWrapper } from '@src/setupTest';
import { useAdminCapabilities } from '@src/data/whoami';
import * as hooks from './data/hooks';
import UserDetailPage from './UserDetailPage';
import { getUserEnrollmentsCsvUrl } from './data/api';

jest.mock('./data/hooks');
jest.mock('@edx/frontend-platform', () => ({
  ...jest.requireActual('@edx/frontend-platform'),
  getConfig: jest.fn(() => ({ STUDIO_BASE_URL: 'http://studio.local:8001' })),
}));
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ id: '42' }),
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
}));

const mockMutation = {
  mutate: jest.fn(),
  mutateAsync: jest.fn(),
  isPending: false,
  isError: false,
  error: null,
  reset: jest.fn(),
};

// Minimal UserDetail fixture — all optional profile fields intentionally empty.
const emptyProfileUser = {
  id: 42,
  image: null,
  name: 'Test User',
  email: 'test@example.com',
  username: 'testuser',
  job: '',
  country: '',
  biography: '',
  profileVisibility: 'private',
  authenticationMethod: 'Password',
  authenticationMethods: ['Password'],
  isActive: true,
  isEmailConfirmed: true,
  isProfilePublic: false,
  isLegacy: false,
  createdAt: '2026-01-01T00:00:00Z',
  lastLogin: null,
  roleBadges: [],
  roles: {
    isGlobalStaff: false,
    isSuperuser: false,
    isCourseCreator: false,
    isSupportStaff: false,
    orgAdminOf: [],
  },
};

describe('UserDetailPage — Bug 1 regression: empty fields render "—" not raw i18n key', () => {
  beforeEach(() => {
    (useAdminCapabilities as jest.Mock).mockReturnValue({ data: { role: 'superuser' } });
    (hooks.useUser as jest.Mock).mockReturnValue({
      data: emptyProfileUser, isLoading: false, isError: false,
    });
    (hooks.useUserEnrollments as jest.Mock).mockReturnValue({
      data: [], isLoading: false, isError: false,
    });
    (hooks.useUserEnrollmentProgress as jest.Mock).mockReturnValue({ data: [], isLoading: false });
    (hooks.useUserStats as jest.Mock).mockReturnValue({
      data: undefined, isLoading: true, isError: false, error: null, refetch: jest.fn(),
    });
    // Child modal components call these hooks; mock them all so nothing
    // crashes trying to read .isPending on an undefined return value.
    (hooks.useUpdateUser as jest.Mock).mockReturnValue(mockMutation);
    (hooks.useCreateUser as jest.Mock).mockReturnValue(mockMutation);
    (hooks.useEnrollUser as jest.Mock).mockReturnValue(mockMutation);
    (hooks.useChangeEnrollmentMode as jest.Mock).mockReturnValue(mockMutation);
    (hooks.useUnenrollUser as jest.Mock).mockReturnValue(mockMutation);
    (hooks.useEnrollableCourses as jest.Mock).mockReturnValue({
      data: [], isLoading: false, isError: false,
    });
  });

  it.each([['org_admin', false], ['admin', true], ['superuser', true]])('shows edit for %s: %s', (role, allowed) => {
    (useAdminCapabilities as jest.Mock).mockReturnValue({ data: { role } });
    renderWrapper(<UserDetailPage />);
    expect(Boolean(screen.queryByRole('button', { name: 'Edit user' }))).toBe(allowed);
  });

  it('makes a privileged user read-only for an Admin', () => {
    (useAdminCapabilities as jest.Mock).mockReturnValue({ data: { role: 'admin' } });
    (hooks.useUser as jest.Mock).mockReturnValue({
      data: { ...emptyProfileUser, isPrivileged: true }, isLoading: false,
    });
    renderWrapper(<UserDetailPage />);
    expect(screen.getByRole('button', { name: 'Edit user' })).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByRole('button', { name: 'Enroll in a course' })).toHaveAttribute('aria-disabled', 'true');
  });

  it('never shows the raw message id for an empty field', () => {
    renderWrapper(<UserDetailPage />);
    expect(screen.queryByText('rwaq.admin.users.detail.none')).not.toBeInTheDocument();
  });

  it('offers a CSV download for this user enrollment endpoint', () => {
    renderWrapper(<UserDetailPage />);
    expect(screen.getByRole('button', { name: 'Download CSV' })).toBeInTheDocument();
    expect(getUserEnrollmentsCsvUrl(42)).toContain('/api/v1/admin/users/42/enrollments/csv/');
  });

  it('shows at least one em-dash when job, country, biography, and orgAdminOf are all empty', () => {
    renderWrapper(<UserDetailPage />);
    const dashes = screen.getAllByText('—');
    // job + country + biography + orgAdminOf = 4 dashes minimum
    expect(dashes.length).toBeGreaterThanOrEqual(4);
  });

  it('shows the actual biography when one is set', () => {
    (hooks.useUser as jest.Mock).mockReturnValue({
      data: { ...emptyProfileUser, biography: 'Teaching online since 2010.' }, isLoading: false, isError: false,
    });
    renderWrapper(<UserDetailPage />);
    expect(screen.getByText('Teaching online since 2010.')).toBeInTheDocument();
  });

  it('shows org short names joined by comma when orgAdminOf is non-empty', () => {
    (hooks.useUser as jest.Mock).mockReturnValue({
      data: { ...emptyProfileUser, roles: { ...emptyProfileUser.roles, orgAdminOf: ['RWAQ', 'ARBI'] } },
      isLoading: false,
      isError: false,
    });
    renderWrapper(<UserDetailPage />);
    expect(screen.getByText('RWAQ, ARBI')).toBeInTheDocument();
  });
});

jest.mock('@src/data/whoami', () => ({ useAdminCapabilities: jest.fn(() => ({ data: { role: 'superuser' } })) }));
