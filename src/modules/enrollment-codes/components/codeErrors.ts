/** The backend refuses a code change with `{ detail, field? }`. `field` names the form field it is about. */
export interface CodeError {
  detail: string | null;
  field: string | null;
}

export const readCodeError = (err: unknown): CodeError => {
  const data = (err as { response?: { data?: { detail?: unknown; field?: unknown } } })?.response?.data;
  return {
    detail: typeof data?.detail === 'string' ? data.detail : null,
    field: typeof data?.field === 'string' ? data.field : null,
  };
};
