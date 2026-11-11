/**
 * The codes list: columns, filters sent to the backend, the row actions (delete only with no uses),
 * switching a code on or off, editing with the uses-so-far floor, and the fixed-item mode of the detail pages.
 */
import {
  fireEvent, screen, waitFor, within,
} from '@testing-library/react';
import { renderWrapper } from '@src/setupTest';
import * as courseHooks from '@src/modules/courses/data/hooks';
import * as programHooks from '@src/modules/programs/data/hooks';
import * as hooks from '../data/hooks';
import type { EnrollmentCode } from '../data/types';
import CodesList from './CodesList';

jest.mock('../data/hooks', () => ({
  useEnrollmentCodes: jest.fn(),
  useUpdateEnrollmentCode: jest.fn(),
  useCreateEnrollmentCode: jest.fn(),
  useDeleteEnrollmentCode: jest.fn(),
}));
jest.mock('@src/modules/courses/data/hooks', () => ({ useCourses: jest.fn() }));
jest.mock('@src/modules/programs/data/hooks', () => ({ usePrograms: jest.fn() }));
jest.mock('./ShareCardModal', () => ({
  __esModule: true,
  default: ({ codeId, isNew }: { codeId: number; isNew: boolean }) => (
    <div data-testid="share-modal" data-code-id={codeId} data-new={String(isNew)} />
  ),
}));
jest.mock('@src/components/ToastContext', () => {
  const showToast = jest.fn();
  return { useToast: () => ({ showToast }), mockShowToast: showToast };
});
jest.mock('@edx/frontend-platform/logging', () => ({ logError: jest.fn() }));

// eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
const { mockShowToast } = require('@src/components/ToastContext');

const COURSE_KEY = 'course-v1:ARB+SAFE+2026';
const PROGRAM_UUID = 'b6f1c2d3-0000-4000-8000-000000000001';

const makeCode = (overrides: Partial<EnrollmentCode> = {}): EnrollmentCode => ({
  id: 1,
  code: 'ABC234',
  item: {
    kind: 'course', id: COURSE_KEY, name: 'Safety basics', organization: 'ARB',
  },
  maxUses: 10,
  usesCount: 0,
  expiresAt: null,
  isActive: true,
  status: 'active',
  createdBy: 'admin',
  created: '2026-11-01T10:00:00Z',
  ...overrides,
});

const mockUpdate = jest.fn();
const mockDelete = jest.fn();
const onViewUses = jest.fn();

const withCodes = (...codes: EnrollmentCode[]) => (hooks.useEnrollmentCodes as jest.Mock).mockReturnValue({
  data: { results: codes, pagination: { count: codes.length, numPages: 1 } },
  isLoading: false,
  isPlaceholderData: false,
  isError: false,
  error: null,
  refetch: jest.fn(),
});

const lastParams = () => (hooks.useEnrollmentCodes as jest.Mock).mock.calls.at(-1)[0];
const rowOf = (code: string) => screen.getByText(code).closest('tr') as HTMLElement;

beforeEach(() => {
  jest.clearAllMocks();
  mockUpdate.mockResolvedValue({});
  mockDelete.mockResolvedValue(undefined);
  (hooks.useUpdateEnrollmentCode as jest.Mock).mockReturnValue({ mutateAsync: mockUpdate, isPending: false });
  (hooks.useDeleteEnrollmentCode as jest.Mock).mockReturnValue({ mutateAsync: mockDelete, isPending: false });
  (hooks.useCreateEnrollmentCode as jest.Mock).mockReturnValue({ mutateAsync: jest.fn(), isPending: false });
  (courseHooks.useCourses as jest.Mock).mockReturnValue({ data: { results: [] } });
  (programHooks.usePrograms as jest.Mock).mockReturnValue({ data: { results: [] } });
  withCodes(makeCode());
});

describe('CodesList', () => {
  it('shows the code, the item with a Course tag and a link to its page, creator, usage, expiry and status', () => {
    withCodes(
      makeCode({ usesCount: 3, maxUses: 10, expiresAt: '2026-12-31T00:00:00Z' }),
      makeCode({
        id: 2,
        code: 'RIYADH26',
        item: {
          kind: 'program', id: PROGRAM_UUID, name: 'Leadership', organization: 'ARB',
        },
        status: 'used_up',
        usesCount: 5,
        maxUses: 5,
        isActive: true,
      }),
    );
    renderWrapper(<CodesList onViewUses={onViewUses} />);

    const first = within(rowOf('ABC234'));
    expect(first.getByRole('link', { name: 'Safety basics' })).toHaveAttribute('href', `/courses/${encodeURIComponent(COURSE_KEY)}`);
    expect(first.getByText('Course')).toBeInTheDocument();
    expect(first.getByText('admin')).toBeInTheDocument();
    expect(first.getByText('3 / 10')).toBeInTheDocument();
    expect(first.getByText('Dec 31, 2026')).toBeInTheDocument();
    expect(first.getByText('Active')).toBeInTheDocument();

    const second = within(rowOf('RIYADH26'));
    expect(second.getByRole('link', { name: 'Leadership' })).toHaveAttribute('href', `/programs/${PROGRAM_UUID}`);
    expect(second.getByText('Program')).toBeInTheDocument();
    expect(second.getByText('Never')).toBeInTheDocument();
    expect(second.getByText('Used up')).toBeInTheDocument();
  });

  it('copies a code from its copy icon', async () => {
    const writeText = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
    renderWrapper(<CodesList onViewUses={onViewUses} />);
    fireEvent.click(screen.getByRole('button', { name: 'Copy code ABC234' }));
    await waitFor(() => expect(writeText).toHaveBeenCalledWith('ABC234'));
    expect(mockShowToast).toHaveBeenCalledWith('Code copied.');
  });

  it('sends the status, type and search filters to the backend', () => {
    renderWrapper(<CodesList onViewUses={onViewUses} />);
    fireEvent.click(screen.getByRole('button', { name: 'Filters' }));
    fireEvent.change(screen.getByLabelText('Status'), { target: { value: 'expired' } });
    fireEvent.change(screen.getByLabelText('Course or program'), { target: { value: 'program' } });
    expect(lastParams()).toMatchObject({
      status: 'expired', kind: 'program', page: 1, pageSize: 10,
    });
    expect(screen.getByText('Status: Expired')).toBeInTheDocument();
    expect(screen.getByText('Type: Program')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Clear all' }));
    expect(lastParams().status).toBeUndefined();
    expect(lastParams().kind).toBeUndefined();
  });

  it('offers the four statuses', () => {
    renderWrapper(<CodesList onViewUses={onViewUses} />);
    fireEvent.click(screen.getByRole('button', { name: 'Filters' }));
    const options = Array.from((screen.getByLabelText('Status') as HTMLSelectElement).options).map((o) => o.textContent);
    expect(options).toEqual(['All', 'Active', 'Switched off', 'Expired', 'Used up']);
  });

  it('offers delete only for a code with no uses', () => {
    withCodes(makeCode({ usesCount: 0 }), makeCode({ id: 2, code: 'USED23', usesCount: 2 }));
    renderWrapper(<CodesList onViewUses={onViewUses} />);
    expect(within(rowOf('ABC234')).getByRole('button', { name: 'Delete' })).toBeInTheDocument();
    expect(within(rowOf('USED23')).queryByRole('button', { name: 'Delete' })).not.toBeInTheDocument();
    // The other actions are always there.
    ['View card', 'View uses', 'Switch off', 'Edit'].forEach((name) => {
      expect(within(rowOf('USED23')).getByRole('button', { name })).toBeInTheDocument();
    });
  });

  it('asks before deleting and then deletes', async () => {
    renderWrapper(<CodesList onViewUses={onViewUses} />);
    fireEvent.click(within(rowOf('ABC234')).getByRole('button', { name: 'Delete' }));
    expect(screen.getByText('Delete the code ABC234? It has no uses. This cannot be undone.')).toBeInTheDocument();
    expect(mockDelete).not.toHaveBeenCalled();
    fireEvent.click(screen.getAllByRole('button', { name: 'Delete' }).at(-1) as HTMLElement);
    await waitFor(() => expect(mockDelete).toHaveBeenCalledWith(1));
    expect(mockShowToast).toHaveBeenCalledWith('Code ABC234 deleted.');
  });

  it('shows the backend refusal when a delete is refused', async () => {
    mockDelete.mockRejectedValue({ response: { status: 409, data: { detail: 'This code has been used.' } } });
    renderWrapper(<CodesList onViewUses={onViewUses} />);
    fireEvent.click(within(rowOf('ABC234')).getByRole('button', { name: 'Delete' }));
    fireEvent.click(screen.getAllByRole('button', { name: 'Delete' }).at(-1) as HTMLElement);
    expect(await screen.findByText('This code has been used.')).toBeInTheDocument();
  });

  it('switches a code off and on', async () => {
    withCodes(makeCode({ isActive: true }), makeCode({
      id: 2, code: 'OFF234', isActive: false, status: 'switched_off',
    }));
    renderWrapper(<CodesList onViewUses={onViewUses} />);
    fireEvent.click(within(rowOf('ABC234')).getByRole('button', { name: 'Switch off' }));
    await waitFor(() => expect(mockUpdate).toHaveBeenCalledWith({ id: 1, patch: { isActive: false } }));
    expect(mockShowToast).toHaveBeenCalledWith('Code ABC234 is switched off.');
    fireEvent.click(within(rowOf('OFF234')).getByRole('button', { name: 'Switch on' }));
    await waitFor(() => expect(mockUpdate).toHaveBeenCalledWith({ id: 2, patch: { isActive: true } }));
  });

  it('opens the Uses view for the code', () => {
    renderWrapper(<CodesList onViewUses={onViewUses} />);
    fireEvent.click(within(rowOf('ABC234')).getByRole('button', { name: 'View uses' }));
    expect(onViewUses).toHaveBeenCalledWith(expect.objectContaining({ id: 1, code: 'ABC234' }));
  });

  it('reopens the card from the list, not marked as new', async () => {
    renderWrapper(<CodesList onViewUses={onViewUses} />);
    fireEvent.click(within(rowOf('ABC234')).getByRole('button', { name: 'View card' }));
    const modal = await screen.findByTestId('share-modal');
    expect(modal).toHaveAttribute('data-code-id', '1');
    expect(modal).toHaveAttribute('data-new', 'false');
  });

  describe('editing', () => {
    const openEdit = (code = makeCode({ usesCount: 4, maxUses: 10, expiresAt: '2026-12-31T00:00:00Z' })) => {
      withCodes(code);
      renderWrapper(<CodesList onViewUses={onViewUses} />);
      fireEvent.click(within(rowOf(code.code)).getByRole('button', { name: 'Edit' }));
    };

    it('shows the code and the item read-only', () => {
      openEdit();
      expect(screen.getByLabelText('Code')).toHaveAttribute('readonly');
      expect(screen.getByText('The code and the course or program cannot be changed.')).toBeInTheDocument();
      expect(screen.getByText('Used so far: 4')).toBeInTheDocument();
    });

    it('refuses a limit below the uses so far, in the form', async () => {
      openEdit();
      fireEvent.change(screen.getByLabelText('Number of uses'), { target: { value: '3' } });
      fireEvent.click(screen.getByRole('button', { name: 'Save' }));
      expect(await screen.findByText('The limit cannot be below the 4 uses already made.')).toBeInTheDocument();
      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it('sends only what changed: the limit, the cleared expiry and the switch', async () => {
      openEdit();
      fireEvent.change(screen.getByLabelText('Number of uses'), { target: { value: '25' } });
      fireEvent.change(screen.getByLabelText('Expires on (optional)'), { target: { value: '' } });
      fireEvent.click(screen.getByLabelText('Code is on'));
      fireEvent.click(screen.getByRole('button', { name: 'Save' }));
      await waitFor(() => expect(mockUpdate).toHaveBeenCalledWith({
        id: 1, patch: { maxUses: 25, expiresAt: null, isActive: false },
      }));
    });

    it('shows a backend refusal on its field', async () => {
      mockUpdate.mockRejectedValue({
        response: { status: 400, data: { detail: 'Limit is below uses.', field: 'max_uses' } },
      });
      openEdit();
      fireEvent.change(screen.getByLabelText('Number of uses'), { target: { value: '5' } });
      fireEvent.click(screen.getByRole('button', { name: 'Save' }));
      const message = await screen.findByText('Limit is below uses.');
      expect(message.closest('.pgn__form-group')).toContainElement(screen.getByLabelText('Number of uses'));
    });
  });

  describe('on a course or program page', () => {
    it('lists only that item, with no item column or type filter', () => {
      renderWrapper(
        <CodesList
          item={{ kind: 'course', id: COURSE_KEY, name: 'Safety basics' }}
          onViewUses={onViewUses}
        />,
      );
      expect(lastParams()).toMatchObject({ courseId: COURSE_KEY });
      expect(lastParams().programUuid).toBeUndefined();
      expect(screen.queryByRole('columnheader', { name: 'Course or program' })).not.toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: 'Filters' }));
      expect(screen.queryByLabelText('Course or program')).not.toBeInTheDocument();
    });

    it('filters a program by its UUID and preselects it in the create form', () => {
      renderWrapper(
        <CodesList
          item={{ kind: 'program', id: PROGRAM_UUID, name: 'Leadership' }}
          onViewUses={onViewUses}
        />,
      );
      expect(lastParams()).toMatchObject({ programUuid: PROGRAM_UUID });
      fireEvent.click(screen.getByRole('button', { name: 'Create code' }));
      expect(screen.getByRole('heading', { name: 'Create enrollment code' })).toBeInTheDocument();
      expect(screen.queryByLabelText('Course or program')).not.toBeInTheDocument();
      expect(screen.getAllByText('Leadership').length).toBeGreaterThan(0);
    });
  });

  it('opens the card for a new code right after it is created', async () => {
    const created = jest.fn().mockResolvedValue({ id: 42, code: 'NEW234' });
    (hooks.useCreateEnrollmentCode as jest.Mock).mockReturnValue({ mutateAsync: created, isPending: false });
    renderWrapper(
      <CodesList item={{ kind: 'course', id: COURSE_KEY, name: 'Safety basics' }} onViewUses={onViewUses} />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Create code' }));
    fireEvent.click(screen.getByRole('button', { name: 'Create' }));
    const modal = await screen.findByTestId('share-modal');
    expect(modal).toHaveAttribute('data-code-id', '42');
    expect(modal).toHaveAttribute('data-new', 'true');
  });

  it('shows an error state when the list fails to load', () => {
    (hooks.useEnrollmentCodes as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: false,
      isPlaceholderData: false,
      isError: true,
      error: { response: { status: 500 } },
      refetch: jest.fn(),
    });
    renderWrapper(<CodesList onViewUses={onViewUses} />);
    expect(screen.getByText('Could not load enrollment codes.')).toBeInTheDocument();
  });
});
