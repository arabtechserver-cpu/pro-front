function categoryMatchesFilter(categoryName, filter) {
  if (filter === "all") return true;
  return String(categoryName || "").toLowerCase().includes(filter);
}

function sortDisplayGroups(groups) {
  return [...groups].sort((first, second) =>
    first.groupName.localeCompare(second.groupName, "en", { sensitivity: "base" })
  );
}

module.exports = { categoryMatchesFilter, sortDisplayGroups };
