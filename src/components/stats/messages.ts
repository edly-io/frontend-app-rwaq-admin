/**
 * Shared messages of the stats strips (tiles and compact charts above the list and detail pages).
 */
import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  stripTitle: { id: 'rwaq.admin.stats.title', defaultMessage: 'Statistics' },
  hide: { id: 'rwaq.admin.stats.hide', defaultMessage: 'Hide statistics' },
  show: { id: 'rwaq.admin.stats.show', defaultMessage: 'Show statistics' },
  globalNote: {
    id: 'rwaq.admin.stats.globalNote',
    defaultMessage: 'Totals for the whole platform, whatever the filters of the table.',
  },
  forbidden: {
    id: 'rwaq.admin.stats.forbidden',
    defaultMessage: 'Only superusers can see these statistics.',
  },
  failed: {
    id: 'rwaq.admin.stats.failed',
    defaultMessage: 'Could not load the statistics.',
  },
  retry: { id: 'rwaq.admin.stats.retry', defaultMessage: 'Try again' },
  chartEmpty: { id: 'rwaq.admin.stats.chart.empty', defaultMessage: 'Nothing to show yet.' },
  chartUnavailable: { id: 'rwaq.admin.stats.chart.unavailable', defaultMessage: 'Not available' },
  excludedAccounts: {
    id: 'rwaq.admin.stats.excludedAccounts',
    defaultMessage: 'Staff, superusers and service accounts are not counted.',
  },
  seriesEnrollments: { id: 'rwaq.admin.stats.series.enrollments', defaultMessage: 'Enrollments' },
  lifecycleTitle: { id: 'rwaq.admin.stats.lifecycle.title', defaultMessage: 'Course lifecycle' },
  lifecycleInfo: {
    id: 'rwaq.admin.stats.lifecycle.info',
    defaultMessage: 'Course runs by state today: running, upcoming, ended or with no dates.',
  },
  lifecycleRunning: { id: 'rwaq.admin.stats.lifecycle.running', defaultMessage: 'Running' },
  lifecycleUpcoming: { id: 'rwaq.admin.stats.lifecycle.upcoming', defaultMessage: 'Upcoming' },
  lifecycleEnded: { id: 'rwaq.admin.stats.lifecycle.ended', defaultMessage: 'Ended' },
  lifecycleNoDates: { id: 'rwaq.admin.stats.lifecycle.noDates', defaultMessage: 'No dates set' },
  enrollmentsPerMonthTitle: {
    id: 'rwaq.admin.stats.enrollmentsPerMonth.title',
    defaultMessage: 'Enrollments per month',
  },
  lastTwelveMonths: { id: 'rwaq.admin.stats.lastTwelveMonths', defaultMessage: 'Last 12 months' },
});

export default messages;
