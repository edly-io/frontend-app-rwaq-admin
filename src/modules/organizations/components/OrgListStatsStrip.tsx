/**
 * OrgListStatsStrip — tiles and one compact chart above the Organizations table.
 *
 * Global totals: they do not follow the table's search and filters. One chart is the top 10
 * organizations by enrollments, and each name carries its course count in brackets. The other is
 * the organizations added per month.
 */
import { useMemo, useState } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { localizedName } from '@src/data/localizedName';
import StatsChartCard from '@src/components/stats/StatsChartCard';
import StatsStrip from '@src/components/stats/StatsStrip';
import StatsTiles, { StatsTileCard } from '@src/components/stats/StatsTiles';
import { formatCount, isEmptySeries, monthlyChartData } from '@src/components/stats/format';
import statsMessages from '@src/components/stats/messages';
import summarizeQueries from '@src/components/stats/queryState';
import useStatsRefresh from '@src/components/stats/useStatsRefresh';
import StatTile from '@src/modules/dashboard/components/StatTile';
import { useOrgListStats, orgListStatsRefresh } from '../data/hooks';
import messages from '../messages';

const OrgListStatsStrip = () => {
  const intl = useIntl();
  const [isOpen, setIsOpen] = useState(true);
  const query = useOrgListStats(isOpen);
  const state = summarizeQueries([query]);
  const { isRefreshing, hasFailed: hasRefreshFailed, refresh } = useStatsRefresh();
  const stats = query.isError ? undefined : query.data;
  const { isLoading } = query;

  const top = useMemo(
    () => (stats?.topOrganizations ?? []).map((org) => ({
      name: intl.formatMessage(messages.listStatsTopLabel, {
        name: localizedName(intl.locale, org.name, org.arabicName), courses: org.courses,
      }),
      enrollments: org.enrollments,
    })),
    [stats, intl],
  );

  const organizationsLabel = intl.formatMessage(statsMessages.seriesOrganizations);
  const added = useMemo(
    () => monthlyChartData(stats?.series?.organizationsByMonth, organizationsLabel, intl.locale),
    [stats, organizationsLabel, intl.locale],
  );

  const tile = (label: keyof typeof messages, info: keyof typeof messages, value: number | undefined) => (
    <StatsTileCard>
      <StatTile
        label={intl.formatMessage(messages[label])}
        info={intl.formatMessage(messages[info])}
        value={formatCount(value)}
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
      generatedAt={stats?.generatedAt}
      onRefresh={() => refresh([orgListStatsRefresh()])}
      isRefreshing={isRefreshing}
      hasRefreshFailed={hasRefreshFailed}
    >
      <StatsTiles>
        {tile('listStatsActive', 'listStatsActiveInfo', tiles?.activeOrganizations)}
        {tile('listStatsWithCourses', 'listStatsWithCoursesInfo', tiles?.organizationsWithCourses)}
        {tile('listStatsCourses', 'listStatsCoursesInfo', tiles?.courses)}
        {tile('listStatsPrograms', 'listStatsProgramsInfo', tiles?.programs)}
        {tile('listStatsEnrollments', 'listStatsEnrollmentsInfo', tiles?.enrollments)}
      </StatsTiles>

      <div className="rwaq-dash-grid rwaq-dash-grid--halves">
        <StatsChartCard
          title={intl.formatMessage(messages.listStatsTopTitle)}
          info={intl.formatMessage(messages.listStatsTopInfo)}
          type="bar"
          data={top}
          series={['enrollments']}
          isLoading={isLoading}
          isUnavailable={query.isError}
          isEmpty={top.every((org) => org.enrollments === 0)}
          categoryLabels
        />
        <StatsChartCard
          title={intl.formatMessage(messages.listStatsAddedTitle)}
          subtitle={intl.formatMessage(statsMessages.lastTwelveMonths)}
          info={intl.formatMessage(messages.listStatsAddedInfo)}
          type="bar"
          data={added}
          maxXLabels={6}
          series={[organizationsLabel]}
          isLoading={isLoading}
          isUnavailable={query.isError}
          isEmpty={isEmptySeries(added, organizationsLabel)}
        />
      </div>
    </StatsStrip>
  );
};

export default OrgListStatsStrip;
