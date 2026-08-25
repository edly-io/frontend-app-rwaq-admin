/**
 * Search-and-pick one user, for enrollment and staff modals.
 *
 * Same debounce + collapsing pattern as CoursePicker: the server has thousands
 * of users, so it searches rather than lists, and collapses to the chosen user
 * once one is picked.
 */
import { useEffect, useState } from 'react';
import {
  Button, Form, Icon, Spinner,
} from '@openedx/paragon';
import { Search } from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import { useUsers } from '@src/modules/users/data/hooks';
import type { UserSummary } from '@src/modules/users/data/types';
import messages from '../messages';

const DEBOUNCE_MS = 300;
const MIN_QUERY = 2;

export interface UserPickerProps {
  selected: UserSummary | null;
  onSelect: (user: UserSummary | null) => void;
  error?: string;
}

const UserPicker = ({ selected, onSelect, error }: UserPickerProps) => {
  const intl = useIntl();
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(query.trim()), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query]);

  const isSearchable = debounced.length >= MIN_QUERY;

  // Search by name first, fall back to email if the query looks like one
  const searchBy = debounced.includes('@') ? 'email' : 'name';

  // enabled=false when no real search term yet — prevents loading all users
  // on modal open, which would be a large request on production.
  const { data, isFetching, isError } = useUsers(
    { searchBy, searchTerm: debounced, pageSize: 10 },
    isSearchable && selected === null,
  );

  if (selected) {
    return (
      <Form.Group>
        <Form.Label>{intl.formatMessage(messages.enrollModalUserLabel)}</Form.Label>
        <div className="rwaq-course-picker__chosen">
          <div className="rwaq-course-picker__chosen-text">
            <div className="rwaq-user-cell__name">{selected.name || selected.email}</div>
            <div className="rwaq-user-cell__meta">{selected.email}</div>
          </div>
          <Button
            variant="tertiary"
            size="sm"
            type="button"
            onClick={() => {
              onSelect(null);
              setQuery('');
              setDebounced('');
            }}
          >
            {intl.formatMessage(messages.userPickerClear)}
          </Button>
        </div>
      </Form.Group>
    );
  }

  const results = data?.results ?? [];

  return (
    <Form.Group isInvalid={Boolean(error)}>
      <Form.Label>{intl.formatMessage(messages.enrollModalUserLabel)}</Form.Label>
      <Form.Control
        value={query}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => setQuery(event.target.value)}
        placeholder={intl.formatMessage(messages.userPickerSearchPlaceholder)}
        trailingElement={isFetching
          ? <Spinner animation="border" size="sm" screenReaderText="Searching" />
          : <Icon src={Search} />}
        autoComplete="off"
      />
      {error && <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>}

      {isSearchable && !isError && results.length === 0 && !isFetching && (
        <p className="text-muted small mt-2 mb-0">
          {intl.formatMessage(messages.userPickerNoResults, { query: debounced })}
        </p>
      )}

      {!isSearchable && !error && (
        <Form.Control.Feedback>
          {intl.formatMessage(messages.userPickerTypeToSearch)}
        </Form.Control.Feedback>
      )}

      {results.length > 0 && (
        <ul className="rwaq-course-picker__results">
          {results.map((user) => (
            <li key={user.id}>
              <button
                type="button"
                className="rwaq-course-picker__option"
                onClick={() => onSelect(user)}
              >
                <span className="rwaq-user-cell__name">{user.name || '—'}</span>
                <span className="rwaq-user-cell__meta">{user.email}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </Form.Group>
  );
};

export default UserPicker;
