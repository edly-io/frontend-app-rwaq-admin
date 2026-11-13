/**
 * EnrollmentCodesPage: the superuser gate, the two tabs, and opening Uses narrowed to one code.
 * The tabs' content is stubbed, they have their own tests.
 */
import { fireEvent, screen } from '@testing-library/react';
import { renderWrapper } from '@src/setupTest';
import * as whoami from '@src/data/whoami';
import * as courseHooks from '@src/modules/courses/data/hooks';
import * as programHooks from '@src/modules/programs/data/hooks';
import EnrollmentCodesPage from './EnrollmentCodesPage';
import * as codeHooks from './data/hooks';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));
jest.mock('./data/hooks', () => ({ useEnrollmentCode: jest.fn() }));
jest.mock('@src/data/whoami', () => ({ useAdminCapabilities: jest.fn() }));
jest.mock('@src/modules/courses/data/hooks', () => ({ useCourse: jest.fn() }));
jest.mock('@src/modules/programs/data/hooks', () => ({ useProgram: jest.fn() }));
jest.mock('./components/CodesList', () => ({
  __esModule: true,
  default: ({
    onViewUses, onViewUsage, prefillItem, onPrefillHandled,
  }: {
    onViewUses: (code: { id: number; code: string }) => void;
    onViewUsage: (code: { id: number; code: string }) => void;
    prefillItem?: { kind: string; id: string; name: string };
    onPrefillHandled?: () => void;
  }) => (
    <>
      {prefillItem && (
        <button type="button" data-testid="create-form" onClick={onPrefillHandled}>
          {`${prefillItem.kind}|${prefillItem.id}|${prefillItem.name}`}
        </button>
      )}
      <button type="button" onClick={() => onViewUses({ id: 4, code: 'ABC234' })}>codes list</button>
      <button type="button" onClick={() => onViewUsage({ id: 4, code: 'ABC234' })}>usage</button>
    </>
  ),
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
  (codeHooks.useEnrollmentCode as jest.Mock).mockReturnValue({ data: { id: 4, code: 'ABC234' } });
  (courseHooks.useCourse as jest.Mock).mockReturnValue({ data: undefined, isSuccess: false, isError: false });
  (programHooks.useProgram as jest.Mock).mockReturnValue({ data: undefined, isSuccess: false, isError: false });
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

  it('opens the usage page of a code from the Codes tab', () => {
    asUser(true);
    renderWrapper(<EnrollmentCodesPage />);
    fireEvent.click(screen.getByRole('button', { name: 'usage' }));
    expect(mockNavigate).toHaveBeenCalledWith('/enrollment-codes/4/usage');
  });

  it('has two tabs and falls back to Codes for an old tab=usage link', () => {
    asUser(true);
    window.history.pushState({}, '', '/?tab=usage');
    renderWrapper(<EnrollmentCodesPage />);
    expect(screen.queryByRole('tab', { name: 'Code usage' })).not.toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Uses' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Codes' })).toHaveAttribute('aria-selected', 'true');
  });

  describe('opening the create form from a link', () => {
    it('pre-fills a course, and clears the params from the URL', () => {
      asUser(true);
      (courseHooks.useCourse as jest.Mock).mockImplementation((id: string) => (
        id ? { data: { displayName: 'Safety basics' }, isSuccess: true, isError: false }
          : { data: undefined, isSuccess: false, isError: false }
      ));
      window.history.pushState({}, '', '/enrollment-codes?create=1&scope=course&id=course-v1%3AARB%2BSAFE%2B2026');
      renderWrapper(<EnrollmentCodesPage />);
      expect(screen.getByTestId('create-form')).toHaveTextContent('course|course-v1:ARB+SAFE+2026|Safety basics');
      expect(window.location.search).toBe('');
      expect(courseHooks.useCourse).toHaveBeenCalledWith('course-v1:ARB+SAFE+2026');
    });

    it('pre-fills a program', () => {
      asUser(true);
      (programHooks.useProgram as jest.Mock).mockImplementation((id: string) => (
        id ? { data: { name: 'Leadership' }, isSuccess: true, isError: false }
          : { data: undefined, isSuccess: false, isError: false }
      ));
      window.history.pushState({}, '', '/enrollment-codes?create=1&scope=program&id=uuid-1');
      renderWrapper(<EnrollmentCodesPage />);
      expect(screen.getByTestId('create-form')).toHaveTextContent('program|uuid-1|Leadership');
      expect(window.location.search).toBe('');
    });

    it('forgets the request once the form was opened, and opens nothing without a valid link', () => {
      asUser(true);
      (programHooks.useProgram as jest.Mock).mockImplementation((id: string) => (
        id ? { data: { name: 'Leadership' }, isSuccess: true, isError: false }
          : { data: undefined, isSuccess: false, isError: false }
      ));
      window.history.pushState({}, '', '/enrollment-codes?create=1&scope=program&id=uuid-1');
      renderWrapper(<EnrollmentCodesPage />);
      fireEvent.click(screen.getByTestId('create-form'));
      expect(screen.queryByTestId('create-form')).not.toBeInTheDocument();
    });

    it('ignores a link with no item or an unknown scope', () => {
      asUser(true);
      window.history.pushState({}, '', '/enrollment-codes?create=1&scope=organization&id=Edrakk');
      renderWrapper(<EnrollmentCodesPage />);
      expect(screen.queryByTestId('create-form')).not.toBeInTheDocument();
    });
  });
});
