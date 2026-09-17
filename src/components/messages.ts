import { defineMessages } from '@edx/frontend-platform/i18n';

// ── KpiCard ───────────────────────────────────────────────────────────────────

export const kpiMessages = defineMessages({
  deltaIncrease: {
    id: 'rwaq.admin.kpiCard.deltaIncrease',
    defaultMessage: 'Increased by {delta}%',
    description: 'Screen reader text for an upward delta on a KPI card',
  },
  deltaDecrease: {
    id: 'rwaq.admin.kpiCard.deltaDecrease',
    defaultMessage: 'Decreased by {delta}%',
    description: 'Screen reader text for a downward delta on a KPI card',
  },
  deltaNoChange: {
    id: 'rwaq.admin.kpiCard.deltaNoChange',
    defaultMessage: 'No change',
    description: 'Screen reader text when a KPI has not changed',
  },
});

// ── ErrorState ────────────────────────────────────────────────────────────────

export const errorStateMessages = defineMessages({
  defaultTitle: {
    id: 'rwaq.admin.errorState.defaultTitle',
    defaultMessage: 'Something went wrong',
  },
  defaultBody: {
    id: 'rwaq.admin.errorState.defaultBody',
    defaultMessage: 'An error occurred while loading the data. Please try again.',
  },
  noAccess: {
    id: 'rwaq.admin.errorState.noAccess',
    defaultMessage: 'You do not have permission to view this page.',
  },
  notFound: {
    id: 'rwaq.admin.errorState.notFound',
    defaultMessage: 'The requested resource was not found.',
  },
  retry: {
    id: 'rwaq.admin.errorState.retry',
    defaultMessage: 'Try again',
  },
});

// ── AdminDataTable ────────────────────────────────────────────────────────────

export const adminDataTableMessages = defineMessages({
  loadingLabel: {
    id: 'rwaq.admin.dataTable.loading',
    defaultMessage: 'Loading data…',
  },
  noResults: {
    id: 'rwaq.admin.dataTable.noResults',
    defaultMessage: 'No results found.',
  },
  rowStatus: {
    id: 'rwaq.admin.dataTable.rowStatus',
    defaultMessage: 'Showing {first}–{last} of {total}',
  },
  paginationLabel: { id: 'rwaq.admin.dataTable.paginationLabel', defaultMessage: 'Table pages' },
  previousPage: { id: 'rwaq.admin.dataTable.previousPage', defaultMessage: 'Previous' },
  nextPage: { id: 'rwaq.admin.dataTable.nextPage', defaultMessage: 'Next' },
  page: { id: 'rwaq.admin.dataTable.page', defaultMessage: 'Page' },
  currentPage: { id: 'rwaq.admin.dataTable.currentPage', defaultMessage: 'Current page' },
  pageOfCount: { id: 'rwaq.admin.dataTable.pageOfCount', defaultMessage: 'of' },
});

// ── ComingSoon ────────────────────────────────────────────────────────────────

export const comingSoonMessages = defineMessages({
  title: {
    id: 'rwaq.admin.comingSoon.title',
    defaultMessage: 'Coming Soon',
  },
  body: {
    id: 'rwaq.admin.comingSoon.body',
    defaultMessage: 'This section is under development. It will be available in an upcoming release.',
  },
});

// ── EmptyState ────────────────────────────────────────────────────────────────

export const emptyStateMessages = defineMessages({
  defaultTitle: {
    id: 'rwaq.admin.emptyState.defaultTitle',
    defaultMessage: 'No data',
  },
  defaultBody: {
    id: 'rwaq.admin.emptyState.defaultBody',
    defaultMessage: 'There are no items to display.',
  },
});

// ── SearchFilterBar ───────────────────────────────────────────────────────────

export const searchFilterBarMessages = defineMessages({
  searchInputLabel: { id: 'rwaq.admin.searchFilter.searchInputLabel', defaultMessage: 'Search term' },
  searchSubmitLabel: { id: 'rwaq.admin.searchFilter.searchSubmitLabel', defaultMessage: 'Search' },
  searchClearLabel: { id: 'rwaq.admin.searchFilter.searchClearLabel', defaultMessage: 'Clear search term' },
  scopeLabel: { id: 'rwaq.admin.searchFilter.scopeLabel', defaultMessage: 'Search by' },
  filtersButton: { id: 'rwaq.admin.searchFilter.filters', defaultMessage: 'Filters' },
  appliedTitle: { id: 'rwaq.admin.searchFilter.appliedTitle', defaultMessage: 'Applied filters' },
  clearAll: { id: 'rwaq.admin.searchFilter.clearAll', defaultMessage: 'Clear all' },
  removeChip: { id: 'rwaq.admin.searchFilter.removeChip', defaultMessage: 'Remove {label}' },
});
