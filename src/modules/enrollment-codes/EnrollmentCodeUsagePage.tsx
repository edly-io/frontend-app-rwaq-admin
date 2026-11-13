import { Link, useNavigate, useParams } from 'react-router-dom';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Button } from '@openedx/paragon';
import { ArrowBack } from '@openedx/paragon/icons';
import ErrorState from '@src/components/ErrorState';
import LoadingPage from '@src/components/LoadingPage';
import { useAdminCapabilities } from '@src/data/whoami';
import { getErrorStatus } from '@src/data/httpError';
import CodeUsagePanel from './components/CodeUsagePanel';
import { useEnrollmentCode } from './data/hooks';
import messages from './messages';

const UsageContent = () => {
  const intl = useIntl();
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, error } = useEnrollmentCode(Number(id));
  if (isLoading) { return <LoadingPage />; }
  if (!data) {
    return <ErrorState statusCode={getErrorStatus(error) || 404} title={intl.formatMessage(messages.errorTitle)} />;
  }
  return (
    <div className="rwaq-page">
      <div className="rwaq-page-header">
        <div className="mb-2">
          <Button variant="tertiary" size="sm" iconBefore={ArrowBack} onClick={() => navigate('/enrollment-codes')}>
            {intl.formatMessage(messages.backToCodes)}
          </Button>
        </div>
        <div className="rwaq-page-header__breadcrumb">
          <Link to="/enrollment-codes">{intl.formatMessage(messages.title)}</Link>
          {` / ${data.code}`}
        </div>
        <h1 className="rwaq-page-title">{data.code}</h1>
      </div>
      <CodeUsagePanel code={data} onClose={() => navigate(`/enrollment-codes?tab=uses&codeId=${data.id}&code=${encodeURIComponent(data.code)}`)} />
    </div>
  );
};

const EnrollmentCodeUsagePage = () => {
  const intl = useIntl();
  const { data, isLoading } = useAdminCapabilities();
  if (isLoading) { return <LoadingPage />; }
  if (!data?.isSuperuser) {
    return <ErrorState statusCode={403} title={intl.formatMessage(messages.forbiddenTitle)} />;
  }
  return <UsageContent />;
};

export default EnrollmentCodeUsagePage;
