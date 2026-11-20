import { useState } from 'react';
import {
  ActionRow, Alert, AlertModal, Button, Form,
} from '@openedx/paragon';
import { defineMessages, useIntl } from '@edx/frontend-platform/i18n';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import RichTextEditor from '@src/components/RichTextEditor';
import { getStudioApiUrl } from '@src/data/utils';

const messages = defineMessages({
  subject: { id: 'rwaq.admin.programEmail.subject', defaultMessage: 'Subject' },
  body: { id: 'rwaq.admin.programEmail.body', defaultMessage: 'Message' },
  recipients: { id: 'rwaq.admin.programEmail.recipients', defaultMessage: 'Recipients' },
  myself: { id: 'rwaq.admin.programEmail.myself', defaultMessage: 'Myself' },
  active: { id: 'rwaq.admin.programEmail.active', defaultMessage: 'All active learners' },
  notCompleted: { id: 'rwaq.admin.programEmail.notCompleted', defaultMessage: 'Not completed' },
  count: { id: 'rwaq.admin.programEmail.count', defaultMessage: '{count} recipients, {skipped} opted out' },
  previewError: { id: 'rwaq.admin.programEmail.previewError', defaultMessage: 'Could not load the recipient count.' },
  send: { id: 'rwaq.admin.programEmail.send', defaultMessage: 'Send email' },
  confirm: { id: 'rwaq.admin.programEmail.confirm', defaultMessage: 'Send this email to {count} recipients?' },
  confirmSend: { id: 'rwaq.admin.programEmail.confirmSend', defaultMessage: 'Confirm send' },
  cancel: { id: 'rwaq.admin.programEmail.cancel', defaultMessage: 'Cancel' },
  queued: { id: 'rwaq.admin.programEmail.queued', defaultMessage: 'Email submitted. Check history for its status.' },
  error: { id: 'rwaq.admin.programEmail.error', defaultMessage: 'Could not send the email.' },
  history: { id: 'rwaq.admin.programEmail.history', defaultMessage: 'Email history' },
  historyError: { id: 'rwaq.admin.programEmail.historyError', defaultMessage: 'Could not load email history.' },
  counts: { id: 'rwaq.admin.programEmail.counts', defaultMessage: '{sent} sent, {failed} failed, {skipped} skipped' },
  queuedStatus: { id: 'rwaq.admin.programEmail.status.queued', defaultMessage: 'Queued' },
  sendingStatus: { id: 'rwaq.admin.programEmail.status.sending', defaultMessage: 'Sending' },
  completeStatus: { id: 'rwaq.admin.programEmail.status.complete', defaultMessage: 'Complete' },
  failedStatus: { id: 'rwaq.admin.programEmail.status.failed', defaultMessage: 'Failed' },
});

interface HistoryItem {
  id: number; subject: string; status: 'queued' | 'sending' | 'complete' | 'failed';
  sent_count: number; failed_count: number; skipped_count: number;
}

const ProgramEmailTab = ({ uuid }: { uuid: string }) => {
  const intl = useIntl();
  const queryClient = useQueryClient();
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [recipients, setRecipients] = useState('myself');
  const [confirming, setConfirming] = useState(false);
  const statusMessages = {
    queued: messages.queuedStatus,
    sending: messages.sendingStatus,
    complete: messages.completeStatus,
    failed: messages.failedStatus,
  };
  const base = getStudioApiUrl(`/api/v1/admin/programs/${uuid}`);
  const preview = useQuery({
    queryKey: ['programEmailRecipients', uuid, recipients],
    queryFn: async () => (await getAuthenticatedHttpClient().get(`${base}/email-recipients/`, { params: { recipients } })).data as { count: number; skipped_count: number },
  });
  const history = useQuery({
    queryKey: ['programEmailHistory', uuid],
    queryFn: async () => (await getAuthenticatedHttpClient().get(`${base}/emails/`)).data as HistoryItem[],
    refetchInterval: (query) => (query.state.data?.some((item) => item.status === 'queued' || item.status === 'sending') ? 5000 : false),
  });
  const send = useMutation({
    mutationFn: async () => getAuthenticatedHttpClient().post(`${base}/emails/`, { subject, body, recipients }),
    onSuccess: () => {
      setSubject(''); setBody('');
      queryClient.invalidateQueries({ queryKey: ['programEmailHistory', uuid] });
    },
  });

  return (
    <div className="p-3">
      {send.isError && <Alert variant="danger">{intl.formatMessage(messages.error)}</Alert>}
      {send.isSuccess && <Alert variant="success">{intl.formatMessage(messages.queued)}</Alert>}
      <Form.Group controlId="program-email-subject">
        <Form.Label>{intl.formatMessage(messages.subject)}</Form.Label>
        <Form.Control
          value={subject}
          maxLength={128}
          onChange={(event) => {
            setConfirming(false); setSubject(event.target.value); if (send.isSuccess) { send.reset(); }
          }}
        />
      </Form.Group>
      <Form.Group controlId="program-email-recipients">
        <Form.Label>{intl.formatMessage(messages.recipients)}</Form.Label>
        <Form.Control
          as="select"
          value={recipients}
          onChange={(event) => {
            setConfirming(false); setRecipients(event.target.value); if (send.isSuccess) { send.reset(); }
          }}
        >
          <option value="myself">{intl.formatMessage(messages.myself)}</option>
          <option value="active">{intl.formatMessage(messages.active)}</option>
          <option value="not_completed">{intl.formatMessage(messages.notCompleted)}</option>
        </Form.Control>
      </Form.Group>
      {preview.isError && <Alert variant="danger">{intl.formatMessage(messages.previewError)}</Alert>}
      {preview.data && (
        <p>{intl.formatMessage(messages.count, { count: preview.data.count, skipped: preview.data.skipped_count })}</p>
      )}
      <p>{intl.formatMessage(messages.body)}</p>
      <RichTextEditor
        value={body}
        onChange={(value) => { setConfirming(false); setBody(value); if (send.isSuccess) { send.reset(); } }}
        ariaLabel={intl.formatMessage(messages.body)}
      />
      <Button
        className="mt-3"
        disabled={!subject.trim() || !body.trim() || !preview.data?.count || preview.isFetching || send.isPending}
        onClick={() => setConfirming(true)}
      >
        {intl.formatMessage(messages.send)}
      </Button>
      <AlertModal
        title={intl.formatMessage(messages.send)}
        isOpen={confirming && !!preview.data}
        onClose={() => setConfirming(false)}
        variant="default"
        footerNode={(
          <ActionRow>
            <Button variant="outline-primary" onClick={() => setConfirming(false)}>
              {intl.formatMessage(messages.cancel)}
            </Button>
            <Button onClick={() => { setConfirming(false); send.mutate(); }}>
              {intl.formatMessage(messages.confirmSend)}
            </Button>
          </ActionRow>
        )}
      >
        {intl.formatMessage(messages.confirm, { count: preview.data?.count ?? 0 })}
      </AlertModal>
      <h3 className="mt-4">{intl.formatMessage(messages.history)}</h3>
      {history.isError && <Alert variant="danger">{intl.formatMessage(messages.historyError)}</Alert>}
      {history.data?.map((item) => (
        <div key={item.id} className="border-bottom py-2">
          <strong>{item.subject}</strong> ({statusMessages[item.status]
            ? intl.formatMessage(statusMessages[item.status]) : item.status})
          <div>
            {intl.formatMessage(messages.counts, {
              sent: item.sent_count, failed: item.failed_count, skipped: item.skipped_count,
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProgramEmailTab;
