/**
 * A ModalDialog whose whole body is one form, with a header that stays put.
 *
 * The trap this exists to close: wrapping ModalDialog's Body and Footer in a
 * <form> inserts an element between the dialog and its parts, so the dialog's
 * flex column no longer sees the Body as a child — the Body stops being the
 * scroll container and its content scrolls up over the (unscrolled) header.
 * `.rwaq-form-modal__form { display: contents }` puts Header/Body/Footer back
 * in the dialog's flex flow while keeping real <form> semantics, so Enter
 * still submits and the header still pins.
 *
 * Every list/detail modal here should use this rather than assembling
 * ModalDialog by hand, so the fix can't be forgotten in the next one.
 */
import { ReactNode } from 'react';
import {
  ActionRow, Button, Form, ModalDialog, StatefulButton,
} from '@openedx/paragon';

export interface FormModalProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (event?: React.FormEvent<HTMLFormElement>) => void;
  children: ReactNode;
  submitLabel: string;
  cancelLabel: string;
  isSubmitting?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Extra footer content, left-aligned before the action buttons. */
  footerNote?: ReactNode;
}

const FormModal = ({
  title,
  isOpen,
  onClose,
  onSubmit,
  children,
  submitLabel,
  cancelLabel,
  isSubmitting = false,
  size = 'lg',
  footerNote,
}: FormModalProps) => (
  <ModalDialog
    title={title}
    isOpen={isOpen}
    onClose={onClose}
    size={size}
    isFullscreenOnMobile
    hasCloseButton
    isOverflowVisible={false}
    className="rwaq-form-modal"
  >
    <Form onSubmit={onSubmit} className="rwaq-form-modal__form" noValidate>
      <ModalDialog.Header className="rwaq-form-modal__header">
        <ModalDialog.Title>{title}</ModalDialog.Title>
      </ModalDialog.Header>

      <ModalDialog.Body className="rwaq-form-modal__body">
        {children}
      </ModalDialog.Body>

      <ModalDialog.Footer className="rwaq-form-modal__footer">
        {footerNote}
        <ActionRow>
          <Button variant="tertiary" type="button" onClick={onClose}>
            {cancelLabel}
          </Button>
          <StatefulButton
            type="submit"
            state={isSubmitting ? 'pending' : 'default'}
            labels={{ default: submitLabel, pending: submitLabel }}
            disabledStates={['pending']}
          />
        </ActionRow>
      </ModalDialog.Footer>
    </Form>
  </ModalDialog>
);

export default FormModal;
