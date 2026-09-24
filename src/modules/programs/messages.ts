/**
 * Programs i18n messages, colocated with the feature.
 */
import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  // ── List page ──────────────────────────────────────────────────────────────
  title: { id: 'rwaq.admin.programs.title', defaultMessage: 'Programs' },
  errorTitle: { id: 'rwaq.admin.programs.error.title', defaultMessage: 'Could not load programs' },
  searchPlaceholder: { id: 'rwaq.admin.programs.search.placeholder', defaultMessage: 'Search by program name…' },

  filterGroupLabel: { id: 'rwaq.admin.programs.filter.label', defaultMessage: 'Filter by' },
  filterAll: { id: 'rwaq.admin.programs.filter.all', defaultMessage: 'All programs' },
  filterDraft: { id: 'rwaq.admin.programs.filter.draft', defaultMessage: 'Draft' },
  filterActive: { id: 'rwaq.admin.programs.filter.active', defaultMessage: 'Active' },
  filterArchived: { id: 'rwaq.admin.programs.filter.archived', defaultMessage: 'Archived' },
  filterHidden: { id: 'rwaq.admin.programs.filter.hidden', defaultMessage: 'Hidden from catalog' },
  filterVisible: { id: 'rwaq.admin.programs.filter.visible', defaultMessage: 'Visible in catalog' },
  filterFeatured: { id: 'rwaq.admin.programs.filter.featured', defaultMessage: 'Featured' },
  filterCertEnabled: { id: 'rwaq.admin.programs.filter.certEnabled', defaultMessage: 'Certificate enabled' },

  sortLabel: { id: 'rwaq.admin.programs.sort.label', defaultMessage: 'Sort by' },
  sortNameAsc: { id: 'rwaq.admin.programs.sort.nameAsc', defaultMessage: 'Name (A–Z)' },
  sortNameDesc: { id: 'rwaq.admin.programs.sort.nameDesc', defaultMessage: 'Name (Z–A)' },
  sortNewest: { id: 'rwaq.admin.programs.sort.newest', defaultMessage: 'Newest first' },
  sortOldest: { id: 'rwaq.admin.programs.sort.oldest', defaultMessage: 'Oldest first' },
  sortMostEnrollments: { id: 'rwaq.admin.programs.sort.mostEnrollments', defaultMessage: 'Most enrollments' },
  sortMostCourses: { id: 'rwaq.admin.programs.sort.mostCourses', defaultMessage: 'Most courses' },
  sortStartDateAsc: { id: 'rwaq.admin.programs.sort.startDateAsc', defaultMessage: 'Start date (oldest first)' },
  sortStartDateDesc: { id: 'rwaq.admin.programs.sort.startDateDesc', defaultMessage: 'Start date (newest first)' },

  chipSearch: { id: 'rwaq.admin.programs.chip.search', defaultMessage: 'Search: {term}' },
  chipFilter: { id: 'rwaq.admin.programs.chip.filter', defaultMessage: 'Filter: {label}' },
  chipSort: { id: 'rwaq.admin.programs.chip.sort', defaultMessage: 'Sorted by: {label}' },

  // ── Columns ────────────────────────────────────────────────────────────────
  colProgram: { id: 'rwaq.admin.programs.col.program', defaultMessage: 'Program' },
  colOrganization: { id: 'rwaq.admin.programs.col.organization', defaultMessage: 'Organization' },
  colTypeBatch: { id: 'rwaq.admin.programs.col.typeBatch', defaultMessage: 'Type / Batch' },
  colStatus: { id: 'rwaq.admin.programs.col.status', defaultMessage: 'Status' },
  colEnrollments: { id: 'rwaq.admin.programs.col.enrollments', defaultMessage: 'Enrollments' },
  colStartDate: { id: 'rwaq.admin.programs.col.startDate', defaultMessage: 'Start date' },
  colActions: { id: 'rwaq.admin.programs.col.actions', defaultMessage: 'Actions' },
  batchLabel: { id: 'rwaq.admin.programs.col.batchLabel', defaultMessage: 'Batch {batch}' },

  // ── Status values ──────────────────────────────────────────────────────────
  statusDraft: { id: 'rwaq.admin.programs.status.draft', defaultMessage: 'Draft' },
  statusActive: { id: 'rwaq.admin.programs.status.active', defaultMessage: 'Active' },
  statusArchived: { id: 'rwaq.admin.programs.status.archived', defaultMessage: 'Archived' },
  tagHidden: { id: 'rwaq.admin.programs.tag.hidden', defaultMessage: 'Hidden' },
  tagFeatured: { id: 'rwaq.admin.programs.tag.featured', defaultMessage: 'Featured' },
  tagReadOnly: { id: 'rwaq.admin.programs.tag.readOnly', defaultMessage: 'Read Only' },

  // ── List actions ───────────────────────────────────────────────────────────
  view: { id: 'rwaq.admin.programs.action.view', defaultMessage: 'View' },

  // ── Detail page ────────────────────────────────────────────────────────────
  breadcrumb: { id: 'rwaq.admin.programs.detail.breadcrumb', defaultMessage: 'Programs' },
  detailLoading: { id: 'rwaq.admin.programs.detail.loading', defaultMessage: 'Loading program…' },
  notFound: { id: 'rwaq.admin.programs.detail.notFound', defaultMessage: 'Program not found or you do not have permission to view it.' },
  detailLoadError: { id: 'rwaq.admin.programs.detail.loadError', defaultMessage: 'Failed to load program. Please try again.' },

  // ── Detail — overview ──────────────────────────────────────────────────────
  detailOverview: { id: 'rwaq.admin.programs.detail.overview', defaultMessage: 'Overview' },
  detailProgramKey: { id: 'rwaq.admin.programs.detail.programKey', defaultMessage: 'Program key' },
  detailOrganization: { id: 'rwaq.admin.programs.detail.organization', defaultMessage: 'Organization' },
  detailType: { id: 'rwaq.admin.programs.detail.type', defaultMessage: 'Type' },
  detailBatch: { id: 'rwaq.admin.programs.detail.batch', defaultMessage: 'Batch' },
  detailSlug: { id: 'rwaq.admin.programs.detail.slug', defaultMessage: 'Slug' },
  detailStartDate: { id: 'rwaq.admin.programs.detail.startDate', defaultMessage: 'Start date' },
  detailEndDate: { id: 'rwaq.admin.programs.detail.endDate', defaultMessage: 'End date' },
  detailTotalCourses: { id: 'rwaq.admin.programs.detail.totalCourses', defaultMessage: 'Total courses' },
  detailTotalEnrollments: { id: 'rwaq.admin.programs.detail.totalEnrollments', defaultMessage: 'Total enrollments' },
  detailCreated: { id: 'rwaq.admin.programs.detail.created', defaultMessage: 'Created' },
  detailModified: { id: 'rwaq.admin.programs.detail.modified', defaultMessage: 'Last modified' },
  detailIntroVideo: { id: 'rwaq.admin.programs.detail.introVideo', defaultMessage: 'Intro video' },
  detailDescription: { id: 'rwaq.admin.programs.detail.description', defaultMessage: 'Description' },
  detailNone: { id: 'rwaq.admin.programs.detail.none', defaultMessage: '—' },

  // ── Detail — settings ─────────────────────────────────────────────────────
  settingsTitle: { id: 'rwaq.admin.programs.settings.title', defaultMessage: 'Settings' },
  settingIsHide: { id: 'rwaq.admin.programs.settings.isHide', defaultMessage: 'Hidden from all listings' },
  settingIsHideHelp: {
    id: 'rwaq.admin.programs.settings.isHideHelp',
    defaultMessage: 'When on, this program is invisible to learners, staff, and the public catalog.',
  },
  settingIsFeatured: { id: 'rwaq.admin.programs.settings.isFeatured', defaultMessage: 'Featured on the marketing site' },
  settingIsFeaturedHelp: {
    id: 'rwaq.admin.programs.settings.isFeaturedHelp',
    defaultMessage: 'Promotes this program to the featured section of the public catalog.',
  },
  settingStatus: { id: 'rwaq.admin.programs.settings.status', defaultMessage: 'Publication status' },
  settingStatusHelp: {
    id: 'rwaq.admin.programs.settings.statusHelp',
    defaultMessage: 'Only active programs accept new enrollments via the public catalog.',
  },
  settingSaved: { id: 'rwaq.admin.programs.settings.saved', defaultMessage: 'Settings saved.' },
  settingError: { id: 'rwaq.admin.programs.settings.error', defaultMessage: 'Could not save settings. Please try again.' },

  // ── Detail — pricing card ──────────────────────────────────────────────────
  pricingTitle: { id: 'rwaq.admin.programs.pricing.title', defaultMessage: 'Pricing' },
  pricingDescription: {
    id: 'rwaq.admin.programs.pricing.description',
    defaultMessage: 'Set how this program is sold. Prices are published to the marketing site.',
  },
  pricingCategoryLabel: { id: 'rwaq.admin.programs.pricing.category-label', defaultMessage: 'Pricing type' },
  pricingFree: { id: 'rwaq.admin.programs.pricing.free', defaultMessage: 'Free' },
  pricingPaid: { id: 'rwaq.admin.programs.pricing.paid', defaultMessage: 'Paid' },
  pricingPriceLabel: { id: 'rwaq.admin.programs.pricing.price-label', defaultMessage: 'Price ({currency})' },
  pricingDiscountLabel: {
    id: 'rwaq.admin.programs.pricing.discount-label',
    defaultMessage: 'Discounted price ({currency})',
  },
  pricingDiscountHint: {
    id: 'rwaq.admin.programs.pricing.discount-hint',
    defaultMessage: 'Optional. Leave empty when the program is not on sale.',
  },
  pricingCoursesNote: {
    id: 'rwaq.admin.programs.pricing.courses-note',
    defaultMessage: 'Courses in a paid program are not sold separately. The program is what learners buy.',
  },
  pricingManagedLabel: {
    id: 'rwaq.admin.programs.pricing.managed-label',
    defaultMessage: 'Manage pricing from the admin panel',
  },
  pricingManagedHint: {
    id: 'rwaq.admin.programs.pricing.managed-hint',
    defaultMessage: 'When enabled, program authors see the pricing fields in Studio but cannot change them.',
  },
  pricingSave: { id: 'rwaq.admin.programs.pricing.save', defaultMessage: 'Save pricing' },
  pricingSaving: { id: 'rwaq.admin.programs.pricing.saving', defaultMessage: 'Saving…' },
  pricingSaved: { id: 'rwaq.admin.programs.pricing.saved', defaultMessage: 'Pricing saved.' },
  pricingErrorPriceRequired: {
    id: 'rwaq.admin.programs.pricing.error-price-required',
    defaultMessage: 'Enter a price for a paid program.',
  },
  pricingErrorNegative: { id: 'rwaq.admin.programs.pricing.error-negative', defaultMessage: 'Prices cannot be negative.' },
  pricingErrorDiscountTooHigh: {
    id: 'rwaq.admin.programs.pricing.error-discount-too-high',
    defaultMessage: 'The discounted price must not be higher than the regular price.',
  },
  pricingErrorSaveFailed: {
    id: 'rwaq.admin.programs.pricing.error-save-failed',
    defaultMessage: 'Could not save pricing. Please try again.',
  },

  // ── Detail — courses tab ───────────────────────────────────────────────────
  tabCourses: { id: 'rwaq.admin.programs.tab.courses', defaultMessage: 'Courses' },
  coursesEmpty: { id: 'rwaq.admin.programs.courses.empty', defaultMessage: 'No courses in this program.' },
  coursesError: { id: 'rwaq.admin.programs.courses.error', defaultMessage: 'Could not load courses.' },
  colCourseId: { id: 'rwaq.admin.programs.courses.col.id', defaultMessage: 'Course ID' },
  colCourseName: { id: 'rwaq.admin.programs.courses.col.name', defaultMessage: 'Course name' },
  colCourseOrg: { id: 'rwaq.admin.programs.courses.col.org', defaultMessage: 'Organization' },
  colCourseAdded: { id: 'rwaq.admin.programs.courses.col.added', defaultMessage: 'Added' },

  // ── Detail — learners tab ──────────────────────────────────────────────────
  tabLearners: { id: 'rwaq.admin.programs.tab.learners', defaultMessage: 'Learners' },
  learnersEmpty: { id: 'rwaq.admin.programs.learners.empty', defaultMessage: 'No learners enrolled in this program.' },
  learnersError: { id: 'rwaq.admin.programs.learners.error', defaultMessage: 'Could not load learners.' },
  colLearnerName: { id: 'rwaq.admin.programs.learners.col.name', defaultMessage: 'Learner' },
  colLearnerEmail: { id: 'rwaq.admin.programs.learners.col.email', defaultMessage: 'Email' },
  colLearnerEnrolled: { id: 'rwaq.admin.programs.learners.col.enrolled', defaultMessage: 'Enrolled' },
  colLearnerCompleted: { id: 'rwaq.admin.programs.learners.col.completed', defaultMessage: 'Completed' },
  colLearnerActive: { id: 'rwaq.admin.programs.learners.col.active', defaultMessage: 'Enrollment' },

  // ── Shared ─────────────────────────────────────────────────────────────────
  yes: { id: 'rwaq.admin.programs.yes', defaultMessage: 'Yes' },
  no: { id: 'rwaq.admin.programs.no', defaultMessage: 'No' },

  // ── Bulk enroll ─────────────────────────────────────────────────────────────
  bulkEnrollButton: { id: 'rwaq.admin.programs.bulkEnroll.button', defaultMessage: 'Bulk enroll' },
  bulkEnrollTitle: { id: 'rwaq.admin.programs.bulkEnroll.title', defaultMessage: 'Enroll learners' },
  bulkEnrollHelp: { id: 'rwaq.admin.programs.bulkEnroll.help', defaultMessage: 'Paste email addresses, separated by commas or new lines. Learners are enrolled in the program and all of its courses.' },
  bulkEnrollLabel: { id: 'rwaq.admin.programs.bulkEnroll.label', defaultMessage: 'Email addresses' },
  bulkEnrollPlaceholder: { id: 'rwaq.admin.programs.bulkEnroll.placeholder', defaultMessage: 'sara@example.com, omar@example.com' },
  bulkEnrollCount: { id: 'rwaq.admin.programs.bulkEnroll.count', defaultMessage: '{count} of {max}' },
  bulkEnrollProgress: { id: 'rwaq.admin.programs.bulkEnroll.progress', defaultMessage: 'Enrolling {done} of {total}…' },
  bulkEnrollMax: { id: 'rwaq.admin.programs.bulkEnroll.max', defaultMessage: 'Up to {max} at a time' },
  bulkEnrollInvalid: { id: 'rwaq.admin.programs.bulkEnroll.invalid', defaultMessage: '{count, plural, one {# entry is not an email address} other {# entries are not email addresses}} — remove them to continue:' },
  bulkEnrollOverMax: { id: 'rwaq.admin.programs.bulkEnroll.overMax', defaultMessage: 'That is {count} addresses. Enroll at most {max} at a time — remove some and run the rest as a second batch.' },
  bulkEnrollSubmit: { id: 'rwaq.admin.programs.bulkEnroll.submit', defaultMessage: 'Enroll learners' },
  bulkEnrollSubmitting: { id: 'rwaq.admin.programs.bulkEnroll.submitting', defaultMessage: 'Enrolling…' },
  bulkEnrollCancel: { id: 'rwaq.admin.programs.bulkEnroll.cancel', defaultMessage: 'Cancel' },
  bulkEnrollClose: { id: 'rwaq.admin.programs.bulkEnroll.close', defaultMessage: 'Close' },
  bulkEnrollSuccess: { id: 'rwaq.admin.programs.bulkEnroll.success', defaultMessage: '{count, plural, one {# learner enrolled} other {# learners enrolled}}.' },
  bulkEnrollAlready: { id: 'rwaq.admin.programs.bulkEnroll.already', defaultMessage: '{count, plural, one {# learner was already enrolled} other {# learners were already enrolled}}.' },
  bulkEnrollNoneEnrolled: { id: 'rwaq.admin.programs.bulkEnroll.noneEnrolled', defaultMessage: 'No learners were enrolled.' },
  bulkEnrollFailedTitle: { id: 'rwaq.admin.programs.bulkEnroll.failed.title', defaultMessage: '{count, plural, one {# address could not be enrolled} other {# addresses could not be enrolled}}' },
  bulkEnrollCourseFailedTitle: { id: 'rwaq.admin.programs.bulkEnroll.courseFailed.title', defaultMessage: 'Enrolled in the program, but not in every course' },
  bulkEnrollError: { id: 'rwaq.admin.programs.bulkEnroll.error', defaultMessage: 'Could not enroll these learners. Please try again.' },
});

export default messages;

// ── ProgramReportsPage ────────────────────────────────────────────────────────

export const programReportsMessages = defineMessages({
  breadcrumbPrograms: { id: 'rwaq.admin.programReports.breadcrumb.programs', defaultMessage: 'Programs' },
  pageTitle: { id: 'rwaq.admin.programReports.pageTitle', defaultMessage: 'Reports' },
  sectionTitle: { id: 'rwaq.admin.programReports.section.title', defaultMessage: 'Program Completion' },
  sectionBody: {
    id: 'rwaq.admin.programReports.section.body',
    defaultMessage: 'Based on {numCourses} {courseWord} linked to this program. Learners enrolled in all courses are counted as completed.',
  },
  courseWord: { id: 'rwaq.admin.programReports.courseWord', defaultMessage: '{count, plural, one {course} other {courses}}' },
  errorLoad: { id: 'rwaq.admin.programReports.error.load', defaultMessage: 'Could not load program completion report. Please refresh the page.' },
  statTotalLearners: { id: 'rwaq.admin.programReports.stat.totalLearners', defaultMessage: 'Total Learners' },
  statCompleted: { id: 'rwaq.admin.programReports.stat.completed', defaultMessage: 'Completed' },
  statInProgress: { id: 'rwaq.admin.programReports.stat.inProgress', defaultMessage: 'In Progress' },
  statNotStarted: { id: 'rwaq.admin.programReports.stat.notStarted', defaultMessage: 'Not Started' },
  statCompletionRate: { id: 'rwaq.admin.programReports.stat.completionRate', defaultMessage: 'Completion Rate' },
  completionRateAriaLabel: { id: 'rwaq.admin.programReports.completionRate.ariaLabel', defaultMessage: '{rate}% completion rate' },
  completionRateCaption: { id: 'rwaq.admin.programReports.completionRate.caption', defaultMessage: '{rate}% completion rate' },
  loadingReport: { id: 'rwaq.admin.programReports.loading', defaultMessage: 'Loading report' },

  // ── Report task list page ──────────────────────────────────────────────────
  btnReports: { id: 'rwaq.admin.programReports.btnReports', defaultMessage: 'View Reports' },

  taskPageTitle: { id: 'rwaq.admin.programReports.taskPage.title', defaultMessage: 'Reports' },
  taskPageBreadcrumbReports: { id: 'rwaq.admin.programReports.taskPage.breadcrumb.reports', defaultMessage: 'Reports' },

  generateSectionTitle: { id: 'rwaq.admin.programReports.generate.title', defaultMessage: 'Generate Reports' },
  generateSectionBody: {
    id: 'rwaq.admin.programReports.generate.body',
    defaultMessage: 'Click Generate next to a report type to queue an async task. Completed files appear in the Reports Available for Download section below.',
  },

  reportEnrollmentLabel: { id: 'rwaq.admin.programReports.report.enrollment.label', defaultMessage: 'Enrollment & Progress Report' },
  reportEnrollmentDesc: {
    id: 'rwaq.admin.programReports.report.enrollment.desc',
    defaultMessage: 'Generates a CSV of all program enrollments including learner identity, enrollment dates, per-course enrollment status, grades, and certificate status.',
  },
  reportCompletionLabel: { id: 'rwaq.admin.programReports.report.completion.label', defaultMessage: 'Completion Summary' },
  reportCompletionDesc: {
    id: 'rwaq.admin.programReports.report.completion.desc',
    defaultMessage: 'Generates a CSV summary of program completion status per learner — enrolled count, completed count, and completion date where applicable.',
  },
  reportLearnerSummaryLabel: { id: 'rwaq.admin.programReports.report.learnerSummary.label', defaultMessage: 'Learner Summary' },
  reportLearnerSummaryDesc: {
    id: 'rwaq.admin.programReports.report.learnerSummary.desc',
    defaultMessage: 'One row per learner with aggregated stats: courses enrolled, courses passed, average grade, and certificates earned across all program courses.',
  },
  reportCourseStatisticsLabel: { id: 'rwaq.admin.programReports.report.courseStatistics.label', defaultMessage: 'Course Statistics' },
  reportCourseStatisticsDesc: {
    id: 'rwaq.admin.programReports.report.courseStatistics.desc',
    defaultMessage: 'One row per course with totals across all program learners: enrollments, passes, pass rate, average grade, and certificates issued.',
  },

  btnGenerate: { id: 'rwaq.admin.programReports.btn.generate', defaultMessage: 'Generate' },
  srGeneratingReport: { id: 'rwaq.admin.programReports.sr.generatingReport', defaultMessage: 'Generating report…' },

  downloadsSectionTitle: { id: 'rwaq.admin.programReports.downloads.title', defaultMessage: 'Reports Available for Download' },
  downloadsSectionBody: {
    id: 'rwaq.admin.programReports.downloads.body',
    defaultMessage: 'Auto-refreshes every 10s while a report is processing. Download links expire after 1 hour.',
  },

  btnGenerateEnrollment: { id: 'rwaq.admin.programReports.btn.enrollment', defaultMessage: 'Generate Enrollment & Progress Report' },
  btnGenerateCompletion: { id: 'rwaq.admin.programReports.btn.completion', defaultMessage: 'Generate Completion Summary' },

  warningDuplicate: {
    id: 'rwaq.admin.programReports.warning.duplicate',
    defaultMessage: 'A report of this type is already being generated.',
  },

  statusRunning: {
    id: 'rwaq.admin.programReports.status.running',
    defaultMessage: 'Your report is being generated…',
  },

  errorTriggerGeneric: {
    id: 'rwaq.admin.programReports.error.triggerGeneric',
    defaultMessage: 'Failed to queue report. Please try again.',
  },

  errorLoadReports: {
    id: 'rwaq.admin.programReports.error.loadReports',
    defaultMessage: 'Could not load report history. Please refresh.',
  },

  colReportType: { id: 'rwaq.admin.programReports.col.reportType', defaultMessage: 'Report Type' },
  colStatus: { id: 'rwaq.admin.programReports.col.status', defaultMessage: 'Status' },
  colGenerated: { id: 'rwaq.admin.programReports.col.generated', defaultMessage: 'Generated' },
  colElapsed: { id: 'rwaq.admin.programReports.col.elapsed', defaultMessage: 'Elapsed' },
  colDownload: { id: 'rwaq.admin.programReports.col.download', defaultMessage: 'Download' },

  statusPending: { id: 'rwaq.admin.programReports.status.pending', defaultMessage: 'Pending' },
  statusProcessing: { id: 'rwaq.admin.programReports.status.processing', defaultMessage: 'Processing' },
  statusComplete: { id: 'rwaq.admin.programReports.status.complete', defaultMessage: 'Complete' },
  statusFailed: { id: 'rwaq.admin.programReports.status.failed', defaultMessage: 'Failed' },

  btnDownload: { id: 'rwaq.admin.programReports.btn.download', defaultMessage: 'Download' },

  emptyReports: { id: 'rwaq.admin.programReports.empty', defaultMessage: 'No reports have been generated yet.' },

  srLoading: { id: 'rwaq.admin.programReports.sr.loading', defaultMessage: 'Loading program…' },
});
