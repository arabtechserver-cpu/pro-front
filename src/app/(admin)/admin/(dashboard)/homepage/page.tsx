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

  // Service picker states
  const [siteGroups, setSiteGroups] = useState<Array<{ name: string; minPrice: number; count: number; time: string }>>([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [showPickerModal, setShowPickerModal] = useState(false);
  const [pickerSearch, setPickerSearch] = useState("");
  const [pickerTargetIndex, setPickerTargetIndex] = useState<number | null>(null);

  useEffect(() => {
    async function fetchConfig() {
      try {
        const res = await fetch("/api/homepage");
        if (res.ok) {
          const data = await res.json();
          let campaignsArray = Array.isArray(data.campaigns) ? data.campaigns : [];
          if (campaignsArray.length === 0 && data.campaigns && typeof data.campaigns === 'object') {
            const c = data.campaigns;
            if (c.promo1Image || c.promo1TitleAr || c.promo1TitleEn) {
              campaignsArray.push({
                tagEn: c.promo1TagEn || "Hot Offer",
                tagAr: c.promo1TagAr || "عرض خاص",
                titleEn: c.promo1TitleEn || "Samsung FRP Remove",
                titleAr: c.promo1TitleAr || "حذف حساب جوجل لسامسونج",
                descEn: c.promo1DescEn || "",
                descAr: c.promo1DescAr || "",
                image: c.promo1Image || "/images/promo_samsung.webp",
                url: c.promo1Url || "/pricing"
              });
            }
            if (c.promo2Image || c.promo2TitleAr || c.promo2TitleEn) {
              campaignsArray.push({
                tagEn: c.promo2TagEn || "Official Reseller",
                tagAr: c.promo2TagAr || "ترخيص رسمي",
                titleEn: c.promo2TitleEn || "Chimera Tool",
                titleAr: c.promo2TitleAr || "أداة شيميراChimera",
                descEn: c.promo2DescEn || "",
                descAr: c.promo2DescAr || "",
                image: c.promo2Image || "/images/promo_chimera.webp",
                url: c.promo2Url || "/pricing"
              });
            }
          }
          data.campaigns = campaignsArray;

          if (!Array.isArray(data.supportedTools) || data.supportedTools.length === 0) {
            data.supportedTools = [
              { id: "chimera", name: "Chimera", url: "/pricing?search=Chimera", image: "" },
              { id: "unlocktool", name: "UnlockTool", url: "/pricing?search=UnlockTool", image: "" },
              { id: "borneo", name: "Borneo", url: "/pricing?search=Borneo", image: "" },
              { id: "iremoval", name: "iRemoval Pro", url: "/pricing?search=iRemoval%20Pro", image: "" },
              { id: "dft", name: "DFT Pro", url: "/pricing?search=DFT%20Pro", image: "" },
              { id: "mobilesea", name: "MobileSea Tool", url: "/pricing?search=MobileSea%20Tool", image: "" },
              { id: "amt", name: "AMT", url: "/pricing?search=AMT", image: "" },
              { id: "phoenix", name: "Phoenix", url: "/pricing?search=Phoenix", image: "" },
              { id: "cheetah", name: "Cheetah", url: "/pricing?search=Cheetah", image: "" },
              { id: "fkey", name: "FKey", url: "/pricing?search=FKey", image: "" }
            ];
          }

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

  // Fetch site service groups for the package & tool picker
  useEffect(() => {
    async function fetchSiteServices() {
      try {
        setLoadingServices(true);
        const res = await fetch("/api/dhru/services?view=pricing");
        if (res.ok) {
          const categories = await res.json();
          const groupMap = new Map<string, { name: string; minPrice: number; count: number; time: string }>();

          if (Array.isArray(categories)) {
            for (const cat of categories) {
              const services = Array.isArray(cat.services) ? cat.services : [];
              for (const s of services) {
                const group = (s.groupName || "").trim();
                if (!group) continue;
                const credit = typeof s.credit === "number" ? s.credit : 0;
                const existing = groupMap.get(group);
                if (!existing) {
                  groupMap.set(group, {
                    name: group,
                    minPrice: credit,
                    count: 1,
                    time: s.time || ""
                  });
                } else {
                  existing.count += 1;
                  if (credit > 0 && (existing.minPrice === 0 || credit < existing.minPrice)) {
                    existing.minPrice = credit;
                  }
                  if (!existing.time && s.time) {
                    existing.time = s.time;
                  }
                }
              }
            }
          }

          const sorted = Array.from(groupMap.values()).sort((a, b) => a.name.localeCompare(b.name));
          setSiteGroups(sorted);
        }
      } catch (err) {
        console.error("Failed to load site services for picker:", err);
      } finally {
        setLoadingServices(false);
      }
    }
    fetchSiteServices();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = typeof window !== "undefined" ? (localStorage.getItem("admin_token") || localStorage.getItem("token")) : null;
      const res = await fetch("/api/homepage", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}`, "x-admin-token": token } : {})
        },
        body: JSON.stringify(config)
      });
      if (res.ok) {
        setToastMessage("تم حفظ تعديلات الصفحة الرئيسية بنجاح!");
        setTimeout(() => setToastMessage(null), 4000);
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(errData.error || "فشل حفظ التعديلات. يرجى التأكد من تسجيل دخولك كمسؤول.");
      }
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء الاتصال بالسيرفر لحفظ التغييرات.");
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

  const addPackage = () => {
    setConfig((prev: any) => {
      const pkgs = Array.isArray(prev.featuredPackages) ? [...prev.featuredPackages] : [];
      pkgs.push({
        id: `pkg_${Date.now()}`,
        nameAr: "باقة جديدة",
        nameEn: "New Package",
        subAr: "",
        subEn: "",
        badgeAr: "الأكثر طلباً",
        badgeEn: "Popular",
        isPopular: false,
        startingPrice: "$0.00",
        categoryAr: "رسمي",
        categoryEn: "Official",
        deliveryTimeAr: "فوري 24/7",
        deliveryTimeEn: "Instant 24/7",
        iconName: "inventory_2",
        image: "",
        url: "/pricing",
        featuresAr: [""],
        featuresEn: [""]
      });
      return { ...prev, featuredPackages: pkgs };
    });
  };

  const selectServiceForPackage = (group: { name: string; minPrice: number; time: string }) => {
    const formattedPrice = group.minPrice > 0 ? `$${group.minPrice.toFixed(2)}` : "$0.99";

    setConfig((prev: any) => {
      const pkgs = Array.isArray(prev.featuredPackages) ? [...prev.featuredPackages] : [];
      if (pickerTargetIndex !== null && pkgs[pickerTargetIndex]) {
        pkgs[pickerTargetIndex] = {
          ...pkgs[pickerTargetIndex],
          nameAr: group.name,
          nameEn: group.name,
          subAr: group.name,
          subEn: group.name,
          startingPrice: formattedPrice,
          deliveryTimeAr: group.time || "فوري 24/7",
          deliveryTimeEn: group.time || "Instant 24/7",
          url: `/pricing?section=${encodeURIComponent(group.name)}`
        };
      } else {
        pkgs.push({
          id: `pkg_${Date.now()}`,
          nameAr: group.name,
          nameEn: group.name,
          subAr: group.name,
          subEn: group.name,
          badgeAr: "الأكثر طلباً",
          badgeEn: "Best Seller",
          isPopular: false,
          startingPrice: formattedPrice,
          categoryAr: "سيرفر رسمي",
          categoryEn: "Official Server",
          deliveryTimeAr: group.time || "فوري 24/7",
          deliveryTimeEn: group.time || "Instant 24/7",
          iconName: "bolt",
          image: "",
          url: `/pricing?section=${encodeURIComponent(group.name)}`,
          featuresAr: [
            `خدمة ${group.name} الرسمية`,
            "تنفيذ تلقائي وفوري عبر السيرفر",
            "ضمان استرجاع الرصيد في حال عدم الإنجاز"
          ],
          featuresEn: [
            `Official ${group.name} service`,
            "Instant automated server execution",
            "Full refund protection on rejection"
          ]
        });
      }
      return { ...prev, featuredPackages: pkgs };
    });

    setShowPickerModal(false);
    setPickerTargetIndex(null);
  };

  const removePackage = (index: number) => {
    setConfig((prev: any) => {
      const pkgs = Array.isArray(prev.featuredPackages) ? [...prev.featuredPackages] : [];
      pkgs.splice(index, 1);
      return { ...prev, featuredPackages: pkgs };
    });
  };

  const updatePackageField = (index: number, field: string, value: any) => {
    setConfig((prev: any) => {
      const pkgs = Array.isArray(prev.featuredPackages) ? [...prev.featuredPackages] : [];
      if (!pkgs[index]) return prev;
      pkgs[index] = { ...pkgs[index], [field]: value };
      return { ...prev, featuredPackages: pkgs };
    });
  };

  // Supported Tools Handlers
  const addTool = () => {
    setConfig((prev: any) => {
      const tools = Array.isArray(prev.supportedTools) ? [...prev.supportedTools] : [];
      tools.push({
        id: `tool_${Date.now()}`,
        name: "أداة جديدة",
        url: "/pricing",
        image: ""
      });
      return { ...prev, supportedTools: tools };
    });
  };

  const addToolFromGroup = (groupName: string) => {
    setConfig((prev: any) => {
      const tools = Array.isArray(prev.supportedTools) ? [...prev.supportedTools] : [];
      tools.push({
        id: `tool_${Date.now()}`,
        name: groupName,
        url: `/pricing?search=${encodeURIComponent(groupName)}`,
        image: ""
      });
      return { ...prev, supportedTools: tools };
    });
  };

  const removeTool = (index: number) => {
    setConfig((prev: any) => {
      const tools = Array.isArray(prev.supportedTools) ? [...prev.supportedTools] : [];
      tools.splice(index, 1);
      return { ...prev, supportedTools: tools };
    });
  };

  const updateToolField = (index: number, field: string, value: any) => {
    setConfig((prev: any) => {
      const tools = Array.isArray(prev.supportedTools) ? [...prev.supportedTools] : [];
      if (!tools[index]) return prev;
      tools[index] = { ...tools[index], [field]: value };
      return { ...prev, supportedTools: tools };
    });
  };

  const moveTool = (index: number, direction: "up" | "down") => {
    setConfig((prev: any) => {
      const tools = Array.isArray(prev.supportedTools) ? [...prev.supportedTools] : [];
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= tools.length) return prev;
      const temp = tools[index];
      tools[index] = tools[targetIndex];
      tools[targetIndex] = temp;
      return { ...prev, supportedTools: tools };
    });
  };

  const resetDefaultTools = () => {
    if (!confirm("هل أنت متأكد من استعادة قائمة الـ 10 أدوات الافتراضية؟")) return;
    setConfig((prev: any) => ({
      ...prev,
      supportedTools: [
        { id: "chimera", name: "Chimera", url: "/pricing?search=Chimera", image: "" },
        { id: "unlocktool", name: "UnlockTool", url: "/pricing?search=UnlockTool", image: "" },
        { id: "borneo", name: "Borneo", url: "/pricing?search=Borneo", image: "" },
        { id: "iremoval", name: "iRemoval Pro", url: "/pricing?search=iRemoval%20Pro", image: "" },
        { id: "dft", name: "DFT Pro", url: "/pricing?search=DFT%20Pro", image: "" },
        { id: "mobilesea", name: "MobileSea Tool", url: "/pricing?search=MobileSea%20Tool", image: "" },
        { id: "amt", name: "AMT", url: "/pricing?search=AMT", image: "" },
        { id: "phoenix", name: "Phoenix", url: "/pricing?search=Phoenix", image: "" },
        { id: "cheetah", name: "Cheetah", url: "/pricing?search=Cheetah", image: "" },
        { id: "fkey", name: "FKey", url: "/pricing?search=FKey", image: "" }
      ]
    }));
  };

  const updatePackageFeature = (pkgIdx: number, featKey: "featuresAr" | "featuresEn", featIdx: number, value: string) => {
    setConfig((prev: any) => {
      const pkgs = Array.isArray(prev.featuredPackages) ? [...prev.featuredPackages] : [];
      if (!pkgs[pkgIdx]) return prev;
      const feats = Array.isArray(pkgs[pkgIdx][featKey]) ? [...pkgs[pkgIdx][featKey]] : [];
      feats[featIdx] = value;
      pkgs[pkgIdx] = { ...pkgs[pkgIdx], [featKey]: feats };
      return { ...prev, featuredPackages: pkgs };
    });
  };

  const addPackageFeature = (pkgIdx: number, featKey: "featuresAr" | "featuresEn") => {
    setConfig((prev: any) => {
      const pkgs = Array.isArray(prev.featuredPackages) ? [...prev.featuredPackages] : [];
      if (!pkgs[pkgIdx]) return prev;
      const feats = Array.isArray(pkgs[pkgIdx][featKey]) ? [...pkgs[pkgIdx][featKey]] : [];
      feats.push("");
      pkgs[pkgIdx] = { ...pkgs[pkgIdx], [featKey]: feats };
      return { ...prev, featuredPackages: pkgs };
    });
  };

  const removePackageFeature = (pkgIdx: number, featKey: "featuresAr" | "featuresEn", featIdx: number) => {
    setConfig((prev: any) => {
      const pkgs = Array.isArray(prev.featuredPackages) ? [...prev.featuredPackages] : [];
      if (!pkgs[pkgIdx]) return prev;
      const feats = Array.isArray(pkgs[pkgIdx][featKey]) ? [...pkgs[pkgIdx][featKey]] : [];
      feats.splice(featIdx, 1);
      pkgs[pkgIdx] = { ...pkgs[pkgIdx], [featKey]: feats };
      return { ...prev, featuredPackages: pkgs };
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

        <button
          onClick={() => setActiveTab("packages")}
          className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all flex items-center gap-2 ${
            activeTab === "packages" ? "bg-primary text-surface font-bold shadow-md" : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
          }`}
        >
          <span className="material-symbols-outlined text-lg">package_2</span>
          7. بطاقات الباقات المميزة (Featured Packages)
        </button>

        <button
          onClick={() => setActiveTab("tools")}
          className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all flex items-center gap-2 ${
            activeTab === "tools" ? "bg-primary text-surface font-bold shadow-md" : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
          }`}
        >
          <span className="material-symbols-outlined text-lg">construction</span>
          8. أبرز الأدوات المدعومة (Supported Tools Bar)
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

      {/* --- TAB 7: FEATURED PACKAGES --- */}
      {activeTab === "packages" && (
        <div className="glass-card rounded-3xl p-6 md:p-8 border border-outline-variant/30 flex flex-col gap-6">
          <div className="border-b border-outline-variant/20 pb-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-primary flex items-center gap-2">
                <span className="material-symbols-outlined">package_2</span>
                7. بطاقات الباقات المميزة في الصفحة الرئيسية
              </h2>
              <p className="text-xs text-on-surface-variant mt-1">
                تحكم كامل في بطاقات قسم &quot;الباقات الأكثر طلباً&quot; — إضافة وتعديل وحذف، مع رفع صورة مخصصة لكل باقة، أو اختيار باقة مباشرة من خدمات وسيرفرات الموقع.
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => {
                  setPickerTargetIndex(null);
                  setShowPickerModal(true);
                }}
                className="btn-primary text-sm px-4 py-2.5 flex items-center gap-2 rounded-xl shrink-0 shadow-md"
              >
                <span className="material-symbols-outlined text-sm">hub</span>
                اختيار باقة من خدمات الموقع
              </button>
              <button
                onClick={addPackage}
                className="btn-secondary text-sm px-4 py-2.5 flex items-center gap-2 rounded-xl shrink-0"
              >
                <span className="material-symbols-outlined text-sm">add</span>
                إضافة باقة يدوية
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-8">
            {Array.isArray(config.featuredPackages) && config.featuredPackages.map((pkg: any, idx: number) => (
              <div key={pkg.id || idx} className="p-5 bg-surface-container-low rounded-2xl border border-outline-variant/20 flex flex-col gap-5 relative">
                {/* Card Header */}
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-primary text-lg flex items-center gap-2">
                    <span className="bg-primary/20 px-2 py-0.5 rounded text-xs">#{idx + 1}</span>
                    {pkg.nameAr || "باقة جديدة"}
                    {pkg.isPopular && (
                      <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-full font-bold">الأكثر طلباً</span>
                    )}
                  </h3>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => {
                        setPickerTargetIndex(idx);
                        setShowPickerModal(true);
                      }}
                      className="text-xs bg-surface-container-high hover:bg-surface-container-highest text-primary px-3 py-1.5 rounded-xl border border-primary/30 flex items-center gap-1.5 transition-all"
                      title="تعبئة بيانات هذه الباقة من خدمة بالموقع"
                    >
                      <span className="material-symbols-outlined text-sm">sync_alt</span>
                      ربط بخدمة من الموقع
                    </button>
                    <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-on-surface-variant">
                      <input
                        type="checkbox"
                        checked={Boolean(pkg.isPopular)}
                        onChange={(e) => updatePackageField(idx, "isPopular", e.target.checked)}
                        className="w-4 h-4 accent-primary"
                      />
                      الأكثر طلباً
                    </label>
                    <button
                      onClick={() => removePackage(idx)}
                      className="text-error hover:bg-error/10 p-2 rounded-full transition-colors flex items-center justify-center"
                    >
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                </div>

                {/* Package Image */}
                <ImagePickerInput
                  label={`صورة الباقة رقم ${idx + 1} (اختياري - تظهر أعلى البطاقة)`}
                  value={pkg.image || ""}
                  onChange={(newUrl) => updatePackageField(idx, "image", newUrl)}
                />

                {/* Main Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-on-surface-variant uppercase font-bold">الاسم (بالعربية)</label>
                    <input
                      type="text"
                      value={pkg.nameAr || ""}
                      onChange={(e) => updatePackageField(idx, "nameAr", e.target.value)}
                      className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-2.5 text-sm font-bold"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-on-surface-variant uppercase font-bold">الاسم (بالإنجليزية)</label>
                    <input
                      type="text"
                      value={pkg.nameEn || ""}
                      onChange={(e) => updatePackageField(idx, "nameEn", e.target.value)}
                      className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-2.5 text-sm font-bold"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-on-surface-variant uppercase font-bold">العنوان الفرعي (بالعربية)</label>
                    <input
                      type="text"
                      value={pkg.subAr || ""}
                      onChange={(e) => updatePackageField(idx, "subAr", e.target.value)}
                      className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-2.5 text-xs text-on-surface-variant"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-on-surface-variant uppercase font-bold">العنوان الفرعي (بالإنجليزية)</label>
                    <input
                      type="text"
                      value={pkg.subEn || ""}
                      onChange={(e) => updatePackageField(idx, "subEn", e.target.value)}
                      className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-2.5 text-xs text-on-surface-variant"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-amber-400 uppercase font-bold">الشارة / البادج (بالعربية)</label>
                    <input
                      type="text"
                      placeholder="مثال: سيرفر رسمي مباشر"
                      value={pkg.badgeAr || ""}
                      onChange={(e) => updatePackageField(idx, "badgeAr", e.target.value)}
                      className="bg-surface-container-lowest border border-amber-400/30 rounded-xl p-2.5 text-xs text-amber-300"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-amber-400 uppercase font-bold">الشارة / البادج (بالإنجليزية)</label>
                    <input
                      type="text"
                      placeholder="e.g. Direct Server"
                      value={pkg.badgeEn || ""}
                      onChange={(e) => updatePackageField(idx, "badgeEn", e.target.value)}
                      className="bg-surface-container-lowest border border-amber-400/30 rounded-xl p-2.5 text-xs text-amber-300"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-emerald-400 uppercase font-bold">السعر (مثال: $3.41)</label>
                    <input
                      type="text"
                      placeholder="$0.00"
                      value={pkg.startingPrice || ""}
                      onChange={(e) => updatePackageField(idx, "startingPrice", e.target.value)}
                      className="bg-surface-container-lowest border border-emerald-400/30 rounded-xl p-2.5 text-sm font-mono text-emerald-400 font-bold"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-on-surface-variant uppercase font-bold">اسم الأيقونة (iconName)</label>
                    <input
                      type="text"
                      placeholder="smartphone / bolt / build"
                      value={pkg.iconName || ""}
                      onChange={(e) => updatePackageField(idx, "iconName", e.target.value)}
                      className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-2.5 text-xs font-mono"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-on-surface-variant uppercase font-bold">الفئة (بالعربية)</label>
                    <input
                      type="text"
                      value={pkg.categoryAr || ""}
                      onChange={(e) => updatePackageField(idx, "categoryAr", e.target.value)}
                      className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-2.5 text-xs"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-on-surface-variant uppercase font-bold">الفئة (بالإنجليزية)</label>
                    <input
                      type="text"
                      value={pkg.categoryEn || ""}
                      onChange={(e) => updatePackageField(idx, "categoryEn", e.target.value)}
                      className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-2.5 text-xs"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-on-surface-variant uppercase font-bold">وقت التسليم (بالعربية)</label>
                    <input
                      type="text"
                      value={pkg.deliveryTimeAr || ""}
                      onChange={(e) => updatePackageField(idx, "deliveryTimeAr", e.target.value)}
                      className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-2.5 text-xs"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-on-surface-variant uppercase font-bold">وقت التسليم (بالإنجليزية)</label>
                    <input
                      type="text"
                      value={pkg.deliveryTimeEn || ""}
                      onChange={(e) => updatePackageField(idx, "deliveryTimeEn", e.target.value)}
                      className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-2.5 text-xs"
                    />
                  </div>

                  <div className="flex flex-col gap-1 md:col-span-2">
                    <label className="text-[10px] text-primary uppercase font-bold">رابط الباقة (URL)</label>
                    <input
                      type="text"
                      placeholder="/pricing?section=..."
                      value={pkg.url || "/pricing"}
                      onChange={(e) => updatePackageField(idx, "url", e.target.value)}
                      className="bg-surface-container-lowest border border-primary/40 rounded-xl p-2.5 text-xs font-mono text-primary"
                    />
                  </div>
                </div>

                {/* Features */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Arabic Features */}
                  <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-on-surface-variant uppercase">المميزات (بالعربية)</label>
                      <button
                        onClick={() => addPackageFeature(idx, "featuresAr")}
                        className="text-[10px] text-primary hover:underline flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-xs">add</span> إضافة ميزة
                      </button>
                    </div>
                    {Array.isArray(pkg.featuresAr) && pkg.featuresAr.map((feat: string, fIdx: number) => (
                      <div key={fIdx} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={feat}
                          onChange={(e) => updatePackageFeature(idx, "featuresAr", fIdx, e.target.value)}
                          className="flex-1 bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-2 text-xs"
                          placeholder={`الميزة ${fIdx + 1}`}
                        />
                        <button
                          onClick={() => removePackageFeature(idx, "featuresAr", fIdx)}
                          className="text-error p-1 hover:bg-error/10 rounded-full transition-colors"
                        >
                          <span className="material-symbols-outlined text-sm">close</span>
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* English Features */}
                  <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-on-surface-variant uppercase">المميزات (بالإنجليزية)</label>
                      <button
                        onClick={() => addPackageFeature(idx, "featuresEn")}
                        className="text-[10px] text-primary hover:underline flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-xs">add</span> Add feature
                      </button>
                    </div>
                    {Array.isArray(pkg.featuresEn) && pkg.featuresEn.map((feat: string, fIdx: number) => (
                      <div key={fIdx} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={feat}
                          onChange={(e) => updatePackageFeature(idx, "featuresEn", fIdx, e.target.value)}
                          className="flex-1 bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-2 text-xs"
                          placeholder={`Feature ${fIdx + 1}`}
                        />
                        <button
                          onClick={() => removePackageFeature(idx, "featuresEn", fIdx)}
                          className="text-error p-1 hover:bg-error/10 rounded-full transition-colors"
                        >
                          <span className="material-symbols-outlined text-sm">close</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            {(!config.featuredPackages || config.featuredPackages.length === 0) && (
              <div className="text-center p-10 border border-dashed border-outline-variant/50 rounded-2xl text-on-surface-variant">
                <span className="material-symbols-outlined text-4xl mb-2 block">package_2</span>
                لا توجد باقات مميزة حالياً. اضغط على &quot;إضافة باقة جديدة&quot; للبدء.
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- TAB 8: SUPPORTED TOOLS BAR --- */}
      {activeTab === "tools" && (
        <div className="glass-card rounded-3xl p-6 md:p-8 border border-outline-variant/30 flex flex-col gap-6">
          <div className="border-b border-outline-variant/20 pb-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-primary flex items-center gap-2">
                <span className="material-symbols-outlined">construction</span>
                8. أبرز الأدوات المدعومة (Supported Tools Bar)
              </h2>
              <p className="text-xs text-on-surface-variant mt-1">
                التحكم في شريط الأدوات العشرة (أو أي عدد تحدده) الظاهر في الواجهة الرئيسية. يمكنك رفع شعار/أيقونة مخصصة لكل أداة وتعديل اسمها ورابط البحث.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={addTool}
                className="btn-primary text-sm px-4 py-2.5 flex items-center gap-2 rounded-xl shrink-0 shadow-md"
              >
                <span className="material-symbols-outlined text-sm">add</span> إضافة أداة جديدة
              </button>
              <button
                onClick={resetDefaultTools}
                className="btn-secondary text-sm px-4 py-2.5 flex items-center gap-2 rounded-xl shrink-0"
              >
                <span className="material-symbols-outlined text-sm">restart_alt</span> استعادة الأدوات الافتراضية
              </button>
            </div>
          </div>

          {/* Quick-add from site service groups */}
          {siteGroups.length > 0 && (
            <div className="p-4 bg-surface-container-low rounded-2xl border border-outline-variant/20">
              <span className="text-xs font-bold text-on-surface block mb-2">إضافة سريعة من أدوات ومجموعات الموقع:</span>
              <div className="flex flex-wrap gap-2 max-h-28 overflow-y-auto pr-1">
                {siteGroups.slice(0, 20).map((grp) => (
                  <button
                    key={grp.name}
                    onClick={() => addToolFromGroup(grp.name)}
                    className="text-xs px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-primary/20 hover:text-primary transition-colors border border-outline-variant/20 flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-xs">add</span>
                    <span className="truncate max-w-[150px]">{grp.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tools Grid / List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {Array.isArray(config.supportedTools) && config.supportedTools.map((tool: any, tIdx: number) => (
              <div
                key={tool.id || tIdx}
                className="p-5 bg-surface-container-low rounded-2xl border border-outline-variant/20 flex flex-col gap-4 relative"
              >
                {/* Header */}
                <div className="flex justify-between items-center">
                  <span className="font-bold text-primary text-sm flex items-center gap-2">
                    <span className="bg-primary/20 px-2 py-0.5 rounded text-xs">#{tIdx + 1}</span>
                    {tool.name || "أداة جديدة"}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => moveTool(tIdx, "up")}
                      disabled={tIdx === 0}
                      className="p-1.5 rounded-lg hover:bg-surface-container-high disabled:opacity-30 transition-colors"
                      title="تحريك لأعلى"
                    >
                      <span className="material-symbols-outlined text-sm">arrow_upward</span>
                    </button>
                    <button
                      onClick={() => moveTool(tIdx, "down")}
                      disabled={tIdx === config.supportedTools.length - 1}
                      className="p-1.5 rounded-lg hover:bg-surface-container-high disabled:opacity-30 transition-colors"
                      title="تحريك لأسفل"
                    >
                      <span className="material-symbols-outlined text-sm">arrow_downward</span>
                    </button>
                    <button
                      onClick={() => removeTool(tIdx)}
                      className="text-error hover:bg-error/10 p-1.5 rounded-lg transition-colors"
                      title="حذف الأداة"
                    >
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  </div>
                </div>

                {/* Tool Image Picker */}
                <ImagePickerInput
                  label="شعار أو أيقونة الأداة (اختياري - يظهر بالواجهة)"
                  value={tool.image || ""}
                  onChange={(newUrl) => updateToolField(tIdx, "image", newUrl)}
                />

                {/* Name & URL */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-on-surface-variant uppercase font-bold">اسم الأداة</label>
                    <input
                      type="text"
                      value={tool.name || ""}
                      onChange={(e) => updateToolField(tIdx, "name", e.target.value)}
                      placeholder="مثال: Chimera"
                      className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-2.5 text-sm font-bold"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-primary uppercase font-bold">رابط التوجيه (URL)</label>
                    <input
                      type="text"
                      value={tool.url || ""}
                      onChange={(e) => updateToolField(tIdx, "url", e.target.value)}
                      placeholder={`/pricing?search=${encodeURIComponent(tool.name || "")}`}
                      className="bg-surface-container-lowest border border-primary/30 rounded-xl p-2.5 text-xs font-mono text-primary"
                    />
                  </div>
                </div>
              </div>
            ))}

            {(!config.supportedTools || config.supportedTools.length === 0) && (
              <div className="col-span-full text-center p-10 border border-dashed border-outline-variant/50 rounded-2xl text-on-surface-variant">
                <span className="material-symbols-outlined text-4xl mb-2 block">construction</span>
                لا توجد أدوات مدعومة حالياً. اضغط على &quot;استعادة الأدوات الافتراضية&quot; أو &quot;إضافة أداة جديدة&quot;.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Service Picker Modal */}
      {showPickerModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container rounded-3xl border border-outline-variant/30 max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-outline-variant/20 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">hub</span>
                  {pickerTargetIndex !== null
                    ? `تحديث بيانات الباقة #${pickerTargetIndex + 1} من خدمات الموقع`
                    : "اختيار باقة من خدمات وسيرفرات الموقع"}
                </h3>
                <p className="text-xs text-on-surface-variant mt-1">
                  اختر من بين باقات وأدوات الموقع المسجلة لديك ليتم تعبئة الاسم والسعر والرابط تلقائياً.
                </p>
              </div>
              <button
                onClick={() => {
                  setShowPickerModal(false);
                  setPickerTargetIndex(null);
                }}
                className="text-on-surface-variant hover:text-on-surface p-2 rounded-full hover:bg-surface-container-high transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Search Input */}
            <div className="p-4 border-b border-outline-variant/20 bg-surface-container-low">
              <div className="relative">
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
                <input
                  type="text"
                  placeholder="ابحث بالاسم مثل: Chimera, Xiaomi, UnlockTool, AMT, UMT, Samsung..."
                  value={pickerSearch}
                  onChange={(e) => setPickerSearch(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl pr-10 pl-4 py-3 text-sm text-on-surface focus:outline-none focus:border-primary"
                  autoFocus
                />
              </div>
            </div>

            {/* Services / Groups List */}
            <div className="p-4 overflow-y-auto flex-1 flex flex-col gap-2.5 divide-y divide-outline-variant/10">
              {loadingServices ? (
                <div className="py-12 flex flex-col items-center justify-center gap-3 text-on-surface-variant">
                  <span className="material-symbols-outlined animate-spin text-3xl text-primary">sync</span>
                  <span className="text-xs">جاري تحميل قائمة الخدمات والمجموعات من الموقع...</span>
                </div>
              ) : (
                <>
                  {siteGroups
                    .filter((g) =>
                      !pickerSearch || g.name.toLowerCase().includes(pickerSearch.toLowerCase())
                    )
                    .map((group) => (
                      <div
                        key={group.name}
                        className="pt-2.5 first:pt-0 flex items-center justify-between gap-4 hover:bg-surface-container-high/40 p-3 rounded-2xl transition-colors"
                      >
                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-on-surface text-sm truncate">{group.name}</h4>
                          <div className="flex items-center gap-3 mt-1 text-xs text-on-surface-variant flex-wrap">
                            <span>{group.count} خدمات فرعية</span>
                            {group.minPrice > 0 && (
                              <span className="text-emerald-400 font-mono font-bold">
                                يبدأ من ${group.minPrice.toFixed(2)}
                              </span>
                            )}
                            {group.time && <span>التسليم: {group.time}</span>}
                          </div>
                        </div>

                        <button
                          onClick={() => selectServiceForPackage(group)}
                          className="btn-primary text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shrink-0"
                        >
                          <span className="material-symbols-outlined text-sm">check</span>
                          تحديد هذه الباقة
                        </button>
                      </div>
                    ))}

                  {siteGroups.filter((g) =>
                    !pickerSearch || g.name.toLowerCase().includes(pickerSearch.toLowerCase())
                  ).length === 0 && (
                    <div className="text-center py-12 text-on-surface-variant text-sm">
                      لا توجد خدمات مطابقة لبحثك.
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-outline-variant/20 bg-surface-container-low flex justify-between items-center text-xs text-on-surface-variant">
              <span>إجمالي المجموعات والخدمات المتاحة: {siteGroups.length}</span>
              <button
                onClick={() => {
                  setShowPickerModal(false);
                  setPickerTargetIndex(null);
                }}
                className="btn-secondary text-xs px-4 py-2 rounded-xl"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
