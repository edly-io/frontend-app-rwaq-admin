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
  chipPartner: { id: 'rwaq.admin.payments.chip.partner', defaultMessage: 'Partner: {org}' },

  // ── Tabs ───────────────────────────────────────────────────────────────────
  loadingTab: { id: 'rwaq.admin.payments.loadingTab', defaultMessage: 'Loading' },
  reload: { id: 'rwaq.admin.payments.reload', defaultMessage: 'Reload' },
  tabOverview: { id: 'rwaq.admin.payments.tab.overview', defaultMessage: 'Overview' },
  tabOrders: { id: 'rwaq.admin.payments.tab.orders', defaultMessage: 'Payment history' },

  // ── Overview: KPI tiles ────────────────────────────────────────────────────
  kpiOrders: { id: 'rwaq.admin.payments.kpi.orders', defaultMessage: 'Orders' },
  kpiOrderValue: { id: 'rwaq.admin.payments.kpi.orderValue', defaultMessage: 'Order value' },
  kpiDiscounts: { id: 'rwaq.admin.payments.kpi.discounts', defaultMessage: 'Discounts' },
  kpiCollected: { id: 'rwaq.admin.payments.kpi.collected', defaultMessage: 'Amount collected' },
  infoOrders: {
    id: 'rwaq.admin.payments.info.orders',
    defaultMessage: 'Completed WordPress orders with at least one paid item.',
  },
  infoOrderValue: {
    id: 'rwaq.admin.payments.info.orderValue',
    defaultMessage: 'The list price of every paid item, before coupons.',
  },
  infoDiscounts: {
    id: 'rwaq.admin.payments.info.discounts',
    defaultMessage: 'What product and cart coupons took off the paid items. A cart coupon is spread over the items in its cart.',
  },
  infoCollected: {
    id: 'rwaq.admin.payments.info.collected',
    defaultMessage: 'What learners paid after coupons, on completed WordPress orders. This is money received from learners, not money paid out. Items an admin later revoked still count. Admin enrollments are free and never count.',
  },

  // ── Overview: charts ───────────────────────────────────────────────────────
  trendsTitle: { id: 'rwaq.admin.payments.trends.title', defaultMessage: 'Trends' },
  viewBy: { id: 'rwaq.admin.payments.trends.viewBy', defaultMessage: 'View by' },
  granDay: { id: 'rwaq.admin.payments.trends.day', defaultMessage: 'Daily' },
  granWeek: { id: 'rwaq.admin.payments.trends.week', defaultMessage: 'Weekly' },
  granMonth: { id: 'rwaq.admin.payments.trends.month', defaultMessage: 'Monthly' },
  weekOf: { id: 'rwaq.admin.payments.trends.weekOf', defaultMessage: 'Week of {date}' },
  chartCollectedTitle: { id: 'rwaq.admin.payments.chart.collected', defaultMessage: 'Amount collected over time' },
  chartOrdersTitle: { id: 'rwaq.admin.payments.chart.orders', defaultMessage: 'Orders over time' },
  seriesCollected: { id: 'rwaq.admin.payments.series.collected', defaultMessage: 'Amount collected (SAR)' },
  seriesOrders: { id: 'rwaq.admin.payments.series.orders', defaultMessage: 'Orders' },
  chartAllTime: { id: 'rwaq.admin.payments.chart.allTime', defaultMessage: 'All time' },
  chartRange: { id: 'rwaq.admin.payments.chart.range', defaultMessage: 'Selected range' },
  chartEmpty: { id: 'rwaq.admin.payments.chart.empty', defaultMessage: 'No payments in this period.' },
  chartUnavailable: { id: 'rwaq.admin.payments.chart.unavailable', defaultMessage: 'The chart could not be loaded.' },
  infoChartCollected: {
    id: 'rwaq.admin.payments.info.chartCollected',
    defaultMessage: 'Amount collected per day, week or month of the order date, in SAR.',
  },
  infoChartOrders: {
    id: 'rwaq.admin.payments.info.chartOrders',
    defaultMessage: 'Completed paid orders per day, week or month of the order date.',
  },

  // ── Tab headings: what the tab counts and how it is calculated ─────────────
  infoOrdersTab: {
    id: 'rwaq.admin.payments.info.ordersTab',
    defaultMessage: 'Every order, one row each. Open a row to see its courses, programs and coupons. The CSV has one row per item.',
  },
  howOrders: {
    id: 'rwaq.admin.payments.how.orders',
    defaultMessage: 'Amount collected is what the learner paid after coupons. Purchases are WordPress payments. Admin grants are free enrollments and are not revenue.',
  },

  // ── Shared list controls ───────────────────────────────────────────────────
  sortLabel: { id: 'rwaq.admin.payments.sort', defaultMessage: 'Sort by' },
  chipSearch: { id: 'rwaq.admin.payments.chip.search', defaultMessage: 'Search: {term}' },
  chipSort: { id: 'rwaq.admin.payments.chip.sort', defaultMessage: 'Sort: {label}' },
  filterAll: { id: 'rwaq.admin.payments.filter.all', defaultMessage: 'All' },
  downloadCsv: { id: 'rwaq.admin.payments.csv', defaultMessage: 'Download CSV' },
  downloadCsvFailed: { id: 'rwaq.admin.payments.csv.failed', defaultMessage: 'Could not download the CSV.' },

  sortDateDesc: { id: 'rwaq.admin.payments.sort.dateDesc', defaultMessage: 'Newest first' },
  sortDateAsc: { id: 'rwaq.admin.payments.sort.dateAsc', defaultMessage: 'Oldest first' },
  sortPaidDesc: { id: 'rwaq.admin.payments.sort.paidDesc', defaultMessage: 'Amount collected, highest first' },

  // ── Revenue columns: one set of labels, with hover text per tab ────────────
  colOrderValue: { id: 'rwaq.admin.payments.col.orderValue', defaultMessage: 'Order value (SAR)' },
  colOrderValuePartner: {
    id: 'rwaq.admin.payments.col.orderValuePartner',
    defaultMessage: 'Order value (SAR, this partner)',
  },
  colCollected: { id: 'rwaq.admin.payments.col.collected', defaultMessage: 'Amount collected (SAR)' },
  colCollectedPartner: {
    id: 'rwaq.admin.payments.col.collectedPartner',
    defaultMessage: 'Amount collected (SAR, this partner)',
  },

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
  colDiscountPartner: {
    id: 'rwaq.admin.payments.col.discountPartner',
    defaultMessage: 'Discount (SAR, this partner)',
  },
  colPaid: { id: 'rwaq.admin.payments.col.paid', defaultMessage: 'Paid (SAR)' },
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
  infoColOrderPaid: {
    id: 'rwaq.admin.payments.info.col.orderPaid',
    defaultMessage: 'What the learner paid for the order after coupons.',
  },
  infoColOrderPaidPartner: {
    id: 'rwaq.admin.payments.info.col.orderPaidPartner',
    defaultMessage: 'What the learner paid for this partner\'s items after coupons. Other partners\' items in the same order are left out.',
  },
  infoColSource: {
    id: 'rwaq.admin.payments.info.col.source',
    defaultMessage: 'Purchase is a WordPress payment. Admin grant is a free enrollment by an admin and never counts as revenue.',
  },
  adminOrder: { id: 'rwaq.admin.payments.orders.admin', defaultMessage: 'Admin enrollment #{id}' },
  sourceLabel: { id: 'rwaq.admin.payments.source', defaultMessage: 'Source' },
  sourceWordpress: { id: 'rwaq.admin.payments.source.wordpress', defaultMessage: 'Purchase' },
  sourceAdmin: { id: 'rwaq.admin.payments.source.admin', defaultMessage: 'Admin grant' },
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
    defaultMessage: 'An admin unenrolled the learner on {date}. Reason: {reason}. The payment still counts as revenue.',
  },
  adminReason: { id: 'rwaq.admin.payments.orders.reason', defaultMessage: 'Reason: {reason}' },
  adminEnrolledBy: { id: 'rwaq.admin.payments.orders.enrolledBy', defaultMessage: 'Enrolled by: {admin}' },
  colReason: { id: 'rwaq.admin.payments.col.reason', defaultMessage: 'Reason' },
  colEnrolledBy: { id: 'rwaq.admin.payments.col.enrolledBy', defaultMessage: 'Enrolled by' },
  infoColReason: {
    id: 'rwaq.admin.payments.info.col.reason',
    defaultMessage: 'The reason the admin gave when enrolling the learner. Empty for WordPress purchases.',
  },
  infoColEnrolledBy: {
    id: 'rwaq.admin.payments.info.col.enrolledBy',
    defaultMessage: 'The admin who enrolled the learner. Empty for WordPress purchases.',
  },
});

export default messages;
