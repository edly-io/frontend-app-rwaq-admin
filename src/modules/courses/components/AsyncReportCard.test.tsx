/**
 * AsyncReportCard — unit tests covering all five observable UI states.
 *
 * States:
 *   1. Loading   — isLoading: true → loading spinner shown
 *   2. Error     — isError: true   → warning alert shown
 *   3. Empty     — data: []        → "No reports yet" message shown
 *   4. Table     — data: [task]    → table row with state badge shown
 *   5. Trigger error — triggerError set → danger alert shown
 */
import { fireEvent, screen } from '@testing-library/react';
import { renderWrapper } from '@src/setupTest';
import * as reportsHooks from '../data/reportsHooks';
import AsyncReportCard from './AsyncReportCard';

jest.mock('../data/reportsHooks');

const mockTrigger = jest.fn();

const defaultMutation = {
  mutate: mockTrigger,
  mutateAsync: jest.fn(),
  isPending: false,
  isError: false,
  error: null,
  reset: jest.fn(),
};

const defaultProps = {
  courseId: 'course-v1:Org+Course+Run',
  reportType: 'grade_csv' as const,
  title: 'Grade Report',
  description: 'Grades for all enrolled learners.',
};

const baseTask = {
  taskId: 'task-abc-123',
  state: 'SUCCESS' as const,
  created: '2026-01-15T10:30:00Z',
  modified: '2026-01-15T10:31:00Z',
  downloadUrl: 'https://example.com/grades.csv',
  succeeded: 42,
  failed: 0,
  total: 42,
};

beforeEach(() => {
  jest.clearAllMocks();
  (reportsHooks.useTriggerCourseReport as jest.Mock).mockReturnValue(defaultMutation);
});

describe('AsyncReportCard — State 1: loading', () => {
  it('shows a loading spinner while tasks are being fetched', () => {
    (reportsHooks.useCourseReportTasks as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    });
    renderWrapper(<AsyncReportCard {...defaultProps} />);
    // The Paragon Spinner renders its screenReaderText in the DOM
    expect(screen.getByText('Loading report history')).toBeInTheDocument();
  });

  it('does not show the table or empty message while loading', () => {
    (reportsHooks.useCourseReportTasks as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    });
    renderWrapper(<AsyncReportCard {...defaultProps} />);
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.queryByText(/No reports generated yet/i)).not.toBeInTheDocument();
  });
});

describe('AsyncReportCard — State 2: error loading history', () => {
  it('shows a warning alert when the task list fails to load', () => {
    (reportsHooks.useCourseReportTasks as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    });
    renderWrapper(<AsyncReportCard {...defaultProps} />);
    expect(
      screen.getByText('Could not load report history. The table will refresh automatically.'),
    ).toBeInTheDocument();
  });
});

describe('AsyncReportCard — State 3: empty task list', () => {
  it('shows the "no reports yet" message when the list is empty', () => {
    (reportsHooks.useCourseReportTasks as jest.Mock).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    });
    renderWrapper(<AsyncReportCard {...defaultProps} />);
    expect(
      screen.getByText('No reports generated yet. Click Generate Report to start.'),
    ).toBeInTheDocument();
  });

  it('does not render a table when the list is empty', () => {
    (reportsHooks.useCourseReportTasks as jest.Mock).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    });
    renderWrapper(<AsyncReportCard {...defaultProps} />);
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });
});

describe('AsyncReportCard — State 4: tasks table', () => {
  beforeEach(() => {
    (reportsHooks.useCourseReportTasks as jest.Mock).mockReturnValue({
      data: [baseTask],
      isLoading: false,
      isError: false,
    });
  });

  it('renders a table row for each task', () => {
    renderWrapper(<AsyncReportCard {...defaultProps} />);
    expect(screen.getByRole('table')).toBeInTheDocument();
    // SUCCESS badge
    expect(screen.getByText('Done')).toBeInTheDocument();
  });

  it('shows a download link for a completed task with a URL', () => {
    renderWrapper(<AsyncReportCard {...defaultProps} />);
    const link = screen.getByRole('link', { name: /download csv/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', baseTask.downloadUrl);
  });

  it('shows processed count when succeeded and total are set', () => {
    renderWrapper(<AsyncReportCard {...defaultProps} />);
    expect(screen.getByText('42 / 42')).toBeInTheDocument();
  });

  it('renders a QUEUING task with its badge', () => {
    (reportsHooks.useCourseReportTasks as jest.Mock).mockReturnValue({
      data: [{ ...baseTask, taskId: 'task-queuing', state: 'QUEUING', downloadUrl: null, succeeded: null, total: null }],
      isLoading: false,
      isError: false,
    });
    renderWrapper(<AsyncReportCard {...defaultProps} />);
    expect(screen.getByText('Queued')).toBeInTheDocument();
  });

  it('renders a FAILURE task with its badge', () => {
    (reportsHooks.useCourseReportTasks as jest.Mock).mockReturnValue({
      data: [{ ...baseTask, taskId: 'task-fail', state: 'FAILURE', downloadUrl: null }],
      isLoading: false,
      isError: false,
    });
    renderWrapper(<AsyncReportCard {...defaultProps} />);
    expect(screen.getByText('Failed')).toBeInTheDocument();
  });
});

describe('AsyncReportCard — State 5: trigger error', () => {
  it('shows a danger alert when triggering the report fails', () => {
    (reportsHooks.useCourseReportTasks as jest.Mock).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    });
    (reportsHooks.useTriggerCourseReport as jest.Mock).mockReturnValue({
      ...defaultMutation,
      error: new Error('Trigger failed'),
    });
    renderWrapper(<AsyncReportCard {...defaultProps} />);
    expect(
      screen.getByText('Failed to trigger report. Try again.'),
    ).toBeInTheDocument();
  });

  it('shows the server detail message when available in the error response', () => {
    (reportsHooks.useCourseReportTasks as jest.Mock).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    });
    const triggerError = { response: { data: { detail: 'Rate limit exceeded.' } } };
    (reportsHooks.useTriggerCourseReport as jest.Mock).mockReturnValue({
      ...defaultMutation,
      error: triggerError,
    });
    renderWrapper(<AsyncReportCard {...defaultProps} />);
    expect(screen.getByText('Rate limit exceeded.')).toBeInTheDocument();
  });
});

describe('AsyncReportCard — Generate button', () => {
  it('calls trigger with the report type when Generate Report is clicked', () => {
    (reportsHooks.useCourseReportTasks as jest.Mock).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    });
    renderWrapper(<AsyncReportCard {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /generate report/i }));
    expect(mockTrigger).toHaveBeenCalledWith('grade_csv');
  });

  it('disables the button while a task is in progress', () => {
    (reportsHooks.useCourseReportTasks as jest.Mock).mockReturnValue({
      data: [{ ...baseTask, state: 'IN_PROGRESS', downloadUrl: null }],
      isLoading: false,
      isError: false,
    });
    renderWrapper(<AsyncReportCard {...defaultProps} />);
    expect(screen.getByRole('button', { name: /generating/i })).toBeDisabled();
  });
});
