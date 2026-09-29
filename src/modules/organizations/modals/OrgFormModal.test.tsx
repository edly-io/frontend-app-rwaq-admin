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

const shareInput = () => screen.getByLabelText('Partner revenue share (%)');
const invalidText = 'Enter a number from 0 to 100 with up to 2 decimal places.';
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

  it.each(['35.5555', '1e-7', '-1', '100.01', '150'])('refuses %s inline without calling the API', async (bad) => {
    renderWrapper(<OrgFormModal isOpen onClose={jest.fn()} organization={organization} />);
    fireEvent.change(shareInput(), { target: { value: bad } });
    fireEvent.blur(shareInput());
    save();
    expect(await screen.findByText(invalidText)).toBeInTheDocument();
    expect(mockUpdate.mutateAsync).not.toHaveBeenCalled();
  });

  it.each(['0', '100', '12.5'])('accepts %s', async (good) => {
    renderWrapper(<OrgFormModal isOpen onClose={jest.fn()} organization={organization} />);
    fireEvent.change(shareInput(), { target: { value: good } });
    save();
    await waitFor(() => expect(mockUpdate.mutateAsync).toHaveBeenCalled());
    expect(mockUpdate.mutateAsync.mock.calls[0][0].patch.revenueSharePercentage).toBe(good);
  });

  it('prefills the share from either edit entry point', () => {
    // The list page and the detail page both hand the modal an OrgDetail,
    // so the prefill is the same whichever Edit button opened it.
    const { unmount } = renderWrapper(<OrgFormModal isOpen onClose={jest.fn()} organization={organization} />);
    expect(shareInput()).toHaveValue(35.5);
    unmount();
    const unset = { ...organization, revenueSharePercentage: null };
    renderWrapper(<OrgFormModal isOpen onClose={jest.fn()} organization={unset} />);
    expect(shareInput()).toHaveValue(null);
  });

  describe('create mode', () => {
    const fillRequired = () => {
      fireEvent.change(screen.getByLabelText(/^Name/), { target: { value: 'New Partner' } });
      fireEvent.change(screen.getByLabelText(/Short name/), { target: { value: 'NEWPARTNER' } });
    };
    const create = () => fireEvent.click(screen.getByRole('button', { name: 'Create organization' }));

    it('shows the field and sends the share', async () => {
      renderWrapper(<OrgFormModal isOpen onClose={jest.fn()} organization={null} />);
      fillRequired();
      fireEvent.change(shareInput(), { target: { value: '12.5' } });
      create();
      await waitFor(() => expect(mockUpdate.mutateAsync).toHaveBeenCalled());
      expect(mockUpdate.mutateAsync.mock.calls[0][0].revenueSharePercentage).toBe('12.5');
    });

    it('omits the share when left empty', async () => {
      renderWrapper(<OrgFormModal isOpen onClose={jest.fn()} organization={null} />);
      fillRequired();
      create();
      await waitFor(() => expect(mockUpdate.mutateAsync).toHaveBeenCalled());
      expect(mockUpdate.mutateAsync.mock.calls[0][0]).not.toHaveProperty('revenueSharePercentage');
    });

    it('refuses an invalid share inline', async () => {
      renderWrapper(<OrgFormModal isOpen onClose={jest.fn()} organization={null} />);
      fillRequired();
      fireEvent.change(shareInput(), { target: { value: '35.5555' } });
      fireEvent.blur(shareInput());
      create();
      expect(await screen.findByText(invalidText)).toBeInTheDocument();
      expect(mockUpdate.mutateAsync).not.toHaveBeenCalled();
    });
  });
});
