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
  sortStartDate: { id: 'rwaq.admin.programs.sort.startDate', defaultMessage: 'Start date (newest)' },

  chipSearch: { id: 'rwaq.admin.programs.chip.search', defaultMessage: 'Search: {term}' },
  chipFilter: { id: 'rwaq.admin.programs.chip.filter', defaultMessage: 'Filter: {label}' },
  chipSort: { id: 'rwaq.admin.programs.chip.sort', defaultMessage: 'Sorted by: {label}' },

  // ── Columns ────────────────────────────────────────────────────────────────
  colProgram: { id: 'rwaq.admin.programs.col.program', defaultMessage: 'Program' },
  colOrganization: { id: 'rwaq.admin.programs.col.organization', defaultMessage: 'Organization' },
  colStatus: { id: 'rwaq.admin.programs.col.status', defaultMessage: 'Status' },
  colCourses: { id: 'rwaq.admin.programs.col.courses', defaultMessage: 'Courses' },
  colActions: { id: 'rwaq.admin.programs.col.actions', defaultMessage: 'Actions' },

  // ── Status values ──────────────────────────────────────────────────────────
  statusDraft: { id: 'rwaq.admin.programs.status.draft', defaultMessage: 'Draft' },
  statusActive: { id: 'rwaq.admin.programs.status.active', defaultMessage: 'Active' },
  statusArchived: { id: 'rwaq.admin.programs.status.archived', defaultMessage: 'Archived' },
  tagHidden: { id: 'rwaq.admin.programs.tag.hidden', defaultMessage: 'Hidden' },
  tagFeatured: { id: 'rwaq.admin.programs.tag.featured', defaultMessage: 'Featured' },
  tagCertEnabled: { id: 'rwaq.admin.programs.tag.certEnabled', defaultMessage: 'Certificate' },

  // ── List actions ───────────────────────────────────────────────────────────
  view: { id: 'rwaq.admin.programs.action.view', defaultMessage: 'View' },

  // ── Detail page ────────────────────────────────────────────────────────────
  breadcrumb: { id: 'rwaq.admin.programs.detail.breadcrumb', defaultMessage: 'Programs' },
  detailLoading: { id: 'rwaq.admin.programs.detail.loading', defaultMessage: 'Loading program…' },
  notFound: { id: 'rwaq.admin.programs.detail.notFound', defaultMessage: 'Program not found or you do not have permission to view it.' },

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
  settingCertEnabled: { id: 'rwaq.admin.programs.settings.certEnabled', defaultMessage: 'Certificate enabled' },
  settingCertEnabledHelp: {
    id: 'rwaq.admin.programs.settings.certEnabledHelp',
    defaultMessage: 'When on, a program certificate can be issued to qualifying learners.',
  },
  settingStatus: { id: 'rwaq.admin.programs.settings.status', defaultMessage: 'Publication status' },
  settingStatusHelp: {
    id: 'rwaq.admin.programs.settings.statusHelp',
    defaultMessage: 'Only active programs accept new enrollments via the public catalog.',
  },
  settingSaved: { id: 'rwaq.admin.programs.settings.saved', defaultMessage: 'Settings saved.' },
  settingError: { id: 'rwaq.admin.programs.settings.error', defaultMessage: 'Could not save settings. Please try again.' },

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
  colLearnerActive: { id: 'rwaq.admin.programs.learners.col.active', defaultMessage: 'Active' },

  // ── Shared ─────────────────────────────────────────────────────────────────
  yes: { id: 'rwaq.admin.programs.yes', defaultMessage: 'Yes' },
  no: { id: 'rwaq.admin.programs.no', defaultMessage: 'No' },
});

export default messages;
