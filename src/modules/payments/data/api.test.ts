/**
 * Payments API — the wire format: snake_case params with empty filters
 * dropped, camelCase results, and the CSV download with the same filters
 * minus paging.
 */
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { downloadPaymentsCsv, getPaymentOrders, getPaymentsSummary } from './api';

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
});
