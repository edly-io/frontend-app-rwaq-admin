/**
 * Payments analytics hooks.
 * Components import from this file only — never from api.ts directly.
 *
 * One query per list, so a tab only fetches when it is shown, and the KPI row
 * and chart paint without waiting on any table.
 */
import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';
import { appId } from '@src/constants';
import {
  downloadPaymentsCsv,
  getPaymentContent,
  getPaymentCoupons,
  getPaymentLearners,
  getPaymentOrders,
  getPaymentPartners,
  getPaymentsSummary,
} from './api';
import type {
  ContentListParams,
  CouponListParams,
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

const LIST_OPTIONS = { placeholderData: keepPreviousData };

/** KPI totals and the series over time. */
export const usePaymentsSummary = (params: SummaryParams = {}) => useQuery({
  queryKey: paymentsQueryKeys.summary(params),
  queryFn: () => getPaymentsSummary(params),
  ...LIST_OPTIONS,
});

export const usePaymentOrders = (params: OrderListParams) => useQuery({
  queryKey: paymentsQueryKeys.list('orders', params),
  queryFn: () => getPaymentOrders(params),
  ...LIST_OPTIONS,
});

export const usePaymentPartners = (params: ListParams) => useQuery({
  queryKey: paymentsQueryKeys.list('partners', params),
  queryFn: () => getPaymentPartners(params),
  ...LIST_OPTIONS,
});

export const usePaymentContent = (params: ContentListParams) => useQuery({
  queryKey: paymentsQueryKeys.list('content', params),
  queryFn: () => getPaymentContent(params),
  ...LIST_OPTIONS,
});

export const usePaymentLearners = (params: ListParams) => useQuery({
  queryKey: paymentsQueryKeys.list('learners', params),
  queryFn: () => getPaymentLearners(params),
  ...LIST_OPTIONS,
});

export const usePaymentCoupons = (params: CouponListParams) => useQuery({
  queryKey: paymentsQueryKeys.list('coupons', params),
  queryFn: () => getPaymentCoupons(params),
  ...LIST_OPTIONS,
});

/** Download a report's CSV with the given filters. */
export const useDownloadPaymentsCsv = () => useMutation({
  mutationFn: ({ report, params }: { report: PaymentsReport; params: ListParams }) => (
    downloadPaymentsCsv(report, params)
  ),
});
