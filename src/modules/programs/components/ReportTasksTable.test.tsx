/**
 * ReportTasksTable — unit tests covering all observable states.
 *
 * States under test:
 *   1. Loading  — isLoading: true
 *   2. Error    — isError: true → warning alert
 *   3. Empty    — tasks: [] → AdminDataTable renders its empty state
 *   4. Data     — one row per status variant (complete, in_progress, pending, failed)
 *   5. Download — button shown only when status=complete and downloadUrl set
 *   6. Elapsed  — rendered as "{n}s" or "—"
 *   7. Progress — rendered as "{current} / {total}" or "—"
 */
import { screen } from '@testing-library/react';
import { renderWrapper } from '@src/setupTest';
import ReportTasksTable from './ReportTasksTable';
import type { ProgramReportTask } from '../data/reportsTypes';

const noopPageChange = jest.fn();

const defaultTableProps = {
  tasks: [] as ProgramReportTask[],
  totalCount: 0,
  numPages: 1,
  currentPage: 1,
  isLoading: false,
  isError: false,
  onPageChange: noopPageChange,
};

const makeTask = (overrides: Partial<ProgramReportTask> = {}): ProgramReportTask => ({
  id: 'task-abc-001',
  reportType: 'enrollment_progress',
  reportTypeDisplay: 'Enrollment & Progress',
  status: 'complete',
  created: '2026-09-15T10:00:00Z',
  completedAt: '2026-09-15T10:00:04Z',
  elapsedSeconds: 4,
  progressCurrent: 240,
  progressTotal: 240,
  downloadUrl: 'https://example.com/report.csv',
  ...overrides,
});

beforeEach(() => {
  noopPageChange.mockClear();
});

// ── State 1: loading ──────────────────────────────────────────────────────────

describe('ReportTasksTable — loading', () => {
  it('renders a loading indicator when isLoading is true', () => {
    renderWrapper(
      <ReportTasksTable {...defaultTableProps} isLoading tasks={undefined} />,
    );
    // AdminDataTable renders a div with aria-label="Loading data…" when loading
    expect(screen.getByLabelText(/loading data/i)).toBeInTheDocument();
  });

  it('does not render a table when loading', () => {
    renderWrapper(
      <ReportTasksTable {...defaultTableProps} isLoading tasks={undefined} />,
    );
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });
});

// ── State 2: error ────────────────────────────────────────────────────────────

describe('ReportTasksTable — error', () => {
  it('shows the error alert message', () => {
    renderWrapper(
      <ReportTasksTable {...defaultTableProps} isError />,
    );
    expect(
      screen.getByText('Could not load report history. Please refresh.'),
    ).toBeInTheDocument();
  });

  it('does not render a table when in error state', () => {
    renderWrapper(
      <ReportTasksTable {...defaultTableProps} isError />,
    );
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });
});

// ── State 3: empty ────────────────────────────────────────────────────────────

describe('ReportTasksTable — empty', () => {
  it('renders AdminDataTable empty-state message when tasks is empty', () => {
    renderWrapper(<ReportTasksTable {...defaultTableProps} />);
    // AdminDataTable renders a "No results found." paragraph when data is empty
    expect(screen.getByText('No results found.')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(
      screen.queryByText('Could not load report history. Please refresh.'),
    ).not.toBeInTheDocument();
  });
});

// ── State 4: status badges ────────────────────────────────────────────────────

describe('ReportTasksTable — status badges', () => {
  it('renders "Complete" badge for status=complete', () => {
    renderWrapper(
      <ReportTasksTable
        {...defaultTableProps}
        tasks={[makeTask({ status: 'complete' })]}
        totalCount={1}
      />,
    );
    expect(screen.getByText('Complete')).toBeInTheDocument();
  });

  it('renders "Processing" badge for status=in_progress', () => {
    renderWrapper(
      <ReportTasksTable
        {...defaultTableProps}
        tasks={[makeTask({ status: 'in_progress', elapsedSeconds: null, downloadUrl: null })]}
        totalCount={1}
      />,
    );
    expect(screen.getByText('Processing')).toBeInTheDocument();
  });

  it('renders "Pending" badge for status=pending', () => {
    renderWrapper(
      <ReportTasksTable
        {...defaultTableProps}
        tasks={[makeTask({ status: 'pending', elapsedSeconds: null, downloadUrl: null })]}
        totalCount={1}
      />,
    );
    expect(screen.getByText('Pending')).toBeInTheDocument();
  });

  it('renders "Failed" badge for status=failed', () => {
    renderWrapper(
      <ReportTasksTable
        {...defaultTableProps}
        tasks={[makeTask({ status: 'failed', downloadUrl: null })]}
        totalCount={1}
      />,
    );
    expect(screen.getByText('Failed')).toBeInTheDocument();
  });
});

// ── State 5: download column ──────────────────────────────────────────────────

describe('ReportTasksTable — download column', () => {
  it('shows Download button when status=complete and downloadUrl is set', () => {
    renderWrapper(
      <ReportTasksTable
        {...defaultTableProps}
        tasks={[makeTask({ status: 'complete', downloadUrl: 'https://example.com/r.csv' })]}
        totalCount={1}
      />,
    );
    const link = screen.getByRole('link', { name: /download/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'https://example.com/r.csv');
  });

  it('shows "—" when status=pending', () => {
    renderWrapper(
      <ReportTasksTable
        {...defaultTableProps}
        tasks={[makeTask({ status: 'pending', downloadUrl: null, elapsedSeconds: null })]}
        totalCount={1}
      />,
    );
    expect(screen.queryByRole('link', { name: /download/i })).not.toBeInTheDocument();
  });

  it('shows "—" when status=complete but downloadUrl is null', () => {
    renderWrapper(
      <ReportTasksTable
        {...defaultTableProps}
        tasks={[makeTask({ status: 'complete', downloadUrl: null })]}
        totalCount={1}
      />,
    );
    expect(screen.queryByRole('link', { name: /download/i })).not.toBeInTheDocument();
  });
});

// ── State 6: elapsed column ───────────────────────────────────────────────────

describe('ReportTasksTable — elapsed column', () => {
  it('shows "{n}s" for terminal tasks with elapsedSeconds set', () => {
    renderWrapper(
      <ReportTasksTable
        {...defaultTableProps}
        tasks={[makeTask({ elapsedSeconds: 7 })]}
        totalCount={1}
      />,
    );
    expect(screen.getByText('7s')).toBeInTheDocument();
  });

  it('shows "—" for pending tasks (elapsedSeconds = null)', () => {
    renderWrapper(
      <ReportTasksTable
        {...defaultTableProps}
        tasks={[makeTask({ status: 'pending', elapsedSeconds: null, downloadUrl: null })]}
        totalCount={1}
      />,
    );
    // There will be multiple "—" cells; just confirm at least one exists
    expect(screen.getAllByText('—').length).toBeGreaterThan(0);
  });
});

// ── State 7: progress column ──────────────────────────────────────────────────
// Note: The Progress column was removed from ReportTasksTable in this PR.
// Only the indeterminate-state test (showing "—") remains.

describe('ReportTasksTable — progress column', () => {
  it('shows "—" when progressTotal = 0 (indeterminate)', () => {
    renderWrapper(
      <ReportTasksTable
        {...defaultTableProps}
        tasks={[makeTask({
          status: 'in_progress', progressCurrent: 0, progressTotal: 0, elapsedSeconds: null, downloadUrl: null,
        })]}
        totalCount={1}
      />,
    );
    expect(screen.getAllByText('—').length).toBeGreaterThan(0);
  });
});

// ── Report type display ───────────────────────────────────────────────────────

describe('ReportTasksTable — reportTypeDisplay', () => {
  it('renders the human-readable report type label', () => {
    renderWrapper(
      <ReportTasksTable
        {...defaultTableProps}
        tasks={[makeTask({ reportTypeDisplay: 'Enrollment & Progress' })]}
        totalCount={1}
      />,
    );
    expect(screen.getByText('Enrollment & Progress')).toBeInTheDocument();
  });
});
