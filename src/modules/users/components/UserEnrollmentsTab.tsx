/**
 * Read-only enrollments for the detail drawer.
 *
 * Per-course role management stays in Studio and enrollment changes stay in the
 * Instructor dashboard — this tab only answers "what is this user enrolled in?".
 */
import { Alert, Badge, Spinner } from '@openedx/paragon';
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
      <div className="d-flex justify-content-center py-4">
        <Spinner animation="border" screenReaderText={intl.formatMessage(messages.tabEnrollments)} />
      </div>
    );
  }

  if (isError) {
    return <Alert variant="danger">{intl.formatMessage(messages.enrollmentsError)}</Alert>;
  }

  if (!data || data.length === 0) {
    return <p className="text-muted text-center py-4 mb-0">{intl.formatMessage(messages.enrollmentsEmpty)}</p>;
  }

  return (
    <>
      <p className="small text-muted">{intl.formatMessage(messages.enrollmentsReadOnly)}</p>
      <div className="table-responsive">
        <table className="table table-sm mb-0">
          <thead>
            <tr>
              <th scope="col">{intl.formatMessage(messages.enrollmentCourse)}</th>
              <th scope="col">{intl.formatMessage(messages.enrollmentDate)}</th>
              <th scope="col">{intl.formatMessage(messages.enrollmentStatus)}</th>
              <th scope="col">{intl.formatMessage(messages.enrollmentCertificate)}</th>
            </tr>
          </thead>
          <tbody>
            {data.map((enrollment) => (
              <tr key={enrollment.courseId}>
                <td>
                  <div>{enrollment.courseName}</div>
                  <div className="small text-muted">{enrollment.courseId}</div>
                </td>
                <td>
                  {enrollment.enrolledAt
                    ? new Date(enrollment.enrolledAt).toLocaleDateString()
                    : intl.formatMessage(messages.detailNone)}
                </td>
                <td>
                  <Badge variant={enrollment.isActive ? 'success' : 'light'}>
                    {intl.formatMessage(
                      enrollment.isActive ? messages.enrollmentActive : messages.enrollmentInactive,
                    )}
                  </Badge>
                </td>
                <td>{enrollment.certificateStatus ?? intl.formatMessage(messages.detailNone)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default UserEnrollmentsTab;
