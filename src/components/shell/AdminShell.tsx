/**
 * AdminShell — the top-level layout: persistent LEFT SIDEBAR + right column.
 *
 * Layout matches edly-panel-frontend:
 *   [ SideNav (260px, fixed left) ] [ TopBar (right-column header) ]
 *                                   [ <Outlet/> content             ]
 *                                   [ footer                        ]
 *
 * Mobile (≤768px): sidebar hidden, opened by TopBar hamburger as an overlay.
 * Superuser guard: anyone else sees an access-denied message. The server
 * enforces it too (IsSuperAdmin on every endpoint); this guard only avoids
 * rendering a shell whose every panel would 403.
 *
 * The answer comes from the API rather than the JWT because frontend-platform
 * does not surface the `superuser` claim — see data/whoami.
 */
import {
  Suspense, useEffect, useRef, useState,
} from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Container, Spinner } from '@openedx/paragon';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { useIntl } from '@edx/frontend-platform/i18n';
import { useAdminCapabilities } from '@src/data/whoami';
import SideNav from './SideNav';
import TopBar from './TopBar';
import ErrorState from '../ErrorState';
import { adminShellMessages as messages } from './messages';

const BREAKPOINT_MD = 768;

// ── Guard ─────────────────────────────────────────────────────────────────────

type GuardState = 'pending' | 'allowed' | 'denied';

const useStaffGuard = (): GuardState => {
  const navigate = useNavigate();
  const isSignedIn = getAuthenticatedUser() !== null;
  // Only asked once signed in — an anonymous caller would just get a 401 and
  // the redirect below is the right answer for them anyway.
  const { data, isLoading, isError } = useAdminCapabilities();

  useEffect(() => {
    if (!isSignedIn) {
      navigate('/login', { replace: true });
    }
  }, [isSignedIn, navigate]);

  if (!isSignedIn) { return 'pending'; }
  if (isLoading) { return 'pending'; }
  // A failed capability check is treated as denied rather than allowed. Getting
  // this backwards would render the whole panel to someone the API will refuse,
  // which reads as a broken app rather than a closed door.
  if (isError || !data) { return 'denied'; }

  return data.canAccessAdminPanel ? 'allowed' : 'denied';
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

/** Fills the content area while a route's chunk loads, so nothing resizes. */
const ContentLoading = () => (
  <div className="rwaq-content-loading">
    <Spinner animation="border" variant="primary" screenReaderText="Loading" />
  </div>
);

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
            body={intl.formatMessage(messages.accessDeniedBody)}
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
        // 100dvh, not 100%: React mounts the app inside wrapper divs that
        // have no height of their own, so a percentage resolves against an
        // auto-height parent and collapses to content height — the shell then
        // grows to 2500px and nothing inside it can ever scroll. The dynamic
        // viewport unit also tracks mobile browser chrome, which plain 100vh
        // does not.
        height: '100dvh',
        overflow: 'hidden',
      }}
    >
      {/* ── Desktop: persistent sidebar ──────────────────────────────────── */}
      {isDesktop && (
        <div style={{
          flexShrink: 0, height: '100dvh', position: 'sticky', top: 0,
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
          // minHeight: 0 is load-bearing. A flex item defaults to
          // min-height: auto, which refuses to shrink below its content — so
          // this column grew to content height and the scroll never reached
          // <main> below.
          minHeight: 0,
        }}
      >
        <TopBar
          onMenuToggle={() => setDrawerOpen((prev) => !prev)}
          isMobile={!isDesktop}
        />

        {/* ── Scrollable content area ───────────────────────────────────── */}
        {/* The scroll container for every page that isn't viewport-fitted.
            Without minHeight: 0 it expanded to its content instead of
            scrolling: a long page simply had its bottom clipped by the
            shell's overflow: hidden, and each time a table swapped a spinner
            for rows the whole column resized, which is the blink on load. */}
        <main
          id="main-content"
          className="rwaq-admin-content"
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            overflowX: 'hidden',
            padding: '1.5rem',
          }}
        >
          {/* The Suspense boundary lives here, around the outlet only.
              Previously the single boundary sat above <AdminShell/> in
              index.tsx, so the first visit to any lazily-loaded route
              suspended the entire tree: the fallback replaced the sidebar and
              topbar too, and the shell remounted once the chunk arrived. That
              is the full-screen reload on the first click of each menu item.
              Scoped here, the chrome stays mounted and only the content area
              swaps. */}
          <Suspense fallback={<ContentLoading />}>
            <Outlet />
          </Suspense>
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
