function categoryMatchesFilter(categoryName, filter) {
  if (filter === "all") return true;
  return String(categoryName || "").toLowerCase().includes(filter);
}

const groupCollator = new Intl.Collator("en", { sensitivity: "base" });
function sortDisplayGroups(groups) {
  return [...groups].sort((first, second) =>
    groupCollator.compare(first.groupName, second.groupName)
  );
}

function createInitialCollapsedGroups(groups) {
  return groups.reduce((collapsed, group, index) => {
    collapsed[group.groupName] = index !== 0;
    return collapsed;
  }, {});
}

module.exports = { categoryMatchesFilter, createInitialCollapsedGroups, sortDisplayGroups };
