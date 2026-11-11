/**
 * OrgDetailPage — the Organization reports card: six reports, each downloaded for this organization only.
 */
import { screen, within } from '@testing-library/react';
import { renderWrapper } from '@src/setupTest';
import OrgDetailPage from './OrgDetailPage';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ shortName: 'QAOrg' }),
}));
jest.mock('./data/hooks', () => ({
  useOrganization: () => ({
    data: {
      id: 1,
      name: 'QA Org',
      shortName: 'QAOrg',
      arabicName: '',
      active: true,
      courseCount: 3,
      adminCount: 1,
      members: [],
      description: '',
      featuredVideo: '',
      showLogoOnProgramCertificate: false,
    },
    isLoading: false,
    isError: false,
  }),
}));
jest.mock('@src/data/hooks', () => ({
  useCourses: () => ({
    data: { results: [], pagination: { count: 0, numPages: 1 } },
    isLoading: false,
    isError: false,
  }),
}));
jest.mock('./components/OrgStatsStrip', () => ({ __esModule: true, default: () => null }));
jest.mock('./components/OrgAdminTable', () => ({ __esModule: true, default: () => null }));
jest.mock('./modals/AddOrgAdminModal', () => ({ __esModule: true, default: () => null }));
jest.mock('./modals/OrgFormModal', () => ({ __esModule: true, default: () => null }));
jest.mock('./components/OrgReportList', () => ({
  __esModule: true,
  default: ({ org }: { org: string }) => <div data-testid="report-list" data-org={org} />,
}));

describe('OrgDetailPage Organization reports card', () => {
  it('shows an Organization reports card for the organization on the page', () => {
    renderWrapper(<OrgDetailPage />);

    const heading = screen.getByRole('heading', { name: 'Organization reports' });
    const card = heading.closest('.rwaq-card') as HTMLElement;
    expect(within(card).getByTestId('report-list')).toHaveAttribute('data-org', 'QAOrg');
  });
});
