import {
  USER_IDLE_TIMEOUT_MS,
  USER_LAST_ACTIVITY_KEY,
  USER_LAST_HEARTBEAT_KEY,
  getUserAuthToken,
  readUserLastActivityMs,
  touchUserActivity,
  isUserIdleExpired
} from './client-auth-token';
import {
  clearClientSessionState,
  isJwtExpired,
  performClientUserLogout,
  userApiFetch
} from './user-api-fetch';

export const ACTIVITY_WRITE_THROTTLE_MS = 5000;
export const SERVER_HEARTBEAT_INTERVAL_MS = 4 * 60 * 1000;

export function isProtectedUserPath(pathname: string): boolean {
  return /^\/(ar|en)\/(wallet|orders|purchase|profile|api-developer)(\/|$)/.test(pathname);
}

export function isAuthUserPath(pathname: string): boolean {
  return /^\/(ar|en)\/(login|register)(\/|$)/.test(pathname);
}

export function startUserInactivityMonitor(): () => void {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return () => {};
  }

  let timerId: ReturnType<typeof setTimeout> | null = null;
  let lastLocalWriteMs = 0;
  let lastHeartbeatAttemptMs = 0;
  let heartbeatInFlight = false;

  const clearScheduledTimer = () => {
    if (timerId !== null) {
      clearTimeout(timerId);
      timerId = null;
    }
  };

  const getPathname = () => window.location?.pathname || '/';

  const maybeSendHeartbeat = (forceCheck = false) => {
    const token = getUserAuthToken(localStorage);
    if (!token || heartbeatInFlight) return;
    if (document.visibilityState === 'hidden') return;
    if (isJwtExpired(token) || isUserIdleExpired(localStorage)) return;

    const nowMs = Date.now();
    const storedHeartbeat = Number(localStorage.getItem(USER_LAST_HEARTBEAT_KEY) || 0);
    const effectiveLastHeartbeat = Math.max(lastHeartbeatAttemptMs, Number.isFinite(storedHeartbeat) ? storedHeartbeat : 0);
    if (!forceCheck && nowMs - effectiveLastHeartbeat < SERVER_HEARTBEAT_INTERVAL_MS) return;
    if (forceCheck && nowMs - effectiveLastHeartbeat < SERVER_HEARTBEAT_INTERVAL_MS) return;

    lastHeartbeatAttemptMs = nowMs;
    if (typeof localStorage.setItem === 'function') {
      localStorage.setItem(USER_LAST_HEARTBEAT_KEY, String(nowMs));
    }
    heartbeatInFlight = true;
    void userApiFetch('/api/auth/heartbeat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}'
    })
      .catch(() => {})
      .finally(() => {
        heartbeatInFlight = false;
      });
  };

  const enforceExpiryIfDue = (isLiveEvent: boolean): boolean => {
    const token = getUserAuthToken(localStorage);
    const pathname = getPathname();

    if (!token) {
      clearScheduledTimer();
      if (localStorage.getItem('user_session') || localStorage.getItem(USER_LAST_ACTIVITY_KEY)) {
        clearClientSessionState();
      }
      return false;
    }

    if (isJwtExpired(token) || isUserIdleExpired(localStorage)) {
      clearScheduledTimer();
      const shouldRedirect =
        isProtectedUserPath(pathname) || (isLiveEvent && !isAuthUserPath(pathname));
      performClientUserLogout({
        reason: 'idle-timeout',
        redirect: shouldRedirect,
        notifyServer: true
      });
      return true;
    }

    return false;
  };

  const scheduleRemainingTimer = () => {
    clearScheduledTimer();
    const token = getUserAuthToken(localStorage);
    if (!token) return;

    const nowMs = Date.now();
    let lastMs = readUserLastActivityMs(localStorage, token);
    if (lastMs === null) {
      touchUserActivity(localStorage, nowMs);
      lastMs = nowMs;
    }

    const remainingMs = lastMs + USER_IDLE_TIMEOUT_MS - nowMs;
    if (remainingMs <= 0) {
      enforceExpiryIfDue(true);
      return;
    }

    // Re-check shared storage when the local timer expires in case another tab stayed active.
    timerId = setTimeout(() => {
      if (enforceExpiryIfDue(true)) return;
      scheduleRemainingTimer();
    }, remainingMs);
  };

  const onUserActivity = () => {
    if (document.visibilityState === 'hidden') return;
    if (enforceExpiryIfDue(true)) return;
    if (!getUserAuthToken(localStorage)) return;

    const nowMs = Date.now();
    if (nowMs - lastLocalWriteMs >= ACTIVITY_WRITE_THROTTLE_MS) {
      lastLocalWriteMs = nowMs;
      touchUserActivity(localStorage, nowMs);
      scheduleRemainingTimer();
    }
    maybeSendHeartbeat(false);
  };

  const onVisibilityOrFocus = () => {
    if (document.visibilityState === 'hidden') return;
    if (enforceExpiryIfDue(true)) return;
    if (!getUserAuthToken(localStorage)) return;
    scheduleRemainingTimer();
    maybeSendHeartbeat(true);
  };

  const onStorageSync = (event: StorageEvent) => {
    if (
      event.key !== null &&
      !['user_token', 'token', 'user_session', USER_LAST_ACTIVITY_KEY].includes(event.key)
    ) {
      return;
    }
    const token = getUserAuthToken(localStorage);
    if (!token) {
      clearScheduledTimer();
      window.dispatchEvent(new Event('user_session_change'));
      if (isProtectedUserPath(getPathname())) {
        const lang = getPathname().split('/')[1] === 'en' ? 'en' : 'ar';
        window.location.replace(`/${lang}/login?reason=idle-timeout`);
      }
      return;
    }
    if (enforceExpiryIfDue(true)) return;
    scheduleRemainingTimer();
  };

  const onSessionChange = () => {
    if (!getUserAuthToken(localStorage)) {
      clearScheduledTimer();
      return;
    }
    if (enforceExpiryIfDue(false)) return;
    scheduleRemainingTimer();
  };

  // Initial check runs immediately when the user opens any page on the site.
  if (!enforceExpiryIfDue(false) && getUserAuthToken(localStorage)) {
    const nowMs = Date.now();
    lastLocalWriteMs = nowMs;
    touchUserActivity(localStorage, nowMs);
    scheduleRemainingTimer();
    maybeSendHeartbeat(false);
  }

  const activityEvents = ['pointerdown', 'keydown', 'touchstart', 'click'] as const;
  activityEvents.forEach((evt) => window.addEventListener(evt, onUserActivity, { passive: true }));
  window.addEventListener('scroll', onUserActivity, { passive: true });
  window.addEventListener('focus', onVisibilityOrFocus);
  document.addEventListener('visibilitychange', onVisibilityOrFocus);
  window.addEventListener('storage', onStorageSync);
  window.addEventListener('user_session_change', onSessionChange);

  return () => {
    clearScheduledTimer();
    activityEvents.forEach((evt) => window.removeEventListener(evt, onUserActivity));
    window.removeEventListener('scroll', onUserActivity);
    window.removeEventListener('focus', onVisibilityOrFocus);
    document.removeEventListener('visibilitychange', onVisibilityOrFocus);
    window.removeEventListener('storage', onStorageSync);
    window.removeEventListener('user_session_change', onSessionChange);
  };
}
