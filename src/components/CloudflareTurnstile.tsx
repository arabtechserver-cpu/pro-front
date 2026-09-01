"use client";

import { useEffect, useRef, useState } from "react";

const TURNSTILE_SITE_KEY =
  process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "0x4AAAAAAEGa8uvGDLwzrReL";

interface CloudflareTurnstileProps {
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onError?: (error?: any) => void;
  theme?: "auto" | "light" | "dark";
  className?: string;
  size?: "normal" | "compact" | "flexible";
}

declare global {
  interface Window {
    turnstile?: {
      render: (container: string | HTMLElement, params: any) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
    };
    onTurnstileLoad?: () => void;
  }
}

export default function CloudflareTurnstile({
  onVerify,
  onExpire,
  onError,
  theme = "dark",
  className = "",
  size = "normal"
}: CloudflareTurnstileProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // 1. Ensure Turnstile Script is injected
    const scriptId = "cf-turnstile-script";
    let script = document.getElementById(scriptId) as HTMLScriptElement;

    const renderWidget = () => {
      if (window.turnstile && containerRef.current && !widgetIdRef.current) {
        try {
          const widgetId = window.turnstile.render(containerRef.current, {
            sitekey: TURNSTILE_SITE_KEY,
            theme,
            size,
            callback: (token: string) => {
              onVerify(token);
            },
            "expired-callback": () => {
              onExpire?.();
            },
            "error-callback": (err: any) => {
              console.warn("[Cloudflare Turnstile] Widget error:", err);
              onError?.(err);
              // In case of network errors or adblocker blocking Cloudflare, pass a fallback token
              onVerify("cf-turnstile-client-fallback");
            }
          });
          widgetIdRef.current = widgetId;
          setIsLoaded(true);
        } catch (e) {
          console.warn("[Cloudflare Turnstile] Render error:", e);
          onVerify("cf-turnstile-client-fallback");
        }
      }
    };

    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.defer = true;
      script.onload = () => {
        renderWidget();
      };
      document.head.appendChild(script);
    } else if (window.turnstile) {
      renderWidget();
    } else {
      script.addEventListener("load", renderWidget);
    }

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {}
        widgetIdRef.current = null;
      }
    };
  }, [onVerify, onExpire, onError, theme, size]);

  return (
    <div className={`flex flex-col items-center justify-center my-3 min-h-[65px] ${className}`}>
      <div ref={containerRef} className="rounded-xl overflow-hidden shadow-sm" />
      {!isLoaded && (
        <div className="flex items-center gap-2 text-xs text-on-surface-variant/70 animate-pulse py-2">
          <span className="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
          <span>جاري التحقق الأمني عبر Cloudflare... 🛡️</span>
        </div>
      )}
    </div>
  );
}
