/**
 * The share card modal: it opens with the card, and the downloads are made from the off-screen 840px copy,
 * after the fonts are ready, whatever the size of the card on screen.
 */
import {
  fireEvent, screen, waitFor, within,
} from '@testing-library/react';
import { toBlob } from 'html-to-image';
import { renderWrapper } from '@src/setupTest';
import * as downloads from '@src/components/DownloadButton';
import * as hooks from '../data/hooks';
import type { CodeCard } from '../data/types';
import ShareCardModal from './ShareCardModal';

jest.mock('../data/hooks', () => ({ useEnrollmentCodeCard: jest.fn() }));
jest.mock('html-to-image', () => ({
  toBlob: jest.fn(),
  getFontEmbedCSS: jest.fn(),
}));
jest.mock('@src/components/DownloadButton', () => ({ __esModule: true, default: () => null, saveBlob: jest.fn() }));
jest.mock('@src/components/ToastContext', () => {
  const showToast = jest.fn();
  return { useToast: () => ({ showToast }), mockShowToast: showToast };
});
jest.mock('@edx/frontend-platform/logging', () => ({ logError: jest.fn() }));
jest.mock('@fontsource/cairo/latin-400.css', () => ({}), { virtual: true });
jest.mock('@fontsource/cairo/latin-600.css', () => ({}), { virtual: true });
jest.mock('@fontsource/cairo/latin-700.css', () => ({}), { virtual: true });
jest.mock('@fontsource/cairo/arabic-400.css', () => ({}), { virtual: true });
jest.mock('@fontsource/cairo/arabic-600.css', () => ({}), { virtual: true });
jest.mock('@fontsource/cairo/arabic-700.css', () => ({}), { virtual: true });

// eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
const { mockShowToast } = require('@src/components/ToastContext');

const { getFontEmbedCSS } = jest.requireMock('html-to-image');

const card: CodeCard = {
  code: 'RIYADH26',
  itemName: 'برنامج القيادة',
  itemKind: 'program',
  organizationName: 'Rwaq',
  organizationArabicName: 'رواق',
  logo: 'data:image/png;base64,iVBORw0KGgo=',
  qrUrl: 'https://rwaq.org/enroll?code=RIYADH26',
  expiresAt: null,
  platform: { slogan: 'Slogan', about: 'About', links: [{ type: 'website', url: 'https://rwaq.org', text: 'rwaq.org' }] },
};

const readBlob = (blob: Blob) => new Promise<string>((resolve) => {
  const reader = new FileReader();
  reader.onload = () => resolve(String(reader.result));
  reader.readAsText(blob);
});

const renderModal = (props: Partial<React.ComponentProps<typeof ShareCardModal>> = {}) => renderWrapper(
  <ShareCardModal codeId={7} onClose={jest.fn()} {...props} />,
);

let fontsReady: Promise<void>;
let fontsReadyResolved: boolean;

beforeEach(() => {
  jest.clearAllMocks();
  (hooks.useEnrollmentCodeCard as jest.Mock).mockReturnValue({ data: card, isLoading: false, isError: false });
  (toBlob as jest.Mock).mockResolvedValue(new Blob(['png'], { type: 'image/png' }));
  getFontEmbedCSS.mockResolvedValue('@font-face{font-family:"Cairo";src:url(data:font/woff2;base64,AAA)}');
  fontsReadyResolved = false;
  fontsReady = new Promise((resolve) => { setTimeout(() => { fontsReadyResolved = true; resolve(); }, 20); });
  Object.defineProperty(document, 'fonts', { configurable: true, value: { ready: fontsReady } });
});

describe('ShareCardModal', () => {
  it('shows the card and the four buttons, titled as created after a create', () => {
    renderModal({ isNew: true });
    expect(screen.getAllByText('RIYADH26').length).toBeGreaterThan(0);
    expect(screen.getByRole('heading', { name: 'Enrollment code created' })).toBeInTheDocument();
    // Close is the dialog's X and the footer button.
    expect(screen.getAllByRole('button', { name: 'Close' })).toHaveLength(2);
    ['Download HTML', 'Download Image', 'Copy Code'].forEach((name) => {
      expect(screen.getByRole('button', { name })).toBeEnabled();
    });
  });

  it('is titled Enrollment code when reopened from the list', () => {
    renderModal();
    expect(screen.getByRole('heading', { name: 'Enrollment code' })).toBeInTheDocument();
  });

  it('stays closed with no code', () => {
    renderModal({ codeId: null });
    expect(screen.queryByRole('button', { name: 'Copy Code' })).not.toBeInTheDocument();
  });

  it('shows an error when the card does not load', () => {
    (hooks.useEnrollmentCodeCard as jest.Mock).mockReturnValue({ data: undefined, isLoading: false, isError: true });
    renderModal();
    expect(screen.getByText('Could not load the card. Please try again.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Download Image' })).toBeDisabled();
  });

  it('copies the code and says so', async () => {
    const writeText = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
    renderModal();
    fireEvent.click(screen.getByRole('button', { name: 'Copy Code' }));
    await waitFor(() => expect(mockShowToast).toHaveBeenCalledWith('Code copied.'));
    expect(writeText).toHaveBeenCalledWith('RIYADH26');
  });

  it('draws Download Image from the off-screen 840px copy at 2x, after the fonts are ready', async () => {
    (toBlob as jest.Mock).mockImplementation(async () => {
      // The fonts must be loaded before the card is drawn.
      expect(fontsReadyResolved).toBe(true);
      return new Blob(['png'], { type: 'image/png' });
    });
    renderModal();
    fireEvent.click(screen.getByRole('button', { name: 'Download Image' }));

    await waitFor(() => expect(downloads.saveBlob).toHaveBeenCalled());
    const [node, options] = (toBlob as jest.Mock).mock.calls[0];
    const offscreen = screen.getByTestId('enrollment-code-card-export');
    expect(offscreen).toContainElement(node);
    expect(offscreen).toHaveStyle({ width: '840px' });
    expect(screen.getByTestId('enrollment-code-card')).not.toBe(node);
    expect(options).toMatchObject({ pixelRatio: 2, width: 840 });
    expect(options.fontEmbedCSS).toContain('Cairo');
    expect((downloads.saveBlob as jest.Mock).mock.calls[0][1]).toBe('enrollment-code-RIYADH26.png');
  });

  it('makes Download HTML a standalone file: inline CSS and fonts, the QR and the logo as data URLs', async () => {
    renderModal();
    fireEvent.click(screen.getByRole('button', { name: 'Download HTML' }));

    await waitFor(() => expect(downloads.saveBlob).toHaveBeenCalled());
    const [blob, filename] = (downloads.saveBlob as jest.Mock).mock.calls[0];
    expect(filename).toBe('enrollment-code-RIYADH26.html');
    const html = await readBlob(blob);
    expect(html).toContain('<style>');
    expect(html).toContain('.coupon-card{display:flex');
    expect(html).toContain('@font-face{font-family:"Cairo"');
    expect(html).toContain('RIYADH26');
    expect(html).toContain('src="data:image/png;base64,iVBORw0KGgo="');
    expect(html).toMatch(/<img alt="QR code" src="data:image\/svg\+xml;base64,[A-Za-z0-9+/=]+"/);
    expect(html).not.toContain('<svg data-qr');
    expect(html).not.toMatch(/(src|href)="https?:/);
    // The file keeps the container query, so it stacks by itself in a narrow window.
    expect(html).toContain('@container (max-width: 720px)');
  });

  it('tells the admin when a file could not be made', async () => {
    (toBlob as jest.Mock).mockResolvedValue(null);
    renderModal();
    fireEvent.click(screen.getByRole('button', { name: 'Download Image' }));
    await waitFor(() => expect(mockShowToast).toHaveBeenCalledWith('Could not create the file. Please try again.'));
    expect(downloads.saveBlob).not.toHaveBeenCalled();
  });

  it('closes', () => {
    const onClose = jest.fn();
    renderModal({ onClose });
    const footer = document.querySelector('.pgn__modal-footer') as HTMLElement;
    fireEvent.click(within(footer).getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalled();
  });
});
