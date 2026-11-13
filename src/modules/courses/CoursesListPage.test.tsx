/**
 * CoursesListPage — the "Course Started at" period and the CSV button.
 *
 * The data hook is mocked, as in the payments test, so this runs without a
 * QueryClient or network. The CSV button is stubbed to show what it would send.
 */
import { fireEvent, render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { renderWrapper } from '@src/setupTest';
import * as hooks from './data/hooks';
import CoursesListPage from './CoursesListPage';

jest.mock('./data/hooks', () => ({ useCourses: jest.fn() }));
jest.mock('./components/CourseListStatsStrip', () => ({ __esModule: true, default: () => null }));
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

const lastCall = () => (hooks.useCourses as jest.Mock).mock.calls.at(-1)[0];
const csvParams = () => JSON.parse(screen.getByTestId('csv').dataset.params as string);

const COURSE = {
  courseId: 'course-v1:ARB+AI101+2026',
  displayName: 'Intro to AI',
  org: 'ARB',
  organizationName: 'Arbisoft Academy',
  organizationArabicName: 'أكاديمية أربيسوفت',
  courseImageUrl: null,
  start: null,
  end: null,
  categories: [
    { slug: 'tech', name: 'Technology', arabicName: 'التقنية' },
    { slug: 'misc', name: 'Misc', arabicName: '' },
  ],
  enrollmentCount: 0,
  unenrolledCount: 0,
};

const withCourses = (...courses: object[]) => (hooks.useCourses as jest.Mock).mockReturnValue({
  data: { results: courses, pagination: { count: courses.length, numPages: 1 } },
  isLoading: false,
  isError: false,
  error: null,
  refetch: jest.fn(),
});

describe('CoursesListPage organization column', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.history.pushState({}, '', '/');
  });

  it('shows the English name in English, the code when the organization has no name', () => {
    withCourses(COURSE, {
      ...COURSE, courseId: 'course-v1:ZZZ+X+1', displayName: 'Other', org: 'ZZZ', organizationName: null,
    });
    renderWrapper(<CoursesListPage />);

    expect(screen.getByText('Arbisoft Academy')).toBeInTheDocument();
    expect(screen.queryByText('أكاديمية أربيسوفت')).not.toBeInTheDocument();
    expect(screen.getByText('ZZZ')).toBeInTheDocument();
    expect(screen.getAllByText('Technology')).not.toHaveLength(0);
    expect(screen.queryByText('التقنية')).not.toBeInTheDocument();
  });

  it('shows the Arabic name in an Arabic panel, the English name when there is none', () => {
    withCourses(COURSE, {
      ...COURSE, courseId: 'course-v1:ARB+B+1', displayName: 'Second', organizationArabicName: '',
    });
    render(
      <BrowserRouter>
        <IntlProvider locale="ar">
          <CoursesListPage />
        </IntlProvider>
      </BrowserRouter>,
    );

    expect(screen.getByText('أكاديمية أربيسوفت')).toBeInTheDocument();
    expect(screen.getByText('Arbisoft Academy')).toBeInTheDocument();
    // Categories follow the same rule: Arabic when there is one, else English.
    expect(screen.getAllByText('التقنية')).not.toHaveLength(0);
    expect(screen.queryByText('Technology')).not.toBeInTheDocument();
    expect(screen.getAllByText('Misc')).not.toHaveLength(0);
  });
});

describe('CoursesListPage organization filter', () => {
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

  it('offers every organization by name, with All organizations first', () => {
    renderWrapper(<CoursesListPage />);

    const options = Array.from((screen.getByLabelText('Organization') as HTMLSelectElement).options);
    expect(options.map((option) => option.textContent)).toEqual(['All organizations', 'QA Org', 'QA Org Two']);
    expect(lastCall().org).toBeUndefined();
  });

  it('filters the list and the CSV by the chosen organization, and keeps it in the URL', () => {
    renderWrapper(<CoursesListPage />);

    fireEvent.click(screen.getByRole('button', { name: 'Filters' }));
    fireEvent.change(screen.getByLabelText('Organization'), { target: { value: 'QAOrg' } });

    expect(window.location.search).toBe('?org=QAOrg');
    expect(lastCall().org).toBe('QAOrg');
    expect(csvParams()).toMatchObject({ org: 'QAOrg' });
    expect(screen.getByText('Organization: QAOrg')).toBeInTheDocument();
  });

  it('offers the Enrollment code type and sends course_type=enrollment_code to the list and the CSV', () => {
    renderWrapper(<CoursesListPage />);

    fireEvent.click(screen.getByRole('button', { name: 'Filters' }));
    const select = screen.getByLabelText('Type') as HTMLSelectElement;
    expect(Array.from(select.options).map((option) => option.textContent)).toContain('Enrollment code');
    fireEvent.change(select, { target: { value: 'enrollment_code' } });

    expect(window.location.search).toBe('?type=enrollment_code');
    expect(lastCall().courseType).toBe('enrollment_code');
    expect(csvParams()).toMatchObject({ courseType: 'enrollment_code' });
    expect(screen.getByText('Type: Enrollment code')).toBeInTheDocument();
  });

  it('starts from the organization in the URL, and clears it with its chip or Clear all', () => {
    window.history.pushState({}, '', '/?org=QAOrg2&page=2');
    renderWrapper(<CoursesListPage />);

    expect((screen.getByLabelText('Organization') as HTMLSelectElement).value).toBe('QAOrg2');
    expect(lastCall().org).toBe('QAOrg2');

    fireEvent.click(screen.getByRole('button', { name: /Remove Organization/ }));

    expect(window.location.search).toBe('');
    expect(lastCall().org).toBeUndefined();
  });
});

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

    expect(screen.getByRole('button', { name: /^Started at/ })).toBeInTheDocument();
    expect(screen.queryByText(/All time/)).not.toBeInTheDocument();
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
