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
  getPaymentContent,
  getPaymentCoupons,
  getPaymentLearners,
  getPaymentOrders,
  getPaymentPartners,
  getPaymentsSummary,
  getPaymentSubscriptions,
  getSubscriptionsSummary,
} from './api';
import type {
  ContentListParams,
  CouponListParams,
  ListParams,
  OrderListParams,
  PaymentsParams,
  PaymentsReport,
  SubscriptionListParams,
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

export const usePaymentPartners = (params: ListParams) => useQuery({
  queryKey: paymentsQueryKeys.list('partners', params),
  queryFn: () => getPaymentPartners(params),
  ...useListOptions(),
});

export const usePaymentContent = (params: ContentListParams) => useQuery({
  queryKey: paymentsQueryKeys.list('content', params),
  queryFn: () => getPaymentContent(params),
  ...useListOptions(),
});

export const usePaymentLearners = (params: ListParams) => useQuery({
  queryKey: paymentsQueryKeys.list('learners', params),
  queryFn: () => getPaymentLearners(params),
  ...useListOptions(),
});

export const usePaymentSubscriptions = (params: SubscriptionListParams) => useQuery({
  queryKey: paymentsQueryKeys.list('subscriptions', params),
  queryFn: () => getPaymentSubscriptions(params),
  ...useListOptions(),
});

export const useSubscriptionsSummary = (params: PaymentsParams = {}) => useQuery({
  queryKey: [...paymentsQueryKeys.all, 'subscriptions-summary', params],
  queryFn: () => getSubscriptionsSummary(params),
  ...useListOptions(),
});

export const usePaymentCoupons = (params: CouponListParams) => useQuery({
  queryKey: paymentsQueryKeys.list('coupons', params),
  queryFn: () => getPaymentCoupons(params),
  ...useListOptions(),
});

/** Download a report's CSV with the given filters. */
export const useDownloadPaymentsCsv = () => useMutation({
  mutationFn: ({ report, params }: { report: PaymentsReport; params: ListParams }) => (
    downloadPaymentsCsv(report, params)
  ),
});
