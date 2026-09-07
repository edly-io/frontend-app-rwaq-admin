import { ReactNode } from 'react';
import { Container } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import { emptyStateMessages as messages } from './messages';

export interface EmptyStateProps {
  title?: string;
  body?: string;
  /** Optional action button or link */
  action?: ReactNode;
}

const EmptyState = ({ title, body, action }: EmptyStateProps) => {
  const intl = useIntl();
  return (
    <Container className="d-flex flex-column align-items-center justify-content-center py-5 text-center">
      <div
        style={{
          width: '4rem',
          height: '4rem',
          borderRadius: '50%',
          background: 'var(--pgn-color-gray-100, #f0f0ef)',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.75rem',
        }}
        aria-hidden="true"
      >
        📭
      </div>
      <h3 className="mb-2" style={{ color: 'var(--pgn-color-gray-700, #273F58)' }}>
        {title ?? intl.formatMessage(messages.defaultTitle)}
      </h3>
      <p className="text-muted mb-3">
        {body ?? intl.formatMessage(messages.defaultBody)}
      </p>
      {action}
    </Container>
  );
};

export default EmptyState;
