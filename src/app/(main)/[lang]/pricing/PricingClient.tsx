"use client";

import { useState, useEffect, useMemo, useRef, useDeferredValue } from "react";
import { categoryMatchesFilter, sortDisplayGroups } from "../../../../lib/pricing-groups";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

function getServicePriceInfo(service: any) {
  const credit = typeof service.credit === 'number' ? service.credit : parseFloat(service.credit) || 0;
  const margin = typeof service.margin === 'number' ? service.margin : parseFloat(service.margin) || 0;
  const finalPrice = service.finalPrice ?? service.price ?? (credit + margin);
  const priceNum = typeof finalPrice === 'number' ? finalPrice : parseFloat(finalPrice) || 0;
  
  const nameLower = (service.name || '').toLowerCase();
  const isFree = priceNum === 0 && (nameLower.includes('free') || service.name?.includes('مجاني') || service.name?.includes('مجانا'));
  const isZeroCost = priceNum === 0 && !isFree;

  return { priceNum, isFree, isZeroCost };
}

function RenderPriceBadge({ service, lang, discountPercent = 0 }: { service: any; lang: string; discountPercent?: number }) {
  const { priceNum, isFree, isZeroCost } = getServicePriceInfo(service);

  if (priceNum > 0) {
    if (discountPercent > 0) {
      const discountedPrice = Number((priceNum * (1 - discountPercent / 100)).toFixed(2));
      return (
        <div className="flex flex-col items-start sm:items-end">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-on-surface-variant line-through font-mono opacity-50">
              ${priceNum.toFixed(2)}
            </span>
            <span className="font-price-display text-emerald-400 glow-cyan font-bold text-base">
              ${discountedPrice.toFixed(2)}
            </span>
          </div>
          <span className="text-[10px] text-emerald-400 font-bold font-mono">
            {lang === 'ar' ? `-${discountPercent}% خصم VIP` : `-${discountPercent}% VIP`}
          </span>
        </div>
      );
    }

    return (
      <span className="font-price-display text-primary glow-cyan font-bold text-base mt-0.5">
        ${priceNum.toFixed(2)}
      </span>
    );
  }

  if (isFree) {
    return (
      <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold text-xs inline-flex items-center gap-1">
        <span>{lang === 'ar' ? 'مجاناً 🎁' : 'Free 🎁'}</span>
      </span>
    );
  }

  return (
    <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 font-bold text-xs inline-flex items-center gap-1">
      <span>{lang === 'ar' ? 'سعر خاص 💬' : 'On Request 💬'}</span>
    </span>
  );
}

function ServicesListRenderer({ servicesList, lang, dict, discountPercent = 0 }: { servicesList: any[], lang: string, dict: any, discountPercent?: number }) {
  const [limit, setLimit] = useState(40);
  const displayedServices = servicesList.length > 50 ? servicesList.slice(0, limit) : servicesList;
  const hasMore = servicesList.length > displayedServices.length;

  return (
    <div className="w-full">
      {/* Mobile View: Clean stacked cards with ZERO horizontal scrolling */}
      <div className="divide-y divide-outline-variant/20 sm:hidden">
        {displayedServices.map((service: any) => (
          <div key={service.id} className="p-4 flex flex-col gap-3 hover:bg-surface-container-high/40 transition-colors">
            <div className="font-semibold text-on-surface text-sm sm:text-base leading-snug">
              {service.name}
            </div>
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-outline-variant/10">
              <div className="flex flex-col">
                <span className="text-[11px] text-on-surface-variant flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs text-primary">schedule</span>
                  {service.time || "1-24 Hours"}
                </span>
                <RenderPriceBadge service={service} lang={lang} discountPercent={discountPercent} />
              </div>
              <Link 
                href={`/${lang}/purchase?serviceId=${service.id}`}
                className="btn-primary py-2 px-4 text-xs rounded-xl inline-flex items-center gap-1 shadow-md hover:scale-105 transition-transform"
              >
                {dict.pricing?.order || "اطلب"}
                <span className="material-symbols-outlined text-sm">shopping_cart</span>
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop / Tablet View: Wide Table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container/40 border-b border-outline-variant/40">
              <th className={`py-4 px-6 font-label-sm text-xs text-on-surface-variant uppercase tracking-wider ${lang === 'ar' ? 'text-right' : 'text-left'}`}>{dict.pricing?.serviceName || "اسم الخدمة"}</th>
              <th className={`py-4 px-6 font-label-sm text-xs text-on-surface-variant uppercase tracking-wider ${lang === 'ar' ? 'text-right' : 'text-left'}`}>{dict.pricing?.deliveryTime || "وقت التسليم"}</th>
              <th className={`py-4 px-6 font-label-sm text-xs text-on-surface-variant uppercase tracking-wider ${lang === 'ar' ? 'text-left' : 'text-right'}`}>{dict.pricing?.price || "السعر"}</th>
              <th className="py-4 px-6 font-label-sm text-xs text-on-surface-variant uppercase tracking-wider text-center">{dict.pricing?.action || "إجراء"}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/20">
            {displayedServices.map((service: any) => (
              <tr key={service.id} className="hover:bg-surface-container-high/40 transition-colors group">
                <td className="py-4 px-6">
                  <span className="text-on-surface font-semibold flex items-center gap-2 text-base">
                    {service.name}
                  </span>
                </td>
                <td className="py-4 px-6 text-on-surface-variant text-sm whitespace-nowrap">{service.time || "1-24 Hours"}</td>
                <td className={`py-4 px-6 ${lang === 'ar' ? 'text-left' : 'text-right'}`}>
                  <RenderPriceBadge service={service} lang={lang} discountPercent={discountPercent} />
                </td>
                <td className="py-4 px-6 text-center">
                  <Link 
                    href={`/${lang}/purchase?serviceId=${service.id}`} 
                    className="btn-primary py-2 px-5 text-sm rounded-xl inline-flex items-center gap-1 shadow-md hover:scale-105 transition-transform"
                  >
                    {dict.pricing?.order || "اطلب"}
                    <span className="material-symbols-outlined text-base">shopping_cart</span>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Show more inside huge group if needed */}
      {hasMore && (
        <div className="p-4 bg-surface-container/30 border-t border-outline-variant/20 flex justify-center">
          <button
            onClick={() => setLimit(prev => prev + 50)}
            className="bg-surface-container-high hover:bg-surface-container-highest text-primary border border-primary/30 px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <span>{lang === 'ar' ? `عرض بقية الخدمات في هذا القسم (+${servicesList.length - displayedServices.length})` : `Show remaining services in this group (+${servicesList.length - displayedServices.length})`}</span>
            <span className="material-symbols-outlined text-sm">expand_more</span>
          </button>
        </div>
      )}
    </div>
  );
}

interface DisplayGroup {
  categoryName: string;
  groupName: string;
  services: any[];
}

export default function PricingClient({ lang, dict }: { lang: string, dict: any }) {
  const [services, setServices] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userSession, setUserSession] = useState<any>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearch = useDeferredValue(searchQuery);
  const [selectedCategory, setSelectedCategory] = useState("all");
  
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const [copiedGroup, setCopiedGroup] = useState<string | null>(null);

  // Lazy / Infinite scroll state for groups:
  const [visibleGroupCount, setVisibleGroupCount] = useState(15);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Load user session from local storage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("user_session");
      if (saved) {
        setUserSession(JSON.parse(saved));
      }
    } catch {}
  }, []);

  const discountPercent = useMemo(() => {
    if (!userSession) return 0;
    return Math.max(
      userSession.effectiveDiscount || 0,
      userSession.membershipTier?.discountPercentage || 0,
      userSession.customDiscount || 0
    );
  }, [userSession]);

  // Read initial ?section= / ?group= / ?search= from URL
  useEffect(() => {
    const sectionParam = searchParams.get("section") || searchParams.get("group") || searchParams.get("cat") || searchParams.get("search");
    if (sectionParam) {
      setActiveSection(sectionParam);
    } else {
      setActiveSection(null);
    }
  }, [searchParams]);

  useEffect(() => {
    async function fetchServices() {
      try {
        const res = await fetch("/api/dhru/services?view=pricing");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setServices(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchServices();
  }, []);

  // Reset visibleGroupCount whenever filters change
  useEffect(() => {
    setVisibleGroupCount(15);
  }, [deferredSearch, selectedCategory]);

  const openSingleSection = (groupName: string) => {
    setActiveSection(groupName);
    const newUrl = `${pathname}?section=${encodeURIComponent(groupName)}`;
    window.history.pushState({}, "", newUrl);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const closeSingleSection = () => {
    setActiveSection(null);
    window.history.pushState({}, "", pathname);
  };

  const toggleGroupCollapse = (groupName: string) => {
    setCollapsedGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };

  const copyGroupLink = (e: React.MouseEvent, groupName: string) => {
    e.stopPropagation();
    const fullUrl = `${window.location.origin}${pathname}?section=${encodeURIComponent(groupName)}`;
    
    navigator.clipboard.writeText(fullUrl);
    setCopiedGroup(groupName);
    setTimeout(() => setCopiedGroup(null), 3000);
  };

  const toggleAllGroups = (collapse: boolean) => {
    if (!services) return;
    const newMap: Record<string, boolean> = {};
    services.forEach((cat: any) => {
      cat.services?.forEach((s: any) => {
        if (s.groupName) {
          newMap[s.groupName] = collapse;
        }
      });
    });
    setCollapsedGroups(newMap);
  };

  // Helper to group services by groupName
  const getGroupedServices = (servicesList: any[]) => {
    const groups: Record<string, any[]> = {};
    const q = deferredSearch.trim().toLowerCase();
    
    (servicesList || []).filter((s: any) => s.isActive).forEach((service: any) => {
      const matchQuery = 
        !q ||
        service.name?.toLowerCase().includes(q) || 
        (service.dhruId && String(service.dhruId).includes(q)) ||
        (service.groupName && service.groupName.toLowerCase().includes(q));

      if (matchQuery) {
        const group = service.groupName || (lang === 'ar' ? "خدمات عامة" : "General Services");
        if (!groups[group]) groups[group] = [];
        groups[group].push(service);
      }
    });
    return groups;
  };

  // Filter categories
  const filteredCategories = useMemo(() => {
    let cats = Array.isArray(services) ? services : [];
    cats = cats.filter((c: any) => categoryMatchesFilter(c.name, selectedCategory));
    return cats;
  }, [services, selectedCategory]);

  // Flatten all groups matching search for virtual lazy scroll
  const allDisplayGroups = useMemo(() => {
    const list: DisplayGroup[] = [];
    filteredCategories.forEach((cat: any) => {
      const grouped = getGroupedServices(cat.services);
      const groupNames = Object.keys(grouped);
      groupNames.forEach(groupName => {
        list.push({
          categoryName: cat.name,
          groupName,
          services: grouped[groupName]
        });
      });
    });
    return sortDisplayGroups(list) as DisplayGroup[];
  }, [filteredCategories, deferredSearch, lang]);

  // Total matching services count
  const totalMatchingServices = useMemo(() => {
    return allDisplayGroups.reduce((sum, g) => sum + g.services.length, 0);
  }, [allDisplayGroups]);

  // Sliced groups to render in DOM
  const visibleGroups = useMemo(() => {
    return allDisplayGroups.slice(0, visibleGroupCount);
  }, [allDisplayGroups, visibleGroupCount]);

  // Group visible items by category for rendering headers
  const visibleCategorySections = useMemo(() => {
    const map = new Map<string, { categoryName: string; groups: DisplayGroup[] }>();
    visibleGroups.forEach(item => {
      if (!map.has(item.categoryName)) {
        map.set(item.categoryName, {
          categoryName: item.categoryName,
          groups: []
        });
      }
      map.get(item.categoryName)!.groups.push(item);
    });
    return Array.from(map.values());
  }, [visibleGroups]);

  // Infinite Scroll Trigger with IntersectionObserver
  useEffect(() => {
    if (!sentinelRef.current) return;
    if (visibleGroupCount >= allDisplayGroups.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleGroupCount(prev => Math.min(prev + 15, allDisplayGroups.length));
        }
      },
      { rootMargin: "400px" } // Preload 400px ahead so scrolling is instantaneous
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [visibleGroupCount, allDisplayGroups.length]);

  // Standalone Single Section Data with Smart Resilient Match
  const singleSectionData = useMemo(() => {
    if (!activeSection || !services || !Array.isArray(services)) return null;
    const target = activeSection.trim().toLowerCase();

    // 1. Direct or Case-Insensitive Exact Group Match
    for (const cat of services) {
      if (!cat.services) continue;
      const allActive = cat.services.filter((s: any) => s.isActive);
      const exactServices = allActive.filter((s: any) => {
        const gn = (s.groupName || "").trim().toLowerCase();
        return gn === target;
      });
      if (exactServices.length > 0) {
        return {
          groupName: exactServices[0].groupName,
          categoryName: cat.name,
          servicesList: exactServices
        };
      }
    }

    // 2. Partial Group Name Match (e.g., "Xiaomi Remove Mi Account" within "Xiaomi Remove Mi Account [Instant]")
    for (const cat of services) {
      if (!cat.services) continue;
      const allActive = cat.services.filter((s: any) => s.isActive);
      const partialServices = allActive.filter((s: any) => {
        const gn = (s.groupName || "").toLowerCase();
        return gn.includes(target) || target.includes(gn);
      });
      if (partialServices.length > 0) {
        return {
          groupName: partialServices[0].groupName || activeSection,
          categoryName: cat.name,
          servicesList: partialServices
        };
      }
    }

    // 3. Category Name Match (e.g., "IMEI Services" or "server")
    for (const cat of services) {
      if (!cat.services) continue;
      const catName = (cat.name || "").toLowerCase();
      if (catName.includes(target) || target.includes(catName)) {
        const allActive = cat.services.filter((s: any) => s.isActive);
        if (allActive.length > 0) {
          return {
            groupName: cat.name,
            categoryName: cat.name,
            servicesList: allActive
          };
        }
      }
    }

    // 4. Keyword / Service Name Search Match across all categories
    const matchingServices: any[] = [];
    let matchedCatName = "";
    for (const cat of services) {
      if (!cat.services) continue;
      cat.services.filter((s: any) => s.isActive).forEach((s: any) => {
        const nameMatch = s.name?.toLowerCase().includes(target);
        const groupMatch = s.groupName?.toLowerCase().includes(target);
        const idMatch = s.dhruId && String(s.dhruId) === target;
        if (nameMatch || groupMatch || idMatch) {
          matchingServices.push(s);
          if (!matchedCatName) matchedCatName = cat.name;
        }
      });
    }

    if (matchingServices.length > 0) {
      return {
        groupName: activeSection,
        categoryName: matchedCatName || (lang === "ar" ? "خدمات مطابقة" : "Matching Services"),
        servicesList: matchingServices
      };
    }

    // Fallback: If section specified but no matching services found, show empty container with clear message
    return {
      groupName: activeSection,
      categoryName: lang === "ar" ? "خدمات" : "Services",
      servicesList: []
    };
  }, [activeSection, services, lang]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 gap-4 text-primary">
        <span className="material-symbols-outlined animate-spin text-5xl">refresh</span>
        <p className="text-sm font-semibold text-on-surface-variant">
          {lang === 'ar' ? 'جاري تحميل وتجهيز قائمة الخدمات والأسعار...' : 'Loading services & pricing...'}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-error/10 text-error rounded-xl border border-error/20 flex items-center gap-2 font-medium">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-8 relative" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* Copied Toast Notification */}
      {copiedGroup && (
        <div className="fixed bottom-6 left-6 z-50 bg-primary text-surface font-bold px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3">
          <span className="material-symbols-outlined text-2xl">check_circle</span>
          <span>{lang === 'ar' ? `تم نسخ رابط صفحة قسم "${copiedGroup}" بنجاح!` : `Copied standalone link for "${copiedGroup}"!`}</span>
        </div>
      )}

      {/* --- STANDALONE SINGLE SECTION VIEW MODE --- */}
      {activeSection && singleSectionData ? (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          
          {/* Breadcrumb & Navigation Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface-container/60 p-5 sm:p-6 rounded-3xl border border-outline-variant/30 backdrop-blur-md">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider mb-2">
                <button onClick={closeSingleSection} className="hover:underline flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  {lang === 'ar' ? 'جميع الأقسام' : 'All Sections'}
                </button>
                <span>/</span>
                <span className="text-on-surface-variant">{singleSectionData.categoryName}</span>
              </div>
              <h1 className="text-xl sm:text-4xl font-bold text-on-surface flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-2xl sm:text-4xl">folder</span>
                {singleSectionData.groupName}
              </h1>
              <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
                {lang === 'ar' 
                  ? `عرض مستقل لخدمات قسم ${singleSectionData.groupName} (${singleSectionData.servicesList.length} خدمات مجهزة)`
                  : `Standalone view for ${singleSectionData.groupName} (${singleSectionData.servicesList.length} services)`}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={(e) => copyGroupLink(e, singleSectionData!.groupName)}
                className="bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-base sm:text-lg">share</span>
                {lang === 'ar' ? 'مشاركة رابط هذا القسم' : 'Share Section Link'}
              </button>

              <button
                onClick={closeSingleSection}
                className="btn-secondary py-2.5 px-4 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-base sm:text-lg">apps</span>
                {lang === 'ar' ? 'العودة لجميع الأقسام' : 'Back to All'}
              </button>
            </div>
          </div>

          {/* Standalone Section Card */}
          <div className="glass-card rounded-3xl overflow-hidden shadow-2xl border border-primary/40">
            <div className="bg-surface-container/90 px-5 sm:px-6 py-4 sm:py-5 border-b border-outline-variant/40 flex items-center justify-between">
              <h3 className="text-lg sm:text-xl font-bold text-on-surface flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">folder_open</span>
                {singleSectionData.groupName}
              </h3>
              <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/30">
                {singleSectionData.servicesList.length} {lang === 'ar' ? 'خدمات' : 'services'}
              </span>
            </div>

            {/* Render Services */}
            {singleSectionData.servicesList.length === 0 ? (
              <div className="p-10 text-center flex flex-col items-center gap-3 text-on-surface-variant">
                <span className="material-symbols-outlined text-5xl text-primary/40">search_off</span>
                <p className="font-bold text-base text-on-surface">
                  {lang === 'ar' ? `لم يتم العثور على خدمات نشطة مطابقة لقسم "${singleSectionData.groupName}" حالياً` : `No active services found in section "${singleSectionData.groupName}" currently`}
                </p>
                <p className="text-xs text-on-surface-variant max-w-md">
                  {lang === 'ar' ? 'قد يكون تم تحديث اسم القسم أو نقل الخدمات. يمكنك استعراض كافة الأقسام المتاحة أو استخدام البحث.' : 'The section may have been renamed or moved. You can browse all sections or use the search bar.'}
                </p>
                <button onClick={closeSingleSection} className="btn-primary mt-3 py-2.5 px-6 text-xs sm:text-sm rounded-xl font-bold">
                  {lang === 'ar' ? 'استعراض كافة الأقسام والخدمات' : 'Browse All Services'}
                </button>
              </div>
            ) : (
              <ServicesListRenderer servicesList={singleSectionData.servicesList} lang={lang} dict={dict} discountPercent={discountPercent} />
            )}
          </div>
        </div>
      ) : (
        /* --- ALL CATEGORIES LIST VIEW MODE --- */
        <>
          {/* VIP Membership Active Banner */}
          {discountPercent > 0 && (
            <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-emerald-500/15 via-primary/20 to-emerald-500/15 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl backdrop-blur-md animate-in fade-in duration-300">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shrink-0 shadow-md">
                  <span className="material-symbols-outlined text-2xl">workspace_premium</span>
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-on-surface flex items-center gap-2">
                    <span>{lang === 'ar' ? `مرحباً بك! لديك "${userSession?.membershipTier?.nameAr || userSession?.membershipTier?.name || 'عضوية VIP'}"` : `Welcome! You have "${userSession?.membershipTier?.name || 'VIP Membership'}"`}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                      VIP
                    </span>
                  </h3>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    {lang === 'ar' 
                      ? `تم تفعيل خصم ${discountPercent}% تلقائياً على كافة أسعار الخدمات المعروضة أدناه.` 
                      : `A ${discountPercent}% discount is automatically applied to all service prices below.`}
                  </p>
                </div>
              </div>

              <div className="px-4 py-2 rounded-2xl bg-surface-container-high/80 border border-emerald-500/30 flex items-center gap-2">
                <span className="text-xs text-on-surface-variant font-medium">{lang === 'ar' ? 'نسبة الخصم:' : 'Active Discount:'}</span>
                <span className="text-base font-extrabold text-emerald-400 font-mono">
                  🔥 -{discountPercent}%
                </span>
              </div>
            </div>
          )}

          {/* Filters and Controls Header */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="flex flex-col md:flex-row gap-4 flex-1">
              <div className="relative flex-grow">
                <span className={`absolute ${lang === 'ar' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant`}>search</span>
                <input 
                  type="text" 
                  placeholder={dict.pricing?.search || "ابحث عن خدمة أو موديل أو قسم..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full bg-surface-container border border-outline-variant/30 rounded-xl py-3 ${lang === 'ar' ? 'pr-10 pl-4' : 'pl-10 pr-4'} text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all`}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className={`absolute ${lang === 'ar' ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface`}
                  >
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                )}
              </div>

              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-surface-container border border-outline-variant/30 rounded-xl py-3 px-4 text-on-surface focus:outline-none focus:border-primary min-w-[200px] appearance-none"
              >
                <option value="all">{lang === 'ar' ? 'جميع الأقسام' : 'All Categories'}</option>
                <option value="imei">{lang === 'ar' ? 'خدمات IMEI' : 'IMEI Services'}</option>
                <option value="server">{lang === 'ar' ? 'خدمات السيرفر' : 'Server Credits'}</option>
                <option value="remote">{lang === 'ar' ? 'خدمات التحكم عن بعد' : 'Remote Unlocks'}</option>
              </select>
            </div>

            {/* Global Expand / Collapse Buttons */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => toggleAllGroups(false)}
                className="bg-surface-container border border-outline-variant/30 hover:border-primary/50 text-xs px-3 py-2.5 rounded-xl font-medium text-on-surface-variant hover:text-primary transition-all flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-base">unfold_more</span>
                {lang === 'ar' ? 'توسيع الكل' : 'Expand All'}
              </button>
              <button
                onClick={() => toggleAllGroups(true)}
                className="bg-surface-container border border-outline-variant/30 hover:border-outline text-xs px-3 py-2.5 rounded-xl font-medium text-on-surface-variant hover:text-on-surface transition-all flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-base">unfold_less</span>
                {lang === 'ar' ? 'طي الكل' : 'Collapse All'}
              </button>
            </div>
          </div>

          {/* Quick Stat Bar */}
          <div className="flex items-center justify-between text-xs text-on-surface-variant px-1">
            <span>
              {lang === 'ar'
                ? `عرض ${visibleGroups.length} من ${allDisplayGroups.length} قسم (${totalMatchingServices} خدمة متاحة)`
                : `Showing ${visibleGroups.length} of ${allDisplayGroups.length} sections (${totalMatchingServices} services)`}
            </span>
            {visibleGroups.length < allDisplayGroups.length && (
              <span className="text-primary font-mono text-[11px]">
                {lang === 'ar' ? "يتم تحميل المزيد تلقائياً عند التمرير ↓" : "Auto-loading on scroll ↓"}
              </span>
            )}
          </div>

          {allDisplayGroups.length === 0 ? (
            <div className="p-12 text-center bg-surface-container/30 rounded-3xl border border-outline-variant/20 text-on-surface-variant flex flex-col items-center gap-3">
              <span className="material-symbols-outlined text-4xl text-primary/60">search_off</span>
              <p className="font-semibold text-base">
                {lang === 'ar' ? 'لم يتم العثور على أي خدمات تطابق بحثك.' : 'No services matched your search criteria.'}
              </p>
              <button 
                onClick={() => { setSearchQuery(""); setSelectedCategory("all"); }}
                className="btn-secondary py-2 px-4 text-xs rounded-xl mt-2"
              >
                {lang === 'ar' ? 'إعادة ضبط البحث' : 'Reset Search'}
              </button>
            </div>
          ) : (
            visibleCategorySections.map((categorySection, catIdx) => {
              const iconName = categorySection.categoryName.toLowerCase().includes('imei') 
                ? 'phone_iphone' 
                : categorySection.categoryName.toLowerCase().includes('server') 
                  ? 'dns' 
                  : 'remote_access';

              return (
                <div key={catIdx} className="space-y-6 animate-in fade-in duration-300">
                  <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2 border-b border-outline-variant/20 pb-3">
                    <span className="material-symbols-outlined">{iconName}</span>
                    {categorySection.categoryName}
                  </h2>

                  {categorySection.groups.map((groupItem, idx) => {
                    const groupName = groupItem.groupName;
                    const groupServicesList = groupItem.services;
                    const isCollapsed = !!collapsedGroups[groupName];

                    return (
                      <div 
                        key={idx} 
                        className="glass-card rounded-2xl overflow-hidden shadow-xl border border-outline-variant/30 hover:border-primary/50 transition-all duration-300 group/card"
                      >
                        {/* Category Section Header */}
                        <div 
                          onClick={() => openSingleSection(groupName)}
                          className="bg-surface-container/80 hover:bg-surface-container-high/80 px-5 sm:px-6 py-4 border-b border-outline-variant/40 flex items-center justify-between cursor-pointer select-none transition-colors group/head"
                          title={lang === 'ar' ? 'انقر لفتح هذا القسم في صفحة مستقلة' : 'Click to open in standalone page'}
                        >
                          <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-primary text-2xl group-hover/head:scale-110 transition-transform">folder</span>
                            <div>
                              <h3 className="text-lg sm:text-xl font-bold text-on-surface group-hover/head:text-primary transition-colors flex items-center gap-2">
                                {groupName}
                                <span className="text-xs font-normal text-on-surface-variant bg-surface-container-highest px-2.5 py-0.5 rounded-full border border-outline-variant/20">
                                  {groupServicesList.length} {lang === 'ar' ? 'خدمات' : 'services'}
                                </span>
                              </h3>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Open in Standalone Page Link */}
                            <button
                              onClick={(e) => { e.stopPropagation(); openSingleSection(groupName); }}
                              title={lang === 'ar' ? 'فتح في صفحة مستقلة' : 'Open in standalone page'}
                              className="bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 p-2 rounded-xl transition-all flex items-center gap-1.5 text-xs font-bold"
                            >
                              <span className="material-symbols-outlined text-base">open_in_new</span>
                              <span className="hidden sm:inline">{lang === 'ar' ? 'صفحة مستقلة' : 'Open Page'}</span>
                            </button>

                            {/* Copy Section Link Button */}
                            <button
                              onClick={(e) => copyGroupLink(e, groupName)}
                              title={lang === 'ar' ? 'نسخ رابط هذا القسم' : 'Copy section link'}
                              className="bg-surface-container border border-outline-variant/40 hover:border-primary text-on-surface-variant hover:text-primary p-2 rounded-xl transition-all flex items-center gap-1 text-xs font-medium"
                            >
                              <span className="material-symbols-outlined text-base">link</span>
                              <span className="hidden sm:inline">{lang === 'ar' ? 'نسخ الرابط' : 'Copy Link'}</span>
                            </button>

                            {/* Expand / Collapse Icon */}
                            <button
                              onClick={(e) => { e.stopPropagation(); toggleGroupCollapse(groupName); }}
                              className="w-8 h-8 rounded-lg bg-surface-container border border-outline-variant/30 flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors"
                            >
                              <span className="material-symbols-outlined text-xl transition-transform duration-300" style={{ transform: isCollapsed ? 'rotate(0deg)' : 'rotate(180deg)' }}>
                                expand_more
                              </span>
                            </button>
                          </div>
                        </div>

                        {/* Services Body */}
                        {!isCollapsed && (
                          <div className="animate-in fade-in duration-300">
                            <ServicesListRenderer servicesList={groupServicesList} lang={lang} dict={dict} discountPercent={discountPercent} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })
          )}

          {/* Infinite Scroll Sentinel & Loader */}
          {visibleGroups.length < allDisplayGroups.length && (
            <div ref={sentinelRef} className="py-8 flex flex-col items-center justify-center gap-2 text-on-surface-variant">
              <span className="material-symbols-outlined animate-spin text-3xl text-primary">sync</span>
              <span className="text-xs font-semibold">
                {lang === 'ar' ? 'جاري تحميل المزيد من الأقسام والخدمات...' : 'Loading more services on scroll...'}
              </span>
              <button
                onClick={() => setVisibleGroupCount(allDisplayGroups.length)}
                className="mt-2 text-xs text-primary underline hover:text-primary/80 font-medium"
              >
                {lang === 'ar' ? 'عرض كافة الأقسام دفعة واحدة' : 'Load all sections at once'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
