function getUserAuthToken(storage) {
  for (const key of ["user_token", "token"]) {
    const raw = storage.getItem(key);
    const token = raw && raw.trim().replace(/^["']|["']$/g, "").replace(/^Bearer\s+/i, "").trim();
    if (token && !["null", "undefined", "false", "[object Object]"].includes(token)) return token;
  }
  return null;
}

module.exports = { getUserAuthToken };
