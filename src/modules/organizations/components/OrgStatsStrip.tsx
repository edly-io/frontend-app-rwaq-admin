/**
 * OrgStatsStrip — tiles and compact charts of one organization, above its facts.
 *
 * No endpoint of its own: it reads the Dashboard's summary, trends and breakdowns with the
 * `org` parameter, so every figure matches the Dashboard filtered to this organization.
 */
import { useMemo, useState } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import StatsChartCard from '@src/components/stats/StatsChartCard';
import StatsStrip from '@src/components/stats/StatsStrip';
import StatsTiles, { StatsTileCard } from '@src/components/stats/StatsTiles';
import { formatCount, isEmptySeries, monthlyChartData } from '@src/components/stats/format';
import statsMessages from '@src/components/stats/messages';
import summarizeQueries from '@src/components/stats/queryState';
import {
  useAnalyticsBreakdowns,
  useAnalyticsSummary,
  useAnalyticsTrends,
} from '@src/modules/dashboard/data/hooks';
import StatTile from '@src/modules/dashboard/components/StatTile';
import messages from '../messages';

const TREND_MONTHS = 12;

interface OrgStatsStripProps {
  org: string;
  adminCount: number;
}

const OrgStatsStrip = ({ org, adminCount }: OrgStatsStripProps) => {
  const intl = useIntl();
  const [isOpen, setIsOpen] = useState(true);

  const summaryQuery = useAnalyticsSummary({ org });
  const trendsQuery = useAnalyticsTrends({ org, months: TREND_MONTHS });
  const breakdownsQuery = useAnalyticsBreakdowns({ org });
  const state = summarizeQueries([summaryQuery, trendsQuery, breakdownsQuery]);

  const summary = summaryQuery.isError ? undefined : summaryQuery.data;
  const trends = trendsQuery.isError ? undefined : trendsQuery.data;
  const breakdowns = breakdownsQuery.isError ? undefined : breakdownsQuery.data;
  const { locale } = intl;

  const enrollmentSeries = useMemo(
    () => monthlyChartData(trends?.enrollments, 'enrollments', locale),
    [trends, locale],
  );
  const lifecycleSlices = useMemo(() => {
    const lifecycle = breakdowns?.courseLifecycle;
    if (!lifecycle) { return []; }
    return [
      { name: intl.formatMessage(statsMessages.lifecycleRunning), value: lifecycle.running },
      { name: intl.formatMessage(statsMessages.lifecycleUpcoming), value: lifecycle.upcoming },
      { name: intl.formatMessage(statsMessages.lifecycleEnded), value: lifecycle.ended },
      { name: intl.formatMessage(statsMessages.lifecycleNoDates), value: lifecycle.noDates },
    ].filter((slice) => slice.value > 0);
  }, [breakdowns, intl]);
  const topCourses = useMemo(
    () => (breakdowns?.catalogConcentration.courses ?? []).map((course) => ({
      name: course.displayName, enrollments: course.enrollments,
    })),
    [breakdowns],
  );

  const summaryLoading = summaryQuery.isLoading;
  const breakdownsLoading = breakdownsQuery.isLoading;

  return (
    <StatsStrip
      isOpen={isOpen}
      onToggle={() => setIsOpen((open) => !open)}
      isForbidden={state.isForbidden}
      hasFailedAll={state.hasFailedAll}
      onRetry={state.retry}
    >
      <StatsTiles>
        <StatsTileCard>
          <StatTile
            label={intl.formatMessage(messages.statsCourses)}
            info={intl.formatMessage(messages.statsCoursesInfo)}
            value={formatCount(summary?.totalCourses)}
            isLoading={summaryLoading}
          />
        </StatsTileCard>
        <StatsTileCard>
          <StatTile
            label={intl.formatMessage(messages.statsPrograms)}
            info={intl.formatMessage(messages.statsProgramsInfo)}
            value={formatCount(breakdowns?.programs.totalPrograms)}
            isLoading={breakdownsLoading}
          />
        </StatsTileCard>
        <StatsTileCard>
          <StatTile
            label={intl.formatMessage(messages.statsAdmins)}
            info={intl.formatMessage(messages.statsAdminsInfo)}
            value={formatCount(adminCount)}
          />
        </StatsTileCard>
        <StatsTileCard>
          <StatTile
            label={intl.formatMessage(messages.statsLearners)}
            info={intl.formatMessage(messages.statsLearnersInfo)}
            value={formatCount(summary?.totalLearners)}
            isLoading={summaryLoading}
          />
        </StatsTileCard>
        <StatsTileCard>
          <StatTile
            label={intl.formatMessage(messages.statsActiveEnrollments)}
            info={intl.formatMessage(messages.statsActiveEnrollmentsInfo)}
            value={formatCount(summary?.activeEnrollments)}
            isLoading={summaryLoading}
          />
        </StatsTileCard>
        <StatsTileCard>
          <StatTile
            label={intl.formatMessage(messages.statsCertificates)}
            info={intl.formatMessage(messages.statsCertificatesInfo)}
            value={formatCount(breakdowns?.certificates.certificatesIssued)}
            isLoading={breakdownsLoading}
          />
        </StatsTileCard>
      </StatsTiles>

      <div className="rwaq-dash-grid rwaq-dash-grid--thirds">
        <StatsChartCard
          title={intl.formatMessage(statsMessages.enrollmentsPerMonthTitle)}
          subtitle={intl.formatMessage(statsMessages.lastTwelveMonths)}
          info={intl.formatMessage(messages.statsEnrollmentsInfo)}
          type="bar"
          data={enrollmentSeries}
          maxXLabels={4}
          series={['enrollments']}
          isLoading={trendsQuery.isLoading}
          isUnavailable={trendsQuery.isError}
          isEmpty={isEmptySeries(enrollmentSeries, 'enrollments')}
        />
        <StatsChartCard
          title={intl.formatMessage(statsMessages.lifecycleTitle)}
          info={intl.formatMessage(statsMessages.lifecycleInfo)}
          type="donut"
          data={lifecycleSlices}
          isLoading={breakdownsLoading}
          isUnavailable={breakdownsQuery.isError}
        />
        <StatsChartCard
          title={intl.formatMessage(messages.statsTopCoursesTitle)}
          info={intl.formatMessage(messages.statsTopCoursesInfo)}
          type="bar"
          data={topCourses}
          series={['enrollments']}
          isLoading={breakdownsLoading}
          isUnavailable={breakdownsQuery.isError}
          categoryLabels
        />
      </div>
    </StatsStrip>
  );
};

export default OrgStatsStrip;
