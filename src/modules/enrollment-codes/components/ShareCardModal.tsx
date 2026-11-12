/**
 * The share card in a modal: opens after a code is created and from the list's View card action.
 *
 * Download Image and Download HTML are made from a second, off-screen copy of the card that is always
 * 840px wide, so the file is the same whatever width the modal has on screen.
 */
import { useRef, useState } from 'react';
import {
  ActionRow, Alert, Button, ModalDialog, Spinner,
} from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import { logError } from '@edx/frontend-platform/logging';
import { saveBlob } from '@src/components/DownloadButton';
import { useToast } from '@src/components/ToastContext';
import { useEnrollmentCodeCard } from '../data/hooks';
import messages from '../messages';
import { cardToHtml, cardToPng } from './cardExport';
import { CARD_CSS, EXPORT_WIDTH } from './cardStyles';
import copyText from './copyCode';
import EnrollmentCodeCard from './EnrollmentCodeCard';
import '@fontsource/cairo/latin-400.css';
import '@fontsource/cairo/latin-600.css';
import '@fontsource/cairo/latin-700.css';
import '@fontsource/cairo/arabic-400.css';
import '@fontsource/cairo/arabic-600.css';
import '@fontsource/cairo/arabic-700.css';

interface ShareCardModalProps {
  /** The code whose card is shown. null keeps the modal closed. */
  codeId: number | null;
  /** True right after creating the code: the title says it was created. */
  isNew?: boolean;
  onClose: () => void;
}

const OFFSCREEN_STYLE = {
  position: 'fixed', left: '-10000px', top: 0, width: `${EXPORT_WIDTH}px`, pointerEvents: 'none',
} as const;

const ShareCardModal = ({ codeId, isNew = false, onClose }: ShareCardModalProps) => {
  const intl = useIntl();
  const { showToast } = useToast();
  const { data: card, isLoading, isError } = useEnrollmentCodeCard(codeId);
  const exportRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState<'html' | 'image' | null>(null);

  const fileBase = card ? `enrollment-code-${card.code}` : 'enrollment-code';

  const handleExport = async (kind: 'html' | 'image') => {
    if (!exportRef.current || !card) { return; }
    setExporting(kind);
    try {
      if (kind === 'html') {
        saveBlob(await cardToHtml(exportRef.current, card.code), `${fileBase}.html`);
      } else {
        saveBlob(await cardToPng(exportRef.current), `${fileBase}.png`);
      }
    } catch (err) {
      logError(err);
      showToast(intl.formatMessage(messages.cardExportFailed));
    } finally {
      setExporting(null);
    }
  };

  const handleCopy = async () => {
    if (!card) { return; }
    const copied = await copyText(card.code);
    showToast(intl.formatMessage(copied ? messages.codeCopied : messages.codeCopyFailed));
  };

  const title = intl.formatMessage(isNew ? messages.cardTitleCreated : messages.cardTitle);

  return (
    <ModalDialog
      title={title}
      isOpen={codeId !== null}
      onClose={onClose}
      size="xl"
      isFullscreenOnMobile
      hasCloseButton
      isOverflowVisible={false}
      className="rwaq-form-modal"
    >
      <ModalDialog.Header className="rwaq-form-modal__header">
        <ModalDialog.Title>{title}</ModalDialog.Title>
      </ModalDialog.Header>
      <ModalDialog.Body className="rwaq-form-modal__body">
        {isLoading && (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" role="status">
              <span className="sr-only">{intl.formatMessage(messages.cardLoading)}</span>
            </Spinner>
          </div>
        )}
        {isError && <Alert variant="danger">{intl.formatMessage(messages.cardLoadFailed)}</Alert>}
        {card && (
          <>
            <style>{CARD_CSS}</style>
            <div className="d-flex justify-content-center">
              <EnrollmentCodeCard card={card} testId="enrollment-code-card" />
            </div>
            {card.qrMissing ? (
              <Alert variant="warning" className="mt-3" data-testid="enrollment-code-card-qr-missing">
                {intl.formatMessage(messages.cardQrMissing)}
              </Alert>
            ) : (
              <p className="text-center small text-muted mt-3 mb-0 text-break" data-testid="enrollment-code-card-link">
                {intl.formatMessage(messages.cardLinkLabel, { url: card.qrUrl })}
              </p>
            )}
            <div aria-hidden="true" style={OFFSCREEN_STYLE} data-testid="enrollment-code-card-export">
              <EnrollmentCodeCard card={card} ref={exportRef} />
            </div>
          </>
        )}
      </ModalDialog.Body>
      <ModalDialog.Footer className="rwaq-form-modal__footer">
        <ActionRow className="flex-wrap justify-content-center">
          <Button variant="tertiary" onClick={onClose}>{intl.formatMessage(messages.cardClose)}</Button>
          <Button
            variant="outline-primary"
            disabled={!card || card.qrMissing || exporting !== null}
            onClick={() => handleExport('html')}
          >
            {intl.formatMessage(exporting === 'html' ? messages.cardExporting : messages.cardDownloadHtml)}
          </Button>
          <Button
            variant="outline-primary"
            disabled={!card || card.qrMissing || exporting !== null}
            onClick={() => handleExport('image')}
          >
            {intl.formatMessage(exporting === 'image' ? messages.cardExporting : messages.cardDownloadImage)}
          </Button>
          <Button variant="primary" disabled={!card} onClick={handleCopy}>
            {intl.formatMessage(messages.cardCopyCode)}
          </Button>
        </ActionRow>
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default ShareCardModal;
