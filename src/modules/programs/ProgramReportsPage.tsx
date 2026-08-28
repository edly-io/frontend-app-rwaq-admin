/**
 * ProgramReportsPage — program completion statistics.
 */
import { Link, useParams } from 'react-router-dom';
import { Alert, Spinner } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import { programReportsMessages as messages } from './messages';
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
  const intl = useIntl();
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
          <Spinner animation="border" screenReaderText={intl.formatMessage(messages.loadingReport)} />
        </div>
      </div>
    );
  }

  return (
    <div className="rwaq-page">
      <div className="rwaq-page-header">
        <div className="rwaq-page-header__breadcrumb">
          <Link to="/programs">{intl.formatMessage(messages.breadcrumbPrograms)}</Link>
          {' / '}
          <Link to={programHref}>{programName}</Link>
          {' '}
          {intl.formatMessage(messages.breadcrumbReports)}
        </div>
        <h1 className="rwaq-page-title mt-2">{intl.formatMessage(messages.pageTitle)}</h1>
      </div>

      <div className="rwaq-card">
        <h2 className="rwaq-section-title mb-1">{intl.formatMessage(messages.sectionTitle)}</h2>
        {report && (
          <p className="text-muted small mb-4">
            {intl.formatMessage(messages.sectionBody, {
              numCourses: report.numCourses,
              courseWord: intl.formatMessage(messages.courseWord, { count: report.numCourses }),
            })}
          </p>
        )}

        {reportError && (
          <Alert variant="danger" className="mb-0">
            {intl.formatMessage(messages.errorLoad)}
          </Alert>
        )}

        {report && (
          <>
            <div
              className="mb-4"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(9rem, 1fr))',
                borderTop: '1px solid #dee2e6',
                borderLeft: '1px solid #dee2e6',
                borderRadius: '0.25rem',
                overflow: 'hidden',
              }}
            >
              <StatCard label={intl.formatMessage(messages.statTotalLearners)} value={report.totalLearners.toLocaleString()} />
              <StatCard label={intl.formatMessage(messages.statCompleted)} value={report.completed.toLocaleString()} />
              <StatCard label={intl.formatMessage(messages.statInProgress)} value={report.inProgress.toLocaleString()} />
              <StatCard label={intl.formatMessage(messages.statNotStarted)} value={report.notStarted.toLocaleString()} />
              <StatCard label={intl.formatMessage(messages.statCompletionRate)} value={`${report.completionRate}%`} highlight />
            </div>

            {report.note && (
              <Alert variant="info" className="mb-3">{report.note}</Alert>
            )}

            {report.totalLearners > 0 && (
              <div>
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
                  aria-label={intl.formatMessage(messages.completionRateAriaLabel, { rate: report.completionRate })}
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
                <p className="text-muted small mt-1 mb-0">
                  {intl.formatMessage(messages.completionRateCaption, { rate: report.completionRate })}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ProgramReportsPage;
