import { useState } from 'react';
import { Button } from '@openedx/paragon';
import { Download } from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import { logError } from '@edx/frontend-platform/logging';
import { downloadCsv } from '@src/data/csv';
import { useToast } from './ToastContext';
import { csvDownloadMessages as messages } from './messages';

/** How long a download's blob URL stays valid, so the browser can start reading it before it is revoked. */
const REVOKE_URL_AFTER_MS = 10_000;

interface CsvDownloadButtonProps {
  /** The list's csv/ endpoint. */
  url: string;
  /** The list's current filters. Paging is dropped, the file has every matching row. */
  params: Record<string, unknown>;
  /** The file name when the response does not name one, without ".csv". */
  fallbackName: string;
}

/** Downloads every row matching a list's filters, not just the page on screen. */
const CsvDownloadButton = ({ url, params, fallbackName }: CsvDownloadButtonProps) => {
  const intl = useIntl();
  const { showToast } = useToast();
  const [isDownloading, setIsDownloading] = useState(false);

  const handleClick = async () => {
    setIsDownloading(true);
    try {
      const { blob, filename } = await downloadCsv(url, params, fallbackName, intl.locale);
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      link.click();
      // Revoking at once can cancel the download in some browsers.
      setTimeout(() => URL.revokeObjectURL(blobUrl), REVOKE_URL_AFTER_MS);
    } catch (err) {
      logError(err);
      showToast(intl.formatMessage(messages.failed));
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Button variant="outline-primary" onClick={handleClick} disabled={isDownloading} iconBefore={Download}>
      {intl.formatMessage(messages.download)}
    </Button>
  );
};

export default CsvDownloadButton;
