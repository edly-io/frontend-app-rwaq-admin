import { defineMessages } from '@edx/frontend-platform/i18n';

// ── AdminShell ────────────────────────────────────────────────────────────────

export const adminShellMessages = defineMessages({
  accessDeniedTitle: {
    id: 'rwaq.admin.shell.accessDeniedTitle',
    defaultMessage: 'Access denied',
  },
  accessDeniedBody: {
    id: 'rwaq.admin.shell.accessDeniedBody',
    defaultMessage: 'The admin panel is available to superusers only. If you need access, '
      + 'ask an existing superuser to grant it from this panel, or a platform administrator '
      + 'to set it in Django admin.',
  },
});

// ── SideNav ───────────────────────────────────────────────────────────────────

export const sideNavMessages = defineMessages({
  logoAlt: { id: 'rwaq.admin.sidenav.logoAlt', defaultMessage: 'Rwaq' },
  dashboard: { id: 'rwaq.admin.sidenav.dashboard', defaultMessage: 'Dashboard' },
  users: { id: 'rwaq.admin.sidenav.users', defaultMessage: 'Users' },
  organizations: { id: 'rwaq.admin.sidenav.organizations', defaultMessage: 'Organizations' },
  courses: { id: 'rwaq.admin.sidenav.courses', defaultMessage: 'Courses' },
  programs: { id: 'rwaq.admin.sidenav.programs', defaultMessage: 'Programs' },
  settings: { id: 'rwaq.admin.sidenav.settings', defaultMessage: 'Settings' },
  comingSoon: { id: 'rwaq.admin.sidenav.comingSoon', defaultMessage: 'Soon' },
  navAriaLabel: { id: 'rwaq.admin.sidenav.navAriaLabel', defaultMessage: 'Admin navigation' },
  settingsToggle: { id: 'rwaq.admin.sidenav.settingsToggle', defaultMessage: 'Toggle settings menu' },
});

// ── TopBar ────────────────────────────────────────────────────────────────────

export const topBarMessages = defineMessages({
  welcome: { id: 'rwaq.admin.topbar.welcome', defaultMessage: 'Welcome' },
  themeToggle: { id: 'rwaq.admin.topbar.themeToggle', defaultMessage: 'Toggle light/dark theme' },
  account: { id: 'rwaq.admin.topbar.account', defaultMessage: 'Account menu' },
  darkMode: { id: 'rwaq.admin.topbar.darkMode', defaultMessage: 'Dark Mode' },
  roleAdmin: { id: 'rwaq.admin.topbar.role.admin', defaultMessage: 'Administrator' },
  roleStaff: { id: 'rwaq.admin.topbar.role.staff', defaultMessage: 'Staff' },
  profile: { id: 'rwaq.admin.topbar.profile', defaultMessage: 'Profile' },
  accountSettings: { id: 'rwaq.admin.topbar.accountSettings', defaultMessage: 'Account' },
  studio: { id: 'rwaq.admin.topbar.studio', defaultMessage: 'Studio' },
  learnerDashboard: { id: 'rwaq.admin.topbar.learnerDashboard', defaultMessage: 'LMS' },
  logout: { id: 'rwaq.admin.topbar.logout', defaultMessage: 'Log out' },
  openNav: { id: 'rwaq.admin.topbar.openNav', defaultMessage: 'Open navigation' },
});

// ── FilterBar ─────────────────────────────────────────────────────────────────

export const filterBarMessages = defineMessages({
  searchLabel: {
    id: 'rwaq.admin.filterBar.searchLabel',
    defaultMessage: 'Search',
  },
  searchPlaceholder: {
    id: 'rwaq.admin.filterBar.searchPlaceholder',
    defaultMessage: 'Enter Org name',
  },
  sortLabel: {
    id: 'rwaq.admin.filterBar.sortLabel',
    defaultMessage: 'Sort by',
  },
});
