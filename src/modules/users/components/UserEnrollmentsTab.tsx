/**
 * The learner's enrollments, and the three things an admin can do to them.
 *
 * Enrolling, changing a mode and unenrolling used to mean leaving for the
 * Instructor dashboard, one course at a time. They live here because this is
 * the screen where the admin already has the learner in front of them.
 *
 * Every write records a reason, and the most recent one is shown inline: an
 * enrollment that looks wrong is usually only explicable by who changed it and
 * why, and making that a separate lookup means it goes unchecked.
 */
import { useState } from 'react';
import {
  Alert, Button, Chip, Spinner,
} from '@openedx/paragon';
import { Add } from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import { useUserEnrollments } from '../data/hooks';
import type { UserEnrollment } from '../data/types';
import EnrollModal from '../modals/EnrollModal';
import ChangeModeModal from '../modals/ChangeModeModal';
import UnenrollModal from '../modals/UnenrollModal';
import messages from '../messages';

interface UserEnrollmentsTabProps {
  userId: number;
  /** For the modals' copy — an admin acting on the wrong learner is the risk. */
  userName: string;
}

const UserEnrollmentsTab = ({ userId, userName }: UserEnrollmentsTabProps) => {
  const intl = useIntl();
  const { data, isLoading, isError } = useUserEnrollments(userId);

  const [isEnrollOpen, setIsEnrollOpen] = useState(false);
  // One row at a time: which row a dialog is about has to be unambiguous, and
  // a boolean plus a separate id can disagree.
  const [modeTarget, setModeTarget] = useState<UserEnrollment | null>(null);
  const [unenrollTarget, setUnenrollTarget] = useState<UserEnrollment | null>(null);

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

  const enrollments = data ?? [];

  // The enroll action stays available on an empty list — an admin opening a new
  // learner's tab is exactly who needs it, and hiding it behind having at least
  // one enrollment already would be backwards.
  const head = (
    <div className="rwaq-enrollments__head">
      <span className="rwaq-enrollments__count">
        {intl.formatMessage(messages.enrollmentCount, { count: enrollments.length })}
      </span>
      <Button
        variant="primary"
        size="sm"
        iconBefore={Add}
        onClick={() => setIsEnrollOpen(true)}
      >
        {intl.formatMessage(messages.enrollAction)}
      </Button>
    </div>
  );

  const modals = (
    <>
      <EnrollModal
        isOpen={isEnrollOpen}
        onClose={() => setIsEnrollOpen(false)}
        userId={userId}
        userName={userName}
        enrollments={enrollments}
      />
      <ChangeModeModal
        isOpen={modeTarget !== null}
        onClose={() => setModeTarget(null)}
        userId={userId}
        enrollment={modeTarget}
      />
      <UnenrollModal
        isOpen={unenrollTarget !== null}
        onClose={() => setUnenrollTarget(null)}
        userId={userId}
        userName={userName}
        enrollment={unenrollTarget}
      />
    </>
  );

  if (enrollments.length === 0) {
    return (
      <>
        {head}
        <p className="text-muted text-center py-5 mb-0">
          {intl.formatMessage(messages.enrollmentsEmpty)}
        </p>
        {modals}
      </>
    );
  }

  return (
    <>
      {head}

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
              <th scope="col" className="rwaq-enrollments__actions-col">
                {intl.formatMessage(messages.enrollmentActions)}
              </th>
            </tr>
          </thead>
          <tbody>
            {enrollments.map((enrollment) => (
              <tr key={enrollment.courseId}>
                <td>
                  <div className="rwaq-user-cell__name">{enrollment.courseName}</div>
                  <div className="rwaq-user-cell__meta">{enrollment.courseId}</div>
                  {/* The last admin change belongs to the row as a whole, and
                      this is the only cell with room for a sentence. A row with
                      no audit line was never touched by an admin — an absent
                      line says that better than a column of "self-enrolled". */}
                  {enrollment.lastChangeReason && (
                    <div className="rwaq-enrollments__audit">
                      {intl.formatMessage(messages.enrollmentLastChangeBy, {
                        reason: enrollment.lastChangeReason,
                        actor: enrollment.lastChangeBy ?? intl.formatMessage(messages.detailNone),
                        date: enrollment.lastChangeAt
                          ? new Date(enrollment.lastChangeAt).toLocaleDateString()
                          : intl.formatMessage(messages.detailNone),
                      })}
                    </div>
                  )}
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
                <td className="rwaq-enrollments__actions-col">
                  {/* Two small outline buttons rather than a kebab menu: it
                      matches the list page's row actions, and a Dropdown.Menu
                      here would be clipped by .rwaq-minitable-scroll's own
                      overflow. Both are disabled on an unenrolled row — there
                      is no mode to change and nothing left to unenroll from. */}
                  <div className="rwaq-row-actions">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      disabled={!enrollment.isActive}
                      onClick={() => setModeTarget(enrollment)}
                      aria-label={`${intl.formatMessage(messages.modeChangeAction)} — ${enrollment.courseName}`}
                    >
                      {intl.formatMessage(messages.modeChangeAction)}
                    </Button>
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      disabled={!enrollment.isActive}
                      onClick={() => setUnenrollTarget(enrollment)}
                      aria-label={`${intl.formatMessage(messages.unenrollAction)} — ${enrollment.courseName}`}
                    >
                      {intl.formatMessage(messages.unenrollAction)}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modals}
    </>
  );
};

export default UserEnrollmentsTab;
