/**
 * EnrollmentCodesPage: the superuser gate, the two tabs, and opening Uses narrowed to one code.
 * The tabs' content is stubbed, they have their own tests.
 */
import { fireEvent, screen } from '@testing-library/react';
import { renderWrapper } from '@src/setupTest';
import * as whoami from '@src/data/whoami';
import EnrollmentCodesPage from './EnrollmentCodesPage';

jest.mock('@src/data/whoami', () => ({ useAdminCapabilities: jest.fn() }));
jest.mock('./components/CodesList', () => ({
  __esModule: true,
  default: ({ onViewUses, onViewUsage }: {
    onViewUses: (code: { id: number; code: string }) => void;
    onViewUsage: (code: { id: number; code: string }) => void;
  }) => (
    <>
      <button type="button" onClick={() => onViewUses({ id: 4, code: 'ABC234' })}>codes list</button>
      <button type="button" onClick={() => onViewUsage({ id: 4, code: 'ABC234' })}>usage</button>
    </>
  ),
}));
jest.mock('./components/CodeUsagePanel', () => ({
  __esModule: true,
  default: ({ code }: { code: { code: string } | null }) => (code ? <div data-testid="usage-panel">{code.code}</div> : null),
}));
jest.mock('./components/UsesTab', () => ({
  __esModule: true,
  default: ({ codeId, codeLabel, onClearCode }: { codeId?: number; codeLabel?: string; onClearCode: () => void }) => (
    <div>
      <span data-testid="uses">{`uses ${codeId ?? 'all'} ${codeLabel ?? ''}`}</span>
      <button type="button" onClick={onClearCode}>clear code</button>
    </div>
  ),
}));

const asUser = (isSuperuser: boolean) => (whoami.useAdminCapabilities as jest.Mock).mockReturnValue({
  data: { isSuperuser }, isLoading: false,
});

beforeEach(() => {
  jest.clearAllMocks();
  window.history.pushState({}, '', '/enrollment-codes');
});

describe('EnrollmentCodesPage', () => {
  it('is for superusers only', () => {
    asUser(false);
    renderWrapper(<EnrollmentCodesPage />);
    expect(screen.getByText('Enrollment codes are visible to Rwaq superadmins only.')).toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: 'Codes' })).not.toBeInTheDocument();
  });

  it('shows the Codes and Uses tabs to a superuser, on Codes first', () => {
    asUser(true);
    renderWrapper(<EnrollmentCodesPage />);
    expect(screen.getByRole('heading', { name: 'Enrollment codes' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Codes' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'Uses' })).toHaveAttribute('aria-selected', 'false');
    expect(screen.getByText('codes list')).toBeInTheDocument();
  });

  it('opens Uses narrowed to the code, keeps it in the URL, and drops it when the tab is opened by hand', () => {
    asUser(true);
    renderWrapper(<EnrollmentCodesPage />);
    fireEvent.click(screen.getByText('codes list'));
    expect(window.location.search).toBe('?tab=uses&codeId=4&code=ABC234');
    expect(screen.getByTestId('uses')).toHaveTextContent('uses 4 ABC234');

    fireEvent.click(screen.getByRole('tab', { name: 'Codes' }));
    expect(window.location.search).toBe('');
    fireEvent.click(screen.getByRole('tab', { name: 'Uses' }));
    expect(screen.getByTestId('uses')).toHaveTextContent('uses all');
  });

  it('starts from the tab and code in the URL, and clears the code from the tab', () => {
    asUser(true);
    window.history.pushState({}, '', '/enrollment-codes?tab=uses&codeId=9&code=ZZZ999');
    renderWrapper(<EnrollmentCodesPage />);
    expect(screen.getByRole('tab', { name: 'Uses' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByTestId('uses')).toHaveTextContent('uses 9 ZZZ999');
    fireEvent.click(screen.getByRole('button', { name: 'clear code' }));
    expect(window.location.search).toBe('?tab=uses');
  });

  it('opens the usage panel of a code from the Codes tab', () => {
    asUser(true);
    renderWrapper(<EnrollmentCodesPage />);
    fireEvent.click(screen.getByRole('button', { name: 'usage' }));
    expect(screen.getByTestId('usage-panel')).toHaveTextContent('ABC234');
  });
});
