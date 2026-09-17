/**
 * Modal to enroll a batch of learners into a program by email address.
 *
 * A textarea rather than a picker: the admin is working from a list someone
 * sent them — a sponsor's cohort, a spreadsheet column — so pasting it whole
 * is the actual task. The backend splits on commas, semicolons and newlines,
 * lower-cases and de-duplicates, so whatever shape that paste arrives in is
 * handled server-side rather than guessed at here.
 *
 * A bulk enroll is normally a partial success — some addresses have no account
 * yet — so the response is a breakdown, not a pass/fail. The modal stays open
 * afterwards to show it: closing on success would throw away the one piece of
 * information the admin needs, which addresses did not go through.
 */
import React, { useEffect, useState } from 'react';
import { Alert } from '@openedx/paragon';
import { logError } from '@edx/frontend-platform/logging';
import { useIntl } from '@edx/frontend-platform/i18n';
import FormModal from '@src/components/FormModal';
import { useToast } from '@src/components/ToastContext';
import { getErrorReason } from '@src/data/httpError';
import { useBulkEnrollLearners } from '../data/hooks';
import type { BulkEnrollResult } from '../data/types';
import messages from '../messages';

/** Mirrors AdminProgramBulkEnrollSerializer.MAX_EMAILS on the backend. */
const MAX_EMAILS = 200;

/**
 * Addresses sent per request.
 *
 * Each learner costs one Enrollment row plus one CourseEnrollment per course
 * in the program, so the work per request scales with the program's course
 * count as well as the batch size. Chunking keeps any single request short
 * regardless of either, so a long list cannot hit a gateway timeout — and the
 * admin still gets the per-address breakdown a background job could not give
 * them without a status endpoint to poll.
 */
const CHUNK_SIZE = 25;

/** Same split the backend applies, so chunks line up with what it will act on. */
const splitAddresses = (value: string): string[] => (
  value.split(/[,;\s]+/).filter(Boolean)
);

/**
 * Same shape check as AdminProgramBulkEnrollSerializer._EMAIL.
 *
 * Deliberately loose — real addresses here carry '+' tags and unicode local
 * parts, and whether an account exists is the backend's call. This only rules
 * out tokens that cannot be an address at all.
 */
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

interface BulkEnrollModalProps {
  isOpen: boolean;
  onClose: () => void;
  uuid: string;
}

const BulkEnrollModal = ({
  isOpen, onClose, uuid,
}: BulkEnrollModalProps) => {
  const intl = useIntl();
  const { showToast } = useToast();
  const [emails, setEmails] = useState('');
  const [result, setResult] = useState<BulkEnrollResult | null>(null);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);

  const { mutateAsync, isPending } = useBulkEnrollLearners(uuid);

  // Reset on open so a second enroll never shows the previous run's results.
  useEffect(() => {
    if (isOpen) {
      setEmails('');
      setResult(null);
      setError('');
      setProgress(null);
    }
  }, [isOpen]);

  const addresses = splitAddresses(emails);
  // Count only what could actually be an address. Counting every token instead
  // would tell an admin who typed a stray word that they have one more learner
  // than they do, and the backend would then reject the whole submission.
  const valid = addresses.filter((a) => EMAIL_RE.test(a));
  const invalid = addresses.filter((a) => !EMAIL_RE.test(a));
  const count = valid.length;
  const overMax = count > MAX_EMAILS;
  // Nothing to send, too many, or something that is not an address: the button
  // is disabled rather than silently doing nothing when clicked.
  const cannotSubmit = count === 0 || overMax || invalid.length > 0;

  const handleSubmit = async (event?: React.FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    if (cannotSubmit) { return; }
    setError('');
    setProgress({ done: 0, total: count });

    // Accumulated across chunks so the admin sees one breakdown rather than
    // one per request.
    const merged: BulkEnrollResult = {
      enrolled: [], alreadyEnrolled: [], failed: [], courseFailures: [],
    };

    try {
      for (let i = 0; i < valid.length; i += CHUNK_SIZE) {
        const chunk = valid.slice(i, i + CHUNK_SIZE);
        // Sequential on purpose: parallel chunks would enroll the same learner
        // into the same courses at once, and pile concurrent writes onto the
        // LMS for no gain in an operation that is already fast per chunk.
        // eslint-disable-next-line no-await-in-loop
        const res = await mutateAsync(chunk.join(','));
        merged.enrolled.push(...res.enrolled);
        merged.alreadyEnrolled.push(...res.alreadyEnrolled);
        merged.failed.push(...res.failed);
        merged.courseFailures.push(...res.courseFailures);
        setProgress({ done: Math.min(i + CHUNK_SIZE, valid.length), total: count });
      }
      setResult(merged);
      if (merged.enrolled.length > 0) {
        showToast(intl.formatMessage(messages.bulkEnrollSuccess, {
          count: merged.enrolled.length,
        }));
      }
    } catch (err) {
      logError(err);
      // Show what did land before the failure — those learners are enrolled,
      // and the admin needs to know which ones so a retry does not look like
      // it silently did nothing.
      if (merged.enrolled.length || merged.alreadyEnrolled.length || merged.failed.length) {
        setResult(merged);
      }
      setError(getErrorReason(err) ?? intl.formatMessage(messages.bulkEnrollError));
    } finally {
      setProgress(null);
    }
  };

  // After a run the form is replaced by its outcome, so the only useful action
  // is to close — relabel the button rather than leaving a submit that would
  // re-enroll the same list.
  const isDone = result !== null;

  return (
    <FormModal
      title={intl.formatMessage(messages.bulkEnrollTitle)}
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={isDone
        ? (event?: React.FormEvent<HTMLFormElement>) => { event?.preventDefault(); onClose(); }
        : handleSubmit}
      submitLabel={intl.formatMessage(
        isDone ? messages.bulkEnrollClose : messages.bulkEnrollSubmit,
      )}
      cancelLabel={intl.formatMessage(messages.bulkEnrollCancel)}
      isSubmitting={isPending}
      isSubmitDisabled={!isDone && cannotSubmit}
      size="lg"
    >
      {error && <Alert variant="danger" className="mb-3">{error}</Alert>}

      {!isDone && (
        <>
          <p className="small text-muted mb-3">
            {intl.formatMessage(messages.bulkEnrollHelp)}
          </p>

          <label className="d-block mb-1 font-weight-bold small" htmlFor="bulk-enroll-emails">
            {intl.formatMessage(messages.bulkEnrollLabel)}
          </label>
          <textarea
            id="bulk-enroll-emails"
            className="form-control"
            rows={8}
            dir="ltr"
            value={emails}
            disabled={isPending}
            placeholder={intl.formatMessage(messages.bulkEnrollPlaceholder)}
            onChange={(e) => setEmails(e.target.value)}
          />

          <div className="d-flex justify-content-between align-items-baseline mt-1">
            {/* The cap is stated up front rather than only once it is breached —
                an admin pasting a long list needs to know before they paste. */}
            <span className="small text-muted">
              {intl.formatMessage(messages.bulkEnrollMax, { max: MAX_EMAILS })}
            </span>
            <span className={`small ${overMax ? 'text-danger font-weight-bold' : 'text-muted'}`}>
              {progress
                ? intl.formatMessage(messages.bulkEnrollProgress, progress)
                : intl.formatMessage(messages.bulkEnrollCount, { count, max: MAX_EMAILS })}
            </span>
          </div>

          {invalid.length > 0 && (
            <Alert variant="danger" className="mt-3 mb-0">
              <div className="mb-1">
                {intl.formatMessage(messages.bulkEnrollInvalid, { count: invalid.length })}
              </div>
              <div className="small" dir="ltr">{invalid.slice(0, 10).join(', ')}</div>
            </Alert>
          )}

          {overMax && (
            <Alert variant="danger" className="mt-3 mb-0">
              {intl.formatMessage(messages.bulkEnrollOverMax, {
                count, max: MAX_EMAILS,
              })}
            </Alert>
          )}
        </>
      )}

      {isDone && result && (
        <div className="d-flex flex-column" style={{ gap: '1rem' }}>
          <Alert variant={result.enrolled.length > 0 ? 'success' : 'info'} className="mb-0">
            {result.enrolled.length > 0
              ? intl.formatMessage(messages.bulkEnrollSuccess, { count: result.enrolled.length })
              : intl.formatMessage(messages.bulkEnrollNoneEnrolled)}
            {result.alreadyEnrolled.length > 0 && (
              <div className="small mt-1">
                {intl.formatMessage(messages.bulkEnrollAlready, {
                  count: result.alreadyEnrolled.length,
                })}
              </div>
            )}
          </Alert>

          {result.failed.length > 0 && (
            <Alert variant="warning" className="mb-0">
              <div className="font-weight-bold mb-2">
                {intl.formatMessage(messages.bulkEnrollFailedTitle, {
                  count: result.failed.length,
                })}
              </div>
              <ul className="mb-0 pl-3 small" style={{ maxHeight: '11rem', overflowY: 'auto' }}>
                {result.failed.map((f) => (
                  <li key={f.email} dir="ltr">
                    <span className="font-weight-bold">{f.email}</span>
                    {' — '}
                    {f.reason}
                  </li>
                ))}
              </ul>
            </Alert>
          )}

          {result.courseFailures.length > 0 && (
            <Alert variant="warning" className="mb-0">
              <div className="font-weight-bold mb-2">
                {intl.formatMessage(messages.bulkEnrollCourseFailedTitle)}
              </div>
              <ul className="mb-0 pl-3 small" style={{ maxHeight: '11rem', overflowY: 'auto' }}>
                {result.courseFailures.map((f) => (
                  <li key={`${f.email}-${f.courseId}`} dir="ltr">
                    <span className="font-weight-bold">{f.email}</span>
                    {' — '}
                    {f.courseId}
                  </li>
                ))}
              </ul>
            </Alert>
          )}
        </div>
      )}
    </FormModal>
  );
};

export default BulkEnrollModal;
