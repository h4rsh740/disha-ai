export const CAREERS_PER_PAGE = 6;

/** Keep every match reachable, without mutating its order or identity. */
export function paginateCareers<T>(matches: readonly T[], requestedPage: number) {
  const pageCount = Math.max(1, Math.ceil(matches.length / CAREERS_PER_PAGE));
  const requested = Number.isFinite(requestedPage) ? Math.trunc(requestedPage) : 1;
  const currentPage = Math.max(1, Math.min(requested, pageCount));
  const start = (currentPage - 1) * CAREERS_PER_PAGE;

  return {
    pageCount,
    currentPage,
    start,
    visible: matches.slice(start, start + CAREERS_PER_PAGE),
  };
}
