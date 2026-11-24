/**
 * Extra arguments of a stats GET. A refresh sends `force_refresh=1`, which makes the backend skip its
 * cache read (it still stores the fresh result). A normal request sends nothing extra, so its call
 * stays `get(url)`.
 */
const forceRefreshArgs = (forceRefresh: boolean) => (
  forceRefresh ? [{ params: { force_refresh: 1 } }] as const : [] as const
);

export default forceRefreshArgs;
