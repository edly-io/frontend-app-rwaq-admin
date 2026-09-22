/**
 * ProgramReportsPage — unit tests covering:
 *   AC21 "Reports" button present on detail page (checked in ProgramDetailPage.test)
 *   AC22 Page layout: generate section, download section, trigger rows, table
 *   AC28a Frontend duplicate guard: spinner shown + no button when in-flight task exists
 *   AC29 Error state: error alert when task-list fails
 *   Loading state: spinner shown while program is loading
 */
import { screen, fireEvent, within } from '@testing-library/react';
import { renderWrapper } from '@src/setupTest';
import * as hooks from '../data/hooks';
import * as reportsHooks from '../data/reportsHooks';
import ProgramReportsPage from './ProgramReportsPage';
import type { ProgramReportTask, ProgramReportTasksPage } from '../data/reportsTypes';

// Mock the router params
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ uuid: 'test-uuid-1234' }),
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
}));

jest.mock('../data/hooks');
jest.mock('../data/reportsHooks');

const mockMutate = jest.fn();
const defaultMutation = {
  mutate: mockMutate,
  mutateAsync: jest.fn(),
  isPending: false,
  isError: false,
  error: null,
  reset: jest.fn(),
};

const mockProgram = {
  uuid: 'test-uuid-1234',
  name: 'Test Program',
  status: 'active',
  isHide: false,
  isFeatured: false,
  programKey: 'program-v1:TEST+TYPE+01',
  organization: 'TestOrg',
  created: '2026-01-01T00:00:00Z',
  modified: '2026-09-01T00:00:00Z',
  totalCourses: 3,
  totalEnrollments: 42,
};

const makeTask = (overrides: Partial<ProgramReportTask> = {}): ProgramReportTask => ({
  id: 'task-001',
  reportType: 'enrollment_progress',
  reportTypeDisplay: 'Enrollment & Progress',
  status: 'complete',
  created: '2026-09-15T10:00:00Z',
  completedAt: '2026-09-15T10:00:04Z',
  elapsedSeconds: 4,
  progressCurrent: 240,
  progressTotal: 240,
  downloadUrl: 'https://example.com/r.csv',
  ...overrides,
});

const emptyTasksPage: ProgramReportTasksPage = {
  results: [],
  pagination: {
    count: 0,
    numPages: 1,
    next: null,
    previous: null,
  },
};

beforeEach(() => {
  jest.clearAllMocks();
  (hooks.useProgram as jest.Mock).mockReturnValue({
    data: mockProgram,
    isLoading: false,
    isError: false,
    error: null,
  });
  (reportsHooks.useProgramReportTasks as jest.Mock).mockReturnValue({
    data: emptyTasksPage,
    isLoading: false,
    isError: false,
  });
  (reportsHooks.useTriggerProgramReport as jest.Mock).mockReturnValue(defaultMutation);
});

// ── Loading state ─────────────────────────────────────────────────────────────

describe('ProgramReportsPage — loading', () => {
  it('shows a spinner while the program is loading', () => {
    (hooks.useProgram as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    });
    renderWrapper(<ProgramReportsPage />);
    expect(screen.getByText('Loading program…')).toBeInTheDocument();
  });

  it('does not render the generate section while loading', () => {
    (hooks.useProgram as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    });
    renderWrapper(<ProgramReportsPage />);
    expect(screen.queryByText('Generate Reports')).not.toBeInTheDocument();
  });
});

// ── AC22: Page layout ─────────────────────────────────────────────────────────

describe('ProgramReportsPage — layout (AC22)', () => {
  it('renders the "Generate Reports" section header', () => {
    renderWrapper(<ProgramReportsPage />);
    expect(screen.getByText('Generate Reports')).toBeInTheDocument();
  });

  it('renders the "Reports Available for Download" section header', () => {
    renderWrapper(<ProgramReportsPage />);
    expect(screen.getByText('Reports Available for Download')).toBeInTheDocument();
  });

  it('renders the subtitle about auto-refresh and download expiry', () => {
    renderWrapper(<ProgramReportsPage />);
    expect(screen.getByText(/Auto-refreshes every 10s/)).toBeInTheDocument();
    expect(screen.getByText(/Download links expire after 1 hour/)).toBeInTheDocument();
  });

  it('renders the enrollment report row with its label and description', () => {
    renderWrapper(<ProgramReportsPage />);
    expect(screen.getByText('Enrollment & Progress Report')).toBeInTheDocument();
    expect(screen.getByText(/Generates a CSV of all program enrollments/)).toBeInTheDocument();
  });

  it('renders the completion report row with its label and description', () => {
    renderWrapper(<ProgramReportsPage />);
    expect(screen.getByText('Completion Summary')).toBeInTheDocument();
    expect(screen.getByText(/Generates a CSV summary of program completion/)).toBeInTheDocument();
  });

  it('renders four Generate buttons — one per report type', () => {
    renderWrapper(<ProgramReportsPage />);
    const btns = screen.getAllByRole('button', { name: 'Generate' });
    expect(btns).toHaveLength(4);
  });

  it('renders the breadcrumb linking to /programs', () => {
    renderWrapper(<ProgramReportsPage />);
    const programsLink = screen.getByRole('link', { name: 'Programs' });
    expect(programsLink).toHaveAttribute('href', '/programs');
  });
});

// ── AC28a: duplicate in-flight guard ─────────────────────────────────────────

describe('ProgramReportsPage — duplicate in-flight guard (AC28a)', () => {
  it('shows a spinner (not a Generate button) for enrollment row when in_progress', () => {
    (reportsHooks.useProgramReportTasks as jest.Mock).mockReturnValue({
      data: {
        ...emptyTasksPage,
        results: [
          makeTask({
            reportType: 'enrollment_progress',
            status: 'in_progress',
            downloadUrl: null,
            elapsedSeconds: null,
          }),
        ],
      },
      isLoading: false,
      isError: false,
    });
    renderWrapper(<ProgramReportsPage />);
    // Enrollment row: spinner present, no Generate button in that row
    const enrollmentRow = screen.getByText('Enrollment & Progress Report').closest('div[class*="py-4"]') as HTMLElement;
    expect(within(enrollmentRow).queryByRole('button', { name: 'Generate' })).not.toBeInTheDocument();
    // Three Generate buttons still visible for the other report types
    expect(screen.getAllByRole('button', { name: 'Generate' })).toHaveLength(3);
  });

  it('shows running status message below spinner when in_progress task exists', () => {
    (reportsHooks.useProgramReportTasks as jest.Mock).mockReturnValue({
      data: {
        ...emptyTasksPage,
        results: [
          makeTask({
            reportType: 'enrollment_progress',
            status: 'pending',
            downloadUrl: null,
            elapsedSeconds: null,
          }),
        ],
      },
      isLoading: false,
      isError: false,
    });
    renderWrapper(<ProgramReportsPage />);
    expect(
      screen.getByText('Your report is being generated…'),
    ).toBeInTheDocument();
  });

  it('still shows the Completion Generate button when only enrollment is in-flight', () => {
    (reportsHooks.useProgramReportTasks as jest.Mock).mockReturnValue({
      data: {
        ...emptyTasksPage,
        results: [
          makeTask({
            reportType: 'enrollment_progress',
            status: 'pending',
            downloadUrl: null,
            elapsedSeconds: null,
          }),
        ],
      },
      isLoading: false,
      isError: false,
    });
    renderWrapper(<ProgramReportsPage />);
    const completionRow = screen.getByText('Completion Summary').closest('div[class*="py-4"]') as HTMLElement;
    expect(within(completionRow).getByRole('button', { name: 'Generate' })).toBeInTheDocument();
  });

  it('shows a Generate button after the in-flight task completes (no trackedTaskId set)', () => {
    (reportsHooks.useProgramReportTasks as jest.Mock).mockReturnValue({
      data: {
        ...emptyTasksPage,
        results: [
          makeTask({ reportType: 'enrollment_progress', status: 'complete' }),
        ],
      },
      isLoading: false,
      isError: false,
    });
    renderWrapper(<ProgramReportsPage />);
    // All four rows show Generate buttons (no trackedTaskId set, so no inline download widget)
    expect(screen.getAllByRole('button', { name: 'Generate' })).toHaveLength(4);
  });
});

// ── AC29: error state ─────────────────────────────────────────────────────────

describe('ProgramReportsPage — task list error (AC29)', () => {
  it('shows the error alert when task-list API fails', () => {
    (reportsHooks.useProgramReportTasks as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    });
    renderWrapper(<ProgramReportsPage />);
    expect(
      screen.getByText('Could not load report history. Please refresh.'),
    ).toBeInTheDocument();
  });

  it('still renders the Generate buttons even when the table errors', () => {
    (reportsHooks.useProgramReportTasks as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    });
    renderWrapper(<ProgramReportsPage />);
    expect(screen.getAllByRole('button', { name: 'Generate' })).toHaveLength(4);
  });
});

// ── AC28a: onError paths ──────────────────────────────────────────────────────

describe('ProgramReportsPage — onError paths (AC28a)', () => {
  it('shows duplicate warning when server returns 409', () => {
    mockMutate.mockImplementation((_reportType: string, { onError }: { onError: (err: unknown) => void }) => {
      onError({ response: { status: 409 } });
    });
    renderWrapper(<ProgramReportsPage />);
    const enrollmentRow = screen.getByText('Enrollment & Progress Report').closest('div[class*="py-4"]') as HTMLElement;
    fireEvent.click(within(enrollmentRow).getByRole('button', { name: 'Generate' }));
    expect(
      screen.getByText('A report of this type is already being generated.'),
    ).toBeInTheDocument();
  });

  it('shows generic error message when server returns a non-409 error', () => {
    mockMutate.mockImplementation((_reportType: string, { onError }: { onError: (err: unknown) => void }) => {
      onError({ response: { status: 500, data: {} } });
    });
    renderWrapper(<ProgramReportsPage />);
    const enrollmentRow = screen.getByText('Enrollment & Progress Report').closest('div[class*="py-4"]') as HTMLElement;
    fireEvent.click(within(enrollmentRow).getByRole('button', { name: 'Generate' }));
    expect(
      screen.getByText('Failed to queue report. Please try again.'),
    ).toBeInTheDocument();
  });
});

// ── Generate button fires mutation ────────────────────────────────────────────

describe('ProgramReportsPage — generate triggers mutation', () => {
  it('calls mutate with enrollment_progress when enrollment Generate is clicked', () => {
    renderWrapper(<ProgramReportsPage />);
    const enrollmentRow = screen.getByText('Enrollment & Progress Report').closest('div[class*="py-4"]') as HTMLElement;
    fireEvent.click(within(enrollmentRow).getByRole('button', { name: 'Generate' }));
    expect(mockMutate).toHaveBeenCalledWith('enrollment_progress', expect.any(Object));
  });

  it('calls mutate with completion_summary when completion Generate is clicked', () => {
    renderWrapper(<ProgramReportsPage />);
    const completionRow = screen.getByText('Completion Summary').closest('div[class*="py-4"]') as HTMLElement;
    fireEvent.click(within(completionRow).getByRole('button', { name: 'Generate' }));
    expect(mockMutate).toHaveBeenCalledWith('completion_summary', expect.any(Object));
  });
});
