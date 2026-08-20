/**
 * SideNav — persistent left sidebar, matching the edly-panel visual:
 * - Brand logo at top
 * - Icon + label NavLink items; active item = white rounded "pill" with brand-accent icon
 * - Collapsible "Settings" section (caret)
 * - "Coming soon" badge on Users/Enrollment/Analytics
 */
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Icon } from '@openedx/paragon';
import {
  Dashboard,
  Person,
  Groups,
  List,
  BarChart,
  Settings,
  ExpandMore,
  ExpandLess,
} from '@openedx/paragon/icons';
import { getConfig } from '@edx/frontend-platform';
import { defineMessages, useIntl } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  logoAlt: { id: 'rwaq.admin.sidenav.logoAlt', defaultMessage: 'Rwaq' },
  dashboard: { id: 'rwaq.admin.sidenav.dashboard', defaultMessage: 'Dashboard' },
  users: { id: 'rwaq.admin.sidenav.users', defaultMessage: 'Users' },
  organizations: { id: 'rwaq.admin.sidenav.organizations', defaultMessage: 'Organizations' },
  enrollment: { id: 'rwaq.admin.sidenav.enrollment', defaultMessage: 'Enrollment' },
  analytics: { id: 'rwaq.admin.sidenav.analytics', defaultMessage: 'Analytics' },
  settings: { id: 'rwaq.admin.sidenav.settings', defaultMessage: 'Settings' },
  comingSoon: { id: 'rwaq.admin.sidenav.comingSoon', defaultMessage: 'Soon' },
  navAriaLabel: { id: 'rwaq.admin.sidenav.navAriaLabel', defaultMessage: 'Admin navigation' },
  settingsToggle: { id: 'rwaq.admin.sidenav.settingsToggle', defaultMessage: 'Toggle settings menu' },
});

// ── Nav item config ───────────────────────────────────────────────────────────

interface NavItemDef {
  to: string;
  labelId: keyof typeof messages;
  // React.ComponentType matches the signature that Paragon Icon's `src` expects
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  iconSrc: React.ComponentType<any>;
  isLive: boolean;
  exact?: boolean;
}

const NAV_ITEMS: NavItemDef[] = [
  {
    to: '/', labelId: 'dashboard', iconSrc: Dashboard, isLive: true, exact: true,
  },
  {
    to: '/users', labelId: 'users', iconSrc: Person, isLive: true,
  },
  {
    to: '/organizations', labelId: 'organizations', iconSrc: Groups, isLive: true,
  },
  {
    to: '/enrollment', labelId: 'enrollment', iconSrc: List, isLive: false,
  },
  {
    to: '/analytics', labelId: 'analytics', iconSrc: BarChart, isLive: false,
  },
];

// ── Styles ────────────────────────────────────────────────────────────────────

const sidebarStyle: React.CSSProperties = {
  width: '260px',
  minWidth: '260px',
  display: 'flex',
  flexDirection: 'column',
  height: '100vh',
  overflowY: 'auto',
  borderInlineEnd: '1px solid var(--pgn-color-gray-200, #dee2e6)',
};

const logoBandStyle: React.CSSProperties = {
  padding: '1.25rem 1.25rem 1rem',
  borderBottom: '1px solid var(--pgn-color-gray-200, #dee2e6)',
  display: 'flex',
  alignItems: 'center',
  minHeight: '64px',
};

// ── Single nav item ───────────────────────────────────────────────────────────

interface NavItemProps {
  def: NavItemDef;
  onNavigate?: () => void;
}

const NavItem = ({ def, onNavigate }: NavItemProps) => {
  const intl = useIntl();
  const label = intl.formatMessage(messages[def.labelId]);

  return (
    <NavLink
      to={def.to}
      end={def.exact ?? false}
      onClick={onNavigate}
      // Styling moved to shell.scss so the active state can follow the theme
      // tokens: the pill's background was a hardcoded white, which in dark mode
      // was a glaring white block in an otherwise near-black sidebar.
      className={({ isActive }) => `rwaq-navitem${isActive ? ' rwaq-navitem--active' : ''}`}
      aria-label={def.isLive ? label : `${label} — ${intl.formatMessage(messages.comingSoon)}`}
    >
      <Icon src={def.iconSrc} className="rwaq-navitem__icon" />
      <span className="rwaq-navitem__label">{label}</span>
      {!def.isLive && (
        <span className="rwaq-navitem__soon">
          {intl.formatMessage(messages.comingSoon)}
        </span>
      )}
    </NavLink>
  );
};

// ── Settings group ────────────────────────────────────────────────────────────

const SettingsGroup = () => {
  const intl = useIntl();
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-1">
      <button
        type="button"
        aria-expanded={open}
        aria-label={intl.formatMessage(messages.settingsToggle)}
        onClick={() => setOpen((prev) => !prev)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.625rem 1rem',
          borderRadius: '0.5rem',
          width: '100%',
          border: 'none',
          background: 'transparent',
          fontWeight: 500,
          fontSize: '0.9375rem',
          color: 'var(--pgn-color-gray-700, #273F58)',
          cursor: 'pointer',
          textAlign: 'start',
        }}
      >
        <Icon
          src={Settings}
          style={{ color: 'var(--pgn-color-gray-500, #6B757F)', flexShrink: 0 }}
        />
        <span style={{ flex: 1 }}>{intl.formatMessage(messages.settings)}</span>
        <Icon
          src={open ? ExpandLess : ExpandMore}
          style={{ color: 'var(--pgn-color-gray-500, #6B757F)', flexShrink: 0 }}
        />
      </button>
      {/* Settings sub-items placeholder — expandable in future phases */}
      {open && (
        <div
          style={{
            paddingInlineStart: '2.5rem',
            paddingBottom: '0.25rem',
            fontSize: '0.875rem',
            color: 'var(--pgn-color-gray-500, #6B757F)',
          }}
        >
          {/* Future settings items here */}
        </div>
      )}
    </div>
  );
};

// ── Main SideNav ──────────────────────────────────────────────────────────────

export interface SideNavProps {
  onNavigate?: () => void;
}

const SideNav = ({ onNavigate }: SideNavProps) => {
  const intl = useIntl();
  const config = getConfig();
  const logoUrl = config?.LOGO_WHITE_URL ?? config?.LOGO_URL ?? '';

  return (
    <div className="rwaq-admin-sidebar" style={sidebarStyle}>
      {/* Logo band */}
      <div style={logoBandStyle}>
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={intl.formatMessage(messages.logoAlt)}
            style={{ height: '32px', objectFit: 'contain' }}
          />
        ) : (
          <span
            style={{
              fontWeight: 800,
              fontSize: '1.25rem',
              color: 'var(--pgn-color-primary-700, #003F70)',
              letterSpacing: '-0.02em',
            }}
          >
            Rwaq
          </span>
        )}
      </div>

      {/* Nav items */}
      <nav
        aria-label={intl.formatMessage(messages.navAriaLabel)}
        style={{ padding: '1rem 0.75rem', flex: 1 }}
      >
        {NAV_ITEMS.map((item) => (
          <NavItem key={item.to} def={item} onNavigate={onNavigate} />
        ))}

        {/* Divider before settings */}
        <hr style={{ margin: '0.75rem 0', borderColor: 'var(--pgn-color-gray-200, #dee2e6)' }} />

        <SettingsGroup />
      </nav>
    </div>
  );
};

export default SideNav;
