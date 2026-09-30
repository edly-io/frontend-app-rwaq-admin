/**
 * Orders & Payments — payment history and revenue splits, for Rwaq superadmins.
 *
 * Built on the dashboard's primitives (MetricChart, DateRangePicker,
 * InfoTooltip) and the list pages' SearchFilterBar + AdminDataTable, so it
 * looks like the rest of the panel in both themes.
 *
 * One tab row. Overview holds the tiles and trends, the other tabs are lists.
 * Every tab has its own date range, so one tab's setting never narrows another.
 * The partner is chosen on the tab that uses it (Overview, history, content,
 * learners, coupons) and lives in the URL so a reload keeps it. Switching tabs
 * clears it, so nothing stays narrowed out of sight. "View overview" on By
 * partner opens Overview for that partner.
 */
import {
  Suspense, lazy, useCallback, useEffect, useState,
} from 'react';
import type { ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Spinner, Tab, Tabs } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import ErrorState from '@src/components/ErrorState';
import LoadingPage from '@src/components/LoadingPage';
import { useAdminCapabilities } from '@src/data/whoami';
import messages from './messages';

// Each tab is its own chunk, so opening the page loads only Overview and the
// others download the first time they are opened.
const OverviewTab = lazy(() => import('./components/OverviewTab'));
const OrdersTab = lazy(() => import('./components/OrdersTab'));
const PartnersTab = lazy(() => import('./components/PartnersTab'));
const ContentTab = lazy(() => import('./components/ContentTab'));
const LearnersTab = lazy(() => import('./components/LearnersTab'));
const CouponsTab = lazy(() => import('./components/CouponsTab'));

const TABS = ['overview', 'orders', 'partners', 'content', 'learners', 'coupons'] as const;
type PaymentsTab = typeof TABS[number];

/**
 * The tab row switches at once and this pane shows a spinner while its code
 * loads and while its first render is prepared. Mounting waits one frame so the
 * spinner paints before the tab's (heavier) first render blocks the page.
 */
const TabPanel = ({ children }: { children: ReactNode }) => {
  const intl = useIntl();
  const [ready, setReady] = useState(false);
  useEffect(() => {
    // requestAnimationFrame pauses in a hidden window, so a timer backs it up.
    const show = () => setReady(true);
    const frame = requestAnimationFrame(show);
    const timer = setTimeout(show, 100);
    return () => { cancelAnimationFrame(frame); clearTimeout(timer); };
  }, []);
  const loader = (
    <div
      className="rwaq-table-shell rwaq-table-state"
      data-testid="tab-loading"
      aria-label={intl.formatMessage(messages.loadingTab)}
    >
      <Spinner animation="border" variant="primary" role="status">
        <span className="sr-only">{intl.formatMessage(messages.loadingTab)}</span>
      </Spinner>
    </div>
  );
  return ready ? <Suspense fallback={loader}>{children}</Suspense> : loader;
};

const PaymentsDashboard = () => {
  const intl = useIntl();
  const [searchParams, setSearchParams] = useSearchParams();

  const tabParam = searchParams.get('tab') as PaymentsTab | null;
  const tab: PaymentsTab = tabParam && TABS.includes(tabParam) ? tabParam : 'overview';
  const org = searchParams.get('org') ?? '';
  const content = searchParams.get('content') ?? '';
  const contentTitle = searchParams.get('contentTitle') ?? '';
  const user = searchParams.get('user') ?? '';
  const userTitle = searchParams.get('userTitle') ?? '';
  const couponCode = searchParams.get('couponCode') ?? '';

  const updateParams = useCallback((updates: Record<string, string | undefined>) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      Object.entries(updates).forEach(([key, value]) => {
        if (value) { next.set(key, value); } else { next.delete(key); }
      });
      return next;
    }, { replace: true });
  }, [setSearchParams]);

  const setOrg = (value: string) => updateParams({ org: value || undefined });
  const clearFocus = () => updateParams({
    content: undefined, contentTitle: undefined, user: undefined, userTitle: undefined, couponCode: undefined,
  });

  return (
    <div className="rwaq-page">
      <div className="rwaq-page-header">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <h1 className="rwaq-page-title mb-0">{intl.formatMessage(messages.title)}</h1>
        </div>
      </div>

      <div className="rwaq-payments-tabs">
        <Tabs
          id="payments-tabs"
          activeKey={tab}
          onSelect={(key: string | null) => updateParams({
            tab: key && key !== 'overview' ? key : undefined,
            org: undefined,
            content: undefined,
            contentTitle: undefined,
            user: undefined,
            userTitle: undefined,
            couponCode: undefined,
          })}
          mountOnEnter
        >
          <Tab eventKey="overview" title={intl.formatMessage(messages.tabOverview)}>
            <TabPanel>
              <OverviewTab org={org} onOrgChange={setOrg} />
            </TabPanel>
          </Tab>
          <Tab eventKey="orders" title={intl.formatMessage(messages.tabOrders)}>
            <TabPanel>
              <OrdersTab
                org={org}
                onOrgChange={setOrg}
                content={content}
                contentTitle={contentTitle}
                user={user}
                userTitle={userTitle}
                couponCode={couponCode}
                onFocusClear={clearFocus}
              />
            </TabPanel>
          </Tab>
          <Tab eventKey="partners" title={intl.formatMessage(messages.tabPartners)}>
            <TabPanel>
              <PartnersTab
                onViewOverview={(short) => updateParams({ tab: undefined, org: short })}
                onViewOrders={(short) => updateParams({ tab: 'orders', org: short })}
              />
            </TabPanel>
          </Tab>
          <Tab eventKey="content" title={intl.formatMessage(messages.tabContent)}>
            <TabPanel>
              <ContentTab
                org={org}
                onOrgChange={setOrg}
                onViewOrders={(key, title) => updateParams({
                  tab: 'orders', org: undefined, content: key, contentTitle: title,
                })}
              />
            </TabPanel>
          </Tab>
          <Tab eventKey="learners" title={intl.formatMessage(messages.tabLearners)}>
            <TabPanel>
              <LearnersTab
                org={org}
                onOrgChange={setOrg}
                onViewOrders={(userId, username) => updateParams({
                  tab: 'orders', org: undefined, user: String(userId), userTitle: username,
                })}
              />
            </TabPanel>
          </Tab>
          <Tab eventKey="coupons" title={intl.formatMessage(messages.tabCoupons)}>
            <TabPanel>
              <CouponsTab
                org={org}
                onOrgChange={setOrg}
                onViewOrders={(code) => updateParams({ tab: 'orders', org: undefined, couponCode: code })}
              />
            </TabPanel>
          </Tab>
        </Tabs>
      </div>
    </div>
  );
};

/**
 * The panel also admits global staff, so the page checks for a superuser
 * itself before anything fetches. The backend refuses others with 403 anyway.
 */
const PaymentsPage = () => {
  const intl = useIntl();
  const { data: capabilities, isLoading } = useAdminCapabilities();

  if (isLoading) { return <LoadingPage />; }
  if (!capabilities?.isSuperuser) {
    return (
      <div className="rwaq-page">
        <ErrorState statusCode={403} title={intl.formatMessage(messages.forbiddenTitle)} />
      </div>
    );
  }
  return <PaymentsDashboard />;
};

export default PaymentsPage;
