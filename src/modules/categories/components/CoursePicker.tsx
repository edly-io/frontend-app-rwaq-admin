/**
 * Search-and-pick one course to link to a category.
 *
 * Unlike the users module's CoursePicker (which requires a query before
 * searching, because it matches against the whole catalogue), this one
 * shows not-yet-linked courses as soon as the modal opens — the point of
 * this component is to let an admin browse and pick from a dropdown
 * instead of having to already know the course key. Typing narrows the
 * same list via the backend's search param.
 *
 * The list is paginated server-side (20 per page), so it loads more pages
 * as the admin scrolls the results near the bottom, rather than silently
 * capping the dropdown at page 1 — see useAvailableCoursesForCategory.
 */
import { useEffect, useState } from 'react';
import {
  Alert, Button, Form, Icon, Spinner,
} from '@openedx/paragon';
import { Search } from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import { useAvailableCoursesForCategory } from '../data/hooks';
import type { CategoryCourse } from '../data/types';
import messages from '../messages';

/** Long enough that typing a course name is one request, short enough to feel live. */
const DEBOUNCE_MS = 300;
const PAGE_SIZE = 20;
/** Fetch the next page once the list is scrolled to within this many px of the bottom. */
const LOAD_MORE_THRESHOLD_PX = 48;

interface CoursePickerProps {
  categoryId: number;
  selected: CategoryCourse | null;
  onSelect: (course: CategoryCourse | null) => void;
  error?: string;
}

const CoursePicker = ({
  categoryId, selected, onSelect, error,
}: CoursePickerProps) => {
  const intl = useIntl();
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(query.trim()), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query]);

  const {
    data, isFetching, isFetchingNextPage, hasNextPage, fetchNextPage, isError,
  } = useAvailableCoursesForCategory(
    categoryId,
    { search: debounced, pageSize: PAGE_SIZE },
    selected === null,
  );

  const handleResultsScroll = (event: React.UIEvent<HTMLUListElement>) => {
    if (!hasNextPage || isFetchingNextPage) { return; }
    const el = event.currentTarget;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    if (distanceFromBottom <= LOAD_MORE_THRESHOLD_PX) {
      fetchNextPage();
    }
  };

  if (selected) {
    return (
      <Form.Group>
        <Form.Label>{intl.formatMessage(messages.fieldCourse)}</Form.Label>
        <div className="rwaq-course-picker__chosen">
          <div className="rwaq-course-picker__chosen-text">
            <div className="rwaq-user-cell__name">{selected.displayName}</div>
            <div className="rwaq-user-cell__meta">{selected.courseKey}</div>
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
            {intl.formatMessage(messages.coursePickerClear)}
          </Button>
        </div>
      </Form.Group>
    );
  }

  const results = data?.pages.flatMap((page) => page.results) ?? [];
  // isFetching is also true while fetchNextPage is in flight — that case gets
  // its own inline spinner at the bottom of the list, so the search box's
  // trailing icon should only reflect the initial/search fetch.
  const isSearching = isFetching && !isFetchingNextPage;

  return (
    <Form.Group isInvalid={Boolean(error)}>
      <Form.Label>{intl.formatMessage(messages.fieldCourse)}</Form.Label>
      <Form.Control
        value={query}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => setQuery(event.target.value)}
        placeholder={intl.formatMessage(messages.coursePickerSearchPlaceholder)}
        trailingElement={isSearching
          ? <Spinner animation="border" size="sm" screenReaderText={intl.formatMessage(messages.coursePickerSearching)} />
          : <Icon src={Search} />}
        autoComplete="off"
      />
      {error && <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>}

      {isError && (
        <Alert variant="danger" className="mt-2 mb-0">
          {intl.formatMessage(messages.coursePickerError)}
        </Alert>
      )}

      {!isError && !isSearching && results.length === 0 && (
        <p className="text-muted small mt-2 mb-0">
          {debounced
            ? intl.formatMessage(messages.coursePickerNoResults, { query: debounced })
            : intl.formatMessage(messages.coursePickerNoneAvailable)}
        </p>
      )}

      {results.length > 0 && (
        <ul className="rwaq-course-picker__results" onScroll={handleResultsScroll}>
          {results.map((course) => (
            <li key={course.courseKey}>
              <button
                type="button"
                className="rwaq-course-picker__option"
                onClick={() => onSelect(course)}
              >
                <span className="rwaq-user-cell__name">{course.displayName}</span>
                <span className="rwaq-user-cell__meta">{course.courseKey}</span>
              </button>
            </li>
          ))}
          {isFetchingNextPage && (
            <li className="rwaq-course-picker__loading-more">
              <Spinner
                animation="border"
                size="sm"
                screenReaderText={intl.formatMessage(messages.coursePickerSearching)}
              />
            </li>
          )}
        </ul>
      )}
    </Form.Group>
  );
};

export default CoursePicker;
