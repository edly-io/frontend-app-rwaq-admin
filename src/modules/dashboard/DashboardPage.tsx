/**
 * DashboardPage — platform analytics for Global Staff.
 *
 * Built to the approved Phase 1 wireframe on the existing primitives: KpiCard,
 * MetricChart, and the card and table styles the users and organizations
 * screens already use. Nothing new visually, so both themes come for free.
 *
 * Three independent queries, matching the backend's split by cost — the KPI row
 * paints as soon as the cheap counts land instead of waiting on the aggregates.
 * Each band degrades on its own: a failed trends call leaves the KPI row and
 * the breakdowns intact.
 *
 * Two conventions worth keeping if this page grows:
 *   - A metric we cannot read renders "Not available", never 0. Confusing
 *     "no data" with "zero" is how a dashboard starts lying.
 *   - Every figure is stamped with the backend's generatedAt, because these
 *     numbers are cached and pretending otherwise would be dishonest.
 */
import {
  useEffect, useMemo, useRef, useState,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Alert, Icon, Spinner } from '@openedx/paragon';
import { Refresh } from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import ErrorState from '@src/components/ErrorState';
import { getErrorStatus } from '@src/data/httpError';
import KpiCard from '@src/components/KpiCard';
import MetricChart from '@src/components/charts/MetricChart';
import type { ChartDataPoint, ChartType } from '@src/components/charts/MetricChart';
import MiniTable from './components/MiniTable';
import StatTile from './components/StatTile';
import {
  analyticsQueryKeys,
  useAnalyticsBreakdowns,
  useAnalyticsSummary,
  useAnalyticsTrends,
} from './data/hooks';
import {
  getAnalyticsBreakdowns,
  getAnalyticsSummary,
  getAnalyticsTrends,
} from './data/api';
import type {
  AnalyticsBreakdowns, OrganizationRow, TopCourse, TrendPoint,
} from './data/types';
import messages from './messages';

const TREND_MONTHS = 12;
const CHART_HEIGHT = 190;

/** "2026-08-28T09:14:00Z" → "Just now" / "3 min ago" / "1 hr ago" */
const formatRelativeTime = (isoString: string): string => {
  const diffMs = Date.now() - new Date(isoString).getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1) { return 'Just now'; }
  if (diffMin < 60) { return `${diffMin} min ago`; }
  return `${Math.floor(diffMin / 60)} hr ago`;
};

/** "2026-08" → "Aug" for compact bar-chart axis labels. */
const formatPeriod = (period: string): string => {
  const [year, month] = period.split('-');
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleDateString(undefined, { month: 'short' });
};

/** Reshape a series for MetricChart, which keys on `name` plus a series key. */
const toChartData = (points: TrendPoint[], seriesKey: string): ChartDataPoint[] => points.map(
  (point) => ({
    name: formatPeriod(point.period),
    [seriesKey]: point.value,
  }),
);

/** Thousands separators, so a five-figure count is legible at a glance. */
const formatCount = (value: number | null | undefined): string => (
  value === null || value === undefined ? '—' : value.toLocaleString()
);

const formatPercent = (value: number | null): string | null => (
  value === null || value === undefined ? null : `${value}%`
);

const DashboardPage = () => {
  const intl = useIntl();

  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);
  // Tick every minute so the relative timestamp ("3 min ago") stays accurate.
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60_000);
    return () => clearInterval(id);
  }, []);
  // Track the params for each query so we can write back to the same key.
  const summaryParams = useRef({});
  const trendsParams = useRef({ months: TREND_MONTHS });
  const breakdownsParams = useRef({});

  const summaryQuery = useAnalyticsSummary(summaryParams.current);
  const trendsQuery = useAnalyticsTrends(trendsParams.current);
  const breakdownsQuery = useAnalyticsBreakdowns(breakdownsParams.current);

  // Bypass the backend cache and inject fresh data directly into React Query's
  // cache so all three queries update atomically in a single re-render.
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const forceParams = { forceRefresh: true };
      const [freshSummary, freshTrends, freshBreakdowns] = await Promise.all([
        getAnalyticsSummary({ ...summaryParams.current, ...forceParams }),
        getAnalyticsTrends({ ...trendsParams.current, ...forceParams }),
        getAnalyticsBreakdowns({ ...breakdownsParams.current, ...forceParams }),
      ]);
      queryClient.setQueryData(analyticsQueryKeys.summary(summaryParams.current), freshSummary);
      queryClient.setQueryData(analyticsQueryKeys.trends(trendsParams.current), freshTrends);
      queryClient.setQueryData(analyticsQueryKeys.breakdowns(breakdownsParams.current), freshBreakdowns);
    } finally {
      setIsRefreshing(false);
    }
  };

  const summary = summaryQuery.data;
  const trends = trendsQuery.data;
  const breakdowns = breakdownsQuery.data;

  // Derived once per payload rather than on every render — these map over up to
  // 12 points each and the page re-renders on any query settling.
  const enrollmentSeries = useMemo(
    () => (trends ? toChartData(trends.enrollments, 'enrollments') : []),
    [trends],
  );
  const certificateSeries = useMemo(
    () => (trends?.certificates ? toChartData(trends.certificates, 'certificates') : []),
    [trends],
  );
  const registrationSeries = useMemo(
    () => (trends ? toChartData(trends.registrations, 'registrations') : []),
    [trends],
  );

  const lifecycleSlices = useMemo(() => {
    if (!breakdowns) { return []; }
    const { courseLifecycle } = breakdowns;
    return [
      { name: intl.formatMessage(messages.lifecycleRunning), value: courseLifecycle.running },
      { name: intl.formatMessage(messages.lifecycleUpcoming), value: courseLifecycle.upcoming },
      { name: intl.formatMessage(messages.lifecycleEnded), value: courseLifecycle.ended },
      { name: intl.formatMessage(messages.lifecycleNoDates), value: courseLifecycle.noDates },
    ].filter((slice) => slice.value > 0);
  }, [breakdowns, intl]);

  const statusCode = (query: { isError: boolean; error: unknown }) => (
    query.isError ? getErrorStatus(query.error) : undefined
  );

  // A dashboard with no readable numbers at all is an error page, not an empty
  // one — retrying is the only useful action.
  if (summaryQuery.isError && trendsQuery.isError && breakdownsQuery.isError) {
    return (
      <div className="rwaq-page">
        <div className="rwaq-page-header">
          <h1 className="rwaq-page-title">{intl.formatMessage(messages.title)}</h1>
        </div>
        <div className="rwaq-card">
          <ErrorState
            statusCode={statusCode(summaryQuery)}
            title={intl.formatMessage(messages.errorTitle)}
            onRetry={() => {
              summaryQuery.refetch();
              trendsQuery.refetch();
              breakdownsQuery.refetch();
            }}
          />
        </div>
      </div>
    );
  }

  /** Loading, no-signal and populated are three states, kept out of a ternary chain. */
  const renderChartBody = (
    data: ChartDataPoint[],
    seriesKey: string,
    seriesLabel: string,
    type: ChartType,
    title: string,
  ) => {
    if (trendsQuery.isLoading) {
      return (
        <div className="rwaq-dash-card__loading">
          <Spinner animation="border" screenReaderText={title} />
        </div>
      );
    }
    // An empty chart under a "Last 12 months" caption claims there was no
    // activity. A failed fetch has to say so instead.
    if (trendsQuery.isError) {
      return (
        <div className="rwaq-dash-card__empty">
          {intl.formatMessage(messages.trendUnavailable)}
        </div>
      );
    }
    if (data.length === 0 || data.every((point) => point[seriesKey] === 0)) {
      return (
        <div className="rwaq-dash-card__empty">
          {intl.formatMessage(messages.emptySeries, { months: trends?.months ?? TREND_MONTHS })}
        </div>
      );
    }
    return (
      <div className="rwaq-chart">
        <MetricChart
          type={type}
          data={data}
          series={[seriesKey]}
          ariaLabel={`${title}. ${seriesLabel}.`}
          height={CHART_HEIGHT}
          hideLegend
        />
      </div>
    );
  };

  const renderChartCard = (
    title: string,
    subtitle: string,
    data: ChartDataPoint[],
    seriesKey: string,
    seriesLabel: string,
    type: ChartType,
  ) => (
    <div className="rwaq-card rwaq-dash-card">
      <div className="rwaq-dash-card__head">
        <h3 className="rwaq-section-title mb-0">{title}</h3>
        <span className="rwaq-dash-card__sub">{subtitle}</span>
      </div>
      {renderChartBody(data, seriesKey, seriesLabel, type, title)}
    </div>
  );

  /**
   * Certificates get a stated reason rather than a flat zero line when the
   * backend reports them unreadable — a chart of zeros would assert that none
   * were issued, which is a different claim.
   */
  const renderCertificateTrend = () => {
    if (!trendsQuery.isError && trends && trends.certificates === null) {
      return (
        <div className="rwaq-card rwaq-dash-card">
          <div className="rwaq-dash-card__head">
            <h3 className="rwaq-section-title mb-0">
              {intl.formatMessage(messages.certificateTrend)}
            </h3>
          </div>
          <p className="text-muted mb-0">{intl.formatMessage(messages.certificatesUnreadable)}</p>
        </div>
      );
    }
    return renderChartCard(
      intl.formatMessage(messages.certificateTrend),
      intl.formatMessage(messages.trendMonths, { months: trends?.months ?? TREND_MONTHS }),
      certificateSeries,
      'certificates',
      intl.formatMessage(messages.seriesCertificates),
      'line',
    );
  };

  /** Loading, populated and empty are three distinct states, not a ternary chain. */
  const renderLifecycle = () => {
    if (breakdownsQuery.isLoading) {
      return (
        <div className="rwaq-dash-card__loading">
          <Spinner animation="border" screenReaderText={intl.formatMessage(messages.lifecycleTitle)} />
        </div>
      );
    }
    if (lifecycleSlices.length === 0) {
      return (
        <p className="text-muted text-center py-4 mb-0">
          {intl.formatMessage(messages.emptyTable)}
        </p>
      );
    }
    return (
      <div className="rwaq-chart">
        <MetricChart
          type="donut"
          data={lifecycleSlices}
          ariaLabel={`${intl.formatMessage(messages.lifecycleTitle)}. ${
            lifecycleSlices.map((slice) => `${slice.name}: ${slice.value}`).join(', ')
          }.`}
          height={CHART_HEIGHT}
        />
      </div>
    );
  };

  const renderBreakdowns = (data: AnalyticsBreakdowns) => (
    <>
      {/* Certificates: coverage and issuance are separate facts here, because
          certificates are optional per course. */}
      <div className="rwaq-dash-grid rwaq-dash-grid--thirds">
        <div className="rwaq-card">
          <StatTile
            label={intl.formatMessage(messages.certCoverage)}
            value={formatPercent(data.certificates.coveragePct)}
            hint={intl.formatMessage(messages.certCoverageHint, {
              withCert: data.certificates.coursesWithCertificate,
              total: data.certificates.totalCourses,
            })}
            unavailableHint={intl.formatMessage(messages.noCoursesYet)}
          />
        </div>
        <div className="rwaq-card">
          <StatTile
            label={intl.formatMessage(messages.certIssuance)}
            value={formatPercent(data.certificates.issuancePct)}
            hint={intl.formatMessage(messages.certIssuanceHint)}
            unavailableHint={intl.formatMessage(messages.certificatesUnreadable)}
          />
        </div>
        <div className="rwaq-card">
          <StatTile
            label={intl.formatMessage(messages.programCompletion)}
            value={formatPercent(data.programs.completionPct)}
            hint={intl.formatMessage(messages.programCompletionHint, {
              completions: data.programs.completions,
              enrollments: data.programs.enrollments,
            })}
            unavailableHint={intl.formatMessage(messages.noProgramEnrollments)}
          />
        </div>
      </div>

      <div className="rwaq-dash-grid rwaq-dash-grid--thirds">
        <div className="rwaq-card">
          <StatTile
            label={intl.formatMessage(messages.legacyTitle)}
            value={formatPercent(data.legacyMigration.progressPct)}
            hint={intl.formatMessage(messages.legacyHint, {
              signedIn: data.legacyMigration.signedInAtLeastOnce,
              total: data.legacyMigration.legacyAccounts,
            })}
            unavailableHint={intl.formatMessage(messages.legacyNone)}
          />
        </div>

        <div className="rwaq-card rwaq-dash-card">
          <div className="rwaq-dash-card__head">
            <h3 className="rwaq-section-title mb-0">{intl.formatMessage(messages.modesTitle)}</h3>
            <span className="rwaq-dash-card__sub">{intl.formatMessage(messages.modesHint)}</span>
          </div>
          {data.enrollmentModes.length > 0 ? (
            <MiniTable
              caption={intl.formatMessage(messages.modesTitle)}
              rows={data.enrollmentModes}
              rowKey={(row) => row.mode}
              columns={[
                { label: intl.formatMessage(messages.modeColMode), render: (row) => row.mode },
                {
                  label: intl.formatMessage(messages.kpiEnrollments),
                  render: (row) => formatCount(row.count),
                  isNumeric: true,
                },
                {
                  label: intl.formatMessage(messages.modeColShare),
                  render: (row) => formatPercent(row.sharePct) ?? intl.formatMessage(messages.none),
                  isNumeric: true,
                },
              ]}
            />
          ) : (
            <p className="text-muted text-center py-4 mb-0">
              {intl.formatMessage(messages.emptyTable)}
            </p>
          )}
        </div>

        {/* Enrollment windows: a health check, so it reads as prose rather
            than a figure — the useful state is "nothing wrong". */}
        <div className="rwaq-card rwaq-dash-card">
          <div className="rwaq-dash-card__head">
            <h3 className="rwaq-section-title mb-0">{intl.formatMessage(messages.windowsTitle)}</h3>
          </div>
          {data.enrollmentWindows.closedButRunning === 0
            && data.enrollmentWindows.runningWithoutWindow === 0 ? (
              <p className="text-muted mb-0">{intl.formatMessage(messages.windowsHealthy)}</p>
            ) : (
              <ul className="rwaq-dash-list">
                {data.enrollmentWindows.closedButRunning > 0 && (
                  <li>
                    {intl.formatMessage(messages.windowsClosed, {
                      count: data.enrollmentWindows.closedButRunning,
                    })}
                  </li>
                )}
                {data.enrollmentWindows.runningWithoutWindow > 0 && (
                  <li>
                    {intl.formatMessage(messages.windowsNone, {
                      count: data.enrollmentWindows.runningWithoutWindow,
                    })}
                  </li>
                )}
              </ul>
            )}
        </div>
      </div>

      <div className="rwaq-dash-grid rwaq-dash-grid--halves">
        <div className="rwaq-card rwaq-dash-card">
          <div className="rwaq-dash-card__head">
            <h3 className="rwaq-section-title mb-0">{intl.formatMessage(messages.orgsTitle)}</h3>
          </div>
          <MiniTable<OrganizationRow>
            caption={intl.formatMessage(messages.orgsTitle)}
            rows={data.organizations}
            rowKey={(row) => row.shortName}
            columns={[
              { label: intl.formatMessage(messages.orgColName), render: (row) => row.name },
              {
                label: intl.formatMessage(messages.orgColCourses),
                render: (row) => formatCount(row.courses),
                isNumeric: true,
              },
              {
                label: intl.formatMessage(messages.orgColEnrollments),
                render: (row) => formatCount(row.enrollments),
                isNumeric: true,
              },
              {
                label: intl.formatMessage(messages.orgColAdmins),
                render: (row) => formatCount(row.admins),
                isNumeric: true,
              },
            ]}
          />
        </div>

        <div className="rwaq-card rwaq-dash-card">
          <div className="rwaq-dash-card__head">
            <h3 className="rwaq-section-title mb-0">{intl.formatMessage(messages.topCoursesTitle)}</h3>
            {data.catalogConcentration.topSharePct !== null && (
              <span className="rwaq-dash-card__sub">
                {intl.formatMessage(messages.topCoursesHint, {
                  share: data.catalogConcentration.topSharePct,
                })}
              </span>
            )}
          </div>
          <MiniTable<TopCourse>
            caption={intl.formatMessage(messages.topCoursesTitle)}
            rows={data.catalogConcentration.courses}
            rowKey={(row) => row.courseId}
            columns={[
              {
                label: intl.formatMessage(messages.courseColName),
                render: (row) => (
                  <>
                    <div className="rwaq-user-cell__name" dir="auto">{row.displayName}</div>
                    <div className="rwaq-user-cell__meta">{row.courseId}</div>
                  </>
                ),
              },
              {
                label: intl.formatMessage(messages.courseColEnrollments),
                render: (row) => formatCount(row.enrollments),
                isNumeric: true,
              },
            ]}
          />
        </div>
      </div>
    </>
  );

  const generatedAt = summary?.generatedAt ?? trends?.generatedAt ?? breakdowns?.generatedAt;

  return (
    <div className="rwaq-page">
      <div className="rwaq-page-header">
        <h1 className="rwaq-page-title">{intl.formatMessage(messages.title)}</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {generatedAt && (
            <span style={{ fontSize: '0.8125rem', color: 'var(--rwaq-muted, #6B757F)' }}>
              {intl.formatMessage(messages.lastUpdated, { time: formatRelativeTime(generatedAt) })}
            </span>
          )}
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            aria-label={intl.formatMessage(messages.refreshAriaLabel)}
            style={{
              border: 'none',
              background: 'transparent',
              cursor: isRefreshing ? 'default' : 'pointer',
              color: 'var(--rwaq-muted, #6B757F)',
              display: 'inline-flex',
              alignItems: 'center',
              padding: '0.25rem',
            }}
          >
            {isRefreshing ? (
              <Spinner
                animation="border"
                size="sm"
                screenReaderText={intl.formatMessage(messages.refreshAriaLabel)}
                style={{
                  width: '1.125rem',
                  height: '1.125rem',
                  color: 'var(--pgn-color-primary-base, #449cc2)',
                  borderWidth: '0.15em',
                }}
              />
            ) : (
              <Icon src={Refresh} style={{ width: '1.125rem', height: '1.125rem' }} />
            )}
          </button>
        </div>
      </div>

      {/* Above the row, not below it: under five em dashes the reason has to
          come first, or the failure reads as "the platform has no data". */}
      {summaryQuery.isError && (
        <Alert variant="danger">{intl.formatMessage(messages.errorTitle)}</Alert>
      )}

      {/* KPI row — first to paint, since it is the cheapest query. */}
      <div className="rwaq-dash-grid rwaq-dash-grid--kpi">
        <KpiCard
          label={intl.formatMessage(messages.kpiLearners)}
          value={formatCount(summaryQuery.isError ? null : summary?.totalLearners)}
          isLoading={summaryQuery.isLoading}
        />
        <KpiCard
          label={intl.formatMessage(messages.kpiEnrollments)}
          value={formatCount(summaryQuery.isError ? null : summary?.totalEnrollments)}
          isLoading={summaryQuery.isLoading}
        />
        <KpiCard
          label={intl.formatMessage(messages.kpiCoursesRunning)}
          value={formatCount(summaryQuery.isError ? null : summary?.runningCourses)}
          isLoading={summaryQuery.isLoading}
          // A running count means little without the catalog it is drawn from.
          sparkline={summary ? (
            <span className="rwaq-kpi-context">
              {intl.formatMessage(messages.kpiOfTotal, { total: formatCount(summary.totalCourses) })}
            </span>
          ) : undefined}
        />
        <KpiCard
          label={intl.formatMessage(messages.kpiProgramsActive)}
          value={formatCount(summaryQuery.isError ? null : summary?.activePrograms)}
          isLoading={summaryQuery.isLoading}
        />
        <KpiCard
          label={intl.formatMessage(messages.kpiRegistrations)}
          value={formatCount(summaryQuery.isError ? null : summary?.newRegistrationsThisMonth)}
          // Omitted rather than zeroed when there is no previous month to
          // compare against — KpiCard hides the badge when delta is undefined.
          delta={summary?.newRegistrationsDeltaPct ?? undefined}
          isLoading={summaryQuery.isLoading}
        />
      </div>

      {/* Trends. Certificates are omitted entirely rather than drawn as a flat
          zero line when the backend reports them as unreadable. */}
      <div className="rwaq-dash-grid rwaq-dash-grid--split">
        {renderChartCard(
          intl.formatMessage(messages.enrollmentTrend),
          intl.formatMessage(messages.trendMonths, { months: trends?.months ?? TREND_MONTHS }),
          enrollmentSeries,
          'enrollments',
          intl.formatMessage(messages.seriesEnrollments),
          'bar',
        )}

        <div className="rwaq-card rwaq-dash-card">
          <div className="rwaq-dash-card__head">
            <h3 className="rwaq-section-title mb-0">
              {intl.formatMessage(messages.lifecycleTitle)}
            </h3>
          </div>
          {renderLifecycle()}
        </div>
      </div>

      <div className="rwaq-dash-grid rwaq-dash-grid--halves">
        {renderChartCard(
          intl.formatMessage(messages.registrationTrend),
          intl.formatMessage(messages.trendMonths, { months: trends?.months ?? TREND_MONTHS }),
          registrationSeries,
          'registrations',
          intl.formatMessage(messages.seriesRegistrations),
          'line',
        )}

        {renderCertificateTrend()}
      </div>

      {trendsQuery.isError && (
        <Alert variant="danger">{intl.formatMessage(messages.errorTitle)}</Alert>
      )}

      {breakdownsQuery.isLoading && (
        <div className="rwaq-card rwaq-dash-card__loading">
          <Spinner animation="border" screenReaderText={intl.formatMessage(messages.title)} />
        </div>
      )}

      {breakdowns && renderBreakdowns(breakdowns)}

      {breakdownsQuery.isError && (
        <Alert variant="danger">{intl.formatMessage(messages.errorTitle)}</Alert>
      )}
    </div>
  );
};

export default DashboardPage;
