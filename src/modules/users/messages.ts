/**
 * User Management i18n messages, colocated with the feature.
 */
import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  // ── Page ───────────────────────────────────────────────────────────────────
  title: { id: 'rwaq.admin.users.title', defaultMessage: 'User Management' },
  addUser: { id: 'rwaq.admin.users.addUser', defaultMessage: 'Add user' },
  errorTitle: { id: 'rwaq.admin.users.error.title', defaultMessage: 'Could not load users' },

  // ── Search ─────────────────────────────────────────────────────────────────
  searchByLabel: { id: 'rwaq.admin.users.search.byLabel', defaultMessage: 'Search by' },
  searchByEmail: { id: 'rwaq.admin.users.search.byEmail', defaultMessage: 'Email' },
  searchByName: { id: 'rwaq.admin.users.search.byName', defaultMessage: 'Name' },
  searchByUserId: { id: 'rwaq.admin.users.search.byUserId', defaultMessage: 'User ID' },
  searchTermLabel: { id: 'rwaq.admin.users.search.termLabel', defaultMessage: 'Search term' },
  searchTermPlaceholder: { id: 'rwaq.admin.users.search.placeholder', defaultMessage: 'Search users…' },
  searchPlaceholderEmail: { id: 'rwaq.admin.users.search.phEmail', defaultMessage: 'Search by email address…' },
  searchPlaceholderName: { id: 'rwaq.admin.users.search.phName', defaultMessage: 'Search by full name…' },
  searchPlaceholderUserId: { id: 'rwaq.admin.users.search.phUserId', defaultMessage: 'Search by numeric user ID…' },
  searchButton: { id: 'rwaq.admin.users.search.submit', defaultMessage: 'Search' },
  clearButton: { id: 'rwaq.admin.users.search.clear', defaultMessage: 'Clear' },
  validationUserIdInvalid: {
    id: 'rwaq.admin.users.validation.userId',
    defaultMessage: 'User ID must be a number.',
  },
  validationEmailInvalid: {
    id: 'rwaq.admin.users.validation.email',
    defaultMessage: 'Enter a valid email address.',
  },

  // ── Filter ─────────────────────────────────────────────────────────────────
  filterLabel: { id: 'rwaq.admin.users.filter.label', defaultMessage: 'Filter' },
  filterAll: { id: 'rwaq.admin.users.filter.all', defaultMessage: 'All users' },
  filterGlobalStaff: { id: 'rwaq.admin.users.filter.globalStaff', defaultMessage: 'Global Staff' },
  filterSuperuser: { id: 'rwaq.admin.users.filter.superuser', defaultMessage: 'Superusers' },
  filterCourseCreator: { id: 'rwaq.admin.users.filter.courseCreator', defaultMessage: 'Course Creators' },
  filterSupportStaff: { id: 'rwaq.admin.users.filter.supportStaff', defaultMessage: 'Support Staff' },
  filterOrgAdmin: { id: 'rwaq.admin.users.filter.orgAdmin', defaultMessage: 'Organization Admins' },
  filterLearner: { id: 'rwaq.admin.users.filter.learner', defaultMessage: 'Learners' },
  filterActive: { id: 'rwaq.admin.users.filter.active', defaultMessage: 'Active' },
  filterInactive: { id: 'rwaq.admin.users.filter.inactive', defaultMessage: 'Inactive' },
  filterConfirmed: { id: 'rwaq.admin.users.filter.confirmed', defaultMessage: 'Email confirmed' },
  filterUnconfirmed: { id: 'rwaq.admin.users.filter.unconfirmed', defaultMessage: 'Email unconfirmed' },
  filterPublicProfile: { id: 'rwaq.admin.users.filter.publicProfile', defaultMessage: 'Public profile' },
  filterPrivateProfile: { id: 'rwaq.admin.users.filter.privateProfile', defaultMessage: 'Private profile' },
  filterPasswordOnly: { id: 'rwaq.admin.users.filter.passwordOnly', defaultMessage: 'Password sign-in' },
  filterFacebook: { id: 'rwaq.admin.users.filter.facebook', defaultMessage: 'Facebook sign-in' },
  filterGoogle: { id: 'rwaq.admin.users.filter.google', defaultMessage: 'Google sign-in' },
  filterTwitter: { id: 'rwaq.admin.users.filter.twitter', defaultMessage: 'Twitter sign-in' },
  filterLegacy: { id: 'rwaq.admin.users.filter.legacy', defaultMessage: 'Legacy accounts' },

  // ── Sort ───────────────────────────────────────────────────────────────────
  sortLabel: { id: 'rwaq.admin.users.sort.label', defaultMessage: 'Sort by' },
  sortCreatedDesc: { id: 'rwaq.admin.users.sort.createdDesc', defaultMessage: 'Newest first' },
  sortCreatedAsc: { id: 'rwaq.admin.users.sort.createdAsc', defaultMessage: 'Oldest first' },
  sortNameAsc: { id: 'rwaq.admin.users.sort.nameAsc', defaultMessage: 'Name (A–Z)' },
  sortEmailAsc: { id: 'rwaq.admin.users.sort.emailAsc', defaultMessage: 'Email (A–Z)' },
  sortLastLoginDesc: { id: 'rwaq.admin.users.sort.lastLoginDesc', defaultMessage: 'Last login' },
  sortIdAsc: { id: 'rwaq.admin.users.sort.idAsc', defaultMessage: 'User ID' },

  // ── Columns ────────────────────────────────────────────────────────────────
  colAvatar: { id: 'rwaq.admin.users.col.avatar', defaultMessage: 'Photo' },
  colName: { id: 'rwaq.admin.users.col.name', defaultMessage: 'Name' },
  colEmail: { id: 'rwaq.admin.users.col.email', defaultMessage: 'Email' },
  colStatus: { id: 'rwaq.admin.users.col.status', defaultMessage: 'Status' },
  colRoles: { id: 'rwaq.admin.users.col.roles', defaultMessage: 'Roles' },
  colCreated: { id: 'rwaq.admin.users.col.created', defaultMessage: 'Created' },
  colLastLogin: { id: 'rwaq.admin.users.col.lastLogin', defaultMessage: 'Last login' },
  colActions: { id: 'rwaq.admin.users.col.actions', defaultMessage: 'Actions' },
  never: { id: 'rwaq.admin.users.never', defaultMessage: 'Never' },

  // ── Status badges ──────────────────────────────────────────────────────────
  statusActive: { id: 'rwaq.admin.users.status.active', defaultMessage: 'Active' },
  statusInactive: { id: 'rwaq.admin.users.status.inactive', defaultMessage: 'Inactive' },
  emailConfirmed: { id: 'rwaq.admin.users.status.emailConfirmed', defaultMessage: 'Email confirmed' },
  emailUnconfirmed: { id: 'rwaq.admin.users.status.emailUnconfirmed', defaultMessage: 'Email not confirmed' },
  legacyBadge: { id: 'rwaq.admin.users.status.legacy', defaultMessage: 'Legacy account' },

  // ── Role badges ────────────────────────────────────────────────────────────
  roleSuperuser: { id: 'rwaq.admin.users.role.superuser', defaultMessage: 'Superuser' },
  roleGlobalStaff: { id: 'rwaq.admin.users.role.globalStaff', defaultMessage: 'Global Staff' },
  roleCourseCreator: { id: 'rwaq.admin.users.role.courseCreator', defaultMessage: 'Course Creator' },
  roleSupportStaff: { id: 'rwaq.admin.users.role.supportStaff', defaultMessage: 'Support Staff' },
  roleOrgAdmin: { id: 'rwaq.admin.users.role.orgAdmin', defaultMessage: 'Organization Admin' },
  roleLearner: { id: 'rwaq.admin.users.role.learner', defaultMessage: 'Learner' },

  // ── Role tooltips ──────────────────────────────────────────────────────────
  tooltipLearner: {
    id: 'rwaq.admin.users.tooltip.learner',
    defaultMessage: 'Standard user. Can enrol and take courses. No admin access.',
  },
  tooltipGlobalStaff: {
    id: 'rwaq.admin.users.tooltip.globalStaff',
    defaultMessage: 'Full access to every course in Studio and the LMS, without needing to be '
      + 'on a Course Team, and can create courses. Also allows signing in to Django admin. '
      + 'Does not grant access to this admin panel, that is Superuser.',
  },
  tooltipCourseCreator: {
    id: 'rwaq.admin.users.tooltip.courseCreator',
    defaultMessage: 'Can create new courses in Studio.',
  },
  tooltipSupportStaff: {
    id: 'rwaq.admin.users.tooltip.supportStaff',
    defaultMessage: 'Access to Support Tools, look up users, view/manage enrolments, reset passwords.',
  },
  tooltipSuperuser: {
    id: 'rwaq.admin.users.tooltip.superuser',
    defaultMessage: 'Grants access to this admin panel, and bypasses every permission check in '
      + 'Django admin. On its own it grants no access to courses or Studio, that is Global Staff. '
      + 'Grant it only to someone who should be able to do anything here.',
  },
  tooltipOrgAdmin: {
    id: 'rwaq.admin.users.tooltip.orgAdmin',
    defaultMessage: 'Administers one organization. Granted on the Organizations screen, not here.',
  },
  moreInfo: { id: 'rwaq.admin.users.tooltip.moreInfo', defaultMessage: 'What does this grant?' },

  // ── Filter / sort labels for the collapsible panel and applied chips ───────
  filterGroupLabel: { id: 'rwaq.admin.users.filter.groupLabel', defaultMessage: 'Filter by' },
  chipSearch: { id: 'rwaq.admin.users.chip.search', defaultMessage: '{scope}: {term}' },
  chipFilter: { id: 'rwaq.admin.users.chip.filter', defaultMessage: 'Filter: {label}' },
  chipSort: { id: 'rwaq.admin.users.chip.sort', defaultMessage: 'Sorted by: {label}' },

  // ── Form ───────────────────────────────────────────────────────────────────
  createTitle: { id: 'rwaq.admin.users.form.createTitle', defaultMessage: 'Add user' },
  editTitle: { id: 'rwaq.admin.users.form.editTitle', defaultMessage: 'Edit user' },
  fieldEmail: { id: 'rwaq.admin.users.form.email', defaultMessage: 'Email' },
  fieldEmailHelp: {
    id: 'rwaq.admin.users.form.emailHelp',
    defaultMessage: 'The username is generated from the email and cannot be changed later.',
  },
  fieldName: { id: 'rwaq.admin.users.form.name', defaultMessage: 'Full name' },
  fieldJob: { id: 'rwaq.admin.users.form.job', defaultMessage: 'Job title' },
  fieldCountry: { id: 'rwaq.admin.users.form.country', defaultMessage: 'Country' },
  fieldCountryNone: { id: 'rwaq.admin.users.form.countryNone', defaultMessage: '— Select a country —' },
  fieldBiography: { id: 'rwaq.admin.users.form.biography', defaultMessage: 'Biography' },
  fieldVisibility: { id: 'rwaq.admin.users.form.visibility', defaultMessage: 'Profile visibility' },
  visibilityPrivate: { id: 'rwaq.admin.users.form.visibilityPrivate', defaultMessage: 'Private' },
  visibilityPublic: { id: 'rwaq.admin.users.form.visibilityPublic', defaultMessage: 'Public' },
  fieldActive: { id: 'rwaq.admin.users.form.active', defaultMessage: 'Account active' },
  fieldActiveHelp: {
    id: 'rwaq.admin.users.form.activeHelp',
    defaultMessage: 'Turning this off blocks the account from signing in. Accounts are never deleted.',
  },
  sectionProfile: { id: 'rwaq.admin.users.form.sectionProfile', defaultMessage: 'Profile' },
  sectionRoles: { id: 'rwaq.admin.users.form.sectionRoles', defaultMessage: 'Platform roles' },
  sectionStatus: { id: 'rwaq.admin.users.form.sectionStatus', defaultMessage: 'Status' },
  rolesHelp: {
    id: 'rwaq.admin.users.form.rolesHelp',
    defaultMessage: 'Every user is a learner. These grants are platform-wide and add to that.',
  },
  notesTitle: {
    id: 'rwaq.admin.users.form.notesTitle',
    defaultMessage: 'Roles assigned elsewhere',
  },
  orgAdminNote: {
    id: 'rwaq.admin.users.form.orgAdminNote',
    defaultMessage: 'Organization Admin, granted on the Organizations screen.',
  },
  courseRolesNote: {
    id: 'rwaq.admin.users.form.courseRolesNote',
    defaultMessage: 'Course Instructor, Course Staff, per-course roles, assigned in Studio on the course\'s Course Team page.',
  },
  save: { id: 'rwaq.admin.users.form.save', defaultMessage: 'Save' },
  create: { id: 'rwaq.admin.users.form.create', defaultMessage: 'Create user' },
  selfRevokeSuperuserBlocked: {
    id: 'rwaq.admin.users.roles.selfRevokeSuperuserBlocked',
    defaultMessage: 'You cannot remove your own Superuser access, it is what grants you this panel.',
  },
  confirmSuperuserTitle: {
    id: 'rwaq.admin.users.roles.confirmSuperuserTitle',
    defaultMessage: 'Grant Superuser?',
  },
  confirmSuperuserBody: {
    id: 'rwaq.admin.users.roles.confirmSuperuserBody',
    defaultMessage: 'Superuser bypasses every permission check in Django, and grants access to '
      + 'this admin panel. It does not by itself grant access to courses or Studio, that is '
      + 'Global Staff. Only grant it to someone who should be able to do anything here.',
  },
  confirmSuperuserAction: {
    id: 'rwaq.admin.users.roles.confirmSuperuserAction',
    defaultMessage: 'Grant Superuser',
  },
  cancel: { id: 'rwaq.admin.users.form.cancel', defaultMessage: 'Cancel' },
  requiredField: { id: 'rwaq.admin.users.form.required', defaultMessage: 'This field is required.' },
  invalidEmail: { id: 'rwaq.admin.users.form.invalidEmail', defaultMessage: 'Enter a valid email address.' },
  tooLong: { id: 'rwaq.admin.users.form.tooLong', defaultMessage: 'This value is too long.' },

  // ── Guardrails / confirmations ─────────────────────────────────────────────
  confirmGlobalStaffTitle: {
    id: 'rwaq.admin.users.confirm.globalStaffTitle',
    defaultMessage: 'Grant Global Staff access?',
  },
  confirmGlobalStaffBody: {
    id: 'rwaq.admin.users.confirm.globalStaffBody',
    defaultMessage: 'Global Staff can access every course and the Django admin, and can manage other administrators. Only grant this to people who need full platform access.',
  },
  confirmGlobalStaffAction: {
    id: 'rwaq.admin.users.confirm.globalStaffAction',
    defaultMessage: 'Yes, grant Global Staff',
  },
  selfDeactivateBlocked: {
    id: 'rwaq.admin.users.guard.selfDeactivate',
    defaultMessage: 'You cannot deactivate your own account.',
  },
  selfRevokeBlocked: {
    id: 'rwaq.admin.users.guard.selfRevoke',
    defaultMessage: 'You cannot revoke your own Global Staff access.',
  },

  // ── Toasts ─────────────────────────────────────────────────────────────────
  toastCreated: { id: 'rwaq.admin.users.toast.created', defaultMessage: '{name} was created.' },
  toastUpdated: { id: 'rwaq.admin.users.toast.updated', defaultMessage: '{name} was updated.' },
  toastError: { id: 'rwaq.admin.users.toast.error', defaultMessage: 'Could not save: {reason}' },
  genericError: { id: 'rwaq.admin.users.toast.genericError', defaultMessage: 'Something went wrong. Please try again.' },

  // ── Detail drawer ──────────────────────────────────────────────────────────
  detailTitle: { id: 'rwaq.admin.users.detail.title', defaultMessage: 'User details' },
  tabEnrollments: { id: 'rwaq.admin.users.detail.tabEnrollments', defaultMessage: 'Enrollments' },
  detailUsername: { id: 'rwaq.admin.users.detail.username', defaultMessage: 'Username' },
  detailUserId: { id: 'rwaq.admin.users.detail.userId', defaultMessage: 'User ID' },
  detailEmail: { id: 'rwaq.admin.users.detail.email', defaultMessage: 'Email' },
  detailJob: { id: 'rwaq.admin.users.detail.job', defaultMessage: 'Job title' },
  detailCountry: { id: 'rwaq.admin.users.detail.country', defaultMessage: 'Country' },
  detailBiography: { id: 'rwaq.admin.users.detail.biography', defaultMessage: 'Biography' },
  detailVisibility: { id: 'rwaq.admin.users.detail.visibility', defaultMessage: 'Profile visibility' },
  detailAuthMethods: { id: 'rwaq.admin.users.detail.authMethods', defaultMessage: 'Sign-in methods' },
  detailCreated: { id: 'rwaq.admin.users.detail.created', defaultMessage: 'Created' },
  detailLastLogin: { id: 'rwaq.admin.users.detail.lastLogin', defaultMessage: 'Last login' },
  detailOrgAdminOf: { id: 'rwaq.admin.users.detail.orgAdminOf', defaultMessage: 'Organization Admin of' },
  detailNone: { id: 'rwaq.admin.users.detail.none', defaultMessage: '—' },
  edit: { id: 'rwaq.admin.users.detail.edit', defaultMessage: 'Edit' },
  view: { id: 'rwaq.admin.users.detail.view', defaultMessage: 'View' },

  sectionIdentity: { id: 'rwaq.admin.users.detail.sectionIdentity', defaultMessage: 'Identity' },
  sectionProfileDetails: { id: 'rwaq.admin.users.detail.sectionProfileDetails', defaultMessage: 'Profile' },
  sectionAccess: { id: 'rwaq.admin.users.detail.sectionAccess', defaultMessage: 'Access' },
  sectionActivity: { id: 'rwaq.admin.users.detail.sectionActivity', defaultMessage: 'Activity' },
  detailStatus: { id: 'rwaq.admin.users.detail.status', defaultMessage: 'Status' },
  detailRoles: { id: 'rwaq.admin.users.detail.roles', defaultMessage: 'Platform roles' },

  // ── Enrollments tab ────────────────────────────────────────────────────────
  enrollmentsEmpty: {
    id: 'rwaq.admin.users.enrollments.empty',
    defaultMessage: 'This user is not enrolled in any course.',
  },
  enrollmentsError: {
    id: 'rwaq.admin.users.enrollments.error',
    defaultMessage: 'Could not load enrollments.',
  },
  enrollmentCourse: { id: 'rwaq.admin.users.enrollments.course', defaultMessage: 'Course' },
  enrollmentDate: { id: 'rwaq.admin.users.enrollments.date', defaultMessage: 'Enrolled' },
  enrollmentStatus: { id: 'rwaq.admin.users.enrollments.status', defaultMessage: 'Status' },
  enrollmentCertificate: { id: 'rwaq.admin.users.enrollments.certificate', defaultMessage: 'Certificate' },
  enrollmentMode: { id: 'rwaq.admin.users.enrollments.mode', defaultMessage: 'Mode' },
  enrollmentCount: {
    id: 'rwaq.admin.users.enrollments.count',
    defaultMessage: '{count, plural, one {# enrollment} other {# enrollments}}',
  },
  enrollmentNoCertificate: {
    id: 'rwaq.admin.users.enrollments.noCertificate',
    defaultMessage: 'None',
  },
  enrollmentActive: { id: 'rwaq.admin.users.enrollments.active', defaultMessage: 'Active' },
  enrollmentInactive: { id: 'rwaq.admin.users.enrollments.inactive', defaultMessage: 'Unenrolled' },
  enrollmentActions: { id: 'rwaq.admin.users.enrollments.actions', defaultMessage: 'Actions' },
  enrollmentLastChangeBy: {
    id: 'rwaq.admin.users.enrollments.lastChangeBy',
    defaultMessage: '{reason}, {actor}, {date}',
  },

  // ── Enrollment actions ─────────────────────────────────────────────────────
  editUser: { id: 'rwaq.admin.users.detail.editUser', defaultMessage: 'Edit user' },
  enrollAction: { id: 'rwaq.admin.users.enroll.action', defaultMessage: 'Enroll in a course' },
  enrollTitle: { id: 'rwaq.admin.users.enroll.title', defaultMessage: 'Enroll {name} in a course' },
  enrollSubmit: { id: 'rwaq.admin.users.enroll.submit', defaultMessage: 'Enroll' },
  enrollCourseLabel: { id: 'rwaq.admin.users.enroll.courseLabel', defaultMessage: 'Course' },
  enrollCoursePlaceholder: {
    id: 'rwaq.admin.users.enroll.coursePlaceholder',
    defaultMessage: 'Search by course name or ID',
  },
  enrollCourseHelp: {
    id: 'rwaq.admin.users.enroll.courseHelp',
    defaultMessage: 'Start typing to search. Only the first {limit} matches are shown.',
  },
  enrollCourseRequired: {
    id: 'rwaq.admin.users.enroll.courseRequired',
    defaultMessage: 'Choose a course.',
  },
  enrollNoCourses: {
    id: 'rwaq.admin.users.enroll.noCourses',
    defaultMessage: 'No courses match that search.',
  },
  enrollSearching: { id: 'rwaq.admin.users.enroll.searching', defaultMessage: 'Searching…' },
  enrollCoursesError: {
    id: 'rwaq.admin.users.enroll.coursesError',
    defaultMessage: 'Could not load courses. Try again.',
  },
  enrollSelected: { id: 'rwaq.admin.users.enroll.selected', defaultMessage: 'Selected course' },
  enrollClear: { id: 'rwaq.admin.users.enroll.clear', defaultMessage: 'Change course' },
  enrollAlready: {
    id: 'rwaq.admin.users.enroll.already',
    defaultMessage: 'Already enrolled in this course.',
  },
  enrollReactivates: {
    id: 'rwaq.admin.users.enroll.reactivates',
    defaultMessage: 'This learner unenrolled from this course before. Enrolling again restores '
      + 'their original enrollment, along with any progress on it.',
  },

  modeChangeTitle: {
    id: 'rwaq.admin.users.modeChange.title',
    defaultMessage: 'Change enrollment mode',
  },
  modeChangeSubmit: { id: 'rwaq.admin.users.modeChange.submit', defaultMessage: 'Change mode' },
  modeChangeAction: { id: 'rwaq.admin.users.modeChange.action', defaultMessage: 'Change mode' },
  modeCurrent: { id: 'rwaq.admin.users.modeChange.current', defaultMessage: 'Current mode' },
  modeNew: { id: 'rwaq.admin.users.modeChange.new', defaultMessage: 'New mode' },
  modeSame: {
    id: 'rwaq.admin.users.modeChange.same',
    defaultMessage: 'Choose a different mode.',
  },
  modeOnlyOne: {
    id: 'rwaq.admin.users.modeChange.onlyOne',
    defaultMessage: 'This course offers only one mode, so there is nothing to change it to.',
  },
  modeLabel: { id: 'rwaq.admin.users.modeChange.label', defaultMessage: 'Mode' },
  modeRequired: { id: 'rwaq.admin.users.modeChange.required', defaultMessage: 'Choose a mode.' },

  unenrollTitle: { id: 'rwaq.admin.users.unenroll.title', defaultMessage: 'Unenroll from course' },
  unenrollAction: { id: 'rwaq.admin.users.unenroll.action', defaultMessage: 'Unenroll' },
  unenrollSubmit: { id: 'rwaq.admin.users.unenroll.submit', defaultMessage: 'Unenroll' },
  unenrollBody: {
    id: 'rwaq.admin.users.unenroll.body',
    defaultMessage: 'Unenroll {name} from {course}? Their grades and any certificate stay on '
      + 'record, and they can be enrolled again later.',
  },

  reasonLabel: { id: 'rwaq.admin.users.reason.label', defaultMessage: 'Reason' },
  reasonHelp: {
    id: 'rwaq.admin.users.reason.help',
    defaultMessage: 'Recorded against this change, and visible to other admins.',
  },
  reasonRequired: {
    id: 'rwaq.admin.users.reason.required',
    defaultMessage: 'A reason is required.',
  },
  reasonOther: { id: 'rwaq.admin.users.reason.other', defaultMessage: 'Something else…' },
  reasonOtherLabel: {
    id: 'rwaq.admin.users.reason.otherLabel',
    defaultMessage: 'Describe the reason',
  },
  reasonSelect: { id: 'rwaq.admin.users.reason.select', defaultMessage: 'Choose a reason' },

  enrollSuccess: {
    id: 'rwaq.admin.users.enroll.success',
    defaultMessage: 'Enrolled in {course}. Grades and certificates update shortly.',
  },
  modeChangeSuccess: {
    id: 'rwaq.admin.users.modeChange.success',
    defaultMessage: 'Mode changed to {mode}. Grades and certificates update shortly.',
  },
  unenrollSuccess: {
    id: 'rwaq.admin.users.unenroll.success',
    defaultMessage: 'Unenrolled from {course}.',
  },
  enrollmentConflict: {
    id: 'rwaq.admin.users.enrollments.conflict',
    defaultMessage: 'This enrollment changed while you had it open. Reload to see where it '
      + 'stands now, then try again.',
  },
  enrollmentReload: { id: 'rwaq.admin.users.enrollments.reload', defaultMessage: 'Reload' },
  enrollmentWriteError: {
    id: 'rwaq.admin.users.enrollments.writeError',
    defaultMessage: 'Could not save the change.',
  },
});

export default messages;
