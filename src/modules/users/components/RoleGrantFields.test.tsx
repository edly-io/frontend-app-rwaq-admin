/**
 * Role grant switches: the confirm gate on Global Staff and the self-revoke lock.
 */
import { screen, fireEvent } from '@testing-library/react';
import { renderWrapper } from '@src/setupTest';
import RoleGrantFields, { RoleGrantValues } from './RoleGrantFields';

const noGrants: RoleGrantValues = {
  isGlobalStaff: false,
  isCourseCreator: false,
  isSupportStaff: false,
};

describe('RoleGrantFields', () => {
  it('grants Support Staff directly, with no confirmation', () => {
    const onChange = jest.fn();
    renderWrapper(<RoleGrantFields values={noGrants} onChange={onChange} />);

    fireEvent.click(screen.getByRole('switch', { name: /support staff/i }));

    expect(onChange).toHaveBeenCalledWith('isSupportStaff', true);
  });

  it('does not grant Global Staff until the confirmation is accepted', () => {
    const onChange = jest.fn();
    renderWrapper(<RoleGrantFields values={noGrants} onChange={onChange} />);

    fireEvent.click(screen.getByRole('switch', { name: /global staff/i }));

    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByText(/grant global staff access\?/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /yes, grant global staff/i }));
    expect(onChange).toHaveBeenCalledWith('isGlobalStaff', true);
  });

  it('cancelling the confirmation leaves the grant untouched', () => {
    const onChange = jest.fn();
    renderWrapper(<RoleGrantFields values={noGrants} onChange={onChange} />);

    fireEvent.click(screen.getByRole('switch', { name: /global staff/i }));
    fireEvent.click(screen.getByRole('button', { name: /^cancel$/i }));

    expect(onChange).not.toHaveBeenCalled();
  });

  it('revoking Global Staff needs no confirmation', () => {
    const onChange = jest.fn();
    renderWrapper(
      <RoleGrantFields values={{ ...noGrants, isGlobalStaff: true }} onChange={onChange} />,
    );

    fireEvent.click(screen.getByRole('switch', { name: /global staff/i }));

    expect(onChange).toHaveBeenCalledWith('isGlobalStaff', false);
  });

  it('locks the switch when an admin would revoke their own Global Staff', () => {
    renderWrapper(
      <RoleGrantFields
        values={{ ...noGrants, isGlobalStaff: true }}
        onChange={jest.fn()}
        canRevokeGlobalStaff={false}
      />,
    );

    expect(screen.getByRole('switch', { name: /global staff/i })).toBeDisabled();
    expect(screen.getByText(/cannot revoke your own global staff/i)).toBeInTheDocument();
  });

  it('shows read-only superuser and organization-admin context', () => {
    renderWrapper(
      <RoleGrantFields
        values={noGrants}
        onChange={jest.fn()}
        isSuperuser
        orgAdminOf={['RWAQ']}
      />,
    );

    expect(screen.getByText('Superuser')).toBeInTheDocument();
    expect(screen.getByText('RWAQ')).toBeInTheDocument();
    // ...and no switch for either of them.
    expect(screen.queryByRole('switch', { name: /superuser/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('switch', { name: /organization admin/i })).not.toBeInTheDocument();
  });
});
