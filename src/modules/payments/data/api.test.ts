/**
 * Payments API — the wire format: snake_case params with empty filters
 * dropped, camelCase results, and the CSV download with the same filters
 * minus paging.
 */
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import {
  downloadPaymentsCsv,
  getPaymentContent,
  getPaymentCoupons,
  getPaymentLearners,
  getPaymentOrders,
  getPaymentPartners,
  getPaymentsSummary,
} from './api';

jest.mock('@edx/frontend-platform/auth', () => ({
  getAuthenticatedHttpClient: jest.fn(),
}));

jest.mock('@edx/frontend-platform', () => {
  const actual = jest.requireActual('@edx/frontend-platform');
  return {
    ...actual,
    getConfig: jest.fn(() => ({ STUDIO_BASE_URL: 'http://studio.local:8001' })),
  };
});

const BASE = 'http://studio.local:8001/api/v1/admin/payments';
const get = jest.fn();

beforeEach(() => {
  get.mockReset();
  (getAuthenticatedHttpClient as jest.Mock).mockReturnValue({ get });
});

describe('payments api', () => {
  it('sends snake_case filters, drops empty ones, and camelCases the summary', async () => {
    get.mockResolvedValue({
      data: {
        net_paid: '700.00', partner_amount: '349.00', series: [{ period: '2026-09-01', net_paid: '600.00' }],
      },
    });

    const summary = await getPaymentsSummary({
      startDate: '2026-09-01', endDate: undefined, org: '', granularity: 'week',
    });

    expect(get).toHaveBeenCalledWith(`${BASE}/summary/`, {
      params: { start_date: '2026-09-01', granularity: 'week' },
    });
    expect(summary.netPaid).toBe('700.00');
    expect(summary.series[0].netPaid).toBe('600.00');
  });

  it('lists orders with paging, search and filters', async () => {
    get.mockResolvedValue({
      data: {
        pagination: {
          count: 1, num_pages: 1, next: null, previous: null,
        },
        results: [{ wordpress_order_id: 'wp-1', order_date: '2026-09-10T10:00:00Z', items: [] }],
      },
    });

    const page = await getPaymentOrders({
      org: 'TPA',
      source: 'wordpress',
      coupon: 'with',
      content: 'course-v1:TPA+C1+2026',
      search: 'buyer',
      ordering: '-order_date',
      page: 2,
      pageSize: 10,
    });

    expect(get).toHaveBeenCalledWith(`${BASE}/orders/`, {
      params: {
        org: 'TPA',
        source: 'wordpress',
        coupon: 'with',
        content: 'course-v1:TPA+C1+2026',
        search: 'buyer',
        ordering: '-order_date',
        page: 2,
        page_size: 10,
      },
    });
    expect(page.pagination.numPages).toBe(1);
    expect(page.results[0].wordpressOrderId).toBe('wp-1');
  });

  it('sends paid=1 when only paid orders are wanted, and nothing when it is not set', async () => {
    get.mockResolvedValue({ data: { pagination: {}, results: [] } });

    await getPaymentOrders({ org: 'TPA', paid: true });
    await getPaymentOrders({ org: 'TPA', paid: false });
    await getPaymentOrders({ org: 'TPA' });

    expect(get).toHaveBeenNthCalledWith(1, `${BASE}/orders/`, { params: { org: 'TPA', paid: 1 } });
    expect(get).toHaveBeenNthCalledWith(2, `${BASE}/orders/`, { params: { org: 'TPA' } });
    expect(get).toHaveBeenNthCalledWith(3, `${BASE}/orders/`, { params: { org: 'TPA' } });
  });

  it('camelCases the partner fields of an order and its coupons', async () => {
    get.mockResolvedValue({
      data: {
        pagination: {},
        results: [{
          partner_actual_price: '100.00',
          partner_discount_amount: '6.67',
          partner_price_paid: '93.33',
          coupons: [{ code: 'SAVE10', discount_amount: '10.00', partner_discount_amount: '6.67' }],
          items: [],
        }],
      },
    });

    const page = await getPaymentOrders({ org: 'TPA', paid: true });

    expect(page.results[0].partnerPricePaid).toBe('93.33');
    expect(page.results[0].partnerActualPrice).toBe('100.00');
    expect(page.results[0].partnerDiscountAmount).toBe('6.67');
    expect(page.results[0].coupons[0].partnerDiscountAmount).toBe('6.67');
  });

  it('downloads the CSV with the same filters but no paging, named by the server', async () => {
    const blob = new Blob(['x']);
    get.mockResolvedValue({
      data: blob,
      headers: { 'content-disposition': 'attachment; filename="payments_partners_TPA.csv"' },
    });

    const result = await downloadPaymentsCsv('partners', {
      org: 'TPA', search: 'org', page: 3, pageSize: 10, ordering: '-net_paid',
    });

    expect(get).toHaveBeenCalledWith(`${BASE}/partners/csv/`, {
      params: { org: 'TPA', search: 'org', ordering: '-net_paid' },
      responseType: 'blob',
    });
    expect(result.blob).toBe(blob);
    expect(result.filename).toBe('payments_partners_TPA.csv');
  });

  it('names the CSV itself when the server header is not readable', async () => {
    get.mockResolvedValue({ data: new Blob(['x']), headers: {} });

    const result = await downloadPaymentsCsv('orders', { startDate: '2026-09-01', org: 'TPA' });

    expect(result.filename).toBe('payments_orders_2026-09-01_TPA.csv');
  });

  const listPage = (row: Record<string, unknown>) => ({
    data: {
      pagination: {
        count: 1, num_pages: 1, next: null, previous: null,
      },
      results: [row],
    },
  });

  it('lists partners from partners/ with snake_case filters and camelCased rows', async () => {
    get.mockResolvedValue(listPage({
      org: 'TPA', org_name: 'Org A', net_paid: '370.00', partner_amount: '259.00',
    }));

    const page = await getPaymentPartners({
      startDate: '2026-09-01', search: 'org', ordering: '-net_paid', page: 2, pageSize: 10,
    });

    expect(get).toHaveBeenCalledWith(`${BASE}/partners/`, {
      params: {
        start_date: '2026-09-01', search: 'org', ordering: '-net_paid', page: 2, page_size: 10,
      },
    });
    expect(page.results[0].orgName).toBe('Org A');
    expect(page.results[0].partnerAmount).toBe('259.00');
  });

  it('lists content from content/ with its type filter', async () => {
    get.mockResolvedValue(listPage({ program_uuid: 'u-1', title: 'Program', rwaq_amount: '30.00' }));

    const page = await getPaymentContent({ org: 'TPA', type: 'program', ordering: 'title' });

    expect(get).toHaveBeenCalledWith(`${BASE}/content/`, {
      params: { org: 'TPA', type: 'program', ordering: 'title' },
    });
    expect(page.results[0].programUuid).toBe('u-1');
    expect(page.results[0].rwaqAmount).toBe('30.00');
  });

  it('lists learners from learners/', async () => {
    get.mockResolvedValue(listPage({ user_id: 5, username: 'buyer5', net_paid: '140.00' }));

    const page = await getPaymentLearners({ search: 'buyer', page: 1, pageSize: 10 });

    expect(get).toHaveBeenCalledWith(`${BASE}/learners/`, {
      params: { search: 'buyer', page: 1, page_size: 10 },
    });
    expect(page.results[0].userId).toBe(5);
    expect(page.results[0].netPaid).toBe('140.00');
  });

  it('lists coupons from coupons/ with its scope filter', async () => {
    get.mockResolvedValue(listPage({ code: 'SAVE10', discount_type: 'amount', discount_given: '60.00' }));

    const page = await getPaymentCoupons({ org: 'TPA', scope: 'cart', ordering: '-discount_given' });

    expect(get).toHaveBeenCalledWith(`${BASE}/coupons/`, {
      params: { org: 'TPA', scope: 'cart', ordering: '-discount_given' },
    });
    expect(page.results[0].discountType).toBe('amount');
    expect(page.results[0].discountGiven).toBe('60.00');
  });

  describe('query params', () => {
    it('keeps a 0, which is a real value, and drops undefined and empty strings', async () => {
      get.mockResolvedValue(listPage({}));

      await getPaymentOrders({
        user: 0, page: 0, search: '', org: undefined, couponCode: 'SAVE10',
      });

      expect(get).toHaveBeenCalledWith(`${BASE}/orders/`, {
        params: { user: 0, page: 0, coupon_code: 'SAVE10' },
      });
    });

    it('does not drop a NaN: it is sent so the backend refuses it instead of the list silently widening', async () => {
      get.mockResolvedValue(listPage({}));

      await getPaymentOrders({ user: Number('abc') });

      const { params } = get.mock.calls[0][1];
      expect(Object.keys(params)).toEqual(['user']);
      expect(Number.isNaN(params.user)).toBe(true);
    });
  });

  describe('CSV download', () => {
    const download = (headers: Record<string, string>) => {
      get.mockResolvedValue({ data: new Blob(['x']), headers });
      return downloadPaymentsCsv('orders', {});
    };

    it('reads an unquoted filename', async () => {
      expect((await download({ 'content-disposition': 'attachment; filename=orders_2026-09-30.csv' })).filename)
        .toBe('orders_2026-09-30.csv');
    });

    it('reads a quoted filename that comes with a filename* one', async () => {
      const header = 'attachment; filename="orders_2026-09-30.csv"; filename*=UTF-8\'\'orders_2026-09-30.csv';

      expect((await download({ 'content-disposition': header })).filename).toBe('orders_2026-09-30.csv');
    });

    it('falls back to its own name when only a filename* is given, which it does not parse', async () => {
      const header = 'attachment; filename*=UTF-8\'\'orders_2026-09-30.csv';

      expect((await download({ 'content-disposition': header })).filename).toBe('payments_orders.csv');
    });

    it('falls back to its own name when the headers are missing altogether', async () => {
      get.mockResolvedValue({ data: new Blob(['x']) });

      expect((await downloadPaymentsCsv('coupons', { org: 'TPA' })).filename).toBe('payments_coupons_TPA.csv');
    });

    it('rejects with the http error when the server refuses, so the caller can say so', async () => {
      // With responseType blob, axios hands an error body back as a Blob too.
      const refusal = Object.assign(new Error('Request failed with status code 400'), {
        response: { status: 400, data: new Blob(['{"detail":"bad"}']) },
      });
      get.mockRejectedValue(refusal);

      await expect(downloadPaymentsCsv('orders', { startDate: '2026-09-01' })).rejects.toBe(refusal);
    });
  });
});
