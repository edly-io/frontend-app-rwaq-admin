/**
 * ProgramStatsStrip — tiles and compact charts of one program, above its overview.
 *
 * Learner stages: completed (has a completion date), in progress (not completed, at least one course
 * of the program passed) and not started (not completed, none passed). In progress, not started, the
 * average and the per-course bars are Not available when grades or certificates cannot be read.
 */
import { useMemo, useState } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import StatsChartCard from '@src/components/stats/StatsChartCard';
import StatsStrip from '@src/components/stats/StatsStrip';
import StatsTiles, { StatsTileCard } from '@src/components/stats/StatsTiles';
import { formatCount, formatMonth, formatPercent } from '@src/components/stats/format';
import summarizeQueries from '@src/components/stats/queryState';
import StatTile from '@src/modules/dashboard/components/StatTile';
import { useProgramStats } from '../data/hooks';
import messages from '../messages';

const ProgramStatsStrip = ({ uuid }: { uuid: string }) => {
  const intl = useIntl();
  const [isOpen, setIsOpen] = useState(true);
  const query = useProgramStats(uuid, isOpen);
  const state = summarizeQueries([query]);
  const stats = query.isError ? undefined : query.data;
  const { locale } = intl;
  const { isLoading } = query;

  const enrolledLabel = intl.formatMessage(messages.statsSeriesEnrolled);
  const completedLabel = intl.formatMessage(messages.statsSeriesCompleted);
  const months = useMemo(() => {
    if (!stats) { return []; }
    const completions = new Map(stats.series.completionsByMonth.map((point) => [point.period, point.value]));
    return stats.series.enrollmentsByMonth.map((point) => ({
      name: formatMonth(point.period, locale),
      [enrolledLabel]: point.value,
      [completedLabel]: completions.get(point.period) ?? 0,
    }));
  }, [stats, locale, enrolledLabel, completedLabel]);
  const courses = useMemo(
    () => (stats?.courses ?? []).map((course) => ({ name: course.courseName, learners: course.passed })),
    [stats],
  );

  const tile = (
    label: keyof typeof messages,
    info: keyof typeof messages,
    value: string | null,
  ) => (
    <StatsTileCard>
      <StatTile
        label={intl.formatMessage(messages[label])}
        info={intl.formatMessage(messages[info])}
        value={value}
        isLoading={isLoading}
      />
    </StatsTileCard>
  );

  const tiles = stats?.tiles;
  const average = tiles?.averageCoursesPassed;
  const days = tiles?.averageDaysToComplete;
  return (
    <StatsStrip
      isOpen={isOpen}
      onToggle={() => setIsOpen((open) => !open)}
      isForbidden={state.isForbidden}
      hasFailedAll={state.hasFailedAll}
      onRetry={state.retry}
    >
      <StatsTiles>
        {tile('statsEnrolled', 'statsEnrolledInfo', formatCount(tiles?.enrolled))}
        {tile('statsCompleted', 'statsCompletedInfo', formatCount(tiles?.completed))}
        {tile('statsInProgress', 'statsInProgressInfo', formatCount(tiles?.inProgress))}
        {tile('statsNotStarted', 'statsNotStartedInfo', formatCount(tiles?.notStarted))}
        {tile('statsCompletion', 'statsCompletionInfo', formatPercent(tiles?.completionPct))}
        {tile('statsAverage', 'statsAverageInfo', average === undefined || average === null ? null : average.toLocaleString(locale))}
        {tile(
          'statsDays',
          'statsDaysInfo',
          days === undefined || days === null
            ? null
            : intl.formatMessage(messages.statsDaysValue, { days: days.toLocaleString(locale) }),
        )}
      </StatsTiles>

      <div className="rwaq-dash-grid rwaq-dash-grid--halves">
        <StatsChartCard
          title={intl.formatMessage(messages.statsMonthTitle)}
          info={intl.formatMessage(messages.statsMonthInfo)}
          type="bar"
          data={months}
          maxXLabels={6}
          series={[enrolledLabel, completedLabel]}
          showLegend
          isLoading={isLoading}
          isUnavailable={query.isError}
          isEmpty={months.every((month) => month[enrolledLabel] === 0 && month[completedLabel] === 0)}
        />
        <StatsChartCard
          title={intl.formatMessage(messages.statsCoursesTitle)}
          info={intl.formatMessage(messages.statsCoursesInfo)}
          type="bar"
          data={courses}
          series={['learners']}
          isLoading={isLoading}
          isUnavailable={query.isError || (!!stats && stats.courses === null)}
          categoryLabels
        />
      </div>
    </StatsStrip>
  );
};

export default ProgramStatsStrip;
