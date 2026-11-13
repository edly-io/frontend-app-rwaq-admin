/**
 * CourseListStatsStrip — tiles and compact charts above the Courses table.
 *
 * Global totals over the whole catalog: they do not follow the table's search and filters.
 * The request runs over every course, so it is made only while the strip is expanded.
 */
import { useMemo, useState } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import StatsChartCard from '@src/components/stats/StatsChartCard';
import StatsStrip from '@src/components/stats/StatsStrip';
import StatsTiles, { StatsTileCard } from '@src/components/stats/StatsTiles';
import { formatCount, isEmptySeries, monthlyChartData } from '@src/components/stats/format';
import statsMessages from '@src/components/stats/messages';
import summarizeQueries from '@src/components/stats/queryState';
import StatTile from '@src/modules/dashboard/components/StatTile';
import { useCourseListStats } from '../data/hooks';
import messages from '../messages';

const CourseListStatsStrip = () => {
  const intl = useIntl();
  const [isOpen, setIsOpen] = useState(true);
  const query = useCourseListStats(isOpen);
  const state = summarizeQueries([query]);
  const stats = query.isError ? undefined : query.data;
  const { locale } = intl;
  const { isLoading } = query;

  const trend = useMemo(
    () => monthlyChartData(stats?.series.enrollmentsByMonth, 'enrollments', locale),
    [stats, locale],
  );
  const lifecycle = useMemo(() => {
    const value = stats?.courseLifecycle;
    if (!value) { return []; }
    return [
      { name: intl.formatMessage(statsMessages.lifecycleRunning), value: value.running },
      { name: intl.formatMessage(statsMessages.lifecycleUpcoming), value: value.upcoming },
      { name: intl.formatMessage(statsMessages.lifecycleEnded), value: value.ended },
      { name: intl.formatMessage(statsMessages.lifecycleNoDates), value: value.noDates },
    ].filter((slice) => slice.value > 0);
  }, [stats, intl]);
  const top = useMemo(
    () => (stats?.topCourses ?? []).map((course) => ({
      name: course.displayName, enrollments: course.enrollments,
    })),
    [stats],
  );

  const tile = (
    label: keyof typeof messages,
    info: keyof typeof messages,
    value: number | null | undefined,
    hint?: string,
  ) => (
    <StatsTileCard>
      <StatTile
        label={intl.formatMessage(messages[label])}
        info={intl.formatMessage(messages[info])}
        value={formatCount(value)}
        hint={hint}
        isLoading={isLoading}
      />
    </StatsTileCard>
  );

  const types = stats?.tiles.types;
  return (
    <StatsStrip
      isOpen={isOpen}
      onToggle={() => setIsOpen((open) => !open)}
      note={intl.formatMessage(statsMessages.globalNote)}
      isForbidden={state.isForbidden}
      hasFailedAll={state.hasFailedAll}
      onRetry={state.retry}
    >
      <StatsTiles>
        {tile('listStatsCourses', 'listStatsCoursesInfo', stats?.tiles.courses)}
        {tile('listStatsRunning', 'listStatsRunningInfo', stats?.tiles.running)}
        {tile('listStatsEnrollments', 'listStatsEnrollmentsInfo', stats?.tiles.activeEnrollments)}
        {tile('listStatsCertificates', 'listStatsCertificatesInfo', stats?.tiles.certificatesIssued)}
        {tile(
          'listStatsFree',
          'listStatsFreeInfo',
          types?.free,
          types?.noType ? intl.formatMessage(messages.listStatsFreeHint, { count: types.noType }) : undefined,
        )}
        {tile('listStatsPaid', 'listStatsPaidInfo', types?.paid)}
        {tile('listStatsProgramOnly', 'listStatsProgramOnlyInfo', types?.programOnly)}
        {tile('listStatsSubscription', 'listStatsSubscriptionInfo', types?.subscription)}
      </StatsTiles>

      <div className="rwaq-dash-grid rwaq-dash-grid--thirds">
        <StatsChartCard
          title={intl.formatMessage(statsMessages.lifecycleTitle)}
          info={intl.formatMessage(statsMessages.lifecycleInfo)}
          type="donut"
          data={lifecycle}
          isLoading={isLoading}
          isUnavailable={query.isError}
        />
        <StatsChartCard
          title={intl.formatMessage(messages.listStatsTopTitle)}
          info={intl.formatMessage(messages.listStatsTopInfo)}
          type="bar"
          data={top}
          series={['enrollments']}
          isLoading={isLoading}
          isUnavailable={query.isError}
          categoryLabels
        />
        <StatsChartCard
          title={intl.formatMessage(statsMessages.activeEnrollmentsPerMonthTitle)}
          subtitle={intl.formatMessage(statsMessages.lastTwelveMonths)}
          info={intl.formatMessage(messages.listStatsTrendInfo)}
          type="bar"
          data={trend}
          maxXLabels={6}
          series={['enrollments']}
          isLoading={isLoading}
          isUnavailable={query.isError}
          isEmpty={isEmptySeries(trend, 'enrollments')}
        />
      </div>
    </StatsStrip>
  );
};

export default CourseListStatsStrip;
