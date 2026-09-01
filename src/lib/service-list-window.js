function takeInitialGroups(groups, limit) {
  return groups.slice(0, Math.max(0, limit));
}

module.exports = { takeInitialGroups };
