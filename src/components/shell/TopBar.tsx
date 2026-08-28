/**
 * TopBar — the in-content top bar, inside the main content column (matching the
 * edly-panel layout).
 *
 * Left:  Welcome label + user full name (desktop) / hamburger + logo (mobile)
 * Right: Theme toggle, Avatar/account dropdown (name/email/role, Dark Mode,
 *        Profile, Account, Studio, LMS, Logout).
 *
 * No notification bell (the platform has no notifications surface here).
 */
import { forwardRef } from 'react';
import {
  Dropdown,
  Form,
  Icon,
} from '@openedx/paragon';
import {
  MenuIcon,
  LightMode,
  DarkMode,
} from '@openedx/paragon/icons';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform';
import { useIntl } from '@edx/frontend-platform/i18n';
import { RWAQ_LOGO } from '@src/assets/rwaqLogo';
import { useThemeVariant } from './useThemeVariant';
import { topBarMessages as messages } from './messages';

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

// Custom dropdown toggle: the avatar circle only, with no default caret.
interface AccountToggleProps {
  onClick?: (e: React.MouseEvent) => void;
  label: string;
  initial: string;
}
const AccountToggle = forwardRef<HTMLButtonElement, AccountToggleProps>(
  ({ onClick, label, initial }, ref) => (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      aria-label={label}
      style={{
        ...circleBtn,
        background: 'var(--pgn-color-primary-500, #449cc2)',
        color: '#fff',
        border: 'none',
        fontSize: '0.875rem',
        fontWeight: 700,
      }}
    >
      {initial}
    </button>
  ),
);

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
  // Same reason as SideNav: the configured URL is a theming redirect that can
  // resolve to the stock Open edX logo depending on the request host.
  const logoUrl = RWAQ_LOGO;

  // Cross-platform destinations (fall back to LMS-relative paths that redirect
  // to the corresponding MFE when the explicit config URL is absent).
  // Profile needs both a configured MFE *and* a username to address. The LMS
  // /u/<username> fallback only redirects to PROFILE_MICROFRONTEND_URL, which
  // in deployments without the profile MFE points at an address nothing serves
  // — so a link was rendered that could never resolve. Absent either, the menu
  // item is omitted rather than shown broken.
  const profileBase = (config?.ACCOUNT_PROFILE_URL as string) || '';
  const links = {
    profile: profileBase && username ? `${profileBase}/u/${username}` : '',
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
      <div className="d-flex align-items-center rwaq-gap-sm" style={{ minWidth: 0, flex: '0 1 auto' }}>
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
          <Dropdown.Toggle
            as={AccountToggle}
            id="topbar-account-menu"
            label={intl.formatMessage(messages.account)}
            initial={displayName ? displayName.charAt(0).toUpperCase() : 'A'}
          />
          <Dropdown.Menu className="rwaq-admin-usermenu" style={{ minWidth: '15rem' }}>
            {/* Identity block */}
            <div className="px-3 py-2">
              <div style={{ fontWeight: 600 }}>{displayName}</div>
              {email && <div className="small text-muted" style={{ wordBreak: 'break-all' }}>{email}</div>}
              <div className="small mt-1" style={{ fontWeight: 500 }}>{role}</div>
            </div>
            <Dropdown.Divider />

            {/* Dark mode toggle */}
            <div className="px-3 py-2 d-flex align-items-center">
              <Form.Switch checked={isDark} onChange={toggle}>
                {intl.formatMessage(messages.darkMode)}
              </Form.Switch>
            </div>
            <Dropdown.Divider />

            {/* Cross-platform navigation */}
            {!!links.profile && (
              <Dropdown.Item href={links.profile}>{intl.formatMessage(messages.profile)}</Dropdown.Item>
            )}
            <Dropdown.Item href={links.account}>{intl.formatMessage(messages.accountSettings)}</Dropdown.Item>
            {links.studio && (
              <Dropdown.Item
                href={links.studio}
                target="_blank"
                rel="noreferrer"
              >
                {intl.formatMessage(messages.studio)}
              </Dropdown.Item>
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
