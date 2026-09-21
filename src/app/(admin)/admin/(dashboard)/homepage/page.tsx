"use client";

import { useState, useEffect } from "react";
import CampaignBanner from "@/components/CampaignBanner";

// Preset icon suggestions for quick picking
const PRESET_ICONS = [
  { label: "Chimera", url: "/images/tools/tool_chimera.png" },
  { label: "UnlockTool", url: "/images/tools/tool_unlocktool.png" },
  { label: "Borneo", url: "/images/tools/tool_borneo.png" },
  { label: "iRemoval", url: "/images/tools/tool_iremoval.png" },
  { label: "DFT Pro", url: "/images/tools/tool_dft.png" },
  { label: "MobileSea", url: "/images/tools/tool_mobilesea.png" },
  { label: "AMT", url: "/images/tools/tool_amt.png" },
  { label: "Phoenix", url: "/images/tools/tool_phoenix.png" },
  { label: "Cheetah", url: "/images/tools/tool_cheetah.png" },
  { label: "FKey", url: "/images/tools/tool_fkey.png" },
  { label: "Samsung", url: "/images/promo_samsung_clean.png" },
  { label: "Gift Box", url: "/images/promo_gift_box_clean.png" }
];

// Preset high-resolution graphics for campaign offers
const PRESET_CAMPAIGN_IMAGES = [
  { label: "Samsung FRP", url: "/images/promo_samsung_clean.png" },
  { label: "Gift Box", url: "/images/promo_gift_box_clean.png" },
  { label: "Chimera Tool", url: "/images/promo_chimera.png" },
  { label: "Borneo Schematics", url: "/images/promo_borneo.png" },
  { label: "Server Rack", url: "/images/promo_server.png" },
  { label: "Tools Store", url: "/images/promo_store.png" },
  { label: "IMEI Unlock", url: "/images/promo_imei.png" },
  { label: "Remote Support", url: "/images/promo_remote.png" }
];

// Default 4 Modern Animated Campaigns
const DEFAULT_CAMPAIGNS = [
  {
    id: "samsung_frp",
    tagEn: "Limited Time Offer",
    tagAr: "عرض حصري لفترة محدودة",
    titleEn: "Samsung FRP Remove",
    titleAr: "حذف حساب سامسونج FRP الفوري",
    descEn: "Instant removal for all Samsung models via direct official server API.",
    descAr: "فك فوري وتلقائي لجميع طرازات سامسونج عبر السيرفر الرسمي بأعلى سرعة وأمان.",
    badgeEn: "Direct API Link",
    badgeAr: "ربط سيرفر مباشر",
    turnaroundEn: "1 - 5 Mins",
    turnaroundAr: "1 - 5 دقائق",
    guaranteeEn: "100% REFUND",
    guaranteeAr: "ضمان مالي 100%",
    connectionEn: "DIRECT API",
    connectionAr: "ربط فوري API",
    theme: "purple",
    image: "/images/promo_samsung_clean.png",
    url: "/pricing?search=Samsung",
    buttonTextEn: "Order & Activate Now",
    buttonTextAr: "اطلب الآن وابدأ التفعيل"
  },
  {
    id: "reseller_bundles",
    tagEn: "Official Reseller",
    tagAr: "موزع رسمي معتمد",
    titleEn: "Official Reseller Campaigns",
    titleAr: "عروض وحملات الموزعين الرسمية",
    descEn: "Best wholesale rates, instant activations, and full warranty on tools.",
    descAr: "أفضل أسعار الجملة المعتمدة، إصدارات جديدة، وتفعيل فوري مع ضمان كامل.",
    badgeEn: "Full Warranty",
    badgeAr: "ضمان معتمد كامل",
    turnaroundEn: "Instant Delivery",
    turnaroundAr: "تسليم فوري 24/7",
    guaranteeEn: "100% Guaranteed",
    guaranteeAr: "ضمان رسمي كامل",
    connectionEn: "AUTO SERVER",
    connectionAr: "سيرفر مؤتمت",
    theme: "cyan",
    image: "/images/promo_gift_box_clean.png",
    url: "/pricing",
    buttonTextEn: "View All Offers",
    buttonTextAr: "عرض جميع العروض"
  },
  {
    id: "chimera_tool",
    tagEn: "Best Seller Tool",
    tagAr: "الأداة الأكثر طلباً",
    titleEn: "Chimera Tool Pro",
    titleAr: "أداة شيميرا (Chimera Tool)",
    descEn: "All Brands and Samsung activations with instant server token generation.",
    descAr: "تراخيص سنوية وتعبئة أرصدة شيميرا بأسعار منافسة وتسليم فوري خلال دقيقة.",
    badgeEn: "Instant License",
    badgeAr: "ترخيص فوري مباشر",
    turnaroundEn: "Under 1 Min",
    turnaroundAr: "أقل من دقيقة",
    guaranteeEn: "100% REFUND",
    guaranteeAr: "ضمان استرجاع 100%",
    connectionEn: "GSM SERVER",
    connectionAr: "سيرفر رسمي",
    theme: "blue",
    image: "/images/promo_chimera.png",
    url: "/pricing?section=Chimera%20Tool",
    buttonTextEn: "Get Chimera License",
    buttonTextAr: "احصل على ترخيص شيميرا"
  },
  {
    id: "borneo_schematics",
    tagEn: "Hardware Diagnostics",
    tagAr: "مخططات الهاردوير",
    titleEn: "Borneo Schematics",
    titleAr: "مخططات بورنيو (Borneo)",
    descEn: "Official activation codes for 1-PC and 2-PC with instant daily updates.",
    descAr: "تفعيل رسمي لمخططات بورنيو مع تحديثات يومية ودعم لجميع اللوحات الإلكترونية.",
    badgeEn: "Daily Updates",
    badgeAr: "تحديثات يومية متواصلة",
    turnaroundEn: "Instant 24/7",
    turnaroundAr: "فوري على مدار الساعة",
    guaranteeEn: "Official Code",
    guaranteeAr: "كود تفعيل أصلي",
    connectionEn: "OFFICIAL DB",
    connectionAr: "قاعدة بيانات رسمية",
    theme: "emerald",
    image: "/images/promo_borneo.png",
    url: "/pricing?search=Borneo",
    buttonTextEn: "Activate Borneo",
    buttonTextAr: "تفعيل باقة بورنيو"
  }
];

// Default 3 Featured Packages matching the production homepage
const DEFAULT_FEATURED_PACKAGES = [
  {
    id: "chimera",
    nameAr: "Chimera Tool",
    nameEn: "Chimera Tool",
    subAr: "Activation / Credits",
    subEn: "Activation / Credits",
    badgeAr: "Best Seller",
    badgeEn: "Best Seller",
    isPopular: true,
    startingPrice: "$106.59",
    categoryAr: "Official",
    categoryEn: "Official",
    deliveryTimeAr: "فوري 24/7",
    deliveryTimeEn: "Instant 24/7",
    iconName: "build",
    image: "/images/tools/tool_chimera.png",
    url: "/pricing?section=Chimera%20Tool",
    featuresAr: [
      "تراخيص Chimera Basic و Samsung و All Brands Pro",
      "فك شبكات وتصليح السيريال وإصلاح IMEI وتعديل الموديل",
      "تفعيل رسمي مباشر على حساب المستخدم خلال دقيقة",
      "تحديثات متواصلة لدعم أحدث إصدارات الأندرويد"
    ],
    featuresEn: [
      "Chimera Basic, Samsung, and All Brands Pro licenses",
      "Carrier unlock, serial repair, and network patching",
      "Official 1-minute automated account activation",
      "Continuous support for latest Android security patches"
    ]
  },
  {
    id: "amt",
    nameAr: "Android Multi Tool",
    nameEn: "Android Multi Tool",
    subAr: "AMT Credits",
    subEn: "AMT Credits",
    badgeAr: "Popular",
    badgeEn: "Popular",
    isPopular: false,
    startingPrice: "$0.92",
    categoryAr: "Instant",
    categoryEn: "Instant",
    deliveryTimeAr: "فوري 24/7",
    deliveryTimeEn: "Instant 24/7",
    iconName: "bolt",
    image: "/images/tools/tool_amt.png",
    url: "/pricing?section=Android%20Multi%20Tool",
    featuresAr: [
      "دعم كامل لهواتف VIVO و XIAOMI و TECNO و INFINIX",
      "عمليات FRP وتخطي حسابات وحذف الديمو (Demo Removal)",
      "شحن فوري بالكريدت مباشرة إلى اسم المستخدم لحسابك",
      "لا يحتاج إلى بوكس أو دونجل خارجي للعمل"
    ],
    featuresEn: [
      "Full support for Vivo, Xiaomi, Tecno & Infinix",
      "One-click FRP bypass, factory reset, and demo removal",
      "Instant credit top-up directly to your username",
      "No hardware box or dongle required to run"
    ]
  },
  {
    id: "xiaomi",
    nameAr: "Xiaomi Remove Account",
    nameEn: "Xiaomi Remove Account",
    subAr: "",
    subEn: "",
    badgeAr: "Official",
    badgeEn: "Official",
    isPopular: false,
    startingPrice: "$3.41",
    categoryAr: "Fast Service",
    categoryEn: "Fast Service",
    deliveryTimeAr: "1 - 12 ساعة",
    deliveryTimeEn: "1 - 12 Hours",
    iconName: "smartphone",
    image: "",
    url: "/pricing?section=Xiaomi%20Remove%20Account",
    featuresAr: [
      "حذف دائم ونظيف من سيرفر شاومي الرسمي (Clean IMEI)",
      "دعم الأجهزة من جميع دول العالم (Worldwide Support)",
      "إمكانية إعادة ضبط المصنع والتحديث بعد الحذف بأمان",
      "تنفيذ تلقائي عبر الـ API مع استرجاع الرصيد في حال الرفض"
    ],
    featuresEn: [
      "Permanent clean removal from official Xiaomi servers",
      "Worldwide device support across all regions",
      "Safe factory reset and OTA updates after completion",
      "Automated API execution with full refund protection"
    ]
  }
];

// Default 10 Supported Tools matching the production homepage
const DEFAULT_SUPPORTED_TOOLS = [
  { id: "chimera", name: "Chimera", url: "/pricing?search=Chimera", image: "/images/tools/tool_chimera.png" },
  { id: "unlocktool", name: "UnlockTool", url: "/pricing?search=UnlockTool", image: "/images/tools/tool_unlocktool.png" },
  { id: "borneo", name: "Borneo", url: "/pricing?search=Borneo", image: "/images/tools/tool_borneo.png" },
  { id: "iremoval", name: "iRemoval Pro", url: "/pricing?search=iRemoval%20Pro", image: "/images/tools/tool_iremoval.png" },
  { id: "dft", name: "DFT Pro", url: "/pricing?search=DFT%20Pro", image: "/images/tools/tool_dft.png" },
  { id: "mobilesea", name: "MobileSea Tool", url: "/pricing?search=MobileSea%20Tool", image: "/images/tools/tool_mobilesea.png" },
  { id: "amt", name: "AMT", url: "/pricing?search=AMT", image: "/images/tools/tool_amt.png" },
  { id: "phoenix", name: "Phoenix", url: "/pricing?search=Phoenix", image: "/images/tools/tool_phoenix.png" },
  { id: "cheetah", name: "Cheetah", url: "/pricing?search=Cheetah", image: "/images/tools/tool_cheetah.png" },
  { id: "fkey", name: "FKey", url: "/pricing?search=FKey", image: "/images/tools/tool_fkey.png" }
];

// Reusable Image Picker Component with direct device file upload and auth header
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
  const [showPresets, setShowPresets] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        const token = typeof window !== "undefined" ? (localStorage.getItem("admin_token") || localStorage.getItem("token")) : null;

        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            ...(token ? { "Authorization": `Bearer ${token}`, "x-admin-token": token } : {})
          },
          body: JSON.stringify({ image: base64, filename: file.name })
        });

        if (res.ok) {
          const data = await res.json();
          if (data.url) {
            onChange(data.url);
          }
        } else {
          const errData = await res.json().catch(() => ({}));
          alert(errData.error || "فشل رفع الصورة على السيرفر، يرجى التأكد من تسجيل الدخول.");
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
    <div className="flex flex-col gap-2 p-3.5 bg-surface-container-low rounded-2xl border border-outline-variant/30">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase text-on-surface-variant flex items-center gap-1.5">
          <span className="material-symbols-outlined text-sm text-primary">image</span>
          <span>{label}</span>
        </label>
        <button
          type="button"
          onClick={() => setShowPresets(!showPresets)}
          className="text-[11px] text-primary hover:underline flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-xs">auto_awesome</span>
          <span>{showPresets ? "إخفاء الأيقونات الجاهزة" : "اختيار أيقونة جاهزة"}</span>
        </button>
      </div>

      {/* Preset Icons Selection */}
      {showPresets && (
        <div className="p-2.5 bg-surface-container-lowest rounded-xl border border-outline-variant/20 flex flex-wrap gap-2 animate-in fade-in">
          {PRESET_ICONS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => {
                onChange(preset.url);
                setShowPresets(false);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-surface-container hover:bg-primary/20 hover:text-primary text-xs border border-outline-variant/20 transition-colors"
            >
              <img src={preset.url} alt={preset.label} className="w-4 h-4 object-contain rounded" />
              <span>{preset.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Image Preview Box */}
      {value && (
        <div className="relative w-full max-h-[140px] rounded-xl overflow-hidden bg-black/40 border border-outline-variant/20 flex items-center justify-center p-2 group">
          <img src={value} alt="Preview" className="max-h-[120px] object-contain rounded-lg" />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <span className="text-[10px] text-white font-mono break-all px-3 text-center">{value}</span>
            <button
              type="button"
              onClick={() => onChange("")}
              className="bg-error/80 hover:bg-error text-white p-1.5 rounded-lg text-xs flex items-center"
              title="إزالة الصورة"
            >
              <span className="material-symbols-outlined text-sm">delete</span>
            </button>
          </div>
        </div>
      )}

      {/* Inputs: URL + Upload Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <input
          type="text"
          placeholder="رابط الصورة (URL) أو ارفع من جهازك..."
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-2.5 text-xs text-on-surface font-mono"
        />

        <label className="btn-secondary py-2 px-3.5 rounded-xl text-xs font-bold cursor-pointer shrink-0 flex items-center justify-center gap-1.5 hover:border-primary">
          <span className="material-symbols-outlined text-base">{uploading ? "sync" : "upload_file"}</span>
          <span>{uploading ? "جاري الرفع..." : "رفع من جهازك"}</span>
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
  // Default to the requested controls tab
  const [activeTab, setActiveTab] = useState<string>("packages");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [previewLang, setPreviewLang] = useState<"ar" | "en">("ar");

  // Service picker modal states
  const [siteItems, setSiteItems] = useState<Array<{ name: string; minPrice: number; count: number; time: string; categoryName: string }>>([]);
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

          // Normalization: Ensure campaigns is an array
          let campaignsArray = Array.isArray(data.campaigns) ? data.campaigns : [];
          if (campaignsArray.length === 0 && data.campaigns && typeof data.campaigns === "object") {
            const c = data.campaigns;
            if (c.promo1Image || c.promo1TitleAr || c.promo1TitleEn) {
              campaignsArray.push({
                tagEn: c.promo1TagEn || "Limited Time Offer",
                tagAr: c.promo1TagAr || "عرض حصري",
                titleEn: c.promo1TitleEn || "Samsung FRP Remove",
                titleAr: c.promo1TitleAr || "حذف حساب سامسونج FRP",
                descEn: c.promo1DescEn || "",
                descAr: c.promo1DescAr || "",
                image: c.promo1Image || "/images/promo_samsung_clean.png",
                url: c.promo1Url || "/pricing"
              });
            }
          }
          if (campaignsArray.length === 0) {
            campaignsArray = DEFAULT_CAMPAIGNS;
          }
          data.campaigns = campaignsArray;

          // Normalization: Ensure featuredPackages has at least default 3 cards
          if (!Array.isArray(data.featuredPackages) || data.featuredPackages.length === 0) {
            data.featuredPackages = DEFAULT_FEATURED_PACKAGES;
          }

          // Normalization: Ensure supportedTools has default 10 tools
          if (!Array.isArray(data.supportedTools) || data.supportedTools.length === 0) {
            data.supportedTools = DEFAULT_SUPPORTED_TOOLS;
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

  // Fetch site services and groups for the package & tool picker
  useEffect(() => {
    async function fetchSiteServices() {
      try {
        setLoadingServices(true);
        const res = await fetch("/api/dhru/services?view=pricing");
        if (res.ok) {
          const categories = await res.json();
          const itemMap = new Map<string, { name: string; minPrice: number; count: number; time: string; categoryName: string }>();

          if (Array.isArray(categories)) {
            for (const cat of categories) {
              const services = Array.isArray(cat.dhruServices) 
                ? cat.dhruServices 
                : (Array.isArray(cat.services) ? cat.services : []);

              for (const s of services) {
                const group = (s.groupName || s.name || "").trim();
                if (!group) continue;
                const credit = typeof s.credit === "number" ? s.credit : 0;
                const existing = itemMap.get(group);

                if (!existing) {
                  itemMap.set(group, {
                    name: group,
                    minPrice: credit,
                    count: 1,
                    time: s.time || "",
                    categoryName: cat.name || ""
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

          const sorted = Array.from(itemMap.values()).sort((a, b) => a.name.localeCompare(b.name));
          setSiteItems(sorted);
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
        setToastMessage("تم حفظ وتطبيق تعديلات الصفحة الرئيسية بنجاح!");
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

  // -------------------------------------------------------------
  // Package Management Handlers
  // -------------------------------------------------------------
  const addPackage = () => {
    setConfig((prev: any) => {
      const pkgs = Array.isArray(prev.featuredPackages) ? [...prev.featuredPackages] : [];
      pkgs.push({
        id: `pkg_${Date.now()}`,
        nameAr: "باقة جديدة",
        nameEn: "New Package",
        subAr: "",
        subEn: "",
        badgeAr: "متاح الآن",
        badgeEn: "Available",
        isPopular: false,
        startingPrice: "$1.00",
        categoryAr: "سيرفر رسمي",
        categoryEn: "Official",
        deliveryTimeAr: "فوري 24/7",
        deliveryTimeEn: "Instant 24/7",
        iconName: "inventory_2",
        image: "",
        url: "/pricing",
        featuresAr: ["تفعيل فوري تلقائي", "دعم كامل ومباشر"],
        featuresEn: ["Instant automated delivery", "Full direct support"]
      });
      return { ...prev, featuredPackages: pkgs };
    });
  };

  const removePackage = (index: number) => {
    if (!confirm("هل أنت متأكد من حذف هذه الباقة؟")) return;
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

  const selectServiceForPackage = (item: { name: string; minPrice: number; time: string; categoryName: string }) => {
    const formattedPrice = item.minPrice > 0 ? `$${item.minPrice.toFixed(2)}` : "$0.99";

    // Auto-detect image from preset list if matching
    const matchingPreset = PRESET_ICONS.find(p => item.name.toLowerCase().includes(p.label.toLowerCase()));
    const autoImage = matchingPreset ? matchingPreset.url : "";

    setConfig((prev: any) => {
      const pkgs = Array.isArray(prev.featuredPackages) ? [...prev.featuredPackages] : [];
      if (pickerTargetIndex !== null && pkgs[pickerTargetIndex]) {
        pkgs[pickerTargetIndex] = {
          ...pkgs[pickerTargetIndex],
          nameAr: item.name,
          nameEn: item.name,
          subAr: item.categoryName || item.name,
          subEn: item.categoryName || item.name,
          startingPrice: formattedPrice,
          categoryAr: item.categoryName || "سيرفر رسمي",
          categoryEn: item.categoryName || "Official Server",
          deliveryTimeAr: item.time || "فوري 24/7",
          deliveryTimeEn: item.time || "Instant 24/7",
          image: pkgs[pickerTargetIndex].image || autoImage,
          url: `/pricing?section=${encodeURIComponent(item.name)}`
        };
      } else {
        pkgs.push({
          id: `pkg_${Date.now()}`,
          nameAr: item.name,
          nameEn: item.name,
          subAr: item.categoryName || item.name,
          subEn: item.categoryName || item.name,
          badgeAr: "الأكثر طلباً",
          badgeEn: "Best Seller",
          isPopular: false,
          startingPrice: formattedPrice,
          categoryAr: item.categoryName || "سيرفر رسمي",
          categoryEn: item.categoryName || "Official Server",
          deliveryTimeAr: item.time || "فوري 24/7",
          deliveryTimeEn: item.time || "Instant 24/7",
          iconName: "bolt",
          image: autoImage,
          url: `/pricing?section=${encodeURIComponent(item.name)}`,
          featuresAr: [
            `خدمة ${item.name} المعتمدة`,
            "تنفيذ تلقائي وفوري عبر السيرفر",
            "ضمان استرجاع الرصيد في حال عدم الإنجاز"
          ],
          featuresEn: [
            `Official ${item.name} service`,
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

  const resetDefaultPackages = () => {
    if (!confirm("هل أنت متأكد من استعادة الباقات الـ 3 الافتراضية (Chimera, AMT, Xiaomi)؟")) return;
    setConfig((prev: any) => ({
      ...prev,
      featuredPackages: DEFAULT_FEATURED_PACKAGES
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

  // -------------------------------------------------------------
  // Supported Tools Handlers
  // -------------------------------------------------------------
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

  const addToolFromItem = (itemName: string) => {
    const matchingPreset = PRESET_ICONS.find(p => itemName.toLowerCase().includes(p.label.toLowerCase()));
    setConfig((prev: any) => {
      const tools = Array.isArray(prev.supportedTools) ? [...prev.supportedTools] : [];
      tools.push({
        id: `tool_${Date.now()}`,
        name: itemName,
        url: `/pricing?search=${encodeURIComponent(itemName)}`,
        image: matchingPreset ? matchingPreset.url : ""
      });
      return { ...prev, supportedTools: tools };
    });
  };

  const removeTool = (index: number) => {
    if (!confirm("هل أنت متأكد من حذف هذه الأداة من الشريط؟")) return;
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
    if (!confirm("هل أنت متأكد من استعادة قائمة الـ 10 أدوات الافتراضية بصورها الرسمية؟")) return;
    setConfig((prev: any) => ({
      ...prev,
      supportedTools: DEFAULT_SUPPORTED_TOOLS
    }));
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
          <h1 className="text-3xl font-display font-bold text-on-surface">إدارة وتخصيص الصفحة الرئيسية</h1>
          <p className="text-on-surface-variant text-sm mt-1">
            تحكم كامل وسهل في بطاقات الباقات المميزة، شريط الأدوات المدعومة، العروض، وكافة الصور مع إمكانية الرفع المباشر من جهازك.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary flex items-center gap-2 shadow-lg disabled:opacity-50 px-6 py-3 text-sm font-bold rounded-xl shrink-0"
        >
          <span className="material-symbols-outlined text-lg">{saving ? "sync" : "save"}</span>
          <span>{saving ? "جاري الحفظ..." : "حفظ والتطبيق المباشر"}</span>
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-outline-variant/20 pb-3">
        <button
          onClick={() => setActiveTab("packages")}
          className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 border ${
            activeTab === "packages" 
              ? "bg-primary text-surface border-primary shadow-md" 
              : "bg-surface-container text-on-surface hover:bg-surface-container-high border-outline-variant/30"
          }`}
        >
          <span className="material-symbols-outlined text-lg">package_2</span>
          1. بطاقات الباقات المميزة (Featured Packages)
        </button>

        <button
          onClick={() => setActiveTab("tools")}
          className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 border ${
            activeTab === "tools" 
              ? "bg-primary text-surface border-primary shadow-md" 
              : "bg-surface-container text-on-surface hover:bg-surface-container-high border-outline-variant/30"
          }`}
        >
          <span className="material-symbols-outlined text-lg">construction</span>
          2. أبرز الأدوات المدعومة (Supported Tools Bar)
        </button>

        <button
          onClick={() => setActiveTab("campaigns")}
          className={`px-4 py-2.5 rounded-xl font-medium text-sm transition-all flex items-center gap-2 ${
            activeTab === "campaigns" ? "bg-primary text-surface font-bold shadow-md" : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
          }`}
        >
          <span className="material-symbols-outlined text-lg">local_fire_department</span>
          3. بنرات وعروض الترويج (Campaign Offers)
        </button>
      </div>

      {/* ============================================================= */}
      {/* TAB 1: FEATURED PACKAGES (الكروت الثلاثة)                      */}
      {/* ============================================================= */}
      {activeTab === "packages" && (
        <div className="glass-card rounded-3xl p-6 md:p-8 border border-outline-variant/30 flex flex-col gap-8">
          <div className="border-b border-outline-variant/20 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-primary flex items-center gap-2">
                <span className="material-symbols-outlined">package_2</span>
                بطاقات الباقات الأكثر طلباً (Featured Packages)
              </h2>
              <p className="text-xs text-on-surface-variant mt-1">
                تحكم كامل في الكروت المعروضة على الواجهة (مثل Chimera و AMT و Xiaomi). يمكنك اختيار الباقة مباشرة من خدمات الموقع ورفع صورة مخصصة لها.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  setPickerTargetIndex(null);
                  setShowPickerModal(true);
                }}
                className="btn-primary text-xs px-4 py-2.5 flex items-center gap-1.5 rounded-xl shrink-0 shadow-md font-bold"
              >
                <span className="material-symbols-outlined text-sm">hub</span>
                اختيار باقة من خدمات الموقع
              </button>
              <button
                type="button"
                onClick={addPackage}
                className="btn-secondary text-xs px-3.5 py-2.5 flex items-center gap-1.5 rounded-xl shrink-0"
              >
                <span className="material-symbols-outlined text-sm">add</span>
                إضافة باقة يدوية
              </button>
              <button
                type="button"
                onClick={resetDefaultPackages}
                className="text-xs px-3 py-2 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant border border-outline-variant/30 flex items-center gap-1"
                title="استعادة الباقات الـ 3 الافتراضية"
              >
                <span className="material-symbols-outlined text-xs">restart_alt</span>
                استعادة الافتراضي
              </button>
            </div>
          </div>

          {/* Live Visual Preview of Cards */}
          <div className="p-4 sm:p-6 bg-surface-container-lowest/80 rounded-2xl border border-primary/20 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">visibility</span>
                معاينة حية لشكل الكروت بالواجهة الرئيسية:
              </span>
              <span className="text-[10px] text-on-surface-variant font-mono">
                عدد الباقات: {config.featuredPackages?.length || 0}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 mt-1">
              {Array.isArray(config.featuredPackages) && config.featuredPackages.map((pkg: any, idx: number) => (
                <div 
                  key={pkg.id || idx}
                  className="p-3.5 sm:p-4 rounded-2xl bg-surface-container border border-outline-variant/30 flex flex-col justify-between shadow-xs"
                >
                  <div className="flex items-start gap-3">
                    {/* Logo preview */}
                    <div className="w-12 h-12 rounded-xl bg-surface-container-high border border-outline-variant/30 flex items-center justify-center shrink-0 overflow-hidden">
                      {pkg.image ? (
                        <img src={pkg.image} alt={pkg.nameAr} className="w-full h-full object-contain p-1" />
                      ) : (
                        <span className="material-symbols-outlined text-primary text-xl">
                          {pkg.iconName || "inventory_2"}
                        </span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-on-surface text-sm truncate">{pkg.nameAr || "اسم الباقة"}</h4>
                      <span className="text-[10px] text-on-surface-variant block truncate">{pkg.subAr || pkg.nameEn || "وصف فرعي"}</span>
                      <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                        {pkg.badgeAr && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[9px] font-bold">
                            {pkg.badgeAr}
                          </span>
                        )}
                        {pkg.categoryAr && (
                          <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 text-[9px]">
                            {pkg.categoryAr}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 mt-3 border-t border-outline-variant/20 flex items-center justify-between">
                    <div>
                      <span className="text-base font-black text-primary font-mono">{pkg.startingPrice || "$0.00"}</span>
                      <span className="text-[9px] text-on-surface-variant block">يبدأ من</span>
                    </div>
                    <span className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold text-xs">
                      اطلب الآن
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cards Editor List */}
          <div className="flex flex-col gap-6">
            {Array.isArray(config.featuredPackages) && config.featuredPackages.map((pkg: any, idx: number) => (
              <div 
                key={pkg.id || idx} 
                className="p-5 bg-surface-container-low rounded-2xl border border-outline-variant/30 flex flex-col gap-5 relative shadow-xs"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-outline-variant/20 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="bg-primary/20 text-primary font-bold px-2.5 py-0.5 rounded-lg text-xs font-mono">
                      باقة #{idx + 1}
                    </span>
                    <h3 className="font-bold text-on-surface text-base">
                      {pkg.nameAr || "باقة جديدة"}
                    </h3>
                    {pkg.isPopular && (
                      <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-full font-bold">
                        الأكثر طلباً
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => {
                        setPickerTargetIndex(idx);
                        setShowPickerModal(true);
                      }}
                      className="text-xs bg-primary/10 hover:bg-primary/20 text-primary px-3 py-1.5 rounded-xl border border-primary/30 flex items-center gap-1.5 transition-all font-bold"
                    >
                      <span className="material-symbols-outlined text-sm">hub</span>
                      ربط بخدمة من الموقع
                    </button>
                    <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-on-surface-variant px-2 py-1 bg-surface-container rounded-lg">
                      <input
                        type="checkbox"
                        checked={Boolean(pkg.isPopular)}
                        onChange={(e) => updatePackageField(idx, "isPopular", e.target.checked)}
                        className="w-4 h-4 accent-primary"
                      />
                      الأكثر طلباً
                    </label>
                    <button
                      type="button"
                      onClick={() => removePackage(idx)}
                      className="text-error hover:bg-error/10 p-1.5 rounded-lg transition-colors"
                      title="حذف الباقة"
                    >
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  </div>
                </div>

                {/* Package Image Picker */}
                <ImagePickerInput
                  label={`صورة أو شعار الباقة #${idx + 1} (يمكنك الرفع من جهازك)`}
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
                      className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-2.5 text-sm font-bold text-on-surface"
                      placeholder="مثال: Chimera Tool"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-on-surface-variant uppercase font-bold">الاسم (بالإنجليزية)</label>
                    <input
                      type="text"
                      value={pkg.nameEn || ""}
                      onChange={(e) => updatePackageField(idx, "nameEn", e.target.value)}
                      className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-2.5 text-sm font-bold text-on-surface"
                      placeholder="e.g. Chimera Tool"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-on-surface-variant uppercase font-bold">العنوان الفرعي (بالعربية)</label>
                    <input
                      type="text"
                      value={pkg.subAr || ""}
                      onChange={(e) => updatePackageField(idx, "subAr", e.target.value)}
                      className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-2.5 text-xs text-on-surface-variant"
                      placeholder="مثال: Activation / Credits"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-on-surface-variant uppercase font-bold">العنوان الفرعي (بالإنجليزية)</label>
                    <input
                      type="text"
                      value={pkg.subEn || ""}
                      onChange={(e) => updatePackageField(idx, "subEn", e.target.value)}
                      className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-2.5 text-xs text-on-surface-variant"
                      placeholder="e.g. Activation / Credits"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-amber-400 uppercase font-bold">الشارة / البادج (بالعربية)</label>
                    <input
                      type="text"
                      placeholder="مثال: Best Seller أو الأكثر طلباً"
                      value={pkg.badgeAr || ""}
                      onChange={(e) => updatePackageField(idx, "badgeAr", e.target.value)}
                      className="bg-surface-container-lowest border border-amber-400/30 rounded-xl p-2.5 text-xs text-amber-300 font-bold"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-amber-400 uppercase font-bold">الشارة / البادج (بالإنجليزية)</label>
                    <input
                      type="text"
                      placeholder="e.g. Best Seller"
                      value={pkg.badgeEn || ""}
                      onChange={(e) => updatePackageField(idx, "badgeEn", e.target.value)}
                      className="bg-surface-container-lowest border border-amber-400/30 rounded-xl p-2.5 text-xs text-amber-300 font-bold"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-emerald-400 uppercase font-bold">السعر المبدئي (مثال: $106.59)</label>
                    <input
                      type="text"
                      placeholder="$106.59"
                      value={pkg.startingPrice || ""}
                      onChange={(e) => updatePackageField(idx, "startingPrice", e.target.value)}
                      className="bg-surface-container-lowest border border-emerald-400/30 rounded-xl p-2.5 text-sm font-mono text-emerald-400 font-bold"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-primary uppercase font-bold">رابط التوجيه (URL)</label>
                    <input
                      type="text"
                      placeholder="/pricing?section=Chimera%20Tool"
                      value={pkg.url || "/pricing"}
                      onChange={(e) => updatePackageField(idx, "url", e.target.value)}
                      className="bg-surface-container-lowest border border-primary/40 rounded-xl p-2.5 text-xs font-mono text-primary"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-on-surface-variant uppercase font-bold">الفئة (بالعربية)</label>
                    <input
                      type="text"
                      value={pkg.categoryAr || ""}
                      onChange={(e) => updatePackageField(idx, "categoryAr", e.target.value)}
                      className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-2.5 text-xs text-on-surface"
                      placeholder="مثال: Official أو سيرفر معتمد"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-on-surface-variant uppercase font-bold">الفئة (بالإنجليزية)</label>
                    <input
                      type="text"
                      value={pkg.categoryEn || ""}
                      onChange={(e) => updatePackageField(idx, "categoryEn", e.target.value)}
                      className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-2.5 text-xs text-on-surface"
                      placeholder="e.g. Official Server"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-on-surface-variant uppercase font-bold">وقت التسليم (بالعربية)</label>
                    <input
                      type="text"
                      value={pkg.deliveryTimeAr || ""}
                      onChange={(e) => updatePackageField(idx, "deliveryTimeAr", e.target.value)}
                      className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-2.5 text-xs text-on-surface"
                      placeholder="مثال: فوري 24/7 أو 1 - 12 ساعة"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-on-surface-variant uppercase font-bold">وقت التسليم (بالإنجليزية)</label>
                    <input
                      type="text"
                      value={pkg.deliveryTimeEn || ""}
                      onChange={(e) => updatePackageField(idx, "deliveryTimeEn", e.target.value)}
                      className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-2.5 text-xs text-on-surface"
                      placeholder="e.g. Instant 24/7"
                    />
                  </div>
                </div>

                {/* Features (المميزات) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-3 border-t border-outline-variant/15">
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-on-surface-variant uppercase">المميزات (بالعربية)</label>
                      <button
                        type="button"
                        onClick={() => addPackageFeature(idx, "featuresAr")}
                        className="text-[11px] text-primary hover:underline flex items-center gap-1 font-bold"
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
                          className="flex-1 bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-2 text-xs text-on-surface"
                          placeholder={`الميزة ${fIdx + 1}`}
                        />
                        <button
                          type="button"
                          onClick={() => removePackageFeature(idx, "featuresAr", fIdx)}
                          className="text-error p-1 hover:bg-error/10 rounded-lg transition-colors"
                        >
                          <span className="material-symbols-outlined text-sm">close</span>
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-on-surface-variant uppercase">Features (English)</label>
                      <button
                        type="button"
                        onClick={() => addPackageFeature(idx, "featuresEn")}
                        className="text-[11px] text-primary hover:underline flex items-center gap-1 font-bold"
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
                          className="flex-1 bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-2 text-xs text-on-surface"
                          placeholder={`Feature ${fIdx + 1}`}
                        />
                        <button
                          type="button"
                          onClick={() => removePackageFeature(idx, "featuresEn", fIdx)}
                          className="text-error p-1 hover:bg-error/10 rounded-lg transition-colors"
                        >
                          <span className="material-symbols-outlined text-sm">close</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* TAB 2: SUPPORTED TOOLS BAR (شريط الأدوات المدعومة)            */}
      {/* ============================================================= */}
      {activeTab === "tools" && (
        <div className="glass-card rounded-3xl p-6 md:p-8 border border-outline-variant/30 flex flex-col gap-8">
          <div className="border-b border-outline-variant/20 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-primary flex items-center gap-2">
                <span className="material-symbols-outlined">construction</span>
                أبرز الأدوات المدعومة (Supported Tools Bar)
              </h2>
              <p className="text-xs text-on-surface-variant mt-1">
                التحكم في شريط الأدوات الظاهر أعلى الصفحة (Chimera, UnlockTool, Borneo, iRemoval, DFT, MobileSea, AMT...). يمكنك رفع صورة لكل أداة وتعديل رابطها أو إضافة أدوات جديدة.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={addTool}
                className="btn-primary text-xs px-4 py-2.5 flex items-center gap-1.5 rounded-xl shrink-0 shadow-md font-bold"
              >
                <span className="material-symbols-outlined text-sm">add</span> إضافة أداة جديدة
              </button>
              <button
                type="button"
                onClick={resetDefaultTools}
                className="btn-secondary text-xs px-3.5 py-2.5 flex items-center gap-1.5 rounded-xl shrink-0"
              >
                <span className="material-symbols-outlined text-sm">restart_alt</span> استعادة الأدوات الافتراضية
              </button>
            </div>
          </div>

          {/* Live Visual Preview of Supported Tools */}
          <div className="p-4 sm:p-6 bg-surface-container-lowest/80 rounded-2xl border border-primary/20 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">visibility</span>
                معاينة حية لشريط الأدوات بالواجهة الرئيسية:
              </span>
              <span className="text-[10px] text-on-surface-variant font-mono">
                العدد: {config.supportedTools?.length || 0} أدوات
              </span>
            </div>

            <div className="grid grid-cols-5 lg:grid-cols-10 gap-2 sm:gap-3 mt-1">
              {Array.isArray(config.supportedTools) && config.supportedTools.map((tool: any, idx: number) => (
                <div
                  key={tool.id || idx}
                  className="p-2 sm:p-2.5 rounded-xl bg-surface-container border border-outline-variant/30 flex flex-col items-center justify-center text-center shadow-xs"
                >
                  <div className="w-8 h-8 rounded-lg bg-surface-container-high border border-outline-variant/20 flex items-center justify-center overflow-hidden mb-1">
                    {tool.image ? (
                      <img src={tool.image} alt={tool.name} className="w-full h-full object-contain p-0.5" />
                    ) : (
                      <span className="material-symbols-outlined text-xs text-primary">build</span>
                    )}
                  </div>
                  <span className="text-[10px] sm:text-xs font-bold text-on-surface truncate w-full">
                    {tool.name || "أداة"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick-add from site service groups */}
          {siteItems.length > 0 && (
            <div className="p-4 bg-surface-container-low rounded-2xl border border-outline-variant/30 flex flex-col gap-2">
              <span className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm text-primary">add_circle</span>
                إضافة سريعة من مجموعات وأدوات الموقع المسجلة:
              </span>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto pr-1">
                {siteItems.slice(0, 30).map((item) => (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => addToolFromItem(item.name)}
                    className="text-xs px-2.5 py-1.5 rounded-lg bg-surface-container hover:bg-primary/20 hover:text-primary transition-colors border border-outline-variant/20 flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-xs">add</span>
                    <span className="truncate max-w-[150px]">{item.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tools List Editor */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.isArray(config.supportedTools) && config.supportedTools.map((tool: any, tIdx: number) => (
              <div
                key={tool.id || tIdx}
                className="p-4 bg-surface-container-low rounded-2xl border border-outline-variant/30 flex flex-col gap-3 relative shadow-xs"
              >
                {/* Header */}
                <div className="flex justify-between items-center">
                  <span className="font-bold text-on-surface text-sm flex items-center gap-2">
                    <span className="bg-primary/20 text-primary font-mono px-2 py-0.5 rounded text-xs">
                      #{tIdx + 1}
                    </span>
                    {tool.name || "أداة جديدة"}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => moveTool(tIdx, "up")}
                      disabled={tIdx === 0}
                      className="p-1.5 rounded-lg hover:bg-surface-container-high disabled:opacity-30 transition-colors"
                      title="تحريك لأعلى"
                    >
                      <span className="material-symbols-outlined text-sm">arrow_upward</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => moveTool(tIdx, "down")}
                      disabled={tIdx === config.supportedTools.length - 1}
                      className="p-1.5 rounded-lg hover:bg-surface-container-high disabled:opacity-30 transition-colors"
                      title="تحريك لأسفل"
                    >
                      <span className="material-symbols-outlined text-sm">arrow_downward</span>
                    </button>
                    <button
                      type="button"
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
                  label="أيقونة الأداة (رفع من جهازك أو اختيار أيقونة)"
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
                      className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-2 text-xs font-bold text-on-surface"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-primary uppercase font-bold">رابط التوجيه (URL)</label>
                    <input
                      type="text"
                      value={tool.url || ""}
                      onChange={(e) => updateToolField(tIdx, "url", e.target.value)}
                      placeholder={`/pricing?search=${encodeURIComponent(tool.name || "")}`}
                      className="bg-surface-container-lowest border border-primary/40 rounded-xl p-2 text-xs font-mono text-primary"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* TAB 3: CAMPAIGN OFFERS (العروض وبنرات الترويج)                 */}
      {/* ============================================================= */}
      {activeTab === "campaigns" && (
        <div className="glass-card rounded-3xl p-6 md:p-8 border border-outline-variant/30 flex flex-col gap-6">
          <div className="border-b border-outline-variant/20 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h2 className="text-xl font-bold text-primary flex items-center gap-2">
                <span className="material-symbols-outlined">local_fire_department</span>
                3. بنرات وعروض الترويج الساخنة (Campaign Offers)
              </h2>
              <p className="text-xs text-on-surface-variant mt-1">
                إدارة البنرات الإعلانية الترويجية التفاعلية مع دعم السلايدر المتحرك والتأثيرات الحديثة.
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setConfig((prev: any) => ({
                    ...prev,
                    campaigns: DEFAULT_CAMPAIGNS
                  }));
                  setToastMessage("تمت استعادة البنرات النموذجية الافتراضية بنجاح");
                  setTimeout(() => setToastMessage(null), 3000);
                }}
                className="btn-secondary text-xs px-3 py-2 rounded-xl flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-sm">restart_alt</span>
                استعادة البنرات النموذجية
              </button>

              <button
                type="button"
                onClick={() => {
                  setConfig((prev: any) => {
                    const campaigns = Array.isArray(prev.campaigns) ? [...prev.campaigns] : [];
                    campaigns.push({
                      id: `camp_${Date.now()}`,
                      tagEn: "Limited Time Offer",
                      tagAr: "عرض حصري لفترة محدودة",
                      titleEn: "New Service Promo",
                      titleAr: "عرض ترويجي جديد",
                      descEn: "Fast automated fulfillment with official server integration.",
                      descAr: "تنفيذ فوري وتلقائي عبر السيرفر الرسمي بأعلى كفاءة وأمان.",
                      badgeEn: "Direct API Link",
                      badgeAr: "ربط سيرفر مباشر",
                      turnaroundEn: "1 - 5 Mins",
                      turnaroundAr: "1 - 5 دقائق",
                      guaranteeEn: "100% REFUND",
                      guaranteeAr: "ضمان مالي 100%",
                      connectionEn: "DIRECT API",
                      connectionAr: "ربط فوري API",
                      theme: "purple",
                      image: "/images/promo_samsung_clean.png",
                      url: "/pricing",
                      buttonTextEn: "Order & Activate Now",
                      buttonTextAr: "اطلب الآن وابدأ التفعيل"
                    });
                    return { ...prev, campaigns };
                  });
                }}
                className="btn-primary text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-sm">add</span>
                إضافة إعلان جديد
              </button>
            </div>
          </div>

          {/* Live Interactive Animated Preview Box */}
          <div className="rounded-2xl p-4 sm:p-5 bg-surface-container-lowest border border-outline-variant/30 flex flex-col gap-3 shadow-inner">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-outline-variant/20 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary" />
                </span>
                <span className="text-xs font-bold text-on-surface">معاينة حية ومتحركة على الموقع (Live Interactive Preview)</span>
              </div>

              <div className="flex items-center gap-1 bg-surface-container p-1 rounded-xl border border-outline-variant/20">
                <button
                  type="button"
                  onClick={() => setPreviewLang("ar")}
                  className={`text-[11px] px-2.5 py-1 rounded-lg font-bold transition-all ${
                    previewLang === "ar"
                      ? "bg-primary text-on-primary shadow-xs"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  العربية (RTL)
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewLang("en")}
                  className={`text-[11px] px-2.5 py-1 rounded-lg font-bold transition-all ${
                    previewLang === "en"
                      ? "bg-primary text-on-primary shadow-xs"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  English (LTR)
                </button>
              </div>
            </div>

            <div className="w-full">
              <CampaignBanner
                lang={previewLang}
                campaigns={config.campaigns}
                isPreview={true}
              />
            </div>
          </div>

          {/* Campaign List Editor */}
          <div className="flex flex-col gap-6">
            {Array.isArray(config.campaigns) && config.campaigns.map((camp: any, idx: number) => (
              <div
                key={camp.id || idx}
                className="p-5 bg-surface-container-low rounded-2xl border border-outline-variant/30 flex flex-col gap-4 relative shadow-xs"
              >
                {/* Item Top Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-outline-variant/20 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-lg bg-primary/10 border border-primary/30 text-primary font-mono font-bold text-xs">
                      #{idx + 1}
                    </span>
                    <span className="font-bold text-on-surface text-sm">
                      {camp.titleAr || camp.titleEn || `إعلان #${idx + 1}`}
                    </span>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant">
                      {camp.theme || "purple"}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Move Up */}
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => {
                        setConfig((prev: any) => {
                          const campaigns = [...prev.campaigns];
                          const temp = campaigns[idx];
                          campaigns[idx] = campaigns[idx - 1];
                          campaigns[idx - 1] = temp;
                          return { ...prev, campaigns };
                        });
                      }}
                      className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface disabled:opacity-30 transition-colors"
                      title="تحريك لأعلى"
                    >
                      <span className="material-symbols-outlined text-sm">arrow_upward</span>
                    </button>

                    {/* Move Down */}
                    <button
                      type="button"
                      disabled={idx === config.campaigns.length - 1}
                      onClick={() => {
                        setConfig((prev: any) => {
                          const campaigns = [...prev.campaigns];
                          const temp = campaigns[idx];
                          campaigns[idx] = campaigns[idx + 1];
                          campaigns[idx + 1] = temp;
                          return { ...prev, campaigns };
                        });
                      }}
                      className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface disabled:opacity-30 transition-colors"
                      title="تحريك لأسفل"
                    >
                      <span className="material-symbols-outlined text-sm">arrow_downward</span>
                    </button>

                    {/* Duplicate */}
                    <button
                      type="button"
                      onClick={() => {
                        setConfig((prev: any) => {
                          const campaigns = [...prev.campaigns];
                          const copy = { ...campaigns[idx], id: `camp_${Date.now()}` };
                          campaigns.splice(idx + 1, 0, copy);
                          return { ...prev, campaigns };
                        });
                      }}
                      className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-primary transition-colors"
                      title="نسخ البنر"
                    >
                      <span className="material-symbols-outlined text-sm">content_copy</span>
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => {
                        setConfig((prev: any) => {
                          const campaigns = [...prev.campaigns];
                          campaigns.splice(idx, 1);
                          return { ...prev, campaigns };
                        });
                      }}
                      className="p-1.5 rounded-lg text-error hover:bg-error/10 transition-colors"
                      title="حذف البنر"
                    >
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  </div>
                </div>

                {/* Theme Selector */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-on-surface-variant uppercase font-bold">
                    طابع وتدرج الألوان (Color Theme)
                  </label>
                  <div className="flex flex-wrap items-center gap-2">
                    {[
                      { key: "purple", label: "بنفسجي نيون (Purple)", dot: "bg-purple-500" },
                      { key: "cyan", label: "سيان سايبر (Cyan)", dot: "bg-cyan-400" },
                      { key: "blue", label: "أزرق ملكي (Royal Blue)", dot: "bg-blue-600" },
                      { key: "emerald", label: "زمردي سريع (Emerald)", dot: "bg-emerald-500" },
                      { key: "amber", label: "ذهبي برونزي (Amber)", dot: "bg-amber-500" }
                    ].map((t) => (
                      <button
                        key={t.key}
                        type="button"
                        onClick={() => {
                          setConfig((prev: any) => {
                            const campaigns = [...prev.campaigns];
                            campaigns[idx] = { ...campaigns[idx], theme: t.key };
                            return { ...prev, campaigns };
                          });
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                          (camp.theme || "purple") === t.key
                            ? "bg-primary text-on-primary border-primary shadow-xs"
                            : "bg-surface-container-lowest text-on-surface-variant border-outline-variant/30 hover:border-primary/50"
                        }`}
                      >
                        <span className={`w-2.5 h-2.5 rounded-full ${t.dot}`} />
                        <span>{t.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preset Images Quick Pick */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-on-surface-variant uppercase font-bold">
                    اختيار سريع لصورة ثلاثية الأبعاد جاهزة (Preset 3D Graphics)
                  </label>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {PRESET_CAMPAIGN_IMAGES.map((p, pIdx) => (
                      <button
                        key={pIdx}
                        type="button"
                        onClick={() => {
                          setConfig((prev: any) => {
                            const campaigns = [...prev.campaigns];
                            campaigns[idx] = { ...campaigns[idx], image: p.url };
                            return { ...prev, campaigns };
                          });
                        }}
                        className={`text-[11px] px-2.5 py-1 rounded-lg font-bold border transition-all flex items-center gap-1.5 ${
                          camp.image === p.url
                            ? "bg-primary/15 text-primary border-primary"
                            : "bg-surface-container-lowest text-on-surface-variant border-outline-variant/30 hover:text-on-surface hover:border-primary/40"
                        }`}
                      >
                        <img src={p.url} alt={p.label} className="w-4 h-4 object-contain" />
                        <span>{p.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Image Picker Input (Upload or Custom URL) */}
                <ImagePickerInput
                  label={`رابط صورة الإعلان رقم ${idx + 1}`}
                  value={camp.image || ""}
                  onChange={(newUrl) => {
                    setConfig((prev: any) => {
                      const campaigns = [...prev.campaigns];
                      campaigns[idx] = { ...campaigns[idx], image: newUrl };
                      return { ...prev, campaigns };
                    });
                  }}
                />

                {/* Main Titles & Tags Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {/* Title Ar */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-on-surface-variant uppercase font-bold">
                      العنوان الرئيسي (بالعربية)
                    </label>
                    <input
                      type="text"
                      value={camp.titleAr || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setConfig((prev: any) => {
                          const campaigns = [...prev.campaigns];
                          campaigns[idx] = { ...campaigns[idx], titleAr: val };
                          return { ...prev, campaigns };
                        });
                      }}
                      className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-2.5 text-xs text-on-surface"
                      placeholder="مثال: حذف حساب سامسونج FRP الفوري"
                    />
                  </div>

                  {/* Title En */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-on-surface-variant uppercase font-bold">
                      العنوان الرئيسي (بالإنجليزية)
                    </label>
                    <input
                      type="text"
                      value={camp.titleEn || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setConfig((prev: any) => {
                          const campaigns = [...prev.campaigns];
                          campaigns[idx] = { ...campaigns[idx], titleEn: val };
                          return { ...prev, campaigns };
                        });
                      }}
                      className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-2.5 text-xs text-on-surface"
                      placeholder="e.g. Samsung FRP Remove"
                    />
                  </div>

                  {/* Tag Ar */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-on-surface-variant uppercase font-bold">
                      شارة التمييز / التاج (بالعربية)
                    </label>
                    <input
                      type="text"
                      value={camp.tagAr || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setConfig((prev: any) => {
                          const campaigns = [...prev.campaigns];
                          campaigns[idx] = { ...campaigns[idx], tagAr: val };
                          return { ...prev, campaigns };
                        });
                      }}
                      className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-2 text-xs text-on-surface"
                      placeholder="مثال: عرض حصري لفترة محدودة"
                    />
                  </div>

                  {/* Tag En */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-on-surface-variant uppercase font-bold">
                      شارة التمييز / التاج (بالإنجليزية)
                    </label>
                    <input
                      type="text"
                      value={camp.tagEn || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setConfig((prev: any) => {
                          const campaigns = [...prev.campaigns];
                          campaigns[idx] = { ...campaigns[idx], tagEn: val };
                          return { ...prev, campaigns };
                        });
                      }}
                      className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-2 text-xs text-on-surface"
                      placeholder="e.g. Limited Time Offer"
                    />
                  </div>

                  {/* Description Ar */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-on-surface-variant uppercase font-bold">
                      الوصف المختصر (بالعربية)
                    </label>
                    <textarea
                      rows={2}
                      value={camp.descAr || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setConfig((prev: any) => {
                          const campaigns = [...prev.campaigns];
                          campaigns[idx] = { ...campaigns[idx], descAr: val };
                          return { ...prev, campaigns };
                        });
                      }}
                      className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-2 text-xs text-on-surface"
                      placeholder="فك فوري وتلقائي لجميع طرازات سامسونج عبر السيرفر الرسمي بأعلى سرعة وأمان."
                    />
                  </div>

                  {/* Description En */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-on-surface-variant uppercase font-bold">
                      الوصف المختصر (بالإنجليزية)
                    </label>
                    <textarea
                      rows={2}
                      value={camp.descEn || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setConfig((prev: any) => {
                          const campaigns = [...prev.campaigns];
                          campaigns[idx] = { ...campaigns[idx], descEn: val };
                          return { ...prev, campaigns };
                        });
                      }}
                      className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-2 text-xs text-on-surface"
                      placeholder="Instant removal for all Samsung models via direct official server API."
                    />
                  </div>

                  {/* Target URL */}
                  <div className="flex flex-col gap-1 md:col-span-2">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] text-primary uppercase font-bold">رابط التوجيه (URL)</label>
                      <div className="flex items-center gap-1 text-[10px]">
                        <span className="text-on-surface-variant">مقترحات:</span>
                        {[
                          { label: "Samsung", url: "/pricing?search=Samsung" },
                          { label: "Chimera", url: "/pricing?section=Chimera%20Tool" },
                          { label: "Borneo", url: "/pricing?search=Borneo" },
                          { label: "Pricing", url: "/pricing" }
                        ].map((link, lIdx) => (
                          <button
                            key={lIdx}
                            type="button"
                            onClick={() => {
                              setConfig((prev: any) => {
                                const campaigns = [...prev.campaigns];
                                campaigns[idx] = { ...campaigns[idx], url: link.url };
                                return { ...prev, campaigns };
                              });
                            }}
                            className="px-1.5 py-0.5 rounded-md bg-surface-container text-primary hover:bg-primary/10 font-mono"
                          >
                            {link.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <input
                      type="text"
                      value={camp.url || "/pricing"}
                      onChange={(e) => {
                        const val = e.target.value;
                        setConfig((prev: any) => {
                          const campaigns = [...prev.campaigns];
                          campaigns[idx] = { ...campaigns[idx], url: val };
                          return { ...prev, campaigns };
                        });
                      }}
                      className="bg-surface-container-lowest border border-primary/40 rounded-xl p-2 text-xs font-mono text-primary"
                    />
                  </div>
                </div>

                {/* Operational Badges & Metrics Row */}
                <div className="p-3 bg-surface-container rounded-xl border border-outline-variant/20 flex flex-col gap-2.5">
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase">
                    بيانات الأداء والضمان السريعة (Operational Performance Badges)
                  </span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {/* Speed / Turnaround */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] text-on-surface-variant">سرعة الإنجاز (عربي / إنجليزي)</label>
                      <div className="grid grid-cols-2 gap-1">
                        <input
                          type="text"
                          value={camp.turnaroundAr || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setConfig((prev: any) => {
                              const campaigns = [...prev.campaigns];
                              campaigns[idx] = { ...campaigns[idx], turnaroundAr: val };
                              return { ...prev, campaigns };
                            });
                          }}
                          placeholder="1 - 5 دقائق"
                          className="bg-surface-container-lowest border border-outline-variant/30 rounded-lg p-1.5 text-[11px]"
                        />
                        <input
                          type="text"
                          value={camp.turnaroundEn || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setConfig((prev: any) => {
                              const campaigns = [...prev.campaigns];
                              campaigns[idx] = { ...campaigns[idx], turnaroundEn: val };
                              return { ...prev, campaigns };
                            });
                          }}
                          placeholder="1 - 5 Mins"
                          className="bg-surface-container-lowest border border-outline-variant/30 rounded-lg p-1.5 text-[11px]"
                        />
                      </div>
                    </div>

                    {/* Guarantee */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] text-on-surface-variant">الضمان المالي (عربي / إنجليزي)</label>
                      <div className="grid grid-cols-2 gap-1">
                        <input
                          type="text"
                          value={camp.guaranteeAr || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setConfig((prev: any) => {
                              const campaigns = [...prev.campaigns];
                              campaigns[idx] = { ...campaigns[idx], guaranteeAr: val };
                              return { ...prev, campaigns };
                            });
                          }}
                          placeholder="ضمان مالي 100%"
                          className="bg-surface-container-lowest border border-outline-variant/30 rounded-lg p-1.5 text-[11px]"
                        />
                        <input
                          type="text"
                          value={camp.guaranteeEn || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setConfig((prev: any) => {
                              const campaigns = [...prev.campaigns];
                              campaigns[idx] = { ...campaigns[idx], guaranteeEn: val };
                              return { ...prev, campaigns };
                            });
                          }}
                          placeholder="100% REFUND"
                          className="bg-surface-container-lowest border border-outline-variant/30 rounded-lg p-1.5 text-[11px]"
                        />
                      </div>
                    </div>

                    {/* Gateway */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] text-on-surface-variant">نوع الربط (عربي / إنجليزي)</label>
                      <div className="grid grid-cols-2 gap-1">
                        <input
                          type="text"
                          value={camp.connectionAr || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setConfig((prev: any) => {
                              const campaigns = [...prev.campaigns];
                              campaigns[idx] = { ...campaigns[idx], connectionAr: val };
                              return { ...prev, campaigns };
                            });
                          }}
                          placeholder="ربط فوري API"
                          className="bg-surface-container-lowest border border-outline-variant/30 rounded-lg p-1.5 text-[11px]"
                        />
                        <input
                          type="text"
                          value={camp.connectionEn || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setConfig((prev: any) => {
                              const campaigns = [...prev.campaigns];
                              campaigns[idx] = { ...campaigns[idx], connectionEn: val };
                              return { ...prev, campaigns };
                            });
                          }}
                          placeholder="DIRECT API"
                          className="bg-surface-container-lowest border border-outline-variant/30 rounded-lg p-1.5 text-[11px]"
                        />
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            ))}
          </div>
        </div>
      )}


      {/* ============================================================= */}
      {/* SERVICE PICKER MODAL                                          */}
      {/* ============================================================= */}
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
                  اختر من بين مجموعات وخدمات الموقع المسجلة لديك ليتم تعبئة الاسم والسعر والرابط تلقائياً.
                </p>
              </div>
              <button
                type="button"
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
                  {siteItems
                    .filter((item) =>
                      !pickerSearch || item.name.toLowerCase().includes(pickerSearch.toLowerCase())
                    )
                    .map((item) => (
                      <div
                        key={item.name}
                        className="pt-2.5 first:pt-0 flex items-center justify-between gap-4 hover:bg-surface-container-high/40 p-3 rounded-2xl transition-colors"
                      >
                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-on-surface text-sm truncate">{item.name}</h4>
                          <div className="flex items-center gap-3 mt-1 text-xs text-on-surface-variant flex-wrap">
                            {item.categoryName && (
                              <span className="bg-surface-container-high px-2 py-0.5 rounded text-[11px] text-primary">
                                {item.categoryName}
                              </span>
                            )}
                            <span>{item.count} خدمات فرعية</span>
                            {item.minPrice > 0 && (
                              <span className="text-emerald-400 font-mono font-bold">
                                يبدأ من ${item.minPrice.toFixed(2)}
                              </span>
                            )}
                            {item.time && <span>التسليم: {item.time}</span>}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => selectServiceForPackage(item)}
                          className="btn-primary text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shrink-0 font-bold shadow-xs"
                        >
                          <span className="material-symbols-outlined text-sm">check</span>
                          تحديد هذه الباقة
                        </button>
                      </div>
                    ))}

                  {siteItems.filter((item) =>
                    !pickerSearch || item.name.toLowerCase().includes(pickerSearch.toLowerCase())
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
              <span>إجمالي المجموعات والخدمات المتاحة: {siteItems.length}</span>
              <button
                type="button"
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
