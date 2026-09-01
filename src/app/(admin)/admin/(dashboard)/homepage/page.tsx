"use client";

import { useState, useEffect } from "react";

// Reusable Image Picker Component with direct device file upload
function ImagePickerInput({ 
  label, 
  value, 
  onChange 
}: { 
  label: string; 
  value: string; 
  onChange: (newUrl: string) => void;
}) {
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: base64, filename: file.name })
        });

        if (res.ok) {
          const data = await res.json();
          if (data.url) {
            onChange(data.url);
          }
        } else {
          alert("فشل رفع الصورة على السيرفر");
        }
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error("Upload error:", err);
      alert("حدث خطأ أثناء رفع الصورة.");
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 p-4 bg-surface-container-low rounded-2xl border border-outline-variant/30">
      <label className="text-xs font-bold uppercase text-on-surface-variant flex items-center justify-between">
        <span>{label}</span>
        {value && <span className="text-[10px] text-primary font-mono">معاينة الصورة</span>}
      </label>

      {/* Image Preview Box */}
      {value && (
        <div className="relative aspect-video w-full max-h-[160px] rounded-xl overflow-hidden bg-black/40 border border-outline-variant/20 mb-2 group">
          <img src={value} alt="Preview" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2">
            <span className="text-xs text-white font-mono break-all text-center">{value}</span>
          </div>
        </div>
      )}

      {/* Inputs: URL + Upload Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <input
          type="text"
          placeholder="رابط الصورة (URL) أو ارفع من جهازك..."
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-3 text-sm text-on-surface font-mono"
        />

        <label className="btn-secondary py-3 px-4 rounded-xl text-xs font-bold cursor-pointer shrink-0 flex items-center justify-center gap-2 hover:border-primary">
          <span className="material-symbols-outlined text-lg">{uploading ? "sync" : "upload_file"}</span>
          <span>{uploading ? "جاري الرفع..." : "رفع من الجهاز"}</span>
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleFileUpload} 
            disabled={uploading} 
            className="hidden" 
          />
        </label>
      </div>
    </div>
  );
}

export default function AdminHomepageManager() {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("hero");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    async function fetchConfig() {
      try {
        const res = await fetch("/api/homepage");
        if (res.ok) {
          const data = await res.json();
          setConfig(data);
        }
      } catch (err) {
        console.error("Failed to load homepage config:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchConfig();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/homepage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config)
      });
      if (res.ok) {
        setToastMessage("تم حفظ تعديلات الصفحة الرئيسية بنجاح!");
        setTimeout(() => setToastMessage(null), 4000);
      }
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء حفظ التغيرات.");
    } finally {
      setSaving(false);
    }
  };

  const updateSectionField = (section: string, field: string, value: any) => {
    setConfig((prev: any) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const updateCampaignField = (index: number, field: string, value: any) => {
    setConfig((prev: any) => {
      const campaigns = Array.isArray(prev.campaigns) ? [...prev.campaigns] : [];
      if (!campaigns[index]) return prev;
      campaigns[index] = { ...campaigns[index], [field]: value };
      return { ...prev, campaigns };
    });
  };

  const addCampaign = () => {
    setConfig((prev: any) => {
      const campaigns = Array.isArray(prev.campaigns) ? [...prev.campaigns] : [];
      campaigns.push({
        tagEn: "New Offer",
        tagAr: "عرض جديد",
        titleEn: "Campaign Title",
        titleAr: "عنوان الإعلان",
        descEn: "Campaign Description",
        descAr: "وصف الإعلان",
        image: "",
        url: "/pricing"
      });
      return { ...prev, campaigns };
    });
  };

  const removeCampaign = (index: number) => {
    setConfig((prev: any) => {
      const campaigns = Array.isArray(prev.campaigns) ? [...prev.campaigns] : [];
      campaigns.splice(index, 1);
      return { ...prev, campaigns };
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <span className="material-symbols-outlined animate-spin text-4xl text-primary">refresh</span>
      </div>
    );
  }

  if (!config) {
    return <div className="text-error">فشل تحميل إعدادات الصفحة الرئيسية.</div>;
  }

  return (
    <div className="flex flex-col gap-8 pb-16 font-sans" dir="rtl">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-8 left-8 z-50 bg-primary text-surface font-bold px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4">
          <span className="material-symbols-outlined text-2xl">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline-variant/20 pb-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-on-surface">إدارة صور ومحتوى الصفحة الرئيسية</h1>
          <p className="text-on-surface-variant text-sm mt-1">التحكم المباشر في كافة النصوص، الأزرار، الصور، وروابط التوجيه، مع دعم الرفع المباشر للصور من جهازك.</p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary flex items-center gap-2 shadow-lg disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-lg">{saving ? "sync" : "save"}</span>
          <span>{saving ? "جاري الحفظ..." : "حفظ والتطبيق المباشر"}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-outline-variant/20 pb-2">
        <button
          onClick={() => setActiveTab("notice")}
          className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all flex items-center gap-2 ${
            activeTab === "notice" ? "bg-primary text-surface font-bold shadow-md" : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
          }`}
        >
          <span className="material-symbols-outlined text-lg">campaign</span>
          1. الشريط الإعلاني العلوي (Notice Bar)
        </button>

        <button
          onClick={() => setActiveTab("hero")}
          className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all flex items-center gap-2 ${
            activeTab === "hero" ? "bg-primary text-surface font-bold shadow-md" : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
          }`}
        >
          <span className="material-symbols-outlined text-lg">space_dashboard</span>
          2. القسم الرئيسي والصورة الرئيسية (Hero Showcase)
        </button>

        <button
          onClick={() => setActiveTab("sidebar")}
          className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all flex items-center gap-2 ${
            activeTab === "sidebar" ? "bg-primary text-surface font-bold shadow-md" : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
          }`}
        >
          <span className="material-symbols-outlined text-lg">view_sidebar</span>
          3. العروض الجانبية وصورة البانر
        </button>

        <button
          onClick={() => setActiveTab("lanes")}
          className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all flex items-center gap-2 ${
            activeTab === "lanes" ? "bg-primary text-surface font-bold shadow-md" : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
          }`}
        >
          <span className="material-symbols-outlined text-lg">grid_view</span>
          4. كروت ورابط الأقسام الأربعة (Service Lanes)
        </button>

        <button
          onClick={() => setActiveTab("ribbon")}
          className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all flex items-center gap-2 ${
            activeTab === "ribbon" ? "bg-primary text-surface font-bold shadow-md" : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
          }`}
        >
          <span className="material-symbols-outlined text-lg">verified</span>
          5. شريط المميزات الثلاثي (Feature Ribbon)
        </button>

        <button
          onClick={() => setActiveTab("campaigns")}
          className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all flex items-center gap-2 ${
            activeTab === "campaigns" ? "bg-primary text-surface font-bold shadow-md" : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
          }`}
        >
          <span className="material-symbols-outlined text-lg">local_fire_department</span>
          6. بنرات وصور العروض الساخنة (Campaign Offers)
        </button>
      </div>

      {/* --- TAB 1: NOTICE BAR --- */}
      {activeTab === "notice" && (
        <div className="glass-card rounded-3xl p-6 md:p-8 border border-outline-variant/30 flex flex-col gap-6">
          <div className="border-b border-outline-variant/20 pb-3">
            <h2 className="text-xl font-bold text-primary flex items-center gap-2">
              <span className="material-symbols-outlined">campaign</span>
              1. الشريط الإعلاني العلوي المتنقل (Notice Bar / Marquee)
            </h2>
            <p className="text-xs text-on-surface-variant mt-1">يتحكم في شريط الإشعارات المتنقل الظاهر أعلى الواجهة الرئيسية.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase text-on-surface-variant">الإعلان الأول (بالعربية)</label>
              <input
                type="text"
                value={config.noticeBar?.text1Ar || ""}
                onChange={(e) => updateSectionField("noticeBar", "text1Ar", e.target.value)}
                className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-3 text-on-surface"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase text-on-surface-variant">الإعلان الأول (بالإنجليزية)</label>
              <input
                type="text"
                value={config.noticeBar?.text1En || ""}
                onChange={(e) => updateSectionField("noticeBar", "text1En", e.target.value)}
                className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-3 text-on-surface"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase text-on-surface-variant">الإعلان الثاني (بالعربية)</label>
              <input
                type="text"
                value={config.noticeBar?.text2Ar || ""}
                onChange={(e) => updateSectionField("noticeBar", "text2Ar", e.target.value)}
                className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-3 text-on-surface"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase text-on-surface-variant">الإعلان الثاني (بالإنجليزية)</label>
              <input
                type="text"
                value={config.noticeBar?.text2En || ""}
                onChange={(e) => updateSectionField("noticeBar", "text2En", e.target.value)}
                className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-3 text-on-surface"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase text-on-surface-variant">رقم واتساب الدعم الظاهر</label>
              <input
                type="text"
                value={config.noticeBar?.whatsapp || ""}
                onChange={(e) => updateSectionField("noticeBar", "whatsapp", e.target.value)}
                className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-3 text-on-surface"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase text-on-surface-variant">معرف تيليجرام الدعم الظاهر</label>
              <input
                type="text"
                value={config.noticeBar?.telegram || ""}
                onChange={(e) => updateSectionField("noticeBar", "telegram", e.target.value)}
                className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-3 text-on-surface"
              />
            </div>

            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-xs font-bold uppercase text-on-surface-variant">البريد الإلكتروني للدعم</label>
              <input
                type="text"
                value={config.noticeBar?.email || ""}
                onChange={(e) => updateSectionField("noticeBar", "email", e.target.value)}
                className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-3 text-on-surface"
              />
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 2: HERO SECTION --- */}
      {activeTab === "hero" && (
        <div className="glass-card rounded-3xl p-6 md:p-8 border border-outline-variant/30 flex flex-col gap-6">
          <div className="border-b border-outline-variant/20 pb-3">
            <h2 className="text-xl font-bold text-primary flex items-center gap-2">
              <span className="material-symbols-outlined">space_dashboard</span>
              2. واجهة العرض الرئيسية والصورة (Hero Showcase & Image)
            </h2>
            <p className="text-xs text-on-surface-variant mt-1">التحكم في العناوين والوصف والأزرار ورابط الصورة الرئيسية للواجهة.</p>
          </div>

          {/* Hero Image Picker with Device Upload */}
          <ImagePickerInput
            label="الصورة الخلفية لكارت الواجهة الرئيسية (Hero Background Image)"
            value={config.heroSection?.heroImage || ""}
            onChange={(newUrl) => updateSectionField("heroSection", "heroImage", newUrl)}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase text-on-surface-variant">شارة البوابة الحية (Live Tag - بالعربية)</label>
              <input
                type="text"
                value={config.heroSection?.liveTagAr || ""}
                onChange={(e) => updateSectionField("heroSection", "liveTagAr", e.target.value)}
                className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-3 text-on-surface"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase text-on-surface-variant">شارة البوابة الحية (Live Tag - بالإنجليزية)</label>
              <input
                type="text"
                value={config.heroSection?.liveTagEn || ""}
                onChange={(e) => updateSectionField("heroSection", "liveTagEn", e.target.value)}
                className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-3 text-on-surface"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase text-on-surface-variant">العنوان الرئيسي السطر الأول (بالعربية)</label>
              <input
                type="text"
                value={config.heroSection?.title1Ar || ""}
                onChange={(e) => updateSectionField("heroSection", "title1Ar", e.target.value)}
                className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-3 text-on-surface font-bold"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase text-on-surface-variant">العنوان الرئيسي السطر الأول (بالإنجليزية)</label>
              <input
                type="text"
                value={config.heroSection?.title1En || ""}
                onChange={(e) => updateSectionField("heroSection", "title1En", e.target.value)}
                className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-3 text-on-surface font-bold"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase text-on-surface-variant">العنوان الرئيسي السطر الثاني (بالعربية - ملون)</label>
              <input
                type="text"
                value={config.heroSection?.title2Ar || ""}
                onChange={(e) => updateSectionField("heroSection", "title2Ar", e.target.value)}
                className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-3 text-primary font-bold"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase text-on-surface-variant">العنوان الرئيسي السطر الثاني (بالإنجليزية - ملون)</label>
              <input
                type="text"
                value={config.heroSection?.title2En || ""}
                onChange={(e) => updateSectionField("heroSection", "title2En", e.target.value)}
                className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-3 text-primary font-bold"
              />
            </div>

            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-xs font-bold uppercase text-on-surface-variant">الوصف التوضيحي للواجهة (بالعربية)</label>
              <textarea
                rows={2}
                value={config.heroSection?.leadAr || ""}
                onChange={(e) => updateSectionField("heroSection", "leadAr", e.target.value)}
                className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-3 text-on-surface"
              />
            </div>

            {/* BUTTON 1 CONFIG */}
            <div className="p-4 bg-surface-container-low rounded-2xl border border-primary/30 flex flex-col gap-3">
              <h3 className="font-bold text-primary text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">link</span> الزر الأول (Browse Button)
              </h3>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-on-surface-variant uppercase font-bold">النص (بالعربية)</label>
                <input
                  type="text"
                  value={config.heroSection?.btnBrowseAr || ""}
                  onChange={(e) => updateSectionField("heroSection", "btnBrowseAr", e.target.value)}
                  className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-2.5 text-sm"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-primary uppercase font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">link</span> رابط التوجيه (URL Link)
                </label>
                <input
                  type="text"
                  placeholder="مثال: /pricing"
                  value={config.heroSection?.btnBrowseUrl || "/pricing"}
                  onChange={(e) => updateSectionField("heroSection", "btnBrowseUrl", e.target.value)}
                  className="bg-surface-container-lowest border border-primary/40 rounded-xl p-2.5 text-sm font-mono text-primary"
                />
              </div>
            </div>

            {/* BUTTON 2 CONFIG */}
            <div className="p-4 bg-surface-container-low rounded-2xl border border-secondary/30 flex flex-col gap-3">
              <h3 className="font-bold text-secondary text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">link</span> الزر الثاني (Join Button)
              </h3>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-on-surface-variant uppercase font-bold">النص (بالعربية)</label>
                <input
                  type="text"
                  value={config.heroSection?.btnJoinAr || ""}
                  onChange={(e) => updateSectionField("heroSection", "btnJoinAr", e.target.value)}
                  className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-2.5 text-sm"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-secondary uppercase font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">link</span> رابط التوجيه (URL Link)
                </label>
                <input
                  type="text"
                  placeholder="مثال: /register"
                  value={config.heroSection?.btnJoinUrl || "/register"}
                  onChange={(e) => updateSectionField("heroSection", "btnJoinUrl", e.target.value)}
                  className="bg-surface-container-lowest border border-secondary/40 rounded-xl p-2.5 text-sm font-mono text-secondary"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 3: SIDEBAR PROMOS --- */}
      {activeTab === "sidebar" && (
        <div className="glass-card rounded-3xl p-6 md:p-8 border border-outline-variant/30 flex flex-col gap-6">
          <div className="border-b border-outline-variant/20 pb-3">
            <h2 className="text-xl font-bold text-primary flex items-center gap-2">
              <span className="material-symbols-outlined">view_sidebar</span>
              3. العروض الجانبية وصورة البانر (Sidebar Banner & Image Upload)
            </h2>
          </div>

          {/* Featured Sidebar Image Picker */}
          <ImagePickerInput
            label="صورة البانر الجانبي المميز (Featured Sidebar Banner Image)"
            value={config.sidebarPromos?.featuredImage || ""}
            onChange={(newUrl) => updateSectionField("sidebarPromos", "featuredImage", newUrl)}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase text-on-surface-variant">عنوان العرض الجانبي المميز (بالعربية)</label>
              <input
                type="text"
                value={config.sidebarPromos?.featuredTitleAr || ""}
                onChange={(e) => updateSectionField("sidebarPromos", "featuredTitleAr", e.target.value)}
                className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-3 text-on-surface font-bold"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase text-on-surface-variant">رابط توجيه العرض الجانبي المميز (URL Link)</label>
              <input
                type="text"
                placeholder="مثال: /pricing"
                value={config.sidebarPromos?.featuredUrl || "/pricing"}
                onChange={(e) => updateSectionField("sidebarPromos", "featuredUrl", e.target.value)}
                className="w-full bg-surface-container-lowest border border-primary/40 rounded-xl p-3 text-primary font-mono"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase text-on-surface-variant">عنوان زر الواتساب (بالعربية)</label>
              <input
                type="text"
                value={config.sidebarPromos?.supportTitleAr || ""}
                onChange={(e) => updateSectionField("sidebarPromos", "supportTitleAr", e.target.value)}
                className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-3 text-on-surface"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase text-on-surface-variant">رابط الواتساب (WhatsApp Direct Link)</label>
              <input
                type="text"
                value={config.sidebarPromos?.whatsappUrl || ""}
                onChange={(e) => updateSectionField("sidebarPromos", "whatsappUrl", e.target.value)}
                className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-3 text-on-surface font-mono"
              />
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 4: SERVICE LANES --- */}
      {activeTab === "lanes" && (
        <div className="glass-card rounded-3xl p-6 md:p-8 border border-outline-variant/30 flex flex-col gap-6">
          <div className="border-b border-outline-variant/20 pb-3">
            <h2 className="text-xl font-bold text-primary flex items-center gap-2">
              <span className="material-symbols-outlined">grid_view</span>
              4. كروت ورابط الأقسام الأربعة (Service Lanes & Section Links)
            </h2>
            <p className="text-xs text-on-surface-variant mt-1">تحديد عناوين، أوصاف، ورابط التوجيه المباشر لكل قسم من الأقسام الأربعة.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card 1: IMEI */}
            <div className="p-4 bg-surface-container-low rounded-2xl border border-outline-variant/20 flex flex-col gap-3">
              <h3 className="font-bold text-primary text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">fingerprint</span> كارت 1: خدمات الـ IMEI
              </h3>
              <input
                type="text"
                placeholder="عنوان الكارت (بالعربية)"
                value={config.serviceLanes?.imeiTitleAr || ""}
                onChange={(e) => updateSectionField("serviceLanes", "imeiTitleAr", e.target.value)}
                className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-2.5 text-sm"
              />
              <input
                type="text"
                placeholder="وصف الكارت (بالعربية)"
                value={config.serviceLanes?.imeiDescAr || ""}
                onChange={(e) => updateSectionField("serviceLanes", "imeiDescAr", e.target.value)}
                className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-2.5 text-sm text-on-surface-variant"
              />
              <div className="flex flex-col gap-1 mt-1">
                <label className="text-[10px] text-primary uppercase font-bold">رابط التوجيه (Section Link)</label>
                <input
                  type="text"
                  placeholder="/pricing?cat=imei"
                  value={config.serviceLanes?.imeiUrl || "/pricing?cat=imei"}
                  onChange={(e) => updateSectionField("serviceLanes", "imeiUrl", e.target.value)}
                  className="bg-surface-container-lowest border border-primary/40 rounded-xl p-2 text-xs font-mono text-primary"
                />
              </div>
            </div>

            {/* Card 2: Server */}
            <div className="p-4 bg-surface-container-low rounded-2xl border border-outline-variant/20 flex flex-col gap-3">
              <h3 className="font-bold text-secondary text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">dns</span> كارت 2: خدمات السيرفرات Server
              </h3>
              <input
                type="text"
                placeholder="عنوان الكارت (بالعربية)"
                value={config.serviceLanes?.serverTitleAr || ""}
                onChange={(e) => updateSectionField("serviceLanes", "serverTitleAr", e.target.value)}
                className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-2.5 text-sm"
              />
              <input
                type="text"
                placeholder="وصف الكارت (بالعربية)"
                value={config.serviceLanes?.serverDescAr || ""}
                onChange={(e) => updateSectionField("serviceLanes", "serverDescAr", e.target.value)}
                className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-2.5 text-sm text-on-surface-variant"
              />
              <div className="flex flex-col gap-1 mt-1">
                <label className="text-[10px] text-secondary uppercase font-bold">رابط التوجيه (Section Link)</label>
                <input
                  type="text"
                  placeholder="/pricing?cat=server"
                  value={config.serviceLanes?.serverUrl || "/pricing?cat=server"}
                  onChange={(e) => updateSectionField("serviceLanes", "serverUrl", e.target.value)}
                  className="bg-surface-container-lowest border border-secondary/40 rounded-xl p-2 text-xs font-mono text-secondary"
                />
              </div>
            </div>

            {/* Card 3: Remote */}
            <div className="p-4 bg-surface-container-low rounded-2xl border border-outline-variant/20 flex flex-col gap-3">
              <h3 className="font-bold text-tertiary text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">settings_remote</span> كارت 3: خدمات التحكم عن بعد Remote
              </h3>
              <input
                type="text"
                placeholder="عنوان الكارت (بالعربية)"
                value={config.serviceLanes?.remoteTitleAr || ""}
                onChange={(e) => updateSectionField("serviceLanes", "remoteTitleAr", e.target.value)}
                className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-2.5 text-sm"
              />
              <input
                type="text"
                placeholder="وصف الكارت (بالعربية)"
                value={config.serviceLanes?.remoteDescAr || ""}
                onChange={(e) => updateSectionField("serviceLanes", "remoteDescAr", e.target.value)}
                className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-2.5 text-sm text-on-surface-variant"
              />
              <div className="flex flex-col gap-1 mt-1">
                <label className="text-[10px] text-tertiary uppercase font-bold">رابط التوجيه (Section Link)</label>
                <input
                  type="text"
                  placeholder="/pricing?cat=remote"
                  value={config.serviceLanes?.remoteUrl || "/pricing?cat=remote"}
                  onChange={(e) => updateSectionField("serviceLanes", "remoteUrl", e.target.value)}
                  className="bg-surface-container-lowest border border-tertiary/40 rounded-xl p-2 text-xs font-mono text-tertiary"
                />
              </div>
            </div>

            {/* Card 4: Store */}
            <div className="p-4 bg-surface-container-low rounded-2xl border border-outline-variant/20 flex flex-col gap-3">
              <h3 className="font-bold text-on-surface text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">shopping_bag</span> كارت 4: أدوات المتجر Tools & Store
              </h3>
              <input
                type="text"
                placeholder="عنوان الكارت (بالعربية)"
                value={config.serviceLanes?.storeTitleAr || ""}
                onChange={(e) => updateSectionField("serviceLanes", "storeTitleAr", e.target.value)}
                className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-2.5 text-sm"
              />
              <input
                type="text"
                placeholder="وصف الكارت (بالعربية)"
                value={config.serviceLanes?.storeDescAr || ""}
                onChange={(e) => updateSectionField("serviceLanes", "storeDescAr", e.target.value)}
                className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-2.5 text-sm text-on-surface-variant"
              />
              <div className="flex flex-col gap-1 mt-1">
                <label className="text-[10px] text-on-surface uppercase font-bold">رابط التوجيه (Section Link)</label>
                <input
                  type="text"
                  placeholder="/pricing?cat=store"
                  value={config.serviceLanes?.storeUrl || "/pricing?cat=store"}
                  onChange={(e) => updateSectionField("serviceLanes", "storeUrl", e.target.value)}
                  className="bg-surface-container-lowest border border-outline-variant/40 rounded-xl p-2 text-xs font-mono text-on-surface"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 5: FEATURE RIBBON --- */}
      {activeTab === "ribbon" && (
        <div className="glass-card rounded-3xl p-6 md:p-8 border border-outline-variant/30 flex flex-col gap-6">
          <div className="border-b border-outline-variant/20 pb-3">
            <h2 className="text-xl font-bold text-primary flex items-center gap-2">
              <span className="material-symbols-outlined">verified</span>
              5. شريط المميزات الثلاثية (Feature Ribbon)
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-surface-container-low rounded-2xl border border-outline-variant/20 flex flex-col gap-3">
              <h3 className="font-bold text-primary text-sm">ميزة 1: موزع رسمي</h3>
              <input
                type="text"
                value={config.featureRibbon?.feat1TitleAr || ""}
                onChange={(e) => updateSectionField("featureRibbon", "feat1TitleAr", e.target.value)}
                className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-2.5 text-sm"
              />
              <textarea
                rows={2}
                value={config.featureRibbon?.feat1DescAr || ""}
                onChange={(e) => updateSectionField("featureRibbon", "feat1DescAr", e.target.value)}
                className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-2.5 text-xs text-on-surface-variant"
              />
            </div>

            <div className="p-4 bg-surface-container-low rounded-2xl border border-outline-variant/20 flex flex-col gap-3">
              <h3 className="font-bold text-secondary text-sm">ميزة 2: مدفوعات آمنة</h3>
              <input
                type="text"
                value={config.featureRibbon?.feat2TitleAr || ""}
                onChange={(e) => updateSectionField("featureRibbon", "feat2TitleAr", e.target.value)}
                className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-2.5 text-sm"
              />
              <textarea
                rows={2}
                value={config.featureRibbon?.feat2DescAr || ""}
                onChange={(e) => updateSectionField("featureRibbon", "feat2DescAr", e.target.value)}
                className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-2.5 text-xs text-on-surface-variant"
              />
            </div>

            <div className="p-4 bg-surface-container-low rounded-2xl border border-outline-variant/20 flex flex-col gap-3">
              <h3 className="font-bold text-tertiary text-sm">ميزة 3: دعم ذو أولوية</h3>
              <input
                type="text"
                value={config.featureRibbon?.feat3TitleAr || ""}
                onChange={(e) => updateSectionField("featureRibbon", "feat3TitleAr", e.target.value)}
                className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-2.5 text-sm"
              />
              <textarea
                rows={2}
                value={config.featureRibbon?.feat3DescAr || ""}
                onChange={(e) => updateSectionField("featureRibbon", "feat3DescAr", e.target.value)}
                className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-2.5 text-xs text-on-surface-variant"
              />
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 6: CAMPAIGN OFFERS --- */}
      {activeTab === "campaigns" && (
        <div className="glass-card rounded-3xl p-6 md:p-8 border border-outline-variant/30 flex flex-col gap-6">
          <div className="border-b border-outline-variant/20 pb-3 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-primary flex items-center gap-2">
                <span className="material-symbols-outlined">local_fire_department</span>
                6. العروض الديناميكية (Campaign Slider)
              </h2>
              <p className="text-xs text-on-surface-variant mt-1">يمكنك إضافة عدد غير محدود من العروض وسيتم عرضها في شريط متحرك (Slider) بالصفحة الرئيسية.</p>
            </div>
            <button onClick={addCampaign} className="btn-primary text-sm px-4 py-2 flex items-center gap-2 rounded-xl">
              <span className="material-symbols-outlined text-sm">add</span> إضافة إعلان جديد
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {Array.isArray(config.campaigns) && config.campaigns.map((camp: any, idx: number) => (
              <div key={idx} className="p-5 bg-surface-container-low rounded-2xl border border-outline-variant/20 flex flex-col gap-4 relative">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-primary text-lg flex items-center gap-2">
                    <span className="bg-primary/20 px-2 py-0.5 rounded text-xs">#{idx + 1}</span> {camp.titleAr || "إعلان جديد"}
                  </h3>
                  <button onClick={() => removeCampaign(idx)} className="text-error hover:bg-error/10 p-2 rounded-full transition-colors flex items-center justify-center">
                    <span className="material-symbols-outlined">delete</span>
                  </button>
                </div>

                <ImagePickerInput
                  label={`صورة الإعلان رقم ${idx + 1}`}
                  value={camp.image || ""}
                  onChange={(newUrl) => updateCampaignField(idx, "image", newUrl)}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-on-surface-variant uppercase font-bold">الشارة العلوي (Tag - بالعربية)</label>
                    <input
                      type="text"
                      value={camp.tagAr || ""}
                      onChange={(e) => updateCampaignField(idx, "tagAr", e.target.value)}
                      className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-2 text-sm"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-on-surface-variant uppercase font-bold">الشارة العلوي (Tag - بالإنجليزية)</label>
                    <input
                      type="text"
                      value={camp.tagEn || ""}
                      onChange={(e) => updateCampaignField(idx, "tagEn", e.target.value)}
                      className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-2 text-sm"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-on-surface-variant uppercase font-bold">العنوان (Title - بالعربية)</label>
                    <input
                      type="text"
                      value={camp.titleAr || ""}
                      onChange={(e) => updateCampaignField(idx, "titleAr", e.target.value)}
                      className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-2 text-sm font-bold"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-on-surface-variant uppercase font-bold">العنوان (Title - بالإنجليزية)</label>
                    <input
                      type="text"
                      value={camp.titleEn || ""}
                      onChange={(e) => updateCampaignField(idx, "titleEn", e.target.value)}
                      className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-2 text-sm font-bold"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-on-surface-variant uppercase font-bold">الوصف (Desc - بالعربية)</label>
                    <input
                      type="text"
                      value={camp.descAr || ""}
                      onChange={(e) => updateCampaignField(idx, "descAr", e.target.value)}
                      className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-2 text-xs text-on-surface-variant"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-on-surface-variant uppercase font-bold">الوصف (Desc - بالإنجليزية)</label>
                    <input
                      type="text"
                      value={camp.descEn || ""}
                      onChange={(e) => updateCampaignField(idx, "descEn", e.target.value)}
                      className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-2 text-xs text-on-surface-variant"
                    />
                  </div>

                  <div className="flex flex-col gap-1 md:col-span-2">
                    <label className="text-[10px] text-primary uppercase font-bold">رابط توجيه العرض (URL)</label>
                    <input
                      type="text"
                      placeholder="/pricing"
                      value={camp.url || "/pricing"}
                      onChange={(e) => updateCampaignField(idx, "url", e.target.value)}
                      className="bg-surface-container-lowest border border-primary/40 rounded-xl p-2 text-xs font-mono text-primary"
                    />
                  </div>
                </div>
              </div>
            ))}
            {(!config.campaigns || config.campaigns.length === 0) && (
              <div className="text-center p-8 border border-dashed border-outline-variant/50 rounded-2xl text-on-surface-variant">
                لا توجد إعلانات حالياً. اضغط على "إضافة إعلان جديد" للبدء.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
