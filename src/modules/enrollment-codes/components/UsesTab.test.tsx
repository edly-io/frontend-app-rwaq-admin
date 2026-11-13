/**
 * The Uses tab: who joined with which code, the filters (code, item, organization, scope, dates, student), the
 * CSV with the same filters, the scope, organization and typed-here columns, and the code a Codes row narrowed it to.
 */
import { fireEvent, screen } from '@testing-library/react';
import { renderWrapper } from '@src/setupTest';
import * as courseHooks from '@src/modules/courses/data/hooks';
import * as orgHooks from '@src/modules/organizations/data/hooks';
import * as programHooks from '@src/modules/programs/data/hooks';
import * as hooks from '../data/hooks';
import type { CodeUse } from '../data/types';
import UsesTab from './UsesTab';

jest.mock('../data/hooks', () => ({ useEnrollmentCodeUses: jest.fn() }));
jest.mock('@src/modules/courses/data/hooks', () => ({ useCourses: jest.fn() }));
jest.mock('@src/modules/programs/data/hooks', () => ({ usePrograms: jest.fn() }));
jest.mock('@src/modules/organizations/data/hooks', () => ({ useOrgFilterOptions: jest.fn() }));
jest.mock('@src/modules/dashboard/components/DateRangePicker', () => ({
  __esModule: true,
  default: ({ onChange }: { onChange: (from?: string, to?: string) => void }) => (
    <button type="button" onClick={() => onChange('2026-11-01', '2026-11-30')}>Pick dates</button>
  ),
}));
jest.mock('@src/components/CsvDownloadButton', () => ({
  __esModule: true,
  default: ({ url, params, fallbackName }: { url: string; params: object; fallbackName: string }) => (
    <button
      type="button"
      data-testid="csv"
      data-url={url}
      data-name={fallbackName}
      data-params={JSON.stringify(params)}
    >
      csv
    </button>
  ),
}));
jest.mock('@edx/frontend-platform', () => {
  const actual = jest.requireActual('@edx/frontend-platform');
  return { ...actual, getConfig: jest.fn(() => ({ STUDIO_BASE_URL: 'http://studio.local:8001' })) };
});

const COURSE_KEY = 'course-v1:ARB+SAFE+2026';

const USE: CodeUse = {
  id: 1,
  student: {
    id: 7, name: 'Sara Ali', username: 'sara', email: 'sara@example.com',
  },
  code: 'ABC234',
  codeId: 4,
  item: { kind: 'course', id: COURSE_KEY, name: 'Safety basics' },
  usedAt: '2026-11-02T08:30:00Z',
  stillEnrolled: true,
  enteredCode: true,
  scope: 'course',
  organization: 'Arbisoft',
};

const withUses = (...uses: CodeUse[]) => (hooks.useEnrollmentCodeUses as jest.Mock).mockReturnValue({
  data: { results: uses, pagination: { count: uses.length, numPages: 1 } },
  isLoading: false,
  isPlaceholderData: false,
  isError: false,
  error: null,
  refetch: jest.fn(),
});

const lastParams = () => (hooks.useEnrollmentCodeUses as jest.Mock).mock.calls.at(-1)[0];
const csvParams = () => JSON.parse(screen.getByTestId('csv').dataset.params as string);

beforeEach(() => {
  jest.clearAllMocks();
  (courseHooks.useCourses as jest.Mock).mockReturnValue({
    data: { results: [{ courseId: COURSE_KEY, displayName: 'Safety basics' }] },
  });
  (programHooks.usePrograms as jest.Mock).mockReturnValue({ data: { results: [] } });
  (orgHooks.useOrgFilterOptions as jest.Mock).mockReturnValue([
    { value: 'Edrakk', label: 'Edrakk' }, { value: 'ARB', label: 'Arbisoft' },
  ]);
  withUses(USE, {
    ...USE,
    id: 2,
    code: 'RIYADH26',
    codeId: 5,
    stillEnrolled: false,
    enteredCode: false,
    scope: 'organization',
    organization: 'Edrakk',
    student: {
      id: 8, name: '', username: 'omar', email: 'omar@example.com',
    },
    item: { kind: 'program', id: 'uuid-1', name: 'Leadership' },
  });
});

describe('UsesTab', () => {
  it('shows the student with a link, the code, the item with its tag, the date and whether still enrolled', () => {
    renderWrapper(<UsesTab onClearCode={jest.fn()} />);
    const first = screen.getByText('ABC234').closest('tr') as HTMLElement;
    expect(first).toHaveTextContent('Sara Ali');
    expect(first.querySelector('a[href="/users/7"]')).toHaveTextContent('Sara Ali');
    expect(first).toHaveTextContent('sara · sara@example.com');
    expect(first.querySelector(`a[href="/courses/${encodeURIComponent(COURSE_KEY)}"]`)).toHaveTextContent('Safety basics');
    expect(first).toHaveTextContent('Course');
    expect(first).toHaveTextContent('Nov 2, 2026');
    expect(first).toHaveTextContent('Still enrolled');

    const second = screen.getByText('RIYADH26').closest('tr') as HTMLElement;
    expect(second.querySelector('a[href="/users/8"]')).toHaveTextContent('omar');
    expect(second.querySelector('a[href="/programs/uuid-1"]')).toHaveTextContent('Leadership');
    expect(second).toHaveTextContent('Program');
    expect(second).toHaveTextContent('Left');
  });

  it('shows the scope, the organization and whether the learner typed the code here', () => {
    renderWrapper(<UsesTab onClearCode={jest.fn()} />);
    ['Scope', 'Organization', 'Typed the code here'].forEach((name) => {
      expect(screen.getByRole('columnheader', { name })).toBeInTheDocument();
    });
    const first = screen.getByText('ABC234').closest('tr') as HTMLElement;
    expect(first).toHaveTextContent('Arbisoft');
    expect(first).toHaveTextContent('Yes');
    const second = screen.getByText('RIYADH26').closest('tr') as HTMLElement;
    expect(second).toHaveTextContent('Organization');
    expect(second).toHaveTextContent('Edrakk');
    expect(second).toHaveTextContent('No');
  });

  it('filters by organization and scope, and the CSV follows', () => {
    renderWrapper(<UsesTab onClearCode={jest.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Filters' }));
    fireEvent.change(screen.getByLabelText('Organization'), { target: { value: 'Edrakk' } });
    fireEvent.change(screen.getByLabelText('Scope'), { target: { value: 'organization' } });
    expect(lastParams()).toMatchObject({ organization: 'Edrakk', scope: 'organization', page: 1 });
    expect(csvParams()).toMatchObject({ organization: 'Edrakk', scope: 'organization' });
    expect(screen.getByText('Organization: Edrakk')).toBeInTheDocument();
    expect(screen.getByText('Scope: Organization')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Clear all' }));
    expect(lastParams().organization).toBeUndefined();
    expect(lastParams().scope).toBeUndefined();
  });

  it('lists every use until a filter is set', () => {
    renderWrapper(<UsesTab onClearCode={jest.fn()} />);
    expect(lastParams()).toEqual({
      codeId: undefined,
      code: undefined,
      courseId: undefined,
      programUuid: undefined,
      organization: undefined,
      scope: undefined,
      startDate: undefined,
      endDate: undefined,
      search: undefined,
      page: 1,
      pageSize: 10,
    });
  });

  it('narrows to the code a Codes row opened it with, and clears it from its chip', () => {
    const onClearCode = jest.fn();
    renderWrapper(<UsesTab codeId={4} codeLabel="ABC234" onClearCode={onClearCode} />);
    expect(lastParams().codeId).toBe(4);
    expect(csvParams()).toMatchObject({ codeId: 4 });
    expect(screen.getByText('Code: ABC234')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Code: ABC234/ }));
    expect(onClearCode).toHaveBeenCalled();
  });

  it('filters by the student search, the course or program and the dates, and the CSV follows', () => {
    renderWrapper(<UsesTab onClearCode={jest.fn()} />);

    fireEvent.change(screen.getByPlaceholderText('Search by student name, username or email'), {
      target: { value: 'sara' },
    });
    fireEvent.submit(screen.getByPlaceholderText('Search by student name, username or email').closest('form') as HTMLElement);
    fireEvent.change(screen.getByLabelText('Course or program'), { target: { value: `course:${COURSE_KEY}` } });
    fireEvent.click(screen.getByRole('button', { name: 'Pick dates' }));

    expect(lastParams()).toMatchObject({
      search: 'sara', courseId: COURSE_KEY, startDate: '2026-11-01', endDate: '2026-11-30', page: 1,
    });
    expect(csvParams()).toMatchObject({
      search: 'sara', courseId: COURSE_KEY, startDate: '2026-11-01', endDate: '2026-11-30',
    });
    expect(screen.getByText('Item: Safety basics')).toBeInTheDocument();
  });

  it('sends the code text filter after typing stops, uppercased', async () => {
    jest.useFakeTimers();
    renderWrapper(<UsesTab onClearCode={jest.fn()} />);
    fireEvent.change(screen.getByPlaceholderText('Part of a code'), { target: { value: 'abc' } });
    expect(screen.getByPlaceholderText('Part of a code')).toHaveValue('ABC');
    expect(lastParams().code).toBeUndefined();
    await jest.advanceTimersByTimeAsync(400);
    expect(lastParams().code).toBe('ABC');
    jest.useRealTimers();
  });

  it('downloads the uses CSV from its endpoint', () => {
    renderWrapper(<UsesTab onClearCode={jest.fn()} />);
    const csv = screen.getByTestId('csv');
    expect(csv.dataset.url).toBe('http://studio.local:8001/api/v1/admin/enrollment-codes/uses/csv/');
    expect(csv.dataset.name).toBe('enrollment_code_uses');
  });

  it('shows an error state when the list fails to load', () => {
    (hooks.useEnrollmentCodeUses as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: false,
      isPlaceholderData: false,
      isError: true,
      error: { response: { status: 500 } },
      refetch: jest.fn(),
    });
    renderWrapper(<UsesTab onClearCode={jest.fn()} />);
    expect(screen.getByText('Could not load enrollment codes.')).toBeInTheDocument();
  });
});
