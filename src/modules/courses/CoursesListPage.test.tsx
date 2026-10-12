/**
 * CoursesListPage — the "Course Started at" period and the CSV button.
 *
 * The data hook is mocked, as in the payments test, so this runs without a
 * QueryClient or network. The CSV button is stubbed to show what it would send.
 */
import { fireEvent, screen } from '@testing-library/react';
import { renderWrapper } from '@src/setupTest';
import * as hooks from './data/hooks';
import CoursesListPage from './CoursesListPage';

jest.mock('./data/hooks', () => ({ useCourses: jest.fn() }));

jest.mock('@src/components/CsvDownloadButton', () => ({
  __esModule: true,
  default: ({ url, params }: { url: string; params: object }) => (
    <button type="button" data-testid="csv" data-url={url} data-params={JSON.stringify(params)}>csv</button>
  ),
}));

jest.mock('@edx/frontend-platform', () => {
  const actual = jest.requireActual('@edx/frontend-platform');
  return { ...actual, getConfig: jest.fn(() => ({ STUDIO_BASE_URL: 'http://studio.local:8001' })) };
});

const lastCall = () => (hooks.useCourses as jest.Mock).mock.calls.at(-1)[0];
const csvParams = () => JSON.parse(screen.getByTestId('csv').dataset.params as string);

describe('CoursesListPage period', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.history.pushState({}, '', '/');
    (hooks.useCourses as jest.Mock).mockReturnValue({
      data: { results: [], pagination: { count: 0, numPages: 1 } },
      isLoading: false,
      isError: false,
      error: null,
      refetch: jest.fn(),
    });
  });

  it('has the picker next to the download button, named as a filter on the course start date', () => {
    renderWrapper(<CoursesListPage />);

    expect(screen.getByRole('button', { name: /Course Started at: All time/ })).toBeInTheDocument();
    expect(screen.getByTestId('csv')).toBeInTheDocument();
  });

  it('lists every course and sends no period until one is picked', () => {
    renderWrapper(<CoursesListPage />);

    expect(lastCall().startDate).toBeUndefined();
    expect(lastCall().endDate).toBeUndefined();
    expect(csvParams()).not.toHaveProperty('startDate');
  });

  it('sends the period from the URL to the list and to the CSV, and shows it as a chip', () => {
    window.history.pushState({}, '', '/?start_date=2026-03-01&end_date=2026-03-31&search=math');

    renderWrapper(<CoursesListPage />);

    expect(lastCall()).toMatchObject({ startDate: '2026-03-01', endDate: '2026-03-31', search: 'math' });
    expect(csvParams()).toMatchObject({ startDate: '2026-03-01', endDate: '2026-03-31', search: 'math' });
    expect(screen.getByText('Course Started at: 2026-03-01 – 2026-03-31')).toBeInTheDocument();
    expect(screen.getByTestId('csv').dataset.url).toBe('http://studio.local:8001/api/v1/admin/courses/csv/');
  });

  it('drops the period when its chip is removed, and goes back to page 1', () => {
    window.history.pushState({}, '', '/?start_date=2026-03-01&end_date=2026-03-31&page=3');
    renderWrapper(<CoursesListPage />);

    fireEvent.click(screen.getByRole('button', { name: /Remove Course Started at/ }));

    expect(window.location.search).toBe('');
    expect(lastCall().startDate).toBeUndefined();
  });
});
