/**
 * ProgramListPage — the organization filter and the CSV button.
 *
 * The data hooks are mocked, as in the courses test, so this runs without a QueryClient or network.
 */
import { fireEvent, render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { renderWrapper } from '@src/setupTest';
import * as hooks from './data/hooks';
import ProgramListPage from './ProgramListPage';

jest.mock('./data/hooks', () => ({ usePrograms: jest.fn() }));
jest.mock('@src/modules/organizations/data/hooks', () => ({
  useOrgFilterOptions: jest.fn(() => [
    { value: 'QAOrg', label: 'QA Org' },
    { value: 'QAOrg2', label: 'QA Org Two' },
  ]),
}));

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

const lastCall = () => (hooks.usePrograms as jest.Mock).mock.calls.at(-1)[0];
const csvParams = () => JSON.parse(screen.getByTestId('csv').dataset.params as string);

describe('ProgramListPage organization filter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.history.pushState({}, '', '/');
    (hooks.usePrograms as jest.Mock).mockReturnValue({
      data: { results: [], pagination: { count: 0, numPages: 1 } },
      isLoading: false,
      isError: false,
      error: null,
      refetch: jest.fn(),
    });
  });

  it('offers every organization by name, with All organizations first', () => {
    renderWrapper(<ProgramListPage />);

    const options = Array.from((screen.getByLabelText('Organization') as HTMLSelectElement).options);
    expect(options.map((option) => option.textContent)).toEqual(['All organizations', 'QA Org', 'QA Org Two']);
    expect(lastCall().org).toBeUndefined();
    expect(csvParams()).not.toHaveProperty('org');
  });

  it('filters the list and the CSV by the chosen organization, and keeps it in the URL', () => {
    renderWrapper(<ProgramListPage />);

    fireEvent.click(screen.getByRole('button', { name: 'Filters' }));
    fireEvent.change(screen.getByLabelText('Organization'), { target: { value: 'QAOrg' } });

    expect(window.location.search).toBe('?org=QAOrg');
    expect(lastCall().org).toBe('QAOrg');
    expect(csvParams()).toMatchObject({ org: 'QAOrg' });
    expect(screen.getByText('Organization: QAOrg')).toBeInTheDocument();
    expect(screen.getByTestId('csv').dataset.url).toBe('http://studio.local:8001/api/v1/admin/programs/csv/');
  });

  it('offers the Enrollment code type and sends pricing=enrollment_code to the list and the CSV', () => {
    renderWrapper(<ProgramListPage />);

    fireEvent.click(screen.getByRole('button', { name: 'Filters' }));
    const select = screen.getByLabelText('Type') as HTMLSelectElement;
    expect(Array.from(select.options).map((option) => option.textContent)).toContain('Enrollment code');
    fireEvent.change(select, { target: { value: 'enrollment_code' } });

    expect(lastCall().pricing).toBe('enrollment_code');
    expect(csvParams()).toMatchObject({ pricing: 'enrollment_code' });
    expect(screen.getByText('Type: Enrollment code')).toBeInTheDocument();
  });

  it('starts from the organization in the URL, and clears it with its chip', () => {
    window.history.pushState({}, '', '/?org=QAOrg2&page=2');
    renderWrapper(<ProgramListPage />);

    expect((screen.getByLabelText('Organization') as HTMLSelectElement).value).toBe('QAOrg2');
    expect(lastCall().org).toBe('QAOrg2');

    fireEvent.click(screen.getByRole('button', { name: /Remove Organization/ }));

    expect(window.location.search).toBe('');
    expect(lastCall().org).toBeUndefined();
  });
});

const PROGRAM = {
  uuid: '11111111-1111-1111-1111-111111111111',
  programKey: 'program-v1:ARB+MASTERS+2026',
  name: 'Data Science Track',
  organization: 'ARB',
  organizationName: 'Arbisoft Academy',
  organizationArabicName: 'أكاديمية أربيسوفت',
  organizationLogo: null,
  programType: 'Masters',
  batch: '2026',
  status: 'active',
  isHide: false,
  isFeatured: false,
  totalCourses: 2,
  enrollmentCount: 0,
  pricingCategory: 'is_free',
};

describe('ProgramListPage organization name', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.history.pushState({}, '', '/');
    (hooks.usePrograms as jest.Mock).mockReturnValue({
      data: { results: [PROGRAM], pagination: { count: 1, numPages: 1 } },
      isLoading: false,
      isError: false,
      error: null,
      refetch: jest.fn(),
    });
  });

  it('keeps the short code and shows the English name in English', () => {
    renderWrapper(<ProgramListPage />);

    expect(screen.getByText('ARB')).toBeInTheDocument();
    expect(screen.getByText('Arbisoft Academy')).toBeInTheDocument();
    expect(screen.queryByText('أكاديمية أربيسوفت')).not.toBeInTheDocument();
  });

  it('shows the Arabic name in an Arabic panel', () => {
    render(
      <BrowserRouter>
        <IntlProvider locale="ar">
          <ProgramListPage />
        </IntlProvider>
      </BrowserRouter>,
    );

    expect(screen.getByText('ARB')).toBeInTheDocument();
    expect(screen.getByText('أكاديمية أربيسوفت')).toBeInTheDocument();
    expect(screen.queryByText('Arbisoft Academy')).not.toBeInTheDocument();
  });
});
