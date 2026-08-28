/**
 * CourseReportsPage — reports hub for a single course.
 *
 *   1. Generate Reports — async trigger cards (11 report types)
 *   2. Grading Configuration — grader breakdown + grade cutoffs
 *   3. Certificates Issued — inline table with CSV export
 *   4. Reports Available for Download — unified polled table (10 s while in-progress)
 */
import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Alert, Badge, Button, Spinner,
} from '@openedx/paragon';
import AdminDataTable from '@src/components/AdminDataTable';
import type { ColumnDef } from '@src/components/AdminDataTable';
import { useCourse } from './data/hooks';
import type {
  CourseCertificate, CourseReportType, ReportDownloadRow, TaskState,
} from './data/reportsTypes';
import {
  useCourseCertificates,
  useCourseGradingConfig,
  useCourseReportDownloads,
  useTriggerCourseReport,
} from './data/reportsHooks';
import type { GradingConfigEntry } from './data/reportsTypes';

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
      'Generates a CSV of current student grades. Each row contains student ID, email, username, '
      + 'cumulative grade, per-assignment scores, enrollment track, verification status, '
      + 'and certificate eligibility/delivery status.',
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
      'Generates a CSV of enrolled student profile data including username, name, email, '
      + 'language, location, year of birth, gender, education level, mailing address, '
      + 'goals, enrollment mode, account activation status, and enrollment date.',
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
      'Generates a CSV of responses from the course survey module. '
      + 'Columns are User ID, User Name, Email, and one column per survey field answered.',
  },
  {
    type: 'proctored_exam',
    label: 'Proctored Exam Results',
    description:
      'Generates a CSV of all proctored exam attempts, including exam name, provider, '
      + 'student info, attempt timing, attempt status, review status, '
      + 'and any reviewer comments (suspicious activity or rules violations).',
  },
  {
    type: 'ora_data',
    label: 'ORA Data Report',
    description: 'Generates a CSV of all Open Response Assessment submissions. '
      + 'Columns include Submission ID, block location, question prompt, username, '
      + 'submission text, submission date, and attempt number.',
  },
  {
    type: 'ora_summary',
    label: 'ORA Summary Report',
    description: 'Generates a CSV summary of ORA grading outcomes per learner per problem. '
      + 'Includes final scores, grader counts, and overall pass/fail determination.',
  },
  {
    type: 'ora_submission_archive',
    label: 'ORA Submission Files Archive',
    description: 'Generates a ZIP archive containing all ORA submission text files and '
      + 'any uploaded file attachments submitted by learners for this course.',
  },
  {
    type: 'anon_ids',
    label: 'Student Anonymized IDs',
    description: 'Generates a CSV mapping each enrolled learner\'s real user ID to their '
      + 'anonymized user ID. Used for research and analytics that require de-identified data.',
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
  const {
    mutate, isPending: isLoading, isError, error,
  } = useTriggerCourseReport(courseId);
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
    <div
      className="py-4 border-bottom d-flex align-items-center justify-content-between"
      style={{ gap: '2rem' }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="font-weight-semibold" style={{ fontSize: '0.9375rem' }}>{def.label}</div>
        <div className="text-muted small mt-1" style={{ lineHeight: '1.5' }}>{def.description}</div>
        {triggered && !isLoading && (
          <div className="text-success small mt-1">
            Report queued — it will appear in the downloads table below.
          </div>
        )}
        {errorMsg && (
          <div className="text-danger small mt-1">{errorMsg}</div>
        )}
      </div>
      <div style={{
        flexShrink: 0,
        width: '5.5rem',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
      >
        {isLoading ? (
          <Spinner
            animation="border"
            size="sm"
            screenReaderText="Generating report"
            style={{ color: 'var(--pgn-color-primary-500, #0a3055)' }}
          />
        ) : (
          <Button
            variant="outline-primary"
            size="sm"
            onClick={handleClick}
            style={{ whiteSpace: 'nowrap', width: '100%' }}
          >
            Generate
          </Button>
        )}
      </div>
    </div>
  );
};

// ── Grading configuration section ─────────────────────────────────────────────

interface GraderRow {
  type: string;
  shortLabel: string;
  weight: string;
  minCount: number;
  dropCount: number;
}

const GRADER_COLUMNS: ColumnDef<GraderRow>[] = [
  { key: 'type', label: 'Type' },
  { key: 'shortLabel', label: 'Label' },
  { key: 'weight', label: 'Weight' },
  { key: 'minCount', label: 'Min Count' },
  { key: 'dropCount', label: 'Drop Count' },
];

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

  if (grader.length === 0 && Object.keys(gradeCutoffs).length === 0) {
    return <p className="text-muted small mb-0">No grading configuration found for this course.</p>;
  }

  const graderRows: GraderRow[] = grader.map((entry: GradingConfigEntry) => ({
    type: entry.type,
    shortLabel: entry.shortLabel || '—',
    weight: `${(entry.weight * 100).toFixed(0)}%`,
    minCount: entry.minCount,
    dropCount: entry.dropCount,
  }));

  return (
    <>
      {graderRows.length > 0 && (
        <AdminDataTable
          columns={GRADER_COLUMNS}
          data={graderRows}
          caption="Grader breakdown"
        />
      )}

      {Object.keys(gradeCutoffs).length > 0 && (
        <div className="mt-4">
          <p className="text-muted small mb-2 font-weight-semibold">Grade cutoffs</p>
          <div className="d-flex flex-wrap" style={{ gap: '1.5rem' }}>
            {Object.entries(gradeCutoffs)
              .sort(([, a], [, b]) => (b as number) - (a as number))
              .map(([grade, cutoff]) => (
                <div key={grade} className="text-center">
                  <div
                    className="font-weight-semibold"
                    style={{ fontSize: '1.25rem', fontVariantNumeric: 'tabular-nums' }}
                  >
                    {((cutoff as number) * 100).toFixed(0)}%
                  </div>
                  <div className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {grade}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </>
  );
};

// ── Certificates section ──────────────────────────────────────────────────────

const CERTIFICATE_COLUMNS: ColumnDef<CourseCertificate>[] = [
  { key: 'username', label: 'Username' },
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'mode', label: 'Mode' },
  { key: 'status', label: 'Status' },
  { key: 'grade', label: 'Grade' },
  {
    key: 'createdDate',
    label: 'Issued',
    renderCell: (v) => (v ? new Date(v as string).toLocaleDateString() : '—'),
  },
];

const CertificatesSection = ({ courseId }: { courseId: string }) => {
  const { data, isLoading, isError } = useCourseCertificates(courseId, !!courseId);

  const handleDownloadCsv = () => {
    if (!data?.results.length) { return; }
    const headers = ['Username', 'Name', 'Email', 'Mode', 'Status', 'Grade', 'Issued Date', 'Download URL', 'Verify UUID'];
    const rows = data.results.map((c) => [
      c.username, c.name, c.email, c.mode, c.status, c.grade,
      c.createdDate ?? '', c.downloadUrl ?? '', c.verifyUuid ?? '',
    ]);
    const csv = [headers, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `certificates-${courseId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="d-flex align-items-center gap-2 py-3 text-muted small">
        <Spinner animation="border" size="sm" screenReaderText="Loading certificates" />
        Loading certificates…
      </div>
    );
  }

  if (isError) {
    return <Alert variant="warning" className="mb-0">Could not load certificates.</Alert>;
  }

  return (
    <>
      <div className="d-flex justify-content-between align-items-start mb-4">
        <div>
          <div
            className="font-weight-semibold"
            style={{ fontSize: '2rem', fontVariantNumeric: 'tabular-nums', lineHeight: 1.1 }}
          >
            {(data?.count ?? 0).toLocaleString()}
          </div>
          <div className="text-muted small mt-1">certificates issued</div>
        </div>
        {(data?.results.length ?? 0) > 0 && (
          <Button variant="outline-primary" size="sm" onClick={handleDownloadCsv}>
            Download CSV
          </Button>
        )}
      </div>
      {(data?.results.length ?? 0) > 0 ? (
        <AdminDataTable
          columns={CERTIFICATE_COLUMNS}
          data={data?.results ?? []}
          caption="Certificates issued for this course"
        />
      ) : (
        <p className="text-muted small mb-0">No certificates have been issued for this course.</p>
      )}
    </>
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
        <a
          href={value as string}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-sm btn-outline-primary d-inline-flex align-items-center"
          style={{ gap: '0.375rem', whiteSpace: 'nowrap' }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Download
        </a>
      ) : (
        <span className="text-muted small">—</span>
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
        <p className="text-muted small mb-0">
          Click <strong>Generate</strong> next to a report type to queue an async task.
          Completed files appear in the <em>Reports Available for Download</em> section below.
        </p>
        <hr className="mt-3 mb-0" />
        {REPORT_DEFS.map((def) => (
          <ReportTriggerRow key={def.type} def={def} courseId={courseId} />
        ))}
      </div>

      {/* Grading Configuration + Certificates Issued — side by side */}
      <div
        className="mt-4"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(22rem, 1fr))',
          gap: '1.5rem',
        }}
      >
        <div className="rwaq-card">
          <h2 className="rwaq-section-title mb-4">Grading Configuration</h2>
          <GradingConfigSection courseId={courseId} />
        </div>
        <div className="rwaq-card">
          <h2 className="rwaq-section-title mb-4">Certificates Issued</h2>
          <CertificatesSection courseId={courseId} />
        </div>
      </div>

      {/* Reports Available for Download */}
      <div className="rwaq-card mt-4">
        <h2 className="rwaq-section-title mb-1">Reports Available for Download</h2>
        <p className="text-muted small mb-3">
          Auto-refreshes every 10 s while a report is processing.
          Download links expire after 5 minutes — regenerate if a link stops working.
        </p>
        <DownloadsTable courseId={courseId} />
      </div>
    </div>
  );
};

export default CourseReportsPage;
