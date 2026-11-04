/**
 * The report list: six rows, and each Download button asks for its own report of the picked org.
 */
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { renderWrapper } from '@src/setupTest';
import { downloadCsv } from '@src/data/csv';
import OrgReportList from './OrgReportList';

jest.mock('@src/data/csv', () => ({ downloadCsv: jest.fn() }));
jest.mock('@src/components/ToastContext', () => ({ useToast: () => ({ showToast: jest.fn() }) }));
jest.mock('@src/components/DownloadButton', () => ({
  __esModule: true,
  ...jest.requireActual('@src/components/DownloadButton'),
  saveBlob: jest.fn(),
}));

const TITLES = ['Courses', 'Learners', 'Revenue', 'Program funnel', 'Course lifecycle', 'Certificates'];

describe('OrgReportList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (downloadCsv as jest.Mock).mockResolvedValue({ blob: new Blob(['a']), filename: 'x.csv' });
  });

  it('lists the six reports with their details', () => {
    renderWrapper(<OrgReportList org="QAOrg" />);

    TITLES.forEach((title) => expect(screen.getByRole('cell', { name: title })).toBeInTheDocument());
    expect(screen.getAllByRole('button', { name: 'Download CSV' })).toHaveLength(6);
    expect(screen.getByText(/One row per course/)).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Report' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Details' })).toBeInTheDocument();
  });

  it('downloads each report with the organization and the panel language', async () => {
    renderWrapper(<OrgReportList org="QAOrg" />);

    const buttons = screen.getAllByRole('button', { name: 'Download CSV' });
    buttons.forEach((button) => fireEvent.click(button));

    await waitFor(() => expect(downloadCsv).toHaveBeenCalledTimes(6));
    const { calls } = (downloadCsv as jest.Mock).mock;
    expect(calls.map(([url]) => url.split('/org-reports/')[1])).toEqual([
      'courses/csv/', 'learners/csv/', 'revenue/csv/', 'funnel/csv/', 'lifecycle/csv/', 'certificates/csv/',
    ]);
    calls.forEach(([, params, , language]) => {
      expect(params).toEqual({ org: 'QAOrg' });
      expect(language).toBe('en');
    });
    expect(calls.map(([, , fallbackName]) => fallbackName)).toEqual([
      'org_courses', 'org_learners', 'org_revenue', 'org_program_funnel', 'org_course_lifecycle', 'org_certificate_split',
    ]);
  });
});
