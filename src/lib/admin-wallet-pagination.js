/**
 * @param {{ limit?: number, status?: string, search?: string, cursor?: string | null }} [options]
 */
function buildAdminTransactionsUrl({ limit = 25, status = "all", search = "", cursor = null } = {}) {
  const params = new URLSearchParams();
  params.set("limit", String(limit));
  params.set("status", status || "all");
  const normalizedSearch = String(search || "").trim();
  if (normalizedSearch) params.set("search", normalizedSearch);
  if (cursor) params.set("cursor", String(cursor));
  return `/api/transactions?${params.toString()}`;
}

/**
 * @template {{ id: string }} T
 * @param {T[]} current
 * @param {T[]} incoming
 * @param {boolean} [reset]
 * @returns {T[]}
 */
function mergeTransactionPages(current, incoming, reset = false) {
  if (reset) return incoming;
  const byId = new Map(current.map((transaction) => [transaction.id, transaction]));
  for (const transaction of incoming) byId.set(transaction.id, transaction);
  return Array.from(byId.values());
}

module.exports = {
  buildAdminTransactionsUrl,
  mergeTransactionPages
};
