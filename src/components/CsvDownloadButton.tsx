import { useState } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { logError } from '@edx/frontend-platform/logging';
import { downloadCsv } from '@src/data/csv';
import DownloadButton, { saveBlob } from './DownloadButton';
import { useToast } from './ToastContext';
import { csvDownloadMessages as messages } from './messages';

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
      saveBlob(blob, filename);
    } catch (err) {
      logError(err);
      showToast(intl.formatMessage(messages.failed));
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <DownloadButton
      label={intl.formatMessage(messages.download)}
      pendingLabel={intl.formatMessage(messages.downloading)}
      isPending={isDownloading}
      onClick={handleClick}
    />
  );
};

export default CsvDownloadButton;
