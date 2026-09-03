/**
 * Organizations i18n messages, colocated with the feature.
 */
import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  // ── List page ──────────────────────────────────────────────────────────────
  title: { id: 'rwaq.admin.orgs.title', defaultMessage: 'Organizations' },
  addOrg: { id: 'rwaq.admin.orgs.addOrg', defaultMessage: 'Add organization' },
  errorTitle: { id: 'rwaq.admin.orgs.error.title', defaultMessage: 'Could not load organizations' },
  searchPlaceholder: { id: 'rwaq.admin.orgs.search.placeholder', defaultMessage: 'Search by name or short name…' },

  filterGroupLabel: { id: 'rwaq.admin.orgs.filter.label', defaultMessage: 'Filter by' },
  filterAll: { id: 'rwaq.admin.orgs.filter.all', defaultMessage: 'All organizations' },
  filterActive: { id: 'rwaq.admin.orgs.filter.active', defaultMessage: 'Active' },
  filterInactive: { id: 'rwaq.admin.orgs.filter.inactive', defaultMessage: 'Inactive' },
  filterHasAdmins: { id: 'rwaq.admin.orgs.filter.hasAdmins', defaultMessage: 'Has admins' },
  filterNoAdmins: { id: 'rwaq.admin.orgs.filter.noAdmins', defaultMessage: 'No admins' },

  sortLabel: { id: 'rwaq.admin.orgs.sort.label', defaultMessage: 'Sort by' },
  sortNameAsc: { id: 'rwaq.admin.orgs.sort.nameAsc', defaultMessage: 'Name (A–Z)' },
  sortNameDesc: { id: 'rwaq.admin.orgs.sort.nameDesc', defaultMessage: 'Name (Z–A)' },
  sortCoursesDesc: { id: 'rwaq.admin.orgs.sort.coursesDesc', defaultMessage: 'Most courses' },
  sortAdminsDesc: { id: 'rwaq.admin.orgs.sort.adminsDesc', defaultMessage: 'Most admins' },
  sortNewest: { id: 'rwaq.admin.orgs.sort.newest', defaultMessage: 'Newest first' },

  chipSearch: { id: 'rwaq.admin.orgs.chip.search', defaultMessage: 'Search: {term}' },
  chipFilter: { id: 'rwaq.admin.orgs.chip.filter', defaultMessage: 'Filter: {label}' },
  chipSort: { id: 'rwaq.admin.orgs.chip.sort', defaultMessage: 'Sorted by: {label}' },

  // ── Columns ────────────────────────────────────────────────────────────────
  colName: { id: 'rwaq.admin.orgs.col.name', defaultMessage: 'Organization' },
  colArabicName: { id: 'rwaq.admin.orgs.col.arabicName', defaultMessage: 'Arabic name' },
  colShortName: { id: 'rwaq.admin.orgs.col.shortName', defaultMessage: 'Short name' },
  colStatus: { id: 'rwaq.admin.orgs.col.status', defaultMessage: 'Status' },
  colCourses: { id: 'rwaq.admin.orgs.col.courses', defaultMessage: 'Courses' },
  colPrograms: { id: 'rwaq.admin.orgs.col.programs', defaultMessage: 'Programs' },
  colAdmins: { id: 'rwaq.admin.orgs.col.admins', defaultMessage: 'Admins' },
  colActions: { id: 'rwaq.admin.orgs.col.actions', defaultMessage: 'Actions' },
  statusActive: { id: 'rwaq.admin.orgs.status.active', defaultMessage: 'Active' },
  statusInactive: { id: 'rwaq.admin.orgs.status.inactive', defaultMessage: 'Inactive' },
  view: { id: 'rwaq.admin.orgs.action.view', defaultMessage: 'View' },
  edit: { id: 'rwaq.admin.orgs.action.edit', defaultMessage: 'Edit' },

  // ── Create / edit modal ────────────────────────────────────────────────────
  createTitle: { id: 'rwaq.admin.orgs.form.createTitle', defaultMessage: 'Add organization' },
  editTitle: { id: 'rwaq.admin.orgs.form.editTitle', defaultMessage: 'Edit organization' },
  fieldName: { id: 'rwaq.admin.orgs.form.name', defaultMessage: 'Name' },
  fieldShortName: { id: 'rwaq.admin.orgs.form.shortName', defaultMessage: 'Short name' },
  fieldShortNameHelp: {
    id: 'rwaq.admin.orgs.form.shortNameHelp',
    defaultMessage: 'Letters, numbers, hyphens and underscores only. Becomes part of every course key in this organization and cannot be changed later.',
  },
  fieldArabicName: { id: 'rwaq.admin.orgs.form.arabicName', defaultMessage: 'Arabic name' },
  fieldFeaturedVideo: { id: 'rwaq.admin.orgs.form.featuredVideo', defaultMessage: 'Featured video URL' },
  fieldLogo: { id: 'rwaq.admin.orgs.form.logo', defaultMessage: 'Organization logo' },
  fieldLogoChange: { id: 'rwaq.admin.orgs.form.logoChange', defaultMessage: 'Change logo' },
  fieldLogoRemove: { id: 'rwaq.admin.orgs.form.logoRemove', defaultMessage: 'Remove' },
  fieldLogoHelp: {
    id: 'rwaq.admin.orgs.form.logoHelp',
    defaultMessage: 'JPG, PNG or GIF recommended. Saved together with the form.',
  },
  fieldLogoTypeError: {
    id: 'rwaq.admin.orgs.form.logoTypeError',
    defaultMessage: 'Only JPG, PNG and GIF files are allowed.',
  },
  sectionProfile: { id: 'rwaq.admin.orgs.form.sectionProfile', defaultMessage: 'Identity' },
  sectionPublic: { id: 'rwaq.admin.orgs.form.sectionPublic', defaultMessage: 'Public profile' },
  save: { id: 'rwaq.admin.orgs.form.save', defaultMessage: 'Save changes' },
  create: { id: 'rwaq.admin.orgs.form.create', defaultMessage: 'Create organization' },
  cancel: { id: 'rwaq.admin.orgs.form.cancel', defaultMessage: 'Cancel' },
  requiredField: { id: 'rwaq.admin.orgs.form.required', defaultMessage: 'This field is required.' },
  shortNameInvalid: {
    id: 'rwaq.admin.orgs.form.shortNameInvalid',
    defaultMessage: 'Use only letters, numbers, hyphens and underscores.',
  },
  tooLong: { id: 'rwaq.admin.orgs.form.tooLong', defaultMessage: 'This value is too long.' },
  toastCreated: { id: 'rwaq.admin.orgs.toast.created', defaultMessage: '{name} was created.' },
  toastUpdated: { id: 'rwaq.admin.orgs.toast.updated', defaultMessage: '{name} was updated.' },
  genericError: { id: 'rwaq.admin.orgs.toast.genericError', defaultMessage: 'Something went wrong. Please try again.' },

  // ── Detail page ────────────────────────────────────────────────────────────
  breadcrumb: { id: 'rwaq.admin.orgs.detail.breadcrumb', defaultMessage: 'Organizations' },
  detailOverview: { id: 'rwaq.admin.orgs.detail.overview', defaultMessage: 'Overview' },
  detailShortName: { id: 'rwaq.admin.orgs.detail.shortName', defaultMessage: 'Short name' },
  detailArabicName: { id: 'rwaq.admin.orgs.detail.arabicName', defaultMessage: 'Arabic name' },
  detailCourses: { id: 'rwaq.admin.orgs.detail.courses', defaultMessage: 'Courses' },
  detailAdmins: { id: 'rwaq.admin.orgs.detail.admins', defaultMessage: 'Organization Admins' },
  detailFeaturedVideo: { id: 'rwaq.admin.orgs.detail.featuredVideo', defaultMessage: 'Featured video' },
  detailNone: { id: 'rwaq.admin.orgs.detail.none', defaultMessage: '—' },
  editOrg: { id: 'rwaq.admin.orgs.detail.editOrg', defaultMessage: 'Edit organization' },
  notFound: { id: 'rwaq.admin.orgs.detail.notFound', defaultMessage: 'Organization not found' },

  // ── Admin roster ───────────────────────────────────────────────────────────
  addAdmin: { id: 'rwaq.admin.orgs.admins.add', defaultMessage: 'Add org admin' },
  adminColAvatar: { id: 'rwaq.admin.orgs.admins.colAvatar', defaultMessage: 'Photo' },
  adminColName: { id: 'rwaq.admin.orgs.admins.colName', defaultMessage: 'Name' },
  adminColOtherOrgs: { id: 'rwaq.admin.orgs.admins.colOtherOrgs', defaultMessage: 'Other organizations' },
  adminColAdded: { id: 'rwaq.admin.orgs.admins.colAdded', defaultMessage: 'Added' },
  adminColActions: { id: 'rwaq.admin.orgs.admins.colActions', defaultMessage: 'Actions' },
  adminsEmpty: {
    id: 'rwaq.admin.orgs.admins.empty',
    defaultMessage: 'No Organization Admins yet. Add one by email address.',
  },
  remove: { id: 'rwaq.admin.orgs.admins.remove', defaultMessage: 'Remove' },
  removeTitle: { id: 'rwaq.admin.orgs.admins.removeTitle', defaultMessage: 'Remove Organization Admin?' },
  removeBody: {
    id: 'rwaq.admin.orgs.admins.removeBody',
    defaultMessage: 'This revokes {email}\'s admin access to {org} only. Any other organizations they administer are unaffected, and their account is not deleted.',
  },
  removeConfirm: { id: 'rwaq.admin.orgs.admins.removeConfirm', defaultMessage: 'Remove access' },
  toastAdminAdded: { id: 'rwaq.admin.orgs.admins.toastAdded', defaultMessage: '{email} is now an Organization Admin.' },
  toastAdminRemoved: { id: 'rwaq.admin.orgs.admins.toastRemoved', defaultMessage: '{email} is no longer an Organization Admin.' },

  // ── Add-admin modal ────────────────────────────────────────────────────────
  addAdminTitle: { id: 'rwaq.admin.orgs.addAdmin.title', defaultMessage: 'Add Organization Admin' },
  addAdminEmail: { id: 'rwaq.admin.orgs.addAdmin.email', defaultMessage: 'Email address' },
  addAdminHelp: {
    id: 'rwaq.admin.orgs.addAdmin.help',
    defaultMessage: 'The person must already have an account. They will get Studio access scoped to this organization only.',
  },
  addAdminSubmit: { id: 'rwaq.admin.orgs.addAdmin.submit', defaultMessage: 'Add admin' },
  addAdminInvalidEmail: { id: 'rwaq.admin.orgs.addAdmin.invalid', defaultMessage: 'Enter a valid email address.' },
  addAdminNotFound: {
    id: 'rwaq.admin.orgs.addAdmin.notFound',
    defaultMessage: 'No account found for that email address. The person must register first.',
  },
});

export default messages;
