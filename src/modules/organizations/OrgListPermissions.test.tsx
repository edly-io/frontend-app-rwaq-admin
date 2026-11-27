import { screen } from '@testing-library/react';
import { renderWrapper } from '@src/setupTest';
import { useAdminCapabilities } from '@src/data/whoami';
import OrgListPage from './OrgListPage';

jest.mock('@src/data/whoami', () => ({ useAdminCapabilities: jest.fn() }));
jest.mock('./data/hooks', () => ({
  useOrganizations: () => ({ data: { results: [] } }),
  useOrganization: () => ({}),
}));
jest.mock('./components/OrgListStatsStrip', () => () => null);
jest.mock('./modals/OrgFormModal', () => () => null);

describe.each([['org_admin', false], ['admin', true], ['superuser', true]])('organization permissions for %s', (role, allowed) => {
  it('controls add', () => {
    (useAdminCapabilities as jest.Mock).mockReturnValue({ data: { role } });
    renderWrapper(<OrgListPage />);
    expect(Boolean(screen.queryByRole('button', { name: 'Add organization' }))).toBe(allowed);
  });
});
