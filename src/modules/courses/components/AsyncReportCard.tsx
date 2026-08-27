/**
 * AsyncReportCard — a card for one async instructor report.
 *
 * Shows the last N runs of a given report type with their state, a
 * "Generate" button to trigger a new run, and a "Download" link for
 * completed runs.  Polls at 10 s while any task is QUEUING or IN_PROGRESS.
 */
import { Alert, Badge, Button, Spinner } from '@openedx/paragon';
import type { CourseReportType, ReportTask, TaskState } from '../data/reportsTypes';
import { useCourseReportTasks, useTriggerCourseReport } from '../data/reportsHooks';

// ── State badge ───────────────────────────────────────────────────────────────

const STATE_VARIANT: Record<TaskState, string> = {
  QUEUING: 'light',
  IN_PROGRESS: 'primary',
  SUCCESS: 'success',
  FAILURE: 'danger',
  REVOKED: 'secondary',
};

const STATE_LABEL: Record<TaskState, string> = {
  QUEUING: 'Queued',
  IN_PROGRESS: 'In Progress',
  SUCCESS: 'Done',
  FAILURE: 'Failed',
  REVOKED: 'Revoked',
};

const StateBadge = ({ state }: { state: TaskState }) => (
  <Badge variant={STATE_VARIANT[state] ?? 'light'} className="text-uppercase">
    {state === 'IN_PROGRESS' && (
      <Spinner animation="border" size="sm" className="mr-1" screenReaderText="" />
    )}
    {STATE_LABEL[state] ?? state}
  </Badge>
);

// ── Task row ──────────────────────────────────────────────────────────────────

const TaskRow = ({ task }: { task: ReportTask }) => {
  const created = new Date(task.created).toLocaleString();

  return (
    <tr>
      <td className="align-middle">{created}</td>
      <td className="align-middle">
        <StateBadge state={task.state} />
      </td>
      <td className="align-middle" style={{ fontVariantNumeric: 'tabular-nums' }}>
        {task.succeeded != null ? `${task.succeeded} / ${task.total ?? '?'}` : '—'}
      </td>
      <td className="align-middle text-right">
        {task.state === 'SUCCESS' && task.downloadUrl ? (
          <a
            href={task.downloadUrl}
            target="_blank"
            rel="noreferrer"
            className="btn btn-sm btn-outline-primary"
          >
            Download CSV
          </a>
        ) : (
          <span className="text-muted small">—</span>
        )}
      </td>
    </tr>
  );
};

// ── Main component ────────────────────────────────────────────────────────────

interface AsyncReportCardProps {
  courseId: string;
  reportType: CourseReportType;
  title: string;
  description?: string;
}

const AsyncReportCard = ({
  courseId,
  reportType,
  title,
  description,
}: AsyncReportCardProps) => {
  const {
    data: tasks, isLoading, isError,
  } = useCourseReportTasks(courseId, reportType);

  const {
    mutate: trigger, isPending: isTriggering, error: triggerError,
  } = useTriggerCourseReport(courseId);

  const hasRunning = tasks?.some((t) => t.state === 'QUEUING' || t.state === 'IN_PROGRESS') ?? false;

  return (
    <div className="rwaq-card mt-4">
      <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-3">
        <div>
          <h3 className="h5 mb-1">{title}</h3>
          {description && <p className="text-muted small mb-0">{description}</p>}
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => trigger(reportType)}
          disabled={isTriggering || hasRunning}
        >
          {isTriggering || hasRunning ? (
            <>
              <Spinner animation="border" size="sm" className="mr-2" screenReaderText="Generating" />
              Generating…
            </>
          ) : (
            'Generate Report'
          )}
        </Button>
      </div>

      {triggerError && (
        <Alert variant="danger" className="mb-3">
          {(triggerError as { response?: { data?: { detail?: string } } })
            ?.response?.data?.detail
            ?? 'Failed to trigger report. Try again.'}
        </Alert>
      )}

      {isError && (
        <Alert variant="warning" className="mb-3">
          Could not load report history. The table will refresh automatically.
        </Alert>
      )}

      {isLoading ? (
        <div className="d-flex justify-content-center py-3">
          <Spinner animation="border" size="sm" screenReaderText="Loading report history" />
        </div>
      ) : !tasks || tasks.length === 0 ? (
        <p className="text-muted small mb-0">No reports generated yet. Click Generate Report to start.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="table table-sm mb-0">
            <thead>
              <tr>
                <th>Generated</th>
                <th>Status</th>
                <th>Processed</th>
                <th className="text-right">File</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <TaskRow key={task.taskId} task={task} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AsyncReportCard;
