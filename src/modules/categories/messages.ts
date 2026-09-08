/**
 * Categories i18n messages, colocated with the feature.
 */
import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  // ── List page ──────────────────────────────────────────────────────────────
  title: { id: 'rwaq.admin.categories.title', defaultMessage: 'Categories' },
  addCategory: { id: 'rwaq.admin.categories.add', defaultMessage: 'Add category' },
  errorTitle: { id: 'rwaq.admin.categories.error.title', defaultMessage: 'Could not load categories' },
  searchPlaceholder: { id: 'rwaq.admin.categories.search.placeholder', defaultMessage: 'Search by name…' },

  // ── Columns ────────────────────────────────────────────────────────────────
  colName: { id: 'rwaq.admin.categories.col.name', defaultMessage: 'Category' },
  colArabicName: { id: 'rwaq.admin.categories.col.arabicName', defaultMessage: 'Arabic name' },
  colStatus: { id: 'rwaq.admin.categories.col.status', defaultMessage: 'Status' },
  colCourses: { id: 'rwaq.admin.categories.col.courses', defaultMessage: 'Courses' },
  colActions: { id: 'rwaq.admin.categories.col.actions', defaultMessage: 'Actions' },
  statusActive: { id: 'rwaq.admin.categories.status.active', defaultMessage: 'Active' },
  statusInactive: { id: 'rwaq.admin.categories.status.inactive', defaultMessage: 'Inactive' },
  view: { id: 'rwaq.admin.categories.action.view', defaultMessage: 'View' },
  edit: { id: 'rwaq.admin.categories.action.edit', defaultMessage: 'Edit' },

  // ── Create / edit modal ────────────────────────────────────────────────────
  createTitle: { id: 'rwaq.admin.categories.form.createTitle', defaultMessage: 'Add category' },
  editTitle: { id: 'rwaq.admin.categories.form.editTitle', defaultMessage: 'Edit category' },
  fieldName: { id: 'rwaq.admin.categories.form.name', defaultMessage: 'Name (English)' },
  fieldArabicName: { id: 'rwaq.admin.categories.form.arabicName', defaultMessage: 'Arabic name' },
  fieldIsActive: { id: 'rwaq.admin.categories.form.isActive', defaultMessage: 'Active' },
  fieldIsActiveHelp: {
    id: 'rwaq.admin.categories.form.isActiveHelp',
    defaultMessage: 'Inactive categories are hidden from the public site.',
  },
  save: { id: 'rwaq.admin.categories.form.save', defaultMessage: 'Save changes' },
  create: { id: 'rwaq.admin.categories.form.create', defaultMessage: 'Create category' },
  cancel: { id: 'rwaq.admin.categories.form.cancel', defaultMessage: 'Cancel' },
  requiredField: { id: 'rwaq.admin.categories.form.required', defaultMessage: 'This field is required.' },
  tooLong: { id: 'rwaq.admin.categories.form.tooLong', defaultMessage: 'This value is too long.' },
  toastCreated: { id: 'rwaq.admin.categories.toast.created', defaultMessage: '{name} was created.' },
  toastUpdated: { id: 'rwaq.admin.categories.toast.updated', defaultMessage: '{name} was updated.' },
  genericError: { id: 'rwaq.admin.categories.toast.genericError', defaultMessage: 'Something went wrong. Please try again.' },

  // ── Detail page ────────────────────────────────────────────────────────────
  breadcrumb: { id: 'rwaq.admin.categories.detail.breadcrumb', defaultMessage: 'Categories' },
  detailNone: { id: 'rwaq.admin.categories.detail.none', defaultMessage: '—' },
  notFound: { id: 'rwaq.admin.categories.detail.notFound', defaultMessage: 'Category not found.' },
  editCategory: { id: 'rwaq.admin.categories.detail.editCategory', defaultMessage: 'Edit category' },
  detailOverview: { id: 'rwaq.admin.categories.detail.overview', defaultMessage: 'Overview' },
  detailName: { id: 'rwaq.admin.categories.detail.name', defaultMessage: 'Name' },
  detailArabicName: { id: 'rwaq.admin.categories.detail.arabicName', defaultMessage: 'Arabic name' },
  detailStatus: { id: 'rwaq.admin.categories.detail.status', defaultMessage: 'Status' },
  detailCourseCount: { id: 'rwaq.admin.categories.detail.courseCount', defaultMessage: 'Courses linked' },

  // ── Linked courses section ─────────────────────────────────────────────────
  coursesTitle: { id: 'rwaq.admin.categories.courses.title', defaultMessage: 'Linked courses' },
  coursesEmpty: { id: 'rwaq.admin.categories.courses.empty', defaultMessage: 'No courses linked to this category yet.' },
  coursesError: { id: 'rwaq.admin.categories.courses.error', defaultMessage: 'Could not load linked courses.' },
  linkCourse: { id: 'rwaq.admin.categories.courses.link', defaultMessage: 'Link course' },
  unlinkCourse: { id: 'rwaq.admin.categories.courses.unlink', defaultMessage: 'Unlink' },
  unlinkConfirmTitle: { id: 'rwaq.admin.categories.courses.unlinkTitle', defaultMessage: 'Unlink course?' },
  unlinkConfirmBody: {
    id: 'rwaq.admin.categories.courses.unlinkBody',
    defaultMessage: 'Remove "{name}" from this category? The course itself is not affected.',
  },
  unlinkConfirm: { id: 'rwaq.admin.categories.courses.unlinkConfirm', defaultMessage: 'Unlink' },
  colCourse: { id: 'rwaq.admin.categories.courses.col.course', defaultMessage: 'Course' },
  colOrg: { id: 'rwaq.admin.categories.courses.col.org', defaultMessage: 'Organization' },
  colRun: { id: 'rwaq.admin.categories.courses.col.run', defaultMessage: 'Run' },
  colCourseActions: { id: 'rwaq.admin.categories.courses.col.actions', defaultMessage: 'Actions' },
  toastLinked: { id: 'rwaq.admin.categories.courses.toastLinked', defaultMessage: 'Course linked.' },
  toastUnlinked: { id: 'rwaq.admin.categories.courses.toastUnlinked', defaultMessage: 'Course unlinked.' },
  toastLinkError: { id: 'rwaq.admin.categories.courses.toastLinkError', defaultMessage: 'Could not link course. Check the course key and try again.' },
  toastUnlinkError: { id: 'rwaq.admin.categories.courses.toastUnlinkError', defaultMessage: 'Could not unlink course.' },

  // ── Link course modal ──────────────────────────────────────────────────────
  linkCourseTitle: { id: 'rwaq.admin.categories.linkCourse.title', defaultMessage: 'Link course to category' },
  fieldCourseKey: { id: 'rwaq.admin.categories.linkCourse.courseKey', defaultMessage: 'Course key' },
  fieldCourseKeyHelp: {
    id: 'rwaq.admin.categories.linkCourse.courseKeyHelp',
    defaultMessage: 'e.g. course-v1:Org+CourseName+Run',
  },
  linkCourseSubmit: { id: 'rwaq.admin.categories.linkCourse.submit', defaultMessage: 'Link course' },
  linkCourseCancel: { id: 'rwaq.admin.categories.linkCourse.cancel', defaultMessage: 'Cancel' },
  linkCourseRequired: { id: 'rwaq.admin.categories.linkCourse.required', defaultMessage: 'Course key is required.' },
});

export default messages;
