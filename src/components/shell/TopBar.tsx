/**
 * TopBar — the in-content top bar, inside the main content column (NOT full-width
 * over the sidebar, matching edly-panel layout).
 *
 * Left: Welcome label + user full name
 * Right: Bell (notifications), Theme toggle, Avatar/account dropdown → Logout
 * Mobile: Hamburger (sidebar toggle) + Logo + Bell + Avatar
 */
import {
  Dropdown,
  Icon,
} from '@openedx/paragon';
import {
  MenuIcon,
  Notifications,
  AccountCircle,
  LightMode,
} from '@openedx/paragon/icons';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform';
import { defineMessages, useIntl } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  welcome: {
    id: 'rwaq.admin.topbar.welcome',
    defaultMessage: 'Welcome',
  },
  notifications: {
    id: 'rwaq.admin.topbar.notifications',
    defaultMessage: 'Notifications',
  },
  themeToggle: {
    id: 'rwaq.admin.topbar.themeToggle',
    defaultMessage: 'Toggle theme',
  },
  account: {
    id: 'rwaq.admin.topbar.account',
    defaultMessage: 'Account menu',
  },
  logout: {
    id: 'rwaq.admin.topbar.logout',
    defaultMessage: 'Log out',
  },
  openNav: {
    id: 'rwaq.admin.topbar.openNav',
    defaultMessage: 'Open navigation',
  },
});

// ── Types ─────────────────────────────────────────────────────────────────────

export interface TopBarProps {
  onMenuToggle?: () => void;
  isMobile?: boolean;
}

// ── Circular icon button style ────────────────────────────────────────────────

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

// ── Component ─────────────────────────────────────────────────────────────────

const TopBar = ({ onMenuToggle, isMobile = false }: TopBarProps) => {
  const intl = useIntl();
  const user = getAuthenticatedUser();
  const config = getConfig();

  const displayName = user?.name || user?.username || '';
  const logoutUrl = config?.LOGOUT_URL ?? '/logout';
  const logoUrl = config?.LOGO_WHITE_URL ?? config?.LOGO_URL ?? '';

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.75rem 1.5rem',
        background: 'var(--pgn-color-white, #fff)',
        borderBottom: '1px solid var(--pgn-color-gray-200, #dee2e6)',
        gap: '1rem',
        minHeight: '60px',
        flexShrink: 0,
      }}
    >
      {/* ── Left: hamburger (mobile) OR welcome text (desktop) ── */}
      <div className="d-flex align-items-center gap-2" style={{ minWidth: 0, flex: '0 1 auto' }}>
        {isMobile && (
          <>
            <button
              type="button"
              aria-label={intl.formatMessage(messages.openNav)}
              onClick={onMenuToggle}
              style={{ ...circleBtn, border: 'none', marginInlineEnd: '0.25rem' }}
            >
              <Icon src={MenuIcon} style={{ color: 'var(--pgn-color-gray-600, #454545)' }} />
            </button>
            {logoUrl && (
              <img
                src={logoUrl}
                alt="Rwaq"
                style={{ height: '28px', objectFit: 'contain' }}
              />
            )}
          </>
        )}

        {!isMobile && (
          <div style={{ minWidth: 0 }}>
            <p
              className="mb-0"
              style={{
                fontSize: '0.75rem',
                color: 'var(--pgn-color-gray-500, #6B757F)',
                fontWeight: 500,
                lineHeight: 1.2,
              }}
            >
              {intl.formatMessage(messages.welcome)}
            </p>
            <p
              className="mb-0"
              style={{
                fontSize: '1.0625rem',
                fontWeight: 700,
                color: 'var(--pgn-color-gray-700, #273F58)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {displayName}
            </p>
          </div>
        )}
      </div>

      {/* ── Right: icon buttons ── */}
      <div className="d-flex align-items-center gap-2" style={{ flexShrink: 0 }}>
        {/* Notification bell */}
        <button
          type="button"
          aria-label={intl.formatMessage(messages.notifications)}
          style={circleBtn}
        >
          <Icon src={Notifications} style={{ color: 'var(--pgn-color-gray-600, #454545)' }} />
        </button>

        {/* Theme / light toggle */}
        <button
          type="button"
          aria-label={intl.formatMessage(messages.themeToggle)}
          style={circleBtn}
        >
          <Icon src={LightMode} style={{ color: 'var(--pgn-color-gray-600, #454545)' }} />
        </button>

        {/* Avatar / account menu */}
        <Dropdown>
          <Dropdown.Toggle
            id="topbar-account-menu"
            as="div"
            style={{ cursor: 'pointer' }}
          >
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
              {displayName?.charAt(0)?.toUpperCase() ?? <Icon src={AccountCircle} />}
            </button>
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item
              href={logoutUrl}
            >
              {intl.formatMessage(messages.logout)}
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
    </header>
  );
};

export default TopBar;
