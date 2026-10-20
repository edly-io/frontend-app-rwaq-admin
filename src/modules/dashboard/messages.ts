/**
 * Dashboard i18n messages, colocated with the feature.
 */
import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  title: { id: 'rwaq.admin.dashboard.title', defaultMessage: 'Dashboard' },
  lastUpdated: { id: 'rwaq.admin.dashboard.lastUpdated', defaultMessage: 'updated {time}' },
  refreshAriaLabel: { id: 'rwaq.admin.dashboard.refresh', defaultMessage: 'Refresh dashboard' },
  errorTitle: { id: 'rwaq.admin.dashboard.error.title', defaultMessage: 'Could not load analytics' },
  unavailable: { id: 'rwaq.admin.dashboard.unavailable', defaultMessage: 'Not available' },
  none: { id: 'rwaq.admin.dashboard.none', defaultMessage: '—' },

  // ── KPI row ────────────────────────────────────────────────────────────────
  kpiLearners: { id: 'rwaq.admin.dashboard.kpi.learners', defaultMessage: 'Active Learners' },
  kpiEnrollments: { id: 'rwaq.admin.dashboard.kpi.enrollments', defaultMessage: 'Active Enrolments' },
  kpiCoursesRunning: { id: 'rwaq.admin.dashboard.kpi.coursesRunning', defaultMessage: 'Courses running' },
  kpiProgramsActive: { id: 'rwaq.admin.dashboard.kpi.programsActive', defaultMessage: 'Active Programs' },
  kpiRegistrations: { id: 'rwaq.admin.dashboard.kpi.registrations', defaultMessage: 'New Registrations this month' },
  kpiOfTotal: { id: 'rwaq.admin.dashboard.kpi.ofTotal', defaultMessage: 'of {total} total' },

  // ── Trends ─────────────────────────────────────────────────────────────────
  enrollmentTrend: { id: 'rwaq.admin.dashboard.enrollmentTrend', defaultMessage: 'Active Enrolment trend' },
  certificateTrend: { id: 'rwaq.admin.dashboard.certificateTrend', defaultMessage: 'Certificates issued' },
  registrationTrend: { id: 'rwaq.admin.dashboard.registrationTrend', defaultMessage: 'New Registration' },
  trendMonths: { id: 'rwaq.admin.dashboard.trendMonths', defaultMessage: 'Last {months} months' },
  seriesEnrollments: { id: 'rwaq.admin.dashboard.series.enrollments', defaultMessage: 'Enrollments' },
  seriesCertificates: { id: 'rwaq.admin.dashboard.series.certificates', defaultMessage: 'Certificates' },
  seriesRegistrations: { id: 'rwaq.admin.dashboard.series.registrations', defaultMessage: 'Registrations' },
  certificatesUnreadable: {
    id: 'rwaq.admin.dashboard.certificatesUnreadable',
    defaultMessage: 'Certificate data is not readable from this service, so this is left blank rather than shown as zero.',
  },

  // ── Course lifecycle ───────────────────────────────────────────────────────
  lifecycleTitle: { id: 'rwaq.admin.dashboard.lifecycle.title', defaultMessage: 'Course lifecycle' },
  lifecycleRunning: { id: 'rwaq.admin.dashboard.lifecycle.running', defaultMessage: 'Running' },
  lifecycleUpcoming: { id: 'rwaq.admin.dashboard.lifecycle.upcoming', defaultMessage: 'Upcoming' },
  lifecycleEnded: { id: 'rwaq.admin.dashboard.lifecycle.ended', defaultMessage: 'Ended' },
  lifecycleNoDates: { id: 'rwaq.admin.dashboard.lifecycle.noDates', defaultMessage: 'No dates set' },

  // ── Certificates ───────────────────────────────────────────────────────────
  certCoverage: { id: 'rwaq.admin.dashboard.cert.coverage', defaultMessage: 'Certificate coverage' },
  certCoverageHint: {
    id: 'rwaq.admin.dashboard.cert.coverageHint',
    defaultMessage: '{withCert} of {total} courses offer one',
  },
  certIssuance: { id: 'rwaq.admin.dashboard.cert.issuance', defaultMessage: 'Issuance rate' },
  certIssuanceHint: {
    id: 'rwaq.admin.dashboard.cert.issuanceHint',
    defaultMessage: 'Among certificate-bearing courses only',
  },

  // ── Programs, migration, modes ─────────────────────────────────────────────
  programCompletion: { id: 'rwaq.admin.dashboard.program.completion', defaultMessage: 'Program completion' },
  programCompletionHint: {
    id: 'rwaq.admin.dashboard.program.completionHint',
    defaultMessage: '{completions} of {enrollments} program enrollments completed',
  },
  legacyTitle: { id: 'rwaq.admin.dashboard.legacy.title', defaultMessage: 'Legacy Registration' },
  legacyHint: {
    id: 'rwaq.admin.dashboard.legacy.hint',
    defaultMessage: '{signedIn} of {total} imported accounts have signed in',
  },
  legacyNone: {
    id: 'rwaq.admin.dashboard.legacy.none',
    defaultMessage: 'No imported accounts registered in this period.',
  },
  modesTitle: { id: 'rwaq.admin.dashboard.modes.title', defaultMessage: 'Enrollment modes' },
  modeColMode: { id: 'rwaq.admin.dashboard.modes.colMode', defaultMessage: 'Mode' },
  modeColShare: { id: 'rwaq.admin.dashboard.modes.colShare', defaultMessage: 'Share' },
  modesHint: {
    id: 'rwaq.admin.dashboard.modes.hint',
    defaultMessage: 'Rwaq runs its access model on honor, so a drift toward audit is worth checking.',
  },

  // ── Tables ─────────────────────────────────────────────────────────────────
  orgsTitle: { id: 'rwaq.admin.dashboard.orgs.title', defaultMessage: 'Top 10 Organizations by enrollment' },
  orgColName: { id: 'rwaq.admin.dashboard.orgs.colName', defaultMessage: 'Organization' },
  orgColCourses: { id: 'rwaq.admin.dashboard.orgs.colCourses', defaultMessage: 'Courses' },
  orgColEnrollments: { id: 'rwaq.admin.dashboard.orgs.colEnrollments', defaultMessage: 'Enrollments' },
  orgColAdmins: { id: 'rwaq.admin.dashboard.orgs.colAdmins', defaultMessage: 'Admins' },

  topCoursesTitle: { id: 'rwaq.admin.dashboard.topCourses.title', defaultMessage: 'Top 10 courses by enrollment' },
  topCoursesHint: {
    id: 'rwaq.admin.dashboard.topCourses.hint',
    defaultMessage: 'These hold {share}% of all enrollments',
  },
  courseColName: { id: 'rwaq.admin.dashboard.topCourses.colName', defaultMessage: 'Course' },
  courseColEnrollments: { id: 'rwaq.admin.dashboard.topCourses.colEnrollments', defaultMessage: 'Enrollments' },

  emptyTable: { id: 'rwaq.admin.dashboard.emptyTable', defaultMessage: 'Nothing to show yet.' },
  trendUnavailable: {
    id: 'rwaq.admin.dashboard.trendUnavailable',
    defaultMessage: 'This trend could not be loaded.',
  },
  noCoursesYet: {
    id: 'rwaq.admin.dashboard.noCoursesYet',
    defaultMessage: 'No courses on this platform yet.',
  },
  noProgramEnrollments: {
    id: 'rwaq.admin.dashboard.noProgramEnrollments',
    defaultMessage: 'No program enrollments yet.',
  },
  emptySeries: {
    id: 'rwaq.admin.dashboard.emptySeries',
    defaultMessage: 'No activity in the last {months} months.',
  },
  emptySeriesRange: {
    id: 'rwaq.admin.dashboard.emptySeriesRange',
    defaultMessage: 'No activity in the selected period.',
  },

  // ── Info tooltips ──────────────────────────────────────────────────────────
  infoLearners: {
    id: 'rwaq.admin.dashboard.info.learners',
    defaultMessage: 'Distinct learners who opened courseware and hold at least one active enrollment — excludes staff and service accounts. When a date range is selected, only learners with courseware activity in that period are counted.',
  },
  infoEnrollments: {
    id: 'rwaq.admin.dashboard.info.enrollments',
    defaultMessage: 'Distinct learner–course pairs where the learner has opened courseware and holds an active enrollment. When a date range is selected, only pairs with activity in that period are counted.',
  },
  infoCoursesRunning: {
    id: 'rwaq.admin.dashboard.info.coursesRunning',
    defaultMessage: 'Courses live at the selected end date (or now if no date is set): start date passed, end date not yet reached at that point.',
  },
  infoProgramsActive: {
    id: 'rwaq.admin.dashboard.info.programsActive',
    defaultMessage: 'Programs currently in Active status. Always all-time.',
  },
  infoRegistrations: {
    id: 'rwaq.admin.dashboard.info.registrations',
    defaultMessage: 'New learner accounts registered this calendar month vs last month.',
  },
  infoRegistrationTrend: {
    id: 'rwaq.admin.dashboard.info.registrationTrend',
    defaultMessage: 'Accounts registered per month, including deactivated and legacy accounts. Staff and service accounts are excluded.',
  },
  platformTotalsTitle: { id: 'rwaq.admin.dashboard.platformTotals.title', defaultMessage: 'Users' },
  infoPlatformTotals: {
    id: 'rwaq.admin.dashboard.info.platformTotals',
    defaultMessage: 'All-time figures for the whole platform. The date range does not apply. Counts include deactivated and legacy accounts. Staff and service accounts are excluded.',
  },
  platformTotalsDivider: {
    id: 'rwaq.admin.dashboard.platformTotals.divider',
    defaultMessage: 'All-time figures, not affected by the date range',
  },
  platformTotalsColMetric: { id: 'rwaq.admin.dashboard.platformTotals.col.metric', defaultMessage: 'Metric' },
  platformTotalsColValue: { id: 'rwaq.admin.dashboard.platformTotals.col.value', defaultMessage: 'Value' },
  totalUsers: { id: 'rwaq.admin.dashboard.platformTotals.users', defaultMessage: 'Total number of users' },
  totalEnrollments: { id: 'rwaq.admin.dashboard.platformTotals.enrollments', defaultMessage: 'Total course enrollments' },
  totalUnenrollments: { id: 'rwaq.admin.dashboard.platformTotals.unenrollments', defaultMessage: 'Total course unenrollments' },
  enrolledBeforeEnd: {
    id: 'rwaq.admin.dashboard.platformTotals.enrolledBeforeEnd',
    defaultMessage: 'Total enrollments before the course end date',
  },
  enrolledAfterEnd: {
    id: 'rwaq.admin.dashboard.platformTotals.enrolledAfterEnd',
    defaultMessage: 'Total enrollments after the course end date',
  },
  averageEnrollmentsEnded: {
    id: 'rwaq.admin.dashboard.platformTotals.enrollmentsEnded',
    defaultMessage: 'Average enrollments per ended course',
  },
  averageCompletionsEnded: {
    id: 'rwaq.admin.dashboard.platformTotals.completionsEnded',
    defaultMessage: 'Average completions per ended course',
  },
  infoTotalUsers: {
    id: 'rwaq.admin.dashboard.platformTotals.info.users',
    defaultMessage: 'Every account, active or deactivated, legacy or new. Staff and service accounts are excluded.',
  },
  infoTotalEnrollments: {
    id: 'rwaq.admin.dashboard.platformTotals.info.enrollments',
    defaultMessage: 'Every enrollment ever made, including the ones since cancelled.',
  },
  infoTotalUnenrollments: {
    id: 'rwaq.admin.dashboard.platformTotals.info.unenrollments',
    defaultMessage: 'Enrollments that were cancelled. They are also part of the total enrollments.',
  },
  infoEnrolledBeforeEnd: {
    id: 'rwaq.admin.dashboard.platformTotals.info.enrolledBeforeEnd',
    defaultMessage: 'Enrollments made before the end date of their course. Courses with no end date are not counted here or after the end date.',
  },
  infoEnrolledAfterEnd: {
    id: 'rwaq.admin.dashboard.platformTotals.info.enrolledAfterEnd',
    defaultMessage: 'Enrollments made on or after the end date of their course. Courses with no end date are not counted here or before the end date.',
  },
  infoEnrollmentsEnded: {
    id: 'rwaq.admin.dashboard.platformTotals.info.enrollmentsEnded',
    defaultMessage: 'Enrollments in courses whose end date has passed, divided by the number of those courses.',
  },
  infoCompletionsEnded: {
    id: 'rwaq.admin.dashboard.platformTotals.info.completionsEnded',
    defaultMessage: 'Certificates issued in courses whose end date has passed, divided by the number of those courses. A certificate counts only when the learner has an enrollment in that course.',
  },
  infoAverageCompletion: {
    id: 'rwaq.admin.dashboard.platformTotals.info.completion',
    defaultMessage: 'Certificates issued as a share of enrollments, only in courses with certificates enabled. A certificate counts only when the learner has an enrollment in that course.',
  },
  infoCoursesPerLearner: {
    id: 'rwaq.admin.dashboard.platformTotals.info.coursesPerLearner',
    defaultMessage: 'Active enrollments divided by the number of learners with at least one active enrollment.',
  },
  averageCompletion: {
    id: 'rwaq.admin.dashboard.platformTotals.completion',
    defaultMessage: 'Average completion percentage (courses with certificates)',
  },
  averageCoursesPerLearner: {
    id: 'rwaq.admin.dashboard.platformTotals.coursesPerLearner',
    defaultMessage: 'Average courses per active learner',
  },
  infoCertCoverage: {
    id: 'rwaq.admin.dashboard.info.certCoverage',
    defaultMessage: 'Published courses with at least one active certificate enabled. Always all-time.',
  },
  infoCertIssuance: {
    id: 'rwaq.admin.dashboard.info.certIssuance',
    defaultMessage: 'Among certificate-enabled courses, the share of enrolled learners who earned a certificate. When a date range is selected, the numerator counts certificates issued in that period; the denominator counts enrollments created on or before the end date, so the rate is stable and can never exceed 100%.',
  },
  infoProgramCompletion: {
    id: 'rwaq.admin.dashboard.info.programCompletion',
    defaultMessage: 'Share of all-time program enrollments that resulted in a completion. When a date range is selected, only completions in that period are counted.',
  },
  infoLegacyMigration: {
    id: 'rwaq.admin.dashboard.info.legacyMigration',
    defaultMessage: 'Share of legacy accounts (imported from the old platform) that have set their password and signed in at least once. Always all-time — not affected by the date range filter.',
  },
  infoEnrollmentTrend: {
    id: 'rwaq.admin.dashboard.info.enrollmentTrend',
    defaultMessage: 'Distinct learner–course pairs with courseware activity, grouped by calendar month. A learner active in two different months appears in both bars — so the bar sum may exceed the stat card for multi-month ranges where the same pair was active in multiple months.',
  },
  infoCertTrend: {
    id: 'rwaq.admin.dashboard.info.certTrend',
    defaultMessage: 'Monthly certificates issued over the selected period or last 12 months.',
  },
  infoCourseLifecycle: {
    id: 'rwaq.admin.dashboard.info.courseLifecycle',
    defaultMessage: 'All courses grouped by their status at the selected end date (or now if no date is set): Running, Upcoming, Ended, or No dates set. This is a point-in-time snapshot, not a period count.',
  },
  infoEnrollmentModes: {
    id: 'rwaq.admin.dashboard.info.enrollmentModes',
    defaultMessage: 'Enrollment breakdown by course mode (honor, audit). When a date range is selected, shows modes for enrollments created in that period.',
  },
  infoOrgsLeaderboard: {
    id: 'rwaq.admin.dashboard.info.orgsLeaderboard',
    defaultMessage: 'Top 10 organizations ranked by enrollment count. When a date range is selected, course and enrollment counts reflect activity created in that period; admin count is always all-time (role grants have no creation timestamp).',
  },
  infoBusiestCourses: {
    id: 'rwaq.admin.dashboard.info.busiestCourses',
    defaultMessage: 'Top 10 courses by enrollment count and their combined share of total enrollments. When a date range is selected, only enrollments created in that period are counted.',
  },

  // ── Date range picker ──────────────────────────────────────────────────────
  kpiRegistrationsRange: {
    id: 'rwaq.admin.dashboard.kpi.registrationsRange',
    defaultMessage: 'New registrations',
  },
  trendDateRange: {
    id: 'rwaq.admin.dashboard.trendDateRange',
    defaultMessage: '{start} – {end}',
  },
  today: { id: 'rwaq.admin.dashboard.today', defaultMessage: 'today' },
  allTimeBadge: { id: 'rwaq.admin.dashboard.allTimeBadge', defaultMessage: 'All time' },

  dateRangePickerLabel: { id: 'rwaq.admin.dashboard.dateRange.pickerLabel', defaultMessage: 'Select time period' },
  presetLast30Days: { id: 'rwaq.admin.dashboard.preset.last30Days', defaultMessage: 'Last 30 days' },
  presetLast3Months: { id: 'rwaq.admin.dashboard.preset.last3Months', defaultMessage: 'Last 3 months' },
  presetLast6Months: { id: 'rwaq.admin.dashboard.preset.last6Months', defaultMessage: 'Last 6 months' },
  presetLast12Months: { id: 'rwaq.admin.dashboard.preset.last12Months', defaultMessage: 'Last 12 months' },
  presetYearToDate: { id: 'rwaq.admin.dashboard.preset.yearToDate', defaultMessage: 'Year to date' },
  presetAllTime: { id: 'rwaq.admin.dashboard.preset.allTime', defaultMessage: 'All time' },
  presetCustom: { id: 'rwaq.admin.dashboard.preset.custom', defaultMessage: 'Custom' },
  dateRangeStart: { id: 'rwaq.admin.dashboard.dateRange.start', defaultMessage: 'From' },
  dateRangeEnd: { id: 'rwaq.admin.dashboard.dateRange.end', defaultMessage: 'To' },
  dateRangeError: { id: 'rwaq.admin.dashboard.dateRange.error', defaultMessage: 'End date must be on or after start date.' },
  dateRangeApply: { id: 'rwaq.admin.dashboard.dateRange.apply', defaultMessage: 'Apply' },
  relativeJustNow: { id: 'rwaq.admin.dashboard.relative.justNow', defaultMessage: 'Just now' },
  relativeMinutes: { id: 'rwaq.admin.dashboard.relative.minutes', defaultMessage: '{count} min ago' },
  relativeHours: { id: 'rwaq.admin.dashboard.relative.hours', defaultMessage: '{count} hr ago' },
});

export default messages;
