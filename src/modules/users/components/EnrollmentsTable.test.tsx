import { fireEvent, screen } from '@testing-library/react';
import { renderWrapper } from '@src/setupTest';
import type { UserEnrollment } from '../data/types';
import EnrollmentsTable from './EnrollmentsTable';

const row = (overrides: Partial<UserEnrollment>): UserEnrollment => ({
  courseId: 'course-v1:Org+Paid+2026',
  courseName: 'Paid course',
  enrolledAt: '2026-10-01T00:00:00Z',
  mode: 'no-id-professional',
  isActive: true,
  certificateStatus: null,
  availableModes: ['no-id-professional'],
  lastChangeReason: null,
  lastChangeBy: null,
  lastChangeAt: null,
  ...overrides,
});

describe('EnrollmentsTable', () => {
  it('hides Change mode and Unenroll for subscription content and keeps them for other courses', () => {
    const onUnenroll = jest.fn();
    renderWrapper(
      <EnrollmentsTable
        enrollments={[
          row({}),
          row({ courseId: 'course-v1:Org+Sub+2026', courseName: 'Subscription course', isPartOfSubscription: true }),
        ]}
        onChangeMode={jest.fn()}
        onUnenroll={onUnenroll}
      />,
    );

    expect(screen.getAllByRole('button', { name: /^Unenroll/ })).toHaveLength(1);
    expect(screen.getAllByRole('button', { name: /^Change mode/ })).toHaveLength(1);
    expect(screen.getByText("Managed by the learner's subscription")).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Unenroll, Paid course' }));
    expect(onUnenroll).toHaveBeenCalledWith(expect.objectContaining({ courseId: 'course-v1:Org+Paid+2026' }));
  });
});
