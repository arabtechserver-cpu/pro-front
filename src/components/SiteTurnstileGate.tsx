"use client";

import { useEffect, useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import { Locale } from "@/i18n/config";
import BrandLogo from "./BrandLogo";
import CloudflareTurnstile, { resetTurnstile } from "./CloudflareTurnstile";

const STORAGE_KEY = "cf_site_verified_until";
const VERIFICATION_TTL_MS = 6 * 60 * 60 * 1000;

export default function SiteTurnstileGate({ lang }: { lang: Locale }) {
  const pathname = usePathname();
  const isAr = lang === "ar";

  const isAuthFormWithOwnWidget =
    pathname?.endsWith("/login") ||
    pathname?.endsWith("/register") ||
    pathname?.includes("/admin/login");

  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [isVerifyingServer, setIsVerifyingServer] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    let active = true;

    const checkExistingVerification = async () => {
      try {
        const storedUntil = Number(sessionStorage.getItem(STORAGE_KEY) || "0");
        if (storedUntil > Date.now()) {
          if (active) {
            setIsVerified(true);
            setIsCheckingStatus(false);
          }
          return;
        }

        const res = await fetch("/api/auth/verify-turnstile", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });
        if (res.ok) {
          const data = await res.json().catch(() => ({}));
          if (data?.verified) {
            sessionStorage.setItem(STORAGE_KEY, String(Date.now() + VERIFICATION_TTL_MS));
            if (active) {
              setIsVerified(true);
              setIsCheckingStatus(false);
            }
            return;
          }
        }
      } catch {
        // Proceed to interactive Turnstile challenge
      }

      if (active) {
        setIsVerified(false);
        setIsCheckingStatus(false);
      }
    };

    void checkExistingVerification();
    return () => {
      active = false;
    };
  }, []);

  const verifyTokenWithBackend = useCallback(
    async (token: string) => {
      if (!token) return;
      setIsVerifyingServer(true);
      setErrorMsg("");

      try {
        const res = await fetch("/api/auth/verify-turnstile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ "cf-turnstile-response": token }),
        });

        const data = await res.json().catch(() => ({}));
        if (res.ok && data?.success) {
          sessionStorage.setItem(STORAGE_KEY, String(Date.now() + VERIFICATION_TTL_MS));
          setIsVerified(true);
          return;
        }

        setErrorMsg(
          data?.error ||
            (isAr
              ? "فشل التحقق الأمني من Cloudflare. يرجى المحاولة مرة أخرى."
              : "Cloudflare security check failed. Please try again.")
        );
        setTurnstileToken("");
        resetTurnstile();
      } catch {
        setErrorMsg(
          isAr
            ? "تعذر الاتصال بخادم التحقق الأمني. يرجى المحاولة مرة أخرى."
            : "Unable to reach the security verification server. Please retry."
        );
        setTurnstileToken("");
        resetTurnstile();
      } finally {
        setIsVerifyingServer(false);
      }
    },
    [isAr]
  );

  const handleTurnstileVerify = useCallback(
    (token: string) => {
      setTurnstileToken(token);
      if (token) {
        void verifyTokenWithBackend(token);
      }
    },
    [verifyTokenWithBackend]
  );

  if (isAuthFormWithOwnWidget || isCheckingStatus || isVerified) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[#07070c]/95 backdrop-blur-xl animate-in fade-in duration-200"
      dir={isAr ? "rtl" : "ltr"}
      role="dialog"
      aria-modal="true"
      aria-labelledby="cf-gate-title"
    >
      <div className="w-full max-w-md rounded-2xl border border-primary/30 bg-[#11121c] p-6 sm:p-8 shadow-[0_0_50px_rgba(124,58,237,0.25)] text-center relative overflow-hidden">
        <div className="flex flex-col items-center gap-3 mb-5">
          <BrandLogo lang={lang} size="auth" />
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/15 border border-primary/30 text-primary text-xs font-bold">
            <span className="material-symbols-outlined text-sm">shield_lock</span>
            <span>
              {isAr ? "حماية Cloudflare الإجبارية ضد الروبوتات" : "Mandatory Cloudflare Anti-Bot Protection"}
            </span>
          </div>
          <h2 id="cf-gate-title" className="text-lg sm:text-xl font-bold text-white mt-1">
            {isAr ? "يرجى تأكيد أنك لست روبوت للمتابعة" : "Please verify you are human to continue"}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {isAr
              ? "لحماية سيرفر عرب تك برو من الهجمات الآلية والروبوتات، يرجى إكمال فحص الأمان السريع من Cloudflare للدخول إلى الموقع."
              : "To protect Arab Tech Pro Server from automated bots and attacks, please complete the Cloudflare security check to enter the site."}
          </p>
        </div>

        <div className="my-4 flex flex-col items-center justify-center min-h-[75px] rounded-xl bg-black/40 border border-white/10 p-3">
          <CloudflareTurnstile
            onVerify={handleTurnstileVerify}
            onExpire={() => setTurnstileToken("")}
            onError={() => setTurnstileToken("")}
          />
        </div>

        {isVerifyingServer && (
          <div className="mt-3 flex items-center justify-center gap-2 text-xs text-primary font-semibold">
            <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span>{isAr ? "جاري تأكيد التصريح الأمني والدخول..." : "Verifying security clearance..."}</span>
          </div>
        )}

        {errorMsg && (
          <div className="mt-3 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-semibold flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-sm">error</span>
            <span>{errorMsg}</span>
          </div>
        )}

        <button
          type="button"
          disabled={!turnstileToken || isVerifyingServer}
          onClick={() => void verifyTokenWithBackend(turnstileToken)}
          className="mt-4 w-full py-3 rounded-xl bg-primary text-white font-bold text-xs sm:text-sm hover:bg-primary/90 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-base">verified_user</span>
          <span>{isAr ? "متابعة الدخول إلى الموقع" : "Continue to Website"}</span>
        </button>
      </div>
    </div>
  );
}

