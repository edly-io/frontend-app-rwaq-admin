/**
 * Dashboard i18n messages, colocated with the feature.
 */
import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  title: { id: 'rwaq.admin.dashboard.title', defaultMessage: 'Dashboard' },
  asOf: { id: 'rwaq.admin.dashboard.asOf', defaultMessage: 'Figures as of {time}' },
  errorTitle: { id: 'rwaq.admin.dashboard.error.title', defaultMessage: 'Could not load analytics' },
  retry: { id: 'rwaq.admin.dashboard.retry', defaultMessage: 'Try again' },
  unavailable: { id: 'rwaq.admin.dashboard.unavailable', defaultMessage: 'Not available' },
  none: { id: 'rwaq.admin.dashboard.none', defaultMessage: '—' },

  // ── KPI row ────────────────────────────────────────────────────────────────
  kpiLearners: { id: 'rwaq.admin.dashboard.kpi.learners', defaultMessage: 'Learners' },
  kpiLearnersRange: { id: 'rwaq.admin.dashboard.kpi.learnersRange', defaultMessage: 'New learners' },
  kpiEnrollments: { id: 'rwaq.admin.dashboard.kpi.enrollments', defaultMessage: 'Enrollments' },
  kpiEnrollmentsRange: { id: 'rwaq.admin.dashboard.kpi.enrollmentsRange', defaultMessage: 'New enrollments' },
  kpiCoursesRunning: { id: 'rwaq.admin.dashboard.kpi.coursesRunning', defaultMessage: 'Courses running' },
  kpiProgramsActive: { id: 'rwaq.admin.dashboard.kpi.programsActive', defaultMessage: 'Programs active' },
  kpiRegistrations: { id: 'rwaq.admin.dashboard.kpi.registrations', defaultMessage: 'Registrations this month' },
  kpiOfTotal: { id: 'rwaq.admin.dashboard.kpi.ofTotal', defaultMessage: 'of {total} total' },

  // ── Trends ─────────────────────────────────────────────────────────────────
  enrollmentTrend: { id: 'rwaq.admin.dashboard.enrollmentTrend', defaultMessage: 'Enrollment trend' },
  certificateTrend: { id: 'rwaq.admin.dashboard.certificateTrend', defaultMessage: 'Certificates issued' },
  registrationTrend: { id: 'rwaq.admin.dashboard.registrationTrend', defaultMessage: 'New registrations' },
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
  legacyTitle: { id: 'rwaq.admin.dashboard.legacy.title', defaultMessage: 'Legacy migration' },
  legacyHint: {
    id: 'rwaq.admin.dashboard.legacy.hint',
    defaultMessage: '{signedIn} of {total} imported accounts have signed in',
  },
  legacyNone: {
    id: 'rwaq.admin.dashboard.legacy.none',
    defaultMessage: 'No imported accounts on this platform.',
  },
  modesTitle: { id: 'rwaq.admin.dashboard.modes.title', defaultMessage: 'Enrollment modes' },
  modeColMode: { id: 'rwaq.admin.dashboard.modes.colMode', defaultMessage: 'Mode' },
  modeColShare: { id: 'rwaq.admin.dashboard.modes.colShare', defaultMessage: 'Share' },
  modesHint: {
    id: 'rwaq.admin.dashboard.modes.hint',
    defaultMessage: 'Rwaq runs its access model on honor, so a drift toward audit is worth checking.',
  },

  // ── Enrollment window health ───────────────────────────────────────────────
  windowsTitle: { id: 'rwaq.admin.dashboard.windows.title', defaultMessage: 'Enrollment windows' },
  windowsClosed: {
    id: 'rwaq.admin.dashboard.windows.closed',
    defaultMessage: '{count, plural, one {# running course has a closed enrollment window} other {# running courses have closed enrollment windows}}',
  },
  windowsNone: {
    id: 'rwaq.admin.dashboard.windows.none',
    defaultMessage: '{count, plural, one {# running course has no enrollment window set} other {# running courses have no enrollment window set}}',
  },
  windowsHealthy: {
    id: 'rwaq.admin.dashboard.windows.healthy',
    defaultMessage: 'Every running course has an open enrollment window.',
  },

  // ── Tables ─────────────────────────────────────────────────────────────────
  orgsTitle: { id: 'rwaq.admin.dashboard.orgs.title', defaultMessage: 'Organizations by enrollment' },
  orgColName: { id: 'rwaq.admin.dashboard.orgs.colName', defaultMessage: 'Organization' },
  orgColCourses: { id: 'rwaq.admin.dashboard.orgs.colCourses', defaultMessage: 'Courses' },
  orgColEnrollments: { id: 'rwaq.admin.dashboard.orgs.colEnrollments', defaultMessage: 'Enrollments' },
  orgColAdmins: { id: 'rwaq.admin.dashboard.orgs.colAdmins', defaultMessage: 'Admins' },

  topCoursesTitle: { id: 'rwaq.admin.dashboard.topCourses.title', defaultMessage: 'Busiest courses' },
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

  // ── Section headings, which group the bands ────────────────────────────────
  sectionGrowth: { id: 'rwaq.admin.dashboard.section.growth', defaultMessage: 'Growth' },
  sectionOutcomes: { id: 'rwaq.admin.dashboard.section.outcomes', defaultMessage: 'Outcomes' },
  sectionPlatform: { id: 'rwaq.admin.dashboard.section.platform', defaultMessage: 'Platform health' },
  sectionCatalog: { id: 'rwaq.admin.dashboard.section.catalog', defaultMessage: 'Catalog' },

  // ── Info tooltips ──────────────────────────────────────────────────────────
  infoLearners: {
    id: 'rwaq.admin.dashboard.info.learners',
    defaultMessage: 'Registered learner accounts — excludes staff and service accounts.',
  },
  infoEnrollments: {
    id: 'rwaq.admin.dashboard.info.enrollments',
    defaultMessage: 'Active course enrollments, including later-cancelled ones.',
  },
  infoCoursesRunning: {
    id: 'rwaq.admin.dashboard.info.coursesRunning',
    defaultMessage: 'Courses currently live (start date passed, end date not yet reached).',
  },
  infoProgramsActive: {
    id: 'rwaq.admin.dashboard.info.programsActive',
    defaultMessage: 'Programs currently in Active status. Always all-time — status reflects the current state, not a dated event.',
  },
  infoRegistrations: {
    id: 'rwaq.admin.dashboard.info.registrations',
    defaultMessage: 'New learner accounts registered this calendar month vs. last month.',
  },
  infoCertCoverage: {
    id: 'rwaq.admin.dashboard.info.certCoverage',
    defaultMessage: 'Published courses with at least one active web certificate enabled. Always all-time.',
  },
  infoCertIssuance: {
    id: 'rwaq.admin.dashboard.info.certIssuance',
    defaultMessage: 'Among certificate-enabled courses, the share of enrollments that earned a certificate.',
  },
  infoProgramCompletion: {
    id: 'rwaq.admin.dashboard.info.programCompletion',
    defaultMessage: 'Share of program enrollments that reached a completion date.',
  },
  infoLegacyMigration: {
    id: 'rwaq.admin.dashboard.info.legacyMigration',
    defaultMessage: 'Legacy accounts imported from the old platform that have signed in at least once. Always all-time.',
  },
  infoEnrollmentTrend: {
    id: 'rwaq.admin.dashboard.info.enrollmentTrend',
    defaultMessage: 'Monthly course enrollment counts over the selected period or last 12 months.',
  },
  infoCertTrend: {
    id: 'rwaq.admin.dashboard.info.certTrend',
    defaultMessage: 'Monthly certificates issued over the selected period or last 12 months.',
  },
  infoCourseLifecycle: {
    id: 'rwaq.admin.dashboard.info.courseLifecycle',
    defaultMessage: 'All courses grouped by current status: Running, Upcoming, Ended, or No dates set. Always all-time.',
  },
  infoEnrollmentModes: {
    id: 'rwaq.admin.dashboard.info.enrollmentModes',
    defaultMessage: 'Enrollment breakdown by course mode (honor, audit, etc.). Rwaq runs on honor mode — a drift toward audit indicates a setup issue.',
  },
  infoEnrollmentWindows: {
    id: 'rwaq.admin.dashboard.info.enrollmentWindows',
    defaultMessage: 'Running courses with a closed or missing enrollment window — learners cannot self-enroll even though the course is live. Always all-time.',
  },
  infoOrgsLeaderboard: {
    id: 'rwaq.admin.dashboard.info.orgsLeaderboard',
    defaultMessage: 'Organizations ranked by enrollment count. Course and admin counts are always all-time.',
  },
  infoBusiestCourses: {
    id: 'rwaq.admin.dashboard.info.busiestCourses',
    defaultMessage: 'Top 5 courses by enrollment count and their combined share of all enrollments.',
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

  presetLast30Days: { id: 'rwaq.admin.dashboard.preset.last30Days', defaultMessage: 'Last 30 days' },
  presetLast3Months: { id: 'rwaq.admin.dashboard.preset.last3Months', defaultMessage: 'Last 3 months' },
  presetLast6Months: { id: 'rwaq.admin.dashboard.preset.last6Months', defaultMessage: 'Last 6 months' },
  presetLast12Months: { id: 'rwaq.admin.dashboard.preset.last12Months', defaultMessage: 'Last 12 months' },
  presetYearToDate: { id: 'rwaq.admin.dashboard.preset.yearToDate', defaultMessage: 'Year to date' },
  presetAllTime: { id: 'rwaq.admin.dashboard.preset.allTime', defaultMessage: 'All time' },
  presetCustom: { id: 'rwaq.admin.dashboard.preset.custom', defaultMessage: 'Custom' },
  dateRangeStart: { id: 'rwaq.admin.dashboard.dateRange.start', defaultMessage: 'From' },
  dateRangeEnd: { id: 'rwaq.admin.dashboard.dateRange.end', defaultMessage: 'To' },
});

export default messages;
