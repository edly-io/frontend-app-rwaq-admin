/**
 * Search bar for the user list.
 *
 * Validates client-side to the same contract the backend enforces, so an
 * obviously-malformed term never costs a round trip:
 *   user_id → digits only
 *   email   → must contain '@'
 */
import { useState } from 'react';
import { Button, Form } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import type { SearchBy } from '../data/types';
import messages from '../messages';

const DIGITS_RE = /^\d+$/;

interface UserSearchBarProps {
  onSearch: (by: SearchBy, term: string) => void;
  onClear: () => void;
  initialBy: SearchBy;
  initialTerm: string;
}

const UserSearchBar = ({
  onSearch, onClear, initialBy, initialTerm,
}: UserSearchBarProps) => {
  const intl = useIntl();
  const [searchBy, setSearchBy] = useState<SearchBy>(initialBy);
  const [searchTerm, setSearchTerm] = useState(initialTerm);
  const [validationError, setValidationError] = useState('');

  const validate = (by: SearchBy, term: string): string => {
    if (!term.trim()) { return ''; }
    if (by === 'user_id' && !DIGITS_RE.test(term.trim())) {
      return intl.formatMessage(messages.validationUserIdInvalid);
    }
    if (by === 'email' && !term.includes('@')) {
      return intl.formatMessage(messages.validationEmailInvalid);
    }
    return '';
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const error = validate(searchBy, searchTerm);
    if (error) {
      setValidationError(error);
      return;
    }
    setValidationError('');
    onSearch(searchBy, searchTerm.trim());
  };

  const handleClear = () => {
    setSearchTerm('');
    setValidationError('');
    onClear();
  };

  const handleByChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const next = event.target.value as SearchBy;
    setSearchBy(next);
    if (searchTerm.trim()) {
      setValidationError(validate(next, searchTerm));
    }
  };

  return (
    <Form onSubmit={handleSubmit} className="d-flex align-items-start flex-wrap gap-2" noValidate>
      <Form.Group className="mb-0" controlId="user-search-by">
        <Form.Label className="sr-only">{intl.formatMessage(messages.searchByLabel)}</Form.Label>
        <Form.Control
          as="select"
          value={searchBy}
          onChange={handleByChange}
          aria-label={intl.formatMessage(messages.searchByLabel)}
        >
          <option value="email">{intl.formatMessage(messages.searchByEmail)}</option>
          <option value="name">{intl.formatMessage(messages.searchByName)}</option>
          <option value="user_id">{intl.formatMessage(messages.searchByUserId)}</option>
          <option value="job">{intl.formatMessage(messages.searchByJob)}</option>
        </Form.Control>
      </Form.Group>

      <Form.Group className="mb-0 flex-grow-1" controlId="user-search-term" isInvalid={!!validationError}>
        <Form.Label className="sr-only">{intl.formatMessage(messages.searchTermLabel)}</Form.Label>
        <Form.Control
          type="text"
          value={searchTerm}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            setSearchTerm(event.target.value);
            if (validationError) {
              setValidationError(validate(searchBy, event.target.value));
            }
          }}
          placeholder={intl.formatMessage(messages.searchTermPlaceholder)}
          isInvalid={!!validationError}
          aria-label={intl.formatMessage(messages.searchTermLabel)}
        />
        {validationError && (
          <Form.Control.Feedback type="invalid">{validationError}</Form.Control.Feedback>
        )}
      </Form.Group>

      <Button type="submit" variant="primary">
        {intl.formatMessage(messages.searchButton)}
      </Button>
      <Button type="button" variant="outline-secondary" onClick={handleClear}>
        {intl.formatMessage(messages.clearButton)}
      </Button>
    </Form>
  );
};

export default UserSearchBar;
