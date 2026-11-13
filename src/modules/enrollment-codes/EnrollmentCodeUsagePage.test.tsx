import { fireEvent, screen } from '@testing-library/react';
import { renderWrapper } from '@src/setupTest';
import * as whoami from '@src/data/whoami';
import * as hooks from './data/hooks';
import EnrollmentCodeUsagePage from './EnrollmentCodeUsagePage';

const mockNavigate = jest.fn();
jest.mock('@src/data/whoami', () => ({ useAdminCapabilities: jest.fn() }));
jest.mock('./data/hooks', () => ({ useEnrollmentCode: jest.fn() }));
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ id: '9' }),
  useNavigate: () => mockNavigate,
}));
jest.mock('./components/CodeUsagePanel', () => ({
  __esModule: true,
  default: ({ code }: { code: { code: string } }) => <div>{code.code}</div>,
}));

describe('EnrollmentCodeUsagePage', () => {
  it('blocks other users without requesting the code', () => {
    (whoami.useAdminCapabilities as jest.Mock).mockReturnValue({ data: { isSuperuser: false } });
    renderWrapper(<EnrollmentCodeUsagePage />);
    expect(hooks.useEnrollmentCode).not.toHaveBeenCalled();
    expect(screen.getByText('Enrollment codes are visible to Rwaq superadmins only.')).toBeInTheDocument();
  });

  it('loads a code by URL for a superuser', () => {
    (whoami.useAdminCapabilities as jest.Mock).mockReturnValue({ data: { isSuperuser: true } });
    (hooks.useEnrollmentCode as jest.Mock).mockReturnValue({ data: { id: 9, code: 'ABC234' } });
    renderWrapper(<EnrollmentCodeUsagePage />);
    expect(hooks.useEnrollmentCode).toHaveBeenCalledWith(9);
    expect(screen.getByRole('heading', { name: 'ABC234' })).toBeInTheDocument();
  });

  it('has a back button to the list of codes', () => {
    (whoami.useAdminCapabilities as jest.Mock).mockReturnValue({ data: { isSuperuser: true } });
    (hooks.useEnrollmentCode as jest.Mock).mockReturnValue({ data: { id: 9, code: 'ABC234' } });
    renderWrapper(<EnrollmentCodeUsagePage />);
    fireEvent.click(screen.getByRole('button', { name: 'Back to enrollment codes' }));
    expect(mockNavigate).toHaveBeenCalledWith('/enrollment-codes');
  });
});
