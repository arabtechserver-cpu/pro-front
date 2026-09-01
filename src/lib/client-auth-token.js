function getUserAuthToken(storage) {
  const token = storage.getItem("user_token") || storage.getItem("token");
  return token && token !== "null" && token !== "undefined" ? token : null;
}

module.exports = { getUserAuthToken };
