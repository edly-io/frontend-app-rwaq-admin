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
  backToCodes: { id: 'rwaq.admin.enrollmentCodes.usage.backToCodes', defaultMessage: 'Back to enrollment codes' },
  viewLearnerActivity: { id: 'rwaq.admin.enrollmentCodes.usage.viewLearners', defaultMessage: 'View uses' },
  usageRemainingLabel: { id: 'rwaq.admin.enrollmentCodes.usage.remainingLabel', defaultMessage: 'Remaining' },
  usageJoinedLabel: { id: 'rwaq.admin.enrollmentCodes.usage.joinedLabel', defaultMessage: 'Items joined' },

  filterCovers: { id: 'rwaq.admin.enrollmentCodes.filter.covers', defaultMessage: 'Covers: {name}' },
  emptyCoveringHintProgram: {
    id: 'rwaq.admin.enrollmentCodes.empty.coveringHintProgram',
    defaultMessage: 'No codes were made for this program alone. Organization codes also cover it: set Scope to All to see them.',
  },
  emptyCoveringHintCourse: {
    id: 'rwaq.admin.enrollmentCodes.empty.coveringHintCourse',
    defaultMessage: 'No codes were made for this course alone. Organization codes also cover it: set Scope to All to see them.',
  },
  filterCoveredItem: { id: 'rwaq.admin.enrollmentCodes.filter.coveredItem', defaultMessage: '{type}: {name}' },
  itemFilterActive: { id: 'rwaq.admin.enrollmentCodes.itemFilterActive', defaultMessage: 'Showing codes for this item.' },
  itemFilterClear: { id: 'rwaq.admin.enrollmentCodes.itemFilterClear', defaultMessage: 'Show all codes' },

  // ── Codes list ─────────────────────────────────────────────────────────────
  codesSearch: {
    id: 'rwaq.admin.enrollmentCodes.codes.search',
    defaultMessage: 'Search by code, course, program or organization, or creator',
  },
  create: { id: 'rwaq.admin.enrollmentCodes.create', defaultMessage: 'Create code' },
  colCode: { id: 'rwaq.admin.enrollmentCodes.col.code', defaultMessage: 'Code' },
  colItem: { id: 'rwaq.admin.enrollmentCodes.col.item', defaultMessage: 'Covers' },
  colScope: { id: 'rwaq.admin.enrollmentCodes.col.scope', defaultMessage: 'Scope' },
  colOrganization: { id: 'rwaq.admin.enrollmentCodes.col.organization', defaultMessage: 'Organization' },
  colTypedHere: { id: 'rwaq.admin.enrollmentCodes.col.typedHere', defaultMessage: 'Typed the code here' },
  colCreatedBy: { id: 'rwaq.admin.enrollmentCodes.col.createdBy', defaultMessage: 'Created by' },
  colUsage: { id: 'rwaq.admin.enrollmentCodes.col.usage', defaultMessage: 'Used / limit' },
  colExpires: { id: 'rwaq.admin.enrollmentCodes.col.expires', defaultMessage: 'Expires' },
  colStatus: { id: 'rwaq.admin.enrollmentCodes.col.status', defaultMessage: 'Status' },
  colActions: { id: 'rwaq.admin.enrollmentCodes.col.actions', defaultMessage: 'Actions' },
  usageUsedOf: { id: 'rwaq.admin.enrollmentCodes.usage.usedOf', defaultMessage: 'Used {count} of {max}' },
  usageRemaining: { id: 'rwaq.admin.enrollmentCodes.usage.remaining', defaultMessage: '{count} left' },
  usageCovers: {
    id: 'rwaq.admin.enrollmentCodes.usage.covers',
    defaultMessage: 'Covers {count, plural, one {# course or program} other {# courses and programs}}',
  },
  usageJoined: {
    id: 'rwaq.admin.enrollmentCodes.usage.joined',
    defaultMessage: '{count, plural, one {# item joined} other {# items joined}}',
  },
  yes: { id: 'rwaq.admin.enrollmentCodes.yes', defaultMessage: 'Yes' },
  no: { id: 'rwaq.admin.enrollmentCodes.no', defaultMessage: 'No' },
  noExpiry: { id: 'rwaq.admin.enrollmentCodes.noExpiry', defaultMessage: 'Never' },
  kindCourse: { id: 'rwaq.admin.enrollmentCodes.kind.course', defaultMessage: 'Course' },
  kindProgram: { id: 'rwaq.admin.enrollmentCodes.kind.program', defaultMessage: 'Program' },
  kindOrganization: { id: 'rwaq.admin.enrollmentCodes.kind.organization', defaultMessage: 'Organization' },
  statusActive: { id: 'rwaq.admin.enrollmentCodes.status.active', defaultMessage: 'Active' },
  statusSwitchedOff: { id: 'rwaq.admin.enrollmentCodes.status.switchedOff', defaultMessage: 'Inactive' },
  statusExpired: { id: 'rwaq.admin.enrollmentCodes.status.expired', defaultMessage: 'Expired' },
  statusUsedUp: { id: 'rwaq.admin.enrollmentCodes.status.usedUp', defaultMessage: 'Used up' },
  copyCode: { id: 'rwaq.admin.enrollmentCodes.copyCode', defaultMessage: 'Copy code {code}' },
  codeCopied: { id: 'rwaq.admin.enrollmentCodes.codeCopied', defaultMessage: 'Code copied.' },
  codeCopyFailed: { id: 'rwaq.admin.enrollmentCodes.codeCopyFailed', defaultMessage: 'Could not copy the code.' },
  actionViewCard: { id: 'rwaq.admin.enrollmentCodes.action.viewCard', defaultMessage: 'View card' },
  actionViewUsage: { id: 'rwaq.admin.enrollmentCodes.action.viewUsage', defaultMessage: 'View details of {code}' },
  actionViewUses: { id: 'rwaq.admin.enrollmentCodes.action.viewUses', defaultMessage: 'View uses' },
  actionSwitchOff: { id: 'rwaq.admin.enrollmentCodes.action.switchOff', defaultMessage: 'Mark inactive' },
  actionSwitchOn: { id: 'rwaq.admin.enrollmentCodes.action.switchOn', defaultMessage: 'Mark active' },
  actionEdit: { id: 'rwaq.admin.enrollmentCodes.action.edit', defaultMessage: 'Edit' },
  actionDelete: { id: 'rwaq.admin.enrollmentCodes.action.delete', defaultMessage: 'Delete' },
  switchedOffToast: { id: 'rwaq.admin.enrollmentCodes.switchedOff', defaultMessage: 'Code {code} is now inactive.' },
  switchedOnToast: { id: 'rwaq.admin.enrollmentCodes.switchedOn', defaultMessage: 'Code {code} is now active.' },
  switchFailed: {
    id: 'rwaq.admin.enrollmentCodes.switchFailed',
    defaultMessage: 'Could not change the code. Please try again.',
  },

  // ── Filters and chips ──────────────────────────────────────────────────────
  filterAll: { id: 'rwaq.admin.enrollmentCodes.filter.all', defaultMessage: 'All' },
  filterStatus: { id: 'rwaq.admin.enrollmentCodes.filter.status', defaultMessage: 'Status' },
  filterKind: { id: 'rwaq.admin.enrollmentCodes.filter.kind', defaultMessage: 'Scope' },
  filterOrganization: { id: 'rwaq.admin.enrollmentCodes.filter.organization', defaultMessage: 'Organization' },
  filterAllOrganizations: {
    id: 'rwaq.admin.enrollmentCodes.filter.allOrganizations', defaultMessage: 'All organizations',
  },
  filterScope: { id: 'rwaq.admin.enrollmentCodes.filter.scope', defaultMessage: 'Scope' },
  chipOrganization: { id: 'rwaq.admin.enrollmentCodes.chip.organization', defaultMessage: 'Organization: {name}' },
  chipScope: { id: 'rwaq.admin.enrollmentCodes.chip.scope', defaultMessage: 'Scope: {label}' },
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
  scopeLabel: { id: 'rwaq.admin.enrollmentCodes.form.scopeLabel', defaultMessage: 'The code covers' },
  scopeCourse: { id: 'rwaq.admin.enrollmentCodes.form.scopeCourse', defaultMessage: 'Course' },
  scopeProgram: { id: 'rwaq.admin.enrollmentCodes.form.scopeProgram', defaultMessage: 'Program' },
  scopeOrganization: { id: 'rwaq.admin.enrollmentCodes.form.scopeOrganization', defaultMessage: 'Organization' },
  courseLabel: { id: 'rwaq.admin.enrollmentCodes.form.courseLabel', defaultMessage: 'Course' },
  programLabel: { id: 'rwaq.admin.enrollmentCodes.form.programLabel', defaultMessage: 'Program' },
  organizationLabel: { id: 'rwaq.admin.enrollmentCodes.form.organizationLabel', defaultMessage: 'Organization' },
  organizationHelp: {
    id: 'rwaq.admin.enrollmentCodes.form.organizationHelp',
    defaultMessage: 'The code works for every Enrollment code course and program of this organization, now and later.',
  },
  organizationPlaceholder: {
    id: 'rwaq.admin.enrollmentCodes.form.organizationPlaceholder', defaultMessage: 'Choose an organization…',
  },
  itemRequired: { id: 'rwaq.admin.enrollmentCodes.form.itemRequired', defaultMessage: 'Choose a course or a program.' },
  organizationRequired: {
    id: 'rwaq.admin.enrollmentCodes.form.organizationRequired', defaultMessage: 'Choose an organization.',
  },
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
  activeLabel: { id: 'rwaq.admin.enrollmentCodes.form.activeLabel', defaultMessage: 'Code is active' },
  activeHelp: {
    id: 'rwaq.admin.enrollmentCodes.form.activeHelp',
    defaultMessage: 'Turn it off to mark the code inactive and stop new enrollments with it.',
  },
  editReadOnlyNote: {
    id: 'rwaq.admin.enrollmentCodes.form.editReadOnlyNote',
    defaultMessage: 'The code and what it covers cannot be changed.',
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
  cardQrMissing: {
    id: 'rwaq.admin.enrollmentCodes.card.qrMissing',
    defaultMessage: 'The public site address is not set, so no QR code can be made.',
  },
  cardLinkLabel: { id: 'rwaq.admin.enrollmentCodes.card.linkLabel', defaultMessage: 'The QR code opens: {url}' },
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

  // ── Pricing cards ──────────────────────────────────────────────────────────
  hideFromCatalog: { id: 'rwaq.admin.enrollmentCodes.pricing.hideFromCatalog', defaultMessage: 'Hide from catalog' },
  hideFromCatalogDisabled: {
    id: 'rwaq.admin.enrollmentCodes.pricing.hideFromCatalogDisabled',
    defaultMessage: 'Save the course as an Enrollment code course to enable this setting.',
  },
  hideFromCatalogHelp: {
    id: 'rwaq.admin.enrollmentCodes.pricing.hideFromCatalogHelp',
    defaultMessage: 'Learners can still open it by link, QR code and on the partner page.',
  },
  addCodeBanner: {
    id: 'rwaq.admin.enrollmentCodes.pricing.addCodeBanner',
    defaultMessage: 'Add an enrollment code so learners can join.',
  },
  viewCodesAction: {
    id: 'rwaq.admin.enrollment-codes.view-codes-action',
    defaultMessage: 'View enrollment codes',
  },
  addCodeAction: { id: 'rwaq.admin.enrollmentCodes.pricing.addCodeAction', defaultMessage: 'Add enrollment code' },

  // ── Code usage panel ───────────────────────────────────────────────────────
  usageTitle: { id: 'rwaq.admin.enrollmentCodes.usage.title', defaultMessage: 'Details of {code}' },
  usageItemsTitle: { id: 'rwaq.admin.enrollmentCodes.usage.itemsTitle', defaultMessage: 'Courses and programs' },
  usageItemsLoadFailed: {
    id: 'rwaq.admin.enrollmentCodes.usage.itemsLoadFailed', defaultMessage: 'Could not load the courses and programs.',
  },
  usageNoItems: {
    id: 'rwaq.admin.enrollmentCodes.usage.noItems',
    defaultMessage: 'No Enrollment code course or program is covered yet.',
  },
  usageColItem: { id: 'rwaq.admin.enrollmentCodes.usage.col.item', defaultMessage: 'Course or program' },
  usageColType: { id: 'rwaq.admin.enrollmentCodes.usage.col.type', defaultMessage: 'Type' },
  usageColLearners: { id: 'rwaq.admin.enrollmentCodes.usage.col.learners', defaultMessage: 'Learners joined' },
  usageLearnersTitle: { id: 'rwaq.admin.enrollmentCodes.usage.learnersTitle', defaultMessage: 'Learners' },
  usageExpires: { id: 'rwaq.admin.enrollmentCodes.usage.expires', defaultMessage: 'Expires: {date}' },

});

export default messages;
