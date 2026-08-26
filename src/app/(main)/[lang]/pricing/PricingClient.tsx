"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

function ServicesListRenderer({ servicesList, lang, dict }: { servicesList: any[], lang: string, dict: any }) {
  return (
    <div className="w-full">
      {/* Mobile View: Clean stacked cards with ZERO horizontal scrolling */}
      <div className="divide-y divide-outline-variant/20 sm:hidden">
        {servicesList.map((service: any) => (
          <div key={service.id} className="p-4 flex flex-col gap-3 hover:bg-surface-container-high/40 transition-colors">
            <div className="font-semibold text-on-surface text-sm sm:text-base leading-snug">
              {service.name}
            </div>
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-outline-variant/10">
              <div className="flex flex-col">
                <span className="text-[11px] text-on-surface-variant flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs text-primary">schedule</span>
                  {service.time}
                </span>
                <span className="font-price-display text-primary glow-cyan font-bold text-base mt-0.5">
                  ${(service.credit + service.margin).toFixed(2)}
                </span>
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
            {servicesList.map((service: any) => (
              <tr key={service.id} className="hover:bg-surface-container-high/40 transition-colors group">
                <td className="py-4 px-6">
                  <span className="text-on-surface font-semibold flex items-center gap-2 text-base">
                    {service.name}
                  </span>
                </td>
                <td className="py-4 px-6 text-on-surface-variant text-sm whitespace-nowrap">{service.time}</td>
                <td className={`py-4 px-6 font-price-display text-primary glow-cyan font-bold text-base ${lang === 'ar' ? 'text-left' : 'text-right'}`}>
                  ${(service.credit + service.margin).toFixed(2)}
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
    </div>
  );
}

export default function PricingClient({ lang, dict }: { lang: string, dict: any }) {
  const [services, setServices] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const [copiedGroup, setCopiedGroup] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Read initial ?section= from URL
  useEffect(() => {
    const sectionParam = searchParams.get("section") || searchParams.get("group");
    if (sectionParam) {
      setActiveSection(sectionParam);
    }
  }, [searchParams]);

  useEffect(() => {
    async function fetchServices() {
      try {
        const res = await fetch("/api/dhru/services");
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

  if (loading) {
    return (
      <div className="flex justify-center p-12 text-primary">
        <span className="material-symbols-outlined animate-spin text-4xl">refresh</span>
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

  // Filter and group services
  let categories = Array.isArray(services) ? services : [];

  if (selectedCategory !== "all") {
    categories = categories.filter(c => c.name.toLowerCase().includes(selectedCategory));
  }

  // Helper to group services by groupName
  const getGroupedServices = (servicesList: any[]) => {
    const groups: Record<string, any[]> = {};
    servicesList.filter(s => s.isActive).forEach(service => {
      const matchQuery = 
        service.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (service.dhruId && String(service.dhruId).includes(searchQuery)) ||
        (service.groupName && service.groupName.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!searchQuery || matchQuery) {
        if (!groups[service.groupName]) groups[service.groupName] = [];
        groups[service.groupName].push(service);
      }
    });
    return groups;
  };

  // Find single active section services if activeSection is set
  let singleSectionData: { groupName: string; categoryName: string; servicesList: any[] } | null = null;
  if (activeSection && services) {
    for (const cat of services) {
      const grouped = getGroupedServices(cat.services);
      if (grouped[activeSection]) {
        singleSectionData = {
          groupName: activeSection,
          categoryName: cat.name,
          servicesList: grouped[activeSection]
        };
        break;
      }
    }
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

            {/* Render Services (Responsive: Mobile Cards + Desktop Table) */}
            <ServicesListRenderer servicesList={singleSectionData.servicesList} lang={lang} dict={dict} />
          </div>
        </div>
      ) : (
        /* --- ALL CATEGORIES LIST VIEW MODE --- */
        <>
          {/* Filters and Controls Header */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="flex flex-col md:flex-row gap-4 flex-1">
              <div className="relative flex-grow">
                <span className={`absolute ${lang === 'ar' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant`}>search</span>
                <input 
                  type="text" 
                  placeholder={dict.pricing?.search || "Search..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full bg-surface-container border border-outline-variant/30 rounded-xl py-3 ${lang === 'ar' ? 'pr-10 pl-4' : 'pl-10 pr-4'} text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all`}
                />
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

          {categories.map((category: any, catIdx: number) => {
            const groupedServices = getGroupedServices(category.services);
            const groupNames = Object.keys(groupedServices);
            
            if (groupNames.length === 0) return null;

            return (
              <div key={catIdx} className="space-y-6">
                <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2 border-b border-outline-variant/20 pb-3">
                  <span className="material-symbols-outlined">
                    {category.name.includes('IMEI') ? 'phone_iphone' : category.name.includes('Server') ? 'dns' : 'remote_access'}
                  </span>
                  {category.name}
                </h2>
                
                {groupNames.map((groupName, idx) => {
                  const groupServicesList = groupedServices[groupName];
                  const isCollapsed = !!collapsedGroups[groupName];

                  return (
                    <div 
                      key={idx} 
                      className="glass-card rounded-2xl overflow-hidden shadow-xl border border-outline-variant/30 hover:border-primary/50 transition-all duration-300 group/card"
                    >
                      {/* Category Section Header - Click header to open in standalone page */}
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

                      {/* Services Body (Responsive: Cards on Mobile + Table on Desktop) */}
                      {!isCollapsed && (
                        <div className="animate-in fade-in duration-300">
                          <ServicesListRenderer servicesList={groupServicesList} lang={lang} dict={dict} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}
