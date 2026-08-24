/**
 * Role grant switches: the confirm gates on the two assignable grants, the
 * self-revoke locks, and that the grants this panel no longer assigns are
 * reported without a switch.
 */
import { screen, fireEvent } from '@testing-library/react';
import { renderWrapper } from '@src/setupTest';
import RoleGrantFields, { RoleGrantValues } from './RoleGrantFields';

const noGrants: RoleGrantValues = {
  isGlobalStaff: false,
  isSuperuser: false,
};

describe('RoleGrantFields', () => {
  it('does not grant Superuser until the confirmation is accepted', () => {
    const onChange = jest.fn();
    renderWrapper(<RoleGrantFields values={noGrants} onChange={onChange} />);

    fireEvent.click(screen.getByRole('switch', { name: /superuser/i }));

    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByText(/grant superuser\?/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /grant superuser/i }));
    expect(onChange).toHaveBeenCalledWith('isSuperuser', true);
  });

  // The panel is superuser-gated, so this is the switch that could lock an
  // admin out of the screen they are standing on.
  it('locks the Superuser switch when the admin is editing themselves', () => {
    renderWrapper(
      <RoleGrantFields
        values={{ ...noGrants, isSuperuser: true }}
        onChange={jest.fn()}
        canRevokeSuperuser={false}
      />,
    );

    expect(screen.getByRole('switch', { name: /superuser/i })).toBeDisabled();
    expect(screen.getByText(/cannot remove your own superuser/i)).toBeInTheDocument();
  });

  it('reports Course Creator and Support Staff without offering a switch', () => {
    renderWrapper(
      <RoleGrantFields values={noGrants} onChange={jest.fn()} isCourseCreator isSupportStaff />,
    );

    expect(screen.getByText('Course Creator')).toBeInTheDocument();
    expect(screen.getByText('Support Staff')).toBeInTheDocument();
    expect(screen.queryByRole('switch', { name: /course creator/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('switch', { name: /support staff/i })).not.toBeInTheDocument();
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

  it('shows read-only organization-admin context without a switch', () => {
    renderWrapper(
      <RoleGrantFields values={noGrants} onChange={jest.fn()} orgAdminOf={['RWAQ']} />,
    );

    expect(screen.getByText('RWAQ')).toBeInTheDocument();
    expect(screen.queryByRole('switch', { name: /organization admin/i })).not.toBeInTheDocument();
  });
});
