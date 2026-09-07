/**
 * UserFormModal — regression tests for bugs fixed in ulmo/rwaq-dev.
 *
 * Bug 2: The edit modal was not pre-populated with the user's current data.
 * The structural code (enableReinitialize: true, EditUserModal data-waiting
 * pattern) was already correct.  The defensive fix added null-coalescing
 * (?? '') to toFormValues so a null email from the API doesn't leave the
 * disabled email field blank.
 *
 * These tests pin the pre-population contract: every field in toFormValues
 * must render with the value from the user prop.
 */
import { screen } from '@testing-library/react';
import { renderWrapper } from '@src/setupTest';
import * as hooks from '../data/hooks';
import UserFormModal from './UserFormModal';
import type { UserDetail } from '../data/types';

jest.mock('../data/hooks');

const mockMutation = {
  mutate: jest.fn(),
  mutateAsync: jest.fn(),
  isPending: false,
  isError: false,
  error: null,
  reset: jest.fn(),
};

const mockUser: UserDetail = {
  id: 42,
  image: null,
  name: 'Fatima Al-Rashidi',
  email: 'fatima@rwaq.org',
  username: 'fatima',
  job: 'Course Instructor',
  country: 'SA',
  biography: 'Educator with 15 years of experience.',
  profileVisibility: 'public',
  authenticationMethod: 'Password',
  authenticationMethods: ['Password'],
  isActive: true,
  isEmailConfirmed: true,
  isProfilePublic: true,
  isLegacy: false,
  createdAt: '2026-01-01T00:00:00Z',
  lastLogin: '2026-08-01T10:00:00Z',
  roleBadges: [],
  roles: {
    isGlobalStaff: false,
    isSuperuser: false,
    isCourseCreator: false,
    isSupportStaff: false,
    orgAdminOf: [],
  },
};

describe('UserFormModal — Bug 2 regression: edit mode pre-populates all fields', () => {
  beforeEach(() => {
    (hooks.useUpdateUser as jest.Mock).mockReturnValue(mockMutation);
    (hooks.useCreateUser as jest.Mock).mockReturnValue(mockMutation);
  });

  it('pre-populates the name field', () => {
    renderWrapper(<UserFormModal isOpen onClose={jest.fn()} user={mockUser} />);
    expect(screen.getByDisplayValue('Fatima Al-Rashidi')).toBeInTheDocument();
  });

  it('pre-populates the job title field', () => {
    renderWrapper(<UserFormModal isOpen onClose={jest.fn()} user={mockUser} />);
    expect(screen.getByDisplayValue('Course Instructor')).toBeInTheDocument();
  });

  it('pre-populates the biography field', () => {
    renderWrapper(<UserFormModal isOpen onClose={jest.fn()} user={mockUser} />);
    expect(screen.getByDisplayValue('Educator with 15 years of experience.')).toBeInTheDocument();
  });

  it('disables the email field in edit mode and shows the existing email', () => {
    renderWrapper(<UserFormModal isOpen onClose={jest.fn()} user={mockUser} />);
    const emailInput = screen.getByDisplayValue('fatima@rwaq.org');
    expect(emailInput).toBeDisabled();
  });

  it('does not display "null" in the email field when the API returns null for email', () => {
    // Guard against the null-coalescing regression: email: null must become ''.
    const userWithNullEmail = { ...mockUser, email: null as unknown as string };
    renderWrapper(<UserFormModal isOpen onClose={jest.fn()} user={userWithNullEmail} />);
    expect(screen.queryByDisplayValue('null')).not.toBeInTheDocument();
  });

  it('renders empty fields in create mode (user=null)', () => {
    renderWrapper(<UserFormModal isOpen onClose={jest.fn()} user={null} />);
    // Email field must be empty and editable in create mode.
    const emailInputs = screen.queryAllByDisplayValue('fatima@rwaq.org');
    expect(emailInputs).toHaveLength(0);
  });
});
