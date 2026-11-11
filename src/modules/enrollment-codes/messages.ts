import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  // ── Page ───────────────────────────────────────────────────────────────────
  title: { id: 'rwaq.admin.enrollmentCodes.title', defaultMessage: 'Enrollment codes' },
  forbiddenTitle: {
    id: 'rwaq.admin.enrollmentCodes.forbidden',
    defaultMessage: 'Enrollment codes are visible to Rwaq superadmins only.',
  },
  errorTitle: { id: 'rwaq.admin.enrollmentCodes.error', defaultMessage: 'Could not load enrollment codes.' },
  tabCodes: { id: 'rwaq.admin.enrollmentCodes.tab.codes', defaultMessage: 'Codes' },
  tabUses: { id: 'rwaq.admin.enrollmentCodes.tab.uses', defaultMessage: 'Uses' },

  // ── Codes list ─────────────────────────────────────────────────────────────
  codesSearch: {
    id: 'rwaq.admin.enrollmentCodes.codes.search',
    defaultMessage: 'Search by code, course or program, or creator',
  },
  create: { id: 'rwaq.admin.enrollmentCodes.create', defaultMessage: 'Create code' },
  colCode: { id: 'rwaq.admin.enrollmentCodes.col.code', defaultMessage: 'Code' },
  colItem: { id: 'rwaq.admin.enrollmentCodes.col.item', defaultMessage: 'Course or program' },
  colCreatedBy: { id: 'rwaq.admin.enrollmentCodes.col.createdBy', defaultMessage: 'Created by' },
  colUsage: { id: 'rwaq.admin.enrollmentCodes.col.usage', defaultMessage: 'Used / limit' },
  colExpires: { id: 'rwaq.admin.enrollmentCodes.col.expires', defaultMessage: 'Expires' },
  colStatus: { id: 'rwaq.admin.enrollmentCodes.col.status', defaultMessage: 'Status' },
  colActions: { id: 'rwaq.admin.enrollmentCodes.col.actions', defaultMessage: 'Actions' },
  usageValue: { id: 'rwaq.admin.enrollmentCodes.usage.value', defaultMessage: '{used} / {limit}' },
  noExpiry: { id: 'rwaq.admin.enrollmentCodes.noExpiry', defaultMessage: 'Never' },
  kindCourse: { id: 'rwaq.admin.enrollmentCodes.kind.course', defaultMessage: 'Course' },
  kindProgram: { id: 'rwaq.admin.enrollmentCodes.kind.program', defaultMessage: 'Program' },
  statusActive: { id: 'rwaq.admin.enrollmentCodes.status.active', defaultMessage: 'Active' },
  statusSwitchedOff: { id: 'rwaq.admin.enrollmentCodes.status.switchedOff', defaultMessage: 'Switched off' },
  statusExpired: { id: 'rwaq.admin.enrollmentCodes.status.expired', defaultMessage: 'Expired' },
  statusUsedUp: { id: 'rwaq.admin.enrollmentCodes.status.usedUp', defaultMessage: 'Used up' },
  copyCode: { id: 'rwaq.admin.enrollmentCodes.copyCode', defaultMessage: 'Copy code {code}' },
  codeCopied: { id: 'rwaq.admin.enrollmentCodes.codeCopied', defaultMessage: 'Code copied.' },
  codeCopyFailed: { id: 'rwaq.admin.enrollmentCodes.codeCopyFailed', defaultMessage: 'Could not copy the code.' },
  actionViewCard: { id: 'rwaq.admin.enrollmentCodes.action.viewCard', defaultMessage: 'View card' },
  actionViewUses: { id: 'rwaq.admin.enrollmentCodes.action.viewUses', defaultMessage: 'View uses' },
  actionSwitchOff: { id: 'rwaq.admin.enrollmentCodes.action.switchOff', defaultMessage: 'Switch off' },
  actionSwitchOn: { id: 'rwaq.admin.enrollmentCodes.action.switchOn', defaultMessage: 'Switch on' },
  actionEdit: { id: 'rwaq.admin.enrollmentCodes.action.edit', defaultMessage: 'Edit' },
  actionDelete: { id: 'rwaq.admin.enrollmentCodes.action.delete', defaultMessage: 'Delete' },
  switchedOffToast: { id: 'rwaq.admin.enrollmentCodes.switchedOff', defaultMessage: 'Code {code} is switched off.' },
  switchedOnToast: { id: 'rwaq.admin.enrollmentCodes.switchedOn', defaultMessage: 'Code {code} is switched on.' },
  switchFailed: {
    id: 'rwaq.admin.enrollmentCodes.switchFailed',
    defaultMessage: 'Could not change the code. Please try again.',
  },

  // ── Filters and chips ──────────────────────────────────────────────────────
  filterAll: { id: 'rwaq.admin.enrollmentCodes.filter.all', defaultMessage: 'All' },
  filterStatus: { id: 'rwaq.admin.enrollmentCodes.filter.status', defaultMessage: 'Status' },
  filterKind: { id: 'rwaq.admin.enrollmentCodes.filter.kind', defaultMessage: 'Course or program' },
  chipSearch: { id: 'rwaq.admin.enrollmentCodes.chip.search', defaultMessage: 'Search: {term}' },
  chipStatus: { id: 'rwaq.admin.enrollmentCodes.chip.status', defaultMessage: 'Status: {label}' },
  chipKind: { id: 'rwaq.admin.enrollmentCodes.chip.kind', defaultMessage: 'Type: {label}' },
  chipCode: { id: 'rwaq.admin.enrollmentCodes.chip.code', defaultMessage: 'Code: {code}' },
  chipItem: { id: 'rwaq.admin.enrollmentCodes.chip.item', defaultMessage: 'Item: {name}' },

  // ── Create and edit form ───────────────────────────────────────────────────
  createTitle: { id: 'rwaq.admin.enrollmentCodes.form.createTitle', defaultMessage: 'Create enrollment code' },
  createSubmit: { id: 'rwaq.admin.enrollmentCodes.form.createSubmit', defaultMessage: 'Create' },
  editTitle: { id: 'rwaq.admin.enrollmentCodes.form.editTitle', defaultMessage: 'Edit enrollment code' },
  editSubmit: { id: 'rwaq.admin.enrollmentCodes.form.editSubmit', defaultMessage: 'Save' },
  cancel: { id: 'rwaq.admin.enrollmentCodes.form.cancel', defaultMessage: 'Cancel' },
  codeLabel: { id: 'rwaq.admin.enrollmentCodes.form.codeLabel', defaultMessage: 'Code' },
  codeHelp: {
    id: 'rwaq.admin.enrollmentCodes.form.codeHelp',
    defaultMessage: '6 to 8 letters and numbers. Leave it empty and the system generates one.',
  },
  codeInvalid: {
    id: 'rwaq.admin.enrollmentCodes.form.codeInvalid',
    defaultMessage: 'Use 6 to 8 letters and numbers, nothing else.',
  },
  generate: { id: 'rwaq.admin.enrollmentCodes.form.generate', defaultMessage: 'Generate' },
  itemLabel: { id: 'rwaq.admin.enrollmentCodes.form.itemLabel', defaultMessage: 'Course or program' },
  itemRequired: { id: 'rwaq.admin.enrollmentCodes.form.itemRequired', defaultMessage: 'Choose a course or a program.' },
  itemSearch: { id: 'rwaq.admin.enrollmentCodes.form.itemSearch', defaultMessage: 'Search by name' },
  itemPlaceholder: { id: 'rwaq.admin.enrollmentCodes.form.itemPlaceholder', defaultMessage: 'Choose…' },
  itemGroupCourses: { id: 'rwaq.admin.enrollmentCodes.form.itemGroupCourses', defaultMessage: 'Courses' },
  itemGroupPrograms: { id: 'rwaq.admin.enrollmentCodes.form.itemGroupPrograms', defaultMessage: 'Programs' },
  itemHelp: {
    id: 'rwaq.admin.enrollmentCodes.form.itemHelp',
    defaultMessage: 'Only courses and programs of type Enrollment code are listed.',
  },
  itemLoadFailed: {
    id: 'rwaq.admin.enrollmentCodes.form.itemLoadFailed',
    defaultMessage: 'Could not load the courses and programs.',
  },
  multiUsage: {
    id: 'rwaq.admin.enrollmentCodes.form.multiUsage',
    defaultMessage: 'Multiple Usage (specify how many times this code can be used)',
  },
  multiUsageHelp: {
    id: 'rwaq.admin.enrollmentCodes.form.multiUsageHelp',
    defaultMessage: 'Unchecked, the code works once.',
  },
  maxUsesLabel: { id: 'rwaq.admin.enrollmentCodes.form.maxUsesLabel', defaultMessage: 'Number of uses' },
  maxUsesInvalid: {
    id: 'rwaq.admin.enrollmentCodes.form.maxUsesInvalid',
    defaultMessage: 'Enter a whole number, 1 or more.',
  },
  maxUsesBelowUses: {
    id: 'rwaq.admin.enrollmentCodes.form.maxUsesBelowUses',
    defaultMessage: 'The limit cannot be below the {used} uses already made.',
  },
  usedSoFar: { id: 'rwaq.admin.enrollmentCodes.form.usedSoFar', defaultMessage: 'Used so far: {used}' },
  expiresLabel: { id: 'rwaq.admin.enrollmentCodes.form.expiresLabel', defaultMessage: 'Expires on (optional)' },
  expiresHelp: {
    id: 'rwaq.admin.enrollmentCodes.form.expiresHelp',
    defaultMessage: 'Leave it empty for a code that never expires.',
  },
  activeLabel: { id: 'rwaq.admin.enrollmentCodes.form.activeLabel', defaultMessage: 'Code is on' },
  activeHelp: {
    id: 'rwaq.admin.enrollmentCodes.form.activeHelp',
    defaultMessage: 'Switch it off to stop new enrollments with this code.',
  },
  editReadOnlyNote: {
    id: 'rwaq.admin.enrollmentCodes.form.editReadOnlyNote',
    defaultMessage: 'The code and the course or program cannot be changed.',
  },
  saveFailed: {
    id: 'rwaq.admin.enrollmentCodes.form.saveFailed',
    defaultMessage: 'Could not save the code. Please try again.',
  },
  saved: { id: 'rwaq.admin.enrollmentCodes.form.saved', defaultMessage: 'Code saved.' },

  // ── Delete ─────────────────────────────────────────────────────────────────
  deleteTitle: { id: 'rwaq.admin.enrollmentCodes.delete.title', defaultMessage: 'Delete enrollment code' },
  deleteBody: {
    id: 'rwaq.admin.enrollmentCodes.delete.body',
    defaultMessage: 'Delete the code {code}? It has no uses. This cannot be undone.',
  },
  deleteSubmit: { id: 'rwaq.admin.enrollmentCodes.delete.submit', defaultMessage: 'Delete' },
  deleteFailed: {
    id: 'rwaq.admin.enrollmentCodes.delete.failed',
    defaultMessage: 'Could not delete the code. Please try again.',
  },
  deleted: { id: 'rwaq.admin.enrollmentCodes.delete.done', defaultMessage: 'Code {code} deleted.' },

  // ── Share card modal ───────────────────────────────────────────────────────
  cardTitleCreated: { id: 'rwaq.admin.enrollmentCodes.card.titleCreated', defaultMessage: 'Enrollment code created' },
  cardTitle: { id: 'rwaq.admin.enrollmentCodes.card.title', defaultMessage: 'Enrollment code' },
  cardLoading: { id: 'rwaq.admin.enrollmentCodes.card.loading', defaultMessage: 'Loading the card' },
  cardLoadFailed: {
    id: 'rwaq.admin.enrollmentCodes.card.loadFailed',
    defaultMessage: 'Could not load the card. Please try again.',
  },
  cardClose: { id: 'rwaq.admin.enrollmentCodes.card.close', defaultMessage: 'Close' },
  cardDownloadHtml: { id: 'rwaq.admin.enrollmentCodes.card.downloadHtml', defaultMessage: 'Download HTML' },
  cardDownloadImage: { id: 'rwaq.admin.enrollmentCodes.card.downloadImage', defaultMessage: 'Download Image' },
  cardCopyCode: { id: 'rwaq.admin.enrollmentCodes.card.copyCode', defaultMessage: 'Copy Code' },
  cardExporting: { id: 'rwaq.admin.enrollmentCodes.card.exporting', defaultMessage: 'Preparing…' },
  cardExportFailed: {
    id: 'rwaq.admin.enrollmentCodes.card.exportFailed',
    defaultMessage: 'Could not create the file. Please try again.',
  },

  // ── Uses tab ───────────────────────────────────────────────────────────────
  usesSearch: {
    id: 'rwaq.admin.enrollmentCodes.uses.search',
    defaultMessage: 'Search by student name, username or email',
  },
  colStudent: { id: 'rwaq.admin.enrollmentCodes.col.student', defaultMessage: 'Student' },
  colUsedOn: { id: 'rwaq.admin.enrollmentCodes.col.usedOn', defaultMessage: 'Used on' },
  colEnrolled: { id: 'rwaq.admin.enrollmentCodes.col.enrolled', defaultMessage: 'Enrollment' },
  stillEnrolled: { id: 'rwaq.admin.enrollmentCodes.enrolled.still', defaultMessage: 'Still enrolled' },
  left: { id: 'rwaq.admin.enrollmentCodes.enrolled.left', defaultMessage: 'Left' },
  usesCodeFilter: { id: 'rwaq.admin.enrollmentCodes.uses.codeFilter', defaultMessage: 'Code' },
  usesCodePlaceholder: { id: 'rwaq.admin.enrollmentCodes.uses.codePlaceholder', defaultMessage: 'Part of a code' },
  usesItemFilter: { id: 'rwaq.admin.enrollmentCodes.uses.itemFilter', defaultMessage: 'Course or program' },
  usesAllItems: { id: 'rwaq.admin.enrollmentCodes.uses.allItems', defaultMessage: 'All courses and programs' },

  // ── Warning on the pricing cards ───────────────────────────────────────────
  switchAwayWarning: {
    id: 'rwaq.admin.enrollmentCodes.switchAwayWarning',
    defaultMessage: '{count, plural, one {# code} other {# codes}} will be switched off.',
  },

  // ── Codes card on a course or program page ─────────────────────────────────
  cardSectionTitle: { id: 'rwaq.admin.enrollmentCodes.section.title', defaultMessage: 'Enrollment codes' },
  cardSectionCourse: {
    id: 'rwaq.admin.enrollmentCodes.section.courseDescription',
    defaultMessage: 'Learners join this course with one of these codes.',
  },
  cardSectionProgram: {
    id: 'rwaq.admin.enrollmentCodes.section.programDescription',
    defaultMessage: 'Learners join this program with one of these codes.',
  },
});

export default messages;
