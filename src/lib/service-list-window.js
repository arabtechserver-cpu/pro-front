function takeInitialGroups(groups, limit) {
  return groups.slice(0, Math.max(0, limit));
}

// Keep mounted rows bounded even after a long browsing session. Clamp before
// slicing so filtering a later page never briefly produces an empty result.
function getCatalogPage(items, requestedPage, pageSize) {
  const size = Math.max(1, Math.floor(pageSize) || 1);
  const total = items.length;
  const pageCount = Math.max(1, Math.ceil(total / size));
  const page = Math.min(pageCount, Math.max(1, Math.floor(requestedPage) || 1));
  const start = (page - 1) * size;
  return { items: items.slice(start, start + size), page, pageCount, start, total };
}

module.exports = { takeInitialGroups, getCatalogPage };
