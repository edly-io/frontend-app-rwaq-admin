/**
 * Reading DRF error responses.
 *
 * The same two shapes were being re-derived in six places, each with slightly
 * different optional chaining. That is the kind of duplication that drifts —
 * one copy gains a case (a 429, say) and the other five silently do not.
 */

/** HTTP status from an axios-style error, or undefined if there was no response. */
export const getErrorStatus = (error: unknown): number | undefined => (
  (error as { response?: { status?: number } })?.response?.status
);

/**
 * The first human-readable message from a DRF error body.
 *
 * DRF reports field errors as `{ field: ["message"] }` and non-field errors as
 * `{ detail: "message" }`, so both shapes are handled. Returns null when there
 * is nothing readable, letting the caller choose its own fallback rather than
 * inventing one here.
 */
export const getErrorReason = (error: unknown): string | null => {
  const data = (error as { response?: { data?: Record<string, unknown> } })?.response?.data;
  if (!data) { return null; }
  const firstValue = Object.values(data)[0];
  if (Array.isArray(firstValue)) { return String(firstValue[0]); }
  return typeof firstValue === 'string' ? firstValue : null;
};
