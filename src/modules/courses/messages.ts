import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  // ── CoursesListPage ──────────────────────────────────────────────────────────
  title: {
    id: 'rwaq.admin.courses.title',
    defaultMessage: 'Courses',
  },
  // Columns
  colCourse: {
    id: 'rwaq.admin.courses.col.course',
    defaultMessage: 'Course',
  },
  colOrg: {
    id: 'rwaq.admin.courses.col.org',
    defaultMessage: 'Organization',
  },
  colCategory: {
    id: 'rwaq.admin.courses.col.category',
    defaultMessage: 'Category',
  },
  colStart: {
    id: 'rwaq.admin.courses.col.start',
    defaultMessage: 'Start',
  },
  colEnd: {
    id: 'rwaq.admin.courses.col.end',
    defaultMessage: 'End',
  },
  colEnrollments: {
    id: 'rwaq.admin.courses.col.enrollments',
    defaultMessage: 'Enrollments',
  },
  colPassing: {
    id: 'rwaq.admin.courses.col.passing',
    defaultMessage: 'Passing',
  },
  colActions: {
    id: 'rwaq.admin.courses.col.actions',
    defaultMessage: 'Actions',
  },
  // Search
  searchPlaceholder: {
    id: 'rwaq.admin.courses.search.placeholder',
    defaultMessage: 'Search by course name',
  },
  // Filters
  filterGroupLabel: {
    id: 'rwaq.admin.courses.filter.groupLabel',
    defaultMessage: 'Filter',
  },
  filterAll: {
    id: 'rwaq.admin.courses.filter.all',
    defaultMessage: 'All courses',
  },
  filterActive: {
    id: 'rwaq.admin.courses.filter.active',
    defaultMessage: 'Active (running now)',
  },
  filterUpcoming: {
    id: 'rwaq.admin.courses.filter.upcoming',
    defaultMessage: 'Upcoming',
  },
  filterEnded: {
    id: 'rwaq.admin.courses.filter.ended',
    defaultMessage: 'Ended',
  },
  // Sort
  sortLabel: {
    id: 'rwaq.admin.courses.sort.label',
    defaultMessage: 'Sort by',
  },
  sortNameAsc: {
    id: 'rwaq.admin.courses.sort.nameAsc',
    defaultMessage: 'Name A → Z',
  },
  sortNameDesc: {
    id: 'rwaq.admin.courses.sort.nameDesc',
    defaultMessage: 'Name Z → A',
  },
  sortStartDesc: {
    id: 'rwaq.admin.courses.sort.startDesc',
    defaultMessage: 'Start (newest first)',
  },
  sortStartAsc: {
    id: 'rwaq.admin.courses.sort.startAsc',
    defaultMessage: 'Start (oldest first)',
  },
  sortEndDesc: {
    id: 'rwaq.admin.courses.sort.endDesc',
    defaultMessage: 'End (latest first)',
  },
  sortEndAsc: {
    id: 'rwaq.admin.courses.sort.endAsc',
    defaultMessage: 'End (soonest first)',
  },
  sortOrgAsc: {
    id: 'rwaq.admin.courses.sort.orgAsc',
    defaultMessage: 'Organization A → Z',
  },
  sortEnrollmentsDesc: {
    id: 'rwaq.admin.courses.sort.enrollmentsDesc',
    defaultMessage: 'Most enrolled',
  },
  // Applied chips
  chipSearch: {
    id: 'rwaq.admin.courses.chip.search',
    defaultMessage: 'Search: {term}',
  },
  chipOrg: {
    id: 'rwaq.admin.courses.chip.org',
    defaultMessage: 'Org: {org}',
  },
  chipFilter: {
    id: 'rwaq.admin.courses.chip.filter',
    defaultMessage: 'Filter: {label}',
  },
  chipSort: {
    id: 'rwaq.admin.courses.chip.sort',
    defaultMessage: 'Sort: {label}',
  },
  // Actions
  view: {
    id: 'rwaq.admin.courses.action.view',
    defaultMessage: 'View',
  },
  // Errors
  errorTitle: {
    id: 'rwaq.admin.courses.error.title',
    defaultMessage: 'Could not load courses',
  },
  // Empty cell
  noDate: {
    id: 'rwaq.admin.courses.noDate',
    defaultMessage: '—',
  },
  noCategory: {
    id: 'rwaq.admin.courses.noCategory',
    defaultMessage: 'Uncategorized',
  },
  notAvailable: {
    id: 'rwaq.admin.courses.notAvailable',
    defaultMessage: '—',
  },

  // ── CourseDetailPage ─────────────────────────────────────────────────────────
  backToCourses: {
    id: 'rwaq.admin.courseDetail.backToCourses',
    defaultMessage: 'Courses',
  },
  courseInfoTitle: {
    id: 'rwaq.admin.courseDetail.courseInfo',
    defaultMessage: 'Course Info',
  },
  fieldCourseId: {
    id: 'rwaq.admin.courseDetail.field.courseId',
    defaultMessage: 'Course ID',
  },
  fieldOrg: {
    id: 'rwaq.admin.courseDetail.field.org',
    defaultMessage: 'Organization',
  },
  fieldStart: {
    id: 'rwaq.admin.courseDetail.field.start',
    defaultMessage: 'Start date',
  },
  fieldEnd: {
    id: 'rwaq.admin.courseDetail.field.end',
    defaultMessage: 'End date',
  },
  fieldSections: {
    id: 'rwaq.admin.courseDetail.field.sections',
    defaultMessage: 'Sections',
  },
  fieldPace: {
    id: 'rwaq.admin.courseDetail.field.pace',
    defaultMessage: 'Pace',
  },
  fieldLanguage: {
    id: 'rwaq.admin.courseDetail.field.language',
    defaultMessage: 'Language',
  },
  fieldCertificate: {
    id: 'rwaq.admin.courseDetail.field.certificate',
    defaultMessage: 'Certificate',
  },
  fieldInvitationOnly: {
    id: 'rwaq.admin.courseDetail.field.invitationOnly',
    defaultMessage: 'Invitation only',
  },
  selfPaced: {
    id: 'rwaq.admin.courseDetail.selfPaced',
    defaultMessage: 'Self-paced',
  },
  instructorPaced: {
    id: 'rwaq.admin.courseDetail.instructorPaced',
    defaultMessage: 'Instructor-paced',
  },
  yes: {
    id: 'rwaq.admin.courseDetail.yes',
    defaultMessage: 'Yes',
  },
  no: {
    id: 'rwaq.admin.courseDetail.no',
    defaultMessage: 'No',
  },
  courseErrorTitle: {
    id: 'rwaq.admin.courseDetail.error.title',
    defaultMessage: 'Could not load course',
  },

  // ── Enrollments section ──────────────────────────────────────────────────────
  enrollmentsSectionTitle: {
    id: 'rwaq.admin.courseDetail.enrollments.title',
    defaultMessage: 'Student Management',
  },
  enrollmentCount: {
    id: 'rwaq.admin.courseDetail.enrollments.count',
    defaultMessage: '{count, plural, =0 {No active enrollments} one {# active enrollment} other {# active enrollments}}',
  },
  downloadCsv: {
    id: 'rwaq.admin.courseDetail.enrollments.downloadCsv',
    defaultMessage: 'Download CSV',
  },
  downloadingCsv: {
    id: 'rwaq.admin.courseDetail.enrollments.downloadingCsv',
    defaultMessage: 'Downloading…',
  },
  enrollUser: {
    id: 'rwaq.admin.courseDetail.enrollments.enrollUser',
    defaultMessage: 'Enroll a User',
  },
  enrollmentColUser: {
    id: 'rwaq.admin.courseDetail.enrollments.col.user',
    defaultMessage: 'User',
  },
  enrollmentColMode: {
    id: 'rwaq.admin.courseDetail.enrollments.col.mode',
    defaultMessage: 'Mode',
  },
  enrollmentColStatus: {
    id: 'rwaq.admin.courseDetail.enrollments.col.status',
    defaultMessage: 'Status',
  },
  enrollmentColEnrolledAt: {
    id: 'rwaq.admin.courseDetail.enrollments.col.enrolledAt',
    defaultMessage: 'Enrolled',
  },
  enrollmentActive: {
    id: 'rwaq.admin.courseDetail.enrollments.active',
    defaultMessage: 'Active',
  },
  enrollmentInactive: {
    id: 'rwaq.admin.courseDetail.enrollments.inactive',
    defaultMessage: 'Unenrolled',
  },
  enrollmentsErrorTitle: {
    id: 'rwaq.admin.courseDetail.enrollments.error.title',
    defaultMessage: 'Could not load enrollments',
  },
  enrollmentsSearchPlaceholder: {
    id: 'rwaq.admin.courseDetail.enrollments.search.placeholder',
    defaultMessage: 'Search by name or email',
  },

  // ── Staff section ────────────────────────────────────────────────────────────
  staffSectionTitle: {
    id: 'rwaq.admin.courseDetail.staff.title',
    defaultMessage: 'Course Team',
  },
  staffSectionDescription: {
    id: 'rwaq.admin.courseDetail.staff.description',
    defaultMessage: 'Team members have edit access to this course in Studio.',
  },
  addStaff: {
    id: 'rwaq.admin.courseDetail.staff.add',
    defaultMessage: 'Add Team Member',
  },
  staffColMember: {
    id: 'rwaq.admin.courseDetail.staff.col.member',
    defaultMessage: 'Member',
  },
  staffColRole: {
    id: 'rwaq.admin.courseDetail.staff.col.role',
    defaultMessage: 'Role',
  },
  staffColActions: {
    id: 'rwaq.admin.courseDetail.staff.col.actions',
    defaultMessage: 'Actions',
  },
  removeStaff: {
    id: 'rwaq.admin.courseDetail.staff.remove',
    defaultMessage: 'Remove',
  },
  staffErrorTitle: {
    id: 'rwaq.admin.courseDetail.staff.error.title',
    defaultMessage: 'Could not load team',
  },
  staffEmpty: {
    id: 'rwaq.admin.courseDetail.staff.empty',
    defaultMessage: 'No team members yet.',
  },

  // Role labels
  roleInstructor: {
    id: 'rwaq.admin.courseDetail.role.instructor',
    defaultMessage: 'Instructor',
  },
  roleStaff: {
    id: 'rwaq.admin.courseDetail.role.staff',
    defaultMessage: 'Staff',
  },
  roleLimitedStaff: {
    id: 'rwaq.admin.courseDetail.role.limitedStaff',
    defaultMessage: 'Limited Staff',
  },
  roleBeta: {
    id: 'rwaq.admin.courseDetail.role.beta',
    defaultMessage: 'Beta Tester',
  },
  roleDataResearcher: {
    id: 'rwaq.admin.courseDetail.role.dataResearcher',
    defaultMessage: 'Data Researcher',
  },

  // ── EnrollUserModal ──────────────────────────────────────────────────────────
  enrollModalTitle: {
    id: 'rwaq.admin.courses.modal.enroll.title',
    defaultMessage: 'Enroll a User',
  },
  enrollModalUserLabel: {
    id: 'rwaq.admin.courses.modal.enroll.userLabel',
    defaultMessage: 'User',
  },
  enrollModalUserPlaceholder: {
    id: 'rwaq.admin.courses.modal.enroll.userPlaceholder',
    defaultMessage: 'Search by name or email',
  },
  enrollModalModeLabel: {
    id: 'rwaq.admin.courses.modal.enroll.modeLabel',
    defaultMessage: 'Mode',
  },
  enrollModalSubmit: {
    id: 'rwaq.admin.courses.modal.enroll.submit',
    defaultMessage: 'Enroll',
  },
  enrollModalCancel: {
    id: 'rwaq.admin.courses.modal.enroll.cancel',
    defaultMessage: 'Cancel',
  },
  enrollModalSuccess: {
    id: 'rwaq.admin.courses.modal.enroll.success',
    defaultMessage: 'User enrolled successfully.',
  },
  enrollModalConflict: {
    id: 'rwaq.admin.courses.modal.enroll.conflict',
    defaultMessage: 'This user is already enrolled in this course.',
  },
  enrollModalError: {
    id: 'rwaq.admin.courses.modal.enroll.error',
    defaultMessage: 'Could not enroll user. Please try again.',
  },

  // ── AddStaffModal ─────────────────────────────────────────────────────────────
  addStaffModalTitle: {
    id: 'rwaq.admin.courses.modal.addStaff.title',
    defaultMessage: 'Add Team Member',
  },
  addStaffModalUserLabel: {
    id: 'rwaq.admin.courses.modal.addStaff.userLabel',
    defaultMessage: 'User',
  },
  addStaffModalUserPlaceholder: {
    id: 'rwaq.admin.courses.modal.addStaff.userPlaceholder',
    defaultMessage: 'Search by name or email',
  },
  addStaffModalRoleLabel: {
    id: 'rwaq.admin.courses.modal.addStaff.roleLabel',
    defaultMessage: 'Role',
  },
  addStaffModalSubmit: {
    id: 'rwaq.admin.courses.modal.addStaff.submit',
    defaultMessage: 'Add',
  },
  addStaffModalCancel: {
    id: 'rwaq.admin.courses.modal.addStaff.cancel',
    defaultMessage: 'Cancel',
  },
  addStaffModalSuccess: {
    id: 'rwaq.admin.courses.modal.addStaff.success',
    defaultMessage: 'Team member added successfully.',
  },
  addStaffModalError: {
    id: 'rwaq.admin.courses.modal.addStaff.error',
    defaultMessage: 'Could not add team member. Please try again.',
  },

  // ── UserPicker ────────────────────────────────────────────────────────────────
  userPickerSearchPlaceholder: {
    id: 'rwaq.admin.courses.userPicker.placeholder',
    defaultMessage: 'Search by name or email…',
  },
  userPickerNoResults: {
    id: 'rwaq.admin.courses.userPicker.noResults',
    defaultMessage: 'No users found for "{query}"',
  },
  userPickerTypeToSearch: {
    id: 'rwaq.admin.courses.userPicker.typeToSearch',
    defaultMessage: 'Type to search for a user',
  },
  userPickerClear: {
    id: 'rwaq.admin.courses.userPicker.clear',
    defaultMessage: 'Clear',
  },

  // ── Reason field ───────────────────────────────────────────────────────────────
  reasonLabel: {
    id: 'rwaq.admin.courses.reason.label',
    defaultMessage: 'Reason',
  },
  reasonEnrolledByAdmin: {
    id: 'rwaq.admin.courses.reason.enrolledByAdmin',
    defaultMessage: 'Enrolled by admin',
  },
  reasonCourseCompletion: {
    id: 'rwaq.admin.courses.reason.courseCompletion',
    defaultMessage: 'Course completion requirement',
  },
  reasonTrainingProgram: {
    id: 'rwaq.admin.courses.reason.trainingProgram',
    defaultMessage: 'Training program',
  },
  reasonOther: {
    id: 'rwaq.admin.courses.reason.other',
    defaultMessage: 'Other…',
  },
  reasonOtherPlaceholder: {
    id: 'rwaq.admin.courses.reason.otherPlaceholder',
    defaultMessage: 'Describe the reason',
  },

  // ── CourseDetailPage — strings that were bypassing i18n (FE-C3) ───────────
  loadingCourse: {
    id: 'rwaq.admin.courseDetail.loading',
    defaultMessage: 'Loading course',
  },
  viewReports: {
    id: 'rwaq.admin.courseDetail.viewReports',
    defaultMessage: 'View Reports',
  },
  downloadCsvFailed: {
    id: 'rwaq.admin.courseDetail.downloadCsv.failed',
    defaultMessage: 'Failed to download CSV. Please try again.',
  },
  staffRemovedSuccess: {
    id: 'rwaq.admin.courseDetail.staff.removedSuccess',
    defaultMessage: '{name} removed from team.',
  },
  staffRemoveFailed: {
    id: 'rwaq.admin.courseDetail.staff.removeFailed',
    defaultMessage: 'Could not remove team member.',
  },
  removeStaffAriaLabel: {
    id: 'rwaq.admin.courseDetail.staff.removeAriaLabel',
    defaultMessage: 'Remove {username} from team',
  },

  // ── CoursesListPage — FE-C4 ───────────────────────────────────────────────
  viewCourseAriaLabel: {
    id: 'rwaq.admin.courses.viewAriaLabel',
    defaultMessage: 'View {courseName}',
  },

});

export default messages;

// ── CourseReportsPage ─────────────────────────────────────────────────────────

export const courseReportsMessages = defineMessages({
  breadcrumbCourses: { id: 'rwaq.admin.courseReports.breadcrumb.courses', defaultMessage: 'Courses' },
  pageTitle: { id: 'rwaq.admin.courseReports.pageTitle', defaultMessage: 'Reports' },
  generateSectionTitle: { id: 'rwaq.admin.courseReports.generateSection.title', defaultMessage: 'Generate Reports' },
  generateSectionBody: {
    id: 'rwaq.admin.courseReports.generateSection.body',
    defaultMessage: 'Click Generate next to a report type to queue an async task. Completed files appear in the Reports Available for Download section below.',
  },
  downloadsSectionTitle: { id: 'rwaq.admin.courseReports.downloadsSection.title', defaultMessage: 'Reports Available for Download' },
  downloadsSectionBody: {
    id: 'rwaq.admin.courseReports.downloadsSection.body',
    defaultMessage: 'Auto-refreshes every 10 s while a report is processing. Download links expire after 5 minutes — regenerate if a link stops working.',
  },
  btnGenerate: { id: 'rwaq.admin.courseReports.btn.generate', defaultMessage: 'Generate' },
  btnDownload: { id: 'rwaq.admin.courseReports.btn.download', defaultMessage: 'Download' },
  btnReGenerate: { id: 'rwaq.admin.courseReports.btn.reGenerate', defaultMessage: 'Re-generate' },
  btnRetry: { id: 'rwaq.admin.courseReports.btn.retry', defaultMessage: 'Retry' },
  statusQueued: { id: 'rwaq.admin.courseReports.status.queued', defaultMessage: 'Queued — waiting to start…' },
  statusGenerating: { id: 'rwaq.admin.courseReports.status.generating', defaultMessage: 'Generating…{progress}' },
  statusFailed: { id: 'rwaq.admin.courseReports.status.failed', defaultMessage: 'Report generation failed. Click Retry to try again.' },
  errorLoadReports: { id: 'rwaq.admin.courseReports.error.loadReports', defaultMessage: 'Could not load available reports.' },
  errorTriggerFallback: { id: 'rwaq.admin.courseReports.error.triggerFallback', defaultMessage: 'Failed to trigger report.' },
  srGeneratingReport: { id: 'rwaq.admin.courseReports.sr.generatingReport', defaultMessage: 'Generating report' },
  srLoadingCourse: { id: 'rwaq.admin.courseReports.sr.loadingCourse', defaultMessage: 'Loading course' },
  colReportType: { id: 'rwaq.admin.courseReports.col.reportType', defaultMessage: 'Report Type' },
  colStatus: { id: 'rwaq.admin.courseReports.col.status', defaultMessage: 'Status' },
  colGenerated: { id: 'rwaq.admin.courseReports.col.generated', defaultMessage: 'Generated' },
  colElapsed: { id: 'rwaq.admin.courseReports.col.elapsed', defaultMessage: 'Elapsed' },
  colProgress: { id: 'rwaq.admin.courseReports.col.progress', defaultMessage: 'Progress' },
  colDownload: { id: 'rwaq.admin.courseReports.col.download', defaultMessage: 'Download' },
  stateQueuing: { id: 'rwaq.admin.courseReports.state.queuing', defaultMessage: 'Queuing' },
  stateInProgress: { id: 'rwaq.admin.courseReports.state.inProgress', defaultMessage: 'In Progress' },
  stateComplete: { id: 'rwaq.admin.courseReports.state.complete', defaultMessage: 'Complete' },
  stateFailure: { id: 'rwaq.admin.courseReports.state.failure', defaultMessage: 'Failed' },
  stateRevoked: { id: 'rwaq.admin.courseReports.state.revoked', defaultMessage: 'Revoked' },
  reportGradeLabel: { id: 'rwaq.admin.courseReports.report.grade.label', defaultMessage: 'Grade Report' },
  reportGradeDesc: {
    id: 'rwaq.admin.courseReports.report.grade.desc',
    defaultMessage: 'Generates a CSV of current student grades. Each row contains student ID, email, username, cumulative grade, per-assignment scores, enrollment track, verification status, and certificate eligibility/delivery status.',
  },
  reportProblemGradeLabel: { id: 'rwaq.admin.courseReports.report.problemGrade.label', defaultMessage: 'Problem Grade Report' },
  reportProblemGradeDesc: {
    id: 'rwaq.admin.courseReports.report.problemGrade.desc',
    defaultMessage: 'Generates a CSV with per-problem scores for every student. Useful for identifying which specific problems have low scores or high failure rates.',
  },
  reportProfileInfoLabel: { id: 'rwaq.admin.courseReports.report.profileInfo.label', defaultMessage: 'Profile Information' },
  reportProfileInfoDesc: {
    id: 'rwaq.admin.courseReports.report.profileInfo.desc',
    defaultMessage: 'Generates a CSV of enrolled student profile data including username, name, email, language, location, year of birth, gender, education level, mailing address, goals, enrollment mode, account activation status, and enrollment date.',
  },
  reportMayEnrollLabel: { id: 'rwaq.admin.courseReports.report.mayEnroll.label', defaultMessage: 'Learners Who Can Enroll' },
  reportMayEnrollDesc: {
    id: 'rwaq.admin.courseReports.report.mayEnroll.desc',
    defaultMessage: "Generates a CSV of users who are in the course's invitation list but have not yet enrolled, useful for targeted outreach.",
  },
  reportInactiveLearnerLabel: { id: 'rwaq.admin.courseReports.report.inactiveLearner.label', defaultMessage: 'Learners, Account Not Activated' },
  reportInactiveLearnerDesc: {
    id: 'rwaq.admin.courseReports.report.inactiveLearner.desc',
    defaultMessage: 'Generates a CSV of enrolled learners whose accounts have never been activated (email not confirmed), so they cannot access course content.',
  },
  reportSurveyLabel: { id: 'rwaq.admin.courseReports.report.survey.label', defaultMessage: 'Survey Results' },
  reportSurveyDesc: {
    id: 'rwaq.admin.courseReports.report.survey.desc',
    defaultMessage: 'Generates a CSV of responses from the course survey module. Columns are User ID, User Name, Email, and one column per survey field answered.',
  },
  reportProctoredExamLabel: { id: 'rwaq.admin.courseReports.report.pf.label', defaultMessage: 'Proctored Exam Results' },
  reportProctoredExamDesc: {
    id: 'rwaq.admin.courseReports.report.pf.desc',
    defaultMessage: 'Generates a CSV of all proctored exam attempts, including exam name, provider, student info, attempt timing, attempt status, review status, and any reviewer comments (suspicious activity or rules violations).',
  },
  reportOraDataLabel: { id: 'rwaq.admin.courseReports.report.oraData.label', defaultMessage: 'ORA Data Report' },
  reportOraDataDesc: {
    id: 'rwaq.admin.courseReports.report.oraData.desc',
    defaultMessage: 'Generates a CSV of all Open Response Assessment submissions. Columns include Submission ID, block location, question prompt, username, submission text, submission date, and attempt number.',
  },
  reportOraSummaryLabel: { id: 'rwaq.admin.courseReports.report.oraSummary.label', defaultMessage: 'ORA Summary Report' },
  reportOraSummaryDesc: {
    id: 'rwaq.admin.courseReports.report.oraSummary.desc',
    defaultMessage: 'Generates a CSV summary of ORA grading outcomes per learner per problem. Includes final scores, grader counts, and overall pass/fail determination.',
  },
  reportOraArchiveLabel: { id: 'rwaq.admin.courseReports.report.oraArchive.label', defaultMessage: 'ORA Submission Files Archive' },
  reportOraArchiveDesc: {
    id: 'rwaq.admin.courseReports.report.oraArchive.desc',
    defaultMessage: 'Generates a ZIP archive containing all ORA submission text files and any uploaded file attachments submitted by learners for this course.',
  },
  reportAnonIdsLabel: { id: 'rwaq.admin.courseReports.report.anonIds.label', defaultMessage: 'Student Anonymized IDs' },
  reportAnonIdsDesc: {
    id: 'rwaq.admin.courseReports.report.anonIds.desc',
    defaultMessage: "Generates a CSV mapping each enrolled learner's real user ID to their anonymized user ID. Used for research and analytics that require de-identified data.",
  },
});

// ── AsyncReportCard ───────────────────────────────────────────────────────────

export const asyncReportMessages = defineMessages({
  stateQueuing: { id: 'rwaq.admin.asyncReportCard.state.queuing', defaultMessage: 'Queued' },
  stateInProgress: { id: 'rwaq.admin.asyncReportCard.state.inProgress', defaultMessage: 'In Progress' },
  stateDone: { id: 'rwaq.admin.asyncReportCard.state.done', defaultMessage: 'Done' },
  stateFailure: { id: 'rwaq.admin.asyncReportCard.state.failure', defaultMessage: 'Failed' },
  stateRevoked: { id: 'rwaq.admin.asyncReportCard.state.revoked', defaultMessage: 'Revoked' },
  generateReport: { id: 'rwaq.admin.asyncReportCard.button.generateReport', defaultMessage: 'Generate Report' },
  generating: { id: 'rwaq.admin.asyncReportCard.button.generating', defaultMessage: 'Generating…' },
  downloadCsv: { id: 'rwaq.admin.asyncReportCard.button.downloadCsv', defaultMessage: 'Download CSV' },
  errorTriggerFallback: { id: 'rwaq.admin.asyncReportCard.error.triggerFallback', defaultMessage: 'Failed to trigger report. Try again.' },
  errorLoadHistory: { id: 'rwaq.admin.asyncReportCard.error.loadHistory', defaultMessage: 'Could not load report history. The table will refresh automatically.' },
  noReportsYet: { id: 'rwaq.admin.asyncReportCard.noReports', defaultMessage: 'No reports generated yet. Click Generate Report to start.' },
  colGenerated: { id: 'rwaq.admin.asyncReportCard.col.generated', defaultMessage: 'Generated' },
  colStatus: { id: 'rwaq.admin.asyncReportCard.col.status', defaultMessage: 'Status' },
  colProcessed: { id: 'rwaq.admin.asyncReportCard.col.processed', defaultMessage: 'Processed' },
  colFile: { id: 'rwaq.admin.asyncReportCard.col.file', defaultMessage: 'File' },
  loadingHistory: { id: 'rwaq.admin.asyncReportCard.loading.history', defaultMessage: 'Loading report history' },
  screenReaderGenerating: { id: 'rwaq.admin.asyncReportCard.screenReader.generating', defaultMessage: 'Generating' },
});

// ── AddStaffModal — role descriptions ─────────────────────────────────────────

export const courseRoleMessages = defineMessages({
  instructor: {
    id: 'rwaq.admin.courses.role.instructor.desc',
    defaultMessage: 'Instructor, can edit the course and manage the team roster',
  },
  staff: {
    id: 'rwaq.admin.courses.role.staff.desc',
    defaultMessage: 'Staff, can edit the course',
  },
  limited_staff: {
    id: 'rwaq.admin.courses.role.limitedStaff.desc',
    defaultMessage: 'Limited Staff, restricted edit access',
  },
  beta_testers: {
    id: 'rwaq.admin.courses.role.beta.desc',
    defaultMessage: 'Beta Tester, early-release preview access only',
  },
  data_researcher: {
    id: 'rwaq.admin.courses.role.dataResearcher.desc',
    defaultMessage: 'Data Researcher, read-only access to learner data',
  },
});
