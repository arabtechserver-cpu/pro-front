function categoryMatchesFilter(categoryName, filter) {
  if (filter === "all") return true;
  return String(categoryName || "").toLowerCase().includes(filter);
}

function sortDisplayGroups(groups) {
  return [...groups].sort((first, second) =>
    first.groupName.localeCompare(second.groupName, "en", { sensitivity: "base" })
  );
}

function createInitialCollapsedGroups(groups) {
  return groups.reduce((collapsed, group, index) => {
    collapsed[group.groupName] = index !== 0;
    return collapsed;
  }, {});
}

module.exports = { categoryMatchesFilter, createInitialCollapsedGroups, sortDisplayGroups };
