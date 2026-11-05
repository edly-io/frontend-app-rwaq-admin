import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  title: { id: 'rwaq.admin.payments.title', defaultMessage: 'Orders & Payments' },
  errorTitle: { id: 'rwaq.admin.payments.error', defaultMessage: 'Could not load payments.' },
  forbiddenTitle: {
    id: 'rwaq.admin.payments.forbidden',
    defaultMessage: 'Orders & Payments are visible to Rwaq superadmins only.',
  },

  // ── Partner filter ─────────────────────────────────────────────────────────
  partnerLabel: { id: 'rwaq.admin.payments.partner', defaultMessage: 'Partner' },
  allPartners: { id: 'rwaq.admin.payments.partner.all', defaultMessage: 'All partners' },
  partnerSubscriptions: { id: 'rwaq.admin.payments.partner.subscriptions', defaultMessage: 'Rwaq (subscriptions)' },
  chipPartner: { id: 'rwaq.admin.payments.chip.partner', defaultMessage: 'Partner: {org}' },

  // ── Tabs ───────────────────────────────────────────────────────────────────
  loadingTab: { id: 'rwaq.admin.payments.loadingTab', defaultMessage: 'Loading' },
  reload: { id: 'rwaq.admin.payments.reload', defaultMessage: 'Reload' },
  tabOverview: { id: 'rwaq.admin.payments.tab.overview', defaultMessage: 'Overview' },
  tabOrders: { id: 'rwaq.admin.payments.tab.orders', defaultMessage: 'Payment history' },
  tabSubscriptions: { id: 'rwaq.admin.payments.tab.subscriptions', defaultMessage: 'Subscriptions' },

  // ── Overview: KPI tiles ────────────────────────────────────────────────────
  kpiOrders: { id: 'rwaq.admin.payments.kpi.orders', defaultMessage: 'Orders' },
  kpiAdminEnrollments: { id: 'rwaq.admin.payments.kpi.adminEnrollments', defaultMessage: 'Admin enrollments' },
  kpiGross: { id: 'rwaq.admin.payments.kpi.gross', defaultMessage: 'Gross sales' },
  kpiDiscounts: { id: 'rwaq.admin.payments.kpi.discounts', defaultMessage: 'Discounts' },
  kpiNetSales: { id: 'rwaq.admin.payments.kpi.netSales', defaultMessage: 'Net sales' },
  kpiVat: { id: 'rwaq.admin.payments.kpi.vat', defaultMessage: 'VAT collected' },
  kpiTotalCollected: { id: 'rwaq.admin.payments.kpi.totalCollected', defaultMessage: 'Total collected' },
  infoOrders: {
    id: 'rwaq.admin.payments.info.orders',
    defaultMessage: 'Every completed order, subscription payments, free orders and admin enrollments included. For a single partner, only orders with its courses and programs count. Rwaq (subscriptions) counts only subscription payments.',
  },
  infoAdminEnrollments: {
    id: 'rwaq.admin.payments.info.adminEnrollments',
    defaultMessage: 'How many of the orders are free enrollments by an admin. They carry no money, so they add to the Orders count only.',
  },
  infoGross: {
    id: 'rwaq.admin.payments.info.gross',
    defaultMessage: 'The list price of every item, subscription payments included, before coupons and VAT.',
  },
  infoDiscounts: {
    id: 'rwaq.admin.payments.info.discounts',
    defaultMessage: 'What product and cart coupons took off the items, subscription payments included. A cart coupon is spread over the items in its cart.',
  },
  infoNetSales: {
    id: 'rwaq.admin.payments.info.netSales',
    defaultMessage: 'Gross sales minus discounts, before VAT. For a single partner, only its courses and programs count. Items an admin later revoked still count.',
  },
  infoVat: {
    id: 'rwaq.admin.payments.info.vat',
    defaultMessage: 'The VAT WooCommerce charged on the orders, at the rate of each order. For a single partner, only the VAT on its items.',
  },
  infoTotalCollected: {
    id: 'rwaq.admin.payments.info.totalCollected',
    defaultMessage: 'Net sales plus VAT: what learners paid on completed orders. This is money received from learners, not money paid out. For a single partner, only what was paid for its items.',
  },
  kpiContentNetSales: { id: 'rwaq.admin.payments.kpi.contentNetSales', defaultMessage: 'Courses and Programs net sales' },
  kpiSubscriptionNetSales: { id: 'rwaq.admin.payments.kpi.subscriptionNetSales', defaultMessage: 'Subscription net sales' },
  infoContentNetSales: {
    id: 'rwaq.admin.payments.info.contentNetSales',
    defaultMessage: 'Net sales of courses and programs: after coupons, before VAT. {orders, plural, one {# order} other {# orders}}.',
  },
  infoSubscriptionNetSales: {
    id: 'rwaq.admin.payments.info.subscriptionNetSales',
    defaultMessage: 'Net sales of subscriptions: after coupons, before VAT. It is 0 when a single partner is selected. {orders, plural, one {# order} other {# orders}}.',
  },
  seriesContent: { id: 'rwaq.admin.payments.series.content', defaultMessage: 'Courses and Programs' },
  seriesSubscriptions: { id: 'rwaq.admin.payments.series.subscriptions', defaultMessage: 'Subscriptions' },

  // ── Overview: charts ───────────────────────────────────────────────────────
  trendsTitle: { id: 'rwaq.admin.payments.trends.title', defaultMessage: 'Trends' },
  viewBy: { id: 'rwaq.admin.payments.trends.viewBy', defaultMessage: 'View by' },
  granDay: { id: 'rwaq.admin.payments.trends.day', defaultMessage: 'Daily' },
  granWeek: { id: 'rwaq.admin.payments.trends.week', defaultMessage: 'Weekly' },
  granMonth: { id: 'rwaq.admin.payments.trends.month', defaultMessage: 'Monthly' },
  weekOf: { id: 'rwaq.admin.payments.trends.weekOf', defaultMessage: 'Week of {date}' },
  chartCollectedTitle: { id: 'rwaq.admin.payments.chart.collected', defaultMessage: 'Net sales over time' },
  chartOrdersTitle: { id: 'rwaq.admin.payments.chart.orders', defaultMessage: 'Orders over time' },
  chartAllTime: { id: 'rwaq.admin.payments.chart.allTime', defaultMessage: 'All time' },
  chartRange: { id: 'rwaq.admin.payments.chart.range', defaultMessage: 'Selected range' },
  chartEmpty: { id: 'rwaq.admin.payments.chart.empty', defaultMessage: 'No payments in this period.' },
  chartUnavailable: { id: 'rwaq.admin.payments.chart.unavailable', defaultMessage: 'The chart could not be loaded.' },
  infoChartCollected: {
    id: 'rwaq.admin.payments.info.chartCollected',
    defaultMessage: 'Net sales per day, week or month of the order date, in SAR, before VAT. Courses and Programs and subscriptions are shown apart, and their sum is the Net sales tile.',
  },
  infoChartOrders: {
    id: 'rwaq.admin.payments.info.chartOrders',
    defaultMessage: 'Completed orders per day, week or month of the order date. Courses and Programs and subscriptions are shown apart. An order with both kinds counts in each.',
  },

  // ── Tab headings: what the tab counts and how it is calculated ─────────────
  infoOrdersTab: {
    id: 'rwaq.admin.payments.info.ordersTab',
    defaultMessage: 'Every order, one row each. Open a row to see its courses, programs and coupons. The CSV has one row per item.',
  },
  howOrders: {
    id: 'rwaq.admin.payments.how.orders',
    defaultMessage: 'Net sales are the price after coupons, before VAT. Total collected adds the VAT. Purchases are WordPress payments. Admin grants are free enrollments with no amounts.',
  },

  // ── Shared list controls ───────────────────────────────────────────────────
  sortLabel: { id: 'rwaq.admin.payments.sort', defaultMessage: 'Sort by' },
  chipSearch: { id: 'rwaq.admin.payments.chip.search', defaultMessage: 'Search: {term}' },
  chipSort: { id: 'rwaq.admin.payments.chip.sort', defaultMessage: 'Sort: {label}' },
  filterAll: { id: 'rwaq.admin.payments.filter.all', defaultMessage: 'All' },
  downloadCsv: { id: 'rwaq.admin.payments.csv', defaultMessage: 'Download CSV' },
  downloadingCsv: { id: 'rwaq.admin.payments.csv.downloading', defaultMessage: 'Downloading…' },
  downloadCsvFailed: { id: 'rwaq.admin.payments.csv.failed', defaultMessage: 'Could not download the CSV.' },

  sortDateDesc: { id: 'rwaq.admin.payments.sort.dateDesc', defaultMessage: 'Newest first' },
  sortDateAsc: { id: 'rwaq.admin.payments.sort.dateAsc', defaultMessage: 'Oldest first' },
  sortCollectedDesc: { id: 'rwaq.admin.payments.sort.collectedDesc', defaultMessage: 'Total collected, highest first' },
  sortNetDesc: { id: 'rwaq.admin.payments.sort.netDesc', defaultMessage: 'Net sales, highest first' },
  sortGrossDesc: { id: 'rwaq.admin.payments.sort.grossDesc', defaultMessage: 'Order value, highest first' },

  // ── Money columns: one set of labels, with hover text per tab ────────────
  colOrderValue: { id: 'rwaq.admin.payments.col.orderValue', defaultMessage: 'Order value (SAR)' },
  colNetSales: { id: 'rwaq.admin.payments.col.netSales', defaultMessage: 'Net sales (SAR)' },
  colVat: { id: 'rwaq.admin.payments.col.vat', defaultMessage: 'VAT (SAR)' },
  colCollected: { id: 'rwaq.admin.payments.col.collected', defaultMessage: 'Total collected (SAR)' },

  // By partner (a row is one partner)

  // By content (a row is one course or program)

  // By learner (a row is one buyer)

  // ── By partner ─────────────────────────────────────────────────────────────

  // ── By content ─────────────────────────────────────────────────────────────
  colContent: { id: 'rwaq.admin.payments.col.content', defaultMessage: 'Course or program' },
  colType: { id: 'rwaq.admin.payments.col.type', defaultMessage: 'Type' },
  colOrg: { id: 'rwaq.admin.payments.col.org', defaultMessage: 'Organization' },
  typeCourse: { id: 'rwaq.admin.payments.type.course', defaultMessage: 'Course' },
  typeProgram: { id: 'rwaq.admin.payments.type.program', defaultMessage: 'Program' },
  typeSubscription: { id: 'rwaq.admin.payments.type.subscription', defaultMessage: 'Subscription' },
  itemSubscription: { id: 'rwaq.admin.payments.orders.item-subscription', defaultMessage: 'Subscription: {plan}' },
  itemPeriod: { id: 'rwaq.admin.payments.orders.item-period', defaultMessage: 'Period: {start} to {end}' },
  planMonthly: { id: 'rwaq.admin.payments.plan.monthly', defaultMessage: 'Monthly' },
  planYearly: { id: 'rwaq.admin.payments.plan.yearly', defaultMessage: 'Yearly' },

  // ── By learner ─────────────────────────────────────────────────────────────

  // ── By coupon ──────────────────────────────────────────────────────────────

  // ── Payment history ────────────────────────────────────────────────────────
  ordersSearch: {
    id: 'rwaq.admin.payments.orders.search',
    defaultMessage: 'Search by username, email, order ID or coupon code',
  },
  colOrder: { id: 'rwaq.admin.payments.col.order', defaultMessage: 'Order' },
  colDate: { id: 'rwaq.admin.payments.col.date', defaultMessage: 'Date and time (UTC)' },
  colBuyer: { id: 'rwaq.admin.payments.col.buyer', defaultMessage: 'Buyer' },
  colCourses: { id: 'rwaq.admin.payments.col.courses', defaultMessage: 'Items' },
  colPrice: { id: 'rwaq.admin.payments.col.price', defaultMessage: 'Price (SAR)' },
  colDiscount: { id: 'rwaq.admin.payments.col.discount', defaultMessage: 'Discount (SAR)' },
  colNet: { id: 'rwaq.admin.payments.col.net', defaultMessage: 'Net (SAR)' },
  colPaid: { id: 'rwaq.admin.payments.col.paid', defaultMessage: 'Total (SAR)' },
  colSource: { id: 'rwaq.admin.payments.col.source', defaultMessage: 'Source' },
  infoColOrder: {
    id: 'rwaq.admin.payments.info.col.order',
    defaultMessage: 'The WordPress order ID. Admin grants have no WordPress order and show as Admin enrollment.',
  },
  infoColDate: {
    id: 'rwaq.admin.payments.info.col.date',
    defaultMessage: 'When the order was paid, in UTC. The date range filters use UTC days.',
  },
  infoColBuyer: { id: 'rwaq.admin.payments.info.col.buyer', defaultMessage: 'The learner who placed the order. Click to open their profile.' },
  infoColCourses: {
    id: 'rwaq.admin.payments.info.col.courses',
    defaultMessage: 'Items are the courses and programs in the order. An order with 3 courses counts 3 items.',
  },
  infoColOrderPrice: {
    id: 'rwaq.admin.payments.info.col.orderPrice',
    defaultMessage: 'List price of everything in the order, before coupons.',
  },
  infoColOrderPricePartner: {
    id: 'rwaq.admin.payments.info.col.orderPricePartner',
    defaultMessage: 'List price of this partner\'s items in the order, before coupons. Other partners\' items are left out.',
  },
  infoColOrderDiscount: {
    id: 'rwaq.admin.payments.info.col.orderDiscount',
    defaultMessage: 'Coupon money taken off this order.',
  },
  infoColOrderDiscountPartner: {
    id: 'rwaq.admin.payments.info.col.orderDiscountPartner',
    defaultMessage: 'Coupon money taken off this partner\'s items. A cart coupon counts only the part that fell on them.',
  },
  infoColOrderNet: {
    id: 'rwaq.admin.payments.info.col.orderNet',
    defaultMessage: 'Order value minus discounts, before VAT.',
  },
  infoColOrderNetPartner: {
    id: 'rwaq.admin.payments.info.col.orderNetPartner',
    defaultMessage: 'This partner\'s items minus their discounts, before VAT. Other partners\' items in the same order are left out.',
  },
  infoColOrderVat: {
    id: 'rwaq.admin.payments.info.col.orderVat',
    defaultMessage: 'The VAT charged on the order.',
  },
  infoColOrderVatPartner: {
    id: 'rwaq.admin.payments.info.col.orderVatPartner',
    defaultMessage: 'The VAT charged on this partner\'s items. Other partners\' items in the same order are left out.',
  },
  infoColOrderPaid: {
    id: 'rwaq.admin.payments.info.col.orderPaid',
    defaultMessage: 'What the learner paid for the order: net sales plus VAT.',
  },
  infoColOrderPaidPartner: {
    id: 'rwaq.admin.payments.info.col.orderPaidPartner',
    defaultMessage: 'What the learner paid for this partner\'s items: net sales plus VAT. Other partners\' items in the same order are left out.',
  },
  infoColSource: {
    id: 'rwaq.admin.payments.info.col.source',
    defaultMessage: 'Purchase is a WordPress payment. Admin grant is a free enrollment by an admin, with no amounts.',
  },
  adminOrder: { id: 'rwaq.admin.payments.orders.admin', defaultMessage: 'Admin enrollment #{id}' },
  sourceLabel: { id: 'rwaq.admin.payments.source', defaultMessage: 'Source' },
  sourceWordpress: { id: 'rwaq.admin.payments.source.wordpress', defaultMessage: 'Purchase' },
  sourceAdmin: { id: 'rwaq.admin.payments.source.admin', defaultMessage: 'Admin grant' },
  typeFilterLabel: { id: 'rwaq.admin.payments.type-filter', defaultMessage: 'Type' },
  typeFilterContent: { id: 'rwaq.admin.payments.type-filter.content', defaultMessage: 'Courses and programs' },
  typeFilterSubscription: { id: 'rwaq.admin.payments.type-filter.subscription', defaultMessage: 'Subscriptions' },
  chipType: { id: 'rwaq.admin.payments.chip.type', defaultMessage: 'Type: {label}' },
  chipSubscription: { id: 'rwaq.admin.payments.chip.subscription', defaultMessage: 'Subscription: {label}' },
  chipSource: { id: 'rwaq.admin.payments.chip.source', defaultMessage: 'Source: {label}' },
  couponFilterLabel: { id: 'rwaq.admin.payments.coupon', defaultMessage: 'Coupon' },
  couponAny: { id: 'rwaq.admin.payments.coupon.any', defaultMessage: 'Any' },
  couponWith: { id: 'rwaq.admin.payments.coupon.with', defaultMessage: 'With a coupon' },
  couponWithout: { id: 'rwaq.admin.payments.coupon.without', defaultMessage: 'No coupon' },
  chipCoupon: { id: 'rwaq.admin.payments.chip.coupon', defaultMessage: 'Coupon: {label}' },
  itemsTitle: { id: 'rwaq.admin.payments.orders.items', defaultMessage: 'Items' },
  couponsTitle: { id: 'rwaq.admin.payments.orders.coupons', defaultMessage: 'Coupons' },
  noCoupons: { id: 'rwaq.admin.payments.orders.noCoupons', defaultMessage: 'No coupons.' },
  couponLine: {
    id: 'rwaq.admin.payments.orders.couponLine',
    defaultMessage: '{code}: {value} off {target}, {amount}',
  },
  couponCart: { id: 'rwaq.admin.payments.orders.couponCart', defaultMessage: 'the cart' },
  revoked: { id: 'rwaq.admin.payments.orders.revoked', defaultMessage: 'Revoked' },
  infoRevoked: {
    id: 'rwaq.admin.payments.info.revoked',
    defaultMessage: 'An admin unenrolled the learner on {date}. Reason: {reason}. The payment still counts in the totals.',
  },
  adminReason: { id: 'rwaq.admin.payments.orders.reason', defaultMessage: '<b>Reason:</b> {reason}' },
  adminEnrolledBy: { id: 'rwaq.admin.payments.orders.enrolledBy', defaultMessage: '<b>Enrolled by:</b> {admin}' },
});

export default messages;
