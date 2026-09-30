import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  title: { id: 'rwaq.admin.payments.title', defaultMessage: 'Orders & Payments' },
  errorTitle: { id: 'rwaq.admin.payments.error', defaultMessage: 'Could not load payments.' },
  forbiddenTitle: {
    id: 'rwaq.admin.payments.forbidden',
    defaultMessage: 'Orders & Payments are visible to Rwaq superadmins only.',
  },
  notSet: { id: 'rwaq.admin.payments.notSet', defaultMessage: 'Not set' },

  // ── Partner filter ─────────────────────────────────────────────────────────
  partnerLabel: { id: 'rwaq.admin.payments.partner', defaultMessage: 'Partner' },
  allPartners: { id: 'rwaq.admin.payments.partner.all', defaultMessage: 'All partners' },
  chipPartner: { id: 'rwaq.admin.payments.chip.partner', defaultMessage: 'Partner: {org}' },

  // ── Tabs ───────────────────────────────────────────────────────────────────
  loadingTab: { id: 'rwaq.admin.payments.loadingTab', defaultMessage: 'Loading' },
  tabOverview: { id: 'rwaq.admin.payments.tab.overview', defaultMessage: 'Overview' },
  tabOrders: { id: 'rwaq.admin.payments.tab.orders', defaultMessage: 'Payment history' },
  tabPartners: { id: 'rwaq.admin.payments.tab.partners', defaultMessage: 'By partner' },
  tabContent: { id: 'rwaq.admin.payments.tab.content', defaultMessage: 'By content' },
  tabLearners: { id: 'rwaq.admin.payments.tab.learners', defaultMessage: 'By learner' },
  tabCoupons: { id: 'rwaq.admin.payments.tab.coupons', defaultMessage: 'By coupon' },

  // ── Overview: KPI tiles ────────────────────────────────────────────────────
  kpiOrders: { id: 'rwaq.admin.payments.kpi.orders', defaultMessage: 'Orders' },
  kpiOrderValue: { id: 'rwaq.admin.payments.kpi.orderValue', defaultMessage: 'Order value' },
  kpiDiscounts: { id: 'rwaq.admin.payments.kpi.discounts', defaultMessage: 'Discounts' },
  kpiCollected: { id: 'rwaq.admin.payments.kpi.collected', defaultMessage: 'Amount collected' },
  kpiPartner: { id: 'rwaq.admin.payments.kpi.partner', defaultMessage: 'Payable to partners' },
  kpiPartnerOne: { id: 'rwaq.admin.payments.kpi.partnerOne', defaultMessage: 'Payable to partner' },
  kpiRwaq: { id: 'rwaq.admin.payments.kpi.rwaq', defaultMessage: 'Rwaq revenue' },
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
  infoPartner: {
    id: 'rwaq.admin.payments.info.partner',
    defaultMessage: 'What Rwaq owes partners: each item\'s amount collected times its partner\'s current revenue share. Changing a share changes this for past orders too. Partners without a share are left out.',
  },

  infoRwaq: {
    id: 'rwaq.admin.payments.info.rwaq',
    defaultMessage: 'Amount collected minus the partner payout. A partner with no revenue share keeps nothing, so all of its revenue, and all of Rwaq\'s own content, counts as Rwaq revenue.',
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
  chartSplitTitle: { id: 'rwaq.admin.payments.chart.split', defaultMessage: 'Partner payout and Rwaq revenue over time' },
  seriesCollected: { id: 'rwaq.admin.payments.series.collected', defaultMessage: 'Amount collected (SAR)' },
  seriesOrders: { id: 'rwaq.admin.payments.series.orders', defaultMessage: 'Orders' },
  seriesPayout: { id: 'rwaq.admin.payments.series.payout', defaultMessage: 'Partner payout (SAR)' },
  seriesRwaq: { id: 'rwaq.admin.payments.series.rwaq', defaultMessage: 'Rwaq revenue (SAR)' },
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
  infoChartSplit: {
    id: 'rwaq.admin.payments.info.chartSplit',
    defaultMessage: 'How the amount collected in each period divides between partners and Rwaq. Money from partners without a share is left out of both.',
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
  infoPartnersTab: {
    id: 'rwaq.admin.payments.info.partnersTab',
    defaultMessage: 'Revenue per partner organization and the amount to transfer to it. Use this tab for payouts: the partner payout is rounded once on each partner\'s total.',
  },
  howPartners: {
    id: 'rwaq.admin.payments.how.partners',
    defaultMessage: 'Partner payout = amount collected x the partner\'s share %. Example: 1,000 collected at a 30% share is 300 for the partner and 700 for Rwaq.',
  },
  infoContentTab: {
    id: 'rwaq.admin.payments.info.contentTab',
    defaultMessage: 'Revenue per course and program, split by its partner\'s share. Rows are rounded on their own, so they can differ by 0.01 from the partner total.',
  },
  howContent: {
    id: 'rwaq.admin.payments.how.content',
    defaultMessage: 'Each purchase is split at its partner\'s share %, then added up per course or program. Example: a 500 course at a 30% share gives the partner 150 and Rwaq 350.',
  },
  infoLearnersTab: {
    id: 'rwaq.admin.payments.info.learnersTab',
    defaultMessage: 'What each learner paid. A learner can buy from several partners, so each purchase is split by its own partner\'s share.',
  },
  howLearners: {
    id: 'rwaq.admin.payments.how.learners',
    defaultMessage: 'Each purchase is split at its own partner\'s share %, then added up per learner. A learner who bought from partners with different shares gets a blended split.',
  },
  infoCouponsTab: {
    id: 'rwaq.admin.payments.info.couponsTab',
    defaultMessage: 'Coupons used on completed WordPress orders. With a partner selected, a cart coupon counts only the part that fell on that partner\'s items.',
  },
  howCoupons: {
    id: 'rwaq.admin.payments.how.coupons',
    defaultMessage: 'Discount given is what the coupon took off. Payouts are worked out after discounts, so a discount lowers the partner and Rwaq amounts in proportion to each share.',
  },

  // ── Shared list controls ───────────────────────────────────────────────────
  sortLabel: { id: 'rwaq.admin.payments.sort', defaultMessage: 'Sort by' },
  chipSearch: { id: 'rwaq.admin.payments.chip.search', defaultMessage: 'Search: {term}' },
  chipSort: { id: 'rwaq.admin.payments.chip.sort', defaultMessage: 'Sort: {label}' },
  filterAll: { id: 'rwaq.admin.payments.filter.all', defaultMessage: 'All' },
  downloadCsv: { id: 'rwaq.admin.payments.csv', defaultMessage: 'Download CSV' },
  downloadCsvFailed: { id: 'rwaq.admin.payments.csv.failed', defaultMessage: 'Could not download the CSV.' },
  loadingRows: { id: 'rwaq.admin.payments.expand.loading', defaultMessage: 'Loading…' },
  nothingHere: { id: 'rwaq.admin.payments.expand.empty', defaultMessage: 'Nothing to show for this period.' },

  sortCollectedDesc: { id: 'rwaq.admin.payments.sort.collectedDesc', defaultMessage: 'Amount collected, highest first' },
  sortCollectedAsc: { id: 'rwaq.admin.payments.sort.collectedAsc', defaultMessage: 'Amount collected, lowest first' },
  sortPayoutDesc: { id: 'rwaq.admin.payments.sort.payoutDesc', defaultMessage: 'Partner payout, highest first' },
  sortPurchasesDesc: { id: 'rwaq.admin.payments.sort.purchasesDesc', defaultMessage: 'Purchases, most first' },
  sortNameAsc: { id: 'rwaq.admin.payments.sort.nameAsc', defaultMessage: 'Name, A to Z' },
  sortDateDesc: { id: 'rwaq.admin.payments.sort.dateDesc', defaultMessage: 'Newest first' },
  sortDateAsc: { id: 'rwaq.admin.payments.sort.dateAsc', defaultMessage: 'Oldest first' },
  sortPaidDesc: { id: 'rwaq.admin.payments.sort.paidDesc', defaultMessage: 'Amount collected, highest first' },
  sortOrdersDesc: { id: 'rwaq.admin.payments.sort.ordersDesc', defaultMessage: 'Orders, most first' },
  sortDiscountDesc: { id: 'rwaq.admin.payments.sort.discountDesc', defaultMessage: 'Discount given, highest first' },

  // ── Revenue columns: one set of labels, with hover text per tab ────────────
  colShare: { id: 'rwaq.admin.payments.col.share', defaultMessage: 'Share' },
  colActions: { id: 'rwaq.admin.payments.col.actions', defaultMessage: 'Actions' },
  colOrders: { id: 'rwaq.admin.payments.col.orders', defaultMessage: 'Orders' },
  colOrdersPlaced: { id: 'rwaq.admin.payments.col.ordersPlaced', defaultMessage: 'Orders placed' },
  colPurchases: { id: 'rwaq.admin.payments.col.purchases', defaultMessage: 'Purchases' },
  colSold: { id: 'rwaq.admin.payments.col.sold', defaultMessage: 'Items sold' },
  colBought: { id: 'rwaq.admin.payments.col.bought', defaultMessage: 'Items bought' },
  colOrderValue: { id: 'rwaq.admin.payments.col.orderValue', defaultMessage: 'Order value (SAR)' },
  colDiscounts: { id: 'rwaq.admin.payments.col.discounts', defaultMessage: 'Discounts (SAR)' },
  colCollected: { id: 'rwaq.admin.payments.col.collected', defaultMessage: 'Amount collected (SAR)' },
  colPayout: { id: 'rwaq.admin.payments.col.payout', defaultMessage: 'Partner payout (SAR)' },
  colRwaq: { id: 'rwaq.admin.payments.col.rwaq', defaultMessage: 'Rwaq revenue (SAR)' },
  infoColShare: {
    id: 'rwaq.admin.payments.info.col.share',
    defaultMessage: 'This partner\'s cut of what learners pay for its courses and programs, set on the organization. Not set means no share: Rwaq retains the full amount.',
  },
  noShareInfo: {
    id: 'rwaq.admin.payments.noShare',
    defaultMessage: 'No revenue share is set for this partner, so Rwaq retains the full amount. Set a share on the organization to allocate a payout to this partner.',
  },

  // By partner (a row is one partner)
  infoPartnerOrders: {
    id: 'rwaq.admin.payments.info.partner.orders',
    defaultMessage: 'Orders that contain at least one of this partner\'s courses or programs.',
  },
  infoPartnerSold: {
    id: 'rwaq.admin.payments.info.partner.sold',
    defaultMessage: 'Items are the courses and programs in an order. This is how many of this partner\'s items were bought. The same course bought twice counts as 2.',
  },
  infoPartnerOrderValue: {
    id: 'rwaq.admin.payments.info.partner.orderValue',
    defaultMessage: 'List price of this partner\'s courses and programs sold, before discounts.',
  },
  infoPartnerDiscounts: {
    id: 'rwaq.admin.payments.info.partner.discounts',
    defaultMessage: 'Coupon money taken off this partner\'s sales.',
  },
  infoPartnerCollected: {
    id: 'rwaq.admin.payments.info.partner.collected',
    defaultMessage: 'What learners paid for this partner\'s courses and programs after discounts. Order value minus Discounts.',
  },
  infoPartnerPayout: {
    id: 'rwaq.admin.payments.info.partner.payout',
    defaultMessage: 'What to transfer to this partner: Amount collected x the partner\'s share %. Example: 400 x 30% = 120. With no share set, the payout is 0.',
  },
  infoPartnerRwaq: {
    id: 'rwaq.admin.payments.info.partner.rwaq',
    defaultMessage: 'What Rwaq keeps from this partner\'s sales: Amount collected minus Partner payout. Example: 400 - 120 = 280.',
  },

  // By content (a row is one course or program)
  infoContentPurchases: {
    id: 'rwaq.admin.payments.info.content.purchases',
    defaultMessage: 'How many times this course or program was bought. A learner who bought it twice counts as 2.',
  },
  infoContentOrderValue: {
    id: 'rwaq.admin.payments.info.content.orderValue',
    defaultMessage: 'List price of every purchase of this course or program, before discounts.',
  },
  infoContentDiscounts: {
    id: 'rwaq.admin.payments.info.content.discounts',
    defaultMessage: 'Coupon money taken off purchases of this course or program.',
  },
  infoContentCollected: {
    id: 'rwaq.admin.payments.info.content.collected',
    defaultMessage: 'What learners paid for this course or program in total. Order value minus Discounts.',
  },
  infoContentPayout: {
    id: 'rwaq.admin.payments.info.content.payout',
    defaultMessage: 'The partner\'s part of what this earned: Amount collected x the owning partner\'s share %. Example: 400 x 30% = 120.',
  },
  infoContentRwaq: {
    id: 'rwaq.admin.payments.info.content.rwaq',
    defaultMessage: 'Rwaq\'s part of what this earned: Amount collected minus Partner payout. Example: 400 - 120 = 280.',
  },

  // By learner (a row is one buyer)
  infoLearnerOrders: {
    id: 'rwaq.admin.payments.info.learner.orders',
    defaultMessage: 'How many paid orders this learner placed.',
  },
  infoLearnerBought: {
    id: 'rwaq.admin.payments.info.learner.bought',
    defaultMessage: 'Items are the courses and programs in an order. This is how many items this learner bought across all their orders. One order with 3 courses counts as 3.',
  },
  infoLearnerOrderValue: {
    id: 'rwaq.admin.payments.info.learner.orderValue',
    defaultMessage: 'List price of everything this learner bought, before discounts.',
  },
  infoLearnerDiscounts: {
    id: 'rwaq.admin.payments.info.learner.discounts',
    defaultMessage: 'Coupon money this learner saved.',
  },
  infoLearnerCollected: {
    id: 'rwaq.admin.payments.info.learner.collected',
    defaultMessage: 'What this learner paid in total. Order value minus Discounts.',
  },
  infoLearnerPayout: {
    id: 'rwaq.admin.payments.info.learner.payout',
    defaultMessage: 'The partner share earned from this learner\'s purchases. Each purchase is split at its own partner\'s share %, then added up.',
  },
  infoLearnerRwaq: {
    id: 'rwaq.admin.payments.info.learner.rwaq',
    defaultMessage: 'Rwaq\'s part of this learner\'s purchases: Amount collected minus Partner payout.',
  },

  // ── By partner ─────────────────────────────────────────────────────────────
  partnersSearch: { id: 'rwaq.admin.payments.partners.search', defaultMessage: 'Search partners' },
  colPartnerOrg: { id: 'rwaq.admin.payments.col.partnerOrg', defaultMessage: 'Partner' },
  infoColPartnerOrg: {
    id: 'rwaq.admin.payments.info.col.partnerOrg',
    defaultMessage: 'The partner organization that owns the courses and programs sold.',
  },
  viewOverview: { id: 'rwaq.admin.payments.partners.overview', defaultMessage: 'View overview' },
  viewOverviewAria: {
    id: 'rwaq.admin.payments.partners.overview.aria',
    defaultMessage: 'Open the overview for {org}',
  },
  partnerOrdersTitle: {
    id: 'rwaq.admin.payments.partners.orders',
    defaultMessage: 'Orders with {org}\'s courses and programs',
  },
  colPaidForPartner: {
    id: 'rwaq.admin.payments.col.paidForPartner',
    defaultMessage: 'Amount for this partner (SAR)',
  },
  learnerOrdersTitle: { id: 'rwaq.admin.payments.learners.orders', defaultMessage: 'Orders placed by this learner' },
  couponOrdersTitle: { id: 'rwaq.admin.payments.coupons.orders', defaultMessage: 'Orders that used this coupon' },
  colCouponDiscount: { id: 'rwaq.admin.payments.col.couponDiscount', defaultMessage: 'Discount from this coupon (SAR)' },
  chipBuyer: { id: 'rwaq.admin.payments.chip.buyer', defaultMessage: 'Buyer: {name}' },
  chipCouponCode: { id: 'rwaq.admin.payments.chip.couponCode', defaultMessage: 'Coupon code: {code}' },

  // ── By content ─────────────────────────────────────────────────────────────
  contentSearch: { id: 'rwaq.admin.payments.content.search', defaultMessage: 'Search by title or key' },
  colContent: { id: 'rwaq.admin.payments.col.content', defaultMessage: 'Course or program' },
  colType: { id: 'rwaq.admin.payments.col.type', defaultMessage: 'Type' },
  colOrg: { id: 'rwaq.admin.payments.col.org', defaultMessage: 'Organization' },
  infoColContent: {
    id: 'rwaq.admin.payments.info.col.content',
    defaultMessage: 'The course or program that was sold. Click the title to open it.',
  },
  infoColType: { id: 'rwaq.admin.payments.info.col.type', defaultMessage: 'Course or program.' },
  infoColOrg: {
    id: 'rwaq.admin.payments.info.col.org',
    defaultMessage: 'The partner that owns it. All its revenue is split at this partner\'s share.',
  },
  typeLabel: { id: 'rwaq.admin.payments.type', defaultMessage: 'Type' },
  typeCourse: { id: 'rwaq.admin.payments.type.course', defaultMessage: 'Course' },
  typeProgram: { id: 'rwaq.admin.payments.type.program', defaultMessage: 'Program' },
  chipType: { id: 'rwaq.admin.payments.chip.type', defaultMessage: 'Type: {label}' },
  showingOf: { id: 'rwaq.admin.payments.showingOf', defaultMessage: 'Showing {shown} of {total}.' },
  viewAll: { id: 'rwaq.admin.payments.viewAll', defaultMessage: 'View all' },
  chipContent: { id: 'rwaq.admin.payments.chip.content', defaultMessage: 'Course or program: {title}' },
  contentOrdersTitle: { id: 'rwaq.admin.payments.content.orders', defaultMessage: 'Orders that bought this' },
  colPaidForItem: { id: 'rwaq.admin.payments.col.paidForItem', defaultMessage: 'Paid for this item (SAR)' },

  // ── By learner ─────────────────────────────────────────────────────────────
  learnersSearch: { id: 'rwaq.admin.payments.learners.search', defaultMessage: 'Search by username or email' },
  colLearner: { id: 'rwaq.admin.payments.col.learner', defaultMessage: 'Learner' },
  infoColLearner: {
    id: 'rwaq.admin.payments.info.col.learner',
    defaultMessage: 'The buyer. A Partial badge means some of their money is not split yet, hover it for an example.',
  },

  // ── By coupon ──────────────────────────────────────────────────────────────
  couponsSearch: { id: 'rwaq.admin.payments.coupons.search', defaultMessage: 'Search by coupon code' },
  colCoupon: { id: 'rwaq.admin.payments.col.coupon', defaultMessage: 'Coupon' },
  colScope: { id: 'rwaq.admin.payments.col.scope', defaultMessage: 'Applies to' },
  colDiscountType: { id: 'rwaq.admin.payments.col.discountType', defaultMessage: 'Discount' },
  colDiscountGiven: { id: 'rwaq.admin.payments.col.discountGiven', defaultMessage: 'Discount given (SAR)' },
  infoColCoupon: { id: 'rwaq.admin.payments.info.col.coupon', defaultMessage: 'The coupon code.' },
  infoColScope: {
    id: 'rwaq.admin.payments.info.col.scope',
    defaultMessage: 'One item is a product coupon on a single course or program. Whole cart is a cart coupon on the whole order.',
  },
  infoColDiscountType: {
    id: 'rwaq.admin.payments.info.col.discountType',
    defaultMessage: 'Fixed amount or a percentage off.',
  },
  infoColCouponOrders: {
    id: 'rwaq.admin.payments.info.col.couponOrders',
    defaultMessage: 'Orders that used this coupon. Each order counts once, even if a product coupon discounted several items in it.',
  },
  infoColDiscountGiven: {
    id: 'rwaq.admin.payments.info.col.discountGiven',
    defaultMessage: 'The money this coupon took off.',
  },
  scopeLabel: { id: 'rwaq.admin.payments.scope', defaultMessage: 'Applies to' },
  scopeProduct: { id: 'rwaq.admin.payments.scope.product', defaultMessage: 'One item' },
  scopeCart: { id: 'rwaq.admin.payments.scope.cart', defaultMessage: 'Whole cart' },
  scopeMixed: { id: 'rwaq.admin.payments.scope.mixed', defaultMessage: 'Both' },
  chipScope: { id: 'rwaq.admin.payments.chip.scope', defaultMessage: 'Applies to: {label}' },
  discountAmount: { id: 'rwaq.admin.payments.discount.amount', defaultMessage: 'Fixed amount' },
  discountPercentage: { id: 'rwaq.admin.payments.discount.percentage', defaultMessage: 'Percentage' },
  discountMixed: { id: 'rwaq.admin.payments.discount.mixed', defaultMessage: 'Both' },

  // ── Payment history ────────────────────────────────────────────────────────
  ordersSearch: {
    id: 'rwaq.admin.payments.orders.search',
    defaultMessage: 'Search by username, email, order ID or coupon code',
  },
  colOrder: { id: 'rwaq.admin.payments.col.order', defaultMessage: 'Order' },
  colDate: { id: 'rwaq.admin.payments.col.date', defaultMessage: 'Date' },
  colBuyer: { id: 'rwaq.admin.payments.col.buyer', defaultMessage: 'Buyer' },
  colCourses: { id: 'rwaq.admin.payments.col.courses', defaultMessage: 'Items' },
  colPrice: { id: 'rwaq.admin.payments.col.price', defaultMessage: 'Price (SAR)' },
  colDiscount: { id: 'rwaq.admin.payments.col.discount', defaultMessage: 'Discount (SAR)' },
  colPaid: { id: 'rwaq.admin.payments.col.paid', defaultMessage: 'Paid (SAR)' },
  colSource: { id: 'rwaq.admin.payments.col.source', defaultMessage: 'Source' },
  infoColOrder: {
    id: 'rwaq.admin.payments.info.col.order',
    defaultMessage: 'The WordPress order ID. Admin grants have no WordPress order and show as Admin enrollment.',
  },
  infoColDate: { id: 'rwaq.admin.payments.info.col.date', defaultMessage: 'When the order was paid.' },
  infoColBuyer: { id: 'rwaq.admin.payments.info.col.buyer', defaultMessage: 'The learner who placed the order. Click to open their profile.' },
  infoColCourses: {
    id: 'rwaq.admin.payments.info.col.courses',
    defaultMessage: 'Items are the courses and programs in the order. An order with 3 courses counts 3 items.',
  },
  infoColOrderPrice: {
    id: 'rwaq.admin.payments.info.col.orderPrice',
    defaultMessage: 'List price of everything in the order, before coupons.',
  },
  infoColOrderDiscount: {
    id: 'rwaq.admin.payments.info.col.orderDiscount',
    defaultMessage: 'Coupon money taken off this order.',
  },
  infoColOrderPaid: {
    id: 'rwaq.admin.payments.info.col.orderPaid',
    defaultMessage: 'What the learner paid for the order after coupons.',
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
});

export default messages;
