/**
 * ProgramListStatsStrip — tiles and compact charts above the Programs table.
 *
 * Global totals: they do not follow the table's search and filters. Enrollment figures are the
 * Dashboard's program funnel, so hidden programs are left out of them.
 */
import { useMemo, useState } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import StatsChartCard from '@src/components/stats/StatsChartCard';
import StatsStrip from '@src/components/stats/StatsStrip';
import StatsTiles, { StatsTileCard } from '@src/components/stats/StatsTiles';
import {
  formatCount, formatPercent, isEmptySeries, monthlyChartData,
} from '@src/components/stats/format';
import statsMessages from '@src/components/stats/messages';
import summarizeQueries from '@src/components/stats/queryState';
import StatTile from '@src/modules/dashboard/components/StatTile';
import { useProgramListStats } from '../data/hooks';
import messages from '../messages';

const ProgramListStatsStrip = () => {
  const intl = useIntl();
  const [isOpen, setIsOpen] = useState(true);
  const query = useProgramListStats(isOpen);
  const state = summarizeQueries([query]);
  const stats = query.isError ? undefined : query.data;
  const { locale } = intl;
  const { isLoading } = query;

  const funnel = useMemo(() => {
    if (!stats) { return []; }
    return [
      { name: intl.formatMessage(messages.listStatsFunnelEnrolled), people: stats.funnel.enrolled },
      { name: intl.formatMessage(messages.listStatsFunnelStarted), people: stats.funnel.started },
      { name: intl.formatMessage(messages.listStatsFunnelCompleted), people: stats.funnel.completed },
    ].filter((stage): stage is { name: string; people: number } => stage.people !== null);
  }, [stats, intl]);
  const trend = useMemo(
    () => monthlyChartData(stats?.series.enrollmentsByMonth, 'enrollments', locale),
    [stats, locale],
  );

  const tile = (
    label: keyof typeof messages,
    info: keyof typeof messages,
    value: string | null,
    hint?: string,
  ) => (
    <StatsTileCard>
      <StatTile
        label={intl.formatMessage(messages[label])}
        info={intl.formatMessage(messages[info])}
        value={value}
        hint={hint}
        isLoading={isLoading}
      />
    </StatsTileCard>
  );

  const tiles = stats?.tiles;
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
        {tile('listStatsActive', 'listStatsActiveInfo', formatCount(tiles?.programs.active))}
        {tile('listStatsDraft', 'listStatsDraftInfo', formatCount(tiles?.programs.draft))}
        {tile('listStatsArchived', 'listStatsArchivedInfo', formatCount(tiles?.programs.archived))}
        {tile(
          'listStatsEnrollments',
          'listStatsEnrollmentsInfo',
          formatCount(tiles?.enrollments),
          tiles
            ? intl.formatMessage(messages.listStatsEnrollmentsHint, { count: tiles.learners.toLocaleString() })
            : undefined,
        )}
        {tile('listStatsCompletion', 'listStatsCompletionInfo', formatPercent(tiles?.completionPct))}
        {tile(
          'listStatsAverage',
          'listStatsAverageInfo',
          tiles?.averageCoursesPassed === undefined || tiles.averageCoursesPassed === null
            ? null
            : tiles.averageCoursesPassed.toLocaleString(locale),
        )}
      </StatsTiles>

      <div className="rwaq-dash-grid rwaq-dash-grid--halves">
        <StatsChartCard
          title={intl.formatMessage(messages.listStatsFunnelTitle)}
          info={intl.formatMessage(messages.listStatsFunnelInfo)}
          type="bar"
          data={funnel}
          series={['people']}
          isLoading={isLoading}
          isUnavailable={query.isError}
        />
        <StatsChartCard
          title={intl.formatMessage(statsMessages.enrollmentsPerMonthTitle)}
          subtitle={intl.formatMessage(statsMessages.lastTwelveMonths)}
          info={intl.formatMessage(messages.listStatsEnrollmentsMonthInfo)}
          type="bar"
          data={trend}
          series={['enrollments']}
          isLoading={isLoading}
          isUnavailable={query.isError}
          isEmpty={isEmptySeries(trend, 'enrollments')}
        />
      </div>
    </StatsStrip>
  );
};

export default ProgramListStatsStrip;
