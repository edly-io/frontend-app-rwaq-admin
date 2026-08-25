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
});

export default messages;
