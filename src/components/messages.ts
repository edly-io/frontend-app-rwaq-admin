import { defineMessages } from '@edx/frontend-platform/i18n';

export const kpiMessages = defineMessages({
  deltaIncrease: {
    id: 'rwaq.admin.kpi.delta.increase',
    defaultMessage: '{delta}% increase from previous period',
    description: 'Screen-reader label for a positive KPI delta badge',
  },
  deltaDecrease: {
    id: 'rwaq.admin.kpi.delta.decrease',
    defaultMessage: '{delta}% decrease from previous period',
    description: 'Screen-reader label for a negative KPI delta badge',
  },
  deltaNoChange: {
    id: 'rwaq.admin.kpi.delta.noChange',
    defaultMessage: 'No change from previous period',
    description: 'Screen-reader label for a neutral (zero) KPI delta badge',
  },
});
