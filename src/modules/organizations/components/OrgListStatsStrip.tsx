/**
 * OrgListStatsStrip — tiles and one compact chart above the Organizations table.
 *
 * Global totals: they do not follow the table's search and filters. The chart is the top 10
 * organizations by enrollments, and each name carries its course count in brackets.
 */
import { useMemo, useState } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { localizedName } from '@src/data/localizedName';
import StatsChartCard from '@src/components/stats/StatsChartCard';
import StatsStrip from '@src/components/stats/StatsStrip';
import StatsTiles, { StatsTileCard } from '@src/components/stats/StatsTiles';
import { formatCount } from '@src/components/stats/format';
import statsMessages from '@src/components/stats/messages';
import summarizeQueries from '@src/components/stats/queryState';
import StatTile from '@src/modules/dashboard/components/StatTile';
import { useOrgListStats } from '../data/hooks';
import messages from '../messages';

const OrgListStatsStrip = () => {
  const intl = useIntl();
  const [isOpen, setIsOpen] = useState(true);
  const query = useOrgListStats(isOpen);
  const state = summarizeQueries([query]);
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
    >
      <StatsTiles>
        {tile('listStatsActive', 'listStatsActiveInfo', tiles?.activeOrganizations)}
        {tile('listStatsNoAdmins', 'listStatsNoAdminsInfo', tiles?.organizationsWithoutAdmins)}
        {tile('listStatsCourses', 'listStatsCoursesInfo', tiles?.courses)}
        {tile('listStatsPrograms', 'listStatsProgramsInfo', tiles?.programs)}
        {tile('listStatsEnrollments', 'listStatsEnrollmentsInfo', tiles?.enrollments)}
      </StatsTiles>

      <StatsChartCard
        title={intl.formatMessage(messages.listStatsTopTitle)}
        info={intl.formatMessage(messages.listStatsTopInfo)}
        type="bar"
        data={top}
        series={['enrollments']}
        isLoading={isLoading}
        isUnavailable={query.isError}
        isEmpty={top.every((org) => org.enrollments === 0)}
        horizontalBars
      />
    </StatsStrip>
  );
};

export default OrgListStatsStrip;
