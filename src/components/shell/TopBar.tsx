/**
 * TopBar — the in-content top bar, inside the main content column (matching the
 * edly-panel layout).
 *
 * Left:  Welcome label + user full name (desktop) / hamburger + logo (mobile)
 * Right: Theme toggle, Avatar/account dropdown (name/email/role, Dark Mode,
 *        Profile, Account, Studio, Learner Dashboard, Logout).
 *
 * No notification bell (the platform has no notifications surface here).
 */
import {
  Dropdown,
  Form,
  Icon,
} from '@openedx/paragon';
import {
  MenuIcon,
  AccountCircle,
  LightMode,
  DarkMode,
} from '@openedx/paragon/icons';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform';
import { defineMessages, useIntl } from '@edx/frontend-platform/i18n';
import useThemeVariant from './useThemeVariant';

const messages = defineMessages({
  welcome: { id: 'rwaq.admin.topbar.welcome', defaultMessage: 'Welcome' },
  themeToggle: { id: 'rwaq.admin.topbar.themeToggle', defaultMessage: 'Toggle light/dark theme' },
  account: { id: 'rwaq.admin.topbar.account', defaultMessage: 'Account menu' },
  darkMode: { id: 'rwaq.admin.topbar.darkMode', defaultMessage: 'Dark Mode' },
  roleAdmin: { id: 'rwaq.admin.topbar.role.admin', defaultMessage: 'Administrator' },
  roleStaff: { id: 'rwaq.admin.topbar.role.staff', defaultMessage: 'Staff' },
  profile: { id: 'rwaq.admin.topbar.profile', defaultMessage: 'Profile' },
  accountSettings: { id: 'rwaq.admin.topbar.accountSettings', defaultMessage: 'Account' },
  studio: { id: 'rwaq.admin.topbar.studio', defaultMessage: 'Studio' },
  learnerDashboard: { id: 'rwaq.admin.topbar.learnerDashboard', defaultMessage: 'Learner Dashboard' },
  logout: { id: 'rwaq.admin.topbar.logout', defaultMessage: 'Log out' },
  openNav: { id: 'rwaq.admin.topbar.openNav', defaultMessage: 'Open navigation' },
});

export interface TopBarProps {
  onMenuToggle?: () => void;
  isMobile?: boolean;
}

const circleBtn: React.CSSProperties = {
  width: '38px',
  height: '38px',
  borderRadius: '50%',
  border: '1px solid var(--pgn-color-gray-300, #dee2e6)',
  background: 'var(--pgn-color-white, #fff)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  color: 'var(--pgn-color-gray-600, #454545)',
  flexShrink: 0,
};

const TopBar = ({ onMenuToggle, isMobile = false }: TopBarProps) => {
  const intl = useIntl();
  const user = getAuthenticatedUser();
  const config = getConfig();
  const { isDark, toggle } = useThemeVariant();

  const displayName = user?.name || user?.username || '';
  const email = user?.email || '';
  const username = user?.username || '';
  const role = user?.administrator
    ? intl.formatMessage(messages.roleAdmin)
    : intl.formatMessage(messages.roleStaff);

  const lms = (config?.LMS_BASE_URL as string) || '';
  const logoutUrl = (config?.LOGOUT_URL as string) ?? `${lms}/logout`;
  const logoUrl = (config?.LOGO_URL as string) || '';

  // Cross-platform destinations (fall back to LMS-relative paths that redirect
  // to the corresponding MFE when the explicit config URL is absent).
  const links = {
    profile: (config?.ACCOUNT_PROFILE_URL as string)
      ? `${config.ACCOUNT_PROFILE_URL}/u/${username}`
      : `${lms}/u/${username}`,
    account: (config?.ACCOUNT_SETTINGS_URL as string) || `${lms}/account`,
    studio: (config?.STUDIO_BASE_URL as string) || '',
    dashboard: (config?.LEARNER_DASHBOARD_URL as string) || `${lms}/dashboard`,
  };

  return (
    <header
      className="rwaq-admin-topbar"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.75rem 1.5rem',
        gap: '1rem',
        minHeight: '60px',
        flexShrink: 0,
      }}
    >
      {/* ── Left ── */}
      <div className="d-flex align-items-center gap-2" style={{ minWidth: 0, flex: '0 1 auto' }}>
        {isMobile && (
          <>
            <button
              type="button"
              aria-label={intl.formatMessage(messages.openNav)}
              onClick={onMenuToggle}
              style={{ ...circleBtn, border: 'none', marginInlineEnd: '0.25rem' }}
            >
              <Icon src={MenuIcon} />
            </button>
            {logoUrl && <img src={logoUrl} alt="Rwaq" style={{ height: '28px', objectFit: 'contain' }} />}
          </>
        )}
        {!isMobile && (
          <div style={{ minWidth: 0 }}>
            <p className="mb-0 rwaq-admin-topbar__welcome" style={{ fontSize: '0.75rem', fontWeight: 500, lineHeight: 1.2 }}>
              {intl.formatMessage(messages.welcome)}
            </p>
            <p
              className="mb-0 rwaq-admin-topbar__name"
              style={{
                fontSize: '1.0625rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}
            >
              {displayName}
            </p>
          </div>
        )}
      </div>

      {/* ── Right ── (extra gap between the theme toggle and the avatar) */}
      <div className="d-flex align-items-center" style={{ flexShrink: 0, gap: '0.875rem' }}>
        {/* Theme toggle (functional) */}
        <button
          type="button"
          aria-label={intl.formatMessage(messages.themeToggle)}
          aria-pressed={isDark}
          onClick={toggle}
          style={circleBtn}
        >
          <Icon src={isDark ? DarkMode : LightMode} />
        </button>

        {/* Account menu */}
        <Dropdown>
          <Dropdown.Toggle id="topbar-account-menu" as="div" style={{ cursor: 'pointer' }}>
            <button
              type="button"
              aria-label={intl.formatMessage(messages.account)}
              style={{
                ...circleBtn,
                background: 'var(--pgn-color-primary-500, #0070D2)',
                color: '#fff',
                border: 'none',
                fontSize: '0.875rem',
                fontWeight: 700,
              }}
            >
              {displayName ? displayName.charAt(0).toUpperCase() : <Icon src={AccountCircle} />}
            </button>
          </Dropdown.Toggle>
          <Dropdown.Menu className="rwaq-admin-usermenu" style={{ minWidth: '15rem' }}>
            {/* Identity block */}
            <div className="px-3 py-2">
              <div style={{ fontWeight: 600 }}>{displayName}</div>
              {email && <div className="small text-muted" style={{ wordBreak: 'break-all' }}>{email}</div>}
              <div className="small mt-1" style={{ fontWeight: 500 }}>{role}</div>
            </div>
            <Dropdown.Divider />

            {/* Dark mode toggle (does not close the menu) */}
            {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */}
            <div
              className="px-3 py-2 d-flex align-items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <Form.Switch checked={isDark} onChange={toggle}>
                {intl.formatMessage(messages.darkMode)}
              </Form.Switch>
            </div>
            <Dropdown.Divider />

            {/* Cross-platform navigation */}
            <Dropdown.Item href={links.profile}>{intl.formatMessage(messages.profile)}</Dropdown.Item>
            <Dropdown.Item href={links.account}>{intl.formatMessage(messages.accountSettings)}</Dropdown.Item>
            {links.studio && (
              <Dropdown.Item href={links.studio}>{intl.formatMessage(messages.studio)}</Dropdown.Item>
            )}
            <Dropdown.Item href={links.dashboard}>{intl.formatMessage(messages.learnerDashboard)}</Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item href={logoutUrl}>{intl.formatMessage(messages.logout)}</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
    </header>
  );
};

export default TopBar;
