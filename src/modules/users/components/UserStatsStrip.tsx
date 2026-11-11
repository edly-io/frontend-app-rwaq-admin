/**
 * UserStatsStrip — tiles and compact charts of one user, above the facts and the enrollments table.
 *
 * Enrollment figures come from the enrollments list the page already holds, so an enroll, a mode
 * change or an unenroll updates them at once. Programs, last activity and subscription come from
 * the stats endpoint. Overall completion waits for the progress request, like the table column.
 */
import { useMemo, useState } from 'react';
import { Spinner } from '@openedx/paragon';
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
import { useUserStats } from '../data/hooks';
import type { EnrollmentProgress, SubscriptionState, UserEnrollment } from '../data/types';
import {
  enrollmentsByMonth, enrollmentTiles, modeCounts, overallCompletion,
} from '../enrollmentStats';
import messages from '../messages';
import modeLabel from '../modeLabel';

const SUBSCRIPTION_LABELS: Record<SubscriptionState, keyof typeof messages> = {
  none: 'subscriptionNone',
  active: 'subscriptionActive',
  cancelled: 'subscriptionCancelled',
  expired: 'subscriptionExpired',
  revoked: 'subscriptionRevoked',
};

interface UserStatsStripProps {
  userId: number;
  /** The loaded enrollments list. undefined while it loads or when it failed. */
  enrollments: UserEnrollment[] | undefined;
  isEnrollmentsLoading: boolean;
  progress: EnrollmentProgress[] | undefined;
  isProgressLoading: boolean;
}

const UserStatsStrip = ({
  userId, enrollments, isEnrollmentsLoading, progress, isProgressLoading,
}: UserStatsStripProps) => {
  const intl = useIntl();
  const [isOpen, setIsOpen] = useState(true);
  const statsQuery = useUserStats(userId, isOpen);
  const state = summarizeQueries([statsQuery]);
  const stats = statsQuery.isError ? undefined : statsQuery.data;
  const { locale } = intl;
  const { isLoading: isStatsLoading } = statsQuery;

  const rows = enrollments;
  const tiles = rows ? enrollmentTiles(rows) : undefined;
  const completion = rows ? overallCompletion(rows, progress) : null;

  const modeSlices = useMemo(
    () => (rows ? modeCounts(rows) : []).map((item) => ({ name: modeLabel(intl, item.mode), value: item.count })),
    [rows, intl],
  );
  const monthSeries = useMemo(
    () => monthlyChartData(rows ? enrollmentsByMonth(rows, new Date()) : [], 'enrollments', locale),
    [rows, locale],
  );

  const formatDate = (iso: string | null | undefined) => (iso ? new Date(iso).toLocaleDateString(locale) : null);
  const tile = (
    label: keyof typeof messages,
    info: keyof typeof messages,
    value: string | null,
    options: { isLoading?: boolean; hint?: string; isText?: boolean } = {},
  ) => (
    <StatsTileCard>
      <StatTile
        label={intl.formatMessage(messages[label])}
        info={intl.formatMessage(messages[info])}
        value={value}
        hint={options.hint}
        isText={options.isText}
        isLoading={options.isLoading ?? isEnrollmentsLoading}
      />
    </StatsTileCard>
  );

  const subscription = stats?.tiles;
  // Not available when neither source can be read, "No activity yet" when they can and the user has none.
  let lastActivity: string | null = null;
  if (subscription?.lastActivityAvailable) {
    lastActivity = formatDate(subscription.lastActivityAt) ?? intl.formatMessage(messages.statsNoActivity);
  }

  return (
    <StatsStrip
      isOpen={isOpen}
      onToggle={() => setIsOpen((open) => !open)}
      isForbidden={state.isForbidden}
      hasFailedAll={false}
      onRetry={state.retry}
    >
      <StatsTiles>
        {tile('statsActiveEnrollments', 'statsActiveEnrollmentsInfo', formatCount(tiles?.active), {
          hint: tiles ? intl.formatMessage(messages.statsEnrollmentsOfTotal, { total: tiles.total }) : undefined,
        })}
        {tile('statsCertificates', 'statsCertificatesInfo', formatCount(stats?.tiles.certificatesEarned), {
          isLoading: isStatsLoading,
        })}
        {tile('statsPassed', 'statsPassedInfo', formatCount(tiles?.passed))}
        {tile('statsInProgress', 'statsInProgressInfo', formatCount(tiles?.inProgress))}
        <StatsTileCard>
          {isProgressLoading ? (
            <div className="rwaq-stat-tile">
              <span className="rwaq-stat-tile__label">{intl.formatMessage(messages.statsCompletion)}</span>
              <Spinner
                animation="border"
                size="sm"
                screenReaderText={intl.formatMessage(messages.enrollmentProgressLoading)}
              />
            </div>
          ) : (
            <StatTile
              label={intl.formatMessage(messages.statsCompletion)}
              info={intl.formatMessage(messages.statsCompletionInfo)}
              value={formatPercent(completion)}
              isLoading={isEnrollmentsLoading}
            />
          )}
        </StatsTileCard>
        {tile('statsPrograms', 'statsProgramsInfo', formatCount(subscription?.programsEnrolled), {
          isLoading: isStatsLoading,
          hint: subscription
            ? intl.formatMessage(messages.statsProgramsCompleted, { count: subscription.programsCompleted })
            : undefined,
        })}
        {tile('statsLastActivity', 'statsLastActivityInfo', lastActivity, { isLoading: isStatsLoading, isText: true })}
        {tile(
          'statsSubscription',
          'statsSubscriptionInfo',
          subscription ? intl.formatMessage(messages[SUBSCRIPTION_LABELS[subscription.subscriptionStatus]]) : null,
          {
            isLoading: isStatsLoading,
            isText: true,
            hint: subscription?.subscriptionEndsAt
              ? intl.formatMessage(messages.statsSubscriptionEnds, {
                date: formatDate(subscription.subscriptionEndsAt),
              })
              : undefined,
          },
        )}
      </StatsTiles>

      <div className="rwaq-dash-grid rwaq-dash-grid--halves">
        <StatsChartCard
          title={intl.formatMessage(messages.statsModesTitle)}
          info={intl.formatMessage(messages.statsModesInfo)}
          type="donut"
          data={modeSlices}
          isLoading={isEnrollmentsLoading}
        />
        <StatsChartCard
          title={intl.formatMessage(statsMessages.enrollmentsPerMonthTitle)}
          subtitle={intl.formatMessage(statsMessages.lastTwelveMonths)}
          info={intl.formatMessage(messages.statsEnrollmentsMonthInfo)}
          type="bar"
          data={monthSeries}
          maxXLabels={6}
          series={['enrollments']}
          isLoading={isEnrollmentsLoading}
          isEmpty={isEmptySeries(monthSeries, 'enrollments')}
        />
      </div>
    </StatsStrip>
  );
};

export default UserStatsStrip;
