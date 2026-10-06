/**
 * Payments analytics hooks.
 * Components import from this file only — never from api.ts directly.
 *
 * One query per list, so a tab only fetches when it is shown, and the KPI row
 * and chart paint without waiting on any table. A tab that is mounted but
 * hidden keeps its state and stops querying (see ActiveTabContext).
 */
import { useContext } from 'react';
import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';
import { appId } from '@src/constants';
import { ActiveTabContext } from './activeTab';
import {
  downloadPaymentsCsv,
  getPaymentOrders,
  getPaymentsSummary,
} from './api';
import type {
  ListParams,
  OrderListParams,
  PaymentsReport,
  SummaryParams,
} from './types';

export const paymentsQueryKeys = {
  all: [appId, 'payments'] as const,
  summary: (params: SummaryParams) => [...paymentsQueryKeys.all, 'summary', params] as const,
  list: (report: PaymentsReport, params: ListParams) => [...paymentsQueryKeys.all, report, params] as const,
};

/**
 * Options every list shares: keep the previous page on screen while the next
 * one loads (callers show their loading state while it is placeholder data),
 * and only query while this tab is the one shown.
 */
const useListOptions = () => ({
  placeholderData: keepPreviousData,
  enabled: useContext(ActiveTabContext),
});

/** KPI totals and the series over time. */
export const usePaymentsSummary = (params: SummaryParams = {}) => useQuery({
  queryKey: paymentsQueryKeys.summary(params),
  queryFn: () => getPaymentsSummary(params),
  ...useListOptions(),
});

export const usePaymentOrders = (params: OrderListParams) => useQuery({
  queryKey: paymentsQueryKeys.list('orders', params),
  queryFn: () => getPaymentOrders(params),
  ...useListOptions(),
});

/** Download a report's CSV with the given filters. */
export const useDownloadPaymentsCsv = () => useMutation({
  mutationFn: ({ report, params, language }: { report: PaymentsReport; params: ListParams; language?: string }) => (
    downloadPaymentsCsv(report, params, language)
  ),
});
