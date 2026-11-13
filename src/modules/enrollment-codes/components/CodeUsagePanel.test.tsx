/**
 * The usage panel of a code: "Used n of max" counted in learners, what is left, the items joined, what an
 * organization code covers, the per-item table, and the learners list narrowed to the code.
 */
import { screen, within } from '@testing-library/react';
import { renderWrapper } from '@src/setupTest';
import * as hooks from '../data/hooks';
import type { EnrollmentCode } from '../data/types';
import CodeUsagePanel from './CodeUsagePanel';

jest.mock('../data/hooks', () => ({ useCodeItems: jest.fn() }));
jest.mock('./UsesTab', () => ({
  __esModule: true,
  default: ({ codeId, codeLabel }: { codeId?: number; codeLabel?: string }) => (
    <div data-testid="uses-tab">{`uses of ${codeId} ${codeLabel}`}</div>
  ),
}));

const orgCode: EnrollmentCode = {
  id: 9,
  code: 'EDR100',
  scope: 'organization',
  item: {
    kind: 'organization', id: 'Edrakk', name: 'Edrakk', organization: 'Edrakk',
  },
  maxUses: 100,
  usesCount: 37,
  itemsJoinedCount: 51,
  coveredItemsCount: 4,
  expiresAt: '2026-12-31T00:00:00Z',
  isActive: true,
  status: 'active',
  createdBy: 'admin',
  created: '2026-11-01T10:00:00Z',
};

const items = [
  {
    kind: 'course', id: 'course-v1:Edrakk+A+2026', name: 'Course A', learnersJoined: 30,
  },
  {
    kind: 'program', id: 'uuid-7', name: 'Program B', learnersJoined: 21,
  },
];

beforeEach(() => {
  jest.clearAllMocks();
  (hooks.useCodeItems as jest.Mock).mockReturnValue({ data: items, isLoading: false, isError: false });
});

describe('CodeUsagePanel', () => {
  it('stays closed with no code and asks for no items', () => {
    renderWrapper(<CodeUsagePanel code={null} onClose={jest.fn()} />);
    expect(screen.queryByTestId('code-usage-summary')).not.toBeInTheDocument();
    expect(hooks.useCodeItems).toHaveBeenLastCalledWith(null);
  });

  it('shows the header numbers of an organization code', () => {
    renderWrapper(<CodeUsagePanel code={orgCode} onClose={jest.fn()} />);
    expect(screen.getByRole('heading', { name: 'Details of EDR100' })).toBeInTheDocument();
    const summary = within(screen.getByTestId('code-usage-summary'));
    expect(summary.getByText('Used 37 of 100')).toBeInTheDocument();
    expect(summary.getByText('63')).toBeInTheDocument();
    expect(summary.getByText('51')).toBeInTheDocument();
    expect(summary.getByText('Dec 31, 2026')).toBeInTheDocument();
    expect(summary.getByText(/Covers 4 courses and programs/)).toBeInTheDocument();
    expect(hooks.useCodeItems).toHaveBeenLastCalledWith(9);
  });

  it('says Never for a code with no expiry and does not claim to cover items for a course code', () => {
    renderWrapper(<CodeUsagePanel
      code={{
        ...orgCode, scope: 'course', expiresAt: null, coveredItemsCount: undefined, usesCount: 100,
      }}
      onClose={jest.fn()}
    />);
    const summary = within(screen.getByTestId('code-usage-summary'));
    expect(summary.getByText(/Never/)).toBeInTheDocument();
    expect(summary.getByText('0')).toBeInTheDocument();
    expect(summary.queryByText(/Covers/)).not.toBeInTheDocument();
  });

  it('lists each covered item with its type and the learners who joined it', () => {
    renderWrapper(<CodeUsagePanel code={orgCode} onClose={jest.fn()} />);
    const courseRow = screen.getByRole('link', { name: 'Course A' }).closest('tr') as HTMLElement;
    expect(courseRow).toHaveTextContent('Course');
    expect(courseRow).toHaveTextContent('30');
    const programRow = screen.getByRole('link', { name: 'Program B' }).closest('tr') as HTMLElement;
    expect(within(programRow).getByRole('link', { name: 'Program B' })).toHaveAttribute('href', '/programs/uuid-7');
    expect(programRow).toHaveTextContent('21');
  });

  it('says so when no item is covered yet, and when the items fail to load', () => {
    (hooks.useCodeItems as jest.Mock).mockReturnValue({ data: [], isLoading: false, isError: false });
    const { unmount } = renderWrapper(<CodeUsagePanel code={orgCode} onClose={jest.fn()} />);
    expect(screen.getByText('No Enrollment code course or program is covered yet.')).toBeInTheDocument();
    unmount();
    (hooks.useCodeItems as jest.Mock).mockReturnValue({ data: undefined, isLoading: false, isError: true });
    renderWrapper(<CodeUsagePanel code={orgCode} onClose={jest.fn()} />);
    expect(screen.getByText('Could not load the courses and programs.')).toBeInTheDocument();
  });

  it('opens the uses of this code', () => {
    const onClose = jest.fn();
    renderWrapper(<CodeUsagePanel code={orgCode} onClose={onClose} />);
    screen.getByRole('button', { name: 'View uses' }).click();
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
