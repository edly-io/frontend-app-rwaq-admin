/**
 * OrgDetailPage — the Organization reports card (six reports, each downloaded for this organization only) and the
 * Enrollment code tab with the organization's organization codes (superusers only).
 */
import { fireEvent, screen, within } from '@testing-library/react';
import { renderWrapper } from '@src/setupTest';
import * as whoami from '@src/data/whoami';
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
jest.mock('@src/data/whoami', () => ({ useAdminCapabilities: jest.fn() }));
jest.mock('@src/modules/enrollment-codes/components/CodesCard', () => ({
  __esModule: true,
  default: ({ item }: { item: { kind: string; id: string } }) => (
    <div data-testid="codes-card" data-kind={item.kind} data-id={item.id} />
  ),
}));
jest.mock('./components/OrgAdminTable', () => ({ __esModule: true, default: () => null }));
jest.mock('./modals/AddOrgAdminModal', () => ({ __esModule: true, default: () => null }));
jest.mock('./modals/OrgFormModal', () => ({ __esModule: true, default: () => null }));
jest.mock('./components/OrgReportList', () => ({
  __esModule: true,
  default: ({ org }: { org: string }) => <div data-testid="report-list" data-org={org} />,
}));

const asUser = (isSuperuser: boolean) => (whoami.useAdminCapabilities as jest.Mock).mockReturnValue({
  data: { isSuperuser }, isLoading: false,
});

beforeEach(() => {
  window.history.pushState({}, '', '/organizations/QAOrg');
  asUser(true);
});

describe('OrgDetailPage Organization reports card', () => {
  it('shows an Organization reports card for the organization on the page', () => {
    renderWrapper(<OrgDetailPage />);

    const heading = screen.getByRole('heading', { name: 'Organization reports' });
    const card = heading.closest('.rwaq-card') as HTMLElement;
    expect(within(card).getByTestId('report-list')).toHaveAttribute('data-org', 'QAOrg');
  });
});

describe('OrgDetailPage Enrollment code tab', () => {
  it('shows Details and Enrollment code tabs to a superuser, on Details first', () => {
    renderWrapper(<OrgDetailPage />);
    expect(screen.getByRole('tab', { name: 'Details' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'Enrollment code' })).toHaveAttribute('aria-selected', 'false');
    expect(screen.getByRole('tabpanel', { name: 'Details' })).toBeVisible();
    expect(screen.getByTestId('codes-card', { exact: false })).toBeInTheDocument();
    expect(screen.getByTestId('codes-card').closest('[role="tabpanel"]')).not.toBeVisible();
  });

  it('opens the tab on click and lists the organization codes of this organization', () => {
    renderWrapper(<OrgDetailPage />);
    fireEvent.click(screen.getByRole('tab', { name: 'Enrollment code' }));
    expect(window.location.search).toBe('?tab=enrollment-code');
    const card = screen.getByTestId('codes-card');
    expect(card.closest('[role="tabpanel"]')).toBeVisible();
    expect(card).toHaveAttribute('data-kind', 'organization');
    expect(card).toHaveAttribute('data-id', 'QAOrg');
  });

  it('opens from ?tab=enrollment-code', () => {
    window.history.pushState({}, '', '/organizations/QAOrg?tab=enrollment-code');
    renderWrapper(<OrgDetailPage />);
    expect(screen.getByRole('tab', { name: 'Enrollment code' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByTestId('codes-card').closest('[role="tabpanel"]')).toBeVisible();
  });

  it('has no tabs for someone who is not a superuser', () => {
    asUser(false);
    renderWrapper(<OrgDetailPage />);
    expect(screen.queryByRole('tab')).not.toBeInTheDocument();
    expect(screen.queryByTestId('codes-card')).not.toBeInTheDocument();
  });
});
