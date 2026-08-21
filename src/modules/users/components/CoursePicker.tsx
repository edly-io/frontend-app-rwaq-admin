/**
 * Search-and-pick one course.
 *
 * A plain <select> was the first instinct and the wrong one: this platform has
 * hundreds of courses, and the picker would be an unscannable list whose
 * options all start with the same org prefix. So it searches server-side,
 * shows the matches as a short list, and collapses to the chosen course once
 * one is picked — the choice stays visible instead of scrolling away.
 *
 * Search is debounced. Without it every keystroke is a request, and the
 * responses race: "cla" can resolve after "class" and repopulate the list with
 * the wrong matches.
 */
import { useEffect, useState } from 'react';
import {
  Alert, Button, Form, Icon, Spinner,
} from '@openedx/paragon';
import { Search } from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import { useEnrollableCourses } from '../data/hooks';
import type { EnrollableCourse } from '../data/types';
import messages from '../messages';

/** Long enough that typing a course name is one request, short enough to feel live. */
const DEBOUNCE_MS = 300;
/** Below this a search matches most of the catalogue, so it isn't worth sending. */
const MIN_QUERY = 2;
/** Mirrors the API's own default page size, for the help text. */
const RESULT_LIMIT = 20;

interface CoursePickerProps {
  selected: EnrollableCourse | null;
  onSelect: (course: EnrollableCourse | null) => void;
  /** Course IDs the learner is already actively enrolled in — shown, not hidden. */
  activeCourseIds: string[];
  error?: string;
}

const CoursePicker = ({
  selected, onSelect, activeCourseIds, error,
}: CoursePickerProps) => {
  const intl = useIntl();
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(query.trim()), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query]);

  const isSearchable = debounced.length >= MIN_QUERY;
  const {
    data, isFetching, isError,
  } = useEnrollableCourses(debounced, isSearchable && selected === null);

  if (selected) {
    return (
      <Form.Group>
        <Form.Label>{intl.formatMessage(messages.enrollSelected)}</Form.Label>
        <div className="rwaq-course-picker__chosen">
          <div className="rwaq-course-picker__chosen-text">
            <div className="rwaq-user-cell__name">{selected.displayName}</div>
            <div className="rwaq-user-cell__meta">{selected.courseId}</div>
          </div>
          <Button
            variant="tertiary"
            size="sm"
            type="button"
            onClick={() => {
              onSelect(null);
              // Leaving the old query in place would re-run the same search and
              // land the admin back on a list they have already rejected.
              setQuery('');
              setDebounced('');
            }}
          >
            {intl.formatMessage(messages.enrollClear)}
          </Button>
        </div>
      </Form.Group>
    );
  }

  return (
    <Form.Group isInvalid={Boolean(error)}>
      <Form.Label>{intl.formatMessage(messages.enrollCourseLabel)}</Form.Label>
      <Form.Control
        value={query}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => setQuery(event.target.value)}
        placeholder={intl.formatMessage(messages.enrollCoursePlaceholder)}
        trailingElement={isFetching
          ? <Spinner animation="border" size="sm" screenReaderText={intl.formatMessage(messages.enrollSearching)} />
          : <Icon src={Search} />}
        autoComplete="off"
      />
      {error
        ? <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>
        : (
          <Form.Control.Feedback>
            {intl.formatMessage(messages.enrollCourseHelp, { limit: RESULT_LIMIT })}
          </Form.Control.Feedback>
        )}

      {isError && (
        <Alert variant="danger" className="mt-2 mb-0">
          {intl.formatMessage(messages.enrollCoursesError)}
        </Alert>
      )}

      {isSearchable && !isError && data && data.length === 0 && !isFetching && (
        <p className="text-muted small mt-2 mb-0">
          {intl.formatMessage(messages.enrollNoCourses)}
        </p>
      )}

      {data && data.length > 0 && (
        <ul className="rwaq-course-picker__results">
          {data.map((course) => {
            // An already-enrolled course stays listed but unpickable. Filtering
            // it out silently would read as "that course doesn't exist", which
            // sends the admin looking for a problem that isn't there.
            const isEnrolled = activeCourseIds.includes(course.courseId);
            return (
              <li key={course.courseId}>
                <button
                  type="button"
                  className="rwaq-course-picker__option"
                  disabled={isEnrolled}
                  onClick={() => onSelect(course)}
                >
                  <span className="rwaq-user-cell__name">{course.displayName}</span>
                  <span className="rwaq-user-cell__meta">{course.courseId}</span>
                  {isEnrolled && (
                    <span className="rwaq-course-picker__option-note">
                      {intl.formatMessage(messages.enrollAlready)}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </Form.Group>
  );
};

export default CoursePicker;
