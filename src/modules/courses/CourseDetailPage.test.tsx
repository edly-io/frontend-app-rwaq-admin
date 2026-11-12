/**
 * CourseDetailPage: one page with no tab bar, also for an Enrollment code course (its codes are managed on the
 * Enrollment codes page). The cards, modals and tables are stubbed, they have their own tests.
 */
import { screen } from '@testing-library/react';
import { renderWrapper } from '@src/setupTest';
import * as hooks from './data/hooks';
import CourseDetailPage from './CourseDetailPage';

const COURSE_ID = 'course-v1:ARB+SAFE+2026';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ courseId: 'course-v1%3AARB%2BSAFE%2B2026' }),
}));
jest.mock('./data/hooks', () => ({
  useCourse: jest.fn(),
  useCourseEnrollments: jest.fn(),
  useCoursePricing: jest.fn(),
  useCourseStaff: jest.fn(),
  useDownloadCourseEnrollmentsCsv: jest.fn(),
  useRemoveCourseStaff: jest.fn(),
}));
jest.mock('@src/modules/users/data/hooks', () => ({
  useEnrollableCourses: () => ({ data: [], isLoading: false }),
}));
jest.mock('./components/CoursePricingCard', () => ({ __esModule: true, default: () => <div data-testid="pricing-card" /> }));
jest.mock('./modals/EnrollUserModal', () => ({ __esModule: true, default: () => null }));
jest.mock('./modals/AddStaffModal', () => ({ __esModule: true, default: () => null }));
jest.mock('@src/components/ToastContext', () => ({ useToast: () => ({ showToast: jest.fn() }) }));

const renderPage = (pricingCategory: string) => {
  (hooks.useCoursePricing as jest.Mock).mockReturnValue({ data: { pricingCategory } });
  return renderWrapper(<CourseDetailPage />);
};

beforeEach(() => {
  jest.clearAllMocks();
  window.history.pushState({}, '', `/courses/${encodeURIComponent(COURSE_ID)}`);
  (hooks.useCourse as jest.Mock).mockReturnValue({
    data: {
      courseId: COURSE_ID,
      displayName: 'Safety basics',
      org: 'ARB',
      categories: [],
      courseImageUrl: null,
      start: null,
      end: null,
      selfPaced: true,
    },
    isLoading: false,
    isError: false,
  });
  (hooks.useCourseEnrollments as jest.Mock).mockReturnValue({
    data: { results: [], pagination: { count: 0, numPages: 1 } }, isLoading: false, isError: false, refetch: jest.fn(),
  });
  (hooks.useCourseStaff as jest.Mock).mockReturnValue({ data: [], isLoading: false, isError: false });
  (hooks.useDownloadCourseEnrollmentsCsv as jest.Mock).mockReturnValue({ mutateAsync: jest.fn() });
  (hooks.useRemoveCourseStaff as jest.Mock).mockReturnValue({ mutateAsync: jest.fn() });
});

describe('CourseDetailPage', () => {
  it.each(['is_paid', 'is_enrollment_code'])('renders the whole page with no tabs for %s', (category) => {
    renderPage(category);
    expect(screen.queryByRole('tab')).not.toBeInTheDocument();
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
    expect(screen.queryByRole('tabpanel')).not.toBeInTheDocument();
    expect(screen.getByTestId('pricing-card')).toBeVisible();
  });

  it('ignores ?tab=enrollment-code', () => {
    window.history.pushState({}, '', `/courses/${encodeURIComponent(COURSE_ID)}?tab=enrollment-code`);
    renderPage('is_enrollment_code');
    expect(screen.queryByRole('tab')).not.toBeInTheDocument();
    expect(screen.getByTestId('pricing-card')).toBeVisible();
  });
});
