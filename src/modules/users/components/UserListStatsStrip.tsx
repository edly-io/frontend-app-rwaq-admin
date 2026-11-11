/**
 * UserListStatsStrip — tiles and compact charts above the Users table.
 *
 * Global totals: they do not follow the table's search and filters. "Learners" are people with
 * courseware activity and an active enrollment, as on the Dashboard, so it is not the number of rows
 * in the table. Staff, superusers and service accounts are never counted.
 */
import { useMemo, useState } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import KpiCard from '@src/components/KpiCard';
import StatsChartCard from '@src/components/stats/StatsChartCard';
import StatsStrip from '@src/components/stats/StatsStrip';
import StatsTiles, { StatsTileCard } from '@src/components/stats/StatsTiles';
import { formatCount, isEmptySeries, monthlyChartData } from '@src/components/stats/format';
import statsMessages from '@src/components/stats/messages';
import summarizeQueries from '@src/components/stats/queryState';
import StatTile from '@src/modules/dashboard/components/StatTile';
import { useUserListStats } from '../data/hooks';
import messages from '../messages';

const UserListStatsStrip = () => {
  const intl = useIntl();
  const [isOpen, setIsOpen] = useState(true);
  const query = useUserListStats(isOpen);
  const state = summarizeQueries([query]);
  const stats = query.isError ? undefined : query.data;
  const { locale } = intl;
  const { isLoading } = query;

  const registrations = useMemo(
    () => monthlyChartData(stats?.series.registrationsByMonth, 'registrations', locale),
    [stats, locale],
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

  const legacy = stats?.tiles.legacy;
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
        {tile('listStatsLearners', 'listStatsLearnersInfo', stats?.tiles.learners)}
        <KpiCard
          label={intl.formatMessage(messages.listStatsNewThisMonth)}
          info={intl.formatMessage(messages.listStatsNewThisMonthInfo)}
          value={stats ? stats.tiles.newThisMonth.toLocaleString() : ''}
          delta={stats?.tiles.newDeltaPct ?? undefined}
          isLoading={isLoading}
        />
        {tile('listStatsActive', 'listStatsActiveInfo', stats?.tiles.activeLast30Days)}
        {tile(
          'listStatsLegacy',
          'listStatsLegacyInfo',
          legacy?.signedInAtLeastOnce,
          legacy
            ? intl.formatMessage(messages.listStatsLegacyHint, {
              remaining: (legacy.legacyAccounts - legacy.signedInAtLeastOnce).toLocaleString(),
              total: legacy.legacyAccounts.toLocaleString(),
            })
            : undefined,
        )}
        {tile('listStatsSubscribed', 'listStatsSubscribedInfo', stats?.tiles.subscribed)}
      </StatsTiles>

      <div className="rwaq-dash-grid rwaq-dash-grid--halves">
        <StatsChartCard
          title={intl.formatMessage(messages.listStatsRegistrationsTitle)}
          subtitle={intl.formatMessage(statsMessages.lastTwelveMonths)}
          info={intl.formatMessage(messages.listStatsRegistrationsInfo)}
          type="bar"
          data={registrations}
          series={['registrations']}
          isLoading={isLoading}
          isUnavailable={query.isError}
          isEmpty={isEmptySeries(registrations, 'registrations')}
        />
      </div>
    </StatsStrip>
  );
};

export default UserListStatsStrip;
