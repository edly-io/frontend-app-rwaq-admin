/**
 * Enrollment codes — free but restricted courses and programs that learners join with a code.
 *
 * Two tabs, like Orders & Payments: Codes (create, edit, switch off, share) and Uses (who joined with
 * which code). Superusers only. The tab and the code a Uses view is narrowed to live in the URL, so a
 * reload or a link keeps them. A tab stays mounted once opened, so it keeps its filters and page, and a
 * hidden one does not query (ActiveTabContext).
 */
import { useCallback, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Tab, Tabs } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import ErrorState from '@src/components/ErrorState';
import LoadingPage from '@src/components/LoadingPage';
import { useAdminCapabilities } from '@src/data/whoami';
import { TabCard } from '@src/modules/payments/components/shared';
import { ActiveTabContext } from '@src/modules/payments/data/activeTab';
import CodeUsagePanel from './components/CodeUsagePanel';
import CodesList from './components/CodesList';
import UsesTab from './components/UsesTab';
import type { EnrollmentCode } from './data/types';
import messages from './messages';

const TABS = ['codes', 'uses'] as const;
type CodesTab = typeof TABS[number];

const EnrollmentCodesContent = () => {
  const intl = useIntl();
  const [searchParams, setSearchParams] = useSearchParams();
  const [usage, setUsage] = useState<EnrollmentCode | null>(null);

  const tabParam = searchParams.get('tab') as CodesTab | null;
  const tab: CodesTab = tabParam && TABS.includes(tabParam) ? tabParam : 'codes';
  const codeIdParam = Number(searchParams.get('codeId'));
  const codeId = Number.isInteger(codeIdParam) && codeIdParam > 0 ? codeIdParam : undefined;
  const codeLabel = searchParams.get('code') ?? undefined;

  const updateParams = useCallback((updates: Record<string, string | undefined>) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      Object.entries(updates).forEach(([key, value]) => {
        if (value) { next.set(key, value); } else { next.delete(key); }
      });
      return next;
    }, { replace: true });
  }, [setSearchParams]);

  return (
    <div className="rwaq-page">
      <div className="rwaq-page-header">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <h1 className="rwaq-page-title mb-0">{intl.formatMessage(messages.title)}</h1>
        </div>
      </div>

      <div className="rwaq-payments-tabs">
        <Tabs
          id="enrollment-codes-tabs"
          activeKey={tab}
          onSelect={(key: string | null) => {
            if ((key ?? 'codes') === tab) { return; }
            // Opening a tab by hand drops the code the Uses view was narrowed to, so nothing hides.
            updateParams({ tab: key && key !== 'codes' ? key : undefined, codeId: undefined, code: undefined });
          }}
          mountOnEnter
        >
          <Tab eventKey="codes" title={intl.formatMessage(messages.tabCodes)}>
            <ActiveTabContext.Provider value={tab === 'codes'}>
              <TabCard>
                <CodesList
                  onViewUsage={setUsage}
                  onViewUses={(code) => updateParams({
                    tab: 'uses', codeId: String(code.id), code: code.code,
                  })}
                />
              </TabCard>
            </ActiveTabContext.Provider>
          </Tab>
          <Tab eventKey="uses" title={intl.formatMessage(messages.tabUses)}>
            <ActiveTabContext.Provider value={tab === 'uses'}>
              <TabCard>
                <UsesTab
                  codeId={codeId}
                  codeLabel={codeLabel}
                  onClearCode={() => updateParams({ codeId: undefined, code: undefined })}
                />
              </TabCard>
            </ActiveTabContext.Provider>
          </Tab>
        </Tabs>
      </div>
      <CodeUsagePanel code={usage} onClose={() => setUsage(null)} />
    </div>
  );
};

/**
 * The panel also admits global staff, so the page checks for a superuser itself before anything fetches.
 * The backend refuses others with 403 anyway.
 */
const EnrollmentCodesPage = () => {
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
  return <EnrollmentCodesContent />;
};

export default EnrollmentCodesPage;
