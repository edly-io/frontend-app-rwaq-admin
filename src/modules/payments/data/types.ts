// ── Payments API types ───────────────────────────────────────────────────────
//
// camelCase above the API boundary; api.ts normalizes the snake_case wire
// format. Money comes as a decimal string ("1234.50") in SAR and stays a string
// until it is formatted, so no float rounding creeps in.

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
}

/** GET /api/v1/admin/payments/summary/ */
export interface PaymentsSummary {
  gross: string;
  discounts: string;
  netPaid: string;
  orders: number;
  items: number;
  granularity: Granularity;
  series: SeriesPoint[];
}

export type ContentType = 'course' | 'program';

export type CouponScope = 'product' | 'cart';

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
  /** The part that fell on the chosen partner's items. null unless the list is narrowed to a partner. */
  partnerDiscountAmount: string | null;
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
  /**
   * Narrowed to a partner, `items` and `coupons` hold only that partner's part and these are the
   * totals of it. The three above stay whole-order. null when the list is not narrowed to a partner.
   */
  partnerActualPrice: string | null;
  partnerDiscountAmount: string | null;
  partnerPricePaid: string | null;
  reason: string;
  /** The admin who enrolled the learner. null for WordPress orders. */
  enrolledBy: { id: number; username: string; email: string } | null;
  items: OrderItem[];
  coupons: OrderCoupon[];
}

export interface OrderListParams extends ListParams {
  source?: OrderSource;
  status?: OrderStatus;
  coupon?: 'with' | 'without';
}

/** The lists with a csv/ twin. */
export type PaymentsReport = 'orders';
