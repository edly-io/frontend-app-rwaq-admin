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
 * partner opens Overview for that partner, and "View all" on the other tabs
 * opens Payment history for the row while keeping the partner. Both hand the
 * tab's date range to the tab they open, so it shows the same period.
 *
 * A tab stays mounted once opened, so it keeps its search, sort and page when
 * the user comes back. While hidden it does not query (ActiveTabContext).
 */
import {
  Component, Suspense, lazy, useCallback, useEffect, useState,
} from 'react';
import type { ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Button, Spinner, Tab, Tabs,
} from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import { logError } from '@edx/frontend-platform/logging';
import ErrorState from '@src/components/ErrorState';
import LoadingPage from '@src/components/LoadingPage';
import { useAdminCapabilities } from '@src/data/whoami';
import { ActiveTabContext } from './data/activeTab';
import type { DateRange, RangeHandoff } from './components/shared';
import messages from './messages';

// Each tab is its own chunk, so opening the page loads only Overview and the
// others download the first time they are opened.
const OverviewTab = lazy(() => import('./components/OverviewTab'));
const OrdersTab = lazy(() => import('./components/OrdersTab'));
const PartnersTab = lazy(() => import('./components/PartnersTab'));
const ContentTab = lazy(() => import('./components/ContentTab'));
const LearnersTab = lazy(() => import('./components/LearnersTab'));
const CouponsTab = lazy(() => import('./components/CouponsTab'));
const SubscriptionsTab = lazy(() => import('./components/SubscriptionsTab'));

const TABS = ['overview', 'orders', 'partners', 'content', 'learners', 'coupons', 'subscriptions'] as const;
type PaymentsTab = typeof TABS[number];

/** What a tab shows when its code fails to load (a dropped connection, a new deploy) or its render throws. */
const TabFailed = () => {
  const intl = useIntl();
  return (
    <ErrorState
      title={intl.formatMessage(messages.errorTitle)}
      action={(
        <Button variant="outline-primary" onClick={() => window.location.reload()}>
          {intl.formatMessage(messages.reload)}
        </Button>
      )}
    />
  );
};

/** Keeps one tab's failure from blanking the whole page: the tab row stays and the tab offers a reload. */
class TabErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error) {
    logError(error);
  }

  render() {
    const { failed } = this.state;
    const { children } = this.props;
    return failed ? <TabFailed /> : children;
  }
}

/**
 * The tab row switches at once and this pane shows a spinner while its code
 * loads and while its first render is prepared. Mounting waits one frame so the
 * spinner paints before the tab's (heavier) first render blocks the page.
 * `active` tells the tab's queries whether it is the one on screen.
 */
const TabPanel = ({ active, children }: { active: boolean; children: ReactNode }) => {
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
  return (
    <ActiveTabContext.Provider value={active}>
      <TabErrorBoundary>
        {ready ? <Suspense fallback={loader}>{children}</Suspense> : loader}
      </TabErrorBoundary>
    </ActiveTabContext.Provider>
  );
};

const PaymentsDashboard = () => {
  const intl = useIntl();
  const [searchParams, setSearchParams] = useSearchParams();

  const tabParam = searchParams.get('tab') as PaymentsTab | null;
  const tab: PaymentsTab = tabParam && TABS.includes(tabParam) ? tabParam : 'overview';
  const org = (searchParams.get('org') ?? '').trim();
  const content = searchParams.get('content') ?? '';
  const contentTitle = searchParams.get('contentTitle') ?? '';
  // A buyer id is a whole number. Anything else in the URL is ignored, as the backend would refuse it.
  const userParam = searchParams.get('user') ?? '';
  const user = /^\d+$/.test(userParam) ? userParam : '';
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
  const noFocus = {
    content: undefined, contentTitle: undefined, user: undefined, userTitle: undefined, couponCode: undefined,
  };
  const clearFocus = () => updateParams(noFocus);
  const clearScope = () => updateParams({ org: undefined, ...noFocus });

  // The range each jump hands to Overview or Payment history. A new id on every jump makes the tab take it.
  const [handoffs, setHandoffs] = useState<{ overview?: RangeHandoff; orders?: RangeHandoff }>({});
  const handOver = (target: 'overview' | 'orders', range: DateRange) => setHandoffs((prev) => ({
    ...prev, [target]: { ...range, id: (prev[target]?.id ?? 0) + 1 },
  }));
  const viewOrders = (range: DateRange, updates: Record<string, string>) => {
    handOver('orders', range);
    updateParams({ tab: 'orders', ...updates });
  };

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
          onSelect={(key: string | null) => {
            // Clicking the tab already open must not clear the partner or focus it is showing.
            if ((key ?? 'overview') === tab) { return; }
            updateParams({
              tab: key && key !== 'overview' ? key : undefined,
              org: undefined,
              content: undefined,
              contentTitle: undefined,
              user: undefined,
              userTitle: undefined,
              couponCode: undefined,
            });
          }}
          mountOnEnter
        >
          <Tab eventKey="overview" title={intl.formatMessage(messages.tabOverview)}>
            <TabPanel active={tab === 'overview'}>
              <OverviewTab org={org} onOrgChange={setOrg} range={handoffs.overview} />
            </TabPanel>
          </Tab>
          <Tab eventKey="orders" title={intl.formatMessage(messages.tabOrders)}>
            <TabPanel active={tab === 'orders'}>
              <OrdersTab
                org={org}
                onOrgChange={setOrg}
                content={content}
                contentTitle={contentTitle}
                user={user}
                userTitle={userTitle}
                couponCode={couponCode}
                onFocusClear={clearFocus}
                onScopeClear={clearScope}
                range={handoffs.orders}
              />
            </TabPanel>
          </Tab>
          <Tab eventKey="partners" title={intl.formatMessage(messages.tabPartners)}>
            <TabPanel active={tab === 'partners'}>
              <PartnersTab
                onViewOverview={(short, range) => {
                  handOver('overview', range);
                  updateParams({ tab: undefined, org: short });
                }}
                onViewOrders={(short, range) => viewOrders(range, { org: short })}
              />
            </TabPanel>
          </Tab>
          <Tab eventKey="content" title={intl.formatMessage(messages.tabContent)}>
            <TabPanel active={tab === 'content'}>
              <ContentTab
                org={org}
                onOrgChange={setOrg}
                onViewOrders={(key, title, range) => viewOrders(range, { content: key, contentTitle: title })}
              />
            </TabPanel>
          </Tab>
          <Tab eventKey="learners" title={intl.formatMessage(messages.tabLearners)}>
            <TabPanel active={tab === 'learners'}>
              <LearnersTab
                org={org}
                onOrgChange={setOrg}
                onViewOrders={(userId, username, range) => viewOrders(
                  range,
                  { user: String(userId), userTitle: username },
                )}
              />
            </TabPanel>
          </Tab>
          <Tab eventKey="coupons" title={intl.formatMessage(messages.tabCoupons)}>
            <TabPanel active={tab === 'coupons'}>
              <CouponsTab
                org={org}
                onOrgChange={setOrg}
                onViewOrders={(code, range) => viewOrders(range, { couponCode: code })}
              />
            </TabPanel>
          </Tab>
          <Tab eventKey="subscriptions" title={intl.formatMessage(messages.tabSubscriptions)}>
            <TabPanel active={tab === 'subscriptions'}>
              <SubscriptionsTab />
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
