import { act, fireEvent, screen } from '@testing-library/react';
import { renderWrapper } from '@src/setupTest';
import * as hooks from '../data/hooks';
import CoursePicker from './CoursePicker';

jest.mock('../data/hooks');

describe('CoursePicker', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    (hooks.useEnrollableCourses as jest.Mock).mockReturnValue({
      data: [
        {
          courseId: 'course-v1:Org+Sub+2026',
          displayName: 'Subscription course',
          org: 'Org',
          availableModes: ['no-id-professional'],
          isPartOfSubscription: true,
          start: null,
          end: null,
        },
        {
          courseId: 'course-v1:Org+Free+2026',
          displayName: 'Free course',
          org: 'Org',
          availableModes: ['honor'],
          isPartOfSubscription: false,
          start: null,
          end: null,
        },
      ],
      isFetching: false,
      isError: false,
    });
  });

  afterEach(() => jest.useRealTimers());

  it('lists subscription courses greyed out with a note', () => {
    const onSelect = jest.fn();
    renderWrapper(<CoursePicker selected={null} onSelect={onSelect} activeCourseIds={[]} />);
    fireEvent.change(screen.getByRole('textbox', { name: 'Course' }), { target: { value: 'course' } });
    act(() => { jest.runAllTimers(); });

    const subscription = screen.getByRole('button', { name: /Subscription course/ });
    expect(subscription).toBeDisabled();
    expect(subscription).toHaveTextContent('Part of the Rwaq subscription. Learners join it through their subscription.');
    expect(screen.getByRole('button', { name: /Free course/ })).toBeEnabled();
  });
});
