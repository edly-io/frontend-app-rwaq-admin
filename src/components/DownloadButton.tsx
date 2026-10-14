/**
 * DownloadButton — a button for a file download that is built on request.
 * Shows a spinner and the pending label while `isPending`, and is disabled
 * until the file has been handed to the browser.
 */
import { Icon, StatefulButton } from '@openedx/paragon';
import { Download } from '@openedx/paragon/icons';

// Revoking at once can cancel the download in some browsers.
const REVOKE_URL_AFTER_MS = 10_000;

/** Hands a blob to the browser as a file download. */
export const saveBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), REVOKE_URL_AFTER_MS);
};

interface DownloadButtonProps {
  label: string;
  pendingLabel: string;
  isPending: boolean;
  onClick: () => void;
  variant?: string;
  size?: 'sm' | 'md' | 'lg' | 'inline';
  disabled?: boolean;
}

const DownloadButton = ({
  label, pendingLabel, isPending, onClick, variant = 'outline-primary', size, disabled,
}: DownloadButtonProps) => (
  <StatefulButton
    variant={variant}
    size={size}
    state={isPending ? 'pending' : 'default'}
    labels={{ default: label, pending: pendingLabel }}
    icons={{ default: <Icon src={Download} /> }}
    disabledStates={['pending']}
    disabled={disabled}
    onClick={onClick}
  />
);

export default DownloadButton;
