/**
 * ProgramDetailPage — a read-and-manage view for a single program.
 *
 * - Header: breadcrumb, name, status chips
 * - Overview card: key program facts via DetailGrid
 * - Settings card: immediate-save toggles for is_hide / is_featured /
 *   certificate_enabled, and a status selector
 * - Courses tab: the courses linked to this program
 * - Learners tab: the learners enrolled in this program
 *
 * The UUID (not program_key) is used in the URL because program_key contains
 * ':' and '+' that would require URL encoding.
 */
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Alert,
  Form,
  Spinner,
} from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import DetailGrid from '@src/components/DetailGrid';
import { useToast } from '@src/components/ToastContext';
import ProgramStatusChips from './components/ProgramStatusChips';
import {
  useProgram,
  useProgramCourses,
  useProgramLearners,
  useUpdateProgram,
} from './data/hooks';
import type { ProgramPatch, ProgramStatus } from './data/types';
import messages from './messages';

type Tab = 'courses' | 'learners';

// ── Settings card ─────────────────────────────────────────────────────────────

interface SettingsCardProps {
  uuid: string;
  isHide: boolean;
  isFeatured: boolean;
  certificateEnabled: boolean;
  status: ProgramStatus;
}

const SettingsCard = ({
  uuid, isHide, isFeatured, certificateEnabled, status,
}: SettingsCardProps) => {
  const intl = useIntl();
  const { showToast } = useToast();
  const { mutate, isPending } = useUpdateProgram(uuid);

  const patch = (update: ProgramPatch) => {
    mutate(update, {
      onSuccess: () => showToast(intl.formatMessage(messages.settingSaved)),
      onError: () => showToast(intl.formatMessage(messages.settingError)),
    });
  };

  return (
    <div className="rwaq-card mt-4">
      <h2 className="rwaq-section-title mb-4">
        {intl.formatMessage(messages.settingsTitle)}
      </h2>

      <Form>
        <div className="d-flex flex-column gap-4">

          {/* Status select */}
          <Form.Group>
            <Form.Label>{intl.formatMessage(messages.settingStatus)}</Form.Label>
            <Form.Control
              as="select"
              value={status}
              disabled={isPending}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => patch({ status: e.target.value as ProgramStatus })}
            >
              <option value="draft">{intl.formatMessage(messages.statusDraft)}</option>
              <option value="active">{intl.formatMessage(messages.statusActive)}</option>
              <option value="archived">{intl.formatMessage(messages.statusArchived)}</option>
            </Form.Control>
            <Form.Text>{intl.formatMessage(messages.settingStatusHelp)}</Form.Text>
          </Form.Group>

          {/* is_hide toggle */}
          <Form.Group>
            <Form.Switch
              id={`program-${uuid}-is-hide`}
              label={intl.formatMessage(messages.settingIsHide)}
              checked={isHide}
              disabled={isPending}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => patch({ isHide: e.target.checked })}
            />
            <Form.Text>{intl.formatMessage(messages.settingIsHideHelp)}</Form.Text>
          </Form.Group>

          {/* is_featured toggle */}
          <Form.Group>
            <Form.Switch
              id={`program-${uuid}-is-featured`}
              label={intl.formatMessage(messages.settingIsFeatured)}
              checked={isFeatured}
              disabled={isPending}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => patch({ isFeatured: e.target.checked })}
            />
            <Form.Text>{intl.formatMessage(messages.settingIsFeaturedHelp)}</Form.Text>
          </Form.Group>

          {/* certificate_enabled toggle */}
          <Form.Group>
            <Form.Switch
              id={`program-${uuid}-cert`}
              label={intl.formatMessage(messages.settingCertEnabled)}
              checked={certificateEnabled}
              disabled={isPending}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => patch({ certificateEnabled: e.target.checked })}
            />
            <Form.Text>{intl.formatMessage(messages.settingCertEnabledHelp)}</Form.Text>
          </Form.Group>

        </div>
      </Form>
    </div>
  );
};

// ── Courses tab ───────────────────────────────────────────────────────────────

const CoursesTab = ({ uuid }: { uuid: string }) => {
  const intl = useIntl();
  const dash = intl.formatMessage(messages.detailNone);
  const { data, isLoading, isError } = useProgramCourses(uuid);

  if (isLoading) {
    return <div className="py-4 text-center"><Spinner animation="border" screenReaderText={intl.formatMessage(messages.detailLoading)} /></div>;
  }

  if (isError) {
    return <Alert variant="danger">{intl.formatMessage(messages.coursesError)}</Alert>;
  }

  if (!data || data.length === 0) {
    return <p className="text-muted py-3">{intl.formatMessage(messages.coursesEmpty)}</p>;
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="table table-sm table-hover">
        <thead>
          <tr>
            <th>{intl.formatMessage(messages.colCourseId)}</th>
            <th>{intl.formatMessage(messages.colCourseName)}</th>
            <th>{intl.formatMessage(messages.colCourseOrg)}</th>
            <th>{intl.formatMessage(messages.colCourseAdded)}</th>
          </tr>
        </thead>
        <tbody>
          {data.map((course) => (
            <tr key={course.courseId}>
              <td><code className="small">{course.courseId}</code></td>
              <td>{course.courseName ?? dash}</td>
              <td>{course.courseOrg ?? dash}</td>
              <td>{course.created ? new Date(course.created).toLocaleDateString() : dash}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ── Learners tab ──────────────────────────────────────────────────────────────

const LearnersTab = ({ uuid }: { uuid: string }) => {
  const intl = useIntl();
  const dash = intl.formatMessage(messages.detailNone);
  const { data, isLoading, isError } = useProgramLearners(uuid);

  if (isLoading) {
    return <div className="py-4 text-center"><Spinner animation="border" screenReaderText={intl.formatMessage(messages.detailLoading)} /></div>;
  }

  if (isError) {
    return <Alert variant="danger">{intl.formatMessage(messages.learnersError)}</Alert>;
  }

  if (!data || data.length === 0) {
    return <p className="text-muted py-3">{intl.formatMessage(messages.learnersEmpty)}</p>;
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="table table-sm table-hover">
        <thead>
          <tr>
            <th>{intl.formatMessage(messages.colLearnerName)}</th>
            <th>{intl.formatMessage(messages.colLearnerEmail)}</th>
            <th>{intl.formatMessage(messages.colLearnerEnrolled)}</th>
            <th>{intl.formatMessage(messages.colLearnerCompleted)}</th>
            <th>{intl.formatMessage(messages.colLearnerActive)}</th>
          </tr>
        </thead>
        <tbody>
          {data.map((learner) => (
            <tr key={learner.id}>
              <td>{learner.name}</td>
              <td>{learner.email}</td>
              <td>{learner.enrollmentDate ? new Date(learner.enrollmentDate).toLocaleDateString() : dash}</td>
              <td>{learner.completionDate ? new Date(learner.completionDate).toLocaleDateString() : dash}</td>
              <td>{intl.formatMessage(learner.isActive ? messages.yes : messages.no)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ── Tab bar ───────────────────────────────────────────────────────────────────

interface TabBarProps {
  active: Tab;
  onChange: (tab: Tab) => void;
  labels: Record<Tab, string>;
}

const TabBar = ({ active, onChange, labels }: TabBarProps) => (
  <div
    className="d-flex gap-2 mb-4"
    role="tablist"
    style={{ borderBottom: '2px solid var(--pgn-color-gray-200, #dee2e6)' }}
  >
    {(Object.keys(labels) as Tab[]).map((tab) => (
      <button
        key={tab}
        id={`tab-${tab}`}
        type="button"
        role="tab"
        aria-selected={active === tab}
        aria-controls={`tabpanel-${tab}`}
        onClick={() => onChange(tab)}
        style={{
          background: 'none',
          border: 'none',
          padding: '0.5rem 1rem',
          fontWeight: active === tab ? 600 : 400,
          color: active === tab
            ? 'var(--pgn-color-primary-500, #0A3055)'
            : 'var(--pgn-color-gray-600, #454545)',
          borderBottom: active === tab
            ? '2px solid var(--pgn-color-primary-500, #0A3055)'
            : '2px solid transparent',
          marginBottom: '-2px',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
        }}
      >
        {labels[tab]}
      </button>
    ))}
  </div>
);

// ── Main page ─────────────────────────────────────────────────────────────────

const ProgramDetailPage = () => {
  const intl = useIntl();
  const { uuid = '' } = useParams();
  const {
    data: program, isLoading, isError, error,
  } = useProgram(uuid);
  const [activeTab, setActiveTab] = useState<Tab>('courses');

  const dash = intl.formatMessage(messages.detailNone);

  if (isLoading) {
    return (
      <div className="rwaq-page">
        <div className="d-flex justify-content-center py-5">
          <Spinner animation="border" screenReaderText={intl.formatMessage(messages.detailLoading)} />
        </div>
      </div>
    );
  }

  if (isError || !program) {
    const is404 = (error as { response?: { status?: number } } | null)?.response?.status === 404;
    return (
      <div className="rwaq-page">
        <Alert variant="danger">
          {intl.formatMessage(is404 ? messages.notFound : messages.detailLoadError)}
        </Alert>
      </div>
    );
  }

  return (
    <div className="rwaq-page">
      {/* Header */}
      <div className="rwaq-page-header">
        <div className="rwaq-page-header__breadcrumb">
          <Link to="/programs">{intl.formatMessage(messages.breadcrumb)}</Link>
          {` / ${program.name}`}
        </div>

        <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mt-2">
          <div className="min-width-0">
            <h1 className="rwaq-page-title mb-2">{program.name}</h1>
            <ProgramStatusChips
              status={program.status}
              isHide={program.isHide}
              isFeatured={program.isFeatured}
              certificateEnabled={program.certificateEnabled}
            />
          </div>
        </div>
      </div>

      {/* Overview */}
      <div className="rwaq-card">
        <DetailGrid
          title={intl.formatMessage(messages.detailOverview)}
          items={[
            { label: intl.formatMessage(messages.detailProgramKey), value: <code>{program.programKey}</code> },
            { label: intl.formatMessage(messages.detailOrganization), value: program.organization },
            {
              label: intl.formatMessage(messages.detailType),
              value: program.programType ?? dash,
            },
            {
              label: intl.formatMessage(messages.detailBatch),
              value: program.batch != null ? String(program.batch) : dash,
            },
            {
              label: intl.formatMessage(messages.detailSlug),
              value: program.slug ?? dash,
            },
            {
              label: intl.formatMessage(messages.detailStartDate),
              value: program.startDate ? new Date(program.startDate).toLocaleDateString() : dash,
            },
            {
              label: intl.formatMessage(messages.detailEndDate),
              value: program.endDate ? new Date(program.endDate).toLocaleDateString() : dash,
            },
            { label: intl.formatMessage(messages.detailTotalCourses), value: program.totalCourses },
            { label: intl.formatMessage(messages.detailTotalEnrollments), value: program.totalEnrollments },
            {
              label: intl.formatMessage(messages.detailIntroVideo),
              value: program.introVideoUrl
                ? <a href={program.introVideoUrl} target="_blank" rel="noreferrer">{program.introVideoId ?? program.introVideoUrl}</a>
                : dash,
            },
            {
              label: intl.formatMessage(messages.detailCreated),
              value: new Date(program.created).toLocaleDateString(),
            },
            {
              label: intl.formatMessage(messages.detailModified),
              value: new Date(program.modified).toLocaleDateString(),
            },
            {
              label: intl.formatMessage(messages.detailDescription),
              value: program.description || dash,
              isWide: true,
            },
          ]}
        />
      </div>

      {/* Settings */}
      <SettingsCard
        uuid={program.uuid}
        isHide={program.isHide}
        isFeatured={program.isFeatured}
        certificateEnabled={program.certificateEnabled}
        status={program.status}
      />

      {/* Courses + Learners tabs */}
      <div className="rwaq-card mt-4">
        <TabBar
          active={activeTab}
          onChange={setActiveTab}
          labels={{
            courses: intl.formatMessage(messages.tabCourses),
            learners: intl.formatMessage(messages.tabLearners),
          }}
        />

        {/* Both panels stay mounted so aria-controls always resolves in the DOM.
            Hidden via the HTML `hidden` attribute rather than unmounting. */}
        <div id="tabpanel-courses" role="tabpanel" aria-labelledby="tab-courses" hidden={activeTab !== 'courses'}>
          <CoursesTab uuid={program.uuid} />
        </div>
        <div id="tabpanel-learners" role="tabpanel" aria-labelledby="tab-learners" hidden={activeTab !== 'learners'}>
          <LearnersTab uuid={program.uuid} />
        </div>
      </div>
    </div>
  );
};

export default ProgramDetailPage;
