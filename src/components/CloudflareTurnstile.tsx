"use client";

import { useEffect, useRef, useState } from "react";

const TURNSTILE_SITE_KEY =
  process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "0x4AAAAAAEjTl6tGMYdu0R-z";

/**
 * Programmatically reset all mounted Turnstile widgets across the app
 * (useful after a failed login attempt or token expiry).
 */
export function resetTurnstile() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("reset-turnstile"));
  }
}

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
  const isTurnstileDisabled =
    process.env.NODE_ENV === "development" &&
    (process.env.NEXT_PUBLIC_DISABLE_TURNSTILE === "true" ||
      process.env.NEXT_PUBLIC_DISABLE_CLOUDFLARE === "true");

  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Store latest callbacks in refs to prevent unnecessary re-renders when parent states change
  const onVerifyRef = useRef(onVerify);
  const onExpireRef = useRef(onExpire);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onVerifyRef.current = onVerify;
    onExpireRef.current = onExpire;
    onErrorRef.current = onError;
  });

  useEffect(() => {
    if (isTurnstileDisabled) {
      onVerifyRef.current("turnstile-disabled");
    }
  }, [isTurnstileDisabled]);

  // Listen for programmatic reset events (e.g. on submit failure)
  useEffect(() => {
    if (isTurnstileDisabled) return;
    const handleGlobalReset = () => {
      setHasError(false);
      setIsLoaded(false);
      onVerifyRef.current("");
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.reset(widgetIdRef.current);
          return;
        } catch (err) {
          console.warn("[Cloudflare Turnstile] Global reset notice:", err);
        }
      }
      setRetryCount(prev => prev + 1);
    };

    window.addEventListener("reset-turnstile", handleGlobalReset);
    return () => {
      window.removeEventListener("reset-turnstile", handleGlobalReset);
    };
  }, [isTurnstileDisabled]);

  useEffect(() => {
    if (isTurnstileDisabled) return;
    onVerifyRef.current("");
    setIsLoaded(false);
    setHasError(false);
    let isMounted = true;
    let scriptTimeoutId: ReturnType<typeof setTimeout> | null = null;
    let script: HTMLScriptElement | null = null;
    const scriptId = "cf-turnstile-script";

    const clearScriptTimeout = () => {
      if (scriptTimeoutId !== null) {
        clearTimeout(scriptTimeoutId);
        scriptTimeoutId = null;
      }
    };

    const reportError = (error: unknown) => {
      if (!isMounted) return true;
      clearScriptTimeout();
      setIsLoaded(true);
      setHasError(true);
      onVerifyRef.current("");
      onErrorRef.current?.(error);
      return true;
    };

    const renderWidget = () => {
      if (!isMounted || !containerRef.current || widgetIdRef.current || !window.turnstile) {
        return;
      }

      try {
        const widgetId = window.turnstile.render(containerRef.current, {
          sitekey: TURNSTILE_SITE_KEY,
          theme,
          size,
          retry: "never",
          "refresh-expired": "manual",
          "refresh-timeout": "manual",
          callback: (token: string) => {
            if (!isMounted) return;
            setIsLoaded(true);
            setHasError(false);
            onVerifyRef.current(token);
          },
          "expired-callback": () => {
            if (!isMounted) return;
            setIsLoaded(false);
            setHasError(false);
            onExpireRef.current?.();
            onVerifyRef.current("");
            // Auto reset on expiry so user gets a fresh token seamlessly
            if (widgetIdRef.current && window.turnstile) {
              try {
                window.turnstile.reset(widgetIdRef.current);
              } catch (error) { reportError(error); }
            }
          },
          "error-callback": reportError,
          "timeout-callback": () => reportError("challenge-timeout"),
          "unsupported-callback": () => reportError("unsupported-browser"),
        });

        widgetIdRef.current = widgetId;
      } catch (e) {
        reportError(e);
      }
    };

    const handleScriptError = () => {
      if (!isMounted) return;
      script?.remove();
      reportError("script-load-error");
    };
    const handleScriptLoad = () => {
      clearScriptTimeout();
      if (window.turnstile) renderWidget();
      else handleScriptError();
    };

    if (window.turnstile) {
      renderWidget();
    } else {
      script = document.getElementById(scriptId) as HTMLScriptElement | null;
      const isNewScript = !script;
      if (!script) {
        script = document.createElement("script");
        script.id = scriptId;
        script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
        script.async = true;
        script.defer = true;
      }
      script.addEventListener("load", handleScriptLoad);
      script.addEventListener("error", handleScriptError);
      // A blocked SDK remains a failed check, never a fabricated verification token.
      scriptTimeoutId = setTimeout(handleScriptError, 15000);
      if (isNewScript) document.head.appendChild(script);
    }

    return () => {
      isMounted = false;
      clearScriptTimeout();
      script?.removeEventListener("load", handleScriptLoad);
      script?.removeEventListener("error", handleScriptError);
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {}
        widgetIdRef.current = null;
      }
    };
  }, [theme, size, retryCount, isTurnstileDisabled]);

  const handleRetry = () => {
    onVerifyRef.current("");
    if (widgetIdRef.current && window.turnstile) {
      try {
        window.turnstile.remove(widgetIdRef.current);
      } catch {}
      widgetIdRef.current = null;
    }
    setHasError(false);
    setIsLoaded(false);
    setRetryCount(prev => prev + 1);
  };

  if (isTurnstileDisabled) return null;

  return (
    <div className={`flex flex-col items-center justify-center my-3 min-h-[50px] ${className}`}>
      <div ref={containerRef} className="rounded-xl overflow-hidden shadow-sm" />
      {!isLoaded && !hasError && (
        <div className="flex items-center gap-2 text-xs text-on-surface-variant/70 animate-pulse py-1">
          <span className="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
          <span>حماية متقدمة عبر Cloudflare</span>
        </div>
      )}
      {hasError && (
        <div role="alert" className="flex flex-wrap items-center justify-center gap-2 text-[11px] text-error bg-error/10 px-3 py-1.5 rounded-xl border border-error/20">
          <span className="material-symbols-outlined text-xs">error</span>
          <span>تعذر إكمال التحقق الأمني. أعد المحاولة أو عطّل مانع الإعلانات.</span>
          <button
            type="button"
            onClick={handleRetry}
            className="text-[10px] text-cyan-300 underline hover:text-cyan-200 ml-1"
            title="إعادة تحميل التحقق"
          >
            إعادة فحص
          </button>
        </div>
      )}
    </div>
  );
}
