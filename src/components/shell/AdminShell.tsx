/**
 * AdminShell — the top-level layout: persistent LEFT SIDEBAR + right column.
 *
 * Layout matches edly-panel-frontend:
 *   [ SideNav (260px, fixed left) ] [ TopBar (right-column header) ]
 *                                   [ <Outlet/> content             ]
 *                                   [ footer                        ]
 *
 * Mobile (≤768px): sidebar hidden, opened by TopBar hamburger as an overlay.
 * Global-Staff guard: non-staff see an access-denied message.
 * Server enforces IsGlobalStaff; this guard is defense-in-depth only.
 */
import { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Container } from '@openedx/paragon';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { defineMessages, useIntl } from '@edx/frontend-platform/i18n';
import SideNav from './SideNav';
import TopBar from './TopBar';
import ErrorState from '../ErrorState';

const messages = defineMessages({
  accessDeniedTitle: {
    id: 'rwaq.admin.shell.accessDeniedTitle',
    defaultMessage: 'Access denied',
  },
});

const BREAKPOINT_MD = 768;

// ── Guard ─────────────────────────────────────────────────────────────────────

type GuardState = 'pending' | 'allowed' | 'denied';

const useStaffGuard = (): GuardState => {
  const navigate = useNavigate();
  const [state, setState] = useState<GuardState>('pending');

  useEffect(() => {
    const user = getAuthenticatedUser();
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }
    // frontend-platform maps JWT `is_staff` → user.administrator
    if (user.administrator === true) {
      setState('allowed');
    } else {
      setState('denied');
    }
  }, [navigate]);

  return state;
};

// ── Responsive hook ───────────────────────────────────────────────────────────

const useIsDesktop = (): boolean => {
  const [isDesktop, setIsDesktop] = useState(
    () => (typeof window !== 'undefined' ? window.innerWidth >= BREAKPOINT_MD : true),
  );

  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${BREAKPOINT_MD}px)`);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return isDesktop;
};

// ── Mobile overlay sidebar ────────────────────────────────────────────────────

interface OverlaySidebarProps {
  open: boolean;
  onClose: () => void;
}

const OverlaySidebar = ({ open, onClose }: OverlaySidebarProps) => {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) { return undefined; }
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { onClose(); } };
    document.addEventListener('keydown', handleKey);
    overlayRef.current?.focus();
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  return (
    <>
      {open && (
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,.45)',
            zIndex: 1040,
          }}
          aria-hidden="true"
        />
      )}
      <div
        ref={overlayRef}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation"
        tabIndex={-1}
        style={{
          position: 'fixed',
          top: 0,
          insetInlineStart: 0,
          height: '100vh',
          zIndex: 1050,
          transform: open ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 250ms cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        <SideNav onNavigate={onClose} />
      </div>
    </>
  );
};

// ── Main AdminShell ───────────────────────────────────────────────────────────

const AdminShell = () => {
  const intl = useIntl();
  const guardState = useStaffGuard();
  const isDesktop = useIsDesktop();
  const [drawerOpen, setDrawerOpen] = useState(false);

  if (guardState === 'pending') {
    return null;
  }

  if (guardState === 'denied') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Container>
          <ErrorState
            statusCode={403}
            title={intl.formatMessage(messages.accessDeniedTitle)}
          />
        </Container>
      </div>
    );
  }

  return (
    <div
      className="rwaq-admin-shell"
      style={{
        display: 'flex',
        height: '100vh',
        overflow: 'hidden',
      }}
    >
      {/* ── Desktop: persistent sidebar ──────────────────────────────────── */}
      {isDesktop && (
        <div style={{
          flexShrink: 0, height: '100vh', position: 'sticky', top: 0,
        }}
        >
          <SideNav />
        </div>
      )}

      {/* ── Mobile: overlay sidebar ──────────────────────────────────────── */}
      {!isDesktop && (
        <OverlaySidebar open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      )}

      {/* ── Right column: TopBar + content ───────────────────────────────── */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          minWidth: 0,
        }}
      >
        <TopBar
          onMenuToggle={() => setDrawerOpen((prev) => !prev)}
          isMobile={!isDesktop}
        />

        {/* ── Scrollable content area ───────────────────────────────────── */}
        <main
          id="main-content"
          className="rwaq-admin-content"
          style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            padding: '1.5rem',
          }}
        >
          <Outlet />
        </main>

        {/* ── Footer ───────────────────────────────────────────────────── */}
        <footer
          role="contentinfo"
          className="rwaq-admin-footer"
          style={{
            padding: '0.75rem 1.5rem',
            textAlign: 'center',
            fontSize: '0.8125rem',
            flexShrink: 0,
          }}
        >
          &copy; {new Date().getFullYear()} Rwaq
        </footer>
      </div>
    </div>
  );
};

export default AdminShell;
