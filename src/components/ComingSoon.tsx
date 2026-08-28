import { Container } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import { comingSoonMessages as messages } from './messages';

const ComingSoon = () => {
  const intl = useIntl();
  return (
    <Container className="d-flex flex-column align-items-center justify-content-center py-5 text-center">
      <div
        style={{
          width: '5rem',
          height: '5rem',
          borderRadius: '50%',
          background: 'var(--pgn-color-info-100, #EBF5FF)',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2rem',
        }}
        aria-hidden="true"
      >
        🚧
      </div>
      <h2
        className="mb-2"
        style={{ color: 'var(--pgn-color-gray-700, #273F58)' }}
      >
        {intl.formatMessage(messages.title)}
      </h2>
      <p className="text-muted" style={{ maxWidth: '32rem' }}>
        {intl.formatMessage(messages.body)}
      </p>
    </Container>
  );
};

export default ComingSoon;
