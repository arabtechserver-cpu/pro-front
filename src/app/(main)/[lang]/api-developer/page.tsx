"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ApiDeveloperPage({ params: { lang } }: { params: { lang: string } }) {
  const router = useRouter();
  const [userSession, setUserSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [siteName, setSiteName] = useState("");
  const [siteUrl, setSiteUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("user_token");
        if (!token) {
          router.push(`/${lang}/login`);
          return;
        }

        const res = await fetch("/api/users/profile", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        
        const data = await res.json();
        if (data && data.success && data.user) {
          setUserSession(data.user);
        } else {
          router.push(`/${lang}/login`);
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [lang, router]);

  const handleRequestApi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!siteName || !siteUrl) return;

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("user_token");
      const res = await fetch("/api/users/request-api", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ apiSiteName: siteName, apiSiteUrl: siteUrl })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setToastMessage({ type: "success", text: data.message || "تم تقديم الطلب بنجاح" });
        setUserSession((prev: any) => ({
          ...prev,
          apiSiteName: siteName,
          apiSiteUrl: siteUrl,
          apiEnabled: false,
          apiKey: data.user?.apiKey || prev.apiKey
        }));
      } else {
        setToastMessage({ type: "error", text: data.error || "حدث خطأ أثناء تقديم الطلب" });
      }
    } catch (err) {
      setToastMessage({ type: "error", text: "تعذر الاتصال بالخادم" });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const handleRegenerateKey = async () => {
    if (!confirm(lang === "ar" ? "هل أنت متأكد من تغيير مفتاح الـ API؟ (سيؤدي ذلك إلى توقف المفتاح القديم فوراً)" : "Are you sure you want to regenerate the API key? (The old key will stop working immediately)")) {
      return;
    }

    setIsRegenerating(true);
    try {
      const token = localStorage.getItem("user_token");
      const res = await fetch("/api/users/regenerate-api-key", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setToastMessage({ type: "success", text: data.message || "تم إنشاء مفتاح جديد بنجاح" });
        setUserSession((prev: any) => ({
          ...prev,
          apiKey: data.apiKey
        }));
      } else {
        setToastMessage({ type: "error", text: data.error || "حدث خطأ أثناء تجديد المفتاح" });
      }
    } catch (err) {
      setToastMessage({ type: "error", text: "تعذر الاتصال بالخادم" });
    } finally {
      setIsRegenerating(false);
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-on-surface-variant font-medium text-sm animate-pulse">
            {lang === "ar" ? "جاري تحميل بيانات الـ API..." : "Loading API data..."}
          </p>
        </div>
      </div>
    );
  }

  const isApiRequested = !!userSession?.apiSiteName;
  const isApiEnabled = userSession?.apiEnabled === true;

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 p-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300 border ${
          toastMessage.type === "success" 
            ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-500" 
            : "bg-red-500/10 border-red-500/40 text-red-500"
        }`}>
          <span className="material-symbols-outlined text-xl">
            {toastMessage.type === "success" ? "check_circle" : "error"}
          </span>
          <span className="text-sm font-bold">{toastMessage.text}</span>
        </div>
      )}

      <div className="mb-8 md:mb-12 text-center md:text-start flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-on-surface mb-3 flex items-center gap-3 justify-center md:justify-start">
            <span className="material-symbols-outlined text-purple-400 text-4xl p-2 rounded-2xl bg-purple-500/10 border border-purple-500/20">api</span>
            <span>{lang === "ar" ? "ربط الـ API الخاص بك" : "Your API Connection"}</span>
          </h1>
          <p className="text-on-surface-variant max-w-xl">
            {lang === "ar" 
              ? "اربط موقعك بسهولة مع نظامنا لسحب الخدمات تلقائياً باستخدام نظام Dhru API المتوافق بالكامل."
              : "Easily connect your site with our system to fetch services automatically using our fully compatible Dhru API system."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          {/* Status Card */}
          <div className="glass-card rounded-3xl p-6 border border-outline-variant/30">
            <h2 className="text-lg font-bold text-on-surface flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-primary">info</span>
              {lang === "ar" ? "حالة الربط" : "Connection Status"}
            </h2>

            {!isApiRequested ? (
              <div className="flex flex-col items-center justify-center p-6 text-center rounded-2xl bg-surface-container-lowest border border-dashed border-outline-variant/50">
                <span className="material-symbols-outlined text-4xl text-on-surface-variant/40 mb-2">link_off</span>
                <p className="text-sm font-bold text-on-surface mb-1">
                  {lang === "ar" ? "لم يتم تقديم طلب ربط" : "No API Request Sent"}
                </p>
                <p className="text-xs text-on-surface-variant">
                  {lang === "ar" ? "يرجى تعبئة النموذج لتقديم طلب." : "Please fill out the form to request access."}
                </p>
              </div>
            ) : isApiEnabled ? (
              <div className="flex flex-col items-center justify-center p-6 text-center rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mb-3">
                  <span className="material-symbols-outlined text-2xl text-emerald-400">check_circle</span>
                </div>
                <p className="text-sm font-bold text-emerald-400 mb-1">
                  {lang === "ar" ? "تم تفعيل الـ API" : "API is Enabled"}
                </p>
                <p className="text-xs text-emerald-400/80">
                  {lang === "ar" ? "يمكنك الآن سحب الخدمات بأمان." : "You can now fetch services securely."}
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-6 text-center rounded-2xl bg-amber-500/10 border border-amber-500/30">
                <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center mb-3">
                  <span className="material-symbols-outlined text-2xl text-amber-400">pending_actions</span>
                </div>
                <p className="text-sm font-bold text-amber-400 mb-1">
                  {lang === "ar" ? "طلبك قيد المراجعة" : "Request Pending"}
                </p>
                <p className="text-xs text-amber-400/80">
                  {lang === "ar" ? "يرجى الانتظار حتى تقوم الإدارة بالتفعيل." : "Please wait until the admin approves it."}
                </p>
              </div>
            )}
          </div>

          {/* Request Form if not requested */}
          {!isApiRequested && (
            <div className="glass-card rounded-3xl p-6 border border-purple-500/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
              <h2 className="text-lg font-bold text-on-surface flex items-center gap-2 mb-4 relative z-10">
                <span className="material-symbols-outlined text-purple-400">add_link</span>
                {lang === "ar" ? "تقديم طلب جديد" : "Request Access"}
              </h2>

              <form onSubmit={handleRequestApi} className="space-y-4 relative z-10">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-on-surface-variant">
                    {lang === "ar" ? "اسم الموقع" : "Site Name"}
                  </label>
                  <input
                    type="text"
                    required
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                    placeholder={lang === "ar" ? "مثال: موقعي للخدمات" : "Ex: My Services"}
                    className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl py-2.5 px-4 text-sm text-on-surface focus:outline-none focus:border-purple-400"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-on-surface-variant">
                    {lang === "ar" ? "رابط الموقع (URL)" : "Site URL"}
                  </label>
                  <input
                    type="url"
                    required
                    value={siteUrl}
                    onChange={(e) => setSiteUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl py-2.5 px-4 text-sm text-on-surface focus:outline-none focus:border-purple-400 dir-ltr text-left"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-purple-500 text-white py-3 rounded-xl font-bold text-sm hover:bg-purple-600 transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50 mt-2"
                >
                  {isSubmitting ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    <span className="material-symbols-outlined text-base">send</span>
                  )}
                  <span>{lang === "ar" ? "إرسال الطلب للإدارة" : "Send Request"}</span>
                </button>
              </form>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 space-y-6">
          {/* API Credentials */}
          {isApiRequested && (
            <div className="glass-card rounded-3xl p-6 md:p-8 border border-outline-variant/30">
              <h2 className="text-xl font-bold text-on-surface flex items-center gap-2 mb-6">
                <span className="material-symbols-outlined text-primary">key</span>
                {lang === "ar" ? "بيانات الربط والاعتماد" : "API Credentials"}
              </h2>

              <div className="space-y-4">
                <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                      API URL (الرابط)
                    </p>
                    <p className="text-on-surface font-mono font-medium text-sm sm:text-base dir-ltr select-all">
                      {window.location.origin}/api/v1/provider
                    </p>
                  </div>
                  <button 
                    onClick={() => navigator.clipboard.writeText(`${window.location.origin}/api/v1/provider`)}
                    className="p-2 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface transition-all flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-sm">content_copy</span>
                    <span className="text-xs font-bold">{lang === "ar" ? "نسخ" : "Copy"}</span>
                  </button>
                </div>

                <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                      API KEY (المفتاح السري)
                    </p>
                    <p className="text-primary font-mono font-bold text-sm sm:text-base dir-ltr select-all blur-sm hover:blur-none transition-all duration-300">
                      {userSession?.apiKey || "********************************"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => navigator.clipboard.writeText(userSession?.apiKey || "")}
                      className="p-2 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface transition-all flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-sm">content_copy</span>
                    </button>
                    <button 
                      onClick={handleRegenerateKey}
                      disabled={isRegenerating}
                      className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 transition-all flex items-center gap-2"
                      title={lang === "ar" ? "إنشاء مفتاح جديد" : "Regenerate Key"}
                    >
                      {isRegenerating ? (
                        <span className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></span>
                      ) : (
                        <span className="material-symbols-outlined text-sm">refresh</span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Documentation / Instructions */}
          <div className="glass-card rounded-3xl p-6 md:p-8 border border-outline-variant/30">
            <h2 className="text-xl font-bold text-on-surface flex items-center gap-2 mb-6">
              <span className="material-symbols-outlined text-primary">menu_book</span>
              {lang === "ar" ? "طرق وخطوات الربط (Documentation)" : "Integration Documentation"}
            </h2>

            <div className="space-y-5 text-sm text-on-surface-variant">
              <p>
                {lang === "ar" 
                  ? "نظامنا متوافق بنسبة 100% مع نظام Dhru Fusion. يمكنك سحب خدماتنا بسهولة إلى موقعك عبر اتباع الخطوات التالية:"
                  : "Our system is 100% compatible with the Dhru Fusion system. You can easily fetch our services to your site by following these steps:"}
              </p>

              <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-2xl p-5 space-y-4 relative">
                <div className="absolute top-0 left-0 w-2 h-full bg-purple-500 rounded-l-2xl"></div>
                <h3 className="font-bold text-on-surface text-base">
                  {lang === "ar" ? "إذا كان موقعك يعمل بنظام Dhru أو ما يماثله:" : "If your site uses Dhru or similar:"}
                </h3>
                <ul className="space-y-3 list-none pl-0">
                  <li className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold shrink-0">1</span>
                    <div>
                      <p className="font-bold text-on-surface">{lang === "ar" ? "انتقل إلى إعدادات مزودي الخدمة" : "Go to API Providers settings"}</p>
                      <p className="text-xs mt-1">{lang === "ar" ? "في لوحة تحكم موقعك، أضف مزود خدمة جديد (API Provider)." : "In your admin panel, add a new API Provider."}</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold shrink-0">2</span>
                    <div>
                      <p className="font-bold text-on-surface">{lang === "ar" ? "أدخل بيانات الربط" : "Enter Connection Details"}</p>
                      <p className="text-xs mt-1">
                        {lang === "ar" ? "استخدم رابط الـ API والمفتاح السري (API KEY) الموجودين في الأعلى، واسم المستخدم الخاص بك." : "Use the API URL and API KEY provided above, along with your username."}
                      </p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold shrink-0">3</span>
                    <div>
                      <p className="font-bold text-on-surface">{lang === "ar" ? "مزامنة الخدمات" : "Sync Services"}</p>
                      <p className="text-xs mt-1">
                        {lang === "ar" ? "قم بجلب قائمة الخدمات، سيتم سحب الخدمات متضمنة حقول الإدخال المطلوبة (مثل حقل الـ IMEI الذي سيكون إجبارياً وفي المركز الأول بشكل تلقائي لخدمات IMEI)." : "Fetch the service list. Services will be imported along with required input fields (like the IMEI field, which is automatically required and placed first for IMEI services)."}
                      </p>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="bg-surface-container-high rounded-xl p-4 border-l-4 border-amber-500 flex items-start gap-3">
                <span className="material-symbols-outlined text-amber-500 shrink-0">warning</span>
                <p className="text-xs leading-relaxed">
                  <strong className="text-on-surface">{lang === "ar" ? "ملاحظة هامة:" : "Important Note:"}</strong><br/>
                  {lang === "ar" 
                    ? "يجب أن تمتلك رصيداً كافياً في محفظتك هنا لكي يتم تنفيذ طلبات عملائك القادمة عبر الـ API بنجاح، وإلا سيتم إرجاع خطأ (Insufficient Balance)."
                    : "You must have a sufficient balance in your wallet here for your customers' API orders to be processed successfully, otherwise an 'Insufficient Balance' error will be returned."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
