/**
 * Dashboard i18n messages, colocated with the feature.
 */
import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  title: { id: 'rwaq.admin.dashboard.title', defaultMessage: 'Dashboard' },
  asOf: { id: 'rwaq.admin.dashboard.asOf', defaultMessage: 'Figures as of {time}' },
  lastUpdated: { id: 'rwaq.admin.dashboard.lastUpdated', defaultMessage: 'Updated {time}' },
  refreshAriaLabel: { id: 'rwaq.admin.dashboard.refresh', defaultMessage: 'Refresh dashboard' },
  errorTitle: { id: 'rwaq.admin.dashboard.error.title', defaultMessage: 'Could not load analytics' },
  retry: { id: 'rwaq.admin.dashboard.retry', defaultMessage: 'Try again' },
  unavailable: { id: 'rwaq.admin.dashboard.unavailable', defaultMessage: 'Not available' },
  none: { id: 'rwaq.admin.dashboard.none', defaultMessage: '—' },

  // ── KPI row ────────────────────────────────────────────────────────────────
  kpiLearners: { id: 'rwaq.admin.dashboard.kpi.learners', defaultMessage: 'Learners' },
  kpiEnrollments: { id: 'rwaq.admin.dashboard.kpi.enrollments', defaultMessage: 'Enrollments' },
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

  // ── Program status breakdown ───────────────────────────────────────────────
  programStatusTitle: {
    id: 'rwaq.admin.dashboard.programStatus.title',
    defaultMessage: 'Programs by status',
  },
  programStatusHint: {
    id: 'rwaq.admin.dashboard.programStatus.hint',
    defaultMessage: 'Cross-check: active (visible) matches the KPI above; active (admin-only) explains why the Programs page shows a higher number.',
  },
  programStatusColStatus: {
    id: 'rwaq.admin.dashboard.programStatus.colStatus',
    defaultMessage: 'Status',
  },
  programStatusColCount: {
    id: 'rwaq.admin.dashboard.programStatus.colCount',
    defaultMessage: 'Count',
  },
  programStatusColNote: {
    id: 'rwaq.admin.dashboard.programStatus.colNote',
    defaultMessage: 'Note',
  },
  programStatusActiveVisible: {
    id: 'rwaq.admin.dashboard.programStatus.activeVisible',
    defaultMessage: 'Active (learner-visible)',
  },
  programStatusActiveHidden: {
    id: 'rwaq.admin.dashboard.programStatus.activeHidden',
    defaultMessage: 'Active (admin-only)',
  },
  programStatusDraft: { id: 'rwaq.admin.dashboard.programStatus.draft', defaultMessage: 'Draft' },
  programStatusArchived: { id: 'rwaq.admin.dashboard.programStatus.archived', defaultMessage: 'Archived' },
  programStatusTotal: { id: 'rwaq.admin.dashboard.programStatus.total', defaultMessage: 'Total (all)' },
  programStatusNoteVisible: {
    id: 'rwaq.admin.dashboard.programStatus.noteVisible',
    defaultMessage: 'Shown to learners · matches KPI card',
  },
  programStatusNoteHidden: {
    id: 'rwaq.admin.dashboard.programStatus.noteHidden',
    defaultMessage: 'Hidden via is_hide flag · admins only',
  },
  programStatusNoteDraft: {
    id: 'rwaq.admin.dashboard.programStatus.noteDraft',
    defaultMessage: 'Not yet published',
  },
  programStatusNoteArchived: {
    id: 'rwaq.admin.dashboard.programStatus.noteArchived',
    defaultMessage: 'No longer offered',
  },
  programStatusNoteTotal: {
    id: 'rwaq.admin.dashboard.programStatus.noteTotal',
    defaultMessage: 'All statuses combined · matches Programs management page',
  },

  // ── Section headings, which group the bands ────────────────────────────────
  sectionGrowth: { id: 'rwaq.admin.dashboard.section.growth', defaultMessage: 'Growth' },
  sectionOutcomes: { id: 'rwaq.admin.dashboard.section.outcomes', defaultMessage: 'Outcomes' },
  sectionPlatform: { id: 'rwaq.admin.dashboard.section.platform', defaultMessage: 'Platform health' },
  sectionCatalog: { id: 'rwaq.admin.dashboard.section.catalog', defaultMessage: 'Catalog' },
});

export default messages;
