import { ReactNode } from 'react';
import { Container, Button } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import { CustomErrors, ERROR_STATUS } from '@src/constants';
import { errorStateMessages as messages } from './messages';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ErrorStateProps {
  /** HTTP status code, used to select the right message */
  statusCode?: number;
  title?: string;
  body?: string;
  onRetry?: () => void;
  action?: ReactNode;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const classifyStatus = (code: number): CustomErrors | null => {
  for (const [errorType, codes] of Object.entries(ERROR_STATUS)) {
    if ((codes as number[]).includes(code)) {
      return errorType as CustomErrors;
    }
  }
  return null;
};

// ── Main component ────────────────────────────────────────────────────────────

const ErrorState = ({
  statusCode,
  title,
  body,
  onRetry,
  action,
}: ErrorStateProps) => {
  const intl = useIntl();

  const errorType = statusCode ? classifyStatus(statusCode) : null;

  let resolvedBody: string;
  if (body) {
    resolvedBody = body;
  } else if (errorType === CustomErrors.NO_ACCESS) {
    resolvedBody = intl.formatMessage(messages.noAccess);
  } else if (errorType === CustomErrors.NOT_FOUND) {
    resolvedBody = intl.formatMessage(messages.notFound);
  } else {
    resolvedBody = intl.formatMessage(messages.defaultBody);
  }

  return (
    <Container className="d-flex flex-column align-items-center justify-content-center py-5 text-center">
      <div
        style={{
          width: '4rem',
          height: '4rem',
          borderRadius: '50%',
          background: 'var(--pgn-color-danger-100, #FEE2E2)',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.75rem',
        }}
        aria-hidden="true"
      >
        ⚠
      </div>
      <h3 className="mb-2" style={{ color: 'var(--pgn-color-danger-700, #7F1D1D)' }}>
        {title ?? intl.formatMessage(messages.defaultTitle)}
      </h3>
      <p className="text-muted mb-3">{resolvedBody}</p>
      {onRetry && (
        <Button variant="outline-primary" onClick={onRetry} className="mb-2">
          {intl.formatMessage(messages.retry)}
        </Button>
      )}
      {action}
    </Container>
  );
};

export default ErrorState;
