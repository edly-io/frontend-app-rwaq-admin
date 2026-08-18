/**
 * DashboardPage — visual layout echoes edly-panel-frontend:
 * - Section title + date-range hint
 * - Left (8/12): main bar chart (enrollment trend)
 * - Right (4/12): KPI stat cards stack (big value + colored % change badge)
 * - Bottom row: completion trend (line), course status (donut)
 *
 * ⚠ All data is PLACEHOLDER — backend endpoints are not built yet.
 * Values will show 0 until the analytics API lands.
 * See src/modules/dashboard/data/api.ts for TODO(backend) comments.
 */
import { Row, Col, Alert } from '@openedx/paragon';
import { defineMessages, useIntl } from '@edx/frontend-platform/i18n';
import KpiCard from '@src/components/KpiCard';
import MetricChart from '@src/components/charts/MetricChart';
import ErrorState from '@src/components/ErrorState';
import { useDashboardCharts, useDashboardKpis } from './data/hooks';

const messages = defineMessages({
  sectionTitle: {
    id: 'rwaq.admin.dashboard.sectionTitle',
    defaultMessage: 'Analytics Overview',
  },
  enrollmentTrend: {
    id: 'rwaq.admin.dashboard.chart.enrollmentTrend',
    defaultMessage: 'Enrollment Trend (12 months)',
  },
  completionTrend: {
    id: 'rwaq.admin.dashboard.chart.completionTrend',
    defaultMessage: 'Completion Trend (12 months)',
  },
  courseStatus: {
    id: 'rwaq.admin.dashboard.chart.courseStatus',
    defaultMessage: 'Course Status',
  },
  totalLearners: {
    id: 'rwaq.admin.dashboard.kpi.totalLearners',
    defaultMessage: 'Total Learners',
  },
  newRegistrations: {
    id: 'rwaq.admin.dashboard.kpi.newRegistrations',
    defaultMessage: 'New Registrations',
  },
  totalCourses: {
    id: 'rwaq.admin.dashboard.kpi.totalCourses',
    defaultMessage: 'Total Courses',
  },
  activeCourses: {
    id: 'rwaq.admin.dashboard.kpi.activeCourses',
    defaultMessage: 'Active Courses',
  },
  placeholderBannerTitle: {
    id: 'rwaq.admin.dashboard.placeholder.title',
    defaultMessage: 'Analytics not yet available',
  },
  placeholderBannerBody: {
    id: 'rwaq.admin.dashboard.placeholder.body',
    defaultMessage: 'The analytics backend is under development. All values shown are placeholder zeros. Real data will appear when the API is deployed.',
  },
  kpiError: {
    id: 'rwaq.admin.dashboard.kpiError',
    defaultMessage: 'Could not load KPI data',
  },
  chartError: {
    id: 'rwaq.admin.dashboard.chartError',
    defaultMessage: 'Could not load chart data',
  },
});

// ── Card wrapper ──────────────────────────────────────────────────────────────

const ChartCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div
    style={{
      background: 'var(--pgn-color-white, #fff)',
      borderRadius: '0.75rem',
      padding: '1.25rem',
      boxShadow: '0 1px 4px rgba(0,0,0,.06)',
      height: '100%',
    }}
  >
    <h3
      style={{
        fontSize: '0.9375rem',
        fontWeight: 600,
        color: 'var(--pgn-color-gray-700, #273F58)',
        marginBottom: '1rem',
      }}
    >
      {title}
    </h3>
    {children}
  </div>
);

// ── Helpers ───────────────────────────────────────────────────────────────────

const pctDelta = (current: number, prev: number): number => {
  if (prev === 0) { return 0; }
  return Math.round(((current - prev) / prev) * 100);
};

// ── Page ──────────────────────────────────────────────────────────────────────

const DashboardPage = () => {
  const intl = useIntl();

  const {
    data: kpis,
    isLoading: kpisLoading,
    isError: kpisError,
    refetch: refetchKpis,
  } = useDashboardKpis();

  const {
    data: charts,
    isError: chartsError,
    refetch: refetchCharts,
  } = useDashboardCharts();

  return (
    <div>
      {/* ── Section header (matches edly-panel "Analytics Header") ──── */}
      <div className="mb-4">
        <h2
          style={{
            fontSize: '1.375rem',
            fontWeight: 700,
            color: 'var(--pgn-color-gray-700, #273F58)',
            marginBottom: '0.25rem',
          }}
        >
          {intl.formatMessage(messages.sectionTitle)}
        </h2>
        <Alert variant="info" className="mt-2 py-2 px-3" style={{ fontSize: '0.875rem' }}>
          <strong>{intl.formatMessage(messages.placeholderBannerTitle)}</strong>{' '}
          {intl.formatMessage(messages.placeholderBannerBody)}
        </Alert>
      </div>

      {/* ── Main row: chart (left, 8) + KPI stack (right, 4) ──────────── */}
      <Row className="g-3 mb-3">
        {/* Main bar chart — enrollment trend */}
        <Col xs={12} lg={8}>
          {chartsError ? (
            <ErrorState
              title={intl.formatMessage(messages.chartError)}
              onRetry={() => refetchCharts()}
            />
          ) : (
            <ChartCard title={intl.formatMessage(messages.enrollmentTrend)}>
              <MetricChart
                type="bar"
                data={charts?.enrollment_trend ?? []}
                series={['value']}
                ariaLabel={intl.formatMessage(messages.enrollmentTrend)}
                height={260}
              />
            </ChartCard>
          )}
        </Col>

        {/* KPI stat cards — right column stack */}
        <Col xs={12} lg={4}>
          {kpisError ? (
            <ErrorState
              title={intl.formatMessage(messages.kpiError)}
              onRetry={() => refetchKpis()}
            />
          ) : (
            <div
              className="d-flex flex-column gap-3 h-100"
              /* Mobile: horizontal scroll peeking next card */
              style={{
                overflowX: 'auto',
                flexDirection: 'column',
              }}
            >
              <KpiCard
                label={intl.formatMessage(messages.totalLearners)}
                value={kpis?.total_learners.toLocaleString() ?? '—'}
                isLoading={kpisLoading}
              />
              <KpiCard
                label={intl.formatMessage(messages.newRegistrations)}
                value={kpis?.new_registrations_this_month.toLocaleString() ?? '—'}
                delta={kpis
                  ? pctDelta(kpis.new_registrations_this_month, kpis.new_registrations_prev_month)
                  : undefined}
                isLoading={kpisLoading}
              />
              <KpiCard
                label={intl.formatMessage(messages.totalCourses)}
                value={kpis?.total_courses.toLocaleString() ?? '—'}
                isLoading={kpisLoading}
              />
              <KpiCard
                label={intl.formatMessage(messages.activeCourses)}
                value={kpis?.active_courses.toLocaleString() ?? '—'}
                isLoading={kpisLoading}
              />
            </div>
          )}
        </Col>
      </Row>

      {/* ── Bottom row: completion trend + course status ─────────────────── */}
      <Row className="g-3">
        <Col xs={12} lg={8}>
          {!chartsError && (
            <ChartCard title={intl.formatMessage(messages.completionTrend)}>
              <MetricChart
                type="line"
                data={charts?.completion_trend ?? []}
                series={['value']}
                ariaLabel={intl.formatMessage(messages.completionTrend)}
                height={220}
              />
            </ChartCard>
          )}
        </Col>
        <Col xs={12} lg={4}>
          {!chartsError && (
            <ChartCard title={intl.formatMessage(messages.courseStatus)}>
              <MetricChart
                type="donut"
                data={charts?.course_status ?? []}
                series={['value']}
                ariaLabel={intl.formatMessage(messages.courseStatus)}
                height={220}
              />
            </ChartCard>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;
