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
import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Tab, Tabs } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import ErrorState from '@src/components/ErrorState';
import LoadingPage from '@src/components/LoadingPage';
import { useAdminCapabilities } from '@src/data/whoami';
import ContentTab from './components/ContentTab';
import CouponsTab from './components/CouponsTab';
import LearnersTab from './components/LearnersTab';
import OrdersTab from './components/OrdersTab';
import OverviewTab from './components/OverviewTab';
import PartnersTab from './components/PartnersTab';
import messages from './messages';

const TABS = ['overview', 'orders', 'partners', 'content', 'learners', 'coupons'] as const;
type PaymentsTab = typeof TABS[number];

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
            <OverviewTab org={org} onOrgChange={setOrg} />
          </Tab>
          <Tab eventKey="orders" title={intl.formatMessage(messages.tabOrders)}>
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
          </Tab>
          <Tab eventKey="partners" title={intl.formatMessage(messages.tabPartners)}>
            <PartnersTab
              onViewOverview={(short) => updateParams({ tab: undefined, org: short })}
              onViewOrders={(short) => updateParams({ tab: 'orders', org: short })}
            />
          </Tab>
          <Tab eventKey="content" title={intl.formatMessage(messages.tabContent)}>
            <ContentTab
              org={org}
              onOrgChange={setOrg}
              onViewOrders={(key, title) => updateParams({
                tab: 'orders', org: undefined, content: key, contentTitle: title,
              })}
            />
          </Tab>
          <Tab eventKey="learners" title={intl.formatMessage(messages.tabLearners)}>
            <LearnersTab
              org={org}
              onOrgChange={setOrg}
              onViewOrders={(userId, username) => updateParams({
                tab: 'orders', org: undefined, user: String(userId), userTitle: username,
              })}
            />
          </Tab>
          <Tab eventKey="coupons" title={intl.formatMessage(messages.tabCoupons)}>
            <CouponsTab
              org={org}
              onOrgChange={setOrg}
              onViewOrders={(code) => updateParams({ tab: 'orders', org: undefined, couponCode: code })}
            />
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
