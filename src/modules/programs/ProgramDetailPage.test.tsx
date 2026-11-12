/**
 * ProgramDetailPage tabs: Courses and Learners always, and Enrollment code only for an Enrollment code program,
 * opened by click or by `?tab=enrollment-code` (the pricing card's banner uses it).
 * The cards, modals and tables are stubbed, they have their own tests.
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
  useUpdateProgram: jest.fn(),
}));
jest.mock('./components/ProgramPricingCard', () => ({ __esModule: true, default: () => null }));
jest.mock('./components/ProgramStatusChips', () => ({ __esModule: true, default: () => null }));
jest.mock('./modals/BulkEnrollModal', () => ({ __esModule: true, default: () => null }));
jest.mock('./modals/UnenrollLearnerModal', () => ({ __esModule: true, default: () => null }));
jest.mock('@src/components/ToastContext', () => ({ useToast: () => ({ showToast: jest.fn() }) }));
jest.mock('@src/modules/enrollment-codes/components/CodesCard', () => ({
  __esModule: true,
  default: ({ item }: { item: { kind: string; id: string } }) => (
    <div data-testid="codes-card" data-kind={item.kind} data-id={item.id} />
  ),
}));

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
  (hooks.useUpdateProgram as jest.Mock).mockReturnValue({ mutate: jest.fn(), isPending: false });
});

describe('ProgramDetailPage Enrollment code tab', () => {
  it('has no Enrollment code tab for another type', () => {
    renderPage('is_paid');
    expect(screen.getByRole('tab', { name: 'Courses' })).toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: 'Enrollment code' })).not.toBeInTheDocument();
    expect(screen.queryByTestId('codes-card')).not.toBeInTheDocument();
  });

  it('shows the tab for an Enrollment code program, with the codes of this program', () => {
    renderPage('is_enrollment_code');
    expect(screen.getByRole('tab', { name: 'Courses' })).toHaveAttribute('aria-selected', 'true');
    const card = screen.getByTestId('codes-card');
    expect(card).toHaveAttribute('data-kind', 'program');
    expect(card).toHaveAttribute('data-id', 'uuid-1');
    expect(card.closest('[role="tabpanel"]')).not.toBeVisible();
    fireEvent.click(screen.getByRole('tab', { name: 'Enrollment code' }));
    expect(window.location.search).toBe('?tab=enrollment-code');
    expect(screen.getByRole('tab', { name: 'Enrollment code' })).toHaveAttribute('aria-selected', 'true');
    expect(card.closest('[role="tabpanel"]')).toBeVisible();
  });

  it('opens from ?tab=enrollment-code', () => {
    window.history.pushState({}, '', '/programs/uuid-1?tab=enrollment-code');
    renderPage('is_enrollment_code');
    expect(screen.getByRole('tab', { name: 'Enrollment code' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByTestId('codes-card').closest('[role="tabpanel"]')).toBeVisible();
  });

  it('ignores ?tab=enrollment-code for a program of another type', () => {
    window.history.pushState({}, '', '/programs/uuid-1?tab=enrollment-code');
    renderPage('is_free');
    expect(screen.getByRole('tab', { name: 'Courses' })).toHaveAttribute('aria-selected', 'true');
  });
});
