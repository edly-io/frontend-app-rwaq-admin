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
          courseId: 'course-v1:Org+Free+2026',
          displayName: 'Free course',
          org: 'Org',
          availableModes: ['honor'],
          start: null,
          end: null,
        },
        {
          courseId: 'course-v1:Org+Prog+2026',
          displayName: 'Program-only course',
          org: 'Org',
          availableModes: ['honor'],
          isProgramOnly: true,
          start: null,
          end: null,
        },
      ],
      isFetching: false,
      isError: false,
    });
  });

  afterEach(() => jest.useRealTimers());

  it('lists Program-only courses greyed out with a note', () => {
    renderWrapper(<CoursePicker selected={null} onSelect={jest.fn()} activeCourseIds={[]} />);
    fireEvent.change(screen.getByRole('textbox', { name: 'Course' }), { target: { value: 'course' } });
    act(() => { jest.runAllTimers(); });

    const programOnly = screen.getByRole('button', { name: /Program-only course/ });
    expect(programOnly).toBeDisabled();
    expect(programOnly).toHaveTextContent('Program-only course. Enroll the learner in its program instead.');
    expect(screen.getByRole('button', { name: /Free course/ })).toBeEnabled();
  });
});
