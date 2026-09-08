import { defineMessages } from '@edx/frontend-platform/i18n';

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
