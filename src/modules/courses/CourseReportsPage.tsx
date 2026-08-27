/**
 * CourseReportsPage — reports hub for a single course.
 *
 *   1. Generate Reports — async trigger cards (7 report types)
 *   2. Grading Configuration — sync inline grader/cutoff table
 *   3. Org Enrollment Summary — sync inline enrollment counts
 *   4. Reports Available for Download — unified polled table (10 s while in-progress)
 */
import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Alert, Badge, Button, Spinner, Table,
} from '@openedx/paragon';
import AdminDataTable from '@src/components/AdminDataTable';
import type { ColumnDef } from '@src/components/AdminDataTable';
import { useCourse } from './data/hooks';
import type { CourseReportType, ReportDownloadRow, TaskState } from './data/reportsTypes';
import {
  useCourseGradingConfig,
  useCourseOrgEnrollmentSummary,
  useCourseReportDownloads,
  useTriggerCourseReport,
} from './data/reportsHooks';

// ── Report definitions ────────────────────────────────────────────────────────

interface ReportDef {
  type: CourseReportType;
  label: string;
  description: string;
}

const REPORT_DEFS: ReportDef[] = [
  {
    type: 'grade_csv',
    label: 'Grade Report',
    description:
      'Generates a CSV of current student grades for all course sections. '
      + 'Each row contains the student identifier, grade total, and per-section scores.',
  },
  {
    type: 'problem_grade',
    label: 'Problem Grade Report',
    description:
      'Generates a CSV with per-problem scores for every student. '
      + 'Useful for identifying which specific problems have low scores or high failure rates.',
  },
  {
    type: 'profile_info',
    label: 'Profile Information',
    description:
      'Generates a CSV of enrolled student profile data (name, email, location, '
      + 'year of birth, education level, and enrollment mode).',
  },
  {
    type: 'may_enroll',
    label: 'Learners Who Can Enroll',
    description:
      "Generates a CSV of users who are in the course's invitation list but have "
      + 'not yet enrolled, useful for targeted outreach.',
  },
  {
    type: 'inactive_learner',
    label: 'Learners, Account Not Activated',
    description:
      'Generates a CSV of enrolled learners whose accounts have never been activated '
      + '(email not confirmed), so they cannot access course content.',
  },
  {
    type: 'survey',
    label: 'Survey Results',
    description:
      'Generates a CSV of responses to any survey components in this course, '
      + 'including per-question answers for every respondent.',
  },
  {
    type: 'proctored_exam',
    label: 'Proctored Exam Results',
    description:
      'Generates a CSV of proctored exam attempt statuses for all students '
      + '(pending review, verified, rejected, etc.).',
  },
];

// ── State badge ───────────────────────────────────────────────────────────────

const STATE_VARIANT: Record<TaskState, string> = {
  QUEUING: 'primary',
  IN_PROGRESS: 'primary',
  SUCCESS: 'success',
  FAILURE: 'danger',
  REVOKED: 'secondary',
};

const STATE_LABEL: Record<TaskState, string> = {
  QUEUING: 'Queuing',
  IN_PROGRESS: 'In Progress',
  SUCCESS: 'Complete',
  FAILURE: 'Failed',
  REVOKED: 'Revoked',
};

const StateBadge = ({ state }: { state: TaskState }) => (
  <Badge variant={STATE_VARIANT[state] || 'secondary'}>
    {STATE_LABEL[state] || state}
  </Badge>
);

// ── Elapsed time helper ───────────────────────────────────────────────────────

const elapsedLabel = (created: string, modified: string | null, state: TaskState): string => {
  const end = (state === 'SUCCESS' || state === 'FAILURE' || state === 'REVOKED') && modified
    ? new Date(modified).getTime()
    : Date.now();
  const secs = Math.max(0, Math.round((end - new Date(created).getTime()) / 1000));
  if (secs < 60) { return `${secs}s`; }
  const mins = Math.floor(secs / 60);
  const rem = secs % 60;
  if (mins < 60) { return rem > 0 ? `${mins}m ${rem}s` : `${mins}m`; }
  const hrs = Math.floor(mins / 60);
  const remMins = mins % 60;
  return remMins > 0 ? `${hrs}h ${remMins}m` : `${hrs}h`;
};

// ── Single report trigger row ─────────────────────────────────────────────────

const ReportTriggerRow = ({
  def,
  courseId,
}: {
  def: ReportDef;
  courseId: string;
}) => {
  const { mutate, isPending: isLoading, isError, error } = useTriggerCourseReport(courseId);
  const [triggered, setTriggered] = useState(false);

  const handleClick = () => {
    setTriggered(false);
    mutate(def.type, {
      onSuccess: () => setTriggered(true),
    });
  };

  const errorMsg = isError
    ? (error as { message?: string })?.message || 'Failed to trigger report.'
    : null;

  return (
    <div className="py-3 border-bottom d-flex align-items-start justify-content-between gap-3">
      <div>
        <div className="font-weight-semibold" style={{ fontSize: '0.9375rem' }}>{def.label}</div>
        <div className="text-muted small mt-1">{def.description}</div>
        {triggered && !isLoading && (
          <div className="text-success small mt-1">
            Report queued, it will appear in the downloads table below.
          </div>
        )}
        {errorMsg && (
          <div className="text-danger small mt-1">{errorMsg}</div>
        )}
      </div>
      <Button
        variant="outline-primary"
        size="sm"
        onClick={handleClick}
        disabled={isLoading}
        style={{ whiteSpace: 'nowrap', flexShrink: 0 }}
      >
        {isLoading ? (
          <>
            <Spinner animation="border" size="sm" screenReaderText="Generating" />
            {' '}Generating…
          </>
        ) : 'Generate'}
      </Button>
    </div>
  );
};

// ── Grading configuration section ─────────────────────────────────────────────

const GradingConfigSection = ({ courseId }: { courseId: string }) => {
  const { data, isLoading, isError } = useCourseGradingConfig(courseId, !!courseId);

  if (isLoading) {
    return (
      <div className="d-flex align-items-center gap-2 py-3 text-muted small">
        <Spinner animation="border" size="sm" screenReaderText="Loading grading config" />
        Loading grading configuration…
      </div>
    );
  }

  if (isError) {
    return <Alert variant="warning" className="mb-0">Could not load grading configuration.</Alert>;
  }

  if (!data) { return null; }

  const { grader, gradeCutoffs } = data;

  return (
    <>
      {grader.length > 0 && (
        <div className="mb-4" style={{ overflowX: 'auto' }}>
          <Table size="sm" className="mb-0">
            <caption className="sr-only">Grader breakdown</caption>
            <thead>
              <tr>
                <th>Type</th>
                <th>Label</th>
                <th className="text-right" style={{ fontVariantNumeric: 'tabular-nums' }}>Weight</th>
                <th className="text-right" style={{ fontVariantNumeric: 'tabular-nums' }}>Min Count</th>
                <th className="text-right" style={{ fontVariantNumeric: 'tabular-nums' }}>Drop Count</th>
              </tr>
            </thead>
            <tbody>
              {grader.map((entry) => (
                <tr key={entry.type}>
                  <td>{entry.type}</td>
                  <td className="text-muted">{entry.shortLabel || '—'}</td>
                  <td className="text-right">{(entry.weight * 100).toFixed(0)}%</td>
                  <td className="text-right">{entry.minCount}</td>
                  <td className="text-right">{entry.dropCount}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}

      {Object.keys(gradeCutoffs).length > 0 && (
        <div>
          <p className="text-muted small mb-2 font-weight-semibold">Grade cutoffs</p>
          <div className="d-flex flex-wrap gap-3">
            {Object.entries(gradeCutoffs)
              .sort(([, a], [, b]) => b - a)
              .map(([grade, cutoff]) => (
                <div key={grade} className="text-center">
                  <div className="font-weight-semibold" style={{ fontSize: '1.125rem', fontVariantNumeric: 'tabular-nums' }}>
                    {(cutoff * 100).toFixed(0)}%
                  </div>
                  <div className="text-muted small">{grade}</div>
                </div>
              ))}
          </div>
        </div>
      )}

      {grader.length === 0 && Object.keys(gradeCutoffs).length === 0 && (
        <p className="text-muted small mb-0">No grading configuration found for this course.</p>
      )}
    </>
  );
};

// ── Org enrollment summary section ────────────────────────────────────────────

const OrgEnrollmentSummarySection = ({ courseId }: { courseId: string }) => {
  const { data, isLoading, isError } = useCourseOrgEnrollmentSummary(courseId, {}, !!courseId);

  if (isLoading) {
    return (
      <div className="d-flex align-items-center gap-2 py-3 text-muted small">
        <Spinner animation="border" size="sm" screenReaderText="Loading enrollment summary" />
        Loading enrollment summary…
      </div>
    );
  }

  if (isError) {
    return <Alert variant="warning" className="mb-0">Could not load enrollment summary.</Alert>;
  }

  if (!data) { return null; }

  const modes = Object.entries(data.byMode).sort(([, a], [, b]) => b - a);

  return (
    <div className="d-flex flex-wrap gap-4 align-items-start">
      <div className="text-center">
        <div
          className="font-weight-semibold"
          style={{ fontSize: '1.5rem', fontVariantNumeric: 'tabular-nums' }}
        >
          {data.totalActiveEnrollments.toLocaleString()}
        </div>
        <div className="text-muted small">Active enrollments</div>
        <div className="text-muted" style={{ fontSize: '0.75rem' }}>
          across {data.totalCoursesInOrg} {data.org} courses
        </div>
      </div>

      {modes.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <Table size="sm" className="mb-0">
            <caption className="sr-only">Enrollment by mode</caption>
            <thead>
              <tr>
                <th>Mode</th>
                <th className="text-right" style={{ fontVariantNumeric: 'tabular-nums' }}>Count</th>
                <th className="text-right" style={{ fontVariantNumeric: 'tabular-nums' }}>Share</th>
              </tr>
            </thead>
            <tbody>
              {modes.map(([mode, count]) => (
                <tr key={mode}>
                  <td>{mode}</td>
                  <td className="text-right">{count.toLocaleString()}</td>
                  <td className="text-right">
                    {data.totalActiveEnrollments > 0
                      ? `${((count / data.totalActiveEnrollments) * 100).toFixed(1)}%`
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}
    </div>
  );
};

// ── Downloads table ───────────────────────────────────────────────────────────

const DOWNLOADS_PAGE_SIZE = 10;

const DOWNLOADS_COLUMNS: ColumnDef<ReportDownloadRow>[] = [
  {
    key: 'reportLabel',
    label: 'Report Type',
  },
  {
    key: 'state',
    label: 'Status',
    renderCell: (value) => <StateBadge state={value as TaskState} />,
  },
  {
    key: 'created',
    label: 'Generated',
    renderCell: (value) => (
      <span style={{ whiteSpace: 'nowrap' }}>
        {new Date(value as string).toLocaleString()}
      </span>
    ),
  },
  {
    key: 'modified',
    label: 'Elapsed',
    id: 'elapsed',
    renderCell: (value, row) => (
      <span style={{ fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
        {elapsedLabel(row.created, value as string | null, row.state)}
      </span>
    ),
  },
  {
    key: 'succeeded',
    label: 'Progress',
    renderCell: (_value, row) => (
      <span style={{ fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
        {row.total != null ? `${row.succeeded ?? 0} / ${row.total}` : '—'}
      </span>
    ),
  },
  {
    key: 'downloadUrl',
    label: 'Download',
    renderCell: (value) => (
      value ? (
        <Button
          variant="outline-primary"
          size="sm"
          href={value as string}
          target="_blank"
          rel="noopener noreferrer"
        >
          Download
        </Button>
      ) : (
        <span className="text-muted">—</span>
      )
    ),
  },
];

const DownloadsTable = ({ courseId }: { courseId: string }) => {
  const { data: rows, isLoading, isError } = useCourseReportDownloads(courseId);
  const [page, setPage] = useState(1);

  if (isError) {
    return <Alert variant="warning" className="mb-0">Could not load available reports.</Alert>;
  }

  const totalRows = rows?.length ?? 0;
  const pageCount = Math.max(1, Math.ceil(totalRows / DOWNLOADS_PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageRows = (rows ?? []).slice(
    (currentPage - 1) * DOWNLOADS_PAGE_SIZE,
    currentPage * DOWNLOADS_PAGE_SIZE,
  );

  return (
    <AdminDataTable
      columns={DOWNLOADS_COLUMNS}
      data={pageRows}
      isLoading={isLoading}
      caption="Reports Available for Download"
      pagination={{
        currentPage,
        pageCount,
        itemCount: totalRows,
        pageSize: DOWNLOADS_PAGE_SIZE,
        onPageChange: setPage,
      }}
    />
  );
};

// ── Main page ─────────────────────────────────────────────────────────────────

const CourseReportsPage = () => {
  const { courseId = '' } = useParams<{ courseId: string }>();
  const { data: course, isLoading: courseLoading } = useCourse(courseId);

  if (courseLoading) {
    return (
      <div className="rwaq-page">
        <div className="d-flex justify-content-center py-5">
          <Spinner animation="border" screenReaderText="Loading course" />
        </div>
      </div>
    );
  }

  const courseName = course?.displayName || courseId;
  const courseHref = `/courses/${encodeURIComponent(courseId)}`;

  return (
    <div className="rwaq-page">
      <div className="rwaq-page-header">
        <div className="rwaq-page-header__breadcrumb">
          <Link to="/courses">Courses</Link>
          {' / '}
          <Link to={courseHref}>{courseName}</Link>
          {' / Reports'}
        </div>
        <h1 className="rwaq-page-title mt-2">Reports</h1>
      </div>

      {/* Generate Reports */}
      <div className="rwaq-card mt-4">
        <h2 className="rwaq-section-title mb-1">Generate Reports</h2>
        <p className="text-muted small mb-3">
          Click <strong>Generate</strong> next to a report type to start an async task.
          Completed reports appear in the downloads section below.
        </p>
        {REPORT_DEFS.map((def) => (
          <ReportTriggerRow key={def.type} def={def} courseId={courseId} />
        ))}
      </div>

      {/* Grading Configuration */}
      <div className="rwaq-card mt-4">
        <h2 className="rwaq-section-title mb-3">Grading Configuration</h2>
        <GradingConfigSection courseId={courseId} />
      </div>

      {/* Org Enrollment Summary */}
      <div className="rwaq-card mt-4">
        <h2 className="rwaq-section-title mb-3">Org Enrollment Summary</h2>
        <p className="text-muted small mb-3">
          Active enrollment counts across all courses in this organization.
        </p>
        <OrgEnrollmentSummarySection courseId={courseId} />
      </div>

      {/* Reports Available for Download */}
      <div className="rwaq-card mt-4">
        <h2 className="rwaq-section-title mb-1">Reports Available for Download</h2>
        <p className="text-muted small mb-3">
          The table below auto-refreshes every 10 seconds while a report is processing.
          Download links expire after 5 minutes, regenerate if the link stops working.
        </p>
        <DownloadsTable courseId={courseId} />
      </div>
    </div>
  );
};

export default CourseReportsPage;
