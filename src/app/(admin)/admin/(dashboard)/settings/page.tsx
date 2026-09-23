"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAdminProfile, updateAdminCredentials } from "./actions";
import { isServerActionMismatchError } from "@/lib/server-action-utils";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

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

  // Telegram admin IDs
  const [telegramIds, setTelegramIds] = useState<string[]>([]);
  const [newTelegramId, setNewTelegramId] = useState("");
  const [telegramLoading, setTelegramLoading] = useState(false);
  const [telegramSuccess, setTelegramSuccess] = useState("");
  const [telegramError, setTelegramError] = useState("");

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
      setUsername("admin");
      setEmail("admin@admin.com");
      setIsPageLoading(false);
    }

    async function fetchTelegramIds() {
      try {
        const res = await fetch(`${API_BASE}/api/settings/telegram-admins`, { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setTelegramIds(data.chatIds || []);
        }
      } catch {}
    }

    fetchUser();
    fetchTelegramIds();
  }, [router]);

  const handleAddTelegramId = () => {
    const id = newTelegramId.trim();
    if (!id || !/^\d+$/.test(id)) {
      setTelegramError("الرجاء إدخال Chat ID رقمي صحيح");
      return;
    }
    if (telegramIds.includes(id)) {
      setTelegramError("هذا الـ Chat ID مضاف بالفعل");
      return;
    }
    setTelegramIds(prev => [...prev, id]);
    setNewTelegramId("");
    setTelegramError("");
  };

  const handleRemoveTelegramId = (id: string) => {
    setTelegramIds(prev => prev.filter(x => x !== id));
  };

  const handleSaveTelegramIds = async () => {
    setTelegramLoading(true);
    setTelegramSuccess("");
    setTelegramError("");
    try {
      const res = await fetch(`${API_BASE}/api/settings/telegram-admins`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ chatIds: telegramIds })
      });
      const data = await res.json();
      if (data.success) {
        setTelegramIds(data.chatIds);
        setTelegramSuccess("تم حفظ معرفات تليجرام بنجاح!");
        setTimeout(() => setTelegramSuccess(""), 3000);
      } else {
        setTelegramError(data.error || "حدث خطأ");
      }
    } catch {
      setTelegramError("تعذر الاتصال بالسيرفر");
    } finally {
      setTelegramLoading(false);
    }
  };


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
      if (isServerActionMismatchError(err)) {
        window.location.reload();
        return;
      }
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
          <div className="bg-violet-500/10 text-violet-600 p-4 rounded-2xl mb-6 flex items-center gap-3">
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

      {/* Telegram Admin IDs Section */}
      <div className="bg-surface-container rounded-3xl border border-outline-variant/30 p-8 mt-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-600">
            <span className="material-symbols-outlined text-xl">send</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-on-surface">معرفات مشرفي تليجرام</h2>
            <p className="text-sm text-on-surface-variant mt-0.5">الحسابات التي تستقبل إشعارات الإيداعات والطلبات عبر البوت</p>
          </div>
        </div>

        {telegramError && (
          <div className="bg-error/10 text-error p-3 rounded-2xl mb-4 flex items-center gap-2 text-sm">
            <span className="material-symbols-outlined text-base">error</span>
            {telegramError}
          </div>
        )}
        {telegramSuccess && (
          <div className="bg-green-500/10 text-green-600 p-3 rounded-2xl mb-4 flex items-center gap-2 text-sm">
            <span className="material-symbols-outlined text-base">check_circle</span>
            {telegramSuccess}
          </div>
        )}

        {/* Current IDs list */}
        <div className="space-y-2 mb-6">
          {telegramIds.length === 0 ? (
            <p className="text-on-surface-variant text-sm text-center py-4">لا يوجد معرفات محفوظة. أضف Chat ID من تليجرام.</p>
          ) : (
            telegramIds.map(id => (
              <div key={id} className="flex items-center justify-between bg-surface px-4 py-3 rounded-2xl border border-outline-variant/30">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-blue-500 text-xl">person</span>
                  <code className="font-mono text-on-surface font-bold">{id}</code>
                </div>
                <button
                  onClick={() => handleRemoveTelegramId(id)}
                  className="text-error hover:bg-error/10 p-2 rounded-xl transition-colors"
                  title="حذف"
                >
                  <span className="material-symbols-outlined text-xl">delete</span>
                </button>
              </div>
            ))
          )}
        </div>

        {/* Add new ID */}
        <div className="flex gap-3">
          <input
            type="text"
            value={newTelegramId}
            onChange={(e) => setNewTelegramId(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddTelegramId()}
            placeholder="أدخل Telegram Chat ID (مثال: 7053196033)"
            className="flex-1 bg-surface px-4 py-3 rounded-2xl border border-outline-variant/50 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all font-mono"
            dir="ltr"
          />
          <button
            onClick={handleAddTelegramId}
            className="px-5 py-3 bg-blue-500/10 text-blue-600 font-bold rounded-2xl hover:bg-blue-500/20 transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined">add</span>
            إضافة
          </button>
        </div>

        <div className="bg-surface-variant/30 p-4 rounded-2xl mt-4 flex items-start gap-2">
          <span className="material-symbols-outlined text-amber-500 text-base mt-0.5">info</span>
          <p className="text-xs text-on-surface-variant">
            للحصول على Chat ID الخاص بك، أرسل رسالة لـ <a href="https://t.me/userinfobot" target="_blank" rel="noreferrer" className="text-blue-500 underline">@userinfobot</a> على تليجرام وسيعطيك رقمك.
          </p>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={handleSaveTelegramIds}
            disabled={telegramLoading}
            className="px-8 py-3 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-xl">save</span>
            {telegramLoading ? "جاري الحفظ..." : "حفظ معرفات تليجرام"}
          </button>
        </div>
      </div>
    </div>
  );
}
