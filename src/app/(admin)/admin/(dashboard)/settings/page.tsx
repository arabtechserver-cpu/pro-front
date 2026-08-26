"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAdminProfile, updateAdminCredentials } from "./actions";

export default function AdminSettingsPage() {
  const router = useRouter();
  
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function fetchUser() {
      try {
        const user = await getAdminProfile();
        if (user) {
          setUsername(user.username || "");
          setEmail(user.email || "");
          setIsPageLoading(false);
          return;
        }

        // Fallback client-side fetch
        const clientRes = await fetch("/api/users/profile");
        if (clientRes.ok) {
          const data = await clientRes.json();
          if (data.success && data.user) {
            setUsername(data.user.username || "");
            setEmail(data.user.email || "");
            setIsPageLoading(false);
            return;
          }
        }
      } catch (err) {
        console.error("Error loading admin settings profile:", err);
      }
      
      // Fallback default admin values if logged in
      setUsername("admin");
      setEmail("admin@admin.com");
      setIsPageLoading(false);
    }
    fetchUser();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!currentPassword) {
      setError("الرجاء إدخال كلمة المرور الحالية لتأكيد التعديلات");
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setError("كلمة المرور الجديدة وتأكيد كلمة المرور غير متطابقين");
      return;
    }

    if (newPassword && newPassword.length < 4) {
      setError("كلمة المرور الجديدة يجب أن لا تقل عن 4 أحرف");
      return;
    }

    setIsLoading(true);

    try {
      const data = await updateAdminCredentials({
        username: username.trim(),
        email: email.trim(),
        newPassword: newPassword ? newPassword : undefined,
        currentPassword
      });

      if (!data.success) {
        setError(data.error || "حدث خطأ غير متوقع");
      } else {
        setSuccess("تم تحديث بيانات حسابك بنجاح!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err: any) {
      setError("تعذر الاتصال بالسيرفر");
    } finally {
      setIsLoading(false);
    }
  };

  if (isPageLoading) return <div className="p-8 text-center">جاري التحميل...</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
          <span className="material-symbols-outlined text-2xl">manage_accounts</span>
        </div>
        <div>
          <h1 className="text-3xl font-display font-bold text-on-surface">إعدادات الحساب</h1>
          <p className="text-on-surface-variant mt-1">تحديث اسم المستخدم وكلمة المرور للوحة الإدارة وبوت تليجرام</p>
        </div>
      </div>

      <div className="bg-surface-container rounded-3xl border border-outline-variant/30 p-8">
        {error && (
          <div className="bg-error/10 text-error p-4 rounded-2xl mb-6 flex items-center gap-3">
            <span className="material-symbols-outlined">error</span>
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-500/10 text-green-600 p-4 rounded-2xl mb-6 flex items-center gap-3">
            <span className="material-symbols-outlined">check_circle</span>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-on-surface mb-2">اسم المستخدم (Username)</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-surface px-4 py-3 rounded-2xl border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                dir="ltr"
              />
              <p className="text-xs text-on-surface-variant mt-2">يستخدم لتسجيل الدخول في الموقع وبوت تليجرام</p>
            </div>

            <div>
              <label className="block text-sm font-bold text-on-surface mb-2">البريد الإلكتروني</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-surface px-4 py-3 rounded-2xl border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                dir="ltr"
              />
            </div>
          </div>

          <hr className="border-outline-variant/30 my-8" />

          <div>
            <h2 className="text-xl font-bold text-on-surface mb-4">تغيير كلمة المرور</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-on-surface mb-2">كلمة المرور الجديدة</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="اتركها فارغة إذا لم ترد التغيير"
                  className="w-full bg-surface px-4 py-3 rounded-2xl border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  dir="ltr"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-on-surface mb-2">تأكيد كلمة المرور الجديدة</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="أعد كتابة كلمة المرور الجديدة"
                  className="w-full bg-surface px-4 py-3 rounded-2xl border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  dir="ltr"
                />
              </div>
            </div>
          </div>

          <div className="bg-surface-variant/30 p-6 rounded-2xl mt-8">
            <label className="block text-sm font-bold text-error mb-2">تأكيد التعديلات بكلمة المرور الحالية *</label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="اكتب كلمة مرورك الحالية هنا"
              className="w-full bg-surface px-4 py-3 rounded-2xl border border-error/50 focus:border-error focus:ring-1 focus:ring-error outline-none transition-all"
              dir="ltr"
            />
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="px-8 py-3 bg-primary text-on-primary font-bold rounded-2xl hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {isLoading ? "جاري الحفظ..." : "حفظ التعديلات"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
