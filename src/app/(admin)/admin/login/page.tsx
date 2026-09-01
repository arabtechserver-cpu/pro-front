"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginAdmin } from "./actions";
import CloudflareTurnstile from "@/components/CloudflareTurnstile";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await loginAdmin(username, password);
      if (result.success) {
        router.push("/admin");
      } else {
        setError(result.message || "Invalid credentials");
      }
    } catch (err) {
      setError("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-4">
      <div className="glass-card max-w-md w-full p-8 rounded-3xl border border-outline-variant/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-bl-full blur-2xl"></div>
        
        <div className="text-center mb-8 relative z-10">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-primary/20 shadow-[0_0_15px_rgba(45,212,191,0.2)]">
            <span className="material-symbols-outlined text-3xl text-primary glow-cyan">shield_person</span>
          </div>
          <h1 className="text-3xl font-display font-bold text-on-surface mb-2">لوحة الإدارة</h1>
          <p className="text-on-surface-variant">قم بتسجيل الدخول للوصول إلى التحكم</p>
        </div>

        {error && (
          <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-xl mb-6 text-sm relative z-10 text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5 relative z-10" dir="rtl">
          <div>
            <label className="block text-sm font-medium text-on-surface-variant mb-2">اسم المستخدم</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              className="w-full px-4 py-3 bg-surface-container border border-outline-variant/50 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none text-on-surface transition-all text-right"
              required
              placeholder="أدخل اسم المستخدم"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-on-surface-variant mb-2">كلمة المرور</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="w-full pl-12 pr-4 py-3 bg-surface-container border border-outline-variant/50 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none text-on-surface transition-all text-right"
                required
                placeholder="أدخل كلمة المرور"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center p-2"
                title={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
          </div>
          
          <CloudflareTurnstile onVerify={(token) => setTurnstileToken(token)} />

          <button 
            type="submit" 
            disabled={loading}
            className="w-full btn-primary py-3 rounded-xl flex items-center justify-center gap-2 mt-8 text-lg font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all hover:-translate-y-1"
          >
            {loading ? (
              <span className="w-6 h-6 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                تسجيل الدخول <span className="material-symbols-outlined">login</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
