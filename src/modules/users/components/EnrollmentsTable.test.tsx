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

  it('shows a spinner in the progress column until the progress arrives', () => {
    renderWrapper(
      <EnrollmentsTable enrollments={[row({ status: 'passed' })]} isProgressLoading onChangeMode={jest.fn()} onUnenroll={jest.fn()} />,
    );

    expect(screen.getByText('Loading progress')).toBeInTheDocument();
    expect(screen.getByText('Paid course')).toBeInTheDocument();
  });

  it('shows the progress of each course once it has loaded', () => {
    renderWrapper(
      <EnrollmentsTable
        enrollments={[row({})]}
        progress={[{ courseId: 'course-v1:Org+Paid+2026', progressPercent: 45 }]}
        onChangeMode={jest.fn()}
        onUnenroll={jest.fn()}
      />,
    );

    expect(screen.getByText('45%')).toBeInTheDocument();
  });

  it('says Not available when the progress of a course could not be worked out', () => {
    renderWrapper(
      <EnrollmentsTable
        enrollments={[row({ status: 'passed' })]}
        progress={[{ courseId: 'course-v1:Org+Paid+2026', progressPercent: null }]}
        onChangeMode={jest.fn()}
        onUnenroll={jest.fn()}
      />,
    );

    expect(screen.getByText('Not available')).toBeInTheDocument();
  });

  it('says Not available when the whole progress request failed', () => {
    renderWrapper(
      <EnrollmentsTable enrollments={[row({})]} onChangeMode={jest.fn()} onUnenroll={jest.fn()} />,
    );

    expect(screen.getAllByText('Not available').length).toBeGreaterThan(0);
  });

  it('shows no progress for an unenrolled course', () => {
    renderWrapper(
      <EnrollmentsTable
        enrollments={[row({ isActive: false })]}
        isProgressLoading
        onChangeMode={jest.fn()}
        onUnenroll={jest.fn()}
      />,
    );

    expect(screen.queryByText('Loading progress')).not.toBeInTheDocument();
  });

  it('shows status, grade, last activity, certificate date and the state of the course', () => {
    renderWrapper(
      <EnrollmentsTable
        enrollments={[row({
          status: 'passed',
          gradePercent: 88.5,
          lastActivityAt: '2026-11-01T10:00:00Z',
          certificateIssuedAt: '2026-11-02T10:00:00Z',
          courseStatus: 'ended',
          courseEnd: '2026-11-03T10:00:00Z',
        })]}
        onChangeMode={jest.fn()}
        onUnenroll={jest.fn()}
      />,
    );

    expect(screen.getByText('Passed')).toBeInTheDocument();
    expect(screen.getByText('88.5%')).toBeInTheDocument();
    expect(screen.getByText('Ended')).toBeInTheDocument();
    expect(screen.getByText(/^Ends /)).toBeInTheDocument();
  });

  it('keeps Change mode and Unenroll working with the new columns', () => {
    const onChangeMode = jest.fn();
    renderWrapper(
      <EnrollmentsTable enrollments={[row({ status: 'in_progress' })]} onChangeMode={onChangeMode} onUnenroll={jest.fn()} />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Change mode, Paid course' }));
    expect(onChangeMode).toHaveBeenCalledWith(expect.objectContaining({ courseId: 'course-v1:Org+Paid+2026' }));
  });
});
