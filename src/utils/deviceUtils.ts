/**
 * Device fingerprinting, trusted device token management, and WebRTC local IP extraction.
 * No external dependencies required; uses browser standard Web Crypto and WebRTC APIs.
 */

const STORAGE_KEY_DEVICE_TOKEN = 'arad_admin_device_token';
const COOKIE_NAME_DEVICE_TOKEN = 'admin_device_token';

let cachedLocalIpResult: { localIp: string | null; isMdns: boolean } | null = null;

/**
 * Returns existing device token or generates a new cryptographically strong token.
 * Persists to localStorage and syncs with document cookie so SSR / server actions receive it.
 */
export function getOrCreateDeviceToken(): string {
  if (typeof window === 'undefined') {
    return '';
  }

  try {
    let token = localStorage.getItem(STORAGE_KEY_DEVICE_TOKEN);
    if (!token || token.trim().length < 16) {
      if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        token = `dtk_${crypto.randomUUID().replace(/-/g, '')}_${Date.now().toString(36)}`;
      } else {
        const randPart = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        token = `dtk_${randPart}_${Date.now().toString(36)}`;
      }
      localStorage.setItem(STORAGE_KEY_DEVICE_TOKEN, token);
    }

    // Keep cookie in sync for 1 year
    const isSecure = window.location.protocol === 'https:';
    document.cookie = `${COOKIE_NAME_DEVICE_TOKEN}=${encodeURIComponent(token)}; path=/; max-age=31536000; SameSite=Lax${isSecure ? '; Secure' : ''}`;

    return token;
  } catch {
    return '';
  }
}

/**
 * Generates a deterministic device fingerprint based on browser hardware and environment signals.
 */
export async function getDeviceFingerprint(): Promise<string> {
  if (typeof window === 'undefined') {
    return 'server_env';
  }

  try {
    const screenInfo = `${window.screen.width}x${window.screen.height}x${window.screen.colorDepth}`;
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'unknown_tz';
    const lang = navigator.language || 'unknown_lang';
    const platform = navigator.platform || (navigator as any).userAgentData?.platform || 'unknown_plat';
    const hardware = String(navigator.hardwareConcurrency || 1);
    const ua = navigator.userAgent || '';

    const rawSignature = `${screenInfo}|${timezone}|${lang}|${platform}|${hardware}|${ua}`;

    if (typeof crypto !== 'undefined' && crypto.subtle) {
      const msgBuffer = new TextEncoder().encode(rawSignature);
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 32);
    }

    // Fallback fast hash
    let hash = 0;
    for (let i = 0; i < rawSignature.length; i++) {
      const chr = rawSignature.charCodeAt(i);
      hash = ((hash << 5) - hash) + chr;
      hash |= 0;
    }
    return `fp_${Math.abs(hash).toString(16)}`;
  } catch {
    return 'fp_fallback';
  }
}

/**
 * Extracts local network interface IP (LAN IP) via WebRTC RTCPeerConnection.
 * Handles IPv4, IPv6, and modern mobile privacy mDNS hostnames (.local).
 */
export async function getLocalIpViaWebRTC(timeoutMs = 1500): Promise<{ localIp: string | null; isMdns: boolean }> {
  if (cachedLocalIpResult) {
    return cachedLocalIpResult;
  }

  if (typeof window === 'undefined' || !window.RTCPeerConnection) {
    return { localIp: null, isMdns: false };
  }

  return new Promise((resolve) => {
    let resolved = false;
    let peerConnection: RTCPeerConnection | null = null;
    const candidates: string[] = [];

    const finish = (ip: string | null, isMdns: boolean) => {
      if (resolved) return;
      resolved = true;
      clearTimeout(timer);
      if (peerConnection) {
        try {
          peerConnection.close();
        } catch (_) {}
      }
      cachedLocalIpResult = { localIp: ip, isMdns };
      resolve(cachedLocalIpResult);
    };

    const timer = setTimeout(() => {
      if (candidates.length > 0) {
        const ipv4Candidate = candidates.find(c => /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(c));
        if (ipv4Candidate) {
          finish(ipv4Candidate, false);
          return;
        }
        const mdnsCandidate = candidates.find(c => c.toLowerCase().endsWith('.local'));
        if (mdnsCandidate) {
          finish(mdnsCandidate, true);
          return;
        }
        finish(candidates[0], candidates[0].toLowerCase().endsWith('.local'));
      } else {
        finish(null, false);
      }
    }, timeoutMs);

    try {
      peerConnection = new RTCPeerConnection({ iceServers: [] });
      peerConnection.createDataChannel('');

      peerConnection.onicecandidate = (event) => {
        if (!event || !event.candidate) {
          if (candidates.length > 0) {
            const ipv4 = candidates.find(c => /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(c));
            if (ipv4) {
              finish(ipv4, false);
              return;
            }
            const mdns = candidates.find(c => c.toLowerCase().endsWith('.local'));
            finish(mdns || candidates[0], !!mdns);
          }
          return;
        }

        const candidateStr = event.candidate.candidate;
        // Parse candidate token: candidate:<foundation> <component> <protocol> <priority> <ip/hostname> <port> typ host ...
        const parts = candidateStr.split(' ');
        if (parts.length >= 5) {
          const candidateAddress = parts[4];
          if (candidateAddress) {
            candidates.push(candidateAddress);
            if (/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(candidateAddress)) {
              finish(candidateAddress, false);
              return;
            }
          }
        }
      };

      peerConnection.createOffer()
        .then(offer => peerConnection?.setLocalDescription(offer))
        .catch(() => finish(null, false));
    } catch {
      finish(null, false);
    }
  });
}

/**
 * Returns a human-readable friendly description for the current device and browser.
 */
export function getDeviceDescription(): string {
  if (typeof window === 'undefined') return 'جهاز غير محدد';

  const ua = navigator.userAgent || '';
  let os = 'جهاز غير معروف';
  if (/android/i.test(ua)) os = 'هاتف Android';
  else if (/iphone|ipad|ipod/i.test(ua)) os = 'هاتف iPhone / iPad';
  else if (/windows/i.test(ua)) os = 'كمبيوتر Windows';
  else if (/macintosh|mac os x/i.test(ua)) os = 'كمبيوتر Mac';
  else if (/linux/i.test(ua)) os = 'نظام Linux';

  let browser = '';
  if (/edg/i.test(ua)) browser = 'Edge';
  else if (/chrome|crios/i.test(ua)) browser = 'Chrome';
  else if (/firefox|fxios/i.test(ua)) browser = 'Firefox';
  else if (/safari/i.test(ua)) browser = 'Safari';

  return browser ? `${os} (${browser})` : os;
}
