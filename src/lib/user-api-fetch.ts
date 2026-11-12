import {
  getUserAuthToken,
  decodeJwtClaims,
  isUserIdleExpired,
  touchUserActivity,
  saveUserSessionStorage,
  clearUserSessionStorage
} from './client-auth-token';

let redirecting = false;

export type SessionLogoutReason = 'session-expired' | 'idle-timeout' | 'manual';

export function isJwtExpired(token: string): boolean {
  const payload = decodeJwtClaims(token);
  if (!payload) return false;
  return typeof payload.exp === 'number' && payload.exp * 1000 <= Date.now();
}

export function clearClientSessionState() {
  clearUserSessionStorage(localStorage);
  document.cookie = 'user_token=; Path=/; Max-Age=0; SameSite=Lax';
  window.dispatchEvent(new Event('user_session_change'));
}

function handleExpiredSessionOnce(reason: 'session-expired' | 'idle-timeout' = 'session-expired') {
  if (redirecting) return;
  redirecting = true;
  clearClientSessionState();
  const lang = window.location.pathname.split('/')[1] === 'en' ? 'en' : 'ar';
  window.location.replace(`/${lang}/login?reason=${reason}`);
}

export function saveClientUserSession(token: string | null | undefined, user: unknown) {
  redirecting = false;
  saveUserSessionStorage(localStorage, token, user);
  window.dispatchEvent(new Event('user_session_change'));
}

export function performClientUserLogout(options: {
  reason?: SessionLogoutReason;
  redirect?: boolean;
  notifyServer?: boolean;
} = {}) {
  const { reason = 'manual', redirect = false, notifyServer = true } = options;
  const activeToken = getUserAuthToken(localStorage);
  if (notifyServer && activeToken) {
    try {
      void fetch('/api/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${activeToken}` },
        credentials: 'omit',
        keepalive: true
      }).catch(() => {});
    } catch {}
  }
  if (redirect && reason !== 'manual') {
    handleExpiredSessionOnce(reason);
    return;
  }
  clearClientSessionState();
  if (redirect) {
    if (redirecting) return;
    redirecting = true;
    const lang = window.location.pathname.split('/')[1] === 'en' ? 'en' : 'ar';
    window.location.replace(`/${lang}/login`);
  }
}

export async function userApiFetch(input: string, init: RequestInit = {}): Promise<Response> {
  if (redirecting) return Response.json({ error: 'Session expired' }, { status: 401 });
  const token = getUserAuthToken(localStorage);
  if (!token) {
    if (localStorage.getItem('user_session')) {
      clearUserSessionStorage(localStorage);
    }
    return Response.json({ error: 'Session expired' }, { status: 401 });
  }
  if (isJwtExpired(token)) {
    handleExpiredSessionOnce('session-expired');
    return Response.json({ error: 'Session expired' }, { status: 401 });
  }
  if (isUserIdleExpired(localStorage)) {
    handleExpiredSessionOnce('idle-timeout');
    return Response.json({ error: 'Session expired' }, { status: 401 });
  }
  const headers = new Headers(init.headers);
  const isPassivePoll = headers.get('x-passive-poll') === 'true' || headers.get('x-passive-request') === 'true';
  headers.set('Authorization', `Bearer ${token}`);
  // Client requests use the client token, including the legacy storage key.
  // Never let an unrelated admin cookie authenticate a client request.
  const response = await fetch(input, {
    ...init,
    headers,
    credentials: 'omit',
    signal: init.signal || AbortSignal.timeout(30000)
  });
  if (response.status === 401 && token === getUserAuthToken(localStorage) && !redirecting) {
    let reason: 'session-expired' | 'idle-timeout' = 'session-expired';
    if (typeof response.clone === 'function') {
      const payload = await response.clone().json().catch(() => null);
      if (payload?.code === 'SESSION_IDLE_EXPIRED') {
        reason = 'idle-timeout';
      }
    }
    handleExpiredSessionOnce(reason);
  } else if (response.ok && !isPassivePoll) {
    touchUserActivity(localStorage);
  }
  return response;
}
