/**
 * CourseStatsStrip — tiles and compact charts of one course, above its facts.
 *
 * Plain counts only: passed, in progress and not started are numbers, with no pass rate.
 * A figure the server could not read is null and shows "Not available", never 0.
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
import modeLabel from '@src/modules/users/modeLabel';
import { useCourseStats } from '../data/hooks';
import messages from '../messages';

const CourseStatsStrip = ({ courseId }: { courseId: string }) => {
  const intl = useIntl();
  const [isOpen, setIsOpen] = useState(true);
  const query = useCourseStats(courseId, isOpen);
  const state = summarizeQueries([query]);
  const stats = query.isError ? undefined : query.data;
  const { locale } = intl;
  const { isLoading } = query;

  const enrollmentSeries = useMemo(
    () => monthlyChartData(stats?.series.enrollmentsByMonth, 'enrollments', locale),
    [stats, locale],
  );
  const modeSlices = useMemo(
    () => (stats?.tiles.modes ?? []).map((row) => ({ name: modeLabel(intl, row.mode), value: row.count })),
    [stats, intl],
  );
  const funnelUnavailable = !!stats && [stats.funnel.started, stats.funnel.passed, stats.funnel.certified]
    .every((value) => value === null);
  const funnel = useMemo(() => {
    if (!stats) { return []; }
    return [
      { name: intl.formatMessage(messages.statsFunnelEnrolled), people: stats.funnel.enrolled },
      { name: intl.formatMessage(messages.statsFunnelStarted), people: stats.funnel.started },
      { name: intl.formatMessage(messages.statsFunnelPassed), people: stats.funnel.passed },
      { name: intl.formatMessage(messages.statsFunnelCertified), people: stats.funnel.certified },
    ].filter((stage): stage is { name: string; people: number } => stage.people !== null);
  }, [stats, intl]);

  const tile = (
    label: keyof typeof messages,
    info: keyof typeof messages,
    value: number | null | undefined,
  ) => (
    <StatsTileCard>
      <StatTile
        label={intl.formatMessage(messages[label])}
        info={intl.formatMessage(messages[info])}
        value={formatCount(value)}
        isLoading={isLoading}
      />
    </StatsTileCard>
  );

  return (
    <StatsStrip
      isOpen={isOpen}
      onToggle={() => setIsOpen((open) => !open)}
      isForbidden={state.isForbidden}
      hasFailedAll={state.hasFailedAll}
      onRetry={state.retry}
    >
      <StatsTiles>
        {tile('statsActiveLearners', 'statsActiveLearnersInfo', stats?.tiles.activeLearners)}
        {tile('statsEnrolled', 'statsEnrolledInfo', stats?.tiles.enrolled)}
        {tile('statsUnenrolled', 'statsUnenrolledInfo', stats?.tiles.unenrolled)}
        {tile('statsCertificates', 'statsCertificatesInfo', stats?.tiles.certificates)}
        {tile('statsPassed', 'statsPassedInfo', stats?.tiles.passed)}
        {tile('statsInProgress', 'statsInProgressInfo', stats?.tiles.inProgress)}
        {tile('statsNotStarted', 'statsNotStartedInfo', stats?.tiles.notStarted)}
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
          isLoading={isLoading}
          isUnavailable={query.isError}
          isEmpty={isEmptySeries(enrollmentSeries, 'enrollments')}
        />
        <StatsChartCard
          title={intl.formatMessage(messages.statsModesTitle)}
          info={intl.formatMessage(messages.statsModesInfo)}
          type="donut"
          data={modeSlices}
          isLoading={isLoading}
          isUnavailable={query.isError}
        />
        <StatsChartCard
          title={intl.formatMessage(messages.statsFunnelTitle)}
          info={intl.formatMessage(messages.statsFunnelInfo)}
          type="bar"
          data={funnel}
          series={['people']}
          categoryLabels
          isLoading={isLoading}
          isUnavailable={query.isError || funnelUnavailable}
        />
      </div>
    </StatsStrip>
  );
};

export default CourseStatsStrip;
