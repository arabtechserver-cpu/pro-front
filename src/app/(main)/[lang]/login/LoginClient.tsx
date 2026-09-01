"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Script from "next/script";
import { Locale } from "@/i18n/config";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "540676912586-vifo9ogu2gjud3d00efv1khd9r7tcajb.apps.googleusercontent.com";

export default function LoginClient({ lang, dict }: { lang: Locale; dict: any }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // FORGOT PASSWORD MODAL STATE
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState<"email" | "otp_verify">("email");
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [forgotShowPassword, setForgotShowPassword] = useState(true);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState("");

  const handleGoogleCallback = useCallback(async (response: any) => {
    if (!response.credential) return;
    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: response.credential })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        if (data.token) {
          localStorage.setItem("user_token", data.token);
        }
        if (data.user) {
          localStorage.setItem("user_session", JSON.stringify(data.user));
          window.dispatchEvent(new Event("user_session_change"));
        }
        setSuccessMessage(lang === "ar" ? "تم تسجيل الدخول بحساب Google بنجاح! جاري التوجيه..." : "Google login successful! Redirecting...");
        setTimeout(() => {
          window.location.href = `/${lang}`;
        }, 1000);
      } else {
        setErrorMessage(data.error || (lang === "ar" ? "فشل تسجيل الدخول بحساب Google" : "Google Sign-In failed"));
      }
    } catch {
      setErrorMessage(lang === "ar" ? "تعذر الاتصال بالسيرفر! يرجى المحاولة لاحقاً." : "Network error! Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [lang]);

  const initGoogleAuth = useCallback(() => {
    if (typeof window !== "undefined" && (window as any).google?.accounts?.id) {
      (window as any).google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleCallback,
        auto_select: false,
      });
      // Render native button or prompt
      const btnContainer = document.getElementById("googleSignInBtnCustom");
      if (btnContainer) {
        (window as any).google.accounts.id.renderButton(btnContainer, {
          theme: "outline",
          size: "large",
          width: 360,
          text: "continue_with",
          shape: "pill",
          locale: lang === "ar" ? "ar" : "en",
        });
      }
    }
  }, [handleGoogleCallback, lang]);

  useEffect(() => {
    initGoogleAuth();
  }, [initGoogleAuth]);

  // Login Submit Handler
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!email.trim()) {
      setErrorMessage(lang === "ar" ? "الرجاء إدخال اسم المستخدم أو البريد الإلكتروني!" : "Please enter your email or username!");
      return;
    }
    if (!password) {
      setErrorMessage(lang === "ar" ? "الرجاء إدخال كلمة المرور!" : "Please enter your password!");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        if (data.token) {
          localStorage.setItem("user_token", data.token);
        }
        if (data.user) {
          localStorage.setItem("user_session", JSON.stringify(data.user));
          window.dispatchEvent(new Event("user_session_change"));
        }
        setSuccessMessage(lang === "ar" ? "تم تسجيل الدخول بنجاح! جاري التوجيه..." : "Login successful! Redirecting...");
        setTimeout(() => {
          window.location.href = `/${lang}`;
        }, 1000);
      } else {
        setErrorMessage(data.error || (lang === "ar" ? "بيانات الدخول غير صحيحة!" : "Invalid login credentials!"));
      }
    } catch {
      setErrorMessage(lang === "ar" ? "تعذر الاتصال بالسيرفر! يرجى المحاولة لاحقاً." : "Network error! Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Forgot Password - Step 1: Send OTP Email via Loops
  const handleForgotSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError("");
    setForgotSuccess("");

    if (!forgotEmail.trim() || !forgotEmail.includes("@")) {
      setForgotError(lang === "ar" ? "الرجاء إدخال بريد إلكتروني صحيح" : "Please enter a valid email");
      return;
    }

    setForgotLoading(true);

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail, type: "forgot_password" })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setForgotStep("otp_verify");
        setForgotSuccess(lang === "ar" ? `تم إرسال كود تفعيل كلمة المرور إلى: ${forgotEmail} عبر Loops` : `OTP sent to: ${forgotEmail}`);
      } else {
        setForgotError(data.error || "فشل إرسال كود التفعيل");
      }
    } catch {
      setForgotError("حدث خطأ أثناء الاتصال بالسيرفر");
    } finally {
      setForgotLoading(false);
    }
  };

  // Forgot Password - Step 2: Verify OTP & Save New Password
  const handleForgotResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError("");
    setForgotSuccess("");

    if (!forgotOtp.trim() || forgotOtp.trim().length < 4) {
      setForgotError(lang === "ar" ? "الرجاء إدخال كود OTP المكون من 6 أرقام" : "Please enter 6-digit OTP");
      return;
    }

    if (!forgotNewPassword.trim() || forgotNewPassword.trim().length < 4) {
      setForgotError(lang === "ar" ? "الرجاء إدخال كلمة المرور الجديدة" : "Please enter new password");
      return;
    }

    setForgotLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: forgotEmail,
          otp: forgotOtp.trim(),
          newPassword: forgotNewPassword.trim()
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setForgotSuccess(lang === "ar" ? "تم إعادة تعيين كلمة المرور بنجاح! جاري العودة لصفحة الدخول..." : "Password reset successfully!");
        setTimeout(() => {
          setForgotModalOpen(false);
          setForgotStep("email");
          setEmail(forgotEmail);
        }, 1500);
      } else {
        setForgotError(data.error || "فشل إعادة تعيين كلمة المرور");
      }
    } catch {
      setForgotError("حدث خطأ أثناء الاتصال بالسيرفر");
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-160px)] py-12">
      <div className="w-full max-w-md glass-card rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        {/* Background Decorative */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-secondary/20 rounded-full blur-3xl pointer-events-none"></div>
        
        {/* Header with Logo */}
        <div className="relative z-10 flex flex-col items-center mb-8">
          <Link href={`/${lang}`} className="relative group mb-4 flex items-center justify-center" aria-label="Home">
            <div className="absolute -inset-2 bg-gradient-to-r from-white/20 via-primary/30 to-white/20 rounded-full blur-xl opacity-80 group-hover:opacity-100 transition-all pointer-events-none"></div>
            <img 
              src={lang === "ar" ? "/images/logo_ar.png" : "/images/logo_en.png"} 
              alt="Logo" 
              className="relative z-10 h-12 sm:h-14 w-auto max-w-[260px] object-contain transition-transform group-hover:scale-105 drop-shadow-[0_0_15px_rgba(255,255,255,0.35)]" 
            />
          </Link>
          <h1 className="font-display-lg-mobile text-2xl font-bold text-on-surface">{dict.login.title}</h1>
          <p className="text-on-surface-variant text-sm mt-1">{dict.login.subtitle}</p>
        </div>

        {/* Quick Google Sign-In Button */}
        <div className="relative z-10 mb-5 flex flex-col gap-4">
          <Script 
            src="https://accounts.google.com/gsi/client" 
            strategy="afterInteractive" 
            onLoad={initGoogleAuth}
          />
          <div id="googleSignInBtnCustom" className="w-full flex justify-center min-h-[44px]"></div>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="w-full border-t border-outline-variant/20"></div>
            <span className="absolute px-3 bg-surface-container-high text-xs text-on-surface-variant font-medium rounded-full border border-outline-variant/20">{dict.login.or}</span>
          </div>
        </div>

        {/* Feedback Alert Banners */}
        {errorMessage && (
          <div className="relative z-10 mb-5 p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in slide-in-from-top-2 duration-200">
            <span className="material-symbols-outlined text-base shrink-0">error</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="relative z-10 mb-5 p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in slide-in-from-top-2 duration-200">
            <span className="material-symbols-outlined text-base shrink-0">check_circle</span>
            <span>{successMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLoginSubmit} className="relative z-10 flex flex-col gap-5" autoComplete="off">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-label-sm text-on-surface-variant uppercase tracking-wider">{dict.login.emailLabel}</label>
            <div className="relative">
              <span className={`absolute ${lang === 'ar' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant text-sm`}>person</span>
              <input 
                type="text" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={dict.login.emailPlaceholder}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                className={`w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg py-3 ${lang === 'ar' ? 'pr-10 pl-4' : 'pl-10 pr-4'} text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-on-surface-variant/50`}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
               <label className="text-sm font-label-sm text-on-surface-variant uppercase tracking-wider">{dict.login.passwordLabel}</label>
               <button 
                type="button" 
                onClick={() => {
                  setForgotModalOpen(true);
                  setForgotStep("email");
                  setForgotError("");
                  setForgotSuccess("");
                }}
                className="text-xs text-primary hover:underline font-bold transition-colors flex items-center gap-1"
               >
                 <span className="material-symbols-outlined text-xs">key</span>
                 <span>{dict.login.forgot || "نسيت كلمة المرور؟"}</span>
               </button>
            </div>
            <div className="relative">
              <span className={`absolute ${lang === 'ar' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant text-sm`}>lock</span>
              <input 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={dict.login.passwordPlaceholder}
                autoComplete="new-password"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                className={`w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg py-3 ${lang === 'ar' ? 'pr-10 pl-10' : 'pl-10 pr-10'} text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-on-surface-variant/50`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute ${lang === 'ar' ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors`}
                title={showPassword ? "إخفاء" : "إظهار"}
              >
                <span className="material-symbols-outlined text-lg">
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              <input type="checkbox" id="remember" className="w-4 h-4 rounded border-outline-variant/50 bg-surface-container-lowest text-primary focus:ring-primary/50 focus:ring-offset-background" />
              <label htmlFor="remember" className="text-sm text-on-surface-variant cursor-pointer">{dict.login.remember}</label>
            </div>

            <button 
              type="button" 
              onClick={() => {
                setForgotModalOpen(true);
                setForgotStep("email");
                setForgotError("");
                setForgotSuccess("");
              }}
              className="text-xs text-primary hover:underline font-bold transition-all flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-xs">lock_reset</span>
              <span>{lang === "ar" ? "نسيت كلمة المرور؟" : "Forgot Password?"}</span>
            </button>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full mt-4 bg-primary-container text-on-primary-container py-3.5 rounded-lg font-bold uppercase tracking-wider hover:bg-primary transition-all glow-primary shadow-[0_0_15px_rgba(45,212,191,0.2)] active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                <span>{lang === "ar" ? "جاري الدخول..." : "Logging in..."}</span>
              </>
            ) : (
              <span>{dict.login.signIn}</span>
            )}
          </button>
        </form>

        <div className="relative z-10 mt-8 text-center text-sm text-on-surface-variant">
          {dict.login.noAccount} <Link href={`/${lang}/register`} className="text-primary hover:text-primary-container font-semibold transition-colors">{dict.login.registerNow}</Link>
        </div>
      </div>

      {/* FORGOT PASSWORD MODAL WITH LOOPS OTP */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div className="glass-card w-full max-w-md rounded-2xl p-6 border border-primary/30 shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-outline-variant/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl">lock_reset</span>
                </div>
                <div>
                  <h3 className="font-bold text-on-surface text-base">استعادة كلمة المرور</h3>
                  <p className="text-xs text-on-surface-variant">إرسال كود تفعيل OTP عبر Loops إلى بريدك الإلكتروني</p>
                </div>
              </div>
              <button 
                onClick={() => setForgotModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-surface-container-high text-on-surface-variant transition-colors"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {forgotError && (
              <div className="mt-4 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-semibold flex items-center gap-2">
                <span className="material-symbols-outlined text-base">error</span>
                <span>{forgotError}</span>
              </div>
            )}

            {forgotSuccess && (
              <div className="mt-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
                <span className="material-symbols-outlined text-base">check_circle</span>
                <span>{forgotSuccess}</span>
              </div>
            )}

            {forgotStep === "email" ? (
              <form onSubmit={handleForgotSendOtp} className="py-5 space-y-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">البريد الإلكتروني المسجل (Gmail)</label>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="customer@gmail.com"
                    autoComplete="off"
                    className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl py-3 px-4 text-xs text-on-surface focus:outline-none focus:border-primary font-mono"
                    autoFocus
                  />
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="submit"
                    disabled={forgotLoading || !forgotEmail.trim()}
                    className="flex-1 py-3 rounded-xl bg-primary text-on-primary font-bold text-xs hover:bg-primary-container transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {forgotLoading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                        <span>جاري إرسال OTP عبر Loops...</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-base">mark_email_unread</span>
                        <span>إرسال كود التحقق إلى الإيميل</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setForgotModalOpen(false)}
                    className="px-4 py-3 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-bold text-xs"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleForgotResetPassword} className="py-5 space-y-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider text-center">أدخل كود OTP (6 أرقام) من الإيميل</label>
                  <input
                    type="text"
                    value={forgotOtp}
                    onChange={(e) => setForgotOtp(e.target.value)}
                    maxLength={6}
                    placeholder="1 2 3 4 5 6"
                    className="w-full bg-surface-container-lowest border-2 border-primary/50 rounded-xl py-3 px-4 text-center text-xl font-bold tracking-[0.4em] text-primary focus:outline-none focus:border-primary font-mono"
                    autoFocus
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">كلمة المرور الجديدة</label>
                  <div className="relative">
                    <input
                      type={forgotShowPassword ? "text" : "password"}
                      value={forgotNewPassword}
                      onChange={(e) => setForgotNewPassword(e.target.value)}
                      placeholder="********"
                      className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl py-3 pr-4 pl-10 text-xs text-on-surface focus:outline-none focus:border-primary font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setForgotShowPassword(!forgotShowPassword)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors"
                    >
                      <span className="material-symbols-outlined text-lg">
                        {forgotShowPassword ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="submit"
                    disabled={forgotLoading || !forgotOtp.trim() || !forgotNewPassword.trim()}
                    className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {forgotLoading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                        <span>جاري الحفظ...</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-base">verified</span>
                        <span>تأكيد وتغيير كلمة المرور</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setForgotStep("email")}
                    className="px-4 py-3 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-bold text-xs"
                  >
                    رجوع
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
