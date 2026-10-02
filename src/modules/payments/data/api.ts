/**
 * Payments analytics API — the ONLY file that changes when the backend evolves.
 * Components call the hooks in hooks.ts, never this file directly.
 *
 *   GET /api/v1/admin/payments/summary/
 *   GET /api/v1/admin/payments/orders/
 *   GET /api/v1/admin/payments/orders/csv/   same filters, every item, as a file
 *
 * Host: Studio (CMS), matching the dashboard analytics.
 * Authentication: Superuser only (IsSuperAdmin — is_staff=True without is_superuser returns 403).
 * Case: snake_case on the wire, camelCase in the app.
 */
import { camelCaseObject, snakeCaseObject } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getStudioApiUrl } from '@src/data/utils';
import type {
  ListParams,
  OrderListParams,
  OrderRow,
  Paginated,
  PaymentsReport,
  PaymentsParams,
  PaymentsSummary,
  SubscriptionListParams,
  SubscriptionRow,
  SubscriptionsSummary,
  SummaryParams,
} from './types';

const getPaymentsBaseUrl = () => getStudioApiUrl('/api/v1/admin/payments');

/** Drop empty values so the URL only carries filters that are actually set. */
const toQuery = (params: object) => snakeCaseObject(
  Object.fromEntries(Object.entries(params).filter(([, value]) => value !== undefined && value !== '')),
);

const getList = async <Row>(report: PaymentsReport, params: ListParams): Promise<Paginated<Row>> => {
  const { data } = await getAuthenticatedHttpClient().get(`${getPaymentsBaseUrl()}/${report}/`, {
    params: toQuery(params),
  });
  return camelCaseObject(data) as Paginated<Row>;
};

/** GET summary/ — KPI totals and the series per day, week or month. */
export const getPaymentsSummary = async (params: SummaryParams = {}): Promise<PaymentsSummary> => {
  const { data } = await getAuthenticatedHttpClient().get(`${getPaymentsBaseUrl()}/summary/`, {
    params: toQuery(params),
  });
  return camelCaseObject(data) as PaymentsSummary;
};

export const getPaymentOrders = (params: OrderListParams) => getList<OrderRow>('orders', params);
export const getPaymentSubscriptions = (params: SubscriptionListParams) => (
  getList<SubscriptionRow>('subscriptions', params)
);

/** GET subscriptions/summary/ — revenue, new, renewals, cancellations and active at the end of the range. */
export const getSubscriptionsSummary = async (params: PaymentsParams = {}): Promise<SubscriptionsSummary> => {
  const { data } = await getAuthenticatedHttpClient().get(`${getPaymentsBaseUrl()}/subscriptions/summary/`, {
    params: toQuery(params),
  });
  return camelCaseObject(data) as SubscriptionsSummary;
};

/** The filename the backend sent, or null when the header isn't readable (CORS). */
const filenameFrom = (disposition: string | undefined): string | null => {
  const match = disposition?.match(/filename="?([^";]+)"?/);
  return match ? match[1] : null;
};

/**
 * GET {report}/csv/ with the list's filters, minus paging.
 *
 * A plain <a href> won't work — the JWT won't be sent. The authenticated
 * client fetches a blob, and the page triggers the download from it.
 * With a *language* the file's titles and headers come in it, not in the browser's language.
 */
export const downloadPaymentsCsv = async (
  report: PaymentsReport,
  params: ListParams,
  language?: string,
): Promise<{ blob: Blob; filename: string }> => {
  const { page, pageSize, ...filters } = params;
  const response = await getAuthenticatedHttpClient().get(`${getPaymentsBaseUrl()}/${report}/csv/`, {
    params: toQuery(filters),
    responseType: 'blob',
    ...(language ? { headers: { 'Accept-Language': language } } : {}),
  });
  const fallback = ['payments', report, filters.startDate, filters.endDate, filters.org]
    .filter(Boolean)
    .join('_');
  return {
    blob: response.data as Blob,
    filename: filenameFrom(response.headers?.['content-disposition']) ?? `${fallback}.csv`,
  };
};
