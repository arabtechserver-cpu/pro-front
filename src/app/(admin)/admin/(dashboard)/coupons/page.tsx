"use client";

import { useState, useEffect } from "react";

interface Coupon {
  id: string;
  code: string;
  discountPercent: number;
  durationDays: number | null;
  expiresAt: string;
  maxUses: number;
  usedCount: number;
  isActive: boolean;
  isExpired?: boolean;
  isMaxedOut?: boolean;
  daysRemaining?: number;
  usagesCount?: number;
  createdAt: string;
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form states
  const [code, setCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState("10");
  const [durationDays, setDurationDays] = useState("30");
  const [maxUses, setMaxUses] = useState("50");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/coupons");
      const data = await res.json();
      if (res.ok && data.success) {
        setCoupons(data.coupons || []);
      }
    } catch (err) {
      console.error("Failed to load coupons:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleGenerateRandomCode = () => {
    const prefixes = ["PROMO", "DISCOUNT", "VIP", "OFFER", "ARABTECH", "SAVE"];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const num = Math.floor(10 + Math.random() * 90);
    setCode(`${prefix}${num}`);
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code.trim(),
          discountPercent: parseFloat(discountPercent),
          durationDays: parseInt(durationDays, 10),
          maxUses: parseInt(maxUses, 10),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setFeedback({ type: "success", text: data.message || "تم إنشاء كود الخصم بنجاح!" });
        setCode("");
        fetchCoupons();
      } else {
        setFeedback({ type: "error", text: data.error || "فشل إنشاء كود الخصم" });
      }
    } catch {
      setFeedback({ type: "error", text: "حدث خطأ في الاتصال بالخادم" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (id: string) => {
    try {
      const res = await fetch(`/api/coupons/${id}/toggle`, { method: "PATCH" });
      const data = await res.json();
      if (res.ok && data.success) {
        setCoupons((prev) =>
          prev.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c))
        );
      }
    } catch (err) {
      console.error("Toggle error:", err);
    }
  };

  const handleDelete = async (id: string, couponCode: string) => {
    if (!confirm(`هل أنت متأكد من حذف كود الخصم (${couponCode}) نهائياً؟`)) return;

    try {
      const res = await fetch(`/api/coupons/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok && data.success) {
        setCoupons((prev) => prev.filter((c) => c.id !== id));
        setFeedback({ type: "success", text: `تم حذف كود الخصم (${couponCode}) بنجاح.` });
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const handleCopy = (codeStr: string, id: string) => {
    navigator.clipboard.writeText(codeStr);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filtered list
  const filtered = coupons.filter(
    (c) =>
      c.code.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      String(c.discountPercent).includes(searchQuery.trim())
  );

  const totalCoupons = coupons.length;
  const activeCoupons = coupons.filter((c) => c.isActive && !c.isExpired && !c.isMaxedOut).length;
  const totalUsages = coupons.reduce((acc, c) => acc + (c.usedCount || 0), 0);
  const expiredCoupons = coupons.filter((c) => c.isExpired || c.isMaxedOut).length;

  return (
    <div className="space-y-8 font-sans" dir="rtl">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 glass-card p-6 md:p-8 rounded-3xl border border-outline-variant/30 shadow-xl bg-surface-container/40">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="material-symbols-outlined text-3xl text-primary glow-cyan">confirmation_number</span>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-on-surface">
              إدارة أكواد الخصم والكوبونات
            </h1>
          </div>
          <p className="text-on-surface-variant text-xs md:text-sm max-w-2xl leading-relaxed">
            أنشئ كوبونات خصم للمستخدمين بنسب مئوية محددة، وحدد مدة انتهاء الصلاحية بالأيام والحد الأقصى لعدد المستخدمين، وتتبع استخدامها لحظياً.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchCoupons}
            className="px-5 py-2.5 rounded-2xl bg-surface-container-high border border-outline-variant/30 hover:border-primary/50 text-xs font-bold text-on-surface flex items-center gap-2 transition-all shadow-sm cursor-pointer"
          >
            <span className={`material-symbols-outlined text-base text-primary ${loading ? "animate-spin" : ""}`}>
              refresh
            </span>
            <span>تحديث البيانات</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-outline-variant/30 shadow-lg space-y-1">
          <p className="text-xs font-bold text-on-surface-variant">إجمالي الكوبونات</p>
          <h3 className="text-2xl font-bold font-mono text-on-surface">{totalCoupons}</h3>
          <p className="text-[11px] text-on-surface-variant">كود مسجل بالداتابيز</p>
        </div>
        <div className="glass-card p-5 rounded-2xl border border-emerald-500/20 shadow-lg space-y-1 bg-emerald-500/5">
          <p className="text-xs font-bold text-emerald-400">الكوبونات النشطة</p>
          <h3 className="text-2xl font-bold font-mono text-emerald-400">{activeCoupons}</h3>
          <p className="text-[11px] text-emerald-300/80">صالحة للاستخدام الآن</p>
        </div>
        <div className="glass-card p-5 rounded-2xl border border-primary/20 shadow-lg space-y-1 bg-primary/5">
          <p className="text-xs font-bold text-primary">إجمالي مرات الاستخدام</p>
          <h3 className="text-2xl font-bold font-mono text-primary">{totalUsages}</h3>
          <p className="text-[11px] text-primary/80">عملية شراء تم تخفيضها</p>
        </div>
        <div className="glass-card p-5 rounded-2xl border border-amber-500/20 shadow-lg space-y-1 bg-amber-500/5">
          <p className="text-xs font-bold text-amber-400">الكوبونات المنتهية</p>
          <h3 className="text-2xl font-bold font-mono text-amber-400">{expiredCoupons}</h3>
          <p className="text-[11px] text-amber-300/80">انتهت مدتها أو اكتملت</p>
        </div>
      </div>

      {/* Creation Form & Live Feedback */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-outline-variant/30 shadow-2xl space-y-6">
        <div className="border-b border-outline-variant/20 pb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">add_circle</span>
            <span>إنشاء كود خصم جديد</span>
          </h2>
          <span className="text-xs text-on-surface-variant">يتم الحفظ في قاعدة البيانات فورياً</span>
        </div>

        {feedback && (
          <div
            className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2 ${
              feedback.type === "success"
                ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-300"
                : "bg-red-500/15 border border-red-500/30 text-red-300"
            }`}
          >
            <span className="material-symbols-outlined text-base">
              {feedback.type === "success" ? "check_circle" : "error"}
            </span>
            <span>{feedback.text}</span>
          </div>
        )}

        <form onSubmit={handleCreateCoupon} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Coupon Code Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-on-surface-variant">رمز الكود (Code) *</label>
                <button
                  type="button"
                  onClick={handleGenerateRandomCode}
                  className="text-[11px] text-primary hover:text-primary-container font-bold transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-xs">autorenew</span>
                  <span>توليد تلقائي</span>
                </button>
              </div>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="مثال: SAVE20 أو VIP15"
                className="w-full bg-surface-container-lowest border border-outline-variant/40 rounded-xl py-3 px-4 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all font-mono font-bold text-sm tracking-wider uppercase dir-ltr"
              />
            </div>

            {/* Discount Percentage */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-on-surface-variant">نسبة الخصم % *</label>
              <div className="relative">
                <input
                  type="number"
                  required
                  min={1}
                  max={100}
                  step={0.5}
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(e.target.value)}
                  placeholder="10"
                  className="w-full bg-surface-container-lowest border border-outline-variant/40 rounded-xl py-3 px-4 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all font-mono font-bold text-sm dir-ltr"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary font-bold font-mono text-sm">%</span>
              </div>
            </div>

            {/* Duration in Days */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-on-surface-variant">مدة الانتهاء (بالأيام) *</label>
              <div className="relative">
                <input
                  type="number"
                  required
                  min={1}
                  max={3650}
                  value={durationDays}
                  onChange={(e) => setDurationDays(e.target.value)}
                  placeholder="30"
                  className="w-full bg-surface-container-lowest border border-outline-variant/40 rounded-xl py-3 px-4 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all font-mono font-bold text-sm dir-ltr"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-xs font-semibold">يوم</span>
              </div>
            </div>

            {/* Max Usage Limit */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-on-surface-variant">كام واحد يستخدم الكود (الحد الأقصى) *</label>
              <div className="relative">
                <input
                  type="number"
                  required
                  min={1}
                  max={100000}
                  value={maxUses}
                  onChange={(e) => setMaxUses(e.target.value)}
                  placeholder="50"
                  className="w-full bg-surface-container-lowest border border-outline-variant/40 rounded-xl py-3 px-4 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all font-mono font-bold text-sm dir-ltr"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-xs font-semibold">مستخدم</span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || !code.trim()}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-primary to-secondary text-on-primary font-bold text-sm hover:shadow-[0_0_25px_rgba(45,212,191,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
          >
            {submitting ? (
              <>
                <span className="w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></span>
                <span>جاري حفظ الكود في قاعدة البيانات...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-lg">save</span>
                <span>حفظ وتفعيل كود الخصم</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Coupons Table & List */}
      <div className="glass-card rounded-3xl border border-outline-variant/30 overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-outline-variant/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">table_chart</span>
              <span>سجل أكواد الخصم النشطة والسابقة ({coupons.length})</span>
            </h2>
            <p className="text-xs text-on-surface-variant mt-0.5">
              متابعة الأيام المتبقية ونسبة الاستخدام وحالات الأكواد مع إمكانية التفعيل والتعطيل والحذف
            </p>
          </div>

          {/* Search Box */}
          <div className="w-full sm:w-64 relative">
            <span className="material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث عن كود أو نسبة..."
              className="w-full bg-surface-container-high border border-outline-variant/30 rounded-xl pr-9 pl-4 py-2 text-xs text-on-surface focus:outline-none focus:border-primary transition-all"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-3 text-on-surface-variant">
            <span className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></span>
            <span className="text-xs">جاري تحميل أكواد الخصم...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center text-on-surface-variant space-y-2">
            <span className="material-symbols-outlined text-4xl text-primary/40">confirmation_number</span>
            <p className="text-sm font-semibold">لا توجد أكواد خصم تطابق البحث حالياً.</p>
            <p className="text-xs">استخدم النموذج أعلاه لإنشاء كود خصم جديد لعملائك.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse text-xs">
              <thead>
                <tr className="border-b border-outline-variant/20 bg-surface-container-high/60 text-on-surface-variant font-bold">
                  <th className="p-4">رمز كود الخصم</th>
                  <th className="p-4 text-center">نسبة الخصم</th>
                  <th className="p-4 text-center">مدة الانتهاء والصلاحية</th>
                  <th className="p-4 text-center">مرات الاستخدام</th>
                  <th className="p-4 text-center">الحالة</th>
                  <th className="p-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/15">
                {filtered.map((c) => {
                  const percentUsed = Math.min(100, Math.round((c.usedCount / c.maxUses) * 100));
                  const isFinished = c.isExpired || c.isMaxedOut;

                  return (
                    <tr key={c.id} className="hover:bg-surface-container-high/30 transition-colors">
                      {/* Code */}
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-sm tracking-wider px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/30 text-primary">
                            {c.code}
                          </span>
                          <button
                            onClick={() => handleCopy(c.code, c.id)}
                            title="نسخ الكود"
                            className="w-7 h-7 rounded-lg bg-surface-container-highest hover:bg-primary/20 hover:text-primary flex items-center justify-center transition-all cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-sm">
                              {copiedId === c.id ? "check" : "content_copy"}
                            </span>
                          </button>
                        </div>
                      </td>

                      {/* Discount % */}
                      <td className="p-4 text-center font-mono font-bold text-sm text-emerald-400">
                        {c.discountPercent}% OFF
                      </td>

                      {/* Expiration */}
                      <td className="p-4 text-center">
                        <div className="space-y-0.5">
                          <div className="font-mono text-xs font-semibold text-on-surface">
                            {c.isExpired ? (
                              <span className="text-red-400 font-bold">منتهي الصلاحية ⛔</span>
                            ) : (
                              <span className="text-sky-300 font-bold">
                                متبقي {c.daysRemaining} {c.daysRemaining === 1 ? "يوم" : "أيام"} ⏳
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-on-surface-variant font-mono">
                            ينتهي: {new Date(c.expiresAt).toLocaleDateString("ar-EG")}
                          </p>
                        </div>
                      </td>

                      {/* Usage progress */}
                      <td className="p-4 text-center">
                        <div className="max-w-[140px] mx-auto space-y-1">
                          <div className="flex items-center justify-between text-[11px] font-mono font-bold">
                            <span className="text-primary">{c.usedCount}</span>
                            <span className="text-on-surface-variant">من {c.maxUses}</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-surface-container-highest overflow-hidden">
                            <div
                              className={`h-full transition-all ${
                                c.isMaxedOut
                                  ? "bg-red-400"
                                  : percentUsed > 80
                                  ? "bg-amber-400"
                                  : "bg-primary"
                              }`}
                              style={{ width: `${percentUsed}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="p-4 text-center">
                        {c.isMaxedOut ? (
                          <span className="px-2.5 py-1 rounded-full bg-red-500/15 text-red-400 border border-red-500/30 text-[11px] font-bold inline-flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                            <span>اكتمل الحد الأقصى</span>
                          </span>
                        ) : c.isExpired ? (
                          <span className="px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[11px] font-bold inline-flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                            <span>منتهي المدة</span>
                          </span>
                        ) : c.isActive ? (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold inline-flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                            <span>نشط وشغال</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-surface-container-highest text-on-surface-variant border border-outline-variant/30 text-[11px] font-bold inline-flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                            <span>معطّل</span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleToggle(c.id)}
                            title={c.isActive ? "تعطيل الكود" : "تفعيل الكود"}
                            className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 border ${
                              c.isActive
                                ? "bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20"
                                : "bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20"
                            }`}
                          >
                            <span className="material-symbols-outlined text-xs">
                              {c.isActive ? "pause" : "play_arrow"}
                            </span>
                            <span>{c.isActive ? "تعطيل" : "تفعيل"}</span>
                          </button>

                          <button
                            onClick={() => handleDelete(c.id, c.code)}
                            title="حذف الكود"
                            className="p-1.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-all cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-sm">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
