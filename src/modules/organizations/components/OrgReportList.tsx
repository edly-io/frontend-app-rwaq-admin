import { useIntl } from '@edx/frontend-platform/i18n';
import AdminDataTable from '@src/components/AdminDataTable';
import type { ColumnDef } from '@src/components/AdminDataTable';
import CsvDownloadButton from '@src/components/CsvDownloadButton';
import { getOrgReportCsvUrl } from '../data/api';
import type { OrgReportName } from '../data/types';
import messages from '../messages';

interface OrgReportListProps {
  /** The organization's short name. */
  org: string;
}

interface ReportDef {
  name: OrgReportName;
  title: keyof typeof messages;
  details: keyof typeof messages;
  fallbackName: string;
}

/** The six reports, in the order of the ticket. */
const REPORTS: ReportDef[] = [
  {
    name: 'courses', title: 'reportsCoursesTitle', details: 'reportsCoursesDetails', fallbackName: 'org_courses',
  },
  {
    name: 'learners', title: 'reportsLearnersTitle', details: 'reportsLearnersDetails', fallbackName: 'org_learners',
  },
  {
    name: 'revenue', title: 'reportsRevenueTitle', details: 'reportsRevenueDetails', fallbackName: 'org_revenue',
  },
  {
    name: 'funnel', title: 'reportsFunnelTitle', details: 'reportsFunnelDetails', fallbackName: 'org_program_funnel',
  },
  {
    name: 'lifecycle', title: 'reportsLifecycleTitle', details: 'reportsLifecycleDetails', fallbackName: 'org_course_lifecycle',
  },
  {
    name: 'certificates',
    title: 'reportsCertificatesTitle',
    details: 'reportsCertificatesDetails',
    fallbackName: 'org_certificate_split',
  },
];

interface ReportRow {
  name: OrgReportName;
  title: string;
  details: string;
  fallbackName: string;
}

/** One table listing the reports. The data itself is only in the downloaded file. */
const OrgReportList = ({ org }: OrgReportListProps) => {
  const intl = useIntl();
  const rows: ReportRow[] = REPORTS.map((report) => ({
    name: report.name,
    title: intl.formatMessage(messages[report.title]),
    details: intl.formatMessage(messages[report.details]),
    fallbackName: report.fallbackName,
  }));

  const columns: ColumnDef<ReportRow>[] = [
    { key: 'title', label: intl.formatMessage(messages.reportsColumnReport) },
    { key: 'details', label: intl.formatMessage(messages.reportsColumnDetails) },
    {
      key: 'name',
      id: 'download',
      label: intl.formatMessage(messages.reportsColumnDownload),
      renderCell: (_value, row) => (
        <CsvDownloadButton
          url={getOrgReportCsvUrl(row.name)}
          params={{ org }}
          fallbackName={row.fallbackName}
        />
      ),
    },
  ];

  return (
    <AdminDataTable<ReportRow>
      columns={columns}
      data={rows}
      caption={intl.formatMessage(messages.reportsCaption)}
    />
  );
};

export default OrgReportList;
