/**
 * ProgramDetailPage tabs: Courses and Learners only, also for an Enrollment code program (its codes are managed
 * on the Enrollment codes page). The cards, modals and tables are stubbed, they have their own tests.
 */
import { fireEvent, screen } from '@testing-library/react';
import { renderWrapper } from '@src/setupTest';
import * as hooks from './data/hooks';
import type { ProgramDetail } from './data/types';
import ProgramDetailPage from './ProgramDetailPage';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ uuid: 'uuid-1' }),
}));
jest.mock('./data/hooks', () => ({
  useProgram: jest.fn(),
  useProgramCourses: jest.fn(),
  useProgramLearners: jest.fn(),
  useCancelProgramInvite: jest.fn(),
  useUpdateProgram: jest.fn(),
}));
jest.mock('./components/ProgramPricingCard', () => ({ __esModule: true, default: () => null }));
jest.mock('./components/ProgramStatsStrip', () => ({ __esModule: true, default: () => null }));
jest.mock('./components/ProgramEmailTab', () => ({ __esModule: true, default: () => null }));
jest.mock('./components/ProgramStatusChips', () => ({ __esModule: true, default: () => null }));
jest.mock('./modals/BulkEnrollModal', () => ({ __esModule: true, default: () => null }));
jest.mock('./modals/UnenrollLearnerModal', () => ({ __esModule: true, default: () => null }));
jest.mock('@src/components/ToastContext', () => ({ useToast: () => ({ showToast: jest.fn() }) }));

const program = (pricingCategory: string) => ({
  uuid: 'uuid-1',
  programKey: 'program-v1:ARB+MASTERS+2026',
  name: 'Leadership',
  status: 'active',
  isHide: false,
  isFeatured: false,
  cardImage: null,
  pricingCategory,
} as unknown as ProgramDetail);

const empty = {
  data: { results: [], pagination: { count: 0, numPages: 1 } }, isLoading: false, isError: false,
};

const renderPage = (pricingCategory: string) => {
  (hooks.useProgram as jest.Mock).mockReturnValue({ data: program(pricingCategory), isLoading: false, isError: false });
  return renderWrapper(<ProgramDetailPage />);
};

beforeEach(() => {
  jest.clearAllMocks();
  window.history.pushState({}, '', '/programs/uuid-1');
  (hooks.useProgramCourses as jest.Mock).mockReturnValue(empty);
  (hooks.useProgramLearners as jest.Mock).mockReturnValue(empty);
  (hooks.useCancelProgramInvite as jest.Mock).mockReturnValue({ mutate: jest.fn(), isPending: false });
  (hooks.useUpdateProgram as jest.Mock).mockReturnValue({ mutate: jest.fn(), isPending: false });
});

describe('ProgramDetailPage', () => {
  it.each(['is_paid', 'is_enrollment_code'])('has the Courses, Learners and Email tabs for %s', (category) => {
    renderPage(category);
    expect(screen.getAllByRole('tab').map((tab) => tab.textContent)).toEqual(['Courses', 'Learners', 'Email']);
    expect(screen.getByRole('tab', { name: 'Courses' })).toHaveAttribute('aria-selected', 'true');
  });

  it('ignores ?tab=enrollment-code', () => {
    window.history.pushState({}, '', '/programs/uuid-1?tab=enrollment-code');
    renderPage('is_enrollment_code');
    expect(screen.getByRole('tab', { name: 'Courses' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.queryByRole('tab', { name: 'Enrollment code' })).not.toBeInTheDocument();
  });

  it('shows and cancels an invited learner', () => {
    const cancel = jest.fn();
    (hooks.useCancelProgramInvite as jest.Mock).mockReturnValue({ mutate: cancel, isPending: false });
    (hooks.useProgramLearners as jest.Mock).mockReturnValue({
      data: {
        results: [{
          id: 12, email: 'invite@example.com', name: '', status: 'invited', isActive: false,
        }],
        invitedCount: 1,
        pagination: { count: 1, numPages: 1 },
      },
      isLoading: false,
      isError: false,
    });
    renderPage('is_free');
    fireEvent.click(screen.getByRole('tab', { name: 'Learners' }));
    expect(screen.getByText('1 invited')).toBeInTheDocument();
    expect(screen.getByText('invite@example.com')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Cancel invite: invite@example.com' }));
    expect(cancel).toHaveBeenCalledWith(12, expect.objectContaining({ onError: expect.any(Function) }));
  });

  it('shows courses that failed when an invitation was claimed', () => {
    (hooks.useProgramLearners as jest.Mock).mockReturnValue({
      data: {
        results: [{
          id: 12,
          email: 'learner@example.com',
          name: 'Learner',
          status: 'enrolled',
          isActive: true,
          courseFailures: ['course-v1:Org+Course+2026'],
        }],
        invitedCount: 0,
        pagination: { count: 1, numPages: 1 },
      },
      isLoading: false,
      isError: false,
    });
    renderPage('is_free');
    fireEvent.click(screen.getByRole('tab', { name: 'Learners' }));
    expect(screen.getByText('Course enrollment failed: course-v1:Org+Course+2026')).toBeInTheDocument();
  });
});
