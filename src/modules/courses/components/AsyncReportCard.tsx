/**
 * AsyncReportCard — a card for one async instructor report.
 *
 * Shows the last N runs of a given report type with their state, a
 * "Generate" button to trigger a new run, and a "Download" link for
 * completed runs.  Polls at 10 s while any task is QUEUING or IN_PROGRESS.
 */
import { Alert, Badge, Button, Spinner } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import type { CourseReportType, ReportTask, TaskState } from '../data/reportsTypes';
import { useCourseReportTasks, useTriggerCourseReport } from '../data/reportsHooks';
import { asyncReportMessages as messages } from '../messages';

// ── State badge ───────────────────────────────────────────────────────────────

const STATE_VARIANT: Record<TaskState, string> = {
  QUEUING: 'light',
  IN_PROGRESS: 'primary',
  SUCCESS: 'success',
  FAILURE: 'danger',
  REVOKED: 'secondary',
};

const StateBadge = ({ state }: { state: TaskState }) => {
  const intl = useIntl();
  const stateLabels: Record<TaskState, string> = {
    QUEUING: intl.formatMessage(messages.stateQueuing),
    IN_PROGRESS: intl.formatMessage(messages.stateInProgress),
    SUCCESS: intl.formatMessage(messages.stateDone),
    FAILURE: intl.formatMessage(messages.stateFailure),
    REVOKED: intl.formatMessage(messages.stateRevoked),
  };
  return (
    <Badge variant={STATE_VARIANT[state] ?? 'light'} className="text-uppercase">
      {state === 'IN_PROGRESS' && (
        <Spinner animation="border" size="sm" className="mr-1" screenReaderText="" />
      )}
      {stateLabels[state] ?? state}
    </Badge>
  );
};

// ── Task row ──────────────────────────────────────────────────────────────────

const TaskRow = ({ task }: { task: ReportTask }) => {
  const intl = useIntl();
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
            {intl.formatMessage(messages.downloadCsv)}
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
  const intl = useIntl();
  const {
    data: tasks, isLoading, isError,
  } = useCourseReportTasks(courseId, reportType);

  const {
    mutate: trigger, isPending: isTriggering, error: triggerError,
  } = useTriggerCourseReport(courseId);

  const hasRunning = tasks?.some((t) => t.state === 'QUEUING' || t.state === 'IN_PROGRESS') ?? false;

  return (
    <div className="rwaq-card">
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
              <Spinner
                animation="border"
                size="sm"
                className="mr-2"
                screenReaderText={intl.formatMessage(messages.screenReaderGenerating)}
              />
              {intl.formatMessage(messages.generating)}
            </>
          ) : (
            intl.formatMessage(messages.generateReport)
          )}
        </Button>
      </div>

      {triggerError && (
        <Alert variant="danger" className="mb-3">
          {(triggerError as { response?: { data?: { detail?: string } } })
            ?.response?.data?.detail
            ?? intl.formatMessage(messages.errorTriggerFallback)}
        </Alert>
      )}

      {isError && (
        <Alert variant="warning" className="mb-3">
          {intl.formatMessage(messages.errorLoadHistory)}
        </Alert>
      )}

      {isLoading ? (
        <div className="d-flex justify-content-center py-3">
          <Spinner animation="border" size="sm" screenReaderText={intl.formatMessage(messages.loadingHistory)} />
        </div>
      ) : !tasks || tasks.length === 0 ? (
        <p className="text-muted small mb-0">{intl.formatMessage(messages.noReportsYet)}</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="table table-sm mb-0">
            <thead>
              <tr>
                <th>{intl.formatMessage(messages.colGenerated)}</th>
                <th>{intl.formatMessage(messages.colStatus)}</th>
                <th>{intl.formatMessage(messages.colProcessed)}</th>
                <th className="text-right">{intl.formatMessage(messages.colFile)}</th>
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
