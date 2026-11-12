/**
 * CourseDetailPage tabs: everything on the page sits in Details, and an Enrollment code tab with the course's
 * codes shows only for an Enrollment code course, opened by click or by `?tab=enrollment-code` (the pricing
 * card's banner uses it). The cards, modals and tables are stubbed, they have their own tests.
 */
import { fireEvent, screen } from '@testing-library/react';
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
jest.mock('@src/modules/enrollment-codes/components/CodesCard', () => ({
  __esModule: true,
  default: ({ item }: { item: { kind: string; id: string } }) => (
    <div data-testid="codes-card" data-kind={item.kind} data-id={item.id} />
  ),
}));

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

describe('CourseDetailPage Enrollment code tab', () => {
  it('shows no tabs for another type, and keeps the page as it was', () => {
    renderPage('is_paid');
    expect(screen.queryByRole('tab')).not.toBeInTheDocument();
    expect(screen.queryByTestId('codes-card')).not.toBeInTheDocument();
    expect(screen.getByTestId('pricing-card')).toBeVisible();
  });

  it('shows Details and Enrollment code for an Enrollment code course, on Details first', () => {
    renderPage('is_enrollment_code');
    expect(screen.getByRole('tab', { name: 'Details' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'Enrollment code' })).toHaveAttribute('aria-selected', 'false');
    expect(screen.getByTestId('pricing-card')).toBeVisible();
    expect(screen.getByTestId('codes-card').closest('[role="tabpanel"]')).not.toBeVisible();
  });

  it('opens the tab on click with the codes of this course, and Details brings the page back', () => {
    renderPage('is_enrollment_code');
    fireEvent.click(screen.getByRole('tab', { name: 'Enrollment code' }));
    expect(window.location.search).toContain('tab=enrollment-code');
    const card = screen.getByTestId('codes-card');
    expect(card).toHaveAttribute('data-kind', 'course');
    expect(card).toHaveAttribute('data-id', COURSE_ID);
    expect(card.closest('[role="tabpanel"]')).toBeVisible();
    expect(screen.getByTestId('pricing-card')).not.toBeVisible();
    fireEvent.click(screen.getByRole('tab', { name: 'Details' }));
    expect(window.location.search).not.toContain('tab=');
    expect(screen.getByTestId('pricing-card')).toBeVisible();
  });

  it('opens from ?tab=enrollment-code, and ignores it for another type', () => {
    window.history.pushState({}, '', `/courses/${encodeURIComponent(COURSE_ID)}?tab=enrollment-code`);
    const { unmount } = renderPage('is_enrollment_code');
    expect(screen.getByRole('tab', { name: 'Enrollment code' })).toHaveAttribute('aria-selected', 'true');
    unmount();
    renderPage('is_free');
    expect(screen.queryByRole('tab')).not.toBeInTheDocument();
    expect(screen.getByTestId('pricing-card')).toBeVisible();
  });
});
