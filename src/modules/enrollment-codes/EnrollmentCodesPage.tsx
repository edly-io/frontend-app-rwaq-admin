/**
 * Enrollment codes — free but restricted courses and programs that learners join with a code.
 *
 * Two tabs, like Orders & Payments: Codes (create, edit, switch off, share) and Uses (who joined with
 * which code). Superusers only. The tab and the code a Uses view is narrowed to live in the URL, so a
 * reload or a link keeps them. A tab stays mounted once opened, so it keeps its filters and page, and a
 * hidden one does not query (ActiveTabContext).
 *
 * `?create=1&scope=course|program&id=<course id or program uuid>` (the pricing cards' Add enrollment code
 * button) opens the create form with that item fixed. The params are removed from the URL once it opens.
 */
import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Tab, Tabs } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import ErrorState from '@src/components/ErrorState';
import LoadingPage from '@src/components/LoadingPage';
import { useAdminCapabilities } from '@src/data/whoami';
import { useCourse } from '@src/modules/courses/data/hooks';
import { useProgram } from '@src/modules/programs/data/hooks';
import { TabCard } from '@src/modules/payments/components/shared';
import { ActiveTabContext } from '@src/modules/payments/data/activeTab';
import CodeUsagePanel from './components/CodeUsagePanel';
import CodesList from './components/CodesList';
import UsesTab from './components/UsesTab';
import type { PickedItem } from './components/ItemPicker';
import type { EnrollmentCode } from './data/types';
import messages from './messages';

const TABS = ['codes', 'uses'] as const;
type CodesTab = typeof TABS[number];

/** The item named by `?create=1&scope=&id=`, read once when the page opens. */
const readCreateRequest = (params: URLSearchParams): { kind: 'course' | 'program'; id: string } | null => {
  const scope = params.get('scope');
  const id = params.get('id');
  if (params.get('create') !== '1' || !id || (scope !== 'course' && scope !== 'program')) { return null; }
  return { kind: scope, id };
};

const EnrollmentCodesContent = () => {
  const intl = useIntl();
  const [searchParams, setSearchParams] = useSearchParams();
  const [usage, setUsage] = useState<EnrollmentCode | null>(null);
  const [createRequest, setCreateRequest] = useState(() => readCreateRequest(searchParams));
  const course = useCourse(createRequest?.kind === 'course' ? createRequest.id : '');
  const program = useProgram(createRequest?.kind === 'program' ? createRequest.id : '');

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

  // The link params are spent as soon as they are read, so a reload or Back does not reopen the form.
  useEffect(() => {
    if (searchParams.has('create') || searchParams.has('scope') || searchParams.has('id')) {
      updateParams({
        create: undefined, scope: undefined, id: undefined, tab: undefined,
      });
    }
  }, [searchParams, updateParams]);

  // Wait for the item's name, which the form shows. A failed lookup still opens the form, named by its id.
  let prefillItem: PickedItem | undefined;
  if (createRequest) {
    const lookup = createRequest.kind === 'course' ? course : program;
    if (lookup.isSuccess || lookup.isError) {
      const found = createRequest.kind === 'course' ? course.data?.displayName : program.data?.name;
      prefillItem = { kind: createRequest.kind, id: createRequest.id, name: found || createRequest.id };
    }
  }

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
                  prefillItem={prefillItem}
                  onPrefillHandled={() => setCreateRequest(null)}
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
