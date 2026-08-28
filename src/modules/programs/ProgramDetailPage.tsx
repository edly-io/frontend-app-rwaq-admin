/**
 * ProgramDetailPage — a read-and-manage view for a single program.
 *
 * - Header: breadcrumb, name, status chips
 * - Overview card: key program facts via DetailGrid
 * - Settings card: immediate-save toggles for is_hide / is_featured /
 *   and a status selector
 * - Courses tab: the courses linked to this program
 * - Learners tab: the learners enrolled in this program
 *
 * The UUID (not program_key) is used in the URL because program_key contains
 * ':' and '+' that would require URL encoding.
 */
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Button,
  Form,
  Spinner,
} from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import AdminDataTable from '@src/components/AdminDataTable';
import type { ColumnDef } from '@src/components/AdminDataTable';
import DetailGrid from '@src/components/DetailGrid';
import ProfileAvatar from '@src/components/ProfileAvatar';
import { useToast } from '@src/components/ToastContext';
import ProgramStatusChips from './components/ProgramStatusChips';
import type { ProgramCourse, ProgramLearner } from './data/types';
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
  status: ProgramStatus;
}

const SettingsCard = ({
  uuid, isHide, isFeatured, status,
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
    <div className="rwaq-card">
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
              label={intl.formatMessage(messages.settingIsHideHelp)}
              checked={isHide}
              disabled={isPending}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => patch({ isHide: e.target.checked })}
            />
          </Form.Group>

          {/* is_featured toggle */}
          <Form.Group>
            <Form.Switch
              id={`program-${uuid}-is-featured`}
              label={intl.formatMessage(messages.settingIsFeaturedHelp)}
              checked={isFeatured}
              disabled={isPending}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => patch({ isFeatured: e.target.checked })}
            />
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
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useProgramCourses(uuid, page);

  const columns: ColumnDef<ProgramCourse>[] = [
    {
      label: intl.formatMessage(messages.colCourseId),
      key: 'courseId',
      renderCell: (value) => <code className="small">{value as string}</code>,
    },
    {
      label: intl.formatMessage(messages.colCourseName),
      key: 'courseName',
      renderCell: (value) => <span>{(value as string | null) ?? dash}</span>,
    },
    {
      label: intl.formatMessage(messages.colCourseOrg),
      key: 'courseOrg',
      renderCell: (value) => <span>{(value as string | null) ?? dash}</span>,
    },
    {
      label: intl.formatMessage(messages.colCourseAdded),
      key: 'created',
      renderCell: (value) => (
        <span>{value ? new Date(value as string).toLocaleDateString() : dash}</span>
      ),
    },
  ];

  if (isError) {
    return <Alert variant="danger">{intl.formatMessage(messages.coursesError)}</Alert>;
  }

  const PAGE_SIZE = 10;
  const count = data?.pagination?.count ?? 0;
  const numPages = data?.pagination?.numPages ?? Math.ceil(count / PAGE_SIZE);

  return (
    <AdminDataTable
      columns={columns}
      data={data?.results ?? []}
      isLoading={isLoading}
      caption={intl.formatMessage(messages.tabCourses)}
      pagination={count > 0 ? {
        currentPage: page,
        pageCount: numPages || 1,
        itemCount: count,
        pageSize: PAGE_SIZE,
        onPageChange: setPage,
      } : undefined}
    />
  );
};

// ── Learners tab ──────────────────────────────────────────────────────────────

const LearnersTab = ({ uuid }: { uuid: string }) => {
  const intl = useIntl();
  const dash = intl.formatMessage(messages.detailNone);
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useProgramLearners(uuid, page);

  const columns: ColumnDef<ProgramLearner>[] = [
    {
      label: intl.formatMessage(messages.colLearnerName),
      key: 'name',
      renderCell: (value) => <span>{value as string}</span>,
    },
    {
      label: intl.formatMessage(messages.colLearnerEmail),
      key: 'email',
      renderCell: (value) => <span>{value as string}</span>,
    },
    {
      label: intl.formatMessage(messages.colLearnerEnrolled),
      key: 'enrollmentDate',
      renderCell: (value) => (
        <span>{value ? new Date(value as string).toLocaleDateString() : dash}</span>
      ),
    },
    {
      label: intl.formatMessage(messages.colLearnerCompleted),
      key: 'completionDate',
      renderCell: (value) => (
        <span>{value ? new Date(value as string).toLocaleDateString() : dash}</span>
      ),
    },
    {
      label: intl.formatMessage(messages.colLearnerActive),
      key: 'isActive',
      renderCell: (value) => (
        <span>{intl.formatMessage(value ? messages.yes : messages.no)}</span>
      ),
    },
  ];

  if (isError) {
    return <Alert variant="danger">{intl.formatMessage(messages.learnersError)}</Alert>;
  }

  const PAGE_SIZE = 10;
  const count = data?.pagination?.count ?? 0;
  const numPages = data?.pagination?.numPages ?? Math.ceil(count / PAGE_SIZE);

  return (
    <AdminDataTable
      columns={columns}
      data={data?.results ?? []}
      isLoading={isLoading}
      caption={intl.formatMessage(messages.tabLearners)}
      pagination={count > 0 ? {
        currentPage: page,
        pageCount: numPages || 1,
        itemCount: count,
        pageSize: PAGE_SIZE,
        onPageChange: setPage,
      } : undefined}
    />
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
  const navigate = useNavigate();
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
          <div className="rwaq-detail-header min-width-0">
            <ProfileAvatar
              src={program.cardImage}
              name={program.name}
              size="lg"
            />
            <div className="min-width-0">
              <h1 className="rwaq-page-title mb-2">{program.name}</h1>
              <ProgramStatusChips
                status={program.status}
                isHide={program.isHide}
                isFeatured={program.isFeatured}
                readOnly
              />
            </div>
          </div>
          <div className="flex-shrink-0">
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate(`/programs/${uuid}/reports`)}
            >
              View Reports
            </Button>
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
        status={program.status}
      />

      {/* Courses + Learners tabs */}
      <div className="rwaq-card">
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
