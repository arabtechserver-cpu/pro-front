import { getUserAuthToken } from './client-auth-token';

let redirecting = false;

export async function userApiFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const token = getUserAuthToken(localStorage);
  if (redirecting && !token) return Response.json({ error: 'Session expired' }, { status: 401 });
  const headers = new Headers(init.headers);
  if (token) headers.set('Authorization', `Bearer ${token}`);
  else headers.delete('Authorization');
  // Client requests use the client token, including the legacy storage key.
  // Never let an unrelated admin cookie authenticate a client request.
  const response = await fetch(input, {
    ...init,
    headers,
    credentials: 'omit',
    signal: init.signal || AbortSignal.timeout(30000)
  });
  if (response.status === 401 && token === getUserAuthToken(localStorage) && !redirecting) {
    redirecting = true;
    localStorage.removeItem('user_token');
    localStorage.removeItem('token');
    localStorage.removeItem('user_session');
    document.cookie = 'user_token=; Path=/; Max-Age=0; SameSite=Lax';
    window.dispatchEvent(new Event('user_session_change'));
    const lang = window.location.pathname.split('/')[1] === 'en' ? 'en' : 'ar';
    window.location.replace(`/${lang}/login?reason=session-expired`);
  }
  return response;
}
