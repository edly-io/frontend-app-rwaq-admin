// ── Payments API types ───────────────────────────────────────────────────────
//
// camelCase above the API boundary; api.ts normalizes the snake_case wire
// format. Money comes as a decimal string ("1234.50") in SAR and stays a string
// until it is formatted, so no float rounding creeps in.
//
// An organization without a revenue share keeps nothing for the partner: its
// partner amount is 0.00 and all of it is Rwaq revenue. The share itself is
// null, and renders "Not set".

import type { PaginationMeta } from '@src/modules/courses/data/types';

export type { PaginationMeta };

/** Shared filters: the date range is on the order date, org is a short_name. */
export interface PaymentsParams {
  startDate?: string;
  endDate?: string;
  org?: string;
}

export interface ListParams extends PaymentsParams {
  search?: string;
  ordering?: string;
  page?: number;
  pageSize?: number;
}

export interface Paginated<Row> {
  pagination: PaginationMeta;
  results: Row[];
}

/** Money totals every revenue row carries. */
export interface RevenueTotals {
  items: number;
  gross: string;
  discounts: string;
  netPaid: string;
  /** 0.00 when the organization has no share: all of its revenue is Rwaq's. */
  partnerAmount: string;
  rwaqAmount: string;
}

export type Granularity = 'day' | 'week' | 'month';

export interface SummaryParams extends PaymentsParams {
  granularity?: Granularity;
}

/** One day, Monday-started week or month of the series. Periods without orders are zero. */
export interface SeriesPoint {
  /** First day of the period, "2026-09-01". */
  period: string;
  orders: number;
  gross: string;
  discounts: string;
  netPaid: string;
  partnerAmount: string;
  rwaqAmount: string;
}

/** GET /api/v1/admin/payments/summary/ */
export interface PaymentsSummary {
  gross: string;
  discounts: string;
  netPaid: string;
  partnerAmount: string;
  rwaqAmount: string;
  orders: number;
  items: number;
  granularity: Granularity;
  series: SeriesPoint[];
}

export interface PartnerRow extends RevenueTotals {
  org: string;
  orgName: string;
  share: string | null;
  orders: number;
}

export type ContentType = 'course' | 'program';

export interface ContentRow extends RevenueTotals {
  type: ContentType;
  key: string;
  /** Set for programs, whose detail page is keyed by UUID. */
  programUuid: string | null;
  title: string;
  org: string;
  orgName: string;
  share: string | null;
}

export interface LearnerRow extends RevenueTotals {
  userId: number;
  username: string;
  email: string;
  orders: number;
}

export type CouponScope = 'product' | 'cart';

export interface CouponRow {
  code: string;
  scope: CouponScope | 'mixed';
  discountType: 'amount' | 'percentage' | 'mixed';
  orders: number;
  discountGiven: string;
}

export type OrderSource = 'wordpress' | 'admin';
export type OrderStatus = 'pending' | 'completed' | 'payment_failed' | 'failed';

export interface OrderItem {
  type: ContentType;
  key: string;
  programUuid: string | null;
  title: string;
  org: string;
  actualPrice: string;
  discountAmount: string;
  pricePaid: string;
  revokedAt: string | null;
  revokeReason: string;
}

export interface OrderCoupon {
  code: string;
  scope: CouponScope;
  discountType: 'amount' | 'percentage';
  value: string;
  courseId: string | null;
  programKey: string | null;
  discountAmount: string;
}

export interface OrderRow {
  id: number;
  wordpressOrderId: string | null;
  source: OrderSource;
  status: OrderStatus;
  orderDate: string;
  paidVia: string;
  currency: string;
  userId: number;
  username: string;
  email: string;
  orderBy: string;
  actualPrice: string;
  discountTotal: string;
  pricePaid: string;
  reason: string;
  items: OrderItem[];
  coupons: OrderCoupon[];
}

export interface OrderListParams extends ListParams {
  source?: OrderSource;
  status?: OrderStatus;
  /** Only this buyer's orders (a user id). */
  user?: number;
  /** Only orders that used exactly this coupon code. */
  couponCode?: string;
  coupon?: 'with' | 'without';
  /** A course key or a program key: only orders that include it. */
  content?: string;
}

export interface ContentListParams extends ListParams {
  type?: ContentType;
}

export interface CouponListParams extends ListParams {
  scope?: CouponScope;
}

/** The lists with a csv/ twin. */
export type PaymentsReport = 'orders' | 'partners' | 'content' | 'learners' | 'coupons';
