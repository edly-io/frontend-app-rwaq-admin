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
import * as hooks from './data/hooks';
import UserDetailPage from './UserDetailPage';

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
    (hooks.useUser as jest.Mock).mockReturnValue({
      data: emptyProfileUser, isLoading: false, isError: false,
    });
    (hooks.useUserEnrollments as jest.Mock).mockReturnValue({
      data: [], isLoading: false, isError: false,
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

  it('never shows the raw message id for an empty field', () => {
    renderWrapper(<UserDetailPage />);
    expect(screen.queryByText('rwaq.admin.users.detail.none')).not.toBeInTheDocument();
  });

  it('shows at least one em-dash when job, country, biography, and orgAdminOf are all empty', () => {
    renderWrapper(<UserDetailPage />);
    const dashes = screen.getAllByText('—');
    // job + country + biography + orgAdminOf = 4 dashes minimum
    expect(dashes.length).toBeGreaterThanOrEqual(4);
  });

  it('shows the actual job title when one is set', () => {
    (hooks.useUser as jest.Mock).mockReturnValue({
      data: { ...emptyProfileUser, job: 'Software Engineer' }, isLoading: false, isError: false,
    });
    renderWrapper(<UserDetailPage />);
    expect(screen.getByText('Software Engineer')).toBeInTheDocument();
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
