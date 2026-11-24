import { fireEvent, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { renderWrapper } from '@src/setupTest';
import ProgramEmailTab from './ProgramEmailTab';

jest.mock('@src/components/RichTextEditor', () => ({
  __esModule: true,
  default: ({ value, onChange }: { value: string; onChange: (value: string) => void }) => (
    <textarea aria-label="Message" value={value} onChange={(event) => onChange(event.target.value)} />
  ),
}));
jest.mock('@edx/frontend-platform/auth', () => ({ getAuthenticatedHttpClient: jest.fn() }));

it('shows a count and requires confirmation before sending', async () => {
  const post = jest.fn().mockResolvedValue({ data: {} });
  const get = jest.fn().mockImplementation((url: string) => Promise.resolve({
    data: url.includes('email-recipients') ? { count: 1, skipped_count: 0 } : [],
  }));
  (getAuthenticatedHttpClient as jest.Mock).mockReturnValue({ get, post });
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  renderWrapper(<QueryClientProvider client={client}><ProgramEmailTab uuid="program-id" /></QueryClientProvider>);
  expect(await screen.findByText('1 recipients, 0 opted out')).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('Subject'), { target: { value: 'Hello' } });
  fireEvent.change(screen.getByLabelText('Message'), { target: { value: 'Welcome' } });
  fireEvent.click(screen.getByRole('button', { name: 'Send email' }));
  expect(post).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Confirm send' }));
  await waitFor(() => expect(post).toHaveBeenCalledWith(expect.stringContaining('/emails/'), {
    subject: 'Hello', body: 'Welcome', recipients: 'myself',
  }));
});
