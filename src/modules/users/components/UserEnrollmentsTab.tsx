/**
 * Read-only enrollments for the detail drawer.
 *
 * Enrollment changes stay in the Instructor dashboard and per-course roles stay
 * in Studio — this only answers "what is this user enrolled in?". The table
 * scrolls horizontally on narrow screens rather than letting a long course key
 * push the modal sideways.
 */
import { Alert, Chip, Spinner } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import { useUserEnrollments } from '../data/hooks';
import messages from '../messages';

interface UserEnrollmentsTabProps {
  userId: number;
}

const UserEnrollmentsTab = ({ userId }: UserEnrollmentsTabProps) => {
  const intl = useIntl();
  const { data, isLoading, isError } = useUserEnrollments(userId);

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <Spinner animation="border" screenReaderText={intl.formatMessage(messages.tabEnrollments)} />
      </div>
    );
  }

  if (isError) {
    return <Alert variant="danger">{intl.formatMessage(messages.enrollmentsError)}</Alert>;
  }

  if (!data || data.length === 0) {
    return (
      <p className="text-muted text-center py-5 mb-0">
        {intl.formatMessage(messages.enrollmentsEmpty)}
      </p>
    );
  }

  return (
    <>
      <div className="rwaq-enrollments__head">
        <span className="rwaq-enrollments__count">
          {intl.formatMessage(messages.enrollmentCount, { count: data.length })}
        </span>
        <span className="rwaq-enrollments__note">
          {intl.formatMessage(messages.enrollmentsReadOnly)}
        </span>
      </div>

      <div className="rwaq-minitable-scroll">
        <table className="table table-sm mb-0 rwaq-mini-table rwaq-enrollments__table">
          <thead>
            <tr>
              <th scope="col">{intl.formatMessage(messages.enrollmentCourse)}</th>
              <th scope="col">{intl.formatMessage(messages.enrollmentMode)}</th>
              <th scope="col" className="rwaq-mini-table__num">
                {intl.formatMessage(messages.enrollmentDate)}
              </th>
              <th scope="col">{intl.formatMessage(messages.enrollmentStatus)}</th>
              <th scope="col">{intl.formatMessage(messages.enrollmentCertificate)}</th>
            </tr>
          </thead>
          <tbody>
            {data.map((enrollment) => (
              <tr key={enrollment.courseId}>
                <td>
                  <div className="rwaq-user-cell__name">{enrollment.courseName}</div>
                  <div className="rwaq-user-cell__meta">{enrollment.courseId}</div>
                </td>
                <td>
                  <span className="rwaq-enrollments__mode">{enrollment.mode}</span>
                </td>
                <td className="rwaq-mini-table__num">
                  {enrollment.enrolledAt
                    ? new Date(enrollment.enrolledAt).toLocaleDateString()
                    : intl.formatMessage(messages.detailNone)}
                </td>
                <td>
                  <Chip className={`rwaq-chip rwaq-chip--${enrollment.isActive ? 'success' : 'light'}`}>
                    {intl.formatMessage(
                      enrollment.isActive ? messages.enrollmentActive : messages.enrollmentInactive,
                    )}
                  </Chip>
                </td>
                <td className="text-nowrap">
                  {enrollment.certificateStatus
                    ? (
                      <span className="rwaq-enrollments__cert">{enrollment.certificateStatus}</span>
                    )
                    : (
                      <span className="rwaq-enrollments__cert--none">
                        {intl.formatMessage(messages.enrollmentNoCertificate)}
                      </span>
                    )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default UserEnrollmentsTab;
