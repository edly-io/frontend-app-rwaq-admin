/**
 * The shared CSV button with the real helper behind it (only the http client is mocked),
 * so what goes over the wire is what the list's filters say.
 */
import {
  fireEvent, render, screen, waitFor,
} from '@testing-library/react';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { logError } from '@edx/frontend-platform/logging';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { useToast } from './ToastContext';
import CsvDownloadButton from './CsvDownloadButton';

jest.mock('@edx/frontend-platform/auth', () => ({ getAuthenticatedHttpClient: jest.fn() }));
jest.mock('@edx/frontend-platform/logging', () => ({ logError: jest.fn() }));
jest.mock('./ToastContext', () => ({ useToast: jest.fn() }));

const CSV_URL = 'http://studio.local:8001/api/v1/admin/courses/csv/';
const get = jest.fn();
const showToast = jest.fn();

describe('CsvDownloadButton', () => {
  const createObjectURL = jest.fn(() => 'blob:csv-1');
  const revokeObjectURL = jest.fn();
  let clicked: { download: string; href: string }[];

  const renderButton = (params: Record<string, unknown> = {}) => render(
    <IntlProvider locale="en"><CsvDownloadButton url={CSV_URL} params={params} fallbackName="courses" /></IntlProvider>,
  );

  beforeEach(() => {
    jest.useFakeTimers({ advanceTimers: true });
    jest.clearAllMocks();
    get.mockReset();
    (getAuthenticatedHttpClient as jest.Mock).mockReturnValue({ get });
    (useToast as jest.Mock).mockReturnValue({ showToast });
    Object.assign(URL, { createObjectURL, revokeObjectURL });
    clicked = [];
    jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function click(this: HTMLAnchorElement) {
      clicked.push({ download: this.download, href: this.href });
    });
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('downloads the blob under the name the server gave, through an object URL', async () => {
    const blob = new Blob(['a,b']);
    get.mockResolvedValue({ data: blob, headers: { 'content-disposition': 'attachment; filename="courses_2026-10-12.csv"' } });
    renderButton();

    fireEvent.click(screen.getByRole('button', { name: 'Download CSV' }));

    await waitFor(() => expect(clicked).toHaveLength(1));
    expect(createObjectURL).toHaveBeenCalledWith(blob);
    expect(clicked[0]).toEqual({ download: 'courses_2026-10-12.csv', href: 'blob:csv-1' });
  });

  it('falls back to the given name with the date and time when the response names no file', async () => {
    get.mockResolvedValue({ data: new Blob(['a']), headers: {} });
    renderButton();

    fireEvent.click(screen.getByRole('button', { name: 'Download CSV' }));

    await waitFor(() => expect(clicked).toHaveLength(1));
    expect(clicked[0].download).toMatch(/^courses_\d{4}-\d\d-\d\d_\d\d-\d\d-\d\d\.csv$/);
  });

  it('sends the filters in snake case, without paging or empty values, in the page language', async () => {
    get.mockResolvedValue({ data: new Blob(['a']), headers: {} });
    renderButton({
      search: 'math', org: '', startDate: '2026-03-01', endDate: '2026-03-31', page: 3, pageSize: 10, ordering: undefined,
    });

    fireEvent.click(screen.getByRole('button', { name: 'Download CSV' }));

    await waitFor(() => expect(get).toHaveBeenCalledTimes(1));
    expect(get).toHaveBeenCalledWith(CSV_URL, {
      params: { search: 'math', start_date: '2026-03-01', end_date: '2026-03-31' },
      responseType: 'blob',
      headers: { 'Accept-Language': 'en' },
    });
  });

  it('frees the object URL a moment later, not before the download has started', async () => {
    get.mockResolvedValue({ data: new Blob(['a']), headers: {} });
    renderButton();

    fireEvent.click(screen.getByRole('button', { name: 'Download CSV' }));
    await waitFor(() => expect(clicked).toHaveLength(1));
    expect(revokeObjectURL).not.toHaveBeenCalled();

    jest.advanceTimersByTime(10_000);
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:csv-1');
  });

  it('says so and logs when the download fails, and can be tried again', async () => {
    const failure = new Error('boom');
    get.mockRejectedValueOnce(failure);
    renderButton();

    fireEvent.click(screen.getByRole('button', { name: 'Download CSV' }));

    await waitFor(() => expect(showToast).toHaveBeenCalledWith('Could not download the CSV.'));
    expect(logError).toHaveBeenCalledWith(failure);
    expect(clicked).toHaveLength(0);
    expect(screen.getByRole('button', { name: 'Download CSV' })).toBeEnabled();
  });

  it('shows a spinner and the downloading label while a download is running', async () => {
    let finish: (value: unknown) => void = () => {};
    get.mockReturnValue(new Promise((resolve) => { finish = resolve; }));
    renderButton();

    fireEvent.click(screen.getByRole('button', { name: 'Download CSV' }));

    await waitFor(() => expect(screen.getByRole('button', { name: /Downloading/ })).toBeInTheDocument());
    expect(screen.getByRole('button', { name: /Downloading/ }).querySelector('.icon-spin')).not.toBeNull();
    finish({ data: new Blob(['a']), headers: {} });
    await waitFor(() => expect(screen.getByRole('button', { name: 'Download CSV' })).toBeInTheDocument());
  });
});
