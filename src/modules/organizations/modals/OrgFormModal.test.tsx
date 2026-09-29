import { fireEvent, screen, waitFor } from '@testing-library/react';
import { renderWrapper } from '@src/setupTest';
import * as hooks from '../data/hooks';
import OrgFormModal from './OrgFormModal';
import type { OrgDetail } from '../data/types';

jest.mock('../data/hooks');
jest.mock('@src/components/RichTextEditor', () => jest.fn(() => <div data-testid="mock-editor" />));

const mockUpdate = {
  mutate: jest.fn(),
  mutateAsync: jest.fn().mockResolvedValue({}),
  isPending: false,
  isError: false,
  error: null,
  reset: jest.fn(),
};

const organization = {
  id: 1,
  name: 'Org A',
  shortName: 'ORGA',
  arabicName: '',
  description: '',
  featuredVideo: '',
  showLogoOnProgramCertificate: false,
  revenueSharePercentage: '35.50',
  logo: null,
  organizationLogo: null,
  members: [],
} as unknown as OrgDetail;

const shareInput = () => screen.getByLabelText('Revenue share (%)');
const save = () => fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));

describe('OrgFormModal revenue share', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (hooks.useUpdateOrganization as jest.Mock).mockReturnValue(mockUpdate);
    (hooks.useCreateOrganization as jest.Mock).mockReturnValue(mockUpdate);
  });

  it('shows the current share and sends the new one', async () => {
    renderWrapper(<OrgFormModal isOpen onClose={jest.fn()} organization={organization} />);
    expect(shareInput()).toHaveValue(35.5);
    fireEvent.change(shareInput(), { target: { value: '40' } });
    save();
    await waitFor(() => expect(mockUpdate.mutateAsync).toHaveBeenCalled());
    expect(mockUpdate.mutateAsync.mock.calls[0][0].patch.revenueSharePercentage).toBe('40');
  });

  it('sends an empty share to clear it', async () => {
    renderWrapper(<OrgFormModal isOpen onClose={jest.fn()} organization={organization} />);
    fireEvent.change(shareInput(), { target: { value: '' } });
    save();
    await waitFor(() => expect(mockUpdate.mutateAsync).toHaveBeenCalled());
    expect(mockUpdate.mutateAsync.mock.calls[0][0].patch.revenueSharePercentage).toBe('');
  });

  it('refuses a share above 100', async () => {
    renderWrapper(<OrgFormModal isOpen onClose={jest.fn()} organization={organization} />);
    fireEvent.change(shareInput(), { target: { value: '150' } });
    fireEvent.blur(shareInput());
    save();
    expect(await screen.findByText('Enter a percentage from 0 to 100.')).toBeInTheDocument();
    expect(mockUpdate.mutateAsync).not.toHaveBeenCalled();
  });

  it('is not on the create form', () => {
    renderWrapper(<OrgFormModal isOpen onClose={jest.fn()} organization={null} />);
    expect(screen.queryByLabelText('Revenue share (%)')).not.toBeInTheDocument();
  });
});
