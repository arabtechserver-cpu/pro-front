const USER_IDLE_TIMEOUT_MS = 30 * 60 * 1000;
const USER_LAST_ACTIVITY_KEY = 'user_last_activity';
const USER_LAST_HEARTBEAT_KEY = 'user_last_heartbeat';

function getUserAuthToken(storage) {
  for (const key of ["user_token", "token"]) {
    const raw = storage.getItem(key);
    const token = raw && raw.trim().replace(/^["']|["']$/g, "").replace(/^Bearer\s+/i, "").trim();
    if (token && !["null", "undefined", "false", "[object Object]"].includes(token)) return token;
  }
  return null;
}

function decodeBase64UrlSegment(segment) {
  const normalized = String(segment || '').replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=');
  if (typeof atob === 'function') return atob(padded);
  if (typeof Buffer !== 'undefined') return Buffer.from(padded, 'base64').toString('utf8');
  return null;
}

function decodeJwtClaims(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  try {
    const json = decodeBase64UrlSegment(parts[1]);
    if (!json) return null;
    const parsed = JSON.parse(json);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

function readUserLastActivityMs(storage, token) {
  const storedRaw = storage.getItem(USER_LAST_ACTIVITY_KEY);
  const storedNum = storedRaw ? Number(storedRaw) : NaN;
  if (Number.isFinite(storedNum) && storedNum > 0) {
    return storedNum;
  }
  const activeToken = token || getUserAuthToken(storage);
  const claims = activeToken ? decodeJwtClaims(activeToken) : null;
  if (claims && typeof claims.iat === 'number' && claims.iat > 0) {
    return claims.iat * 1000;
  }
  return null;
}

function touchUserActivity(storage, nowMs = Date.now()) {
  if (!getUserAuthToken(storage)) return false;
  if (typeof storage.setItem === 'function') {
    storage.setItem(USER_LAST_ACTIVITY_KEY, String(nowMs));
  }
  return true;
}

function isUserIdleExpired(storage, nowMs = Date.now(), timeoutMs = USER_IDLE_TIMEOUT_MS) {
  const token = getUserAuthToken(storage);
  if (!token) return false;
  const lastMs = readUserLastActivityMs(storage, token);
  if (lastMs === null) return false;
  return nowMs - lastMs >= timeoutMs;
}

function saveUserSessionStorage(storage, token, user, nowMs = Date.now()) {
  if (typeof storage.setItem !== 'function') return;
  if (token) storage.setItem('user_token', token);
  if (user) storage.setItem('user_session', typeof user === 'string' ? user : JSON.stringify(user));
  storage.setItem(USER_LAST_ACTIVITY_KEY, String(nowMs));
  storage.setItem(USER_LAST_HEARTBEAT_KEY, String(nowMs));
}

function clearUserSessionStorage(storage) {
  if (typeof storage.removeItem !== 'function') return;
  storage.removeItem('user_token');
  storage.removeItem('token');
  storage.removeItem('user_session');
  storage.removeItem(USER_LAST_ACTIVITY_KEY);
  storage.removeItem(USER_LAST_HEARTBEAT_KEY);
}

module.exports = {
  USER_IDLE_TIMEOUT_MS,
  USER_LAST_ACTIVITY_KEY,
  USER_LAST_HEARTBEAT_KEY,
  getUserAuthToken,
  decodeJwtClaims,
  readUserLastActivityMs,
  touchUserActivity,
  isUserIdleExpired,
  saveUserSessionStorage,
  clearUserSessionStorage,
};
