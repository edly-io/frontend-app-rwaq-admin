/**
 * ProgramReportsPage — program completion statistics.
 */
import { Link, useParams } from 'react-router-dom';
import { Alert, Spinner } from '@openedx/paragon';
import { useProgram } from './data/hooks';
import { useProgramCompletionReport } from './data/reportsHooks';

// ── Compact stat card ─────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string | number;
  highlight?: boolean;
}

const StatCard = ({ label, value, highlight = false }: StatCardProps) => (
  <div
    className="px-4 py-3 text-center"
    style={{
      borderRight: '1px solid #dee2e6',
      borderBottom: '1px solid #dee2e6',
      backgroundColor: highlight ? 'rgba(10,48,85,0.04)' : undefined,
    }}
  >
    <div className="text-muted small">{label}</div>
    <div
      className="font-weight-semibold mt-1"
      style={{
        fontSize: '1.125rem',
        fontVariantNumeric: 'tabular-nums',
        color: highlight ? 'var(--pgn-color-primary-500, #0A3055)' : undefined,
      }}
    >
      {value}
    </div>
  </div>
);

// ── Main page ─────────────────────────────────────────────────────────────────

const ProgramReportsPage = () => {
  const { uuid = '' } = useParams<{ uuid: string }>();
  const { data: program, isLoading: programLoading } = useProgram(uuid);
  const {
    data: report,
    isLoading: reportLoading,
    isError: reportError,
  } = useProgramCompletionReport(uuid, !!uuid);

  const isLoading = programLoading || reportLoading;
  const programName = program?.name || uuid;
  const programHref = `/programs/${uuid}`;

  if (isLoading) {
    return (
      <div className="rwaq-page">
        <div className="d-flex justify-content-center py-5">
          <Spinner animation="border" screenReaderText="Loading report" />
        </div>
      </div>
    );
  }

  return (
    <div className="rwaq-page">
      <div className="rwaq-page-header">
        <div className="rwaq-page-header__breadcrumb">
          <Link to="/programs">Programs</Link>
          {' / '}
          <Link to={programHref}>{programName}</Link>
          {' / Reports'}
        </div>
        <h1 className="rwaq-page-title mt-2">Reports</h1>
      </div>

      <div className="rwaq-card mt-4">
        <h2 className="rwaq-section-title mb-1">Program Completion</h2>
        {report && (
          <p className="text-muted small mb-4">
            Based on {report.numCourses} course{report.numCourses !== 1 ? 's' : ''} linked to this program.
            Learners enrolled in all courses are counted as completed.
          </p>
        )}

        {reportError && (
          <Alert variant="danger" className="mb-0">
            Could not load program completion report. Please refresh the page.
          </Alert>
        )}

        {report && (
          <>
            <div
              className="mb-4"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(9rem, 1fr))',
                borderTop: '1px solid #dee2e6',
                borderLeft: '1px solid #dee2e6',
                borderRadius: '0.25rem',
                overflow: 'hidden',
              }}
            >
              <StatCard label="Total Learners" value={report.totalLearners.toLocaleString()} />
              <StatCard label="Completed" value={report.completed.toLocaleString()} highlight />
              <StatCard label="In Progress" value={report.inProgress.toLocaleString()} />
              <StatCard label="Not Started" value={report.notStarted.toLocaleString()} />
              <StatCard label="Completion Rate" value={`${report.completionRate}%`} />
            </div>

            {report.note && (
              <Alert variant="info" className="mb-3">{report.note}</Alert>
            )}

            {report.totalLearners > 0 && (
              <div style={{ maxWidth: '28rem' }}>
                <div
                  style={{
                    height: '0.375rem',
                    borderRadius: '0.25rem',
                    overflow: 'hidden',
                    backgroundColor: '#e9ecef',
                  }}
                  role="progressbar"
                  aria-valuenow={report.completionRate}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${report.completionRate}% completion rate`}
                >
                  <div
                    style={{
                      width: `${report.completionRate}%`,
                      height: '100%',
                      backgroundColor: '#0a3055',
                      borderRadius: '0.25rem',
                    }}
                  />
                </div>
                <p className="text-muted small mt-1 mb-0">{report.completionRate}% completion rate</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ProgramReportsPage;
