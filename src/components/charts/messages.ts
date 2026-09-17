import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  fallbackTableCaption: {
    id: 'rwaq.admin.metricChart.fallbackTable.caption',
    defaultMessage: 'Chart data',
    description: 'Caption for the screen-reader-only data table that mirrors a chart',
  },
  fallbackTableLabelColumn: {
    id: 'rwaq.admin.metricChart.fallbackTable.labelColumn',
    defaultMessage: 'Label',
    description: 'Header for the row-label column in the screen-reader-only chart data table',
  },
});

export default messages;
