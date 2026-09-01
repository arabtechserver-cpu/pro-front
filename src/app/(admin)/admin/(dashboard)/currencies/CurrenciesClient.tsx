"use client";

import { useState, useEffect } from "react";

interface CurrencyConfig {
  usdToSdg: number;
  usdToEgp: number;
  usdToSar: number;
  usdToAed: number;
  bankak: {
    accountNumber: string;
    accountName: string;
    instructionsAr: string;
    instructionsEn: string;
    isActive: boolean;
  };
  vodafone: {
    walletNumber: string;
    instructionsAr: string;
    instructionsEn: string;
    isActive: boolean;
  };
  binance: {
    payId: string;
    instructionsAr: string;
    instructionsEn: string;
    isActive: boolean;
  };
  cryptoBnb: {
    address: string;
    network: string;
    instructionsAr: string;
    instructionsEn: string;
    isActive: boolean;
  };
  paypal: {
    email: string;
    isActive: boolean;
  };
  updatedAt?: string;
}

export default function CurrenciesClient() {
  const [config, setConfig] = useState<CurrencyConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Test Calculator State
  const [testUsdAmount, setTestUsdAmount] = useState<number>(10);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchCurrencies = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/currencies", {
        headers: { "Cache-Control": "no-cache" }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setConfig(data.config);
      } else {
        showToast("فشل استرداد إعدادات العملات", "error");
      }
    } catch {
      showToast("تعذر الاتصال بالسيرفر", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrencies();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config) return;

    setIsSaving(true);
    try {
      const res = await fetch("/api/currencies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message || "تم حفظ أسعار الصرف وبيانات الحسابات بنجاح!");
        setConfig(data.config);
      } else {
        showToast(data.error || "فشل حفظ التعديلات", "error");
      }
    } catch {
      showToast("تعذر الاتصال بالسيرفر لحفظ البيانات", "error");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || !config) {
    return (
      <div className="flex flex-col items-center justify-center p-24 gap-3 text-on-surface-variant" dir="rtl">
        <span className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></span>
        <span className="text-xs font-medium">جاري تحميل إعدادات العملات وأسعار الصرف...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans max-w-5xl mx-auto" dir="rtl">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-8 left-8 z-50 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 text-white font-bold ${
            toastMessage.type === "success" ? "bg-emerald-600 border border-emerald-400/40" : "bg-red-600 border border-red-400/40"
          }`}
        >
          <span className="material-symbols-outlined text-2xl">
            {toastMessage.type === "success" ? "check_circle" : "error"}
          </span>
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-6 rounded-3xl border border-outline-variant/30 shadow-xl">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-on-surface flex items-center gap-2.5">
            <span className="material-symbols-outlined text-primary text-3xl">currency_exchange</span>
            <span>إدارة أسعار صرف العملات والجنيه السوداني</span>
          </h1>
          <p className="text-on-surface-variant text-xs md:text-sm mt-1">
            التحكم في سعر صرف الجنيه السوداني والعملات مقابل الدولار وتعديل بيانات حسابات الدفع (بنكك وفودافون وباينانس).
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-primary to-secondary text-on-primary text-xs font-bold shadow-lg hover:shadow-primary/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 shrink-0"
        >
          {isSaving ? (
            <span className="material-symbols-outlined animate-spin text-sm">refresh</span>
          ) : (
            <span className="material-symbols-outlined text-sm">save</span>
          )}
          <span>حفظ التعديلات للكل</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* PRIMARY SPOTLIGHT: SUDANESE POUND & BANK OF KHARTOUM */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-primary/40 shadow-2xl bg-gradient-to-br from-primary/5 via-surface-container/50 to-surface-container/30 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-outline-variant/20 flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-primary/20 text-primary flex items-center justify-center text-2xl font-bold">
                🇸🇩
              </div>
              <div>
                <h3 className="text-lg font-bold text-on-surface font-display flex items-center gap-2">
                  <span>سعر صرف الجنيه السوداني (SDG) وحساب بنكك</span>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-primary/20 text-primary font-mono font-bold">
                    العملة الأساسية للتحويل
                  </span>
                </h3>
                <p className="text-xs text-on-surface-variant">
                  يتم احتساب هذا السعر تلقائياً للعملاء عند شحن المحفظة وعرض الرصيد بالجنيه السوداني.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2 rounded-xl bg-surface-container-lowest border border-outline-variant/20">
              <input
                id="bankakActiveToggle"
                type="checkbox"
                checked={config.bankak.isActive}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    bankak: { ...config.bankak, isActive: e.target.checked }
                  })
                }
                className="w-4 h-4 accent-primary cursor-pointer"
              />
              <label htmlFor="bankakActiveToggle" className="text-xs font-bold text-on-surface cursor-pointer select-none">
                تفعيل وسيلة الدفع بـ بنكك
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* SDG Rate Input */}
            <div className="md:col-span-1 p-5 rounded-2xl bg-surface-container-lowest border border-primary/30 space-y-2">
              <label className="block text-xs font-bold text-primary">
                سعر صرف 1 دولار بالجنيه السوداني (SDG):
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  step="1"
                  required
                  value={config.usdToSdg}
                  onChange={(e) => setConfig({ ...config, usdToSdg: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-3 bg-surface-container border border-primary/50 rounded-xl focus:border-primary outline-none text-xl font-bold font-mono text-primary text-left dir-ltr transition-all shadow-inner"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-on-surface-variant font-mono">
                  SDG / $1
                </span>
              </div>
              <p className="text-[11px] text-on-surface-variant leading-relaxed">
                مثال: إذا كان سعر الصرف 2,850 SDG، فإن إيداع $10 USD سيساوي 28,500 جنيه سوداني.
              </p>
            </div>

            {/* Bankak Account Number & Name */}
            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/20">
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1.5">
                  رقم حساب بنك الخرطوم (Bankak Account #):
                </label>
                <input
                  type="text"
                  required
                  value={config.bankak.accountNumber}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      bankak: { ...config.bankak, accountNumber: e.target.value }
                    })
                  }
                  placeholder="6302273"
                  className="w-full px-4 py-3 bg-surface-container border border-outline-variant/40 rounded-xl focus:border-primary outline-none font-mono text-sm font-bold text-on-surface text-left dir-ltr transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface mb-1.5">
                  اسم صاحب الحساب المستفيد (Account Name):
                </label>
                <input
                  type="text"
                  required
                  value={config.bankak.accountName}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      bankak: { ...config.bankak, accountName: e.target.value }
                    })
                  }
                  placeholder="حسن"
                  className="w-full px-4 py-3 bg-surface-container border border-outline-variant/40 rounded-xl focus:border-primary outline-none text-xs font-bold text-on-surface transition-all"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-on-surface mb-1.5">
                  تعليمات وتوجيهات التحويل عبر بنكك (تظهر للعميل):
                </label>
                <textarea
                  rows={2}
                  value={config.bankak.instructionsAr}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      bankak: { ...config.bankak, instructionsAr: e.target.value }
                    })
                  }
                  className="w-full px-4 py-2.5 bg-surface-container border border-outline-variant/40 rounded-xl focus:border-primary outline-none text-xs text-on-surface transition-all leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* Real-time Preview Calculator Widget */}
          <div className="p-4 rounded-2xl bg-surface-container-high/60 border border-primary/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-2xl">calculate</span>
              <div>
                <div className="font-bold text-xs text-on-surface">معاينة فورية لحاسبة التحويل للعميل:</div>
                <div className="text-[11px] text-on-surface-variant">اختبر كيف ستظهر العملة في محفظة العميل الآن</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-on-surface-variant">$</span>
                <input
                  type="number"
                  min="1"
                  value={testUsdAmount}
                  onChange={(e) => setTestUsdAmount(parseFloat(e.target.value) || 0)}
                  className="w-20 px-2 py-1.5 bg-surface-container-lowest border border-outline-variant/40 rounded-lg text-xs font-bold font-mono text-center text-on-surface"
                />
                <span className="text-xs font-bold text-on-surface-variant">USD =</span>
              </div>

              <div className="px-3.5 py-1.5 rounded-xl bg-primary/20 border border-primary/30 text-primary font-mono font-bold text-sm">
                {(testUsdAmount * config.usdToSdg).toLocaleString("en-US")} جنيه سوداني (SDG)
              </div>
            </div>
          </div>
        </div>

        {/* OTHER REGIONAL EXCHANGE RATES */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-outline-variant/30 space-y-6">
          <div className="flex items-center gap-3 pb-3 border-b border-outline-variant/20">
            <span className="material-symbols-outlined text-secondary text-2xl">public</span>
            <div>
              <h3 className="text-base font-bold text-on-surface">أسعار صرف العملات الإقليمية الأخرى مقابل الدولار ($1 USD)</h3>
              <p className="text-xs text-on-surface-variant">تستخدم لحساب العملات المحلية في مختلف صفحات المتجر</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Egyptian Pound */}
            <div className="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/20 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">🇪🇬</span>
                <label className="text-xs font-bold text-on-surface">الجنيه المصري (EGP):</label>
              </div>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  value={config.usdToEgp}
                  onChange={(e) => setConfig({ ...config, usdToEgp: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2.5 bg-surface-container border border-outline-variant/40 rounded-xl focus:border-primary outline-none font-mono text-sm font-bold text-on-surface text-left dir-ltr"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-on-surface-variant">
                  EGP / $1
                </span>
              </div>
            </div>

            {/* Saudi Riyal */}
            <div className="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/20 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">🇸🇦</span>
                <label className="text-xs font-bold text-on-surface">الريال السعودي (SAR):</label>
              </div>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0.1"
                  value={config.usdToSar}
                  onChange={(e) => setConfig({ ...config, usdToSar: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2.5 bg-surface-container border border-outline-variant/40 rounded-xl focus:border-primary outline-none font-mono text-sm font-bold text-on-surface text-left dir-ltr"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-on-surface-variant">
                  SAR / $1
                </span>
              </div>
            </div>

            {/* UAE Dirham */}
            <div className="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/20 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">🇦🇪</span>
                <label className="text-xs font-bold text-on-surface">الدرهم الإماراتي (AED):</label>
              </div>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0.1"
                  value={config.usdToAed}
                  onChange={(e) => setConfig({ ...config, usdToAed: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2.5 bg-surface-container border border-outline-variant/40 rounded-xl focus:border-primary outline-none font-mono text-sm font-bold text-on-surface text-left dir-ltr"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-on-surface-variant">
                  AED / $1
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* OTHER PAYMENT ACCOUNTS CONFIGURATION */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-outline-variant/30 space-y-6">
          <div className="flex items-center gap-3 pb-3 border-b border-outline-variant/20">
            <span className="material-symbols-outlined text-primary text-2xl">account_balance_wallet</span>
            <div>
              <h3 className="text-base font-bold text-on-surface">إعدادات وبيانات محافظ الدفع الأخرى</h3>
              <p className="text-xs text-on-surface-variant">تعديل أرقام فودافون كاش ومعرف باينانس باي والمحافظ المشفرة</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Vodafone Cash */}
            <div className="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/20 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">📱</span>
                  <span className="font-bold text-xs text-on-surface">فودافون كاش (Vodafone Cash)</span>
                </div>
                <input
                  type="checkbox"
                  checked={config.vodafone.isActive}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      vodafone: { ...config.vodafone, isActive: e.target.checked }
                    })
                  }
                  className="w-4 h-4 accent-primary"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-on-surface-variant mb-1">رقم المحفظة:</label>
                <input
                  type="text"
                  value={config.vodafone.walletNumber}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      vodafone: { ...config.vodafone, walletNumber: e.target.value }
                    })
                  }
                  className="w-full px-3.5 py-2.5 bg-surface-container border border-outline-variant/40 rounded-xl font-mono text-xs font-bold text-on-surface text-left dir-ltr"
                />
              </div>
            </div>

            {/* Binance Pay */}
            <div className="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/20 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🔶</span>
                  <span className="font-bold text-xs text-on-surface">باينانس باي (Binance Pay)</span>
                </div>
                <input
                  type="checkbox"
                  checked={config.binance.isActive}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      binance: { ...config.binance, isActive: e.target.checked }
                    })
                  }
                  className="w-4 h-4 accent-primary"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-on-surface-variant mb-1">Binance Pay ID:</label>
                <input
                  type="text"
                  value={config.binance.payId}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      binance: { ...config.binance, payId: e.target.value }
                    })
                  }
                  className="w-full px-3.5 py-2.5 bg-surface-container border border-outline-variant/40 rounded-xl font-mono text-xs font-bold text-on-surface text-left dir-ltr"
                />
              </div>
            </div>

            {/* BNB Smart Chain */}
            <div className="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/20 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🟡</span>
                  <span className="font-bold text-xs text-on-surface">BNB Smart Chain (BEP20 Address)</span>
                </div>
                <input
                  type="checkbox"
                  checked={config.cryptoBnb.isActive}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      cryptoBnb: { ...config.cryptoBnb, isActive: e.target.checked }
                    })
                  }
                  className="w-4 h-4 accent-primary"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-on-surface-variant mb-1">عنوان المحفظة:</label>
                <input
                  type="text"
                  value={config.cryptoBnb.address}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      cryptoBnb: { ...config.cryptoBnb, address: e.target.value }
                    })
                  }
                  className="w-full px-3.5 py-2.5 bg-surface-container border border-outline-variant/40 rounded-xl font-mono text-xs text-on-surface text-left dir-ltr"
                />
              </div>
            </div>

            {/* PayPal */}
            <div className="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/20 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🅿️</span>
                  <span className="font-bold text-xs text-on-surface">باي بال (PayPal Email)</span>
                </div>
                <input
                  type="checkbox"
                  checked={config.paypal.isActive}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      paypal: { ...config.paypal, isActive: e.target.checked }
                    })
                  }
                  className="w-4 h-4 accent-primary"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-on-surface-variant mb-1">بريد حساب باي بال:</label>
                <input
                  type="email"
                  value={config.paypal.email}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      paypal: { ...config.paypal, email: e.target.value }
                    })
                  }
                  className="w-full px-3.5 py-2.5 bg-surface-container border border-outline-variant/40 rounded-xl font-mono text-xs text-on-surface text-left dir-ltr"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button Row */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-primary to-secondary text-on-primary font-bold text-xs shadow-xl hover:shadow-primary/30 transition-all flex items-center gap-2 disabled:opacity-50 active:scale-95"
          >
            {isSaving ? (
              <span className="material-symbols-outlined animate-spin text-sm">refresh</span>
            ) : (
              <span className="material-symbols-outlined text-sm">save</span>
            )}
            <span>حفظ وتحديث أسعار العملات والحسابات</span>
          </button>
        </div>
      </form>
    </div>
  );
}
